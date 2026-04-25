import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { PriceData } from '../../hooks/useRealtimePrice';

interface PriceWidgetProps {
  commodities: Record<string, PriceData>;
}

export const PriceWidget = memo(({ commodities }: PriceWidgetProps) => {
  const entries = Object.entries(commodities);

  // Chart from first commodity with history
  const chartData = useMemo(() => {
    const entry = entries.find(([, d]) => d.history?.length > 1);
    if (!entry) return [];
    return entry[1].history.slice(-20).map(p => ({
      time: new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: p.price,
      name: entry[0],
    }));
  }, [entries.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartColor = (() => {
    if (!entries.length) return '#10B981';
    const d = entries[0][1];
    return (d?.change_pct ?? 0) >= 0 ? '#10B981' : '#EF4444';
  })();

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Preços em Tempo Real"
        subtitle={`${entries.length} ativos monitorados`}
        icon={<TrendingUp size={16} />}
        action={
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-[9999px] bg-agro-primary animate-pulse" />
            <span className="text-xs text-agro-primary">Ao vivo</span>
          </div>
        }
      />

      {/* Price grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([id, d]) => {
          const isPos = (d.change_pct ?? 0) >= 0;
          return (
            <div key={id} className="p-3 bg-surface rounded-[8px] border border-border">
              <p className="text-xs text-text-muted font-semibold capitalize truncate">{d.name ?? id}</p>
              <p className="text-base font-bold text-text-primary mt-1 font-mono tabular-nums">
                {d.price.toFixed(d.price < 100 ? 4 : 2)}
              </p>
              <p className={`text-xs font-semibold mt-0.5 flex items-center gap-0.5 tabular-nums ${isPos ? 'text-agro-primary' : 'text-agro-danger'}`}>
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPos ? '+' : ''}{d.change_pct.toFixed(2)}%
              </p>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {d.sources?.slice(0, 2).map(s => <Badge key={s} variant="gray" size="sm">{s}</Badge>)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sparkline */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8', fontSize: 11 }}
              itemStyle={{ color: chartColor, fontSize: 11 }}
            />
            <Line type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {entries.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-text-muted text-sm">Aguardando dados do Price Service...</p>
        </div>
      )}
    </Card>
  );
}, (prev, next) => {
  const pk = Object.keys(prev.commodities);
  const nk = Object.keys(next.commodities);
  if (pk.length !== nk.length) return false;
  return pk.every(k =>
    prev.commodities[k]?.price === next.commodities[k]?.price &&
    prev.commodities[k]?.history?.length === next.commodities[k]?.history?.length
  );
});

PriceWidget.displayName = 'PriceWidget';
