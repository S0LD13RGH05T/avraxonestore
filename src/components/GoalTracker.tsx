import React, { useState } from 'react';
import { useFinance, Goal } from '../hooks/useFinance';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { Target, Plus, Trophy, Clock, Plane, Home, Car, Smartphone, PiggyBank, MoreHorizontal, CheckCircle2, Trash2, Edit2, TrendingUp } from 'lucide-react';

const GOAL_CATEGORIES = [
  { id: 'viagem', label: 'Viagem', icon: Plane, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'casa', label: 'Casa', icon: Home, color: 'bg-orange-500/10 text-orange-500' },
  { id: 'carro', label: 'Carro', icon: Car, color: 'bg-purple-500/10 text-purple-500' },
  { id: 'eletronicos', label: 'Celular/Eletrônicos', icon: Smartphone, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'reserva', label: 'Reserva de Emergência', icon: PiggyBank, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'outros', label: 'Outros', icon: Target, color: 'bg-slate-500/10 text-slate-500' },
];

export default function GoalTracker() {
  const { goals, addGoal, deleteGoal, updateGoalAmount } = useFinance();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Nossas Metas</h2>
          <p className="text-sm text-slate-500 italic font-medium tracking-tight">Transformando sonhos em números</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-[1.25rem] text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 lg:pb-0">
        {goals.map(goal => (
          <div key={goal.id}>
            <GoalCard 
               goal={goal} 
               onDelete={() => deleteGoal(goal.id)} 
               onUpdate={(val) => updateGoalAmount(goal.id, val)}
            />
          </div>
        ))}
        {goals.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-900 rounded-[2rem] border border-dashed border-slate-800">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sem metas no momento</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Crie sua primeira meta para começar a poupar em dupla e conquistar grandes coisas!</p>
          </div>
        )}
      </div>

      {showAdd && (
        <AddGoalModal onClose={() => setShowAdd(false)} onAdd={addGoal} />
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete, onUpdate }: { goal: Goal, onDelete: () => void, onUpdate: (val: number) => void }) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const isCompleted = goal.status === 'completed' || progress >= 100;
  
  const categoryInfo = GOAL_CATEGORIES.find(c => c.id === goal.category) || GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];
  const CategoryIcon = categoryInfo.icon;

  const [isUpdating, setIsUpdating] = useState(false);
  const [contribution, setContribution] = useState('');

  const handleUpdate = () => {
    const val = parseFloat(contribution);
    if (isNaN(val)) return;
    onUpdate(goal.currentAmount + val);
    setContribution('');
    setIsUpdating(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-900 p-7 rounded-[2rem] border border-slate-800 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-4 right-4 flex gap-2 transition-opacity">
         <button 
           onClick={() => setIsUpdating(!isUpdating)}
           className="p-2 bg-slate-800 hover:bg-primary/10 text-slate-500 hover:text-primary rounded-xl transition-all"
           title="Adicionar Progresso"
         >
           <TrendingUp className="w-4 h-4" />
         </button>
         <button 
           onClick={() => {
             if (confirm('Tem certeza que deseja apagar esta meta?')) onDelete();
           }}
           className="p-2 bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all"
           title="Apagar Meta"
         >
           <Trash2 className="w-4 h-4" />
         </button>
      </div>

      {isCompleted && (
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Trophy className="w-20 h-20 rotate-12 text-emerald-500" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", 
          categoryInfo.color
        )}>
          <CategoryIcon className="w-7 h-7" />
        </div>
        <div className="text-right pr-8 group-hover:pr-16 transition-all">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-end gap-1.5">
            <Clock className="w-3 h-3" /> DATA ALVO
          </p>
          <div className="text-sm font-bold text-white">
            {formatDate(goal.deadline)}
          </div>
        </div>
      </div>

      <div className="mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
          {categoryInfo.label}
        </span>
        <h4 className="text-xl font-bold text-white truncate mb-1">{goal.title}</h4>
      </div>

      {!isUpdating ? (
        <div className="flex items-end gap-2 mb-6 cursor-pointer" onClick={() => setIsUpdating(true)}>
          <span className="text-2xl font-black text-white">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-xs font-bold text-slate-500 mb-1.5">/ {formatCurrency(goal.targetAmount)}</span>
        </div>
      ) : (
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">R$</span>
            <input 
              type="number"
              placeholder="Valor a somar..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={contribution}
              onChange={e => setContribution(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            onClick={handleUpdate}
            className="bg-primary text-white px-4 rounded-xl text-xs font-bold shadow-lg shadow-primary/20"
          >
            Somar
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="h-3.5 bg-slate-800 rounded-full border border-slate-700 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-[1500ms] relative z-10", 
              isCompleted ? "bg-emerald-500" : "bg-primary"
            )} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        <div className="flex justify-between items-center px-1">
          <span className={cn("text-[10px] font-black uppercase tracking-tighter", isCompleted ? "text-emerald-500" : "text-primary")}>
            {isCompleted ? 'CONQUISTADO!' : `${Math.round(progress)}% DO CAMINHO`}
          </span>
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
        </div>
      </div>
    </motion.div>
  );
}

function AddGoalModal({ onClose, onAdd }: { onClose: () => void, onAdd: (g: any) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('viagem');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAdd({
        title,
        category,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline,
        status: 'in_progress'
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 flex flex-col gap-1 shadow-2xl relative overflow-hidden border border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-pink-500" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Nova Meta</h2>
            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Sonhe alto, planeje juntos!
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 transition-colors"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">O QUE VOCÊS QUEREM?</label>
            <input 
              type="text" 
              placeholder="Ex: Viagem para Maldivas, Novo Carro..." 
              required 
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">CATEGORIA</label>
            <div className="grid grid-cols-3 gap-3">
              {GOAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    category === cat.id 
                      ? "bg-primary/5 border-primary text-primary" 
                      : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                  )}
                >
                  <cat.icon className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">VALOR ALVO (R$)</label>
              <input 
                type="number" 
                placeholder="0,00" 
                required 
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">QUANDO?</label>
              <input 
                type="date" 
                required 
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? 'Salvando...' : (
              <>
                <Trophy className="w-5 h-5" /> CRIAR META EM DUPLA
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
