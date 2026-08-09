import React, { useState, useMemo } from 'react';
import { useFinance, Transaction } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents
import FinancialCalendar from './FinancialCalendar';
import AccountsAndCards from './AccountsAndCards';
import ClientsManager from './ClientsManager';
import InvestmentsManager from './InvestmentsManager';
import TrafficManager from './TrafficManager';
import ReportsManager from './ReportsManager';
import DebtManagement from './DebtManagement';
import GoalTracker from './GoalTracker';
import QuickActionModal from './QuickActionModal';
import GlobalSearchModal from './GlobalSearchModal';
import TeamManagement from './TeamManagement';
import MobileBottomNav from './MobileBottomNav';

// Icons
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  CalendarDays, 
  TrendingUp, 
  Zap, 
  Users, 
  CreditCard, 
  BarChart3, 
  History, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Clock, 
  LogOut, 
  ChevronDown, 
  Download, 
  X, 
  CircleAlert,
  Landmark,
  Briefcase,
  AlertTriangle,
  User as UserIcon,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

export type TabType = 
  | 'home' 
  | 'transactions' 
  | 'goals' 
  | 'calendar' 
  | 'investments' 
  | 'traffic' 
  | 'clients' 
  | 'debts' 
  | 'reports' 
  | 'history' 
  | 'settings';

