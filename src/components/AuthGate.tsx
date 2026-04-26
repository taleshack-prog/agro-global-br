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
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-agro-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={22} color="white" />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Carregando...</p>
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
