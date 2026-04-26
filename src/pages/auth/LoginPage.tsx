import { useState, type SyntheticEvent } from 'react';
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface Props { onSwitchToRegister: () => void; }

export function LoginPage({ onSwitchToRegister }: Props) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    try { await login(email, password); }
    catch (err: any) { setError(err.message ?? 'Falha ao entrar.'); }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-agro-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>AgroGlobal</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>SuperApp B2B Agro</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Entrar na plataforma</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Não tem conta?{' '}
            <button type="button" onClick={onSwitchToRegister} style={{ color: 'var(--color-agro-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Criar conta grátis
            </button>
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '14px', color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="E-mail" type="email" placeholder="voce@fazenda.com.br" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} required autoComplete="email" disabled={isLoading} />
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={16} />} required autoComplete="current-password" disabled={isLoading} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Lembrar de mim</span>
              </label>
              <button type="button" style={{ fontSize: '12px', color: 'var(--color-agro-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Esqueci a senha</button>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} size="md">Entrar</Button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '12px' }}>Acesso demonstração</p>
            <button type="button" onClick={() => { setEmail('demo@agroglobal.com.br'); setPassword('demo1234'); }}
              style={{ width: '100%', fontSize: '12px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', background: 'none', cursor: 'pointer' }}>
              Preencher com credenciais demo
            </button>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '24px' }}>
          Ao entrar, você concorda com os{' '}
          <span style={{ color: 'var(--color-agro-primary)', cursor: 'pointer' }}>Termos de Uso</span>{' '}e{' '}
          <span style={{ color: 'var(--color-agro-primary)', cursor: 'pointer' }}>Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
