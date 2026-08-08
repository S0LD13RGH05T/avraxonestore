import React, { useState } from 'react';
import { useFinance, Client } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Briefcase
} from 'lucide-react';
import QuickActionModal from './QuickActionModal';

export default function ClientsManager() {
  const finance = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredClients = finance.clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReceivables = finance.clients
    .filter(c => c.status === 'A RECEBER' || c.status === 'PENDENTE' || c.status === 'ATRASADO')
    .reduce((acc, c) => acc + (c.amount || 0), 0);

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'PAGO':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> PAGO</span>;
      case 'A RECEBER':
      case 'PENDENTE':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> A RECEBER</span>;
      case 'ATRASADO':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertTriangle className="w-3 h-3" /> ATRASADO</span>;
      case 'ATIVO':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Briefcase className="w-3 h-3" /> ATIVO</span>;
      default:
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Clientes e A Receber</h2>
          <p className="text-xs text-zinc-400">Controle de cobranças, recebimentos e contratos de clientes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total a Receber</span>
            <h3 className="text-3xl font-black text-amber-400 tracking-tight">{formatCurrency(totalReceivables)}</h3>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs border-l border-zinc-800 pl-6 hidden sm:flex">
          <div>
            <span className="text-zinc-500 block text-[10px] font-bold uppercase">Clientes Ativos</span>
            <span className="text-lg font-bold text-white">
              {finance.clients.filter(c => c.status === 'ATIVO' || c.status === 'A RECEBER').length}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-bold uppercase">Atrasados</span>
            <span className="text-lg font-bold text-rose-400">
              {finance.clients.filter(c => c.status === 'ATRASADO').length}
            </span>
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
            placeholder="Buscar por cliente ou serviço..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar">
          {['ALL', 'A RECEBER', 'PAGO', 'ATRASADO', 'ATIVO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === st
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div 
            key={client.id}
            className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-all space-y-4 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-white">{client.name}</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-emerald-400" /> {client.service}
                </p>
              </div>
              {getStatusBadge(client.status)}
            </div>

            <div className="space-y-1 text-xs text-zinc-400">
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
              <p className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
                <Calendar className="w-3.5 h-3.5" /> Vencimento: {client.paymentDate ? new Date(client.paymentDate).toLocaleDateString('pt-BR') : 'A definir'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase">Valor Contratado</span>
                <p className="font-black text-emerald-400 text-base">{formatCurrency(client.amount)}</p>
              </div>

              <div className="flex items-center gap-1">
                {client.status !== 'PAGO' && (
                  <button
                    onClick={() => finance.updateClientStatus(client.id, 'PAGO')}
                    className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold rounded-lg transition-colors border border-emerald-500/20"
                  >
                    Marcar Pago
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Remover este cliente?')) finance.deleteClient(client.id);
                  }}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Nenhum cliente cadastrado nesta visualização.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
            >
              + Cadastrar cliente
            </button>
          </div>
        )}
      </div>

      <QuickActionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultAction="client"
      />
    </div>
  );
}
