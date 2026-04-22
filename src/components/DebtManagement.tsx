import React, { useState } from 'react';
import { useFinance, Debt } from '../hooks/useFinance';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AlertCircle, Plus, CheckCircle2, ChevronRight, Calculator, Trash2, CreditCard as CreditCardIcon } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function DebtManagement() {
  const { debts, addDebt, creditCards, addCreditCard, deleteCreditCard, loading } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const totalDebt = debts.reduce((acc, d) => acc + (d.status === 'active' ? d.remainingAmount : 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestão Financeira</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Acompanhe suas dívidas e cartões de crédito</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddCard(true)}
            className="bg-slate-900 text-slate-100 px-5 py-2.5 rounded-2xl text-sm font-bold border border-slate-800 shadow-sm hover:bg-slate-800 transition-all"
          >
             Novo Cartão
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-accent text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Nova Dívida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-500/5 p-8 rounded-[2.5rem] border border-red-500/10 flex items-center justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">Total de Dívidas</p>
              <p className="text-4xl font-black text-red-500 tracking-tighter">{formatCurrency(totalDebt)}</p>
           </div>
           <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center relative z-10">
              <AlertCircle className="w-8 h-8 text-red-500" />
           </div>
        </div>

        <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10 flex items-center justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Cartões Ativos</p>
              <p className="text-4xl font-black text-emerald-500 tracking-tighter">{creditCards.length}</p>
           </div>
           <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center relative z-10">
              <CreditCardIcon className="w-8 h-8 text-emerald-500" />
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Suas Dívidas Parceladas</h3>
          <div className="h-px bg-slate-800 flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {debts.map(debt => (
            <div key={debt.id}>
              <DebtCard debt={debt} />
            </div>
          ))}
          {debts.length === 0 && (
            <div className="py-12 text-center bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
               <p className="text-slate-500 font-medium">Nenhuma dívida cadastrada.</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Cartões de Crédito</h3>
          <div className="h-px bg-slate-800 flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditCards.map(card => (
            <div 
              key={card.id}
              className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-xl"
              style={{ background: `linear-gradient(135deg, ${card.color || '#1e293b'}, #020617)` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex justify-between items-start mb-10 relative z-10">
                <CreditCardIcon className="w-10 h-10 text-white/50" />
                <button 
                  onClick={() => {
                    if(confirm('Remover este cartão?')) deleteCreditCard(card.id);
                  }}
                  className="p-2 bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-end">
                <p className="text-xl md:text-2xl font-black tracking-tight mb-8 md:mb-10 break-words leading-tight">{card.name}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-6 mt-auto">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Limite Disponível</p>
                    <p className="text-2xl md:text-3xl font-bold">{formatCurrency(card.limit - card.balance)}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Vencimento</p>
                    <p className="text-sm md:text-base font-bold bg-white/10 px-4 py-2 rounded-xl inline-block shadow-inner">DIA {card.closingDay}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setShowAddCard(true)}
            className="p-8 rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Novo Cartão</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <AddDebtModal onClose={() => setShowAdd(false)} onAdd={addDebt} />
      )}

      {showAddCard && (
        <AddCreditCardModal onClose={() => setShowAddCard(false)} onAdd={addCreditCard} />
      )}
    </div>
  );
}

