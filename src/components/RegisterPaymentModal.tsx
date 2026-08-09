import React, { useState, useEffect } from 'react';
import { useFinance, Client } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Calendar, Landmark, CreditCard, FileText, X, Check } from 'lucide-react';

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function RegisterPaymentModal({ isOpen, onClose, client }: RegisterPaymentModalProps) {
  const finance = useFinance();

  // All React Hooks must be declared at the top level
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset/populate form values when client or isOpen changes
  useEffect(() => {
    if (client && isOpen) {
      const total = client.totalAmount || client.amount || 0;
      const paid = client.paidAmount || 0;
      const defaultRemaining = Math.max(0, total - paid);

      setAmount(defaultRemaining > 0 ? defaultRemaining.toString() : '');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId(finance.accounts[0]?.id || '');
      setPaymentMethod('PIX');
      setNotes('');
      setError('');
    }
  }, [client, isOpen, finance.accounts]);

  // Conditional render after hooks declaration
  if (!isOpen || !client) return null;

  const total = client.totalAmount || client.amount || 0;
  const paid = client.paidAmount || 0;
  const defaultRemaining = Math.max(0, total - paid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Informe um valor de pagamento válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await finance.registerClientPayment({
        clientId: client.id,
        amount: numAmount,
        date,
        accountId,
        paymentMethod,
        notes
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Registrar Pagamento</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Cliente: <strong className="text-emerald-400">{client.name}</strong></p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Client Financial Context Summary */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl mb-6 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total</span>
              <span className="text-sm font-black text-white">{formatCurrency(total)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Já Pago</span>
              <span className="text-sm font-black text-emerald-400">{formatCurrency(paid)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Restante</span>
              <span className="text-sm font-black text-rose-400">{formatCurrency(defaultRemaining)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Valor do Pagamento (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-bold text-base focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Destination Account */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" /> Conta de Destino *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
              >
                {finance.accounts.length === 0 && <option value="">Sem conta cadastrada (Geral)</option>}
                {finance.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — (Saldo: {formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Forma
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Transferência">Transferência / TED</option>
                  <option value="Dinheiro">Dinheiro Espécie</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> Observação / Referência
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Parcela 1/2 referente ao site..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl font-bold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
