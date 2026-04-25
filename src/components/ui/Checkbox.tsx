import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked'> {
  label?: string;
  description?: string;
  /** Three-state: true = checked, false = unchecked, 'indeterminate' = partial */
  checked?: boolean | 'indeterminate';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const sizeMap = {
  sm: { box: 'w-4 h-4', icon: 10, text: 'text-sm', desc: 'text-xs' },
  md: { box: 'w-5 h-5', icon: 12, text: 'text-sm', desc: 'text-xs' },
  lg: { box: 'w-6 h-6', icon: 14, text: 'text-base', desc: 'text-sm' },
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, size = 'md', error, onChange, disabled, ...props }, ref) => {
    const s = sizeMap[size];
    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    return (
      <label
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {/* Hidden native input (for form compat + keyboard) */}
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={isChecked || isIndeterminate}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />

        {/* Visual box */}
        <span
          className={cn(
            s.box,
            'shrink-0 mt-0.5 rounded-[4px] border-2 flex items-center justify-center',
            'transition-all duration-150',
            (isChecked || isIndeterminate)
              ? 'bg-agro-primary border-agro-primary'
              : 'border-border bg-surface group-hover:border-agro-primary/60',
            error && !(isChecked || isIndeterminate) && 'border-agro-danger'
          )}
        >
          {isIndeterminate && <Minus size={s.icon} className="text-white" strokeWidth={3} />}
          {isChecked      && <Check size={s.icon} className="text-white" strokeWidth={3} />}
        </span>

        {/* Label + description */}
        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && (
              <span className={cn(s.text, 'font-medium text-text-primary leading-tight')}>{label}</span>
            )}
            {description && (
              <span className={cn(s.desc, 'text-text-muted')}>{description}</span>
            )}
            {error && (
              <span className="text-xs text-agro-danger mt-0.5">{error}</span>
            )}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
