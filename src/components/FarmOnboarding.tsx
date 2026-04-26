import { useState, type SyntheticEvent } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateFarmPayload, Farm } from '@/lib/apiClient';

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

interface Props {
  onCreate:   (payload: CreateFarmPayload) => Promise<Farm>;
  isCreating: boolean;
}

export function FarmOnboarding({ onCreate, isCreating }: Props) {
  const [name,     setName]     = useState('');
  const [city,     setCity]     = useState('');
  const [state,    setState]    = useState('MT');
  const [hectares, setHectares] = useState('');
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Informe o nome da fazenda.'); return; }
    try {
      await onCreate({ name: name.trim(), city: city.trim() || undefined, state: state || undefined, hectares: hectares ? parseFloat(hectares) : undefined });
    } catch (err: any) { setError(err.message ?? 'Erro ao cadastrar fazenda.'); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={26} color="var(--color-agro-primary)" />
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: '6px' }}>Cadastre sua fazenda</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '24px' }}>Para personalizar sua experiência, informe os dados básicos da propriedade.</p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#ef4444', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome da fazenda" placeholder="Ex: Fazenda Santa Maria" value={name} onChange={e => setName(e.target.value)} icon={<MapPin size={16} />} required disabled={isCreating} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px' }}>
            <Input label="Cidade" placeholder="Ex: Sorriso" value={city} onChange={e => setCity(e.target.value)} disabled={isCreating} />
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>UF</label>
              <select value={state} onChange={e => setState(e.target.value)} disabled={isCreating}
                style={{ width: '100%', height: '42px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '14px', padding: '0 8px' }}>
                {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Input label="Área (hectares)" type="number" placeholder="Ex: 800" value={hectares} onChange={e => setHectares(e.target.value)} disabled={isCreating} />
          <Button type="submit" fullWidth size="md" isLoading={isCreating}>Cadastrar fazenda</Button>
        </form>

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '16px' }}>Você pode adicionar mais propriedades depois em Configurações.</p>
      </div>
    </div>
  );
}
