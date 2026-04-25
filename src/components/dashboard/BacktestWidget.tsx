import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface BacktestResult {
  commodity: string;
  roi: number;
  savings: number;
  win_rate: number;
  total_trades: number;
  avg_profit: number;
  net_benefit?: number;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export const BacktestWidget = ({ results }: { results: BacktestResult[] }) => {
  const avgROI      = results.length ? results.reduce((s, r) => s + r.roi, 0) / results.length : 0;
  const totalSaving = results.reduce((s, r) => s + r.savings, 0);
  const avgWin      = results.length ? results.reduce((s, r) => s + r.win_rate, 0) / results.length : 0;

  const chartData = results.map(r => ({
    commodity: r.commodity,
    ROI: parseFloat(r.roi.toFixed(1)),
    Economia: parseFloat((r.savings / 1000).toFixed(1)),
  }));

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Backtesting Engine"
        subtitle="Validação histórica 90 dias"
        icon={<TrendingUp size={16} />}
        action={<Badge variant="primary" size="sm">GBM Sim.</Badge>}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'ROI Médio', value: `${avgROI.toFixed(1)}%`, color: 'text-agro-primary' },
          { label: 'Economia Total', value: `R$\u00a0${(totalSaving / 1000).toFixed(0)}k`, color: 'text-agro-accent' },
          { label: 'Win Rate', value: `${avgWin.toFixed(0)}%`, color: 'text-agro-secondary' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-[8px] p-3 text-center">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="commodity" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Bar dataKey="ROI" name="ROI %" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
          <Bar dataKey="Economia" name="Economia (R$k)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b border-border">
            <tr>
              {['Commodity', 'ROI', 'Economia', 'Win Rate', 'Trades'].map(h => (
                <th key={h} className="px-3 py-2 text-text-muted font-semibold text-left last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {results.map((r, i) => (
              <tr key={r.commodity} className="hover:bg-surface/30">
                <td className="px-3 py-2 font-semibold text-text-primary capitalize">{r.commodity}</td>
                <td className="px-3 py-2 font-bold tabular-nums" style={{ color: COLORS[i % COLORS.length] }}>{r.roi.toFixed(1)}%</td>
                <td className="px-3 py-2 font-mono tabular-nums text-agro-primary">R$ {r.savings.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2"><Badge variant={r.win_rate >= 75 ? 'primary' : 'warning'} size="sm">{r.win_rate.toFixed(0)}%</Badge></td>
                <td className="px-3 py-2 text-right text-text-muted">{r.total_trades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
