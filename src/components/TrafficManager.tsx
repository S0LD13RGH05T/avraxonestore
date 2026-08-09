import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { 
  Zap, 
  Plus, 
  Trash2, 
  X,
  Landmark
} from 'lucide-react';

export default function TrafficManager() {
  const finance = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [investment, setInvestment] = useState('');
  const [returnAmount, setReturnAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(finance.accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  const totalInvested = finance.trafficCampaigns.reduce((acc, t) => acc + (t.investment || 0), 0);
  const totalReturn = finance.trafficCampaigns.reduce((acc, t) => acc + (t.returnAmount || 0), 0);
  const netResult = totalReturn - totalInvested;
  const overallRoas = totalInvested > 0 ? (totalReturn / totalInvested).toFixed(2) : '0.00';

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const invNum = parseFloat(investment) || 0;
    const retNum = parseFloat(returnAmount) || 0;

    if (!campaignName || invNum <= 0) return;

    await finance.addTrafficCampaign({
      name: campaignName,
      investment: invNum,
      returnAmount: retNum,
      date,
      accountId,
      notes
    });

    setCampaignName('');
    setInvestment('');
    setReturnAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Painel de Tráfego Pago & Marketing</h2>
          <p className="text-xs text-zinc-400">Controle financeiro de campanhas, investimento em anúncios com débito em conta real e cálculo de ROAS</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nova Campanha
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Investido</span>
          <p className="text-2xl font-black text-rose-400">{formatCurrency(totalInvested)}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Faturamento Gerado</span>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalReturn)}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Resultado Líquido</span>
          <p className={`text-2xl font-black ${netResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">ROAS Médio</span>
          <p className="text-2xl font-black text-amber-400">{overallRoas}x</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {finance.trafficCampaigns.map((camp) => {
          const roasVal = camp.investment > 0 ? (camp.returnAmount / camp.investment).toFixed(2) : '0.00';
          const campNet = camp.returnAmount - camp.investment;

          return (
            <div 
              key={camp.id}
              className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl group hover:border-zinc-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-white">{camp.name}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {new Date(camp.date).toLocaleDateString('pt-BR')} {camp.accountName ? `• ${camp.accountName}` : ''}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  parseFloat(roasVal) >= 3 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : parseFloat(roasVal) >= 1
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  ROAS {roasVal}x
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Gasto (Saída)</span>
                  <p className="font-black text-rose-400 text-xs mt-0.5">{formatCurrency(camp.investment)}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Retorno</span>
                  <p className="font-black text-emerald-400 text-xs mt-0.5">{formatCurrency(camp.returnAmount)}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Lucro</span>
                  <p className={`font-black text-xs mt-0.5 ${campNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {campNet >= 0 ? '+' : ''}{formatCurrency(campNet)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[200px]">
                  {camp.notes || 'Sem observações'}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Remover campanha ${camp.name}? O lançamento de saída associado será estornado.`)) {
                      finance.deleteTrafficCampaign(camp.id);
                    }
                  }}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {finance.trafficCampaigns.length === 0 && (
          <div className="col-span-full py-16 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
            <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Nenhuma campanha de tráfego registrada.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Registrar Primeira Campanha
            </button>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white uppercase tracking-tight">Nova Campanha de Tráfego</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Nome da Campanha *</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Meta Ads — Black Friday / Cliente X"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Destination/Debit Account */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-emerald-400" /> Conta Utilizada para o Gasto *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                >
                  {finance.accounts.length === 0 && <option value="">Sem conta selecionada (Geral)</option>}
                  {finance.accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — (Saldo: {formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Investimento / Gasto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="200.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Retorno Faturado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(e.target.value)}
                    placeholder="1500.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Data do Anúncio</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold bg-emerald-400 text-black rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
