import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: 'primary' | 'secondary' | 'accent' | 'danger' | 'green' | 'red' | 'blue' | 'yellow';
}

const accentBorder: Record<string, string> = {
  primary:   'border-l-agro-primary',
  secondary: 'border-l-agro-secondary',
  accent:    'border-l-agro-accent',
  danger:    'border-l-agro-danger',
  green:     'border-l-agro-primary',
  red:       'border-l-agro-danger',
  blue:      'border-l-agro-accent',
  yellow:    'border-l-agro-secondary',
};

export const StatCard = ({ label, value, subvalue, change, changeLabel, icon, accent }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral  = change !== undefined && change === 0;

  return (
    <div
      className={`bg-surface-2 border border-border rounded-[12px] ${accent ? `border-l-4 ${accentBorder[accent]}` : ''}`}
      style={{ padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <span className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</span>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
      <div className="text-xl font-bold text-text-primary" style={{ marginBottom: 'var(--spacing-xs)' }}>{value}</div>
      {subvalue && (
        <div className="text-xs text-text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>{subvalue}</div>
      )}
      {change !== undefined && (
        <div
          className={`flex items-center text-xs font-medium ${isPositive ? 'text-agro-primary' : isNegative ? 'text-agro-danger' : 'text-text-muted'}`}
          style={{ gap: 'var(--spacing-xs)' }}
        >
          {isPositive && <TrendingUp size={12} />}
          {isNegative && <TrendingDown size={12} />}
          {isNeutral  && <Minus size={12} />}
          <span>{isPositive ? '+' : ''}{change.toFixed(2)}% {changeLabel || 'hoje'}</span>
        </div>
      )}
    </div>
  );
};
