import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface AlertMessage {
  id: string;
  type: 'price_alert' | 'hedge_alert' | 'risk_alert' | 'info';
  commodity: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  read: boolean;
}

interface AlertWidgetProps {
  alerts: AlertMessage[];
  onMarkAsRead?: (id: string) => void;
}

const ICONS = {
  price_alert: <AlertCircle  size={15} className="text-agro-secondary shrink-0" />,
  hedge_alert: <AlertTriangle size={15} className="text-agro-danger shrink-0" />,
  risk_alert:  <Info          size={15} className="text-agro-accent shrink-0" />,
  info:        <CheckCircle  size={15} className="text-agro-primary shrink-0" />,
};

const SEV_BG = {
  high:   'bg-agro-danger/5  border-agro-danger/20',
  medium: 'bg-agro-secondary/5 border-agro-secondary/20',
  low:    'bg-surface border-border',
};

const SEV_VARIANT = { high: 'danger', medium: 'warning', low: 'gray' } as const;

export const AlertWidget = ({ alerts, onMarkAsRead }: AlertWidgetProps) => {
  const unread = alerts.filter(a => !a.read).length;
  const recent = [...alerts].reverse().slice(0, 15);

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Alertas"
        subtitle="Últimas 24h"
        icon={<Bell size={16} />}
        action={unread > 0 ? <Badge variant="danger" size="sm">{unread} novo{unread !== 1 ? 's' : ''}</Badge> : undefined}
      />

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {recent.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">Nenhum alerta</p>
        ) : recent.map(a => (
          <button
            key={a.id}
            onClick={() => onMarkAsRead?.(a.id)}
            className={`w-full text-left flex items-start gap-3 p-3 rounded-[8px] border transition-all ${SEV_BG[a.severity]} ${!a.read ? 'opacity-100' : 'opacity-60'}`}
          >
            <div className="mt-0.5">{ICONS[a.type] ?? ICONS.info}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-text-primary capitalize truncate">{a.commodity}</span>
                <Badge variant={SEV_VARIANT[a.severity]} size="sm">{a.severity}</Badge>
                {!a.read && <span className="w-1.5 h-1.5 rounded-[9999px] bg-agro-primary shrink-0" />}
              </div>
              <p className="text-xs text-text-secondary">{a.message}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(a.timestamp).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
