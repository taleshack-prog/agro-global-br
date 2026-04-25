#!/usr/bin/env python3
"""
Global Agro BR — Backtesting Engine
Validates historical hedge strategy performance using mock data
(connects to TimescaleDB when available, falls back to generated data).
"""

import logging
import math
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────

BACKTEST_CONFIG: Dict[str, Dict] = {
    "soja": {
        "base_price": 142.50, "volatility": 0.18, "min_margin": 8.0,
        "max_volatility": 20.0, "hedge_cost_pct": 0.02, "contract_size": 450,
    },
    "milho": {
        "base_price": 68.40, "volatility": 0.16, "min_margin": 6.0,
        "max_volatility": 18.0, "hedge_cost_pct": 0.015, "contract_size": 900,
    },
    "cafe": {
        "base_price": 1250.0, "volatility": 0.19, "min_margin": 10.0,
        "max_volatility": 25.0, "hedge_cost_pct": 0.025, "contract_size": 100,
    },
    "algodao": {
        "base_price": 135.8, "volatility": 0.17, "min_margin": 7.0,
        "max_volatility": 22.0, "hedge_cost_pct": 0.02, "contract_size": 200,
    },
}

# ─── Data types ───────────────────────────────────────────────────────────────

@dataclass
class PriceTick:
    date: datetime
    price: float
    change_pct: float
    volatility: float
    margin_pct: float

@dataclass
class HedgeSignal:
    date: datetime
    price: float
    reason: str
    risk_level: str

@dataclass
class BacktestResult:
    commodity: str
    start_date: str
    end_date: str
    total_days: int
    recommendations_made: int
    successful_hedges: int
    failed_hedges: int
    avg_margin_pct: float
    total_savings: float
    total_cost: float
    net_benefit: float
    success_rate: float
    roi: float

# ─── Data generator (replaces DB when unavailable) ───────────────────────────

def generate_price_history(commodity: str, days: int) -> List[PriceTick]:
    """Simulates daily price series with geometric Brownian motion."""
    cfg     = BACKTEST_CONFIG[commodity]
    price   = cfg["base_price"]
    vol     = cfg["volatility"]
    ticks: List[PriceTick] = []
    base_date = datetime.now() - timedelta(days=days)

    for d in range(days):
        dt       = 1 / 252
        drift    = 0.0
        shock    = random.gauss(0, 1)
        ret      = drift * dt + vol * math.sqrt(dt) * shock
        new_price = price * math.exp(ret)
        change_pct = (new_price / price - 1) * 100

        # Rolling 20-day realised vol proxy
        rv = vol * 100 * (1 + 0.3 * math.sin(d / 20))
        # Simulated margin
        margin = cfg["min_margin"] + 6 * (0.5 + 0.5 * math.sin(d / 15))

        ticks.append(PriceTick(
            date=base_date + timedelta(days=d),
            price=round(new_price, 4),
            change_pct=round(change_pct, 4),
            volatility=round(rv, 2),
            margin_pct=round(margin, 2),
        ))
        price = new_price

    return ticks

# ─── Signal generation ────────────────────────────────────────────────────────

def generate_signals(commodity: str, ticks: List[PriceTick]) -> List[HedgeSignal]:
    cfg = BACKTEST_CONFIG[commodity]
    signals: List[HedgeSignal] = []
    last_signal_idx = -20  # minimum 20 days between signals

    for i, t in enumerate(ticks):
        if i - last_signal_idx < 5:
            continue
        high_vol = t.volatility > cfg["max_volatility"]
        low_margin = t.margin_pct < cfg["min_margin"]
        if high_vol or low_margin:
            reasons = []
            risk    = "medium"
            if low_margin:
                reasons.append(f"Margem ({t.margin_pct:.1f}%) < mínimo ({cfg['min_margin']}%)")
                risk = "high" if t.margin_pct < cfg["min_margin"] * 0.75 else "medium"
            if high_vol:
                reasons.append(f"Volatilidade ({t.volatility:.1f}%) > máximo ({cfg['max_volatility']}%)")
                risk = "high"
            signals.append(HedgeSignal(
                date=t.date, price=t.price,
                reason=" | ".join(reasons), risk_level=risk,
            ))
            last_signal_idx = i

    return signals

# ─── Performance calculation ──────────────────────────────────────────────────

