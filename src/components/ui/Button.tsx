import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  {
    variants: {
      variant: {
        primary:   'bg-agro-primary   text-white hover:bg-agro-primary/90   focus:ring-agro-primary   shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-primary)]',
        secondary: 'bg-agro-secondary text-white hover:bg-agro-secondary/90 focus:ring-agro-secondary shadow-[var(--shadow-xs)]',
        accent:    'bg-agro-accent    text-white hover:bg-agro-accent/90    focus:ring-agro-accent    shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-accent)]',
        outline:   'border-2 border-agro-primary text-agro-primary hover:bg-agro-primary/10 focus:ring-agro-primary',
        ghost:     'text-agro-primary hover:bg-agro-primary/10 focus:ring-agro-primary',
        danger:    'bg-agro-danger    text-white hover:bg-agro-danger/90    focus:ring-agro-danger    shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-danger)]',
        muted:     'bg-surface-3 text-text-primary hover:bg-[#475569] focus:ring-[#475569] shadow-[var(--shadow-xs)]',
      },
      size: {
        xs: 'px-2 py-1 text-xs  rounded-[4px]',
        sm: 'px-3 py-2 text-sm  rounded-[8px]',
        md: 'px-4 py-2 text-base rounded-[8px]',
        lg: 'px-6 py-3 text-lg  rounded-[12px]',
        xl: 'px-8 py-4 text-xl  rounded-[12px]',
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
