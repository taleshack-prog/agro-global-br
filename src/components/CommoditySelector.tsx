import { Select } from './ui/Select';
import { getAllCommodities, getCategories } from '../lib/utils/commodityUtils';
import type { CommodityCategory } from '../lib/types/commodity';

interface CommoditySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  category?: CommodityCategory;
  searchable?: boolean;
  clearable?: boolean;
}

export const CommoditySelector = ({
  value = '',
  onChange = () => {},
  label = 'Commodity',
  placeholder = 'Selecione uma commodity',
  category,
  searchable = true,
  clearable = false,
}: CommoditySelectorProps) => {
  const commodities = category
    ? getAllCommodities().filter(c => c.category === category)
    : getAllCommodities();

  const options = commodities.map(c => ({
    value: c.id,
    label: `${c.name} (${c.unit})`,
    group: c.category,
  }));

  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchable={searchable}
      clearable={clearable}
    />
  );
};

interface CategorySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

export const CategorySelector = ({
  value = '',
  onChange = () => {},
  label = 'Categoria',
}: CategorySelectorProps) => {
  const categories = getCategories();

  const options = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];

  return (
    <Select label={label} options={options} value={value} onChange={onChange} />
  );
};
