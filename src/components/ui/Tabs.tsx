import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  variant?: 'underline' | 'pills' | 'segment';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  value: controlledValue,
  onTabChange,
  children,
  variant = 'underline',
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.value);
  const activeTab = controlledValue ?? internalValue;

  const handleChange = (val: string) => {
    setInternalValue(val);
    onTabChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabled = tabs.filter(t => !t.disabled);
    const currentEnabled = enabled.findIndex(t => t.value === tabs[index].value);
    let next = currentEnabled;

    if      (e.key === 'ArrowRight') { e.preventDefault(); next = (currentEnabled + 1) % enabled.length; }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); next = (currentEnabled - 1 + enabled.length) % enabled.length; }
    else if (e.key === 'Home')       { e.preventDefault(); next = 0; }
    else if (e.key === 'End')        { e.preventDefault(); next = enabled.length - 1; }
    else return;

    handleChange(enabled[next].value);
  };

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        className={cn(
          'flex gap-1',
          variant === 'underline' && 'border-b border-border',
          variant === 'pills'     && 'gap-2',
          variant === 'segment'   && 'bg-surface-2 border border-border rounded-[12px] p-1'
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleChange(tab.value)}
              onKeyDown={e => handleKeyDown(e, index)}
              className={cn(
                'flex items-center gap-2 text-sm font-semibold transition-all duration-150',
                'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                variant === 'underline' && cn(
                  'px-4 py-3 border-b-2 -mb-px',
                  isActive ? 'border-agro-primary text-agro-primary' : 'border-transparent text-text-muted hover:text-text-primary'
                ),
                variant === 'pills' && cn(
                  'px-4 py-2 rounded-[9999px]',
                  isActive ? 'bg-agro-primary text-white' : 'text-text-muted hover:bg-surface-3 hover:text-text-primary'
                ),
                variant === 'segment' && cn(
                  'flex-1 justify-center px-4 py-2 rounded-[8px]',
                  isActive ? 'bg-agro-primary text-white shadow-[var(--shadow-sm)]' : 'text-text-muted hover:text-text-primary'
                ),
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  'min-w-[18px] h-[18px] rounded-[9999px] flex items-center justify-center px-1 text-xs font-bold',
                  isActive ? 'bg-white/30 text-white' : 'bg-agro-danger text-white'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {children && (
        <div role="tabpanel" className="pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export { Tabs };
