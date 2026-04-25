import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-2 bg-surface border border-border rounded-[8px] text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-agro-primary focus:border-transparent',
          'transition-all duration-200',
          error && 'border-agro-danger focus:ring-agro-danger',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-sm text-agro-danger mt-1">{error}</p>}
      {helperText && <p className="text-sm text-text-muted mt-1">{helperText}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
