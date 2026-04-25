import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-semibold',
  {
    variants: {
      variant: {
        default:   'bg-border      text-text-secondary',
        primary:   'bg-agro-primary/10   text-agro-primary',
        secondary: 'bg-agro-secondary/10 text-agro-secondary',
        success:   'bg-agro-success/10   text-agro-success',
        warning:   'bg-agro-warning/10   text-agro-warning',
        danger:    'bg-agro-danger/10    text-agro-danger',
        info:      'bg-agro-info/10      text-agro-info',
        accent:    'bg-agro-accent/10    text-agro-accent',
        // Legacy aliases kept for backward compatibility with existing module code
        green:  'bg-agro-primary/10   text-agro-primary',
        red:    'bg-agro-danger/10    text-agro-danger',
        yellow: 'bg-agro-secondary/10 text-agro-secondary',
        blue:   'bg-agro-accent/10    text-agro-accent',
        gray:   'bg-surface-3/50      text-text-secondary',
        purple: 'bg-purple-900/50     text-purple-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-[4px]',
        md: 'px-3 py-1   text-sm rounded-[9999px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
