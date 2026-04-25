import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export interface RiskMetric {
  commodity: string;
  name?: string;
  var_95: number;
  volatility: number;
  margin_pct: number;
  risk_level: 'low' | 'medium' | 'high';
}

const RISK_VARIANT = { low: 'primary', medium: 'warning', high: 'danger' } as const;
const RISK_COLOR   = { low: 'primary', medium: 'secondary', high: 'danger' } as const;

export const RiskWidget = ({ metrics }: { metrics: RiskMetric[] }) => {
  const highCount  = metrics.filter(m => m.risk_level === 'high').length;
  const avgVol     = metrics.length ? metrics.reduce((s, m) => s + m.volatility, 0) / metrics.length : 0;
  const avgMargin  = metrics.length ? metrics.reduce((s, m) => s + m.margin_pct,  0) / metrics.length : 0;

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Métricas de Risco"
        subtitle="VaR · Volatilidade · Margem"
        icon={<AlertTriangle size={16} />}
        action={highCount > 0 ? <Badge variant="danger" size="sm">{highCount} alto</Badge> : undefined}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Alto Risco', value: highCount, color: 'text-agro-danger' },
          { label: 'Vol. Média', value: `${avgVol.toFixed(1)}%`, color: 'text-agro-secondary' },
          { label: 'Margem Média', value: `${avgMargin.toFixed(1)}%`, color: 'text-agro-primary' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-[8px] p-3 text-center">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.commodity} className="bg-surface rounded-[12px] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary capitalize">{m.name ?? m.commodity}</span>
              <Badge variant={RISK_VARIANT[m.risk_level]} size="sm">{m.risk_level}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-text-muted mb-2">
              <span>VaR: <span className="text-agro-danger font-mono">{m.var_95.toFixed(2)}%</span></span>
              <span>Vol: <span className="text-agro-secondary font-mono">{m.volatility.toFixed(1)}%</span></span>
              <span>Mg: <span className="text-agro-primary font-mono">{m.margin_pct.toFixed(1)}%</span></span>
            </div>
            <ProgressBar value={m.volatility} max={30} color={RISK_COLOR[m.risk_level]} showPercent={false} />
          </div>
        ))}
      </div>

      {metrics.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8">Aguardando métricas...</p>
      )}
    </Card>
  );
};
