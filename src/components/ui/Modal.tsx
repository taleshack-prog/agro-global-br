import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Prevent closing when clicking the backdrop */
  disableBackdropClose?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  full: 'max-w-5xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  disableBackdropClose = false,
  footer,
}) => {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={disableBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative bg-surface-2 border border-border rounded-[16px]',
          'shadow-[var(--shadow-xl)] w-full flex flex-col',
          'animate-[fadeInUp_0.2s_ease-out]',
          sizeClasses[size]
        )}
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors rounded-[8px] p-1 hover:bg-surface-3"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="px-6 py-4 overflow-y-auto flex-1 text-text-primary">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };
