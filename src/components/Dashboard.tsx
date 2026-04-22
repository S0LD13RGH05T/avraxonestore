import React, { useState } from 'react';
import { useFinance, Transaction, Goal, Debt } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import DebtManagement from './DebtManagement';
import GoalTracker from './GoalTracker';
import FinancialCalendar from './FinancialCalendar';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Calendar, 
  Target, 
  AlertCircle,
  LogOut,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  CreditCard,
  Flag,
  Zap,
  ChevronDown,
  Briefcase,
  User as UserIcon,
  Heart,
  X,
  Share2,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
type Tab = 'home' | 'debts' | 'goals' | 'calendar' | 'relationship';

export default function Dashboard() {
  const { profile, logout, switchWorkspace, updateProfile } = useAuth();
  const finance = useFinance();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddModal, setShowAddModal] = useState<'income' | 'expense' | null>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteAlert, setShowInviteAlert] = useState(() => {
    return sessionStorage.getItem('invite_alert_dismissed') !== 'true';
  });

  const dismissInviteAlert = () => {
    setShowInviteAlert(false);
    sessionStorage.setItem('invite_alert_dismissed', 'true');
  };

  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [iconScale, setIconScale] = useState(1);

  const filteredTransactions = finance.transactions.filter(t => {
    const d = new Date(t.date);
    const matchesMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  const balance = finance.transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Export CSV function
  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type === 'income' ? 'Entrada' : 'Saída',
      t.amount.toString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financeiro_${currentMonth + 1}_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleAddWorkspace = async () => {
    await updateProfile({ currentCoupleId: undefined });
  };

  if (finance.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const individualIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.userId === profile?.uid)
    .reduce((acc, t) => acc + t.amount, 0);

  const individualExpense = filteredTransactions
    .filter(t => t.type === 'expense' && t.userId === profile?.uid)
    .reduce((acc, t) => acc + t.amount, 0);

  const individualBalance = individualIncome - individualExpense;
  const partnerBalance = balance - individualBalance;

  // Chart data
  const chartData = filteredTransactions
    .slice(0, 10)
    .reverse()
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount: t.type === 'income' ? t.amount : -t.amount
    }));

  const expenseByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#7C3AED', '#F97316', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] border-r border-slate-800 bg-slate-900/50 flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-800 relative">
          <div className="px-3 mb-2 flex items-center gap-2">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Gestor Financeiro</span>
          </div>
          <button 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-700 flex-shrink-0">
                {finance.coupleData?.type === 'Business' ? <Briefcase className="w-5 h-5 text-slate-300" /> : <UserIcon className="w-5 h-5 text-primary" />}
              </div>
              <div className="text-left overflow-hidden">
                <span className="block font-bold text-sm tracking-tight text-white truncate">
                  {finance.coupleData?.name || 'Carregando...'}
                </span>
                <span className="block text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mt-1">
                  Ativo Agora
                </span>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform flex-shrink-0", showWorkspaceMenu && "rotate-180")} />
          </button>

          {/* Simple Dropdown for Switching */}
          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[calc(100%+8px)] left-4 right-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-2 space-y-1"
              >
                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                  Seus Perfis
                </div>
                {profile?.workspaceIds?.map(id => (
                  <button
                    key={id}
                    onClick={async () => {
                      await switchWorkspace(id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all",
                      profile.currentCoupleId === id ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {id === profile.currentCoupleId && <div className="w-1 h-1 bg-primary rounded-full" />}
                    Espaço {id.substring(6, 10).toUpperCase()}
                  </button>
                ))}
                <button 
                  onClick={handleAddWorkspace}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-all mt-2 border-t border-slate-800 pt-3"
                >
                  <Plus className="w-3 h-3" /> Novo Perfil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-sm",
              activeTab === 'home' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <LayoutDashboard className="w-5 h-5" /> Início
          </button>
          <button 
            onClick={() => setActiveTab('debts')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-sm",
              activeTab === 'debts' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <CreditCard className="w-5 h-5" /> Movimentações
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-sm",
              activeTab === 'goals' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Flag className="w-5 h-5" /> Objetivos
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-sm",
              activeTab === 'calendar' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Calendar className="w-5 h-5" /> Calendário
          </button>
          <button 
            onClick={() => setActiveTab('relationship')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-sm",
              activeTab === 'relationship' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Heart className="w-5 h-5" /> Relacionamento
          </button>
        </nav>

        {/* Footer Sidebar Area */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
               {profile?.photoURL ? (
                 <img src={profile.photoURL} alt={profile.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                   {profile?.displayName?.charAt(0) || 'U'}
                 </div>
               )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{profile?.displayName || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>

          {/* Theme Switcher - Consolidado e Organizado */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Cor do Sistema</p>
            <div className="flex justify-between items-center px-1">
              {[
                { id: 'indigo', color: '#6366f1' },
                { id: 'emerald', color: '#10b981' },
                { id: 'rose', color: '#f43f5e' },
                { id: 'amber', color: '#f59e0b' },
                { id: 'slate', color: '#475569' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => updateProfile({ themeColor: theme.color })}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all",
                    profile?.themeColor === theme.color ? "border-white scale-110 shadow-sm" : "border-slate-900 hover:scale-110"
                  )}
                  style={{ backgroundColor: theme.color }}
                  title={theme.id}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 h-16 flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <h1 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                {activeTab === 'home' ? 'Home' : 
                 activeTab === 'debts' ? 'Dívidas' : 
                 activeTab === 'goals' ? 'Metas' : 
                 activeTab === 'relationship' ? 'Ajustes' : 'Calendário'}
             </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setShowAddModal('expense')}
              className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.1] active:scale-[0.9] transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-4 md:p-10 w-full pb-32 lg:pb-10">
          <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter">VISÃO GERAL</h2>
                  <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{months[currentMonth]} • {currentYear}</p>
                </div>
                {/* ... existing filters ... */}
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                  <select 
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
                  >
                    <Share2 className="w-4 h-4" /> Exportar
                  </button>
                </div>
              </div>

              {/* Partner Invite Alert - Dismissible for this session */}
              <AnimatePresence>
                {showInviteAlert && finance.coupleData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <button 
                        onClick={dismissInviteAlert}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Share2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold tracking-tight mb-1">Convide seu Parceiro ou Sócio</h3>
                        <p className="text-white/60 text-sm max-w-md">Compartilhe este código para que outra pessoa possa gerenciar essas finanças com você em tempo real.</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Código de Convite</span>
                       <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 font-mono text-2xl tracking-[0.3em] font-bold">
                         {finance.coupleData.inviteCode}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 border-l-4 border-l-primary shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Saldo Combinado</p>
                  <h2 className="text-2xl font-bold text-white">{formatCurrency(balance)}</h2>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-emerald-500">
                      <ArrowUpRight className="w-3 h-3" />
                      {formatCurrency(totalIncome)}
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <ArrowDownRight className="w-3 h-3" />
                      {formatCurrency(totalExpense)}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Gastos Mês</p>
                  <h2 className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</h2>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Dívidas Ativas</p>
                  <h2 className="text-2xl font-bold text-accent">{formatCurrency(finance.debts.reduce((acc, d) => acc + (d.status === 'active' ? d.remainingAmount : 0), 0))}</h2>
                </div>
              </div>

              {/* Transactions & More */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex flex-col md:flex-row md:items-center justify-between flex-1 gap-4 mr-4">
                            <h3 className="font-bold text-lg whitespace-nowrap text-white">Atividade Recente</h3>
                            <div className="flex-1 max-w-sm relative">
                               <input 
                                 type="text"
                                 placeholder="Pesquisar..."
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-white"
                               />
                               <Heart className="w-3 h-3 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setShowAddModal('income')} className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                              <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowAddModal('expense')} className="bg-accent text-white p-2 rounded-xl shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
                              <Plus className="w-5 h-5 rotate-45" />
                            </button>
                         </div>
                      </div>

                      <div className="h-[250px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              formatter={(v: number) => formatCurrency(v)}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#7C3AED" 
                              strokeWidth={3} 
                              dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }} 
                              activeDot={{ r: 6, fill: '#7C3AED' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-4">
                         {filteredTransactions.slice(0, 10).map(t => (
                           <div key={t.id} className="flex items-center justify-between group p-3 hover:bg-slate-800/50 rounded-2xl transition-all">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500')}>
                                  {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{t.description}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.category}</p>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <p className="text-[10px] text-slate-500 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className={cn("font-bold text-sm", t.type === 'income' ? 'text-emerald-500' : 'text-slate-100')}>
                                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </p>
                                <button 
                                  onClick={() => {
                                    if(confirm('Deseja realmente apagar este lançamento?')) {
                                      finance.deleteTransaction(t.id);
                                    }
                                  }}
                                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </div>
                         ))}
                         {filteredTransactions.length === 0 && (
                           <div className="py-12 text-center">
                             <p className="text-slate-400 text-sm font-medium">Nenhuma movimentação este mês.</p>
                           </div>
                         )}
                      </div>
                   </div>
                               <div className="space-y-6">
                   <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm">
                      <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400 opacity-50">Gastos por Categoria</h3>
                      <div className="h-[200px] mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#0f172a',
                                borderRadius: '1rem', 
                                border: '1px solid #1e293b', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                color: '#f8fafc'
                              }}
                              itemStyle={{ color: '#f8fafc' }}
                              formatter={(v: number) => formatCurrency(v)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                         {pieData.map((item, index) => (
                           <div key={item.name} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                             </div>
                             <span className="text-xs font-bold text-white">{formatCurrency(Number(item.value))}</span>
                           </div>
                         ))}
                         {pieData.length === 0 && (
                           <p className="text-[10px] text-slate-500 text-center italic">Nenhum dado de gastos este mês.</p>
                         )}
                       </div>
                   </div>

                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm flex items-center gap-2 text-white">
                          <Flag className="w-4 h-4 text-accent" /> Metas Atuais
                        </h4>
                         <button 
                           onClick={() => setActiveTab('goals')}
                           className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline"
                         >
                           Ver todas
                         </button>
                      </div>
                      <div className="space-y-4">
                        {finance.goals.map(goal => (
                          <div key={goal.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-300">{goal.title}</span>
                              <span className="text-slate-500">{Math.round((goal.currentAmount/goal.targetAmount)*100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(goal.currentAmount/goal.targetAmount)*100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   </div>

                   <div className="bg-primary rounded-2xl p-5 text-white shadow-xl shadow-primary/20">
                      <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4" /> Insight Financeiro
                      </h3>
                      <p className="text-xs leading-relaxed opacity-90">
                        Vocês estão fazendo um ótimo trabalho! Manter o equilíbrio geométrico entre as receitas e despesas é a chave para o sucesso.
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'debts' && (
            <motion.div
              key="debts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm"
            >
              <DebtManagement />
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm"
            >
              <GoalTracker />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm"
            >
              <FinancialCalendar />
            </motion.div>
          )}

          {activeTab === 'relationship' && (
            <motion.div
              key="relationship"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-xl font-black text-white uppercase">Configurações & Sócio</h2>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personalize sua experiência</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                       <Heart className="w-6 h-6 text-primary fill-primary" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme and Icon Settings */}
                    <div className="space-y-6">
                       <div className="p-6 bg-slate-800/50 rounded-[2rem] border border-slate-800">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Visual do Aplicativo</h4>
                          
                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-300">Escala dos Ícones</span>
                                <span className="text-xs font-bold text-primary">{Math.round(iconScale * 100)}%</span>
                             </div>
                             <input 
                               type="range"
                               min="0.5"
                               max="1.5"
                               step="0.1"
                               value={iconScale}
                               onChange={(e) => setIconScale(parseFloat(e.target.value))}
                               className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                             />
                          </div>
                       </div>

                       <div className="p-6 bg-slate-800/50 rounded-[2rem] border border-slate-800">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Exportar Dados</h4>
                          <button 
                            onClick={exportToCSV}
                            className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-slate-300 hover:bg-slate-700/50 transition-all shadow-sm"
                          >
                             <Share2 className="w-4 h-4" /> Relatório CSV (Mês Atual)
                          </button>
                       </div>
                    </div>

                    {/* Partner Section */}
                    <div className="space-y-6">
                       <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden h-full flex flex-col justify-between min-h-[300px]">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl" />
                          
                          <div>
                             <h3 className="text-lg font-bold mb-1 tracking-tight">Convidar Sócio</h3>
                             <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-10">Compartilhar Acesso</p>
                             
                             <div className="flex flex-col items-center mb-8">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Seu Código Único</span>
                                <div className="text-4xl font-mono font-black tracking-[0.2em] mb-4">
                                   {finance.coupleData?.inviteCode}
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(finance.coupleData?.inviteCode || '');
                                    alert('Código copiado!');
                                  }}
                                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                                >
                                   Copiar Código
                                </button>
                             </div>
                          </div>

                          <div className="mt-auto pt-6 border-t border-white/10">
                             {finance.partner ? (
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-white/50 border border-white/10 overflow-hidden">
                                     {finance.partner.photoURL ? <img src={finance.partner.photoURL} alt="" className="w-full h-full object-cover" /> : finance.partner.displayName?.charAt(0)}
                                  </div>
                                  <div className="text-left">
                                     <p className="font-bold text-white text-sm">{finance.partner.displayName}</p>
                                     <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Membro Conectado</p>
                                  </div>
                               </div>
                             ) : (
                               <div className="flex items-center gap-4 opacity-50">
                                  <div className="w-12 h-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
                                     <Plus className="w-4 h-4 text-white/20" />
                                  </div>
                                  <p className="text-xs font-medium italic text-white/40">Nenhum sócio conectado...</p>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Invite Drawer (Vitrified) */}
      <AnimatePresence>
        {showInviteDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowInviteDrawer(false)}>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-xs h-full bg-slate-900/80 backdrop-blur-2xl border-l border-slate-800 shadow-2xl p-8 flex flex-col"
               onClick={e => e.stopPropagation()}
             >
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Convidar Sócio</h3>
                   <button onClick={() => setShowInviteDrawer(false)} className="p-2 bg-slate-800 rounded-xl text-white">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] text-center mb-8 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Código único</p>
                   <code className="text-3xl font-mono font-black text-white tracking-[0.2em] block mb-6">
                      {finance.coupleData?.inviteCode}
                   </code>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(finance.coupleData?.inviteCode || '');
                        alert('Código copiado!');
                     }}
                     className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                      Copiar Código
                   </button>
                </div>
                
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 py-2">
                   Envie o código para seu sócio ou parceiro de negócios. Assim que ele entrar, vocês verão as finanças do workspace em tempo real.
                </p>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal (Classic Style) */}
      <AnimatePresence>
        {showSettings && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSettings(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden border border-slate-800"
                onClick={e => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Ajustes do App</h2>
                    <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-xl text-slate-400">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="space-y-8">
                    {/* Icon Scale */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tamanho dos Ícones</label>
                          <span className="text-[10px] font-bold text-primary">{Math.round(iconScale * 100)}%</span>
                       </div>
                       <input 
                         type="range"
                         min="0.8"
                         max="1.5"
                         step="0.1"
                         value={iconScale}
                         onChange={e => setIconScale(parseFloat(e.target.value))}
                         className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                       />
                    </div>

                    <button 
                      onClick={logout}
                      className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                       <LogOut className="w-4 h-4" /> Encerrar Sessão
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Only */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl z-50">
        <NavItem 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<LayoutDashboard className="w-5 h-5 transition-transform" style={{ transform: `scale(${iconScale})` }} />} 
          label="" 
        />
        <NavItem 
          active={activeTab === 'debts'} 
          onClick={() => setActiveTab('debts')} 
          icon={<CreditCard className="w-5 h-5 transition-transform" style={{ transform: `scale(${iconScale})` }} />} 
          label="" 
        />
        <NavItem 
          active={activeTab === 'goals'} 
          onClick={() => setActiveTab('goals')} 
          icon={<Flag className="w-5 h-5 transition-transform" style={{ transform: `scale(${iconScale})` }} />} 
          label="" 
        />
        <NavItem 
          active={activeTab === 'calendar'} 
          onClick={() => setActiveTab('calendar')} 
          icon={<Calendar className="w-5 h-5 transition-transform" style={{ transform: `scale(${iconScale})` }} />} 
          label="" 
        />
        <NavItem 
          active={activeTab === 'relationship'} 
          onClick={() => setActiveTab('relationship')} 
          icon={<Heart className="w-5 h-5 transition-transform" style={{ transform: `scale(${iconScale})` }} />} 
          label="" 
        />
      </nav>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <TransactionModal 
            type={showAddModal} 
            onClose={() => setShowAddModal(null)} 
            onAdd={finance.addTransaction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-3xl transition-all",
        active ? "text-primary bg-primary/10" : "text-slate-500 hover:text-slate-300"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TransactionModal({ 
  type, 
  onClose, 
  onAdd 
}: { 
  type: 'income' | 'expense', 
  onClose: () => void,
  onAdd: (data: any) => Promise<void>
}) {
  const { goals } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [goalId, setGoalId] = useState('');

  const categories = type === 'income' 
    ? ['Salário', 'Extra', 'Investimento', 'Outros']
    : ['Alimentação', 'Moradia', 'Lazer', 'Saúde', 'Transporte', 'Educação', 'Outros'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;
    await onAdd({
      type,
      amount: parseFloat(amount),
      description,
      category,
      goalId: goalId || null,
      date: new Date().toISOString()
    });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 p-6 md:p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
           <h2 className={cn("text-2xl font-bold", type === 'income' ? 'text-emerald-500' : 'text-accent')}>
             {type === 'income' ? 'Nova Entrada' : 'Nova Saída'}
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
             <Plus className="w-6 h-6 rotate-45" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  autoFocus
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Descrição</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Aluguel, Mercado..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
           </div>

           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Categoria</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     type="button"
                     onClick={() => setCategory(cat)}
                     className={cn(
                       "py-2 px-2 rounded-xl text-[10px] md:text-xs font-bold transition-all border break-words",
                       category === cat 
                         ? (type === 'income' ? "bg-emerald-500 text-white border-emerald-500" : "bg-accent text-white border-accent")
                         : "bg-slate-800 text-slate-400 border-slate-700 hover:border-primary/30"
                     )}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <button
             type="submit"
             className={cn(
               "w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all hover:scale-[1.02]",
               type === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-accent shadow-accent/20'
             )}
           >
             Salvar Lançamento
           </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
