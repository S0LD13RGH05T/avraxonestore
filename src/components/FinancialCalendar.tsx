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
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-[#E2E8F0] flex items-center justify-between bg-primary/5">
        <div>
          <h2 className="text-xl font-bold capitalize text-[#1E293B]">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
          <p className="text-xs font-medium text-slate-400">Calendário de Movimentações</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#E2E8F0]"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#E2E8F0]"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#E2E8F0]">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
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
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-[#E2E8F0] flex flex-col gap-1 transition-colors hover:bg-slate-50",
                !isCurrentMonth && "bg-slate-50/50",
                i % 7 === 6 && "border-r-0"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold mb-1",
                isSameDay(day, new Date()) ? "text-primary bg-primary/10 w-5 h-5 flex items-center justify-center rounded-full" : isCurrentMonth ? "text-gray-900" : "text-gray-200"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayTransactions.slice(0, 2).map((t, idx) => (
                  <div 
                    key={t.id} 
                    className={cn(
                      "text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5 truncate",
                      t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                    )}
                  >
                    {t.type === 'income' ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                    {formatCurrency(t.amount)}
                  </div>
                ))}
                {dayDebts.slice(0, 1).map((d) => (
                  <div key={d.id} className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-50 text-red-600 flex items-center gap-0.5 truncate">
                    <CreditCard className="w-2 h-2" />
                    {d.title}
                  </div>
                ))}
                {dayTransactions.length + dayDebts.length > 3 && (
                  <span className="text-[7px] text-gray-300 font-bold px-1">+{dayTransactions.length + dayDebts.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