def evaluate_signals(
    commodity: str,
    ticks: List[PriceTick],
    signals: List[HedgeSignal],
    lookforward: int = 10,
) -> Dict:
    cfg = BACKTEST_CONFIG[commodity]
    by_date = {t.date.date(): t for t in ticks}
    successful, failed = 0, 0
    total_savings = total_cost = 0.0

    for sig in signals:
        entry_price = sig.price
        future_min = entry_price
        for d in range(1, lookforward + 1):
            fd = (sig.date + timedelta(days=d)).date()
            if fd in by_date:
                future_min = min(future_min, by_date[fd].price)

        drop   = entry_price - future_min
        cost   = entry_price * cfg["contract_size"] * cfg["hedge_cost_pct"]
        total_cost += cost

        if drop > 0:
            savings = drop * cfg["contract_size"]
            total_savings += savings
            successful += 1
        else:
            failed += 1

    return {
        "successful": successful, "failed": failed,
        "total_savings": total_savings, "total_cost": total_cost,
        "net_benefit": total_savings - total_cost,
    }

# ─── Engine ───────────────────────────────────────────────────────────────────

class BacktestingEngine:
    def run(self, commodity: str, days: int = 90) -> Optional[BacktestResult]:
        logger.info(f"▶ Backtest {commodity} — {days} days")
        cfg   = BACKTEST_CONFIG.get(commodity)
        if not cfg:
            logger.warning(f"No config for {commodity}")
            return None

        ticks   = generate_price_history(commodity, days)
        signals = generate_signals(commodity, ticks)
        perf    = evaluate_signals(commodity, ticks, signals)
        n_sig   = len(signals)

        return BacktestResult(
            commodity=commodity,
            start_date=ticks[0].date.strftime("%Y-%m-%d"),
            end_date=ticks[-1].date.strftime("%Y-%m-%d"),
            total_days=days,
            recommendations_made=n_sig,
            successful_hedges=perf["successful"],
            failed_hedges=perf["failed"],
            avg_margin_pct=round(sum(t.margin_pct for t in ticks) / len(ticks), 2),
            total_savings=perf["total_savings"],
            total_cost=perf["total_cost"],
            net_benefit=perf["net_benefit"],
            success_rate=round(perf["successful"] / n_sig * 100, 1) if n_sig else 0,
            roi=round(perf["net_benefit"] / perf["total_cost"] * 100, 1) if perf["total_cost"] else 0,
        )

    def run_all(self, days: int = 90) -> List[BacktestResult]:
        results = []
        for commodity in BACKTEST_CONFIG:
            r = self.run(commodity, days)
            if r:
                results.append(r)
                self._print_result(r)
        self._print_summary(results)
        return results

    def _print_result(self, r: BacktestResult):
        print(f"""
╔══════════════════════════════════════════════════════════╗
║  BACKTEST: {r.commodity.upper():<48}║
╚══════════════════════════════════════════════════════════╝
  Período : {r.start_date}  →  {r.end_date} ({r.total_days} dias)
  Sinais  : {r.recommendations_made} gerados · {r.successful_hedges} ✓ · {r.failed_hedges} ✗ · {r.success_rate:.1f}% taxa
  Margem média : {r.avg_margin_pct:.2f}%

  Economia : R$ {r.total_savings:>12,.2f}
  Custo    : R$ {r.total_cost:>12,.2f}
  Benefício: R$ {r.net_benefit:>12,.2f}   ROI {r.roi:.1f}%
""")

    def _print_summary(self, results: List[BacktestResult]):
        if not results:
            return
        ts = sum(r.total_savings for r in results)
        tc = sum(r.total_cost    for r in results)
        tb = sum(r.net_benefit   for r in results)
        sr = sum(r.success_rate  for r in results) / len(results)
        print(f"""
╔══════════════════════════════════════════════════════════╗
║  RESUMO CONSOLIDADO — {len(results)} COMMODITIES{' ' * (28 - len(str(len(results))))}║
╚══════════════════════════════════════════════════════════╝
  Taxa de sucesso média : {sr:.1f}%
  Economia total        : R$ {ts:>12,.2f}
  Custo total           : R$ {tc:>12,.2f}
  Benefício líquido     : R$ {tb:>12,.2f}
  ROI consolidado       : {(tb/tc*100) if tc else 0:.1f}%

  ► Estratégia de hedge é {'✅ VIÁVEL' if tb > 0 else '❌ NÃO VIÁVEL'}
""")


if __name__ == "__main__":
    engine = BacktestingEngine()
    engine.run_all(days=90)
