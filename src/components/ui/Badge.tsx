interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'info' | 'gray' | 'purple'
    | 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  primary:   'bg-agro-primary/20   text-agro-primary   border border-agro-primary/40',
  secondary: 'bg-agro-secondary/20 text-agro-secondary border border-agro-secondary/40',
  accent:    'bg-agro-accent/20    text-agro-accent    border border-agro-accent/40',
  danger:    'bg-agro-danger/20    text-agro-danger    border border-agro-danger/40',
  warning:   'bg-agro-warning/20   text-agro-warning   border border-agro-warning/40',
  info:      'bg-agro-info/20      text-agro-info      border border-agro-info/40',
  gray:      'bg-surface-3/50      text-text-secondary border border-surface-3',
  purple:    'bg-purple-900/50     text-purple-300     border border-purple-700/50',
  // Legacy aliases
  green:     'bg-agro-primary/20   text-agro-primary   border border-agro-primary/40',
  red:       'bg-agro-danger/20    text-agro-danger    border border-agro-danger/40',
  yellow:    'bg-agro-secondary/20 text-agro-secondary border border-agro-secondary/40',
  blue:      'bg-agro-accent/20    text-agro-accent    border border-agro-accent/40',
};

export const Badge = ({ children, variant = 'gray', size = 'sm' }: BadgeProps) => (
  <span className={`inline-flex items-center font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs rounded-[4px]' : 'px-3 py-1 text-sm rounded-[8px]'} ${variants[variant] ?? variants.gray}`}>
    {children}
  </span>
);
