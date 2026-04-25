interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'info'
        | 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  showPercent?: boolean;
}

const colors: Record<string, string> = {
  primary:   'bg-agro-primary',
  secondary: 'bg-agro-secondary',
  accent:    'bg-agro-accent',
  danger:    'bg-agro-danger',
  warning:   'bg-agro-warning',
  info:      'bg-agro-info',
  green:     'bg-agro-primary',
  blue:      'bg-agro-accent',
  yellow:    'bg-agro-secondary',
  red:       'bg-agro-danger',
  purple:    'bg-purple-500',
};

export const ProgressBar = ({ value, max = 100, label, sublabel, color = 'primary', showPercent = true }: ProgressBarProps) => {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {sublabel && <span className="text-xs text-text-muted">{sublabel}</span>}
            {showPercent && <span className="text-xs font-semibold text-text-primary">{percent.toFixed(0)}%</span>}
          </div>
        </div>
      )}
      <div className="h-2 bg-surface rounded-[9999px] overflow-hidden">
        <div
          className={`h-full rounded-[9999px] transition-all duration-500 ${colors[color] ?? colors.primary}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
