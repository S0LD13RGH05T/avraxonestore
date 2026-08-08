import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  CalendarDays,
  TrendingUp,
  RotateCcw,
  X,
  Plus
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinancialCalendar() {
  const { transactions, debts, commitments, investments } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayTransactions = (day: Date) => {
    return transactions.filter(t => isSameDay(new Date(t.date), day));
  };

  const getDayDebts = (day: Date) => {
    return debts.filter(d => d.dueDate && isSameDay(new Date(d.dueDate), day));
  };

  const getDayCommitments = (day: Date) => {
    return commitments.filter(c => c.dueDate && isSameDay(new Date(c.dueDate), day));
  };

  const getDayInvestments = (day: Date) => {
    return investments.filter(i => i.date && isSameDay(new Date(i.date), day));
  };

  const handleReturnToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Day calculations for selected day
  const selectedDayTransactions = selectedDay ? getDayTransactions(selectedDay) : [];
  const selectedDayDebts = selectedDay ? getDayDebts(selectedDay) : [];
  const selectedDayCommitments = selectedDay ? getDayCommitments(selectedDay) : [];
  const selectedDayInvestments = selectedDay ? getDayInvestments(selectedDay) : [];

  const dayIncome = selectedDayTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const dayExpense = selectedDayTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const dayInvestmentTotal = selectedDayInvestments
    .reduce((acc, i) => acc + i.investedAmount, 0);

  const dayNetResult = dayIncome - dayExpense - dayInvestmentTotal;

  return (
    <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold capitalize text-white">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <p className="text-xs text-zinc-400">Calendário e Agenda Financeira</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReturnToday}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> HOJE
          </button>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days Legend */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/20 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Entrada</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Saída</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Hoje</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Compromisso / Vencimento</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Investimento</span>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-zinc-800">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayTransactions = getDayTransactions(day);
          const dayDebts = getDayDebts(day);
          const dayComms = getDayCommitments(day);
          const dayInvs = getDayInvestments(day);
          
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          const hasIncome = dayTransactions.some(t => t.type === 'income');
          const hasExpense = dayTransactions.some(t => t.type === 'expense');
          const hasInvestment = dayInvs.length > 0;
          const hasCommitment = dayDebts.length > 0 || dayComms.length > 0;

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-h-[65px] sm:min-h-[90px] p-1 sm:p-2 border-r border-b border-zinc-800/80 flex flex-col justify-between transition-all cursor-pointer group hover:bg-zinc-900/50",
                !isCurrentMonth && "opacity-30 bg-zinc-950/40",
                i % 7 === 6 && "border-r-0",
                isSelected && "bg-emerald-500/5 ring-1 ring-emerald-500/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                  isToday 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-black" 
                    : isSelected 
                      ? "bg-emerald-400 text-black font-bold" 
                      : isCurrentMonth 
                        ? "text-zinc-300 group-hover:text-white" 
                        : "text-zinc-600"
                )}>
                  {format(day, 'd')}
                </span>

                {/* Status Indicator Dots */}
                <div className="flex items-center gap-1">
                  {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  {hasInvestment && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  {hasCommitment && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 overflow-hidden mt-1">
                {dayTransactions.slice(0, 2).map((t) => (
                  <div 
                    key={t.id} 
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 truncate border",
                      t.type === 'income' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}
                  >
                    {t.type === 'income' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {formatCurrency(t.amount)}
                  </div>
                ))}
                {dayDebts.slice(0, 1).map((d) => (
                  <div key={d.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1 truncate">
                    <CreditCard className="w-2.5 h-2.5" />
                    {d.title}
                  </div>
                ))}
                {dayTransactions.length + dayDebts.length + dayComms.length + dayInvs.length > 2 && (
                  <span className="text-[8px] text-zinc-500 font-bold px-1">
                    +{dayTransactions.length + dayDebts.length + dayComms.length + dayInvs.length - 2} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-800 bg-zinc-900/60 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-400" />
                    Detalhamento de {format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <p className="text-xs text-zinc-400">Resumo financeiro das atividades deste dia</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-xs bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl">
                    <span className="text-emerald-400 font-bold">+{formatCurrency(dayIncome)}</span>
                    <span className="text-rose-400 font-bold">-{formatCurrency(dayExpense)}</span>
                    <span className="text-zinc-500 font-bold">|</span>
                    <span className={cn("font-extrabold", dayNetResult >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      Resultado: {formatCurrency(dayNetResult)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedDay(null)} 
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedDayTransactions.length === 0 && selectedDayDebts.length === 0 && selectedDayCommitments.length === 0 && selectedDayInvestments.length === 0 ? (
                <p className="text-xs text-zinc-500 font-medium text-center py-6">Nenhum evento registrado para este dia.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedDayTransactions.map(t => (
                    <div key={t.id} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center border",
                          t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{t.description}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t.category}</p>
                        </div>
                      </div>
                      <p className={cn("font-bold text-sm", t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))}

                  {selectedDayInvestments.map(inv => (
                    <div key={inv.id} className="bg-zinc-950 p-3.5 rounded-2xl border border-cyan-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">Aporte: {inv.asset}</p>
                          <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider">{inv.category}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-cyan-400">
                        {formatCurrency(inv.investedAmount)}
                      </p>
                    </div>
                  ))}

                  {selectedDayDebts.map(d => (
                    <div key={d.id} className="bg-zinc-950 p-3.5 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">Vencimento Dívida: {d.title}</p>
                          <p className="text-[10px] text-orange-400/80 font-bold uppercase tracking-wider">Parcela {d.paidInstallments}/{d.totalInstallments}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-orange-400">
                        {formatCurrency(d.monthlyPayment)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
