import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  {
    variants: {
      variant: {
        primary:   'bg-[#10B981] text-white hover:bg-[#10B981]/90 focus:ring-[#10B981] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-primary)]',
        secondary: 'bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 focus:ring-[#F59E0B] shadow-[var(--shadow-xs)]',
        accent:    'bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 focus:ring-[#3B82F6] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-accent)]',
        outline:   'border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 focus:ring-[#10B981]',
        ghost:     'text-[#10B981] hover:bg-[#10B981]/10 focus:ring-[#10B981]',
        danger:    'bg-[#EF4444] text-white hover:bg-[#EF4444]/90 focus:ring-[#EF4444] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-danger)]',
        muted:     'bg-[#334155] text-[#f1f5f9] hover:bg-[#475569] focus:ring-[#475569] shadow-[var(--shadow-xs)]',
      },
      size: {
        xs: 'px-2 py-1 text-xs rounded-[4px]',
        sm: 'px-3 py-2 text-sm rounded-[8px]',
        md: 'px-4 py-2 text-base rounded-[8px]',
        lg: 'px-6 py-3 text-lg rounded-[12px]',
        xl: 'px-8 py-4 text-xl rounded-[12px]',
      },
      fullWidth: {
        true:  'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
