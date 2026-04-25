import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  showCharCount?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, helperText, required, showCharCount, isLoading, icon, type = 'text', maxLength, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
            {required && <span className="text-agro-danger ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            maxLength={maxLength}
            value={value}
            onChange={onChange}
            disabled={isLoading}
            className={cn(
              'w-full px-4 py-2 bg-surface border border-border rounded-[8px]',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-agro-primary focus:border-transparent',
              'transition-all duration-200',
              error   && 'border-agro-danger   focus:ring-agro-danger',
              success && 'border-agro-success  focus:ring-agro-success',
              isLoading && 'opacity-50 cursor-not-allowed',
              icon        && 'pl-10',
              (isPassword || error || success) && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Right slot: password toggle, or status icon */}
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : error ? (
            <AlertCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-agro-danger pointer-events-none" />
          ) : success ? (
            <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-agro-success pointer-events-none" />
          ) : null}
        </div>

        {/* Error / helper / char count */}
        {error     && <p className="text-xs text-agro-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
        {showCharCount && maxLength && (
          <p className="text-xs text-text-muted mt-1 text-right">
            <span className={charCount >= maxLength ? 'text-agro-danger' : ''}>{charCount}</span> / {maxLength}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
