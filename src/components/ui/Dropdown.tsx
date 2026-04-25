import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;   // renders a separator line before this item
  danger?: boolean;    // renders the item in agro-danger color
}

interface DropdownProps {
  trigger?: React.ReactNode;
  /** Convenience: renders a default styled trigger button with label + chevron */
  label?: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  /** Highlight the item whose value matches this */
  selected?: string;
  disabled?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  label,
  items,
  onSelect,
  align = 'left',
  selected,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item.value);
    setIsOpen(false);
  };

  // Default trigger if no custom trigger provided
  const defaultTrigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium',
        'bg-surface-2 border border-border rounded-[8px]',
        'text-text-primary hover:bg-surface-3 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-agro-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isOpen && 'border-agro-primary bg-surface-3'
      )}
    >
      {label}
      <ChevronDown
        size={14}
        className={cn('text-text-muted transition-transform duration-200', isOpen && 'rotate-180')}
      />
    </button>
  );

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      >
        {trigger ?? defaultTrigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] w-max',
            'bg-surface-2 border border-border rounded-[12px]',
            'shadow-[var(--shadow-lg)]',
            'py-1 overflow-hidden',
            'animate-[fadeInUp_0.15s_ease-out]',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, i) => (
            <React.Fragment key={item.value}>
              {/* Divider */}
              {item.divider && i > 0 && (
                <div className="my-1 border-t border-border" />
              )}

              {/* Item */}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                  'transition-colors duration-100',
                  item.danger
                    ? 'text-agro-danger hover:bg-agro-danger/10'
                    : 'text-text-primary hover:bg-surface-3',
                  item.disabled && 'opacity-40 cursor-not-allowed',
                  selected === item.value && 'bg-agro-primary/10 text-agro-primary'
                )}
              >
                {/* Icon */}
                {item.icon && (
                  <span className="shrink-0 text-text-muted">{item.icon}</span>
                )}

                {/* Label */}
                <span className="flex-1">{item.label}</span>

                {/* Selected checkmark */}
                {selected === item.value && (
                  <Check size={14} className="shrink-0 text-agro-primary" />
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
