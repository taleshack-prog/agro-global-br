import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-[8px] border px-4 py-3 text-sm flex gap-3 items-start',
  {
    variants: {
      variant: {
        success: 'bg-agro-success/10 border-agro-success/30 text-agro-success',
        warning: 'bg-agro-warning/10 border-agro-warning/30 text-agro-warning',
        danger:  'bg-agro-danger/10  border-agro-danger/30  text-agro-danger',
        info:    'bg-agro-info/10    border-agro-info/30    text-agro-info',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

const ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle   size={18} className="shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="shrink-0 mt-0.5" />,
  danger:  <AlertCircle   size={18} className="shrink-0 mt-0.5" />,
  info:    <Info           size={18} className="shrink-0 mt-0.5" />,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(alertVariants({ variant, className }))}
      role="alert"
      {...props}
    >
      {ICONS[variant ?? 'info']}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-snug opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Fechar alerta"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };
