import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card = ({ children, className = '', padding = true }: CardProps) => (
  <div
    className={`bg-[#1e293b] border border-[#334155] rounded-[12px] ${className}`}
    style={padding ? { padding: 'var(--spacing-lg)' } : undefined}
  >
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader = ({ title, subtitle, action, icon }: CardHeaderProps) => (
  <div
    className="flex items-start justify-between"
    style={{ marginBottom: 'var(--spacing-md)' }}
  >
    <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
      {icon && (
        <div
          className="rounded-[8px] bg-[#0f172a] text-[#10B981]"
          style={{ padding: 'var(--spacing-sm)' }}
        >
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-[#f1f5f9] leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#64748b]" style={{ marginTop: 'var(--spacing-xs)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
