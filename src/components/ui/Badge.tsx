interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

const variants = {
  green: 'bg-green-900/50 text-green-400 border border-green-800/50',
  red: 'bg-red-900/50 text-red-400 border border-red-800/50',
  yellow: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800/50',
  blue: 'bg-blue-900/50 text-blue-400 border border-blue-800/50',
  gray: 'bg-slate-700/50 text-slate-400 border border-slate-600/50',
  purple: 'bg-purple-900/50 text-purple-400 border border-purple-800/50',
};

export const Badge = ({ children, variant = 'gray', size = 'sm' }: BadgeProps) => (
  <span className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${variants[variant]}`}>
    {children}
  </span>
);
