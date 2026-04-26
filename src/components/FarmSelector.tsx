import { useState } from 'react';
import { MapPin, ChevronDown, Plus, Check } from 'lucide-react';
import type { Farm } from '@/lib/apiClient';

interface Props {
  farms:    Farm[];
  selected: Farm | null;
  onSelect: (farm: Farm) => void;
  onAddNew: () => void;
}

export function FarmSelector({ farms, selected, onSelect, onAddNew }: Props) {
  const [open, setOpen] = useState(false);

  if (!selected) {
    return (
      <div style={{ margin: '0 16px 12px', padding: '12px', backgroundColor: 'var(--color-surface-2)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Nenhuma fazenda</div>
        <button onClick={onAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-agro-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Plus size={14} /> Cadastrar fazenda
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 16px 12px', position: 'relative' }}>
      <button onClick={() => farms.length > 1 && setOpen(o => !o)}
        style={{ width: '100%', padding: '12px', backgroundColor: 'var(--color-surface-2)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: farms.length > 1 ? 'pointer' : 'default', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Fazenda Selecionada</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
              {[selected.city, selected.state].filter(Boolean).join(', ')}
              {selected.hectares && ` · ${parseFloat(selected.hectares).toLocaleString('pt-BR')} ha`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-agro-primary)' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-agro-primary)' }}>Dados em tempo real</span>
            </div>
          </div>
          {farms.length > 1 && <ChevronDown size={14} color="var(--color-text-muted)" style={{ marginTop: '2px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
        </div>
      </button>

      {open && farms.length > 1 && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20, backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
            {farms.map(farm => (
              <button key={farm.id} onClick={() => { onSelect(farm); setOpen(false); }}
                style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: farm.id === selected.id ? 'rgba(16,185,129,0.08)' : 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left' }}>
                <MapPin size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{farm.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{[farm.city, farm.state].filter(Boolean).join(', ')}{farm.hectares && ` · ${parseFloat(farm.hectares).toLocaleString('pt-BR')} ha`}</div>
                </div>
                {farm.id === selected.id && <Check size={14} color="var(--color-agro-primary)" />}
              </button>
            ))}
            <button onClick={() => { onAddNew(); setOpen(false); }} style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
              <Plus size={14} color="var(--color-agro-primary)" />
              <span style={{ fontSize: '13px', color: 'var(--color-agro-primary)', fontWeight: 600 }}>Adicionar fazenda</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
