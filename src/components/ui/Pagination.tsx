import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** How many page buttons to show around the current page */
  siblingCount?: number;
  className?: string;
  showTotal?: boolean;
  totalItems?: number;
  pageSize?: number;
}

function generatePages(current: number, total: number, siblings: number): (number | '...')[] {
  const range: number[] = [];

  for (let i = Math.max(2, current - siblings); i <= Math.min(total - 1, current + siblings); i++) {
    range.push(i);
  }

  const pages: (number | '...')[] = [1];
  if (range[0] > 2) pages.push('...');
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return pages;
}

const PageButton = ({
  page,
  active,
  disabled,
  onClick,
}: {
  page: number | '...';
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  if (page === '...') {
    return (
      <span className="flex items-center justify-center w-9 h-9 text-text-muted">
        <MoreHorizontal size={14} />
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-[8px] text-sm font-medium transition-all duration-150',
        active
          ? 'bg-agro-primary text-white shadow-[var(--shadow-primary)]'
          : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {page}
    </button>
  );
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  showTotal = false,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const pages = generatePages(currentPage, totalPages, siblingCount);

  const from = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const to   = pageSize ? Math.min(currentPage * pageSize, totalItems ?? 0) : undefined;

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Total info */}
      {showTotal && totalItems !== undefined && (
        <p className="text-xs text-text-muted shrink-0">
          {from}–{to} de <span className="font-semibold text-text-primary">{totalItems}</span>
        </p>
      )}

      {/* Pages */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Prev */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-[8px] text-text-secondary',
            'hover:bg-surface-3 hover:text-text-primary transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page, i) => (
          <PageButton
            key={`${page}-${i}`}
            page={page}
            active={page === currentPage}
            disabled={page === '...'}
            onClick={page !== '...' ? () => onPageChange(page as number) : undefined}
          />
        ))}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-[8px] text-text-secondary',
            'hover:bg-surface-3 hover:text-text-primary transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export { Pagination };
