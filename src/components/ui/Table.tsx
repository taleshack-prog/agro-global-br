import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ─── Generic typed Table ──────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number) => void;
  onSelectAll?: (selected: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T>({
  columns, data, onRowClick,
  sortBy, sortOrder = 'asc', onSort,
  selectable, selectedRows = new Set(), onSelectRow, onSelectAll,
  loading, emptyMessage = 'Nenhum dado encontrado', className,
}: DataTableProps<T>) {
  const allSelected = selectedRows.size === data.length && data.length > 0;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return;
    const newOrder = sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newOrder);
  };

  return (
    <div className={cn('w-full overflow-x-auto border border-border rounded-[12px]', className)}>
      <table className="w-full text-sm border-collapse">
        <thead className="border-b border-border bg-surface">
          <tr>
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={e => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 rounded-[4px] border-2 border-border accent-[#10B981] cursor-pointer"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap',
                  col.align === 'right'  && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.width && `w-[${col.width}]`,
                  col.sortable && 'cursor-pointer select-none hover:text-text-primary'
                )}
                onClick={() => handleSort(col)}
              >
                <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                  {col.label}
                  {col.sortable && (
                    sortBy === col.key
                      ? sortOrder === 'asc'
                        ? <ChevronUp size={13} className="text-agro-primary" />
                        : <ChevronDown size={13} className="text-agro-primary" />
                      : <ChevronsUpDown size={13} className="opacity-40" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-[9999px] h-8 w-8 border-b-2 border-agro-primary" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors duration-100',
                  onRowClick && 'cursor-pointer hover:bg-surface-3/40',
                  selectedRows.has(rowIndex) && 'bg-agro-primary/10'
                )}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => onSelectRow?.(rowIndex)}
                      className="w-4 h-4 rounded-[4px] border-2 border-border accent-[#10B981] cursor-pointer"
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-text-primary',
                      col.align === 'right'  && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.mono && 'font-mono'
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key], row, rowIndex)
                      : String(row[col.key] ?? '–')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Primitive table sub-components (for custom layouts) ─────────────────────

const Table = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; scrollable?: boolean }>(
  ({ className, scrollable = true, children }, ref) => (
    <div ref={ref} className={cn(scrollable && 'overflow-x-auto', className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
);
Table.displayName = 'Table';

const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b border-border bg-surface', className)} {...props} />
  )
);
TableHead.displayName = 'TableHead';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-border/50', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableFoot = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t border-border text-text-muted', className)} {...props} />
  )
);
TableFoot.displayName = 'TableFoot';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean; clickable?: boolean }>(
  ({ className, selected, clickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors duration-100',
        clickable && 'cursor-pointer hover:bg-surface-3/40',
        selected && 'bg-agro-primary/10',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableTh = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }>(
  ({ className, align = 'left', ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
      {...props}
    />
  )
);
TableTh.displayName = 'TableTh';

const TableTd = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right'; mono?: boolean }>(
  ({ className, align = 'left', mono = false, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 text-text-primary',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        mono && 'font-mono',
        className
      )}
      {...props}
    />
  )
);
TableTd.displayName = 'TableTd';

export { DataTable, Table, TableHead, TableBody, TableFoot, TableRow, TableTh, TableTd };
