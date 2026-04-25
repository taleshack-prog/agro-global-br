import { useState, useEffect } from 'react';
import { Shield, Eye, Zap, Clock, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { useToast } from './ui/Toast';
import { useRealtimePrice } from '../hooks/useRealtimePrice';

export interface HedgeRecommendation {
  commodity: string;
  name: string;
  currentPrice: number;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'HEDGE_RECOMMENDED' | 'MONITOR';
  protectionLevel?: number;
  futuresContract?: string;
  reason: string;
  suggestedQty?: {
    totalExpected: number;
    toProtect: number;
    protectionPct: number;
  };
  timestamp: string;
}

interface HedgeRecommendationsProps {
  onExecuteHedge?: (commodity: string, quantity: number) => void;
}

const RISK_COLORS = {
  low:    { badge: 'primary' as const, border: 'border-l-agro-primary' },
  medium: { badge: 'warning' as const, border: 'border-l-agro-secondary' },
  high:   { badge: 'danger' as const,  border: 'border-l-agro-danger' },
};

// Simulates the Kafka hedge-recommendations consumer
function useMockHedgeRecommendations(prices: Record<string, any>): HedgeRecommendation[] {
  const [recs, setRecs] = useState<HedgeRecommendation[]>([]);

  useEffect(() => {
    const compute = () => {
      setRecs([
        {
          commodity: 'soja',
          name: 'Soja',
          currentPrice: prices['soja']?.price ?? 142.50,
          riskLevel: 'medium',
          action: 'HEDGE_RECOMMENDED',
          protectionLevel: 30,
          futuresContract: 'SOJA_B3 — Jun/2026',
          reason: 'Margem atual (6.5%) abaixo do mínimo (8%) | Volatilidade elevada (22%)',
          suggestedQty: { totalExpected: 5000, toProtect: 1500, protectionPct: 30 },
          timestamp: new Date().toISOString(),
        },
        {
          commodity: 'milho',
          name: 'Milho',
          currentPrice: prices['milho']?.price ?? 68.40,
          riskLevel: 'low',
          action: 'MONITOR',
          reason: 'Margem (12.3%) e volatilidade (15%) dentro dos limites operacionais',
          timestamp: new Date().toISOString(),
        },
        {
          commodity: 'cafe',
          name: 'Café',
          currentPrice: prices['cafe']?.price ?? 1250.00,
          riskLevel: 'high',
          action: 'HEDGE_RECOMMENDED',
          protectionLevel: 40,
          futuresContract: 'CAFE_B3 — Jul/2026',
          reason: 'Margem crítica (3.2% < 10%) | Volatilidade muito alta (28%) | Safra em risco',
          suggestedQty: { totalExpected: 1500, toProtect: 600, protectionPct: 40 },
          timestamp: new Date().toISOString(),
        },
        {
          commodity: 'algodao',
          name: 'Algodão',
          currentPrice: prices['algodao']?.price ?? 135.80,
          riskLevel: 'medium',
          action: 'MONITOR',
          reason: 'Preços acima da média histórica — monitorar próximas 48h',
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    compute();
    const interval = setInterval(compute, 5000);
    return () => clearInterval(interval);
  }, [prices]);

  return recs;
}

export const HedgeRecommendations = ({ onExecuteHedge }: HedgeRecommendationsProps) => {
  const { toast } = useToast();
  const { prices, isConnected } = useRealtimePrice({ commodities: ['soja', 'milho', 'cafe', 'algodao'] });
  const recommendations = useMockHedgeRecommendations(prices);

  const [filter, setFilter] = useState<'all' | 'recommended' | 'monitor'>('all');
  const [selected, setSelected] = useState<HedgeRecommendation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = recommendations.filter(r => {
    if (filter === 'recommended') return r.action === 'HEDGE_RECOMMENDED';
    if (filter === 'monitor')     return r.action === 'MONITOR';
    return true;
  });

  const urgentCount = recommendations.filter(r => r.action === 'HEDGE_RECOMMENDED').length;

  const handleExecute = (rec: HedgeRecommendation) => {
    if (rec.suggestedQty) {
      onExecuteHedge?.(rec.commodity, rec.suggestedQty.toProtect);
      toast.success(`Hedge executado: ${rec.name} — ${rec.suggestedQty.toProtect} sacas protegidas`, 'Hedge confirmado');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Shield size={20} className="text-agro-primary" />
            Recomendações de Hedge
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Proteção automática baseada em análise de risco · atualiza a cada 5s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-[9999px] ${isConnected ? 'bg-agro-primary animate-pulse' : 'bg-agro-danger'}`} />
          <span className="text-xs text-text-muted">{isConnected ? 'WebSocket ativo' : 'Offline (mock)'}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">{recommendations.length}</div>
          <div className="text-xs text-text-muted mt-0.5">Monitoradas</div>
        </Card>
        <Card className="!p-4 text-center border-l-4 border-l-agro-danger">
          <div className="text-2xl font-bold text-agro-danger">{urgentCount}</div>
          <div className="text-xs text-text-muted mt-0.5">Hedge urgente</div>
        </Card>
        <Card className="!p-4 text-center border-l-4 border-l-agro-primary">
          <div className="text-2xl font-bold text-agro-primary">{recommendations.length - urgentCount}</div>
          <div className="text-xs text-text-muted mt-0.5">Monitorando</div>
        </Card>
      </div>

      {urgentCount > 0 && (
        <Alert variant="warning" title={`${urgentCount} commodity${urgentCount > 1 ? 's' : ''} requer${urgentCount === 1 ? '' : 'em'} proteção imediata`}>
          Margem ou volatilidade fora dos limites. Clique em "Executar Hedge" para proteger sua safra.
        </Alert>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'recommended', 'monitor'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors border ${
              filter === f
                ? 'bg-agro-primary/10 border-agro-primary text-agro-primary'
                : 'bg-surface-2 border-border text-text-muted hover:text-text-primary'
            }`}
          >
            {f === 'all' && `Todas (${recommendations.length})`}
            {f === 'recommended' && `🛡️ Proteger (${urgentCount})`}
            {f === 'monitor' && `👁️ Monitorar (${recommendations.length - urgentCount})`}
          </button>
        ))}
      </div>

      {/* Recommendation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(rec => {
          const colors = RISK_COLORS[rec.riskLevel];
          return (
            <button
              key={rec.commodity}
              onClick={() => { setSelected(rec); setModalOpen(true); }}
              className={`text-left p-5 bg-surface-2 border border-border rounded-[12px] border-l-4 ${colors.border} hover:shadow-[var(--shadow-md)] transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-agro-primary transition-colors text-base">{rec.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">
                    R$ {rec.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={colors.badge} size="sm">
                    {rec.riskLevel === 'high' ? 'Alto' : rec.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                  {rec.action === 'HEDGE_RECOMMENDED'
                    ? <Badge variant="danger" size="sm"><Shield size={10} className="mr-0.5" />Proteger</Badge>
                    : <Badge variant="primary" size="sm"><Eye size={10} className="mr-0.5" />Monitorar</Badge>
                  }
                </div>
              </div>

              <p className="text-xs text-text-secondary mb-3 leading-relaxed">{rec.reason}</p>

              {rec.suggestedQty && (
                <div className="space-y-2 mb-3">
                  <ProgressBar
                    value={rec.suggestedQty.protectionPct}
                    label={`Proteção sugerida: ${rec.suggestedQty.toProtect.toLocaleString('pt-BR')} sc`}
                    color={rec.riskLevel === 'high' ? 'danger' : 'secondary'}
                    sublabel={`${rec.suggestedQty.protectionPct}%`}
                    showPercent={false}
                  />
                </div>
              )}

              {rec.futuresContract && (
                <p className="text-xs text-text-muted font-mono">Contrato: {rec.futuresContract}</p>
              )}

              {rec.action === 'HEDGE_RECOMMENDED' && (
                <div className="mt-3 flex items-center gap-2 text-agro-primary text-xs font-semibold">
                  <Zap size={12} />
                  Clique para ver detalhes e executar
                  <ChevronRight size={12} className="ml-auto" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Hedge — ${selected.name}`}
          description={`Risco ${selected.riskLevel} · ${new Date(selected.timestamp).toLocaleString('pt-BR')}`}
          size="md"
          footer={
            selected.action === 'HEDGE_RECOMMENDED' ? (
              <>
                <Button variant="muted" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" size="sm" icon={<Shield size={14} />} onClick={() => handleExecute(selected)}>
                  Executar Hedge
                </Button>
              </>
            ) : (
              <Button variant="muted" size="sm" fullWidth onClick={() => setModalOpen(false)}>Fechar</Button>
            )
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="!p-3 text-center">
                <p className="text-xs text-text-muted">Preço Atual</p>
                <p className="text-xl font-bold text-text-primary font-mono">R$ {selected.currentPrice.toFixed(2)}</p>
              </Card>
              <Card className="!p-3 text-center">
                <p className="text-xs text-text-muted">Nível de Risco</p>
                <Badge variant={RISK_COLORS[selected.riskLevel].badge} size="md" className="mt-1">
                  {selected.riskLevel === 'high' ? 'Alto' : selected.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              </Card>
            </div>

            <Alert
              variant={selected.riskLevel === 'high' ? 'danger' : selected.riskLevel === 'medium' ? 'warning' : 'info'}
              title="Motivo da recomendação"
            >
              {selected.reason}
            </Alert>

            {selected.suggestedQty && (
              <Card className="!p-4">
                <p className="text-sm font-bold text-text-primary mb-3">Quantidade Sugerida</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Total safra', `${selected.suggestedQty.totalExpected.toLocaleString('pt-BR')} sc`],
                    ['A proteger', `${selected.suggestedQty.toProtect.toLocaleString('pt-BR')} sc`],
                    ['Percentual', `${selected.suggestedQty.protectionPct}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-surface rounded-[8px] p-3 text-center">
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="font-bold text-text-primary mt-0.5 text-sm">{val}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {selected.futuresContract && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock size={14} />
                <span>Contrato: <span className="font-mono text-text-primary">{selected.futuresContract}</span></span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
