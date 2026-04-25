import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { getCommoditiesWithHedge } from '../../lib/utils/commodityUtils';

export const CommodityHedge = () => {
  const navigate = useNavigate();
  const commodities = getCommoditiesWithHedge();

  const bySource = commodities.reduce<Record<string, typeof commodities>>((acc, c) => {
    c.preços.fontes.forEach(f => {
      if (!acc[f]) acc[f] = [];
      acc[f].push(c);
    });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-agro-primary/10 rounded-[12px]">
          <TrendingUp size={24} className="text-agro-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Commodities com Hedge</h1>
          <p className="text-sm text-text-muted mt-0.5">{commodities.length} produtos com instrumentos de proteção disponíveis</p>
        </div>
      </div>

      <Alert variant="info" title="O que é Hedge?">
        Proteção contra variação de preço através de contratos futuros nas bolsas B3, CBOT ou ICE.
        Permite fixar o preço de venda antes da colheita, eliminando o risco de queda.
      </Alert>

      {/* Por bolsa */}
      {Object.entries(bySource).filter(([src]) => ['B3', 'CBOT', 'ICE'].includes(src)).map(([source, list]) => (
        <Card key={source}>
          <CardHeader
            title={`Disponível na ${source}`}
            subtitle={`${list.length} commodities`}
            icon={<TrendingUp size={16} />}
            action={<Badge variant="primary">{source}</Badge>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/commodities/${c.id}`)}
                className="text-left p-4 bg-surface rounded-[12px] border border-border hover:border-agro-primary transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-text-primary group-hover:text-agro-primary transition-colors">{c.name}</h4>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-agro-primary transition-colors" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="gray" size="sm">{c.preços.moeda}</Badge>
                  <Badge variant={c.preços.atualização === 'tempo_real' ? 'primary' : 'accent'} size="sm">
                    {c.preços.atualização}
                  </Badge>
                  <Badge variant="gray" size="sm">Vol. {c.attributes.volatilidade_histórica}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
