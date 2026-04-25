import { useState } from 'react';
import { Truck, MapPin, Calculator, Package, ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { rotasLogistica, netbackCalculo } from '../../data/mockData';

export const LogisticaInteligente = () => {
  const [origemSelecionada, setOrigemSelecionada] = useState('Sorriso, MT');
  const [produto, setProduto] = useState('Soja');
  const [volume, setVolume] = useState(500);

  const origens = ['Sorriso, MT', 'Rondonópolis, MT', 'Cascavel, PR', 'Uberlândia, MG'];
  const produtos = ['Soja', 'Milho', 'Trigo', 'Algodão'];

  const netbackItems = [
    { label: 'Preço no Porto (FOB)', valor: netbackCalculo.precoPorto, tipo: 'positivo' },
    { label: '(-) Frete Rodoviário', valor: netbackCalculo.frete, tipo: 'negativo' },
    { label: '(-) Armazenagem', valor: netbackCalculo.armazenagem, tipo: 'negativo' },
    { label: '(-) Corretagem', valor: netbackCalculo.corretagem, tipo: 'negativo' },
    { label: '(-) Impostos e Taxas', valor: netbackCalculo.impostos, tipo: 'negativo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f1f5f9]">Logística Inteligente</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Calculadora de Frete · Netback · Rotas Otimizadas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader
          title="Configurar Análise Logística"
          subtitle="Defina origem, produto e volume"
          icon={<MapPin size={16} />}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#f1f5f9] mb-2">Origem</label>
            <select
              value={origemSelecionada}
              onChange={e => setOrigemSelecionada(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-[8px] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              {origens.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#f1f5f9] mb-2">Produto</label>
            <select
              value={produto}
              onChange={e => setProduto(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-[8px] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              {produtos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Input
              label="Volume (sacas)"
              type="number"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary">
            <Truck size={14} />
            Calcular Rotas
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cotação de Fretes */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide flex items-center gap-2">
            <Truck size={14} />
            Opções de Rota e Frete
          </h3>
          {rotasLogistica.map((rota, i) => {
            const fretePorSaca = (rota.frete / volume).toFixed(2);
            const isBest = i === 0;
            return (
              <Card key={i} className={isBest ? 'border-[#047857]/50 relative overflow-hidden' : ''}>
                {isBest && (
                  <div className="absolute top-0 right-0 bg-[#059669] text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                    Melhor Opção
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-[12px] ${isBest ? 'bg-[#064E3B]/40 text-[#10B981]' : 'bg-[#0f172a] text-[#64748b]'}`}>
                    <Truck size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[#f1f5f9]">{rota.transportadora}</span>
                      <Badge variant="gray">{rota.prazo}</Badge>
                    </div>
                    <div className="text-xs text-[#64748b] mb-3">
                      {rota.origem} → {rota.destino} · {rota.distancia.toLocaleString('pt-BR')} km
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-[#64748b]">Frete Total</div>
                        <div className="font-bold text-[#f1f5f9]">R$ {rota.frete.toLocaleString('pt-BR')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64748b]">Por Saca</div>
                        <div className="font-bold text-[#f1f5f9]">R$ {fretePorSaca}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64748b]">R$/km</div>
                        <div className="font-bold text-[#94a3b8]">R$ {(rota.frete / rota.distancia).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <Button variant={isBest ? 'primary' : 'secondary'} size="sm">
                    Cotar
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Calculadora Netback */}
        <div>
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide flex items-center gap-2 mb-4">
            <Calculator size={14} />
            Calculadora Netback
          </h3>
          <Card>
            <CardHeader
              title="Preço Líquido na Fazenda"
              subtitle="Sorriso → Paranaguá"
              icon={<Package size={16} />}
            />
            <div className="space-y-2">
              {netbackItems.map((item, i) => (
                <div key={i} className={`flex justify-between items-center py-2.5 ${i < netbackItems.length - 1 ? 'border-b border-[#334155]/50' : ''}`}>
                  <span className="text-xs text-[#94a3b8]">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.tipo === 'positivo' ? 'text-[#f1f5f9]' : 'text-[#EF4444]'}`}>
                    {item.tipo === 'negativo' ? '-' : ''} R$ {item.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#334155]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#f1f5f9]">Preço Líquido</span>
                <span className="text-2xl font-bold text-[#10B981]">R$ {netbackCalculo.precoLiquido.toFixed(2)}</span>
              </div>
              <div className="text-xs text-[#64748b] text-right mt-0.5">por saca · ex-fazenda</div>
            </div>

            <div className="mt-4 bg-[#0f172a] rounded-[12px] p-3">
              <div className="text-xs text-[#64748b] mb-1">Para {volume.toLocaleString('pt-BR')} sacas</div>
              <div className="text-xl font-bold text-[#10B981]">
                R$ {(netbackCalculo.precoLiquido * volume).toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-[#94a3b8]">Receita líquida estimada</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
