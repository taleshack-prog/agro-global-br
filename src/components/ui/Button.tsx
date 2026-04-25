import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
        xs: 'px-2 py-1   text-xs  rounded-[4px]  h-8',
        sm: 'px-3 py-2   text-sm  rounded-[8px]  h-10',
        md: 'px-4 py-2   text-base rounded-[8px] h-12',
        lg: 'px-6 py-3   text-lg  rounded-[12px] h-14',
        xl: 'px-8 py-4   text-xl  rounded-[12px] h-16',
      },
      fullWidth: {
        true:  'w-full',
        false: '',
      },
      isToggled: {
        true:  'ring-2 ring-offset-2 ring-agro-primary',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      isToggled: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  error?: string | null;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isToggled, isLoading = false, error = null, icon, children, disabled, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-invalid={!!error}
        className={cn(buttonVariants({
          variant: error ? 'danger' : variant,
          size,
          fullWidth,
          isToggled: isToggled ?? false,
          className,
        }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Carregando...
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
      {error && <p className="text-xs text-agro-danger">{error}</p>}
    </div>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
