import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Search, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  clearable = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Group options
  const grouped = filtered.reduce<Record<string, SelectOption[]>>((acc, opt) => {
    const g = opt.group ?? '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(opt);
    return acc;
  }, {});

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    close();
  };

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-2">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
          'bg-surface border border-border rounded-[8px]',
          'focus:outline-none focus:ring-2 focus:ring-agro-primary focus:border-transparent',
          'transition-all duration-200',
          isOpen && 'border-agro-primary ring-2 ring-agro-primary',
          error && 'border-agro-danger focus:ring-agro-danger',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {selected?.icon && <span className="shrink-0 text-text-muted">{selected.icon}</span>}
        <span className={cn('flex-1 truncate', selected ? 'text-text-primary' : 'text-text-muted')}>
          {selected?.label ?? placeholder}
        </span>

        {/* Clear button */}
        {clearable && value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onChange(''); }}
            className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </span>
        )}

        <ChevronDown
          size={14}
          className={cn('shrink-0 text-text-muted transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full',
            'bg-surface-2 border border-border rounded-[12px]',
            'shadow-[var(--shadow-lg)] overflow-hidden',
            'animate-[fadeInUp_0.15s_ease-out]'
          )}
        >
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-[8px] border border-border">
                <Search size={13} className="text-text-muted shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="flex-1 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-muted text-center">Nenhum resultado</p>
            ) : (
              Object.entries(grouped).map(([group, opts]) => (
                <React.Fragment key={group}>
                  {group && (
                    <p className="px-4 pt-2 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {group}
                    </p>
                  )}
                  {opts.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                        'transition-colors duration-100',
                        opt.value === value
                          ? 'bg-agro-primary/10 text-agro-primary'
                          : 'text-text-primary hover:bg-surface-3',
                        opt.disabled && 'opacity-40 cursor-not-allowed'
                      )}
                    >
                      {opt.icon && <span className="shrink-0 text-text-muted">{opt.icon}</span>}
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.value === value && <Check size={14} className="shrink-0 text-agro-primary" />}
                    </button>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error / Helper */}
      {error && <p className="text-xs text-agro-danger mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
    </div>
  );
};

export { Select };
