import { ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getCommoditiesByCategory } from '../../lib/utils/commodityUtils';
import type { CommodityCategory as Cat } from '../../lib/types/commodity';

interface Props {
  category: string;
  onBack: () => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CommodityCategory = ({ category, onBack, onNavigate }: Props) => {
  const commodities = getCommoditiesByCategory(category as Cat);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  if (!commodities.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-text-primary mb-4">Categoria não encontrada</h2>
        <Button variant="primary" onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-agro-primary hover:underline mb-3">
          <ArrowLeft size={15} /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-text-primary capitalize">{categoryName}</h1>
        <p className="text-sm text-text-muted mt-0.5">{commodities.length} produtos nesta categoria</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {commodities.map(c => (
          <button
            key={c.id}
            onClick={() => onNavigate('detail', c.id)}
            className="text-left p-5 bg-surface-2 border border-border rounded-[12px] hover:border-agro-primary hover:shadow-[var(--shadow-md)] transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-text-primary group-hover:text-agro-primary transition-colors">{c.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{c.unit}</p>
              </div>
              {c.attributes.hedge_disponível && <Badge variant="primary" size="sm">Hedge</Badge>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant={c.attributes.perecibilidade === 'alta' ? 'danger' : 'gray'} size="sm">{c.attributes.perecibilidade}</Badge>
              <Badge variant={c.attributes.sazonalidade === 'alta' ? 'warning' : 'gray'} size="sm">Sazon. {c.attributes.sazonalidade}</Badge>
            </div>
            <div className="pt-3 border-t border-border/50 flex justify-between text-xs text-text-muted">
              <span>Margem: <span className="text-agro-primary font-mono font-semibold">{c.attributes.margem_típica}</span></span>
              <span>Vol: <span className="text-agro-secondary font-mono">{c.attributes.volatilidade_histórica}</span></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
