import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  Users, 
  Target, 
  CalendarDays,
  Plus
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: 'income' | 'expense' | 'investment' | 'debt' | 'client' | 'goal' | 'commitment' | null;
}

export default function QuickActionModal({ isOpen, onClose, defaultAction }: QuickActionModalProps) {
  const finance = useFinance();
  const [activeAction, setActiveAction] = useState<
    'income' | 'expense' | 'investment' | 'debt' | 'client' | 'goal' | 'commitment' | null
  >(defaultAction || 'income');

  // Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Geral');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Debt fields
  const [installments, setInstallments] = useState('1');
  const [monthlyPayment, setMonthlyPayment] = useState('');

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceName, setServiceName] = useState('');

  // Goal fields
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Investment fields
  const [assetName, setAssetName] = useState('');
  const [invCategory, setInvCategory] = useState<'renda_fixa' | 'acoes' | 'etfs' | 'cripto' | 'fundos' | 'outros'>('renda_fixa');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('Geral');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setInstallments('1');
    setMonthlyPayment('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setServiceName('');
    setTargetAmount('');
    setDeadline('');
    setAssetName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;

    if (activeAction === 'income' || activeAction === 'expense') {
      if (!description || numAmount <= 0) return;
      await finance.addTransaction({
        description,
        amount: numAmount,
        category,
        date,
        type: activeAction,
        notes
      });
    } else if (activeAction === 'investment') {
      if (!assetName || numAmount <= 0) return;
      await finance.addInvestment({
        asset: assetName,
        category: invCategory,
        investedAmount: numAmount,
        currentAmount: numAmount,
        date,
        notes
      });
    } else if (activeAction === 'debt') {
      if (!description || numAmount <= 0) return;
      const inst = parseInt(installments) || 1;
      const monthly = parseFloat(monthlyPayment) || numAmount / inst;
      await finance.addDebt({
        title: description,
        totalAmount: numAmount,
        remainingAmount: numAmount,
        totalInstallments: inst,
        paidInstallments: 0,
        status: 'active',
        monthlyPayment: monthly,
        dueDate: date,
        notes
      });
    } else if (activeAction === 'client') {
      if (!clientName || numAmount <= 0) return;
      await finance.addClient({
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        service: serviceName || 'Serviço',
        amount: numAmount,
        contractDate: date,
        paymentDate: date,
        status: 'A RECEBER',
        notes
      });
    } else if (activeAction === 'goal') {
      const target = parseFloat(targetAmount) || 0;
      if (!description || target <= 0) return;
      await finance.addGoal({
        title: description,
        category,
        targetAmount: target,
        currentAmount: numAmount,
        deadline: deadline || new Date().toISOString().split('T')[0],
        status: 'in_progress',
        description: notes
      });
    } else if (activeAction === 'commitment') {
      if (!description || numAmount <= 0) return;
      await finance.addCommitment({
        title: description,
        amount: numAmount,
        type: 'expense',
        dueDate: date,
        status: 'pending',
        notes
      });
    }

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const actionButtons = [
    { id: 'income', label: 'Entrada', icon: ArrowUpRight, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'expense', label: 'Saída', icon: ArrowDownRight, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'investment', label: 'Investimento', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'debt', label: 'Dívida', icon: CreditCard, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'client', label: 'Cliente', icon: Users, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'goal', label: 'Objetivo', icon: Target, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'commitment', label: 'Compromisso', icon: CalendarDays, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Nova Operação Rápida</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Selector Chips */}
          <div className="flex gap-2 py-4 overflow-x-auto custom-scrollbar">
            {actionButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = activeAction === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setActiveAction(btn.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? btn.color + ' ring-1 ring-emerald-500'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Dynamic Fields */}
            {activeAction === 'client' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Serviço Contratado</label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ex: Consultoria / Landing Page"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : activeAction === 'investment' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Ativo / Aplicação</label>
                  <input
                    type="text"
                    required
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Ex: Tesouro Selic 2029 / PETR4 / Bitcoin"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Categoria de Investimento</label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="renda_fixa">Renda Fixa</option>
                    <option value="acoes">Ações</option>
                    <option value="etfs">ETFs</option>
                    <option value="cripto">Criptomoedas</option>
                    <option value="fundos">Fundos Imobiliários / FIIS</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Descrição / Título</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Pagamento Fornecedor / Fatura Nubank"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {activeAction === 'debt' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder="Auto cálculo"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeAction === 'goal' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Valor Alvo do Objetivo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Ex: 10000.00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Observações / Notas</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                Confirmar Registro
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
