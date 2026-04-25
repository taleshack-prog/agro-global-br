/**
 * Toast / Notification system
 *
 * Usage:
 *   1. Wrap your app with <ToastProvider />
 *   2. Call useToast() hook anywhere:
 *        const { toast } = useToast()
 *        toast.success('Contrato assinado!')
 *        toast.error('Falha ao enviar proposta')
 *        toast.warning('Prazo se aproximando')
 *        toast.info('Novos preços disponíveis')
 */

import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

type Action =
  | { type: 'ADD'; toast: ToastItem }
  | { type: 'REMOVE'; id: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast].slice(-5); // max 5
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastItem[];
  dispatch: React.Dispatch<Action>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(reducer, []);

  return (
    <ToastContext.Provider value={{ toasts, dispatch }}>
      {children}
      <ToastViewport toasts={toasts} dispatch={dispatch} />
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  const { dispatch } = ctx;

  const show = useCallback((variant: ToastVariant, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'ADD', toast: { id, variant, title, message, duration } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    }
  }, [dispatch]);

  return {
    toast: {
      success: (message: string, title?: string) => show('success', message, title),
      error:   (message: string, title?: string) => show('error',   message, title),
      warning: (message: string, title?: string) => show('warning', message, title),
      info:    (message: string, title?: string) => show('info',    message, title),
      custom:  (variant: ToastVariant, message: string, title?: string, duration?: number) =>
        show(variant, message, title, duration),
    },
  };
}

// ─── Viewport (rendered at root) ─────────────────────────────────────────────

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle  size={18} />,
  error:   <AlertCircle  size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info          size={18} />,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-agro-success/30 text-agro-success',
  error:   'border-agro-danger/30  text-agro-danger',
  warning: 'border-agro-warning/30 text-agro-warning',
  info:    'border-agro-info/30    text-agro-info',
};

const ToastViewport: React.FC<{ toasts: ToastItem[]; dispatch: React.Dispatch<Action> }> = ({
  toasts,
  dispatch,
}) => (
  <div
    className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
    aria-label="Notificações"
  >
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={cn(
          'pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm',
          'bg-surface-2 border rounded-[12px] px-4 py-3',
          'shadow-[var(--shadow-xl)]',
          'animate-[fadeInUp_0.25s_ease-out]',
          STYLES[toast.variant]
        )}
        role="alert"
      >
        <span className="shrink-0 mt-0.5">{ICONS[toast.variant]}</span>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
          )}
          <p className={cn('text-sm', toast.title ? 'text-text-secondary mt-0.5' : 'text-text-primary')}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'REMOVE', id: toast.id })}
          className="shrink-0 mt-0.5 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Fechar notificação"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);
