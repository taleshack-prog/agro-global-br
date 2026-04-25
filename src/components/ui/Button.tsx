import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary:   'bg-[#10B981] hover:bg-[#059669] text-white border border-[#10B981]',
  secondary: 'bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] border border-[#475569]',
  ghost:     'bg-transparent hover:bg-[#334155] text-[#94a3b8] border border-transparent',
  danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444]',
  success:   'bg-[#10B981] hover:bg-[#059669] text-white border border-[#10B981]',
  warning:   'bg-[#F59E0B] hover:bg-[#D97706] text-white border border-[#F59E0B]',
  info:      'bg-[#3B82F6] hover:bg-[#2563EB] text-white border border-[#3B82F6]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export const Button = ({ variant = 'secondary', size = 'md', className = '', children, ...props }: ButtonProps) => (
  <button
    className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
