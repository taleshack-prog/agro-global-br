import { useState } from 'react';
import { ShoppingCart, FileText, CheckCircle, Clock, AlertCircle, Scale, Gavel } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ofertasCompra, contratos } from '../../data/mockData';

const statusConfig: Record<string, { variant: 'green' | 'yellow' | 'blue' | 'gray', icon: any }> = {
  'Assinado': { variant: 'green', icon: CheckCircle },
  'Pendente': { variant: 'yellow', icon: Clock },
  'Em Análise': { variant: 'blue', icon: AlertCircle },
};

export const MesaNegociacao = () => {
  const [selectedOferta, setSelectedOferta] = useState<string | null>(null);
  const [tab, setTab] = useState<'ofertas' | 'rfq' | 'contratos'>('ofertas');

  const leilaoData = [
    { item: 'Soja — Lote A', quantidade: '500 sc', encerramento: '2h 14min', lance: 'R$ 143.50', participantes: 7, status: 'Ativo' },
    { item: 'Milho — Lote B', quantidade: '2.000 sc', encerramento: '48min', lance: 'R$ 68.90', participantes: 12, status: 'Ativo' },
    { item: 'Soja — Lote C', quantidade: '1.200 sc', encerramento: 'Amanhã 09:00', lance: 'R$ 141.20', participantes: 4, status: 'Aguardando' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Mesa Digital de Negociação</h2>
          <p className="text-sm text-text-muted mt-0.5">Marketplace · Contratos Digitais</p>
        </div>
        <Button variant="primary">
          <ShoppingCart size={14} />
          Nova Proposta
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-[12px] p-1 border border-border">
        {(['ofertas', 'rfq', 'contratos'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              tab === t ? 'bg-[#047857] text-white shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t === 'ofertas' ? 'Livro de Ofertas' : t === 'rfq' ? 'RFQ / Leilões' : 'Contratos Digitais'}
          </button>
        ))}
      </div>

      {tab === 'ofertas' && (
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-agro-primary">{ofertasCompra.length}</div>
              <div className="text-xs text-text-muted">Ofertas Ativas</div>
            </div>
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-text-primary">{ofertasCompra.reduce((a, b) => a + b.volume, 0).toLocaleString('pt-BR')}</div>
              <div className="text-xs text-text-muted">Volume Total (sc)</div>
            </div>
            <div className="bg-surface-2 border border-border rounded-[12px] p-4 text-center">
              <div className="text-2xl font-bold text-agro-secondary">R$ 142.80</div>
              <div className="text-xs text-text-muted">Preço Médio Soja</div>
            </div>
          </div>

          <Card padding={false}>
            <div className="p-5 pb-3">
              <CardHeader
                title="Livro de Ofertas"
                subtitle="Compradores ativos no mercado"
                icon={<Scale size={16} />}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-text-muted font-medium px-5 py-3">Comprador</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Produto</th>
                    <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Volume (sc)</th>
                    <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Origem</th>
                    <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Prazo</th>
                    <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {ofertasCompra.map((oferta) => (
                    <tr
                      key={oferta.id}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${selectedOferta === oferta.id ? 'bg-[#064E3B]/20' : 'hover:bg-surface/40'}`}
                      onClick={() => setSelectedOferta(oferta.id === selectedOferta ? null : oferta.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="font-semibold text-text-primary">{oferta.comprador}</div>
                        <div className="text-xs text-text-muted">{oferta.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={oferta.produto === 'Soja' ? 'green' : 'yellow'}>{oferta.produto}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-primary">{oferta.volume.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right font-bold text-agro-primary font-mono">R$ {oferta.preco.toFixed(2)}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{oferta.origem}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{oferta.prazo}</td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="primary" size="sm">
                          Negociar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === 'rfq' && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Leilões em Andamento"
              subtitle="Participação em tempo real"
              icon={<Gavel size={16} />}
            />
            <div className="space-y-4">
              {leilaoData.map((l, i) => (
                <div key={i} className={`border rounded-[12px] p-4 ${l.status === 'Ativo' ? 'border-[#047857]/50 bg-[#064E3B]/10' : 'border-border bg-surface/40'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text-primary">{l.item}</h4>
                        <Badge variant={l.status === 'Ativo' ? 'green' : 'gray'}>{l.status}</Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">Volume: {l.quantidade} · {l.participantes} participantes</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Encerramento</div>
                      <div className={`text-sm font-bold ${l.status === 'Ativo' ? 'text-agro-secondary' : 'text-text-secondary'}`}>{l.encerramento}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-text-muted">Lance atual</div>
                      <div className="text-xl font-bold text-agro-primary">{l.lance}</div>
                    </div>
                    {l.status === 'Ativo' && (
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">Ver Detalhes</Button>
                        <Button variant="primary" size="sm">
                          <Gavel size={13} />
                          Fazer Lance
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'contratos' && (
        <Card padding={false}>
          <div className="p-5 pb-3">
            <CardHeader
              title="Contratos Digitais"
              subtitle="Trilha de auditoria completa"
              icon={<FileText size={16} />}
              action={
                <Button variant="primary" size="sm">
                  <FileText size={13} />
                  Novo Contrato
                </Button>
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-muted font-medium px-5 py-3">ID</th>
                  <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Produto</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Volume</th>
                  <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Preço</th>
                  <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Contraparte</th>
                  <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Vencimento</th>
                  <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Status</th>
                  <th className="text-right text-xs text-text-muted font-medium px-5 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => {
                  const sc = statusConfig[c.status] || statusConfig['Pendente'];
                  const Icon = sc.icon;
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-surface/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-text-secondary">{c.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.produto === 'Soja' ? 'green' : 'yellow'}>{c.produto}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-primary">{c.volume.toLocaleString('pt-BR')} sc</td>
                      <td className="px-4 py-3 text-right font-bold text-agro-primary font-mono">R$ {c.preco.toFixed(2)}</td>
                      <td className="px-4 py-3 text-text-primary">{c.contraparte}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{c.vencimento}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon size={13} className={sc.variant === 'green' ? 'text-agro-primary' : sc.variant === 'yellow' ? 'text-agro-secondary' : 'text-agro-accent'} />
                          <Badge variant={sc.variant}>{c.status}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="sm">Ver</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
