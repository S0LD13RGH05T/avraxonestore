import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { Search, X, ArrowUpRight, ArrowDownRight, Users, CreditCard, TrendingUp, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const finance = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const matchingTransactions = term
    ? finance.transactions.filter(
        t => t.description.toLowerCase().includes(term) || t.category.toLowerCase().includes(term)
      )
    : [];

  const matchingClients = term
    ? finance.clients.filter(
        c => c.name.toLowerCase().includes(term) || c.service.toLowerCase().includes(term)
      )
    : [];

  const matchingDebts = term
    ? finance.debts.filter(d => d.title.toLowerCase().includes(term))
    : [];

  const matchingInvestments = term
    ? finance.investments.filter(i => i.asset.toLowerCase().includes(term) || i.category.toLowerCase().includes(term))
    : [];

  const totalResults =
    matchingTransactions.length + matchingClients.length + matchingDebts.length + matchingInvestments.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/40">
            <Search className="w-5 h-5 text-emerald-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por lançamentos, clientes, dívidas, cartões, investimentos..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results Area */}
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
            {!term ? (
              <p className="text-xs text-zinc-500 text-center py-8">
                Digite um termo para pesquisar instantaneamente no sistema financeiro.
              </p>
            ) : totalResults === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">
                Nenhum resultado encontrado para "{searchTerm}".
              </p>
            ) : (
              <>
                {/* Transactions */}
                {matchingTransactions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Movimentações ({matchingTransactions.length})
                    </h4>
                    <div className="space-y-2">
                      {matchingTransactions.slice(0, 5).map(t => (
                        <div key={t.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">{t.description}</p>
                            <p className="text-[10px] text-zinc-500">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`font-bold text-xs ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clients */}
                {matchingClients.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-purple-400" /> Clientes ({matchingClients.length})
                    </h4>
                    <div className="space-y-2">
                      {matchingClients.slice(0, 5).map(c => (
                        <div key={c.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">{c.name}</p>
                            <p className="text-[10px] text-zinc-500">{c.service} • Status: {c.status}</p>
                          </div>
                          <span className="font-bold text-xs text-emerald-400">{formatCurrency(c.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debts */}
                {matchingDebts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-amber-400" /> Dívidas ({matchingDebts.length})
                    </h4>
                    <div className="space-y-2">
                      {matchingDebts.slice(0, 5).map(d => (
                        <div key={d.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">{d.title}</p>
                            <p className="text-[10px] text-zinc-500">Parcelas: {d.paidInstallments}/{d.totalInstallments}</p>
                          </div>
                          <span className="font-bold text-xs text-rose-400">{formatCurrency(d.remainingAmount)} restante</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investments */}
                {matchingInvestments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-cyan-400" /> Investimentos ({matchingInvestments.length})
                    </h4>
                    <div className="space-y-2">
                      {matchingInvestments.slice(0, 5).map(i => (
                        <div key={i.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">{i.asset}</p>
                            <p className="text-[10px] text-zinc-500">{i.category}</p>
                          </div>
                          <span className="font-bold text-xs text-cyan-400">{formatCurrency(i.investedAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
