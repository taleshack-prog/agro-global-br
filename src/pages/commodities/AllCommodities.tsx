import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable, type TableColumn } from '../../components/ui/Table';
import { getAllCommodities, searchCommodities, getCategories } from '../../lib/utils/commodityUtils';
import type { Commodity } from '../../lib/types/commodity';

export const AllCommodities = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortKey, setSortKey] = useState<'name-asc' | 'name-desc' | 'category-asc' | 'category-desc'>('name-asc');

  const categories = getCategories();

  const catOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Nome (A→Z)' },
    { value: 'name-desc', label: 'Nome (Z→A)' },
    { value: 'category-asc', label: 'Categoria (A→Z)' },
    { value: 'category-desc', label: 'Categoria (Z→A)' },
  ];

  const data = useMemo(() => {
    let list = query.length >= 2 ? searchCommodities(query) : getAllCommodities();
    if (category) list = list.filter(c => c.category === category);
    const [field, order] = sortKey.split('-') as ['name' | 'category', 'asc' | 'desc'];
    return [...list].sort((a, b) => {
      const cmp = a[field].localeCompare(b[field]);
      return order === 'asc' ? cmp : -cmp;
    });
  }, [query, category, sortKey]);

  const columns: TableColumn<Commodity>[] = [
    {
      key: 'name', label: 'Nome', sortable: true,
      render: (v, row) => (
        <button onClick={() => navigate(`/commodities/${row.id}`)} className="text-agro-primary hover:underline font-semibold text-left">
          {String(v)}
        </button>
      ),
    },
    {
      key: 'category', label: 'Categoria',
      render: (v) => <Badge variant="accent" size="sm">{String(v)}</Badge>,
    },
    { key: 'unit', label: 'Unidade', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
    {
      key: 'attributes', label: 'Margem',
      render: (v: any) => <span className="text-agro-primary font-mono text-xs font-semibold">{v.margem_típica}</span>,
    },
    {
      key: 'attributes', label: 'Volatilidade',
      render: (v: any) => <span className="text-agro-secondary font-mono text-xs">{v.volatilidade_histórica}</span>,
    },
    {
      key: 'attributes', label: 'Hedge', align: 'center',
      render: (v: any) => <Badge variant={v.hedge_disponível ? 'primary' : 'gray'} size="sm">{v.hedge_disponível ? 'Sim' : 'Não'}</Badge>,
    },
    {
      key: 'preços', label: 'Atualização', align: 'center',
      render: (v: any) => <Badge variant={v.atualização === 'tempo_real' ? 'primary' : v.atualização === 'diária' ? 'accent' : 'gray'} size="sm">{v.atualização}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Todas as Commodities</h1>
        <p className="text-sm text-text-muted mt-0.5">{data.length} produtos encontrados</p>
      </div>

      <Card>
        <CardHeader title="Filtros" subtitle="Combine filtros para refinar a busca" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nome ou categoria..."
            icon={<Search size={15} />}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Select options={catOptions} value={category} onChange={setCategory} placeholder="Categoria" />
          <Select options={sortOptions} value={sortKey} onChange={v => setSortKey(v as any)} />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data}
        onRowClick={row => navigate(`/commodities/${row.id}`)}
        emptyMessage="Nenhuma commodity encontrada"
      />
    </div>
  );
};