export default function Dashboard() {
  const { profile, logout, switchWorkspace, updateProfile } = useAuth();
  const finance = useFinance();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickActionDefault, setQuickActionDefault] = useState<'income' | 'expense' | 'investment' | 'debt' | 'client' | 'goal' | 'commitment' | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Transaction Ledger Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'income' | 'expense' | 'investment' | 'transfer'>('ALL');

  // Intelligent Alerts (Memoized)
  const intelligentAlerts = useMemo(() => {
    const alerts = [];

    // Overdue or pending client payments
    const pendingClients = finance.clients.filter(c => c.status === 'ATRASADO' || c.status === 'A RECEBER');
    if (pendingClients.length > 0) {
      alerts.push({
        id: 'clients-alert',
        title: 'Recebimentos Pendentes',
        desc: `Você possui ${pendingClients.length} cliente(s) com cobranças a receber (${formatCurrency(finance.stats.totalReceivables)}).`,
        type: 'warning'
      });
    }

    // Debts near due date or delayed
    const delayedDebts = finance.debts.filter(d => d.status === 'delayed');
    if (delayedDebts.length > 0) {
      alerts.push({
        id: 'debts-alert',
        title: 'Dívidas em Atraso',
        desc: `Você possui ${delayedDebts.length} dívida(s) marcadas como atrasadas.`,
        type: 'danger'
      });
    }

    // Goals progress high
    const closeGoals = finance.goals.filter(g => {
      const p = (g.currentAmount / g.targetAmount) * 100;
      return p >= 70 && p < 100;
    });
    if (closeGoals.length > 0) {
      alerts.push({
        id: 'goals-alert',
        title: 'Meta Próxima do Alvo!',
        desc: `O objetivo "${closeGoals[0].title}" está a mais de 70% concluído.`,
        type: 'info'
      });
    }

    return alerts;
  }, [finance.clients, finance.debts, finance.goals, finance.stats]);

  // Next Commitments (Sorted chronologically by date)
  const nextCommitments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const items: Array<{ id: string; title: string; date: string; amount: number; type: 'income' | 'expense' | 'debt' }> = [];

    finance.debts
      .filter(d => d.status === 'active' && d.dueDate)
      .forEach(d => {
        items.push({
          id: d.id,
          title: `Dívida: ${d.title}`,
          date: d.dueDate || todayStr,
          amount: d.monthlyPayment,
          type: 'expense'
        });
      });

    finance.clients
      .filter(c => (c.status === 'A RECEBER' || c.status === 'PENDENTE') && c.paymentDate)
      .forEach(c => {
        items.push({
          id: c.id,
          title: `Cliente: ${c.name}`,
          date: c.paymentDate,
          amount: c.amount,
          type: 'income'
        });
      });

    finance.commitments
      .filter(c => c.status === 'pending')
      .forEach(c => {
        items.push({
          id: c.id,
          title: c.title,
          date: c.dueDate,
          amount: c.amount,
          type: c.type === 'income' ? 'income' : 'expense'
        });
      });

    return items
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [finance.debts, finance.clients, finance.commitments]);

  // Filtered Transactions List for Ledger
  const filteredTransactions = useMemo(() => {
    return finance.transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [finance.transactions, searchTerm, categoryFilter, typeFilter]);

  // Chart Data Evolution based on period
  const evolutionChartData = useMemo(() => {
    const pastDays = chartPeriod === 'week' ? 7 : chartPeriod === 'month' ? 30 : chartPeriod === 'quarter' ? 90 : 365;
    const now = new Date();
    
    // Group transactions by date
    const mapByDate: Record<string, { date: string; income: number; expense: number; investment: number }> = {};

    for (let i = pastDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      mapByDate[dateKey] = { date: dateKey, income: 0, expense: 0, investment: 0 };
    }

    finance.transactions.forEach(t => {
      const td = new Date(t.date);
      const diffDays = Math.floor((now.getTime() - td.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < pastDays) {
        const dateKey = td.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (mapByDate[dateKey]) {
          if (t.type === 'income') mapByDate[dateKey].income += t.amount;
          if (t.type === 'expense') mapByDate[dateKey].expense += t.amount;
          if (t.type === 'investment') mapByDate[dateKey].investment += t.amount;
        }
      }
    });

    const list = Object.values(mapByDate);
    // If list is too long, downsample for performance
    if (list.length > 30) {
      return list.filter((_, idx) => idx % Math.ceil(list.length / 30) === 0);
    }
    return list;
  }, [finance.transactions, chartPeriod]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type,
      t.amount.toString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financeiro_extrato_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'home', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'transactions', label: 'MOVIMENTAÇÕES', icon: ArrowLeftRight },
    { id: 'goals', label: 'OBJETIVOS', icon: Target },
    { id: 'calendar', label: 'CALENDÁRIO', icon: CalendarDays },
    { id: 'investments', label: 'INVESTIMENTOS', icon: TrendingUp },
    { id: 'traffic', label: 'TRÁFEGO', icon: Zap },
    { id: 'clients', label: 'CLIENTES', icon: Users },
    { id: 'debts', label: 'DÍVIDAS', icon: CircleAlert },
    { id: 'reports', label: 'RELATÓRIOS', icon: BarChart3 },
    { id: 'history', label: 'HISTÓRICO', icon: History },
    { id: 'settings', label: 'CONFIGURAÇÕES', icon: Settings },
  ];

  if (finance.loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex transition-colors duration-300">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-[260px] border-r border-zinc-800/80 bg-zinc-950/90 flex-col flex-shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 border-b border-zinc-800/80 relative">
          <div className="px-3 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Gestor Financeiro</span>
          </div>

          <button 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-400 font-bold border border-zinc-700 flex-shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="block font-bold text-xs text-white truncate">
                  {finance.coupleData?.name || 'Espaço Principal'}
                </span>
                <span className="block text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Ativo
                </span>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform flex-shrink-0", showWorkspaceMenu && "rotate-180")} />
          </button>

          {/* Workspace Switch Dropdown */}
          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[calc(100%+8px)] left-4 right-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1"
              >
                <div className="px-3 py-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 mb-1">
                  Seus Espaços
                </div>
                {profile?.workspaceIds?.map(id => (
                  <button
                    key={id}
                    onClick={async () => {
                      await switchWorkspace(id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all",
                      profile.currentCoupleId === id ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900"
                    )}
                  >
                    {id === profile.currentCoupleId && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    Espaço {id.substring(0, 8).toUpperCase()}
                  </button>
                ))}
                <button 
                  onClick={async () => updateProfile({ currentCoupleId: undefined })}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all mt-2 border-t border-zinc-800 pt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Novo Espaço
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 mt-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
                {profile?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.displayName || 'Usuário'}</p>
              <p className="text-[9px] text-zinc-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 text-xs transition-all w-48 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buscar (Ctrl + K)...</span>
          </button>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {/* Global Quick Add Button */}
            <button
              onClick={() => {
                setQuickActionDefault('income');
                setShowQuickModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nova Ação</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="flex-1 p-4 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* 1. INÍCIO / DASHBOARD */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Intelligent Alerts Banner */}
              {intelligentAlerts.length > 0 && (
                <div className="space-y-2">
                  {intelligentAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className="bg-zinc-950 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <CircleAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{alert.title}</h4>
                          <p className="text-[11px] text-zinc-400">{alert.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Central Command KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Saldo Atual */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Saldo Atual</span>
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-white">{formatCurrency(finance.stats.balance)}</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Disponível consolidado</p>
                </div>

                {/* Entradas Mês */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Entradas Mês</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-emerald-400">+{formatCurrency(finance.stats.totalIncomeMonth)}</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Receita no período</p>
                </div>

                {/* Saídas Mês */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Saídas Mês</span>
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-xl font-black text-rose-400">-{formatCurrency(finance.stats.totalExpenseMonth)}</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Despesas do mês</p>
                </div>

                {/* Investimentos */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Investimentos</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-xl font-black text-cyan-400">{formatCurrency(finance.stats.totalInvestmentsPortfolio)}</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Patrimônio investido</p>
                </div>

                {/* Resultado do Mês */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Resultado Mês</span>
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className={cn("text-xl font-black", finance.stats.monthResult >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {finance.stats.monthResult >= 0 ? '+' : ''}{formatCurrency(finance.stats.monthResult)}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-bold">Lucro / Superávit</p>
                </div>

                {/* A Receber */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-1 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Valores a Receber</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xl font-black text-amber-400">{formatCurrency(finance.stats.totalReceivables)}</p>
                  <p className="text-[9px] text-zinc-500 font-bold">Clientes a receber</p>
                </div>
              </div>

              {/* Financial Evolution Chart & Next Commitments Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Chart */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-base font-bold text-white">Evolução Financeira</h3>
                    </div>
                    <div className="flex gap-1 bg-zinc-900 p-1 border border-zinc-800 rounded-xl">
                      {(['week', 'month', 'quarter', 'year'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setChartPeriod(p)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                            chartPeriod === p ? "bg-emerald-400 text-black" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          {p === 'week' ? '7D' : p === 'month' ? '30D' : p === 'quarter' ? '90D' : '1 Ano'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Entradas" />
                        <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={false} name="Saídas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Próximos Compromissos Section */}
                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base font-bold text-white">Próximos Compromissos</h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {nextCommitments.map(item => (
                        <div key={item.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-white">{item.title}</p>
                            <p className="text-[10px] text-zinc-500 font-bold">
                              {new Date(item.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={cn("font-bold text-xs", item.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}

                      {nextCommitments.length === 0 && (
                        <p className="text-xs text-zinc-500 text-center py-8">Nenhum compromisso financeiro pendente.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Accounts & Visual Cards View */}
              <AccountsAndCards />
            </div>
          )}

          {/* 2. MOVIMENTAÇÕES (Ledger) */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Extrato e Movimentações</h2>
                  <p className="text-xs text-zinc-400">Histórico completo de entradas, saídas e transferências entre contas</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold border border-zinc-800 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" /> Exportar CSV
                  </button>
                  <button
                    onClick={() => {
                      setQuickActionDefault('income');
                      setShowQuickModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Novo Lançamento
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-4 border border-zinc-800 rounded-2xl">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar por descrição..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  {(['ALL', 'income', 'expense', 'investment'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                        typeFilter === t 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                      )}
                    >
                      {t === 'ALL' ? 'Todos' : t === 'income' ? 'Entradas' : t === 'expense' ? 'Saídas' : 'Investimentos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="divide-y divide-zinc-900">
                  {filteredTransactions.map(t => {
                    const getSourceBadge = () => {
                      if (t.source === 'CLIENT_PAYMENT') return <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold">CLIENTE</span>;
                      if (t.source === 'TRAFFIC_EXPENSE') return <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-extrabold">TRÁFEGO</span>;
                      if (t.source === 'DEBT_PAYMENT') return <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-extrabold">DÍVIDA</span>;
                      if (t.source === 'INVESTMENT') return <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-extrabold">INVESTIMENTO</span>;
                      return null;
                    };

                    return (
                      <div key={t.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
                            t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-white">{t.description}</p>
                              {getSourceBadge()}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
                              {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category} {t.accountName ? `• ${t.accountName}` : ''} {t.userName ? `• por ${t.userName}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={cn("font-black text-base", t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                          <button
                            onClick={() => {
                              if (confirm('Excluir esta movimentação?')) finance.deleteTransaction(t.id);
                            }}
                            className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredTransactions.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      Nenhuma movimentação encontrada.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. OBJETIVOS */}
          {activeTab === 'goals' && <GoalTracker />}

          {/* 4. CALENDÁRIO */}
          {activeTab === 'calendar' && <FinancialCalendar />}

          {/* 5. INVESTIMENTOS */}
          {activeTab === 'investments' && <InvestmentsManager />}

          {/* 6. TRÁFEGO */}
          {activeTab === 'traffic' && <TrafficManager />}

          {/* 7. CLIENTES */}
          {activeTab === 'clients' && <ClientsManager />}

          {/* 8. DÍVIDAS */}
          {activeTab === 'debts' && <DebtManagement />}

          {/* 9. RELATÓRIOS */}
          {activeTab === 'reports' && <ReportsManager />}

          {/* 10. HISTÓRICO */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Histórico e Auditoria</h2>
                <p className="text-xs text-zinc-400">Registro de todas as ações e atualizações realizadas no sistema</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                {finance.logs.map(log => (
                  <div key={log.id} className="p-3 border-b border-zinc-900 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{log.action}</p>
                      <p className="text-[10px] text-zinc-500">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}

                {finance.logs.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-6">Nenhum log gravado até o momento.</p>
                )}
              </div>
            </div>
          )}

          {/* 11. CONFIGURAÇÕES */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Configurações</h2>
                <p className="text-xs text-zinc-400">Preferências da conta, compartilhamento de espaço e gestão de equipe</p>
              </div>

              {/* Equipe e Compartilhamento */}
              <TeamManagement />

              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-6 max-w-xl shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dados do Espaço</h3>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Nome do Espaço</label>
                  <p className="text-sm font-bold text-emerald-400">{finance.coupleData?.name || 'Espaço Principal'}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">E-mail Cadastrado</label>
                  <p className="text-sm text-zinc-300">{profile?.email}</p>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => logout()}
                    className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-all"
                  >
                    Encerrar Sessão
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        defaultAction={quickActionDefault}
      />

      {/* Global Search Popup */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
