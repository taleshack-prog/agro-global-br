import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Truck, CreditCard, Package, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Tabs } from '../../components/ui/Tabs';
import { getCommodity } from '../../lib/utils/commodityUtils';

const Check = ({ ok }: { ok: boolean }) => ok
  ? <CheckCircle size={16} className="text-agro-primary" />
  : <XCircle size={16} className="text-text-muted opacity-40" />;

export const CommodityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commodity = id ? getCommodity(id) : null;

  if (!commodity) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="text-text-muted mx-auto mb-4" />
        <h2 className="text-lg font-bold text-text-primary mb-2">Commodity não encontrada</h2>
        <Button variant="primary" onClick={() => navigate('/commodities')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-agro-primary hover:underline">
        <ArrowLeft size={15} /> Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text-primary">{commodity.name}</h1>
            <Badge variant="gray">{commodity.unit}</Badge>
          </div>
          <p className="text-sm text-text-muted capitalize">Categoria: {commodity.category}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/negociacao')}>
          Negociar Agora
        </Button>
      </div>

      {/* Alerts */}
      {commodity.attributes.perecibilidade === 'alta' && (
        <Alert variant="warning" title="Produto Perecível">
          Prazo de validade: <strong>{commodity.logística.prazo_validade} dias</strong>. Requer logística refrigerada.
        </Alert>
      )}
      {commodity.attributes.sazonalidade === 'alta' && (
        <Alert variant="info" title="Sazonalidade Alta">
          Preços variam significativamente ao longo do ano. Considere estratégias de hedge.
        </Alert>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Perecibilidade', value: commodity.attributes.perecibilidade, color: commodity.attributes.perecibilidade === 'alta' ? 'text-agro-danger' : 'text-agro-primary' },
          { label: 'Sazonalidade', value: commodity.attributes.sazonalidade, color: commodity.attributes.sazonalidade === 'alta' ? 'text-agro-secondary' : 'text-agro-primary' },
          { label: 'Margem Típica', value: commodity.attributes.margem_típica, color: 'text-agro-primary' },
          { label: 'Volatilidade', value: commodity.attributes.volatilidade_histórica, color: 'text-agro-secondary' },
        ].map(s => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`text-xl font-bold mt-1 capitalize ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        variant="underline"
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Visão Geral', icon: <Package size={14} /> },
          { value: 'precos', label: 'Preços', icon: <TrendingUp size={14} /> },
          { value: 'logistica', label: 'Logística', icon: <Truck size={14} /> },
          { value: 'financeiro', label: 'Financeiro', icon: <CreditCard size={14} /> },
        ]}
      >
        <div className="space-y-4">
          {/* Overview — shown always, tab content handled by state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Características */}
            <Card>
              <CardHeader title="Características" icon={<Package size={16} />} />
              <div className="space-y-3 text-sm">
                {[
                  ['Hedge Disponível', commodity.attributes.hedge_disponível],
                  ['Rastreabilidade ESG', commodity.attributes.rastreabilidade_esg],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-text-secondary">{String(label)}</span>
                    <Check ok={Boolean(val)} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Preços */}
            <Card>
              <CardHeader title="Fontes de Preço" icon={<TrendingUp size={16} />} />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Atualização</span>
                  <Badge variant={commodity.preços.atualização === 'tempo_real' ? 'primary' : commodity.preços.atualização === 'diária' ? 'accent' : 'gray'}>
                    {commodity.preços.atualização}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Moeda</span>
                  <span className="font-mono text-text-primary">{commodity.preços.moeda}</span>
                </div>
                <div>
                  <span className="text-text-secondary text-xs">Fontes</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {commodity.preços.fontes.map(f => <Badge key={f} variant="gray" size="sm">{f}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Logística */}
            <Card>
              <CardHeader title="Logística" icon={<Truck size={16} />} />
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Peso/unidade', `${commodity.logística.peso_médio_saca} kg`],
                  ['Volume', `${commodity.logística.volume_médio_saca} m³`],
                  ['Temperatura', `${commodity.logística.temperatura_armazenagem}°C`],
                  ['Umidade', `${commodity.logística.umidade_ideal}%`],
                  ['Validade', `${commodity.logística.prazo_validade} dias`],
                ].map(([label, val]) => (
                  <div key={String(label)} className="bg-surface rounded-[8px] p-3">
                    <p className="text-xs text-text-muted">{String(label)}</p>
                    <p className="font-mono text-sm font-bold text-text-primary mt-0.5">{String(val)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Financeiro */}
            <Card>
              <CardHeader title="Financeiro" icon={<CreditCard size={16} />} />
              <div className="space-y-3 text-sm">
                {[
                  ['Crédito disponível', commodity.financeiro.crédito_disponível],
                  ['Seguro disponível', commodity.financeiro.seguro_disponível],
                  ['CPR fracionável', commodity.financeiro.cpr_fracionável],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-text-secondary">{String(label)}</span>
                    <Check ok={Boolean(val)} />
                  </div>
                ))}
                <div className="pt-1 bg-agro-primary/5 rounded-[8px] p-3 mt-2">
                  <p className="text-xs text-text-muted">Taxa média de financiamento</p>
                  <p className="text-sm font-bold text-agro-primary mt-0.5">{commodity.financeiro.taxa_média_financiamento}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* CTA */}
      <div className="bg-gradient-to-r from-agro-primary/20 to-agro-accent/20 border border-agro-primary/30 rounded-[16px] p-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary">Pronto para negociar {commodity.name}?</h3>
          <p className="text-sm text-text-secondary mt-0.5">Acesse a mesa digital e receba cotações em tempo real</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/negociacao')}>
          Ir para Mesa Digital
        </Button>
      </div>
    </div>
  );
};
