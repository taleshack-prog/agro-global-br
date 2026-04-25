import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { useToast } from '../ui/Toast';

export interface HedgeRecommendation {
  commodity: string;
  name?: string;
  action: 'HEDGE_RECOMMENDED' | 'MONITOR';
  risk_level: 'low' | 'medium' | 'high';
  reason: string;
  protection_level?: number;
  suggested_quantity?: { total_expected: number; to_protect: number; protection_pct: number };
  current_price?: number;
}

interface HedgeWidgetProps {
  recommendations: HedgeRecommendation[];
  onExecute?: (commodity: string, qty: number) => void;
}

const RISK_VARIANT = { low: 'primary', medium: 'warning', high: 'danger' } as const;

export const HedgeWidget = ({ recommendations, onExecute }: HedgeWidgetProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'protect' | 'monitor'>('all');
  const [selected, setSelected] = useState<HedgeRecommendation | null>(null);

  const filtered = recommendations.filter(r =>
    filter === 'all' ? true : filter === 'protect' ? r.action === 'HEDGE_RECOMMENDED' : r.action === 'MONITOR'
  );
  const urgentCount = recommendations.filter(r => r.action === 'HEDGE_RECOMMENDED').length;

  const handleExecute = (rec: HedgeRecommendation) => {
    const qty = rec.suggested_quantity?.to_protect ?? 0;
    onExecute?.(rec.commodity, qty);
    toast.success(`Hedge executado: ${rec.name ?? rec.commodity} — ${qty} sacas`, 'Confirmado');
    setSelected(null);
  };

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Recomendações de Hedge"
        subtitle={`${urgentCount} urgente${urgentCount !== 1 ? 's' : ''}`}
        icon={<Shield size={16} />}
        action={<Badge variant={urgentCount > 0 ? 'danger' : 'primary'}>{recommendations.length}</Badge>}
      />

      <div className="flex gap-2">
        {(['all', 'protect', 'monitor'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-colors ${
              filter === f ? 'bg-agro-primary/10 border-agro-primary text-agro-primary' : 'border-border text-text-muted hover:text-text-primary bg-surface-2'
            }`}>
            {f === 'all' ? `Todas (${recommendations.length})` : f === 'protect' ? `🛡️ Proteger (${urgentCount})` : `👁️ Monitorar (${recommendations.length - urgentCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">Nenhuma recomendação</p>
        ) : filtered.map(rec => (
          <button key={rec.commodity} onClick={() => setSelected(rec)}
            className={`w-full text-left p-4 rounded-[12px] border-2 transition-all hover:shadow-[var(--shadow-md)] ${
              rec.action === 'HEDGE_RECOMMENDED' ? 'bg-agro-danger/5 border-agro-danger/30' : 'bg-agro-accent/5 border-agro-accent/20'
            }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-text-primary capitalize">{rec.name ?? rec.commodity}</h4>
                {rec.current_price && <p className="text-xs text-text-muted font-mono">R$ {rec.current_price.toFixed(2)}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={RISK_VARIANT[rec.risk_level]} size="sm">{rec.risk_level}</Badge>
                {rec.action === 'HEDGE_RECOMMENDED'
                  ? <AlertCircle size={16} className="text-agro-danger" />
                  : <CheckCircle size={16} className="text-agro-primary" />}
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-2">{rec.reason}</p>
            {rec.suggested_quantity && (
              <ProgressBar value={rec.suggested_quantity.protection_pct ?? rec.protection_level ?? 0}
                label={`Proteger ${rec.suggested_quantity.to_protect.toLocaleString('pt-BR')} sc`}
                color={rec.risk_level === 'high' ? 'danger' : 'secondary'} showPercent={false} />
            )}
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Hedge — ${selected.name ?? selected.commodity}`}
          size="sm"
          footer={
            selected.action === 'HEDGE_RECOMMENDED' ? (
              <>
                <Button variant="muted" size="sm" onClick={() => setSelected(null)}>Cancelar</Button>
                <Button variant="primary" size="sm" icon={<Shield size={13} />} onClick={() => handleExecute(selected)}>
                  Executar Hedge
                </Button>
              </>
            ) : (
              <Button variant="muted" size="sm" fullWidth onClick={() => setSelected(null)}>Fechar</Button>
            )
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {selected.current_price && (
                <div className="bg-surface rounded-[8px] p-3">
                  <p className="text-xs text-text-muted">Preço</p>
                  <p className="font-bold text-text-primary font-mono">R$ {selected.current_price.toFixed(2)}</p>
                </div>
              )}
              <div className="bg-surface rounded-[8px] p-3">
                <p className="text-xs text-text-muted">Risco</p>
                <Badge variant={RISK_VARIANT[selected.risk_level]} size="md" className="mt-0.5">{selected.risk_level}</Badge>
              </div>
            </div>
            <div className="bg-agro-warning/10 border border-agro-warning/30 rounded-[8px] p-3">
              <p className="text-xs font-semibold text-agro-secondary mb-1">Motivo</p>
              <p className="text-xs text-text-secondary">{selected.reason}</p>
            </div>
            {selected.suggested_quantity && (
              <div className="grid grid-cols-3 gap-2">
                {[['Total', `${selected.suggested_quantity.total_expected.toLocaleString('pt-BR')} sc`],
                  ['Proteger', `${selected.suggested_quantity.to_protect.toLocaleString('pt-BR')} sc`],
                  ['%', `${selected.suggested_quantity.protection_pct ?? selected.protection_level ?? 0}%`]
                ].map(([l, v]) => (
                  <div key={String(l)} className="bg-surface rounded-[8px] p-2 text-center">
                    <p className="text-xs text-text-muted">{String(l)}</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5">{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Card>
  );
};
