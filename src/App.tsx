import { useState } from 'react';
import {
  LayoutDashboard, Shield, Store, CreditCard,
  Truck, Leaf, Bell, Settings, ChevronRight, Menu, X,
  TrendingUp, User
} from 'lucide-react';
import { DashboardMercado } from './components/modules/DashboardMercado';
import { GestaoRisco } from './components/modules/GestaoRisco';
import { MesaNegociacao } from './components/modules/MesaNegociacao';
import { FinanceiroCredito } from './components/modules/FinanceiroCredito';
import { LogisticaInteligente } from './components/modules/LogisticaInteligente';
import { ESGRastreabilidade } from './components/modules/ESGRastreabilidade';

// Each module's icon color and active background uses the design tokens:
// accent (#3B82F6), secondary (#F59E0B), primary (#10B981), danger (#EF4444)
const modules = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Painel de Controle',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-[#3B82F6]',        // agro-accent
    bgActive: 'bg-[#3B82F6]/10 border-[#3B82F6]/40',
  },
  {
    id: 'risco',
    label: 'Gest. de Risco',
    sublabel: 'Recomendador de Hedge',
    icon: Shield,
    badge: '!',
    color: 'text-[#F59E0B]',        // agro-secondary
    bgActive: 'bg-[#F59E0B]/10 border-[#F59E0B]/40',
  },
  {
    id: 'negociacao',
    label: 'Mesa Digital',
    sublabel: 'Marketplace / Corretora',
    icon: Store,
    badge: '5',
    color: 'text-[#10B981]',        // agro-primary
    bgActive: 'bg-[#10B981]/10 border-[#10B981]/40',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    sublabel: 'Crédito & CPR',
    icon: CreditCard,
    badge: null,
    color: 'text-purple-400',
    bgActive: 'bg-purple-900/30 border-purple-700/50',
  },
  {
    id: 'logistica',
    label: 'Logística',
    sublabel: 'Frete & Netback',
    icon: Truck,
    badge: null,
    color: 'text-[#F59E0B]',        // agro-secondary
    bgActive: 'bg-[#F59E0B]/10 border-[#F59E0B]/40',
  },
  {
    id: 'esg',
    label: 'ESG',
    sublabel: 'Rastreabilidade',
    icon: Leaf,
    badge: null,
    color: 'text-[#10B981]',        // agro-primary
    bgActive: 'bg-[#10B981]/10 border-[#10B981]/40',
  },
];

const moduleComponents: Record<string, React.ReactNode> = {
  dashboard: <DashboardMercado />,
  risco: <GestaoRisco />,
  negociacao: <MesaNegociacao />,
  financeiro: <FinanceiroCredito />,
  logistica: <LogisticaInteligente />,
  esg: <ESGRastreabilidade />,
};

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = modules.find(m => m.id === activeModule)!;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 bg-[#10B981] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary leading-tight">AgroGlobal</div>
            <div className="text-xs text-text-muted">SuperApp B2B</div>
          </div>
          <button
            className="ml-auto lg:hidden text-text-muted hover:text-text-primary"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Fazenda Info */}
        <div className="mx-4 my-3 p-3 bg-surface-2 rounded-[12px] border border-border">
          <div className="text-xs text-text-muted mb-0.5">Fazenda Selecionada</div>
          <div className="text-sm font-semibold text-text-primary">Faz. Santa Maria</div>
          <div className="text-xs text-text-secondary">Sorriso, MT · 800 ha</div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-[9999px] bg-[#10B981] animate-pulse" />
            <span className="text-xs text-[#10B981]">Dados em tempo real</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {modules.map(mod => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveModule(mod.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-[12px] text-left transition-all duration-150
                  ${isActive
                    ? `${mod.bgActive} border ${mod.color}`
                    : 'hover:bg-surface-2 text-text-secondary border border-transparent hover:text-text-primary'
                  }
                `}
              >
                <Icon size={18} className={isActive ? mod.color : ''} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium leading-tight ${isActive ? 'text-text-primary' : ''}`}>
                    {mod.label}
                  </div>
                  <div className="text-xs text-text-muted truncate">{mod.sublabel}</div>
                </div>
                {mod.badge && (
                  <span className="bg-[#EF4444] text-white text-xs rounded-[9999px] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                    {mod.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className={mod.color} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors">
            <Settings size={16} />
            <span className="text-sm">Configurações</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 bg-green-700 rounded-[9999px] flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-text-primary truncate">João Silva</div>
              <div className="text-xs text-text-muted truncate">Fazendeiro · Pro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-surface border-b border-border shrink-0">
          <button
            className="lg:hidden text-text-secondary hover:text-text-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <current.icon size={16} className={current.color} />
              <h1 className="text-base font-bold text-text-primary truncate">{current.label}</h1>
            </div>
            <p className="text-xs text-text-muted truncate">{current.sublabel}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Safra selector */}
            <select className="hidden sm:block bg-surface-2 border border-border rounded-[12px] px-3 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-none focus:border-green-600">
              <option>Safra 2025/26</option>
              <option>Safra 2026/27</option>
            </select>

            {/* Notifications */}
            <button className="relative p-2 rounded-[12px] bg-surface-2 border border-border text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-[9999px] flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {moduleComponents[activeModule]}
        </main>
      </div>
    </div>
  );
}
