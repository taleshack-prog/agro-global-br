import { useState } from 'react';
import { CreditCard, FileSignature, Shield, Coins, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { creditoOfertas, cprDigitais } from '../../data/mockData';

export const FinanceiroCredito = () => {
  const [tab, setTab] = useState<'credito' | 'cpr' | 'seguros'>('credito');

  const seguros = [
    { tipo: 'Seguro Paramétrico — Seca', cobertura: 'Pluviometria < 80mm/mês', premio: 'R$ 12.400', status: 'Disponível', prazo: 'Safra 2026/27' },
    { tipo: 'Seguro Paramétrico — Geada', cobertura: 'Temperatura < 0°C por 3h', premio: 'R$ 8.700', status: 'Contratado', prazo: 'Safra 2026/27' },
    { tipo: 'Proagro Mais', cobertura: 'Cobertura total por sinistro', premio: 'R$ 21.300', status: 'Analisar', prazo: 'Safra 2026/27' },
  ];

  const limiteCreditoTotal = 2000000;
  const limiteCreditoUsado = 430000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Financeiro e Crédito</h2>
          <p className="text-sm text-text-muted mt-0.5">Infraestrutura de Mercado · Acesso a Capital</p>
        </div>
      </div>

      {/* Score e Limite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1E3A8A]/40 to-[#1E3A8A]/10 border border-[#1D4ED8]/40 rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-agro-accent" />
            <span className="text-sm text-text-secondary font-medium">Score de Crédito</span>
          </div>
          <div className="text-4xl font-bold text-[#93C5FD] mb-1">782</div>
          <div className="text-xs text-text-muted mb-3">Excelente · Top 15% do setor</div>
          <ProgressBar value={782} max={1000} color="blue" />
        </div>

        <div className="bg-gradient-to-br from-[#064E3B]/40 to-green-900/10 border border-[#047857]/40 rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-agro-primary" />
            <span className="text-sm text-text-secondary font-medium">Limite de Crédito</span>
          </div>
          <div className="text-3xl font-bold text-[#6EE7B7] mb-1">R$ 2.000.000</div>
          <div className="text-xs text-text-muted mb-3">R$ {limiteCreditoUsado.toLocaleString('pt-BR')} utilizado</div>
          <ProgressBar value={limiteCreditoUsado} max={limiteCreditoTotal} color="green" />
        </div>

        <div className="bg-gradient-to-br from-[#78350F]/40 to-yellow-900/10 border border-[#B45309]/40 rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Coins size={18} className="text-agro-secondary" />
            <span className="text-sm text-text-secondary font-medium">Lastro Disponível</span>
          </div>
          <div className="text-3xl font-bold text-[#FCD34D] mb-1">5.000 sc</div>
          <div className="text-xs text-text-muted mb-3">Soja safra 2026/27 · ~R$ 712k</div>
          <ProgressBar value={60} color="yellow" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-[12px] p-1 border border-border">
        {(['credito', 'cpr', 'seguros'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              tab === t ? 'bg-[#047857] text-white shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t === 'credito' ? 'Crédito / Barter' : t === 'cpr' ? 'CPR Digital' : 'Seguros Param.'}
          </button>
        ))}
      </div>

      {tab === 'credito' && (
        <div className="space-y-4">
          {creditoOfertas.map((oferta, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-surface rounded-[12px] text-agro-primary">
                    <CreditCard size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-text-primary">{oferta.tipo}</h4>
                      <Badge variant={oferta.status === 'Pré-aprovado' ? 'green' : oferta.status === 'Disponível' ? 'blue' : 'yellow'}>
                        {oferta.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-text-muted">Valor disponível</div>
                        <div className="font-bold text-agro-primary">R$ {oferta.valor.toLocaleString('pt-BR')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Taxa</div>
                        <div className="font-semibold text-text-primary">{oferta.taxa}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Prazo</div>
                        <div className="font-semibold text-text-primary">{oferta.prazo}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Garantia</div>
                        <div className="font-semibold text-text-secondary">{oferta.garantia}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="primary" size="sm" className="ml-4 shrink-0">
                  Contratar
                  <ChevronRight size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'cpr' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary">
              <FileSignature size={14} />
              Emitir Nova CPR
            </Button>
          </div>
          {cprDigitais.map((cpr, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-[12px] ${cpr.status === 'Ativa' ? 'bg-[#064E3B]/40 text-agro-primary' : 'bg-slate-700/40 text-slate-400'}`}>
                    <FileSignature size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-text-muted">{cpr.id}</span>
                      <Badge variant={cpr.status === 'Ativa' ? 'green' : 'gray'}>{cpr.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-text-muted">Valor</div>
                        <div className="font-bold text-text-primary">R$ {cpr.valor.toLocaleString('pt-BR')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Produto</div>
                        <div className="font-semibold text-text-primary">{cpr.produto}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Quantidade</div>
                        <div className="font-semibold text-text-primary">{cpr.quantidade}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Vencimento</div>
                        <div className="font-semibold text-text-primary">{cpr.vencimento}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Token</div>
                        <div className="font-mono text-xs text-purple-400">{cpr.token}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 shrink-0">
                  Detalhes
                </Button>
              </div>
            </Card>
          ))}
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins size={16} className="text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Mercado Secundário de CPRs</span>
              <Badge variant="purple">Beta</Badge>
            </div>
            <p className="text-xs text-text-secondary">Tokenize suas CPRs e acesse liquidez no mercado secundário. Suas CPRs ativas podem ser fracionadas e negociadas com investidores institucionais.</p>
            <Button variant="secondary" size="sm" className="mt-3">Explorar Mercado Secundário</Button>
          </div>
        </div>
      )}

      {tab === 'seguros' && (
        <div className="space-y-4">
          <div className="bg-[#1E3A8A]/20 border border-[#1D4ED8]/40 rounded-[12px] p-4 mb-4">
            <p className="text-xs text-text-secondary">
              <span className="text-[#93C5FD] font-semibold">Seguros Paramétricos</span> são acionados automaticamente quando gatilhos climáticos ou produtivos são alcançados, com base em dados de sensores e estações meteorológicas. Sem necessidade de perícia presencial.
            </p>
          </div>
          {seguros.map((s, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-surface rounded-[12px] text-agro-accent">
                    <Shield size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-text-primary">{s.tipo}</h4>
                      <Badge variant={s.status === 'Contratado' ? 'green' : s.status === 'Disponível' ? 'blue' : 'yellow'}>
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-3">Gatilho: {s.cobertura}</p>
                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs text-text-muted">Prêmio anual</div>
                        <div className="font-bold text-text-primary">{s.premio}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Vigência</div>
                        <div className="font-semibold text-text-secondary">{s.prazo}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {s.status !== 'Contratado' && (
                  <Button variant="primary" size="sm" className="shrink-0">
                    Contratar
                  </Button>
                )}
                {s.status === 'Contratado' && (
                  <Badge variant="green" size="md">Ativo</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
