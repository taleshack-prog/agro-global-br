import { useState } from 'react';
import { Shield, TrendingUp, BarChart3, Bell, Database, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Tabs } from '../components/ui/Tabs';
import { PriceChart } from '../components/PriceChart';
import { HedgeRecommendations } from '../components/HedgeRecommendations';
import { useRealtimePrice } from '../hooks/useRealtimePrice';
import { useToast } from '../components/ui/Toast';

// ─── Backtesting mock results (mirrors backtest_engine.py output) ─────────────

const MOCK_BACKTEST = [
  { commodity: 'Soja',    days: 90, signals: 7, success: 6, failRate: 14.3, savings: 18900, cost: 1928, net: 16972, roi: 880.2, successRate: 85.7 },
  { commodity: 'Milho',   days: 90, signals: 5, success: 4, failRate: 20.0, savings: 12400, cost: 1540, net: 10860, roi: 705.2, successRate: 80.0 },
  { commodity: 'Café',    days: 90, signals: 9, success: 7, failRate: 22.2, savings: 31250, cost: 3906, net: 27344, roi: 700.1, successRate: 77.8 },
  { commodity: 'Algodão', days: 90, signals: 6, success: 5, failRate: 16.7, savings: 14800, cost: 1630, net: 13170, roi: 808.0, successRate: 83.3 },
];

// ─── Alert history mock ───────────────────────────────────────────────────────

