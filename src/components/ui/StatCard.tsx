import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'red' | 'blue' | 'yellow';
}

const accentColors = {
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  blue: 'border-l-blue-500',
  yellow: 'border-l-yellow-500',
};

export const StatCard = ({ label, value, subvalue, change, changeLabel, icon, accent }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div className={`bg-[#1e293b] border border-[#334155] rounded-xl p-4 ${accent ? `border-l-4 ${accentColors[accent]}` : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">{label}</span>
        {icon && <div className="text-[#64748b]">{icon}</div>}
      </div>
      <div className="text-xl font-bold text-[#f1f5f9] mb-1">{value}</div>
      {subvalue && <div className="text-xs text-[#94a3b8] mb-1">{subvalue}</div>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
          {isPositive && <TrendingUp size={12} />}
          {isNegative && <TrendingDown size={12} />}
          {isNeutral && <Minus size={12} />}
          <span>{isPositive ? '+' : ''}{change.toFixed(2)}% {changeLabel || 'hoje'}</span>
        </div>
      )}
    </div>
  );
};
