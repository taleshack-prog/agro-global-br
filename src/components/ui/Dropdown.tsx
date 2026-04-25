import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger?: React.ReactNode;
  label?: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  selected?: string;
  disabled?: boolean;
  className?: string;
}

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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter(i => !i.disabled && !i.divider);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(i => (i + 1) % enabledItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(i => (i - 1 + enabledItems.length) % enabledItems.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (enabledItems[focusedIndex]) {
            onSelect(enabledItems[focusedIndex].value);
            close();
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(enabledItems.length - 1);
          break;
      }
    };

    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, focusedIndex, enabledItems, onSelect, close]);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item.value);
    close();
  };

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
      <div
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      >
        {trigger ?? defaultTrigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] w-max',
            'bg-surface-2 border border-border rounded-[12px]',
            'shadow-[var(--shadow-lg)] py-1 overflow-hidden',
            'animate-[fadeInUp_0.15s_ease-out]',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, i) => {
            const enabledIdx = enabledItems.indexOf(item);
            return (
              <React.Fragment key={item.value}>
                {item.divider && i > 0 && <div className="my-1 border-t border-border" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-100',
                    item.danger
                      ? 'text-agro-danger hover:bg-agro-danger/10'
                      : 'text-text-primary hover:bg-surface-3',
                    item.disabled && 'opacity-40 cursor-not-allowed',
                    selected === item.value && 'bg-agro-primary/10 text-agro-primary',
                    enabledIdx === focusedIndex && 'bg-surface-3'
                  )}
                >
                  {item.icon && <span className="shrink-0 text-text-muted">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {selected === item.value && <Check size={14} className="shrink-0 text-agro-primary" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
