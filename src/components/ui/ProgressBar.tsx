interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'info'
        | 'green' | 'blue' | 'yellow' | 'red' | 'purple'; // legacy kept
  showPercent?: boolean;
}

const colors: Record<string, string> = {
  primary:   'bg-[#10B981]',
  secondary: 'bg-[#F59E0B]',
  accent:    'bg-[#3B82F6]',
  danger:    'bg-[#EF4444]',
  warning:   'bg-[#F59E0B]',
  info:      'bg-[#3B82F6]',
  // legacy aliases
  green:     'bg-[#10B981]',
  blue:      'bg-[#3B82F6]',
  yellow:    'bg-[#F59E0B]',
  red:       'bg-[#EF4444]',
  purple:    'bg-purple-500',
};

export const ProgressBar = ({ value, max = 100, label, sublabel, color = 'primary', showPercent = true }: ProgressBarProps) => {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[#94a3b8]">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {sublabel && <span className="text-xs text-[#64748b]">{sublabel}</span>}
            {showPercent && <span className="text-xs font-semibold text-[#f1f5f9]">{percent.toFixed(0)}%</span>}
          </div>
        </div>
      )}
      <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] ?? colors.primary}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
