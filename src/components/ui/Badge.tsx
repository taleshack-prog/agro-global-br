interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'info' | 'gray' | 'purple'
    | 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  primary:   'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40',
  secondary: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40',
  accent:    'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40',
  danger:    'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40',
  warning:   'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40',
  info:      'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40',
  gray:      'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  purple:    'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  green:     'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40',
  red:       'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40',
  yellow:    'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40',
  blue:      'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40',
};

export const Badge = ({ children, variant = 'gray', size = 'sm' }: BadgeProps) => (
  <span className={`inline-flex items-center font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs rounded-[4px]' : 'px-3 py-1 text-sm rounded-[8px]'} ${variants[variant] ?? variants.gray}`}>
    {children}
  </span>
);
