import React, { useState } from 'react';
import { useFinance, Goal } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { Target, Plus, CheckCircle2, Calendar, Trash2, TrendingUp } from 'lucide-react';
import QuickActionModal from './QuickActionModal';

export default function GoalTracker() {
  const finance = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Objetivos e Metas Financeiras</h2>
          <p className="text-xs text-zinc-400">Defina alvos financeiros, acompanhe a evolução do progresso e prazos estipulados</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Objetivo
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {finance.goals.map((goal) => {
          const progress = Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100));
          const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - (goal.currentAmount || 0));

          return (
            <div 
              key={goal.id}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between group hover:border-zinc-700 transition-all space-y-5 shadow-xl relative overflow-hidden"
            >
              {/* Top Card Bar */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{goal.category || 'Geral'}</span>
                  <h4 className="font-black text-lg text-white">{goal.title}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isCompleted 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {isCompleted ? 'Concluído' : `${progress}%`}
                </span>
              </div>

              {/* Progress & Balances */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400">Acumulado:</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(goal.currentAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Alvo: {formatCurrency(goal.targetAmount)}</span>
                  <span>Falta: {formatCurrency(remaining)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-xs">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </span>

                <button
                  onClick={() => {
                    if (confirm('Remover este objetivo?')) finance.deleteGoal(goal.id);
                  }}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {finance.goals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
            <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Nenhum objetivo cadastrado.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
            >
              + Criar primeiro objetivo
            </button>
          </div>
        )}
      </div>

      <QuickActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultAction="goal"
      />
    </div>
  );
}
