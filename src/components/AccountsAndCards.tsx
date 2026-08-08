import React, { useState } from 'react';
import { useFinance, CreditCard as CreditCardType, FinancialAccount } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  Landmark, 
  Wallet, 
  Trash2, 
  Smartphone,
  Banknote,
  X
} from 'lucide-react';

export default function AccountsAndCards() {
  const finance = useFinance();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Card Form
  const [cardName, setCardName] = useState('');
  const [institution, setInstitution] = useState('');
  const [limit, setLimit] = useState('');
  const [balance, setBalance] = useState('');
  const [closingDay, setClosingDay] = useState('5');
  const [dueDate, setDueDate] = useState('10');
  const [lastFour, setLastFour] = useState('');

  // Account Form
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'bank' | 'wallet' | 'digital' | 'cash' | 'other'>('bank');
  const [accBalance, setAccBalance] = useState('');
  const [accInstitution, setAccInstitution] = useState('');

  const totalAccountBalance = finance.accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalCreditLimit = finance.creditCards.reduce((acc, c) => acc + (c.limit || 0), 0);
  const totalCreditUsed = finance.creditCards.reduce((acc, c) => acc + (c.balance || 0), 0);
  const totalCreditAvailable = totalCreditLimit - totalCreditUsed;

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !limit) return;
    await finance.addCreditCard({
      name: cardName,
      institution: institution || 'Banco',
      limit: parseFloat(limit) || 0,
      balance: parseFloat(balance) || 0,
      closingDay: parseInt(closingDay) || 5,
      dueDate: parseInt(dueDate) || 10,
      lastFourDigits: lastFour || '0000'
    });
    setCardName('');
    setInstitution('');
    setLimit('');
    setBalance('');
    setLastFour('');
    setShowAddCardModal(false);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    await finance.addAccount({
      name: accName,
      type: accType,
      balance: parseFloat(accBalance) || 0,
      institution: accInstitution || 'Instituição'
    });
    setAccName('');
    setAccBalance('');
    setAccInstitution('');
    setShowAddAccountModal(false);
  };

  const getAccountIcon = (type: FinancialAccount['type']) => {
    switch (type) {
      case 'bank': return Landmark;
      case 'digital': return Smartphone;
      case 'cash': return Banknote;
      case 'wallet': return Wallet;
      default: return Landmark;
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Contas e Cartões</h2>
          <p className="text-xs text-zinc-400">Gerencie seu saldo bancário, carteiras e limite de cartões de crédito</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold border border-zinc-800 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Nova Conta
          </button>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Cartão
          </button>
        </div>
      </div>

      {/* Account Balances Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Suas Contas Bancárias</h3>
          <span className="text-xs font-bold text-emerald-400">Total em Contas: {formatCurrency(totalAccountBalance)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {finance.accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            return (
              <div key={acc.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{acc.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{acc.institution || acc.type}</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">{formatCurrency(acc.balance)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Remover esta conta?')) finance.deleteAccount(acc.id);
                  }}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {finance.accounts.length === 0 && (
            <div className="col-span-full py-8 text-center bg-zinc-950/50 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-500 font-medium">Nenhuma conta cadastrada.</p>
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="mt-2 text-xs text-emerald-400 font-bold hover:underline"
              >
                + Cadastrar primeira conta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Credit Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cartões de Crédito Visuais</h3>
          <div className="flex gap-4 text-xs font-bold">
            <span className="text-zinc-400">Limite Total: <strong className="text-white">{formatCurrency(totalCreditLimit)}</strong></span>
            <span className="text-zinc-400">Utilizado: <strong className="text-rose-400">{formatCurrency(totalCreditUsed)}</strong></span>
            <span className="text-zinc-400">Disponível: <strong className="text-emerald-400">{formatCurrency(totalCreditAvailable)}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finance.creditCards.map((card) => {
            const available = card.limit - (card.balance || 0);
            const usagePercentage = Math.min(100, Math.round(((card.balance || 0) / card.limit) * 100));

            return (
              <div 
                key={card.id}
                className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-6 rounded-3xl text-white relative overflow-hidden shadow-2xl group hover:border-zinc-700 transition-all"
              >
                {/* Visual Card Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">{card.institution}</span>
                    <h4 className="text-lg font-black tracking-tight">{card.name}</h4>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Remover cartão?')) finance.deleteCreditCard(card.id);
                    }}
                    className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6 flex items-center justify-between font-mono text-sm text-zinc-400 tracking-widest">
                  <span>•••• •••• ••••</span>
                  <span className="text-white font-bold">{card.lastFourDigits || '0000'}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Limite:</span>
                    <span className="font-bold">{formatCurrency(card.limit)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Fatura Atual / Utilizado:</span>
                    <span className="font-bold text-rose-400">{formatCurrency(card.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Disponível:</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(available)}</span>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${usagePercentage > 80 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider pt-1">
                    <span>Fechamento: Dia {card.closingDay}</span>
                    <span>Vencimento: Dia {card.dueDate}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Compact Empty State */}
          {finance.creditCards.length === 0 && (
            <div className="col-span-full py-10 flex flex-col items-center justify-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl p-6 text-center">
              <CreditCardIcon className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm font-bold text-white">Você ainda não possui cartões cadastrados.</p>
              <p className="text-xs text-zinc-500 mb-4">Adicione seus cartões para ter controle visual de faturas e limites.</p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="px-5 py-2.5 bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 transition-all"
              >
                + Adicionar cartão
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">Adicionar Novo Cartão</h3>
                <button onClick={() => setShowAddCardModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Nome do Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Ex: Nubank Violeta / Itaú Click"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Instituição</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Ex: Nubank / Itaú"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Últimos 4 Dígitos</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={lastFour}
                      onChange={(e) => setLastFour(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Limite Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="5000.00"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Fatura Atual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Dia Fechamento</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={closingDay}
                      onChange={(e) => setClosingDay(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Dia Vencimento</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-400 text-black rounded-xl"
                  >
                    Salvar Cartão
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">Cadastrar Nova Conta</h3>
                <button onClick={() => setShowAddAccountModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Nome da Conta</label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Ex: Conta Corrente Itaú / Carteira Própria"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Tipo de Conta</label>
                    <select
                      value={accType}
                      onChange={(e) => setAccType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="bank">Banco Tradicional</option>
                      <option value="digital">Conta Digital</option>
                      <option value="wallet">Carteira / Dinheiro</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Saldo Atual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={accBalance}
                      onChange={(e) => setAccBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-400 text-black rounded-xl"
                  >
                    Salvar Conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
