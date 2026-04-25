import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Tabs } from '../components/ui/Tabs';
import { PriceWidget }    from '../components/dashboard/PriceWidget';
import { HedgeWidget }    from '../components/dashboard/HedgeWidget';
import { RiskWidget }     from '../components/dashboard/RiskWidget';
import { AlertWidget }    from '../components/dashboard/AlertWidget';
import { BacktestWidget } from '../components/dashboard/BacktestWidget';
import { HistoryWidget }  from '../components/dashboard/HistoryWidget';
import { useKafkaConsumer } from '../hooks/useKafkaConsumer';
import { useRealtimePrice } from '../hooks/useRealtimePrice';
import { useToast } from '../components/ui/Toast';
import type { HedgeRecommendation } from '../components/dashboard/HedgeWidget';
import type { RiskMetric }          from '../components/dashboard/RiskWidget';
import type { AlertMessage }        from '../components/dashboard/AlertWidget';
import type { BacktestResult }      from '../components/dashboard/BacktestWidget';
import type { HistoryRecord }       from '../components/dashboard/HistoryWidget';

// ─── Seed backtest data (mock — mirrors backtest_engine.py output) ────────────

const SEED_BACKTEST: BacktestResult[] = [
  { commodity: 'soja',    roi: 880, savings: 18900, win_rate: 85.7, total_trades: 7,  avg_profit: 2700, net_benefit: 16972 },
  { commodity: 'milho',   roi: 705, savings: 12400, win_rate: 80.0, total_trades: 5,  avg_profit: 2480, net_benefit: 10860 },
  { commodity: 'cafe',    roi: 700, savings: 31250, win_rate: 77.8, total_trades: 9,  avg_profit: 3472, net_benefit: 27344 },
  { commodity: 'algodao', roi: 808, savings: 14800, win_rate: 83.3, total_trades: 6,  avg_profit: 2467, net_benefit: 13170 },
];

