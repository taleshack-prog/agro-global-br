import { useState, useMemo } from 'react';
import {
  Search, Filter, TrendingUp, Shield, Leaf, BarChart3,
  Clock, Thermometer, Package, CreditCard, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { DataTable, type TableColumn } from '../ui/Table';
import { ProgressBar } from '../ui/ProgressBar';
import {
  getAllCommodities,
  getCommodity,
  getCommoditiesByCategory,
  getCommoditiesWithHedge,
  getCommoditiesByPerecibilidade,
  getCommoditiesBySazonalidade,
  getCategories,
  countByCategory,
  searchCommodities,
  getStatistics,
} from '../../lib/utils/commodityUtils';
import type { Commodity, CommodityCategory } from '../../lib/types/commodity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
  'grãos':      'primary',
  'proteína':   'secondary',
  'açúcar':     'warning',
  'energia':    'accent',
  'fibra':      'info',
  'frutas':     'secondary',
  'hortaliças': 'primary',
  'lácteos':    'gray',
  'pescado':    'accent',
  'madeira':    'gray',
};

const PEREC_COLORS: Record<string, 'primary' | 'secondary' | 'danger'> = {
  baixa: 'primary', média: 'secondary', alta: 'danger',
};

const SAZON_COLORS: Record<string, 'primary' | 'secondary' | 'warning'> = {
  baixa: 'primary', média: 'secondary', alta: 'warning',
};

// ─── Commodity Detail Panel ───────────────────────────────────────────────────

