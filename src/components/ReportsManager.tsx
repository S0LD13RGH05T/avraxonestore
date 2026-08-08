import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ReportsManager() {
  const finance = useFinance();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Expenses grouped by category
  const expenseByCategory = finance.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value: Number(value) }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  // Monthly summary comparison data (past 6 months)
  const pastMonthsData = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const m = d.getMonth();
    const y = d.getFullYear();

    const monthTrans = finance.transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });

    const income = monthTrans.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = monthTrans.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const result = income - expense;

    return {
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
      Entradas: income,
      Saídas: expense,
      Resultado: result
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Relatórios e Análises</h2>
          <p className="text-xs text-zinc-400">Visão consolidada de desempenho financeiro, comparação mensal e distribuição de gastos</p>
        </div>
        <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'month' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'quarter' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'year' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Bar Chart — Income vs Expense */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Evolução Mensal (Entradas vs Saídas)</h3>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pastMonthsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Bar dataKey="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Saídas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Gastos por Categoria</h3>
          </div>

          {pieData.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-12">Nenhum gasto registrado para gerar o gráfico.</p>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{item.name}: <strong>{formatCurrency(item.value)}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Highlights Summary */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Resumo do Período</h3>
            <p className="text-xs text-zinc-400">Indicadores de rentabilidade e retenção financeira</p>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Entradas Mês</span>
                    <p className="font-bold text-white text-base">{formatCurrency(finance.stats.totalIncomeMonth)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Saídas Mês</span>
                    <p className="font-bold text-white text-base">{formatCurrency(finance.stats.totalExpenseMonth)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Resultado do Mês</span>
                    <p className={`font-black text-base ${finance.stats.monthResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {finance.stats.monthResult >= 0 ? '+' : ''}{formatCurrency(finance.stats.monthResult)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
