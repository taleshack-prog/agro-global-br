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
        <label className="block text-sm font-semibold text-[#f1f5f9] mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-[8px] text-[#f1f5f9] placeholder-[#64748b]',
          'focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent',
          'transition-all duration-200',
          error && 'border-[#EF4444] focus:ring-[#EF4444]',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#EF4444] mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[#64748b] mt-1">{helperText}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
