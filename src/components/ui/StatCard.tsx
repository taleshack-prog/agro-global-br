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
  primary:   'border-l-[#10B981]',
  secondary: 'border-l-[#F59E0B]',
  accent:    'border-l-[#3B82F6]',
  danger:    'border-l-[#EF4444]',
  green:     'border-l-[#10B981]',
  red:       'border-l-[#EF4444]',
  blue:      'border-l-[#3B82F6]',
  yellow:    'border-l-[#F59E0B]',
};

export const StatCard = ({ label, value, subvalue, change, changeLabel, icon, accent }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral  = change !== undefined && change === 0;

  return (
    <div
      className={`bg-[#1e293b] border border-[#334155] rounded-[12px] ${accent ? `border-l-4 ${accentBorder[accent]}` : ''}`}
      style={{ padding: 'var(--spacing-lg)' }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">{label}</span>
        {icon && <div className="text-[#64748b]">{icon}</div>}
      </div>
      <div className="text-xl font-bold text-[#f1f5f9]" style={{ marginBottom: 'var(--spacing-xs)' }}>{value}</div>
      {subvalue && (
        <div className="text-xs text-[#94a3b8]" style={{ marginBottom: 'var(--spacing-xs)' }}>{subvalue}</div>
      )}
      {change !== undefined && (
        <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-[#10B981]' : isNegative ? 'text-[#EF4444]' : 'text-slate-400'}`} style={{ gap: 'var(--spacing-xs)' }}>
          {isPositive && <TrendingUp size={12} />}
          {isNegative && <TrendingDown size={12} />}
          {isNeutral  && <Minus size={12} />}
          <span>{isPositive ? '+' : ''}{change.toFixed(2)}% {changeLabel || 'hoje'}</span>
        </div>
      )}
    </div>
  );
};
