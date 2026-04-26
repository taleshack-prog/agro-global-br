import { useState } from 'react';
import { User, LogOut, CreditCard, ChevronUp, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PLAN_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  basic:      { label: 'Básico',     color: 'text-text-muted',    icon: null },
  pro:        { label: 'Pro',        color: 'text-agro-secondary', icon: <Zap size={11} /> },
  enterprise: { label: 'Enterprise', color: 'text-agro-accent',   icon: <Crown size={11} /> },
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const plan = PLAN_META[user.subscriptionPlan ?? 'basic'] ?? PLAN_META.basic;
  const initials = user.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="relative">
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-surface-2 border border-border rounded-[12px] shadow-[var(--shadow-xl)] overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="text-sm font-semibold text-text-primary truncate">{user.name}</div>
              <div className="text-xs text-text-muted truncate">{user.email}</div>
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${plan.color}`}>
                {plan.icon} Plano {plan.label}
                {user.subscriptionStatus === 'active'
                  ? <span className="ml-1 text-agro-primary">· Ativo</span>
                  : <span className="ml-1 text-agro-danger">· Inativo</span>}
              </div>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors" onClick={() => setOpen(false)}>
                <CreditCard size={15} /> Gerenciar assinatura
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm text-agro-danger hover:bg-agro-danger/10 transition-colors" onClick={() => { setOpen(false); logout(); }}>
                <LogOut size={15} /> Sair da conta
              </button>
            </div>
          </div>
        </>
      )}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-surface-2 transition-colors">
        <div className="w-7 h-7 bg-agro-primary rounded-full flex items-center justify-center shrink-0">
          {initials ? <span className="text-xs font-bold text-white">{initials}</span> : <User size={14} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-semibold text-text-primary truncate">{user.name}</div>
          <div className={`text-xs flex items-center gap-1 ${plan.color}`}>{plan.icon}{plan.label}</div>
        </div>
        <ChevronUp size={14} className={`text-text-muted transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}
