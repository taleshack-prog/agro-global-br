import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Show Home icon as first crumb */
  showHome?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = false, className }) => {
  const all: BreadcrumbItem[] = showHome
    ? [{ label: 'Início', icon: <Home size={13} /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center flex-wrap gap-1">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          const isClickable = !isLast && (item.href || item.onClick);

          return (
            <li key={i} className="flex items-center gap-1">
              {/* Separator */}
              {i > 0 && (
                <ChevronRight size={13} className="text-text-muted shrink-0" aria-hidden="true" />
              )}

              {/* Crumb */}
              {isClickable ? (
                item.href ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              ) : (
                <span
                  className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
