import React from 'react';
import { cn } from '@/lib/utils';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface-2 border border-border rounded-[12px]',
        'shadow-[var(--shadow-md)]',
        padding && 'p-[var(--spacing-lg)]',
        hover && 'hover:shadow-[var(--shadow-lg)] hover:border-border/80 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ─── CardHeader ───────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const CardHeader = ({ title, subtitle, action, icon, className }: CardHeaderProps) => (
  <div className={cn('flex items-start justify-between mb-[var(--spacing-md)]', className)}>
    <div className="flex items-center gap-[var(--spacing-md)]">
      {icon && (
        <div className="p-[var(--spacing-sm)] rounded-[8px] bg-surface text-agro-primary shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-text-primary leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-muted mt-[var(--spacing-xs)]">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0 ml-3">{action}</div>}
  </div>
);

// ─── CardContent ──────────────────────────────────────────────────────────────

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-[var(--spacing-lg)] pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// ─── CardFooter ───────────────────────────────────────────────────────────────

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-[var(--spacing-lg)] pt-0 border-t border-border mt-[var(--spacing-lg)]',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
