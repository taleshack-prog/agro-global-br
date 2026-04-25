import React from 'react';
import { cn } from '@/lib/utils';

// ─── Root ─────────────────────────────────────────────────────────────────────

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wraps the table in a scrollable container */
  scrollable?: boolean;
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, scrollable = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(scrollable && 'overflow-x-auto', className)}
      {...props}
    >
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

// ─── Head ─────────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b border-border', className)} {...props} />
  )
);
TableHead.displayName = 'TableHead';

// ─── Body ─────────────────────────────────────────────────────────────────────

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-border/50', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

// ─── Row ──────────────────────────────────────────────────────────────────────

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors duration-100',
        clickable && 'cursor-pointer hover:bg-surface-3/40',
        selected && 'bg-agro-primary/10 hover:bg-agro-primary/15',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

// ─── Header Cell ──────────────────────────────────────────────────────────────

interface TableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

const TableTh = React.forwardRef<HTMLTableCellElement, TableThProps>(
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

// ─── Data Cell ────────────────────────────────────────────────────────────────

interface TableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}

const TableTd = React.forwardRef<HTMLTableCellElement, TableTdProps>(
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

// ─── Footer ───────────────────────────────────────────────────────────────────

const TableFoot = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t border-border text-text-muted', className)} {...props} />
  )
);
TableFoot.displayName = 'TableFoot';

export { Table, TableHead, TableBody, TableFoot, TableRow, TableTh, TableTd };
