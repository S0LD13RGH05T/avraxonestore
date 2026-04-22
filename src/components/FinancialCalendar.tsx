import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard 
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
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinancialCalendar() {
  const { transactions, debts } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayTransactions = (day: Date) => {
    return transactions.filter(t => isSameDay(new Date(t.date), day));
  };

  const getDayDebts = (day: Date) => {
    // Basic logic: if day is same as debt (assumed due date or created date for now)
    // In a real app we might have a specific paymentDay field.
    return debts.filter(d => d.dueDate && isSameDay(new Date(d.dueDate), day));
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
        <div>
          <h2 className="text-xl font-bold capitalize text-white">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
          <p className="text-xs font-medium text-slate-500">Calendário de Movimentações</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-800">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayTransactions = getDayTransactions(day);
          const dayDebts = getDayDebts(day);
          const hasActivity = dayTransactions.length > 0 || dayDebts.length > 0;
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-slate-800 flex flex-col gap-1 transition-colors hover:bg-slate-800/50 cursor-pointer",
                !isCurrentMonth && "bg-slate-900/50 opacity-50",
                i % 7 === 6 && "border-r-0",
                selectedDay && isSameDay(day, selectedDay) && "bg-primary/10 border-primary/30"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold mb-1",
                isSameDay(day, new Date()) ? "text-primary bg-primary/10 w-5 h-5 flex items-center justify-center rounded-full" : isCurrentMonth ? "text-slate-300" : "text-slate-600"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayTransactions.slice(0, 2).map((t) => (
                  <div 
                    key={t.id} 
                    className={cn(
                      "text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5 truncate",
                      t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                    )}
                  >
                    {t.type === 'income' ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                    {formatCurrency(t.amount)}
                  </div>
                ))}
                {dayDebts.slice(0, 1).map((d) => (
                  <div key={d.id} className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-500/10 text-red-500 flex items-center gap-0.5 truncate">
                    <CreditCard className="w-2 h-2" />
                    {d.title}
                  </div>
                ))}
                {dayTransactions.length + dayDebts.length > 3 && (
                  <span className="text-[7px] text-slate-500 font-bold px-1">+{dayTransactions.length + dayDebts.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-slate-800/30 overflow-hidden"
          >
            <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-primary" />
                   Lançamentos do dia {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                 </h3>
                 <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-lg shadow-sm border border-slate-700 transition-colors">
                   Fechar
                 </button>
               </div>

               {getDayTransactions(selectedDay).length === 0 && getDayDebts(selectedDay).length === 0 ? (
                 <p className="text-sm font-medium text-slate-500 text-center py-6">Nenhuma movimentação neste dia.</p>
               ) : (
                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {getDayTransactions(selectedDay).map(t => (
                     <div key={t.id} className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500')}>
                           {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                         </div>
                         <div>
                           <p className="font-bold text-white">{t.description}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(new Date(t.date), "HH:mm")} • {t.category}</p>
                         </div>
                       </div>
                       <p className={cn("font-bold text-lg", t.type === 'income' ? 'text-emerald-500' : 'text-orange-500')}>
                         {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                       </p>
                     </div>
                   ))}
                   {getDayDebts(selectedDay).map(d => (
                     <div key={d.id} className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex items-center justify-between opacity-75 hover:bg-slate-700/50 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
                           <CreditCard className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="font-bold text-white">Dívida/Fatura: {d.title}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parcela {d.paidInstallments}/{d.totalInstallments}</p>
                         </div>
                       </div>
                       <p className="font-bold text-red-500 text-lg">
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
