import React, { useState } from 'react';
import { useFinance, Investment } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { 
  TrendingUp, 
  Plus, 
  PieChart as PieChartIcon, 
  Trash2, 
  Coins, 
  ShieldCheck, 
  BarChart2,
  DollarSign
} from 'lucide-react';
import QuickActionModal from './QuickActionModal';

export default function InvestmentsManager() {
  const finance = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const totalInvestedPortfolio = finance.investments.reduce((acc, i) => acc + (i.currentAmount || i.investedAmount), 0);
  const totalCostBasis = finance.investments.reduce((acc, i) => acc + (i.investedAmount || 0), 0);
  const netYield = totalInvestedPortfolio - totalCostBasis;
  const yieldPercentage = totalCostBasis > 0 ? ((netYield / totalCostBasis) * 100).toFixed(2) : '0.00';

  const filteredInvestments = finance.investments.filter(i => {
    return selectedCategory === 'ALL' || i.category === selectedCategory;
  });

  const getCategoryLabel = (cat: Investment['category']) => {
    switch (cat) {
      case 'renda_fixa': return 'Renda Fixa';
      case 'acoes': return 'Ações';
      case 'etfs': return 'ETFs';
      case 'cripto': return 'Criptomoedas';
      case 'fundos': return 'Fundos Imobiliários';
      default: return 'Outros';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Investimentos e Patrimônio</h2>
          <p className="text-xs text-zinc-400">Acompanhamento da evolução patrimonial, carteira de ativos e rentabilidade</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Aporte
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Patrimônio Investido</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(totalInvestedPortfolio)}</p>
          <p className="text-[10px] text-zinc-500 font-bold">Total acumulado na carteira</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Aportado</span>
            <Coins className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">{formatCurrency(totalCostBasis)}</p>
          <p className="text-[10px] text-zinc-500 font-bold">Custo de aquisição</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rendimento Estimado</span>
            <BarChart2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className={`text-3xl font-black ${netYield >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netYield >= 0 ? '+' : ''}{formatCurrency(netYield)}
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">Rentabilidade: {yieldPercentage}%</p>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {[
          { id: 'ALL', label: 'Todos' },
          { id: 'renda_fixa', label: 'Renda Fixa' },
          { id: 'acoes', label: 'Ações' },
          { id: 'etfs', label: 'ETFs' },
          { id: 'cripto', label: 'Cripto' },
          { id: 'fundos', label: 'Fundos/FIIs' },
          { id: 'outros', label: 'Outros' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvestments.map((inv) => (
          <div 
            key={inv.id}
            className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-all space-y-4 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{getCategoryLabel(inv.category)}</span>
                <h4 className="font-bold text-base text-white">{inv.asset}</h4>
              </div>
              <button
                onClick={() => {
                  if (confirm('Remover investimento?')) finance.deleteInvestment(inv.id);
                }}
                className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 pt-2 border-t border-zinc-900 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor Investido:</span>
                <span className="font-bold text-white">{formatCurrency(inv.investedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Data do Aporte:</span>
                <span className="font-bold text-zinc-300">{inv.date ? new Date(inv.date).toLocaleDateString('pt-BR') : 'N/D'}</span>
              </div>
              {inv.notes && (
                <p className="text-[11px] text-zinc-500 pt-1 italic">{inv.notes}</p>
              )}
            </div>
          </div>
        ))}

        {filteredInvestments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
            <TrendingUp className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Nenhum investimento registrado nesta categoria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
            >
              + Registrar primeiro aporte
            </button>
          </div>
        )}
      </div>

      <QuickActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultAction="investment"
      />
    </div>
  );
}