function DebtCard({ debt }: { debt: Debt }) {
  const { deleteDebt, payDebtInstallment, markDebtDelayed } = useFinance();
  const [isPinging, setIsPinging] = useState(false);
  const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
  
  const handlePayment = async () => {
    setIsPinging(true);
    await payDebtInstallment(debt, false);
    setTimeout(() => setIsPinging(false), 1000);
  };

  const handleDelay = async () => {
    await markDebtDelayed(debt.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      className={cn(
        "p-7 rounded-[2rem] border border-slate-800 shadow-sm transition-colors duration-500 relative overflow-hidden group",
        isPinging ? "bg-emerald-500/10" : "bg-slate-900"
      )}
    >
      <div className="absolute top-4 right-4 flex gap-2 transition-opacity">
        <button 
          onClick={() => {
            if(confirm('Tem certeza que deseja apagar esta dívida?')) deleteDebt(debt.id);
          }}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 pr-10 sm:pr-12 gap-6 sm:gap-4">
        <div className="flex items-center gap-4 w-full">
          <div className={cn(
            "w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-all",
            debt.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : 
            debt.status === 'delayed' ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
          )}>
            {debt.status === 'paid' ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />}
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-black text-white tracking-tight break-words">{debt.title}</h4>
            <div className="flex items-center gap-2 mt-1">
               <span className={cn(
                 "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                 debt.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : 
                 debt.status === 'delayed' ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
               )}>
                 {debt.status === 'paid' ? 'QUITADA' : debt.status === 'delayed' ? 'EM ATRASO' : 'ATIVA'}
               </span>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 {debt.paidInstallments} / {debt.totalInstallments} parcelas
               </span>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right mt-4 sm:mt-0 w-full sm:w-auto">
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter break-words">{formatCurrency(debt.remainingAmount)}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Restante a Pagar</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-[10px] font-black mb-2">
            <span className="text-slate-500 uppercase tracking-widest">Progresso do Pagamento</span>
            <span className="text-slate-300">{Math.round(progress)}%</span>
          </div>
          <div className="h-3.5 bg-slate-800 rounded-full border border-slate-700 overflow-hidden relative">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className={cn(
                 "h-full rounded-full transition-all duration-[1500ms] relative z-10", 
                 debt.status === 'paid' ? "bg-emerald-500" : "bg-primary"
               )} 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
        </div>

        {debt.status !== 'paid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
               <div className="flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-slate-500" />
                 <span className="text-xs font-bold text-slate-400">Parcela Mensal:</span>
               </div>
               <p className="text-sm font-black text-white tracking-tight">
                 {formatCurrency(debt.monthlyPayment)}
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleDelay}
                className="flex-1 bg-slate-800 border-2 border-orange-500/20 text-orange-500 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2"
              >
                 Atrasada
              </button>
              <button 
                onClick={handlePayment}
                className="flex-[1.5] bg-emerald-500 text-white py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                 <Plus className="w-4 h-4" /> Marcar Paga
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isPinging && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 bg-emerald-400 rounded-full blur-[100px] pointer-events-none z-0"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddDebtModal({ onClose, onAdd }: { onClose: () => void, onAdd: (d: any) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('175.00');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      title,
      totalAmount: parseFloat(totalAmount),
      remainingAmount: parseFloat(totalAmount),
      monthlyPayment: parseFloat(monthlyPayment),
      totalInstallments: parseInt(totalInstallments) || 12,
      paidInstallments: 0,
      status: 'active'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 flex flex-col gap-1 shadow-2xl relative overflow-hidden border border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tight">Nova Dívida</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Planeje sua liberdade</p>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-slate-500 hover:text-slate-300 transition-colors">
             <Plus className="w-6 h-6 rotate-45" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título da Dívida</label>
            <input 
              type="text" 
              placeholder="Ex: Empréstimo, Cartão..." 
              required 
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Valor Total (R$)</label>
              <input 
                type="number" 
                required 
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Parcelas Totais</label>
              <input 
                type="number" 
                required 
                placeholder="Ex: 12"
                value={totalInstallments}
                onChange={e => setTotalInstallments(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Valor da Parcela (R$)</label>
            <input 
              type="number" 
              required 
              placeholder="Ex: 150.00"
              value={monthlyPayment}
              onChange={e => setMonthlyPayment(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
          >
            CADASTRAR DÍVIDA
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AddCreditCardModal({ onClose, onAdd }: { onClose: () => void, onAdd: (d: any) => Promise<void> }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      name,
      limit: parseFloat(limit),
      balance: 0,
      closingDay: parseInt(closingDay),
      color
    });
    onClose();
  };

  const colors = ['#6366f1', '#ec4899', '#f97316', '#3b82f6', '#10b981', '#1e293b'];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tight">Novo Cartão</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gerencie seus limites</p>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-slate-500">
             <Plus className="w-6 h-6 rotate-45" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Apelido do Cartão</label>
            <input 
              type="text" 
              placeholder="Ex: Nubank, Inter..." 
              required 
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Limite Total (R$)</label>
              <input 
                type="number" 
                required 
                value={limit}
                onChange={e => setLimit(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Dia do Vencimento</label>
              <input 
                type="number" 
                min="1"
                max="31"
                required 
                placeholder="Ex: 10"
                value={closingDay}
                onChange={e => setClosingDay(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Cor do Cartão</label>
             <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all",
                      color === c ? "scale-110 ring-4 ring-slate-800 shadow-lg" : "opacity-60"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
            CADASTRAR CARTÃO
          </button>
        </form>
      </motion.div>
    </div>
  );
}
