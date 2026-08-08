import React, { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { 
  WorkspaceInvite, 
  createWorkspaceInvite, 
  getWorkspaceInvites, 
  cancelWorkspaceInvite, 
  removeWorkspacePartner 
} from '../services/inviteService';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Trash2, 
  UserCheck, 
  Clock, 
  AlertCircle,
  X,
  Shield,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TeamManagement() {
  const { profile, user } = useAuth();
  const finance = useFinance();

  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeShareInvite, setActiveShareInvite] = useState<WorkspaceInvite | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const coupleId = profile?.currentCoupleId;
  const coupleName = finance.coupleData?.name || 'Finanças Compartilhadas';
  const ownerName = profile?.displayName || user?.displayName || user?.email || 'Proprietário';

  const isOwner = finance.coupleData?.partner1 === user?.uid;
  const hasPartner = !!finance.coupleData?.partner2;

  const loadInvites = async () => {
    if (!coupleId) return;
    setLoadingInvites(true);
    const list = await getWorkspaceInvites(coupleId);
    setInvites(list);
    setLoadingInvites(false);
  };

  useEffect(() => {
    loadInvites();
  }, [coupleId]);

  const handleGenerateShare = async () => {
    if (!coupleId || !user) return;
    setGenerating(true);
    try {
      // Check if there is an existing PENDENTE invite
      const existingPending = invites.find(i => i.status === 'PENDENTE' && new Date(i.expiresAt).getTime() > Date.now());
      let targetInvite: WorkspaceInvite;

      if (existingPending) {
        targetInvite = existingPending;
      } else {
        targetInvite = await createWorkspaceInvite(coupleId, coupleName, user.uid, ownerName);
        await loadInvites();
      }

      setActiveShareInvite(targetInvite);

      // Web Share API trigger if available
      const inviteUrl = `${window.location.origin}/?invite=${targetInvite.token}`;
      const shareText = `Você foi convidado por ${ownerName} para participar de um ambiente financeiro compartilhado.\n\nAcesse pelo link abaixo para entrar:\n${inviteUrl}\n\nCódigo de convite: ${targetInvite.code}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Convite - Gestor Financeiro',
            text: shareText,
            url: inviteUrl
          });
        } catch (err) {
          // User dismissed native share sheet
        }
      }
    } catch (err) {
      console.error('Error generating share invite:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Deseja realmente cancelar este convite?')) return;
    await cancelWorkspaceInvite(inviteId);
    await loadInvites();
  };

  const handleRemovePartner = async () => {
    if (!coupleId) return;
    if (!confirm('Deseja realmente remover o integrante deste espaço financeiro?')) return;
    await removeWorkspacePartner(coupleId);
    window.location.reload();
  };

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Equipe e Compartilhamento</h3>
          <p className="text-xs text-zinc-400">Gerencie sócios e convites do ambiente financeiro compartilhado</p>
        </div>

        {isOwner && (
          <button
            onClick={handleGenerateShare}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 stroke-[3]" />
            {generating ? 'Gerando...' : 'COMPARTILHAR'}
          </button>
        )}
      </div>

      {/* Team Members List */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Integrantes Conectados</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Proprietário */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{ownerName}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Proprietário (Criador)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ativo
            </span>
          </div>

          {/* Sócio / Membro */}
          {hasPartner ? (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{finance.coupleData?.partner2Name || 'Sócio Conectado'}</p>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Membro (Sócio)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Ativo
                </span>
                {isOwner && (
                  <button
                    onClick={handleRemovePartner}
                    className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors"
                    title="Remover membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-zinc-600" />
                <span>Aguardando entrada do segundo sócio...</span>
              </div>
              {isOwner && (
                <button
                  onClick={handleGenerateShare}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  Convidar agora
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invites List */}
      {isOwner && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Histórico de Convites</h4>

          <div className="space-y-3">
            {invites.map((inv) => {
              const isExpired = new Date(inv.expiresAt).getTime() < Date.now();
              const displayStatus = isExpired && inv.status === 'PENDENTE' ? 'EXPIRADO' : inv.status;
              const inviteUrl = `${window.location.origin}/?invite=${inv.token}`;

              return (
                <div key={inv.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-amber-400 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        Código: {inv.code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        displayStatus === 'ACEITO'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : displayStatus === 'PENDENTE'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold">
                      Gerado em: {new Date(inv.createdAt).toLocaleString('pt-BR')} • Válido por 24h
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {displayStatus === 'PENDENTE' && (
                      <>
                        <button
                          onClick={() => setActiveShareInvite(inv)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Recompartilhar
                        </button>
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-all"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {invites.length === 0 && !loadingInvites && (
              <p className="text-xs text-zinc-500 text-center py-6">Nenhum convite gerado ainda.</p>
            )}
          </div>
        </div>
      )}

      {/* Share Dialog Modal */}
      <AnimatePresence>
        {activeShareInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" /> Convite Gerado
                </h3>
                <button onClick={() => setActiveShareInvite(null)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Code Display */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Código de 4 Dígitos</span>
                <p className="font-mono text-3xl font-black text-amber-400 tracking-[0.3em]">
                  {activeShareInvite.code}
                </p>
                <p className="text-[10px] text-zinc-500">Convite válido por 24 horas</p>
              </div>

              {/* Direct Actions */}
              <div className="space-y-3">
                {/* Copy Link */}
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/?invite=${activeShareInvite.token}`, 'link')}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-bold text-white transition-all"
                >
                  <span className="truncate pr-2 font-mono text-[11px] text-zinc-400">
                    {`${window.location.origin}/?invite=${activeShareInvite.token}`}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 flex-shrink-0">
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                  </span>
                </button>

                {/* Send WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Você foi convidado para participar de um ambiente financeiro compartilhado.\n\nAcesse pelo link abaixo para entrar:\n${window.location.origin}/?invite=${activeShareInvite.token}\n\nCódigo de convite: ${activeShareInvite.code}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Enviar pelo WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
