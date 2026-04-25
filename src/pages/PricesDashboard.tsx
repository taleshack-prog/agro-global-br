import { useState, useRef, useCallback } from 'react';
import { Wifi, WifiOff, TrendingUp, TrendingDown, LayoutGrid, List, AreaChart } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Select } from '../components/ui/Select';
import { PriceChart } from '../components/PriceChart';
import { useRealtimePrice, type PriceData } from '../hooks/useRealtimePrice';
import { useToast } from '../components/ui/Toast';

const ALL_COMMODITIES = [
  { value: 'soja',       label: 'Soja',        group: 'Grãos' },
  { value: 'milho',      label: 'Milho',       group: 'Grãos' },
  { value: 'cafe',       label: 'Café',        group: 'Grãos' },
  { value: 'algodao',    label: 'Algodão',     group: 'Fibra' },
  { value: 'gado',       label: 'Boi Gordo',   group: 'Proteína' },
  { value: 'leite',      label: 'Leite',       group: 'Lácteos' },
  { value: 'usd_brl',    label: 'USD/BRL',     group: 'Câmbio' },
  { value: 'soja_cbot',  label: 'Soja CBOT',   group: 'Internacional' },
  { value: 'milho_cbot', label: 'Milho CBOT',  group: 'Internacional' },
];

export const PricesDashboard = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState(['soja', 'milho', 'cafe', 'gado']);
  const [showArea, setShowArea] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [addValue, setAddValue] = useState('');

  // Debounce toast to avoid spam on every tick
  const lastToastRef = useRef<Record<string, number>>({});

  const onPriceUpdate = useCallback((d: PriceData) => {
    if (Math.abs(d.change_pct) <= 1) return;
    const now = Date.now();
    const last = lastToastRef.current[d.id] ?? 0;
    if (now - last < 30_000) return; // max 1 toast per commodity per 30s
    lastToastRef.current[d.id] = now;
    toast.warning(`${d.name}: ${d.change_pct > 0 ? '+' : ''}${d.change_pct.toFixed(2)}%`, 'Movimento significativo');
  }, [toast]);

  const { prices, isConnected, error, subscribe, unsubscribe } = useRealtimePrice({
    commodities: selected,
    onPriceUpdate,
  });

  const handleAdd = (val: string) => {
    if (!val || selected.includes(val)) return;
    setSelected(prev => [...prev, val]);
    subscribe(val);
    setAddValue('');
  };

  const handleRemove = (commodity: string) => {
    setSelected(prev => prev.filter(c => c !== commodity));
    unsubscribe(commodity);
  };

  const addOptions = ALL_COMMODITIES.filter(o => !selected.includes(o.value));

  return (
    <div className="space-y-6">
      {/* Header — static, no re-render on price tick */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <TrendingUp size={20} className="text-agro-primary" />
            Preços em Tempo Real
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-[9999px] ${isConnected ? 'bg-agro-primary animate-pulse' : 'bg-agro-danger'}`} />
            <span className={`text-xs font-medium ${isConnected ? 'text-agro-primary' : 'text-agro-danger'}`}>
              {isConnected ? 'Ao vivo — ws://localhost:8765' : 'Desconectado (mock data)'}
            </span>
            {isConnected ? <Wifi size={13} className="text-agro-primary" /> : <WifiOff size={13} className="text-agro-danger" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showArea ? 'primary' : 'muted'} size="sm" onClick={() => setShowArea(a => !a)} icon={<AreaChart size={14} />}>
            {showArea ? 'Área' : 'Linha'}
          </Button>
          <Button variant={view === 'grid' ? 'primary' : 'muted'} size="sm" onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} icon={view === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}>
            {view === 'grid' ? 'Grid' : 'Lista'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="warning" title="Price Service indisponível">
          {error} — inicie com: <code className="bg-surface px-1 rounded text-xs">bash services/run-price-service.sh</code>
        </Alert>
      )}

      {/* Add commodity */}
      <Card>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select label="Adicionar commodity" options={addOptions} value={addValue} onChange={handleAdd} placeholder="Selecionar..." searchable />
          </div>
        </div>
        {/* Active chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map(c => {
            const opt = ALL_COMMODITIES.find(o => o.value === c);
            const p = prices[c];
            const isPos = (p?.change_pct ?? 0) >= 0;
            return (
              <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-[8px] border border-border text-sm">
                {p && (isPos
                  ? <TrendingUp size={12} className="text-agro-primary" />
                  : <TrendingDown size={12} className="text-agro-danger" />
                )}
                <span className="text-text-primary font-medium">{opt?.label ?? c}</span>
                {p && (
                  <span className={`text-xs font-mono tabular-nums ${isPos ? 'text-agro-primary' : 'text-agro-danger'}`}>
                    {isPos ? '+' : ''}{p.change_pct.toFixed(2)}%
                  </span>
                )}
                <button onClick={() => handleRemove(c)} className="text-text-muted hover:text-agro-danger transition-colors ml-1 text-xs">✕</button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Charts — memo prevents full re-render on every tick */}
      <div className={view === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
        {selected.map(c => {
          const p = prices[c];
          if (!p) {
            return (
              <Card key={c} className="flex items-center justify-center" style={{ minHeight: 200 }}>
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-agro-primary border-t-transparent rounded-[9999px] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Aguardando {c}...</p>
                </div>
              </Card>
            );
          }
          return <PriceChart key={c} data={p} height={view === 'grid' ? 200 : 160} showArea={showArea} compact={view === 'list'} />;
        })}
      </div>

      {/* Price table */}
      <Card padding={false}>
        <div className="p-4 pb-0">
          <CardHeader title="Cotações Atuais" subtitle="Atualização em tempo real" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Ativo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Preço</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Variação</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Unidade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Fontes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {selected.map(c => {
                const p = prices[c];
                const opt = ALL_COMMODITIES.find(o => o.value === c);
                if (!p) return (
                  <tr key={c}><td colSpan={6} className="px-4 py-3 text-text-muted text-xs">{opt?.label ?? c} — carregando...</td></tr>
                );
                const isPos = p.change_pct >= 0;
                return (
                  <tr key={c} className="hover:bg-surface/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary font-bold">
                      {p.price.toFixed(p.price < 100 ? 4 : 2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono tabular-nums font-bold ${isPos ? 'text-agro-primary' : 'text-agro-danger'}`}>
                      {isPos ? '+' : ''}{p.change_pct.toFixed(3)}%
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{p.currency} / {p.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.sources.map(s => <Badge key={s} variant="gray" size="sm">{s}</Badge>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-text-muted">
                      {new Date(p.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
