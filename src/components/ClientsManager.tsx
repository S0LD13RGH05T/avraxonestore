import React, { useState } from 'react';
import { useFinance, Client } from '../hooks/useFinance';
import { formatCurrency, cn } from '../lib/utils';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  DollarSign,
  History,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import QuickActionModal from './QuickActionModal';
import RegisterPaymentModal from './RegisterPaymentModal';

export default function ClientsManager() {
  const finance = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Payment Modal state
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | null>(null);
  const [expandedHistoryClientId, setExpandedHistoryClientId] = useState<string | null>(null);

  const filteredClients = finance.clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReceivables = finance.clients
    .filter(c => c.status !== 'PAGO' && c.status !== 'CANCELADO')
    .reduce((acc, c) => acc + (c.remainingAmount ?? (c.totalAmount || c.amount || 0)), 0);

  const totalPaidReceivables = finance.clients
    .reduce((acc, c) => acc + (c.paidAmount || 0), 0);

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'PAGO':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3 h-3" /> PAGO
          </span>
        );
      case 'PAGAMENTO PARCIAL':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10">
            <Clock className="w-3 h-3 text-cyan-400 animate-pulse" /> PARCIAL
          </span>
        );
      case 'ATRASADO':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10">
            <AlertTriangle className="w-3 h-3" /> ATRASADO
          </span>
        );
      case 'AGUARDANDO':
      case 'A RECEBER':
      case 'PENDENTE':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/10">
            <Clock className="w-3 h-3" /> AGUARDANDO
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Clientes e Recebíveis</h2>
          <p className="text-xs text-zinc-400">Gestão integrada de clientes, cobranças, pagamentos parciais e movimentações financeiras</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Novo Cliente
        </button>
      </div>

      {/* Summary KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-amber-500/20 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total a Receber</span>
              <h3 className="text-2xl font-black text-amber-400 tracking-tight">{formatCurrency(totalReceivables)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-emerald-500/20 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Já Recebido</span>
              <h3 className="text-2xl font-black text-emerald-400 tracking-tight">{formatCurrency(totalPaidReceivables)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Clientes Cadastrados</span>
              <h3 className="text-2xl font-black text-white tracking-tight">{finance.clients.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do cliente ou serviço..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar">
          {['ALL', 'AGUARDANDO', 'PAGAMENTO PARCIAL', 'PAGO', 'ATRASADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                statusFilter === st
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900"
              )}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const total = client.totalAmount || client.amount || 0;
          const paid = client.paidAmount || 0;
          const remaining = client.remainingAmount ?? Math.max(0, total - paid);
          const isHistoryExpanded = expandedHistoryClientId === client.id;
          const paymentsList = client.payments || [];

          return (
            <div 
              key={client.id}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between group hover:border-zinc-700 transition-all space-y-4 shadow-xl relative overflow-hidden"
            >
              {/* Status Header */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-extrabold text-base text-white tracking-tight">{client.name}</h4>
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" /> {client.service}
                  </p>
                </div>
                {getStatusBadge(client.status)}
              </div>

              {/* Contacts */}
              <div className="space-y-1.5 text-xs text-zinc-400 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/60">
                {client.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> {client.phone}
                  </p>
                )}
                {client.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> {client.email}
                  </p>
                )}
                <p className="flex items-center gap-2 text-[11px] text-zinc-400 font-bold pt-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Vencimento: {client.paymentDate ? new Date(client.paymentDate).toLocaleDateString('pt-BR') : 'A definir'}
                </p>
              </div>

              {/* Financial Progress Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-2 text-center p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Contratado</span>
                    <p className="font-black text-white text-xs mt-0.5">{formatCurrency(total)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Recebido</span>
                    <p className="font-black text-emerald-400 text-xs mt-0.5">{formatCurrency(paid)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Restante</span>
                    <p className="font-black text-rose-400 text-xs mt-0.5">{formatCurrency(remaining)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((paid / total) * 100))}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClientForPayment(client)}
                  className="flex-1 py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 transform active:scale-95"
                >
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  {remaining > 0 ? 'Registrar Pagamento' : 'Novo Pagamento'}
                </button>

                {paymentsList.length > 0 && (
                  <button
                    onClick={() => setExpandedHistoryClientId(isHistoryExpanded ? null : client.id)}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    title="Histórico de Pagamentos"
                  >
                    <History className="w-4 h-4 text-cyan-400" />
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isHistoryExpanded && "rotate-180")} />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm(`Remover cliente ${client.name}?`)) finance.deleteClient(client.id);
                  }}
                  className="p-2.5 text-zinc-600 hover:text-rose-400 rounded-xl transition-colors hover:bg-rose-500/10"
                  title="Remover Cliente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Itemized Payment History Drawer */}
              {isHistoryExpanded && paymentsList.length > 0 && (
                <div className="pt-3 border-t border-zinc-900 space-y-2 animate-in slide-in-from-top-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    Histórico de Pagamentos ({paymentsList.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {paymentsList.map((p) => (
                      <div 
                        key={p.id}
                        className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-400">+{formatCurrency(p.amount)}</span>
                            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold">{p.paymentMethod || 'PIX'}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {new Date(p.date).toLocaleDateString('pt-BR')} • {p.accountName || 'Geral'} {p.userName ? `• por ${p.userName}` : ''}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Deseja estornar o pagamento de ${formatCurrency(p.amount)}? O saldo da conta será ajustado.`)) {
                              finance.revertClientPayment(client.id, p.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                          title="Estornar Pagamento"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Nenhum cliente encontrado.</p>
            <p className="text-xs text-zinc-500 mt-1">Cadastre clientes para acompanhar pagamentos e movimentações automaticamente.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Cliente
            </button>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      <QuickActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultAction="client"
      />

      {/* Register Payment Modal */}
      <RegisterPaymentModal
        isOpen={!!selectedClientForPayment}
        onClose={() => setSelectedClientForPayment(null)}
        client={selectedClientForPayment}
      />
    </div>
  );
}
