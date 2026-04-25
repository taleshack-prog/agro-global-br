import { useState } from 'react';
import { Layers, Check, AlertTriangle, Info, Bell, ShoppingCart, FileText, Trash2, Eye, Search, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { Dropdown } from '../ui/Dropdown';
import { Pagination } from '../ui/Pagination';
import { ProgressBar } from '../ui/ProgressBar';
import { DataTable, type TableColumn } from '../ui/Table';
import { useToast } from '../ui/Toast';
import { Breadcrumb } from '../ui/Breadcrumb';

// ─── Demo Section wrapper ─────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2">
      {title}
    </h3>
    {children}
  </div>
);

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const ComponentsShowcase = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(3);
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(true);
  const [selectVal, setSelectVal] = useState('soja');
  const [inputVal, setInputVal] = useState('');
  const [alertClose, setAlertClose] = useState(true);

  const tableData = [
    { id: 'O001', comprador: 'Cargill', produto: 'Soja', volume: 1000, preco: 142.20, status: 'Ativo' },
    { id: 'O002', comprador: 'ADM', produto: 'Milho', volume: 2500, preco: 68.50, status: 'Pendente' },
    { id: 'O003', comprador: 'Bunge', produto: 'Café', volume: 300, preco: 1250.00, status: 'Fechado' },
    { id: 'O004', comprador: 'Louis Dreyfus', produto: 'Soja', volume: 750, preco: 143.80, status: 'Ativo' },
    { id: 'O005', comprador: 'Amaggi', produto: 'Milho', volume: 1800, preco: 67.90, status: 'Pendente' },
  ];

  type OfertaRow = typeof tableData[number];
  const columns: TableColumn<OfertaRow>[] = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'comprador', label: 'Comprador' },
    { key: 'produto', label: 'Produto', render: (v) => <Badge variant={v === 'Soja' ? 'primary' : v === 'Milho' ? 'secondary' : 'accent'}>{String(v)}</Badge> },
    { key: 'volume', label: 'Volume (sc)', align: 'right', mono: true },
    { key: 'preco', label: 'Preço', align: 'right', mono: true, render: (v) => `R$ ${Number(v).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v) => (
      <Badge variant={v === 'Ativo' ? 'primary' : v === 'Pendente' ? 'warning' : 'gray'}>{String(v)}</Badge>
    )},
  ];

  const commodityOptions = [
    { value: 'soja', label: 'Soja', group: 'Grãos' },
    { value: 'milho', label: 'Milho', group: 'Grãos' },
    { value: 'cafe', label: 'Café', group: 'Grãos' },
    { value: 'trigo', label: 'Trigo', group: 'Grãos' },
    { value: 'gado', label: 'Gado (Bovino)', group: 'Proteína' },
    { value: 'suino', label: 'Suíno', group: 'Proteína' },
    { value: 'algodao', label: 'Algodão', group: 'Fibra' },
    { value: 'cana', label: 'Cana-de-Açúcar', group: 'Açúcar' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Breadcrumb showHome items={[{ label: 'Componentes' }]} />
        <h2 className="text-xl font-bold text-text-primary mt-3">Design System — Componentes</h2>
        <p className="text-sm text-text-muted mt-1">Todos os blocos de UI disponíveis no AgroGlobal SuperApp</p>
      </div>

      {/* ── Buttons ─────────────────────────────────────────────────── */}
      <Section title="Buttons">
        <Card>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="muted">Muted</Button>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="primary" size="xs">Extra Small</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="primary" isLoading>Carregando</Button>
            <Button variant="primary" icon={<Bell size={16} />}>Com Ícone</Button>
            <Button variant="primary" isToggled>Toggled</Button>
            <Button variant="primary" disabled>Desabilitado</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" error="Erro ao processar">Com Erro</Button>
            <Button variant="primary" fullWidth>Largura Total</Button>
          </div>
        </Card>
      </Section>

      {/* ── Badges ──────────────────────────────────────────────────── */}
      <Section title="Badges">
        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="gray">Default</Badge>
            <Badge variant="purple">Purple</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary" size="sm">Compacto sm</Badge>
            <Badge variant="danger" size="md">Padrão md</Badge>
          </div>
        </Card>
      </Section>

      {/* ── Alerts ──────────────────────────────────────────────────── */}
      <Section title="Alerts">
        <div className="space-y-3">
          <Alert variant="success" title="Contrato assinado!">Contrato C-2026-001 foi assinado por ambas as partes.</Alert>
          <Alert variant="warning" title="Prazo se aproximando">Você tem 3 contratos vencendo nos próximos 7 dias.</Alert>
          <Alert variant="danger" title="Margem abaixo do mínimo">VaR excedeu o limite configurado em 15%.</Alert>
          {alertClose && (
            <Alert variant="info" title="Novos preços disponíveis" onClose={() => setAlertClose(false)}>
              Cotações de Paranaguá foram atualizadas. Clique X para fechar.
            </Alert>
          )}
        </div>
      </Section>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <Section title="Inputs">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Campo padrão" placeholder="Digite algo..." value={inputVal} onChange={e => setInputVal(e.target.value)} />
            <Input label="Campo obrigatório" placeholder="Obrigatório" required helperText="Este campo é obrigatório" />
            <Input label="Com ícone" placeholder="Buscar commodity..." icon={<Search size={16} />} />
            <Input label="Com erro" placeholder="CPF/CNPJ" error="CPF inválido — verifique o formato" />
            <Input label="Sucesso" placeholder="Email" success value="joao@fazenda.com.br" onChange={() => {}} />
            <Input label="Senha" type="password" placeholder="••••••••" />
            <Input label="Com contador" placeholder="Observações..." maxLength={120} showCharCount value={inputVal} onChange={e => setInputVal(e.target.value)} />
            <Input label="Carregando" placeholder="Aguarde..." isLoading />
          </div>
        </Card>
      </Section>

      {/* ── Select ──────────────────────────────────────────────────── */}
      <Section title="Select">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Select label="Commodity" options={commodityOptions} value={selectVal} onChange={setSelectVal} />
            <Select label="Buscável" options={commodityOptions} value={selectVal} onChange={setSelectVal} searchable placeholder="Buscar..." />
            <Select label="Com limpar" options={commodityOptions} value={selectVal} onChange={setSelectVal} clearable />
            <Select label="Com erro" options={commodityOptions} value="" onChange={() => {}} error="Selecione uma opção" />
            <Select label="Desabilitado" options={commodityOptions} value="soja" onChange={() => {}} disabled />
          </div>
        </Card>
      </Section>

      {/* ── Checkboxes ──────────────────────────────────────────────── */}
      <Section title="Checkboxes">
        <Card>
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Desmarcado" checked={checkA} onChange={e => setCheckA(e.target.checked)} />
            <Checkbox label="Marcado" checked={checkB} onChange={e => setCheckB(e.target.checked)} description="Soja certificada ESG" />
            <Checkbox label="Indeterminado" checked="indeterminate" onChange={() => {}} description="Seleção parcial" />
            <Checkbox label="Desabilitado" checked={false} onChange={() => {}} disabled />
            <Checkbox label="Tamanho sm" size="sm" checked={true} onChange={() => {}} />
            <Checkbox label="Tamanho lg" size="lg" checked={false} onChange={() => {}} />
            <Checkbox label="Com erro" error="Campo obrigatório" checked={false} onChange={() => {}} />
          </div>
        </Card>
      </Section>

      {/* ── Progress Bars ───────────────────────────────────────────── */}
      <Section title="Progress Bars">
        <Card>
          <div className="space-y-4">
            <ProgressBar label="Safra fixada" value={35} color="primary" />
            <ProgressBar label="Score ESG" value={78} color="accent" />
            <ProgressBar label="Limite de crédito" value={43} max={100} color="secondary" sublabel="R$ 860k / R$ 2M" />
            <ProgressBar label="Risco operacional" value={72} color="danger" />
            <ProgressBar value={55} showPercent={false} color="primary" />
          </div>
        </Card>
      </Section>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Section title="Tabs">
        <Card>
          <div className="space-y-8">
            <Tabs
              variant="underline"
              tabs={[
                { value: 'a', label: 'Underline', icon: <Layers size={14} /> },
                { value: 'b', label: 'Com Badge', badge: 3 },
                { value: 'c', label: 'Desabilitado', disabled: true },
              ]}
              defaultValue="a"
            >
              <p className="text-sm text-text-secondary">Conteúdo da tab underline (padrão)</p>
            </Tabs>
            <Tabs
              variant="pills"
              tabs={[
                { value: 'a', label: 'Pills A' },
                { value: 'b', label: 'Pills B' },
                { value: 'c', label: 'Pills C' },
              ]}
              defaultValue="b"
            />
            <Tabs
              variant="segment"
              tabs={[
                { value: 'dia', label: 'Dia' },
                { value: 'semana', label: 'Semana' },
                { value: 'mes', label: 'Mês' },
                { value: 'ano', label: 'Ano' },
              ]}
              defaultValue="semana"
            />
          </div>
        </Card>
      </Section>

      {/* ── Dropdown ────────────────────────────────────────────────── */}
      <Section title="Dropdown">
        <Card>
          <div className="flex flex-wrap gap-4">
            <Dropdown
              label="Ações"
              items={[
                { label: 'Ver Detalhes', value: 'view', icon: <Eye size={14} /> },
                { label: 'Editar', value: 'edit', icon: <FileText size={14} /> },
                { label: 'Excluir', value: 'delete', icon: <Trash2 size={14} />, danger: true, divider: true },
              ]}
              onSelect={v => toast.info(`Ação: ${v}`)}
            />
            <Dropdown
              label="Commodity"
              selected={selectVal}
              items={commodityOptions.slice(0, 5)}
              onSelect={setSelectVal}
            />
            <Dropdown
              trigger={<Button variant="outline" size="sm" icon={<ShoppingCart size={14} />}>Comprar <ChevronDown size={13} /></Button>}
              items={[
                { label: 'Soja — R$ 142,50', value: 'soja' },
                { label: 'Milho — R$ 68,40', value: 'milho' },
                { label: 'Café — R$ 1.250,00', value: 'cafe' },
              ]}
              onSelect={v => toast.success(`Ordem de compra: ${v}`)}
              align="right"
            />
          </div>
        </Card>
      </Section>

      {/* ── Toast ───────────────────────────────────────────────────── */}
      <Section title="Toast / Notificações">
        <Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={<Check size={15} />} onClick={() => toast.success('Contrato assinado com sucesso!', 'Sucesso')}>
              Success
            </Button>
            <Button variant="danger" icon={<AlertTriangle size={15} />} onClick={() => toast.error('Falha ao enviar proposta. Tente novamente.', 'Erro')}>
              Error
            </Button>
            <Button variant="secondary" icon={<AlertTriangle size={15} />} onClick={() => toast.warning('Prazo de entrega em 3 dias!', 'Atenção')}>
              Warning
            </Button>
            <Button variant="accent" icon={<Info size={15} />} onClick={() => toast.info('Novos preços de Paranaguá disponíveis')}>
              Info
            </Button>
          </div>
        </Card>
      </Section>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      <Section title="Modals">
        <Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Abrir Modal
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Confirmar Ação
            </Button>
          </div>
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Nova Proposta de Venda"
          description="Preencha os dados para enviar uma proposta ao livro de ofertas"
          size="lg"
          footer={
            <>
              <Button variant="muted" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => { setModalOpen(false); toast.success('Proposta enviada!'); }}>
                Enviar Proposta
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select label="Commodity" options={commodityOptions} value={selectVal} onChange={setSelectVal} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Volume (sacas)" type="number" placeholder="1000" required />
              <Input label="Preço por saca" type="number" placeholder="142.50" required />
            </div>
            <Input label="Observações" placeholder="Qualidade, condições de entrega..." />
          </div>
        </Modal>

        <Modal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirmar Cancelamento"
          description="Esta ação não pode ser desfeita"
          size="sm"
          footer={
            <>
              <Button variant="muted" size="sm" onClick={() => setConfirmOpen(false)}>Voltar</Button>
              <Button variant="danger" size="sm" onClick={() => { setConfirmOpen(false); toast.error('Contrato cancelado'); }}>
                Confirmar Cancelamento
              </Button>
            </>
          }
        >
          <Alert variant="warning">
            O contrato <strong>C-2026-002</strong> será cancelado permanentemente.
          </Alert>
        </Modal>
      </Section>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <Section title="DataTable">
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={row => toast.info(`Oferta selecionada: ${row.id} — ${row.comprador}`)}
          selectable
          selectedRows={new Set()}
          emptyMessage="Nenhuma oferta encontrada"
        />
      </Section>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      <Section title="Pagination">
        <Card>
          <Pagination
            currentPage={page}
            totalPages={15}
            onPageChange={setPage}
            showTotal
            totalItems={287}
            pageSize={20}
          />
        </Card>
      </Section>

      {/* ── Cards variants ──────────────────────────────────────────── */}
      <Section title="Card Variants">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" hover>
            <CardHeader title="Default" subtitle="Elevação padrão" icon={<Layers size={16} />} />
            <CardContent className="pt-0 pb-0 px-0">
              <p className="text-sm text-text-secondary">Card padrão com hover elevado.</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-text-muted">Rodapé</span>
              <Button size="xs" variant="primary">Ação</Button>
            </CardFooter>
          </Card>
          <Card variant="elevated" hover>
            <CardHeader title="Elevated" subtitle="Sombra maior, sem borda" />
            <p className="text-sm text-text-secondary">Ideal para modais e painéis flutuantes.</p>
          </Card>
          <Card variant="outlined">
            <CardHeader title="Outlined" subtitle="Bordas enfatizadas" />
            <p className="text-sm text-text-secondary">Para seções que precisam de delimitação clara.</p>
          </Card>
        </div>
      </Section>
    </div>
  );
};
