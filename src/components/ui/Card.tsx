import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card = ({ children, className = '', padding = true }: CardProps) => (
  <div className={`bg-[#1e293b] border border-[#334155] rounded-[12px] ${padding ? 'p-5' : ''} ${className}`}>
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
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 rounded-[8px] bg-[#0f172a] text-[#10B981]">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-[#f1f5f9] leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
