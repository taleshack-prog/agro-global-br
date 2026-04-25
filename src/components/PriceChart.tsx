import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import type { PriceData } from '../hooks/useRealtimePrice';

interface PriceChartProps {
  data: PriceData;
  height?: number;
  showArea?: boolean;
  compact?: boolean;
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-[8px] px-3 py-2 shadow-[var(--shadow-lg)]">
      <p className="text-xs text-text-muted">{payload[0].payload.time}</p>
      <p className="text-sm font-bold text-text-primary">
        {Number(payload[0].value).toFixed(4)} {currency}
      </p>
    </div>
  );
};

export const PriceChart = ({ data, height = 240, showArea = false, compact = false }: PriceChartProps) => {
  const isPositive = data.change_pct >= 0;
  const color = isPositive ? '#10B981' : '#EF4444';

  const chartData = useMemo(() =>
    data.history.map((p, i) => ({
      time: new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: p.price,
      index: i,
    })),
    [data.history]
  );

  const domainMin = Math.min(...data.history.map(h => h.price)) * 0.999;
  const domainMax = Math.max(...data.history.map(h => h.price)) * 1.001;

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-bold text-text-primary ${compact ? 'text-sm' : 'text-base'}`}>{data.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-bold text-text-primary ${compact ? 'text-xl' : 'text-2xl'}`}>
              {data.price.toFixed(data.currency === 'USD' && data.price < 100 ? 4 : 2)}
            </span>
            <span className="text-xs text-text-muted">{data.currency} / {data.unit}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-agro-primary' : 'text-agro-danger'}`}>
            {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            <span className={compact ? 'text-sm' : 'text-base'}>
              {isPositive ? '+' : ''}{data.change_pct.toFixed(3)}%
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-text-muted mt-0.5">
              Anterior: {data.prev_price?.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center gap-2 flex-wrap">
        {data.sources.map(s => (
          <Badge key={s} variant="gray" size="sm">{s}</Badge>
        ))}
        <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
          <Clock size={11} />
          {new Date(data.timestamp).toLocaleTimeString('pt-BR')}
        </span>
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <ResponsiveContainer width="100%" height={height}>
          {showArea ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[domainMin, domainMax]} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<CustomTooltip currency={data.currency} />} />
              <Area type="monotone" dataKey="price" stroke={color} fill={`url(#grad-${data.id})`} strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[domainMin, domainMax]} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<CustomTooltip currency={data.currency} />} />
              <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-xs text-text-muted">Aguardando histórico...</p>
        </div>
      )}
    </Card>
  );
};
