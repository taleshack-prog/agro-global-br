import { useState } from 'react';
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface Props { onSwitchToRegister: () => void; }

export function LoginPage({ onSwitchToRegister }: Props) {
  const { login, isLoading } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    try { await login(email, password); }
    catch (err: any) { setError(err.message ?? 'Falha ao entrar. Verifique suas credenciais.'); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-agro-primary rounded-[14px] flex items-center justify-center shadow-[var(--shadow-primary)]">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary leading-tight">AgroGlobal</div>
            <div className="text-xs text-text-muted">SuperApp B2B Agro</div>
          </div>
        </div>

        <div className="bg-surface-2 border border-border rounded-[16px] p-8 shadow-[var(--shadow-xl)]">
          <h1 className="text-lg font-bold text-text-primary mb-1">Entrar na plataforma</h1>
          <p className="text-sm text-text-muted mb-6">
            Não tem conta?{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-agro-primary hover:underline font-semibold">
              Criar conta grátis
            </button>
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-agro-danger/10 border border-agro-danger/30 rounded-[8px] px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-agro-danger shrink-0" />
              <p className="text-sm text-agro-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="E-mail" type="email" placeholder="voce@fazenda.com.br"
              value={email} onChange={e => setEmail(e.target.value)}
              icon={<Mail size={16} />} required autoComplete="email" disabled={isLoading} />
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => setPassword(e.target.value)}
              icon={<Lock size={16} />} required autoComplete="current-password" disabled={isLoading} />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-agro-primary" />
                <span className="text-xs text-text-muted">Lembrar de mim</span>
              </label>
              <button type="button" className="text-xs text-agro-accent hover:underline">Esqueci a senha</button>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} size="md" className="mt-2">Entrar</Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">Acesso demonstração</p>
            <button type="button"
              onClick={() => { setEmail('demo@agroglobal.com.br'); setPassword('demo1234'); }}
              className="w-full text-xs text-text-secondary border border-border rounded-[8px] py-2 hover:bg-surface transition-colors">
              Preencher com credenciais demo
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-6">
          Ao entrar, você concorda com os{' '}
          <span className="text-agro-primary cursor-pointer hover:underline">Termos de Uso</span>
          {' '}e{' '}
          <span className="text-agro-primary cursor-pointer hover:underline">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
