import { Package, TrendingUp, Leaf, Zap, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getAllCommodities, getStatistics, getCategories, countByCategory } from '../../lib/utils/commodityUtils';

const CATEGORY_ICONS: Record<string, string> = {
  'grãos': '🌾', 'proteína': '🥩', 'açúcar': '🍬', 'energia': '⚡',
  'fibra': '🧵', 'frutas': '🍎', 'hortaliças': '🥦', 'lácteos': '🥛',
  'pescado': '🐟', 'madeira': '🪵',
};

interface Props {
  onNavigate: (view: string, param?: string) => void;
}

export const CommoditiesOverview = ({ onNavigate }: Props) => {
  const stats = getStatistics();
  const categories = getCategories();
  const countByCat = countByCategory();
  const featured = getAllCommodities().filter(c => c.attributes.hedge_disponível).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Commodities</h1>
        <p className="text-sm text-text-muted mt-1">
          Explore {stats.total} produtos agrícolas · {stats.categories} categorias · {stats.withHedge} com hedge
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: <Package size={22} />, color: 'text-agro-primary' },
          { label: 'Categorias', value: stats.categories, icon: <Leaf size={22} />, color: 'text-agro-accent' },
          { label: 'Com Hedge', value: stats.withHedge, icon: <TrendingUp size={22} />, color: 'text-agro-secondary' },
          { label: 'Com ESG', value: stats.withESG, icon: <Zap size={22} />, color: 'text-agro-primary' },
        ].map(s => (
          <Card key={s.label} className="text-center !p-5">
            <div className={`${s.color} flex justify-center mb-2`}>{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Categorias" subtitle="Clique para explorar" icon={<Leaf size={16} />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onNavigate('category', cat)}
              className="p-4 bg-surface rounded-[12px] border border-border hover:border-agro-primary hover:bg-agro-primary/5 transition-all text-center group"
            >
              <div className="text-2xl mb-1">{CATEGORY_ICONS[cat] ?? '📦'}</div>
              <div className="text-lg font-bold text-text-primary group-hover:text-agro-primary">{countByCat[cat]}</div>
              <div className="text-xs text-text-muted capitalize">{cat}</div>
            </button>
          ))}
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">Com Hedge Disponível</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('hedge')} icon={<ArrowRight size={14} />}>
            Ver todas
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(c => (
            <button
              key={c.id}
              onClick={() => onNavigate('detail', c.id)}
              className="text-left p-4 bg-surface-2 border border-border rounded-[12px] hover:border-agro-primary hover:shadow-[var(--shadow-md)] transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-agro-primary transition-colors">{c.name}</h3>
                  <p className="text-xs text-text-muted capitalize">{c.category}</p>
                </div>
                <Badge variant="primary" size="sm">Hedge</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="gray" size="sm">{c.unit}</Badge>
                <Badge variant="gray" size="sm">{c.preços.moeda}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Margem: <span className="text-agro-primary font-mono">{c.attributes.margem_típica}</span>
                &nbsp;· Vol: <span className="text-agro-secondary font-mono">{c.attributes.volatilidade_histórica}</span>
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
