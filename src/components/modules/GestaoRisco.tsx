import { useState } from 'react';
import { Shield, TrendingDown, BarChart3, Lightbulb, AlertOctagon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { hedgeRecomendacao, cenariosMargem, varCenarios } from '../../data/mockData';

const margemColors = ['#ef4444', '#16a34a', '#22c55e'];

const CustomTooltipMargem = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-border rounded-[12px] p-3 shadow-xl">
        <p className="text-xs text-text-secondary mb-2 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs" style={{ color: p.fill }}>
            {p.name}: {p.value < 0 ? '-' : ''}R$ {Math.abs(p.value).toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const GestaoRisco = () => {
  const [percentualFixar, setPercentualFixar] = useState(30);

  const totalSafra = hedgeRecomendacao.safraTotal;
  const sacasProtegidas = Math.round(totalSafra * (percentualFixar / 100));
  const receita = sacasProtegidas * hedgeRecomendacao.precoAtual;

  const radarData = [
    { fator: 'Câmbio', risco: 72 },
    { fator: 'Clima', risco: 55 },
    { fator: 'Preço', risco: 60 },
    { fator: 'Crédito', risco: 30 },
    { fator: 'Logística', risco: 45 },
    { fator: 'Regulação', risco: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Inteligência e Gestão de Risco</h2>
          <p className="text-sm text-text-muted mt-0.5">Recomendador de Hedge · Safra 2026/27</p>
        </div>
        <Badge variant="yellow" size="md">Safra 2026/27</Badge>
      </div>

      {/* Recomendação de IA */}
      <div className="bg-gradient-to-r from-[#064E3B]/40 to-[#064E3B]/20 border border-[#047857]/50 rounded-[12px] p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#059669]/30 rounded-[12px] text-agro-primary mt-0.5">
            <Lightbulb size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-[#6EE7B7]">Recomendação de IA — Hedge Sugerido</h3>
              <Badge variant="green">Atualizado agora</Badge>
            </div>
            <p className="text-sm text-[#e2e8f0] mb-4">
              Com base nos dados de mercado e no perfil da sua operação, recomendamos <strong className="text-[#6EE7B7]">fixar 30% da safra</strong> de Soja agora usando <strong className="text-[#6EE7B7]">Contratos Futuros na B3</strong>, aproveitando a janela favorável de preços.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#6EE7B7]">30%</div>
                <div className="text-xs text-text-secondary">Fixar agora</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FCD34D]">40%</div>
                <div className="text-xs text-text-secondary">Aguardar janela</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">30%</div>
                <div className="text-xs text-text-secondary">Sem fixação</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulador Interativo */}
        <Card>
          <CardHeader
            title="Simulador de Proteção"
            subtitle="Arraste para simular cenários"
            icon={<Shield size={16} />}
          />
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-secondary">% da safra a fixar</span>
                <span className="text-xl font-bold text-agro-primary">{percentualFixar}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={percentualFixar}
                onChange={e => setPercentualFixar(Number(e.target.value))}
                className="w-full accent-green-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>0%</span>
                <span className="text-[#059669]">Sugerido: 30%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-[12px] p-3">
                <div className="text-xs text-text-muted mb-1">Sacas protegidas</div>
                <div className="text-lg font-bold text-text-primary">{sacasProtegidas.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-text-secondary">de {totalSafra.toLocaleString('pt-BR')} sc</div>
              </div>
              <div className="bg-surface rounded-[12px] p-3">
                <div className="text-xs text-text-muted mb-1">Receita garantida</div>
                <div className="text-lg font-bold text-agro-primary">R$ {receita.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-text-secondary">@ R$ {hedgeRecomendacao.precoAtual}/sc</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-text-muted font-semibold uppercase tracking-wide">Cobertura por instrumento</div>
              {hedgeRecomendacao.instrumentos.map((inst, i) => (
                <div key={i}>
                  <ProgressBar
                    value={inst.porcentagem}
                    max={100}
                    label={inst.nome}
                    sublabel={inst.vantagem}
                    color={['green', 'blue', 'yellow'][i] as any}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm" className="flex-1">
                <Shield size={13} />
                Aplicar Hedge
              </Button>
              <Button variant="secondary" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </Card>

        {/* Radar de Risco */}
        <Card>
          <CardHeader
            title="Mapa de Risco"
            subtitle="Exposição por fator de risco"
            icon={<AlertOctagon size={16} />}
          />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="fator" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Risco" dataKey="risco" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {radarData.map((r) => (
              <div key={r.fator} className="text-center">
                <div className={`text-sm font-bold ${r.risco > 65 ? 'text-agro-danger' : r.risco > 45 ? 'text-agro-secondary' : 'text-agro-primary'}`}>
                  {r.risco}
                </div>
                <div className="text-xs text-text-muted">{r.fator}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cenários de Margem */}
      <Card>
        <CardHeader
          title="Cenários de Rentabilidade"
          subtitle="Análise de margem por cenário"
          icon={<BarChart3 size={16} />}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cenariosMargem} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cenario" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltipMargem />} />
                <Bar dataKey="margem" name="Margem" radius={[4, 4, 0, 0]}>
                  {cenariosMargem.map((_, i) => (
                    <Cell key={i} fill={margemColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {cenariosMargem.map((c, i) => (
              <div key={c.cenario} className="bg-surface rounded-[12px] p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold" style={{ color: margemColors[i] }}>{c.cenario}</span>
                  <Badge variant={i === 0 ? 'red' : i === 1 ? 'blue' : 'green'}>{c.roi.toFixed(1)}% ROI</Badge>
                </div>
                <div className="text-base font-bold text-text-primary">R$ {c.margem.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-text-muted">Margem bruta estimada</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Cenários de Estresse */}
      <Card>
        <CardHeader
          title="Cenários de Estresse (VaR Simplificado)"
          subtitle="Impacto na receita esperada por fator"
          icon={<TrendingDown size={16} />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {varCenarios.map((v, i) => (
            <div key={i} className="bg-surface border border-[#7F1D1D]/30 rounded-[12px] p-4">
              <div className="text-xs text-text-muted mb-2">{v.fator}</div>
              <div className="text-xl font-bold text-agro-danger">
                - R$ {Math.abs(v.impacto).toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-text-secondary mt-1">{v.percentual}% na receita</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
