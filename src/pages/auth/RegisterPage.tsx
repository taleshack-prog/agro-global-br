import { useState, type SyntheticEvent, type ChangeEvent, type CSSProperties } from 'react';
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
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', cpfCnpj: '', role: 'producer' as Role });
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim() || form.name.length < 2) return 'Informe seu nome completo.';
    if (!form.email.includes('@')) return 'E-mail inválido.';
    if (form.password.length < 8) return 'Senha deve ter no mínimo 8 caracteres.';
    if (form.password !== form.confirm) return 'As senhas não coincidem.';
    return null;
  };

  const goToStep2 = (e: SyntheticEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null); setStep(2);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault(); setError(null);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone || undefined, cpfCnpj: form.cpfCnpj || undefined });
    } catch (err: any) { setError(err.message ?? 'Falha ao criar conta.'); }
  };

  const card: CSSProperties = {
    backgroundColor: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '32px',
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

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Criar conta gratuita</h1>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-agro-primary)' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: step === 2 ? 'var(--color-agro-primary)' : 'var(--color-surface-3)' }} />
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            {step === 1 ? 'Dados de acesso' : 'Perfil e tipo de conta'} · Já tem conta?{' '}
            <button type="button" onClick={onSwitchToLogin} style={{ color: 'var(--color-agro-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Entrar
            </button>
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '14px', color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Nome completo" placeholder="João da Silva" value={form.name} onChange={set('name')} icon={<User size={16} />} required disabled={isLoading} />
              <Input label="E-mail" type="email" placeholder="voce@fazenda.com.br" value={form.email} onChange={set('email')} icon={<Mail size={16} />} required autoComplete="email" disabled={isLoading} />
              <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} icon={<Lock size={16} />} required disabled={isLoading} success={form.password.length >= 8} />
              <Input label="Confirmar senha" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} icon={<Lock size={16} />} required disabled={isLoading}
                success={form.confirm.length >= 8 && form.confirm === form.password}
                error={form.confirm && form.confirm !== form.password ? 'Senhas não coincidem' : null} />
              <Button type="submit" fullWidth size="md">Continuar</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Tipo de conta <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                        border: form.role === r.value ? '1px solid var(--color-agro-primary)' : '1px solid var(--color-border)',
                        backgroundColor: form.role === r.value ? 'rgba(16,185,129,0.1)' : 'var(--color-surface)',
                      }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{r.desc}</div>
                      </div>
                      {form.role === r.value && <CheckCircle size={18} color="var(--color-agro-primary)" />}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Telefone (opcional)" type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} disabled={isLoading} />
              <Input label="CPF / CNPJ (opcional)" placeholder="000.000.000-00" value={form.cpfCnpj} onChange={set('cpfCnpj')} disabled={isLoading} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="button" variant="muted" size="md" style={{ flex: 1 }} onClick={() => { setError(null); setStep(1); }} disabled={isLoading}>Voltar</Button>
                <Button type="submit" size="md" style={{ flex: 1 }} isLoading={isLoading}>Criar conta</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
