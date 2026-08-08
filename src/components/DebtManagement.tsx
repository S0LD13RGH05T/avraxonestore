import React, { useState } from 'react';
import { useFinance, Debt } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Clock, 
  ChevronRight,
  DollarSign
} from 'lucide-react';
import QuickActionModal from './QuickActionModal';

export default function DebtManagement() {
  const finance = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalActiveDebt = finance.debts
    .filter(d => d.status === 'active' || d.status === 'delayed')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const delayedDebtsCount = finance.debts.filter(d => d.status === 'delayed').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Gestão de Dívidas e Parcelamentos</h2>
          <p className="text-xs text-zinc-400">Acompanhe compromissos parcelados, saldo devedor e controle de vencimentos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Dívida
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total em Dívidas</span>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400">{formatCurrency(totalActiveDebt)}</p>
          <p className="text-[10px] text-zinc-500 font-bold">Saldo devedor total acumulado</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dívidas Ativas</span>
            <CreditCardIcon className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">
            {finance.debts.filter(d => d.status === 'active').length}
          </p>
          <p className="text-[10px] text-zinc-500 font-bold">Contratos em andamento</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Atrasadas / Alerta</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-500">{delayedDebtsCount}</p>
          <p className="text-[10px] text-rose-400/80 font-bold">Requer atenção imediata</p>
        </div>
      </div>

      {/* Debt List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Seus Parcelamentos Registrados</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {finance.debts.map((debt) => {
            const progress = Math.round((debt.paidInstallments / debt.totalInstallments) * 100);
            const isCompleted = debt.status === 'paid' || debt.remainingAmount <= 0;

            return (
              <div 
                key={debt.id}
                className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-all space-y-4 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-white">{debt.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                      Parcela: {debt.paidInstallments}/{debt.totalInstallments} ({formatCurrency(debt.monthlyPayment)}/mês)
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : debt.status === 'delayed'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {isCompleted ? 'Quitada' : debt.status === 'delayed' ? 'Atrasada' : 'Ativa'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Saldo Restante:</span>
                    <span className="font-black text-rose-400">{formatCurrency(debt.remainingAmount)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                    <span>Progresso: {progress}%</span>
                    <span>Total Original: {formatCurrency(debt.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                  <span className="text-[10px] text-zinc-500">
                    Vencimento: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : 'N/D'}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => finance.payDebtInstallment(debt)}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all"
                      >
                        Pagar Parcela
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Remover esta dívida?')) finance.deleteDebt(debt.id);
                      }}
                      className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {finance.debts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
              <CreditCardIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">Nenhuma dívida ou parcelamento cadastrado.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
              >
                + Cadastrar nova dívida
              </button>
            </div>
          )}
        </div>
      </div>

      <QuickActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultAction="debt"
      />
    </div>
  );
}
