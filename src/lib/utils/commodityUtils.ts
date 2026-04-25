import type { Commodity, CommoditiesDatabase, CommodityCategory } from '@/lib/types/commodity';
import commoditiesData from '@/data/commodities_database.json';

const commodities = commoditiesData as CommoditiesDatabase;

export function getCommodity(id: string): Commodity | null {
  return commodities[id] ?? null;
}

export function getAllCommodities(): Commodity[] {
  return Object.values(commodities);
}

export function getCommoditiesByCategory(category: CommodityCategory): Commodity[] {
  return getAllCommodities().filter(c => c.category === category);
}

export function getCommoditiesWithHedge(): Commodity[] {
  return getAllCommodities().filter(c => c.attributes.hedge_disponível);
}

export function getCommoditiesWithESG(): Commodity[] {
  return getAllCommodities().filter(c => c.attributes.rastreabilidade_esg);
}

export function getCommoditiesBySazonalidade(sazonalidade: 'alta' | 'média' | 'baixa'): Commodity[] {
  return getAllCommodities().filter(c => c.attributes.sazonalidade === sazonalidade);
}

export function getCommoditiesByPerecibilidade(perecibilidade: 'alta' | 'média' | 'baixa'): Commodity[] {
  return getAllCommodities().filter(c => c.attributes.perecibilidade === perecibilidade);
}

export function getCategories(): CommodityCategory[] {
  return [...new Set(getAllCommodities().map(c => c.category))];
}

export function countByCategory(): Record<string, number> {
  return getAllCommodities().reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
}

export function searchCommodities(query: string): Commodity[] {
  const q = query.toLowerCase();
  return getAllCommodities().filter(
    c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  );
}

export function getStatistics() {
  const all = getAllCommodities();
  return {
    total: all.length,
    categories: getCategories().length,
    withHedge: all.filter(c => c.attributes.hedge_disponível).length,
    withESG: all.filter(c => c.attributes.rastreabilidade_esg).length,
    byCategory: countByCategory(),
  };
}

/** Select-ready options list */
export function getCommodityOptions() {
  return getAllCommodities().map(c => ({
    value: c.id,
    label: c.name,
    group: c.category,
  }));
}
