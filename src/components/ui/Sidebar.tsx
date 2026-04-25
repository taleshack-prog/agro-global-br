import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'danger' | 'primary' | 'secondary';
  color?: string;        // active icon color class e.g. 'text-agro-primary'
  bgActive?: string;     // active bg+border classes
  disabled?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  /** Logo / brand area */
  header?: React.ReactNode;
  /** Info area below header (e.g. current farm) */
  info?: React.ReactNode;
  /** Navigation sections */
  sections: SidebarSection[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Footer area (settings, user profile) */
  footer?: React.ReactNode;
  /** Mobile: controlled open state */
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

const NavItem: React.FC<{
  item: SidebarItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}> = ({ item, isActive, onSelect }) => {
  const badgeColors: Record<string, string> = {
    danger:    'bg-agro-danger text-white',
    primary:   'bg-agro-primary text-white',
    secondary: 'bg-agro-secondary text-white',
  };

  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={() => !item.disabled && onSelect(item.id)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-[12px] text-left',
        'transition-all duration-150 border',
        isActive
          ? cn(item.bgActive ?? 'bg-agro-primary/10 border-agro-primary/40', item.color ?? 'text-agro-primary')
          : 'hover:bg-surface-2 text-text-secondary border-transparent hover:text-text-primary',
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <span className={cn('shrink-0', isActive && (item.color ?? 'text-agro-primary'))}>
        {item.icon}
      </span>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium leading-tight', isActive && 'text-text-primary')}>
          {item.label}
        </p>
        {item.sublabel && (
          <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
        )}
      </div>

      {/* Badge */}
      {item.badge !== undefined && (
        <span
          className={cn(
            'shrink-0 min-w-[18px] h-[18px] rounded-[9999px] flex items-center justify-center px-1 text-xs font-bold',
            badgeColors[item.badgeVariant ?? 'danger']
          )}
        >
          {item.badge}
        </span>
      )}

      {isActive && (
        <ChevronRight size={14} className={cn('shrink-0', item.color ?? 'text-agro-primary')} />
      )}
    </button>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({
  header,
  info,
  sections,
  activeId,
  onSelect,
  footer,
  open = true,
  onClose,
  className,
}) => (
  <>
    {/* Mobile overlay */}
    {onClose && open && (
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    )}

    {/* Panel */}
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col',
        'transform transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0',
        className
      )}
      aria-label="Navegação principal"
    >
      {/* Header */}
      {header && (
        <div className="shrink-0 border-b border-border">
          {header}
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 lg:hidden text-text-muted hover:text-text-primary transition-colors"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Info slot */}
      {info && <div className="shrink-0">{info}</div>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 mb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  onSelect={(id) => { onSelect(id); onClose?.(); }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 border-t border-border">
          {footer}
        </div>
      )}
    </aside>
  </>
);

export { Sidebar };