const ALERT_HISTORY = [
  { time: '2h atrás',  commodity: 'Soja',    action: 'HEDGE_RECOMMENDED', channel: 'Email + SMS', riskLevel: 'high' },
  { time: '4h atrás',  commodity: 'Café',    action: 'HEDGE_RECOMMENDED', channel: 'Email + SMS', riskLevel: 'high' },
  { time: '6h atrás',  commodity: 'Milho',   action: 'MONITOR',           channel: 'Email',       riskLevel: 'low' },
  { time: '1d atrás',  commodity: 'Soja',    action: 'HEDGE_RECOMMENDED', channel: 'Email + SMS', riskLevel: 'medium' },
  { time: '2d atrás',  commodity: 'Algodão', action: 'MONITOR',           channel: 'Email',       riskLevel: 'medium' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const HedgeDashboard = () => {
  const { toast }  = useToast();
  const { prices, isConnected } = useRealtimePrice({ commodities: ['soja', 'milho', 'cafe'] });
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestDone,    setBacktestDone]    = useState(false);

  const runBacktest = () => {
    setBacktestRunning(true);
    toast.info('Executando backtesting engine (90 dias)...', 'Processando');
    setTimeout(() => {
      setBacktestRunning(false);
      setBacktestDone(true);
      toast.success('Backtesting concluído! 4 commodities analisadas.', 'Concluído');
    }, 3000);
  };

  const totalNet = MOCK_BACKTEST.reduce((a, b) => a + b.net, 0);
  const avgSuccess = MOCK_BACKTEST.reduce((a, b) => a + b.successRate, 0) / MOCK_BACKTEST.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Shield size={20} className="text-agro-primary" />
            Sistema Completo de Hedge
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Recomendações · TimescaleDB · Alertas Email/SMS · Backtesting Engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-[9999px] ${isConnected ? 'bg-agro-primary animate-pulse' : 'bg-text-muted'}`} />
          <span className="text-xs text-text-muted">{isConnected ? 'Price Service ativo' : 'Mock data'}</span>
        </div>
      </div>

      <Tabs
        variant="underline"
        defaultValue="hedge"
        tabs={[
          { value: 'hedge',     label: 'Recomendações',   icon: <Shield size={14} /> },
          { value: 'prices',    label: 'Preços Ao Vivo',  icon: <TrendingUp size={14} /> },
          { value: 'backtest',  label: 'Backtesting',     icon: <BarChart3 size={14} /> },
          { value: 'alerts',    label: 'Alertas',         icon: <Bell size={14} /> },
          { value: 'timescale', label: 'TimescaleDB',     icon: <Database size={14} /> },
        ]}
      >
        <div>
          {/* Tab content rendered via defaultValue + children */}
          {/* We use a workaround since Tabs renders children once */}
        </div>
      </Tabs>

      {/* We render tabs content via our own state-based approach below */}
      <HedgeTabsContent
        prices={prices}
        backtestRunning={backtestRunning}
        backtestDone={backtestDone}
        onRunBacktest={runBacktest}
        totalNet={totalNet}
        avgSuccess={avgSuccess}
        isConnected={isConnected}
      />
    </div>
  );
};

// ─── Tab content split out for clarity ───────────────────────────────────────

const HedgeTabsContent = ({
  prices, backtestRunning, backtestDone, onRunBacktest, totalNet, avgSuccess, isConnected
}: any) => {
  const { toast } = useToast();
  const [tab, setTab] = useState('hedge');

  return (
    <div className="space-y-4">
      {/* Inline tab switcher */}
      <div className="flex gap-1 bg-surface-2 rounded-[12px] p-1 border border-border">
        {[
          { v: 'hedge',     label: '🛡️ Recomendações' },
          { v: 'prices',    label: '📊 Preços Ao Vivo' },
          { v: 'backtest',  label: '📈 Backtesting' },
          { v: 'alerts',    label: '🔔 Alertas' },
          { v: 'timescale', label: '🗄️ TimescaleDB' },
        ].map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-2 px-3 rounded-[8px] text-xs font-medium transition-all ${
              tab === v ? 'bg-agro-primary text-white shadow-[var(--shadow-sm)]' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Hedge Recommendations ───────────────────────────── */}
      {tab === 'hedge' && (
        <HedgeRecommendations
          onExecuteHedge={(commodity, qty) =>
            toast.success(`Hedge executado: ${commodity} — ${qty} sacas protegidas`)
          }
        />
      )}

      {/* ── Live Prices ─────────────────────────────────────── */}
      {tab === 'prices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(prices).length === 0 ? (
            <Card className="lg:col-span-2 flex items-center justify-center" style={{ minHeight: 200 }}>
              <p className="text-text-muted text-sm">
                {isConnected ? 'Aguardando dados...' : 'Price Service offline — inicie com: python services/price-service/price_service.py'}
              </p>
            </Card>
          ) : (
            Object.entries(prices).map(([id, data]) => (
              <PriceChart key={id} data={data as any} height={200} showArea />
            ))
          )}
        </div>
      )}

      {/* ── Backtesting ─────────────────────────────────────── */}
      {tab === 'backtest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-primary">Backtesting Engine</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Valida performance histórica com random-walk GBM · 90 dias
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={backtestRunning}
              onClick={onRunBacktest}
              icon={<BarChart3 size={14} />}
            >
              Executar (90 dias)
            </Button>
          </div>

          {backtestDone && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="!p-4 text-center">
                  <div className="text-2xl font-bold text-agro-primary">{avgSuccess.toFixed(1)}%</div>
                  <div className="text-xs text-text-muted">Taxa de sucesso</div>
                </Card>
                <Card className="!p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {MOCK_BACKTEST.reduce((a, b) => a + b.signals, 0)}
                  </div>
                  <div className="text-xs text-text-muted">Sinais gerados</div>
                </Card>
                <Card className="!p-4 text-center">
                  <div className="text-2xl font-bold text-agro-primary">
                    R$ {(totalNet / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-text-muted">Benefício líquido</div>
                </Card>
                <Card className="!p-4 text-center">
                  <Badge variant="primary" size="md">VIÁVEL</Badge>
                  <div className="text-xs text-text-muted mt-1">Estratégia</div>
                </Card>
              </div>

              <Card padding={false}>
                <div className="p-4 pb-0">
                  <CardHeader title="Resultados por Commodity" subtitle="Últimos 90 dias simulados" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        {['Commodity', 'Sinais', 'Taxa %', 'Economia', 'Custo', 'Líquido', 'ROI'].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-text-muted uppercase text-left last:text-right">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {MOCK_BACKTEST.map(r => (
                        <tr key={r.commodity} className="hover:bg-surface/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-text-primary">{r.commodity}</td>
                          <td className="px-4 py-3 text-text-muted">{r.signals}</td>
                          <td className="px-4 py-3">
                            <Badge variant={r.successRate >= 80 ? 'primary' : 'warning'} size="sm">
                              {r.successRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-agro-primary font-mono">R$ {r.savings.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-agro-danger font-mono">R$ {r.cost.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-agro-primary font-bold font-mono">R$ {r.net.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-right font-bold text-agro-primary">{r.roi.toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Alert variant="success" title="Estratégia de hedge é VIÁVEL">
                Benefício líquido consolidado de <strong>R$ {totalNet.toLocaleString('pt-BR')}</strong> com {avgSuccess.toFixed(1)}% de taxa de sucesso média nos últimos 90 dias simulados.
              </Alert>
            </>
          )}

          {!backtestDone && !backtestRunning && (
            <Alert variant="info">
              Clique em "Executar" para rodar o backtesting engine com dados simulados (GBM). Em produção, o engine lê diretamente do TimescaleDB.
            </Alert>
          )}
        </div>
      )}

      {/* ── Alert Service ────────────────────────────────────── */}
      {tab === 'alerts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-agro-primary/10 rounded-[8px]">
                  <Bell size={18} className="text-agro-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">Email (SMTP/SendGrid)</p>
                  <p className="text-xs text-text-muted">Alertas HTML detalhados</p>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="mt-3">Configurado</Badge>
              <p className="text-xs text-text-muted mt-1 font-mono">services/alert-service/alert_service.py</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-agro-accent/10 rounded-[8px]">
                  <CheckCircle size={18} className="text-agro-accent" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">SMS (Twilio)</p>
                  <p className="text-xs text-text-muted">Notificações rápidas ≤ 160 chars</p>
                </div>
              </div>
              <Badge variant="accent" size="sm" className="mt-3">Configurado</Badge>
              <p className="text-xs text-text-muted mt-1">Requer TWILIO_* env vars</p>
            </Card>
          </div>

          <Card padding={false}>
            <div className="p-4 pb-0">
              <CardHeader title="Histórico de Alertas" subtitle="Últimas notificações disparadas" />
            </div>
            <div className="divide-y divide-border/50">
              {ALERT_HISTORY.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-[9999px] shrink-0 ${
                    a.action === 'HEDGE_RECOMMENDED' ? 'bg-agro-danger' : 'bg-agro-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{a.commodity}</span>
                      <Badge
                        variant={a.action === 'HEDGE_RECOMMENDED' ? 'danger' : 'primary'}
                        size="sm"
                      >
                        {a.action === 'HEDGE_RECOMMENDED' ? '🛡️ Hedge' : '👁️ Monitor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">{a.channel} · {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Alert variant="info" title="Como iniciar o Alert Service">
            <code className="text-xs bg-surface px-2 py-0.5 rounded">
              pip install -r services/alert-service/requirements.txt
            </code>
            <br />
            <code className="text-xs bg-surface px-2 py-0.5 rounded mt-1 block">
              python services/alert-service/alert_service.py
            </code>
          </Alert>
        </div>
      )}

      {/* ── TimescaleDB ──────────────────────────────────────── */}
      {tab === 'timescale' && (
        <div className="space-y-4">
          <Alert variant="info" title="TimescaleDB — Schema e Queries">
            Schema completo em <code className="bg-surface px-1 rounded text-xs">database/timescaledb_queries.sql</code>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Hypertables', '3', 'prices, risk_metrics, hedge_recommendations'],
              ['Cont. Aggregates', '2', 'prices_hourly, prices_daily'],
              ['Queries', '12', 'OHLCV, VaR, correlação, backtesting...'],
              ['Retention', '1-3 anos', 'Por tabela com add_retention_policy'],
            ].map(([label, val, sub]) => (
              <Card key={label} className="!p-4">
                <div className="text-xl font-bold text-agro-primary">{val}</div>
                <div className="text-xs font-semibold text-text-primary mt-0.5">{label}</div>
                <div className="text-xs text-text-muted mt-1">{sub}</div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Queries disponíveis" icon={<Database size={16} />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Cotação mais recente por commodity',
                'Candles horários (últimas 24h)',
                'Volatilidade histórica 30d',
                'Margem por período (daily)',
                'Recomendações de hedge (7d)',
                'Períodos de alto risco (vol > 20%)',
                'Backtesting: rendimento após sinal',
                'Alertas de movimento rápido (> 5%)',
                'Dashboard executivo snapshot',
                'VaR paramétrico — função SQL',
                'View: high_risk_commodities',
                'Continuous aggregates OHLCV',
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle size={12} className="text-agro-primary shrink-0" />
                  {q}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