const SEED_HISTORY: HistoryRecord[] = [
  { id: 'H001', commodity: 'soja',    type: 'hedge',  quantity: 1500, price: 142.50, total: 213750, timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
  { id: 'H002', commodity: 'milho',   type: 'buy',    quantity: 2000, price: 68.40,  total: 136800, timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'completed' },
  { id: 'H003', commodity: 'cafe',    type: 'hedge',  quantity: 600,  price: 1250.0, total: 750000, timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'pending'   },
  { id: 'H004', commodity: 'algodao', type: 'sell',   quantity: 400,  price: 135.80, total: 54320,  timestamp: new Date(Date.now() - 900000).toISOString(),  status: 'completed' },
];

// ─── Dashboard Executivo ──────────────────────────────────────────────────────

export const DashboardExecutivo = () => {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('pt-BR'));

  // Live price data
  const { prices, isConnected: pricesConnected } = useRealtimePrice({
    commodities: ['soja', 'milho', 'cafe', 'gado', 'leite', 'algodao'],
  });

  // Kafka consumer (falls back to Price Service)
  const { messages, isConnected: kafkaConnected } = useKafkaConsumer({
    topics: ['hedge-recommendations', 'risk-metrics', 'price-alerts'],
  });

  // Derived state from Kafka messages
  const [hedgeRecs,  setHedgeRecs]  = useState<HedgeRecommendation[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [alerts,      setAlerts]      = useState<AlertMessage[]>([]);
  const lastAlertIds = useRef<Set<string>>(new Set());

  // Process Kafka messages into widget data
  useEffect(() => {
    const hedgeMsgs = messages['hedge_recommendation'] ?? [];
    const dedupe = new Map<string, HedgeRecommendation>();
    hedgeMsgs.slice(-20).forEach(m => {
      if (m.data?.commodity) dedupe.set(m.data.commodity, m.data as HedgeRecommendation);
    });
    if (dedupe.size > 0) setHedgeRecs(Array.from(dedupe.values()));

    const priceMsgs = messages['price_update'] ?? [];
    const riskMap = new Map<string, RiskMetric>();
    priceMsgs.slice(-30).forEach(m => {
      const d = m.data;
      if (!d?.id) return;
      const changePct = Math.abs(d.change_pct ?? 0);
      riskMap.set(d.id, {
        commodity: d.id,
        name: d.name,
        var_95: -(changePct * 1.645),
        volatility: changePct * 12,
        margin_pct: Math.max(2, 20 - changePct * 3),
        risk_level: changePct > 1 ? 'high' : changePct > 0.5 ? 'medium' : 'low',
      });
    });
    if (riskMap.size > 0) setRiskMetrics(Array.from(riskMap.values()));

    const alertMsgs = messages['price_alert'] ?? [];
    const newAlerts: AlertMessage[] = alertMsgs
      .filter(m => m.data?.id && !lastAlertIds.current.has(m.data.id))
      .slice(-20)
      .map(m => {
        lastAlertIds.current.add(m.data.id);
        return m.data as AlertMessage;
      });
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  }, [messages]);

  const handleMarkRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  // Timestamp ticker
  useEffect(() => {
    const t = setInterval(() => setLastUpdate(new Date().toLocaleTimeString('pt-BR')), 10000);
    return () => clearInterval(t);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <LayoutDashboard size={20} className="text-agro-primary" />
            Dashboard Executivo
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Kafka · TimescaleDB · WebSocket · Preços ao vivo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">Atualizado: {lastUpdate}</span>
          <Button variant="muted" size="sm" icon={<RefreshCw size={13} />} onClick={() => setLastUpdate(new Date().toLocaleTimeString('pt-BR'))}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection status */}
      <div className="flex gap-3 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-xs font-medium ${pricesConnected ? 'bg-agro-primary/10 border-agro-primary/30 text-agro-primary' : 'bg-surface-2 border-border text-text-muted'}`}>
          <div className={`w-1.5 h-1.5 rounded-[9999px] ${pricesConnected ? 'bg-agro-primary animate-pulse' : 'bg-text-muted'}`} />
          Price Service {pricesConnected ? 'Ativo' : 'Offline'}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-xs font-medium ${kafkaConnected ? 'bg-agro-accent/10 border-agro-accent/30 text-agro-accent' : 'bg-surface-2 border-border text-text-muted'}`}>
          <div className={`w-1.5 h-1.5 rounded-[9999px] ${kafkaConnected ? 'bg-agro-accent animate-pulse' : 'bg-text-muted'}`} />
          Kafka Gateway {kafkaConnected ? 'Ativo' : 'Offline'}
        </div>
        {unreadAlerts > 0 && (
          <Badge variant="danger" size="md">{unreadAlerts} alerta{unreadAlerts !== 1 ? 's' : ''} não lido{unreadAlerts !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {!pricesConnected && !kafkaConnected && (
        <Alert variant="info" title="Serviços offline">
          Execute <code className="bg-surface px-1 rounded text-xs">bash services/run-price-service.sh</code> para ativar dados ao vivo. Exibindo dados de seed enquanto isso.
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        variant="underline"
        defaultValue="visao-geral"
        tabs={[
          { value: 'visao-geral', label: 'Visão Geral' },
          { value: 'precos',     label: 'Preços' },
          { value: 'hedge',      label: 'Hedge',      badge: hedgeRecs.filter(r => r.action === 'HEDGE_RECOMMENDED').length || undefined },
          { value: 'risco',      label: 'Risco' },
          { value: 'alertas',    label: 'Alertas',    badge: unreadAlerts || undefined },
          { value: 'backtest',   label: 'Backtesting' },
          { value: 'historico',  label: 'Histórico' },
        ]}
      >
        {/* Tab content via nested switcher */}
        <DashboardTabContent
          prices={prices}
          hedgeRecs={hedgeRecs}
          riskMetrics={riskMetrics}
          alerts={alerts}
          onMarkRead={handleMarkRead}
          onExecuteHedge={(c: string, q: number) => toast.success(`Hedge: ${c} · ${q} sacas`)}
        />
      </Tabs>
    </div>
  );
};

// ─── Tab content ─────────────────────────────────────────────────────────────

const DashboardTabContent = ({ prices, hedgeRecs, riskMetrics, alerts, onMarkRead, onExecuteHedge }: any) => {
  const [tab, setTab] = useState('visao-geral');

  return (
    <div className="space-y-4">
      {/* Inline segment switcher (re-uses segment variant) */}
      <Tabs
        variant="pills"
        defaultValue="visao-geral"
        onTabChange={setTab}
        tabs={[
          { value: 'visao-geral', label: 'Geral' },
          { value: 'precos',     label: 'Preços' },
          { value: 'hedge',      label: 'Hedge' },
          { value: 'risco',      label: 'Risco' },
          { value: 'alertas',    label: 'Alertas' },
          { value: 'backtest',   label: 'Backtesting' },
          { value: 'historico',  label: 'Histórico' },
        ]}
      />

      {tab === 'visao-geral' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PriceWidget commodities={prices} />
            <HedgeWidget recommendations={hedgeRecs} onExecute={onExecuteHedge} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskWidget metrics={riskMetrics} />
            <AlertWidget alerts={alerts} onMarkAsRead={onMarkRead} />
          </div>
        </div>
      )}
      {tab === 'precos'     && <PriceWidget    commodities={prices} />}
      {tab === 'hedge'      && <HedgeWidget    recommendations={hedgeRecs} onExecute={onExecuteHedge} />}
      {tab === 'risco'      && <RiskWidget     metrics={riskMetrics} />}
      {tab === 'alertas'    && <AlertWidget    alerts={alerts} onMarkAsRead={onMarkRead} />}
      {tab === 'backtest'   && <BacktestWidget results={SEED_BACKTEST} />}
      {tab === 'historico'  && <HistoryWidget  records={SEED_HISTORY} />}
    </div>
  );
};
