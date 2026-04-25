import { Leaf, Award, TreePine, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { esgScore, carbonoCreditos, rastreabilidadeAreas } from '../../data/mockData';

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-[#10B981]';
  if (score >= 60) return 'text-[#F59E0B]';
  return 'text-[#EF4444]';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-[#94a3b8]">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs font-semibold" style={{ color: p.fill }}>R$ {p.value.toLocaleString('pt-BR')}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const ESGRastreabilidade = () => {
  const radarData = esgScore.categorias.map(c => ({ subject: c.nome, score: c.score, meta: c.meta }));

  const ibamaCARStatus = (status: string) => {
    if (status === 'OK' || status === 'Conforme' || status === 'Registrado') return { icon: CheckCircle, color: 'text-[#10B981]' };
    if (status === 'Pendente' || status === 'Em análise') return { icon: AlertCircle, color: 'text-[#F59E0B]' };
    return { icon: XCircle, color: 'text-[#EF4444]' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f1f5f9]">ESG e Rastreabilidade</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Score Ambiental · Créditos de Carbono · Compliance</p>
        </div>
        <Button variant="success">
          <Award size={14} />
          Gerar Relatório ESG
        </Button>
      </div>

      {/* Score Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gradient-to-br from-[#064E3B]/40 to-[#064E3B]/10 border border-[#047857]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-[#064E3B]/50 rounded-full mb-4">
            <Leaf size={36} className="text-[#10B981]" />
          </div>
          <div className="text-xs text-[#94a3b8] font-medium uppercase tracking-wide mb-2">Score ESG Global</div>
          <div className="text-6xl font-bold text-[#6EE7B7] mb-1">{esgScore.total}</div>
          <div className="text-sm text-[#94a3b8] mb-3">de 100 · Bom Desempenho</div>
          <Badge variant="green" size="md">Certificado Verde</Badge>
          <div className="mt-4 w-full">
            <ProgressBar value={esgScore.total} max={100} color="green" showPercent={false} />
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader
              title="Desempenho por Categoria"
              subtitle="Score vs. Meta estabelecida"
              icon={<BarChart3 size={16} />}
            />
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Meta" dataKey="meta" stroke="#64748b" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Categorias Detalhadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {esgScore.categorias.map((cat) => (
          <Card key={cat.nome} className="text-center">
            <div className={`text-3xl font-bold mb-1 ${scoreColor(cat.score)}`}>{cat.score}</div>
            <div className="text-xs text-[#94a3b8] font-semibold mb-2">{cat.nome}</div>
            <ProgressBar value={cat.score} max={cat.meta} color={cat.score >= cat.meta * 0.9 ? 'green' : cat.score >= cat.meta * 0.7 ? 'yellow' : 'red'} showPercent={false} />
            <div className="text-xs text-[#64748b] mt-1.5">Meta: {cat.meta}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mercado de Carbono */}
        <Card padding={false}>
          <div className="p-5 pb-3">
            <CardHeader
              title="Mercado de Carbono"
              subtitle="Créditos verificados e pendentes"
              icon={<TreePine size={16} />}
              action={
                <Button variant="success" size="sm">
                  <TreePine size={13} />
                  Negociar Créditos
                </Button>
              }
            />
          </div>

          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#10B981]">{carbonoCreditos.reduce((a, b) => a + b.creditos, 0)}</div>
                <div className="text-xs text-[#64748b]">Créditos Totais</div>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#f1f5f9]">
                  R$ {carbonoCreditos.reduce((a, b) => a + b.total, 0).toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-[#64748b]">Valor Portfólio</div>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#F59E0B]">
                  R$ {(carbonoCreditos.reduce((a, b) => a + b.total, 0) / carbonoCreditos.reduce((a, b) => a + b.creditos, 0)).toFixed(0)}
                </div>
                <div className="text-xs text-[#64748b]">Preço Médio/tCO₂</div>
              </div>
            </div>

            <div className="mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={carbonoCreditos} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="projeto" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Valor" radius={[4, 4, 0, 0]}>
                    {carbonoCreditos.map((c, i) => (
                      <Cell key={i} fill={c.status === 'Verificado' ? '#16a34a' : '#ca8a04'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {carbonoCreditos.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#334155]/50 last:border-0">
                  <div>
                    <div className="text-xs font-semibold text-[#f1f5f9]">{c.projeto}</div>
                    <div className="text-xs text-[#64748b]">{c.creditos} tCO₂ · R$ {c.precoUnitario}/t</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#10B981]">R$ {c.total.toLocaleString('pt-BR')}</div>
                    <Badge variant={c.status === 'Verificado' ? 'green' : 'yellow'}>{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Rastreabilidade e Compliance */}
        <Card padding={false}>
          <div className="p-5 pb-3">
            <CardHeader
              title="Rastreabilidade e Compliance"
              subtitle="CAR · IBAMA · SIF · Certificações"
              icon={<Award size={16} />}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left text-xs text-[#64748b] font-medium px-5 py-3">Área</th>
                  <th className="text-right text-xs text-[#64748b] font-medium px-3 py-3">Ha</th>
                  <th className="text-center text-xs text-[#64748b] font-medium px-3 py-3">CAR</th>
                  <th className="text-center text-xs text-[#64748b] font-medium px-3 py-3">IBAMA</th>
                  <th className="text-center text-xs text-[#64748b] font-medium px-3 py-3">SIF</th>
                </tr>
              </thead>
              <tbody>
                {rastreabilidadeAreas.map((area, i) => {
                  const car = ibamaCARStatus(area.car);
                  const ibama = ibamaCARStatus(area.ibama);
                  const sif = ibamaCARStatus(area.sifStatus);
                  return (
                    <tr key={i} className="border-b border-[#334155]/50 hover:bg-[#0f172a]/40">
                      <td className="px-5 py-3">
                        <div className="text-xs font-semibold text-[#f1f5f9]">{area.area}</div>
                        <div className="text-xs text-[#64748b]">{area.cultura}</div>
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-mono text-[#94a3b8]">{area.hectares}</td>
                      <td className="px-3 py-3 text-center">
                        <car.icon size={16} className={`mx-auto ${car.color}`} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ibama.icon size={16} className={`mx-auto ${ibama.color}`} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <sif.icon size={16} className={`mx-auto ${sif.color}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 pt-3 space-y-3">
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Selos e Certificações</div>
            <div className="flex flex-wrap gap-2">
              {['Soja Plus', 'RTRS', 'Rainforest Alliance', 'Non-GMO', 'Carbon Neutral 2025', 'BONSUCRO'].map(selo => (
                <div key={selo} className="flex items-center gap-1.5 bg-[#064E3B]/30 border border-[#047857]/40 rounded-full px-3 py-1">
                  <Award size={11} className="text-[#10B981]" />
                  <span className="text-xs text-[#6EE7B7] font-medium">{selo}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#064E3B]/20 border border-[#047857]/30 rounded-lg p-3">
              <p className="text-xs text-[#94a3b8]">
                <span className="text-[#6EE7B7] font-semibold">+R$ 4,20/sc</span> de prêmio comercial disponível para produtos com rastreabilidade certificada nesta safra.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
