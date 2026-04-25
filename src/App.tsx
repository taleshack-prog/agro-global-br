import { useState } from 'react';
import {
  LayoutDashboard, Shield, Store, CreditCard,
  Truck, Leaf, Bell, Settings, Menu, TrendingUp, User
} from 'lucide-react';
import { DashboardMercado } from './components/modules/DashboardMercado';
import { GestaoRisco } from './components/modules/GestaoRisco';
import { MesaNegociacao } from './components/modules/MesaNegociacao';
import { FinanceiroCredito } from './components/modules/FinanceiroCredito';
import { LogisticaInteligente } from './components/modules/LogisticaInteligente';
import { ESGRastreabilidade } from './components/modules/ESGRastreabilidade';
import { Sidebar, type SidebarItem } from './components/ui/Sidebar';
import { Breadcrumb } from './components/ui/Breadcrumb';
import { useToast } from './components/ui/Toast';

// ─── Nav config ──────────────────────────────────────────────────────────────

const NAV_ITEMS: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Painel de Controle',
    icon: <LayoutDashboard size={18} />,
    color: 'text-agro-accent',
    bgActive: 'bg-agro-accent/10 border-agro-accent/40',
  },
  {
    id: 'risco',
    label: 'Gest. de Risco',
    sublabel: 'Recomendador de Hedge',
    icon: <Shield size={18} />,
    badge: '!',
    badgeVariant: 'danger',
    color: 'text-agro-secondary',
    bgActive: 'bg-agro-secondary/10 border-agro-secondary/40',
  },
  {
    id: 'negociacao',
    label: 'Mesa Digital',
    sublabel: 'Marketplace / Corretora',
    icon: <Store size={18} />,
    badge: 5,
    badgeVariant: 'primary',
    color: 'text-agro-primary',
    bgActive: 'bg-agro-primary/10 border-agro-primary/40',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    sublabel: 'Crédito & CPR',
    icon: <CreditCard size={18} />,
    color: 'text-purple-400',
    bgActive: 'bg-purple-900/30 border-purple-700/50',
  },
  {
    id: 'logistica',
    label: 'Logística',
    sublabel: 'Frete & Netback',
    icon: <Truck size={18} />,
    color: 'text-agro-secondary',
    bgActive: 'bg-agro-secondary/10 border-agro-secondary/40',
  },
  {
    id: 'esg',
    label: 'ESG',
    sublabel: 'Rastreabilidade',
    icon: <Leaf size={18} />,
    color: 'text-agro-primary',
    bgActive: 'bg-agro-primary/10 border-agro-primary/40',
  },
];

const MODULE_COMPONENTS: Record<string, React.ReactNode> = {
  dashboard: <DashboardMercado />,
  risco:     <GestaoRisco />,
  negociacao: <MesaNegociacao />,
  financeiro: <FinanceiroCredito />,
  logistica:  <LogisticaInteligente />,
  esg:        <ESGRastreabilidade />,
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const current = NAV_ITEMS.find(m => m.id === activeModule)!;

  // Sidebar header slot
  const sidebarHeader = (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="w-9 h-9 bg-agro-primary rounded-[12px] flex items-center justify-center shadow-[var(--shadow-primary)]">
        <TrendingUp size={20} className="text-white" />
      </div>
      <div>
        <div className="text-sm font-bold text-text-primary leading-tight">AgroGlobal</div>
        <div className="text-xs text-text-muted">SuperApp B2B</div>
      </div>
    </div>
  );

  // Sidebar info slot (selected farm)
  const sidebarInfo = (
    <div className="mx-4 mb-3 p-3 bg-surface-2 rounded-[12px] border border-border">
      <div className="text-xs text-text-muted mb-0.5">Fazenda Selecionada</div>
      <div className="text-sm font-semibold text-text-primary">Faz. Santa Maria</div>
      <div className="text-xs text-text-secondary">Sorriso, MT · 800 ha</div>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-[9999px] bg-agro-primary animate-pulse" />
        <span className="text-xs text-agro-primary">Dados em tempo real</span>
      </div>
    </div>
  );

  // Sidebar footer slot
  const sidebarFooter = (
    <div className="p-4 space-y-1">
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
        onClick={() => toast.info('Configurações em breve', 'Em desenvolvimento')}
      >
        <Settings size={16} />
        <span className="text-sm">Configurações</span>
      </button>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-7 h-7 bg-agro-primary rounded-[9999px] flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text-primary truncate">João Silva</div>
          <div className="text-xs text-text-muted truncate">Fazendeiro · Pro</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        header={sidebarHeader}
        info={sidebarInfo}
        sections={[{ items: NAV_ITEMS }]}
        activeId={activeModule}
        onSelect={setActiveModule}
        footer={sidebarFooter}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-surface border-b border-border shrink-0">
          <button
            className="lg:hidden text-text-muted hover:text-text-primary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <Breadcrumb
              showHome
              items={[{ label: current.label }]}
            />
          </div>

          <div className="flex items-center gap-3">
            <select className="hidden sm:block bg-surface-2 border border-border rounded-[8px] px-3 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-agro-primary">
              <option>Safra 2025/26</option>
              <option>Safra 2026/27</option>
            </select>

            <button
              className="relative p-2 rounded-[8px] bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors"
              onClick={() => toast.info('Você tem 3 alertas não lidos')}
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-agro-danger text-white text-xs rounded-[9999px] flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {MODULE_COMPONENTS[activeModule]}
        </main>
      </div>
    </div>
  );
}
