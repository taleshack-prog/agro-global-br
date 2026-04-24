import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-green-600 hover:bg-green-500 text-white border border-green-500',
  secondary: 'bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] border border-[#475569]',
  ghost: 'bg-transparent hover:bg-[#334155] text-[#94a3b8] border border-transparent',
  danger: 'bg-red-700 hover:bg-red-600 text-white border border-red-600',
  success: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600',
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
