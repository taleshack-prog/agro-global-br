import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

interface Props { children: React.ReactNode; }

export function AuthGate({ children }: Props) {
  const { isAuthenticated, isHydrated } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-11 h-11 bg-agro-primary rounded-[14px] flex items-center justify-center shadow-[var(--shadow-primary)] animate-pulse">
          <TrendingUp size={22} className="text-white" />
        </div>
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return view === 'login'
      ? <LoginPage    onSwitchToRegister={() => setView('register')} />
      : <RegisterPage onSwitchToLogin={()    => setView('login')} />;
  }

  return <>{children}</>;
}
