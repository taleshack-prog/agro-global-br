import { TrendingUp, TrendingDown, CloudRain, Zap, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { StatCard } from '../ui/StatCard';
import { cotacoes as mockCotacoes, macroIndicadores as mockMacro, alertasClima, precoHistorico } from '../../data/mockData';
import { useMarketWebSocket } from '../../hooks/useMarketWebSocket';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-border rounded-[12px] p-3 shadow-xl">
        <p className="text-xs text-text-secondary mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: R$ {p.value.toFixed(2)}/sc
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardMercado = () => {
  const { quotes: liveQuotes, macro: liveMacro, connected, lastUpdated } = useMarketWebSocket(['quotes', 'macro']);

  // Use live data when available, fall back to mock
  const cotacoes = liveQuotes.length > 0
    ? liveQuotes.map((q: any) => ({
        praça: q.praça || q.symbol,
        produto: q.produto?.includes('SOJA') || q.symbol?.includes('SOJA') ? 'Soja' : 'Milho',
        preco: q.price,
        basis: q.basis ?? 0,
        variacao: q.changePct,
      }))
    : mockCotacoes;

  const macroIndicadores = liveMacro.length > 0
    ? liveMacro.map((m: any) => ({
        nome: m.symbol || m.produto,
        valor: m.price,
        variacao: m.changePct,
        unidade: '',
      }))
    : mockMacro;

  const soja = cotacoes.filter(c => c.produto === 'Soja');
  const milho = cotacoes.filter(c => c.produto === 'Milho');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Dashboard de Mercado</h2>
          <p className="text-sm text-text-muted mt-0.5">
          {lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Carregando dados...'}
        </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[12px] border ${connected ? 'bg-[#064E3B]/30 border-[#047857]/50 text-agro-primary' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Ao vivo' : 'Offline'}
          </div>
          <button className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary bg-surface-2 border border-border px-3 py-2 rounded-[12px] transition-colors">
            <RefreshCw size={13} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Indicadores Macro */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Indicadores Macro</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {macroIndicadores.map((ind) => (
            <StatCard
              key={ind.nome}
              label={ind.nome}
              value={ind.nome === 'Ibovespa' ? ind.valor.toLocaleString('pt-BR') : ind.valor.toFixed(2)}
              subvalue={ind.unidade}
              change={ind.variacao}
              accent={ind.variacao > 0 ? 'green' : 'red'}
            />
          ))}
        </div>
      </div>

      {/* Gráfico de Preços */}
      <Card>
        <CardHeader
          title="Evolução de Preços"
          subtitle="Últimos 7 meses · R$/sc"
          icon={<TrendingUp size={16} />}
          action={
            <div className="flex gap-2">
              {['Soja', 'Milho', 'Trigo'].map(c => (
                <button key={c} className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded bg-surface border border-border transition-colors">
                  {c}
                </button>
              ))}
            </div>
          }
        />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={precoHistorico} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Line type="monotone" dataKey="soja" name="Soja" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#16a34a' }} />
            <Line type="monotone" dataKey="milho" name="Milho" stroke="#ca8a04" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#ca8a04' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabelas de Cotações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soja */}
        <Card padding={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Cotações — Soja"
              subtitle="Preço por saca 60kg"
              icon={<Zap size={16} />}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-muted font-medium px-5 py-3">Praça</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Basis</th>
                  <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Variação</th>
                </tr>
              </thead>
              <tbody>
                {soja.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                    <td className="px-5 py-3 text-text-primary font-medium">{row.praça}</td>
                    <td className="px-4 py-3 text-right text-text-primary font-mono">R$ {row.preco.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${row.basis >= 0 ? 'text-agro-primary' : 'text-agro-danger'}`}>
                      {row.basis >= 0 ? '+' : ''}{row.basis.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.variacao >= 0 ? 'text-agro-primary' : 'text-agro-danger'}`}>
                        {row.variacao >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {row.variacao >= 0 ? '+' : ''}{row.variacao.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Milho */}
        <Card padding={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Cotações — Milho"
              subtitle="Preço por saca 60kg"
              icon={<Zap size={16} />}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-muted font-medium px-5 py-3">Praça</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Basis</th>
                  <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Variação</th>
                </tr>
              </thead>
              <tbody>
                {milho.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                    <td className="px-5 py-3 text-text-primary font-medium">{row.praça}</td>
                    <td className="px-4 py-3 text-right text-text-primary font-mono">R$ {row.preco.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${row.basis >= 0 ? 'text-agro-primary' : 'text-agro-danger'}`}>
                      {row.basis >= 0 ? '+' : ''}{row.basis.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.variacao >= 0 ? 'text-agro-primary' : 'text-agro-danger'}`}>
                        {row.variacao >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {row.variacao >= 0 ? '+' : ''}{row.variacao.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Alertas Climáticos */}
      <Card>
        <CardHeader
          title="Resumo Climático"
          subtitle="Alertas por região"
          icon={<CloudRain size={16} />}
        />
        <div className="space-y-3">
          {alertasClima.map((alerta, i) => {
            const variant =
              alerta.tipo === 'danger'  ? 'danger' :
              alerta.tipo === 'warning' ? 'warning' : 'info';
            return (
              <Alert key={i} variant={variant} title={alerta.regiao}>
                <span className="text-xs">{alerta.mensagem}</span>
                <Badge variant={variant} size="sm" className="ml-2">{alerta.severidade}</Badge>
              </Alert>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