const CommodityDetail = ({ commodity }: { commodity: Commodity }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center gap-3">
      <div className="p-3 bg-agro-primary/10 rounded-[12px]">
        <Package size={22} className="text-agro-primary" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary">{commodity.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={CATEGORY_COLORS[commodity.category] ?? 'gray'}>{commodity.category}</Badge>
          <span className="text-xs text-text-muted">Unidade: {commodity.unit}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {/* Atributos */}
      <Card className="!p-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Atributos</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Perecibilidade</span>
            <Badge variant={PEREC_COLORS[commodity.attributes.perecibilidade]}>{commodity.attributes.perecibilidade}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Sazonalidade</span>
            <Badge variant={SAZON_COLORS[commodity.attributes.sazonalidade]}>{commodity.attributes.sazonalidade}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Hedge disponível</span>
            {commodity.attributes.hedge_disponível
              ? <CheckCircle size={16} className="text-agro-primary" />
              : <XCircle size={16} className="text-text-muted" />}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">ESG</span>
            {commodity.attributes.rastreabilidade_esg
              ? <CheckCircle size={16} className="text-agro-primary" />
              : <XCircle size={16} className="text-text-muted" />}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Margem típica</span>
            <span className="text-text-primary font-mono text-xs">{commodity.attributes.margem_típica}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Volatilidade</span>
            <span className="text-agro-secondary font-mono text-xs">{commodity.attributes.volatilidade_histórica}</span>
          </div>
        </div>
      </Card>

      {/* Logística */}
      <Card className="!p-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Thermometer size={12} /> Logística
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Peso/unidade</span>
            <span className="text-text-primary font-mono text-xs">{commodity.logística.peso_médio_saca} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Temperatura</span>
            <span className="text-text-primary font-mono text-xs">{commodity.logística.temperatura_armazenagem}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Umidade ideal</span>
            <span className="text-text-primary font-mono text-xs">{commodity.logística.umidade_ideal}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Validade</span>
            <span className={`font-mono text-xs ${commodity.logística.prazo_validade < 15 ? 'text-agro-danger' : 'text-text-primary'}`}>
              {commodity.logística.prazo_validade} dias
            </span>
          </div>
        </div>
      </Card>

      {/* Preços */}
      <Card className="!p-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <TrendingUp size={12} /> Preços
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Atualização</span>
            <Badge variant={commodity.preços.atualização === 'tempo_real' ? 'primary' : commodity.preços.atualização === 'diária' ? 'accent' : 'gray'}>
              {commodity.preços.atualização}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Moeda</span>
            <span className="text-text-primary font-mono text-xs">{commodity.preços.moeda}</span>
          </div>
          <div>
            <span className="text-text-secondary text-xs">Fontes</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {commodity.preços.fontes.map(f => (
                <Badge key={f} variant="gray" size="sm">{f}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Financeiro */}
      <Card className="!p-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <CreditCard size={12} /> Financeiro
        </p>
        <div className="space-y-2 text-sm">
          {[
            ['Crédito', commodity.financeiro.crédito_disponível],
            ['Seguro', commodity.financeiro.seguro_disponível],
            ['CPR Fracionável', commodity.financeiro.cpr_fracionável],
          ].map(([label, val]) => (
            <div key={String(label)} className="flex justify-between items-center">
              <span className="text-text-secondary">{String(label)}</span>
              {val
                ? <CheckCircle size={16} className="text-agro-primary" />
                : <XCircle size={16} className="text-text-muted" />}
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-text-secondary">Taxa média</span>
            <span className="text-text-primary font-mono text-xs">{commodity.financeiro.taxa_média_financiamento}</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// ─── Main Explorer ────────────────────────────────────────────────────────────

export const CommodityExplorer = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [perecFilter, setPerecFilter] = useState('');
  const [sazonFilter, setSazonFilter] = useState('');
  const [hedgeOnly, setHedgeOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => getStatistics(), []);
  const categories = useMemo(() => getCategories(), []);
  const countByCat = useMemo(() => countByCategory(), []);

  const filtered = useMemo(() => {
    let list = search.length >= 2 ? searchCommodities(search) : getAllCommodities();
    if (categoryFilter) list = list.filter(c => c.category === categoryFilter);
    if (perecFilter)   list = list.filter(c => c.attributes.perecibilidade === perecFilter);
    if (sazonFilter)   list = list.filter(c => c.attributes.sazonalidade === sazonFilter);
    if (hedgeOnly)     list = list.filter(c => c.attributes.hedge_disponível);
    return list;
  }, [search, categoryFilter, perecFilter, sazonFilter, hedgeOnly]);

  const selected = selectedId ? getCommodity(selectedId) : null;

  const catOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(c => ({ value: c, label: `${c} (${countByCat[c]})` })),
  ];

  const tableColumns: TableColumn<Commodity>[] = [
    { key: 'name', label: 'Nome' },
    { key: 'category', label: 'Categoria', render: (v) => <Badge variant={CATEGORY_COLORS[String(v)] ?? 'gray'}>{String(v)}</Badge> },
    { key: 'unit', label: 'Unidade' },
    {
      key: 'attributes', label: 'Hedge', align: 'center',
      render: (v: any) => v.hedge_disponível
        ? <CheckCircle size={15} className="text-agro-primary mx-auto" />
        : <XCircle size={15} className="text-text-muted mx-auto" />,
    },
    {
      key: 'attributes', label: 'Perecibilidade', align: 'center',
      render: (v: any) => <Badge variant={PEREC_COLORS[v.perecibilidade]}>{v.perecibilidade}</Badge>,
    },
    {
      key: 'attributes', label: 'Sazonalidade', align: 'center',
      render: (v: any) => <Badge variant={SAZON_COLORS[v.sazonalidade]}>{v.sazonalidade}</Badge>,
    },
    {
      key: 'preços', label: 'Atualização', align: 'center',
      render: (v: any) => (
        <Badge variant={v.atualização === 'tempo_real' ? 'primary' : v.atualização === 'diária' ? 'accent' : 'gray'}>
          {v.atualização}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Commodity Explorer</h2>
        <p className="text-sm text-text-muted mt-0.5">
          {stats.total} commodities · {stats.categories} categorias · {stats.withHedge} com hedge
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <div className="text-3xl font-bold text-agro-primary">{stats.total}</div>
          <div className="text-xs text-text-muted mt-1">Total</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-3xl font-bold text-agro-accent">{stats.categories}</div>
          <div className="text-xs text-text-muted mt-1">Categorias</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-3xl font-bold text-agro-secondary">{stats.withHedge}</div>
          <div className="text-xs text-text-muted mt-1">Com Hedge</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-3xl font-bold text-agro-primary">{stats.withESG}</div>
          <div className="text-xs text-text-muted mt-1">Com ESG</div>
        </Card>
      </div>

      {/* Distribuição por categoria */}
      <Card>
        <CardHeader title="Distribuição por Categoria" icon={<BarChart3 size={16} />} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(countByCat).map(([cat, count]) => (
            <div
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
              className={`p-3 rounded-[8px] border cursor-pointer transition-all duration-150 text-center
                ${categoryFilter === cat ? 'border-agro-primary bg-agro-primary/10' : 'border-border hover:border-agro-primary/50'}`}
            >
              <div className="text-2xl font-bold text-text-primary">{count}</div>
              <div className="text-xs text-text-muted capitalize mt-0.5">{cat}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader title="Filtros" subtitle={`${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`} icon={<Filter size={16} />} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Buscar commodity..."
            icon={<Search size={15} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            options={catOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Categoria"
          />
          <Select
            options={[
              { value: '', label: 'Perecibilidade' },
              { value: 'alta', label: 'Alta' },
              { value: 'média', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
            value={perecFilter}
            onChange={setPerecFilter}
          />
          <Select
            options={[
              { value: '', label: 'Sazonalidade' },
              { value: 'alta', label: 'Alta' },
              { value: 'média', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
            value={sazonFilter}
            onChange={setSazonFilter}
          />
        </div>
        <button
          onClick={() => setHedgeOnly(h => !h)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-sm font-medium transition-colors ${
            hedgeOnly ? 'bg-agro-primary/10 border-agro-primary text-agro-primary' : 'border-border text-text-muted hover:border-agro-primary/50'
          }`}
        >
          <Shield size={14} />
          Apenas com Hedge ({getCommoditiesWithHedge().length})
        </button>
      </Card>

      {/* Tabs: Tabela | Detalhe */}
      <Tabs
        variant="underline"
        tabs={[
          { value: 'tabela', label: 'Tabela', icon: <BarChart3 size={14} /> },
          { value: 'detalhe', label: selected ? `Detalhe — ${selected.name}` : 'Detalhe', icon: <Package size={14} />, disabled: !selected },
        ]}
        value={selected ? undefined : 'tabela'}
        defaultValue="tabela"
      >
        {/* Tabela */}
        {!selected ? (
          <DataTable
            columns={tableColumns}
            data={filtered}
            onRowClick={row => setSelectedId(row.id)}
            emptyMessage="Nenhuma commodity encontrada"
          />
        ) : (
          <div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-agro-primary hover:underline mb-4 flex items-center gap-1"
            >
              ← Voltar para a tabela
            </button>
            <CommodityDetail commodity={selected} />
          </div>
        )}
      </Tabs>

      {/* Destaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hedge disponível */}
        <Card>
          <CardHeader title="Com Hedge Disponível" subtitle="Instrumentos de proteção de preço" icon={<Shield size={16} />} />
          <div className="flex flex-wrap gap-2">
            {getCommoditiesWithHedge().map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="px-3 py-1.5 bg-agro-primary/10 text-agro-primary text-sm font-medium rounded-[8px] hover:bg-agro-primary/20 transition-colors"
              >
                {c.name}
              </button>
            ))}
          </div>
        </Card>

        {/* Alta sazonalidade */}
        <Card>
          <CardHeader title="Alta Sazonalidade" subtitle="Maior volatilidade sazonal" icon={<Clock size={16} />} />
          <div className="space-y-2">
            {getCommoditiesBySazonalidade('alta').slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <button
                  onClick={() => setSelectedId(c.id)}
                  className="text-sm text-text-primary hover:text-agro-primary transition-colors font-medium"
                >
                  {c.name}
                </button>
                <div className="flex items-center gap-2">
                  <Badge variant={CATEGORY_COLORS[c.category] ?? 'gray'} size="sm">{c.category}</Badge>
                  <span className="text-xs text-agro-secondary font-mono">{c.attributes.volatilidade_histórica}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Perecíveis */}
        <Card>
          <CardHeader title="Alta Perecibilidade" subtitle="Requerem logística refrigerada" icon={<Thermometer size={16} />} />
          <div className="space-y-2">
            {getCommoditiesByPerecibilidade('alta').slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <button
                  onClick={() => setSelectedId(c.id)}
                  className="text-sm text-text-primary hover:text-agro-primary transition-colors font-medium"
                >
                  {c.name}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-agro-danger font-mono">{c.logística.prazo_validade}d</span>
                  <Badge variant="danger" size="sm">alta</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ESG Score por categoria */}
        <Card>
          <CardHeader title="Cobertura ESG por Categoria" subtitle="% com rastreabilidade" icon={<Leaf size={16} />} />
          <div className="space-y-3">
            {Object.entries(countByCat).map(([cat, total]) => {
              const withESG = getCommoditiesByCategory(cat as CommodityCategory)
                .filter(c => c.attributes.rastreabilidade_esg).length;
              return (
                <ProgressBar
                  key={cat}
                  label={cat}
                  value={withESG}
                  max={total}
                  sublabel={`${withESG}/${total}`}
                  color="primary"
                />
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
