import { useState } from 'react';
import { TrendingUp, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface Props { onSwitchToLogin: () => void; }
type Role = 'producer' | 'trader';
const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'producer', label: 'Produtor / Cooperativa', desc: 'Vendo minha produção' },
  { value: 'trader',   label: 'Trading / Indústria',    desc: 'Compro e origino grãos' },
];

export function RegisterPage({ onSwitchToLogin }: Props) {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', phone:'', cpfCnpj:'', role: 'producer' as Role });
  const [error, setError] = useState<string | null>(null);
  const [step, setStep]   = useState<1|2>(1);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim() || form.name.length < 2) return 'Informe seu nome completo.';
    if (!form.email.includes('@'))                  return 'E-mail inválido.';
    if (form.password.length < 8)                   return 'Senha deve ter no mínimo 8 caracteres.';
    if (form.password !== form.confirm)             return 'As senhas não coincidem.';
    return null;
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null); setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try { await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone || undefined, cpfCnpj: form.cpfCnpj || undefined }); }
    catch (err: any) { setError(err.message ?? 'Falha ao criar conta. Tente novamente.'); }
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
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-text-primary">Criar conta gratuita</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-agro-primary" />
              <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-agro-primary' : 'bg-surface-3'}`} />
            </div>
          </div>
          <p className="text-sm text-text-muted mb-6">
            {step === 1 ? 'Dados de acesso' : 'Perfil e tipo de conta'} · Já tem conta?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-agro-primary hover:underline font-semibold">Entrar</button>
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-agro-danger/10 border border-agro-danger/30 rounded-[8px] px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-agro-danger shrink-0" />
              <p className="text-sm text-agro-danger">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToStep2} className="space-y-4">
              <Input label="Nome completo" placeholder="João da Silva" value={form.name} onChange={set('name')} icon={<User size={16} />} required disabled={isLoading} />
              <Input label="E-mail" type="email" placeholder="voce@fazenda.com.br" value={form.email} onChange={set('email')} icon={<Mail size={16} />} required autoComplete="email" disabled={isLoading} />
              <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} icon={<Lock size={16} />} required autoComplete="new-password" disabled={isLoading} success={form.password.length >= 8} />
              <Input label="Confirmar senha" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} icon={<Lock size={16} />} required disabled={isLoading}
                success={form.confirm.length >= 8 && form.confirm === form.password}
                error={form.confirm && form.confirm !== form.password ? 'Senhas não coincidem' : null} />
              <Button type="submit" fullWidth size="md" className="mt-2">Continuar</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Tipo de conta <span className="text-agro-danger">*</span></label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                      className={`flex items-center justify-between p-4 rounded-[10px] border text-left transition-all ${form.role === r.value ? 'border-agro-primary bg-agro-primary/10 text-text-primary' : 'border-border bg-surface hover:border-border/80 text-text-secondary'}`}>
                      <div>
                        <div className="text-sm font-semibold">{r.label}</div>
                        <div className="text-xs text-text-muted mt-0.5">{r.desc}</div>
                      </div>
                      {form.role === r.value && <CheckCircle size={18} className="text-agro-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Telefone (opcional)" type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} disabled={isLoading} />
              <Input label="CPF / CNPJ (opcional)" placeholder="000.000.000-00" value={form.cpfCnpj} onChange={set('cpfCnpj')} disabled={isLoading} />
              <div className="flex gap-3 mt-2">
                <Button type="button" variant="muted" size="md" className="flex-1" onClick={() => { setError(null); setStep(1); }} disabled={isLoading}>Voltar</Button>
                <Button type="submit" size="md" className="flex-1" isLoading={isLoading}>Criar conta</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
