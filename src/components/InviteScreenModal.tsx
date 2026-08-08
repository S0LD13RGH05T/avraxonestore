import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  WorkspaceInvite, 
  getInviteByToken, 
  getInviteByCode, 
  acceptWorkspaceInvite 
} from '../services/inviteService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

interface InviteScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string | null;
  initialCode?: string | null;
  onSuccessRedirect?: () => void;
}

export default function InviteScreenModal({
  isOpen,
  onClose,
  initialToken,
  initialCode,
  onSuccessRedirect
}: InviteScreenModalProps) {
  const { user, profile, signIn, updateProfile } = useAuth();
  const [invite, setInvite] = useState<WorkspaceInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Manual 4-digit code input state if no token provided
  const [inputCode, setInputCode] = useState(initialCode || '');

  useEffect(() => {
    if (!isOpen) return;

    async function loadInvite() {
      setLoading(true);
      setError('');
      try {
        if (initialToken) {
          const inv = await getInviteByToken(initialToken);
          if (inv) {
            setInvite(inv);
          } else {
            setError('Convite não encontrado ou link inválido.');
          }
        } else if (initialCode && initialCode.length === 4) {
          const inv = await getInviteByCode(initialCode);
          if (inv) {
            setInvite(inv);
          } else {
            setError('Código de convite inválido ou expirado.');
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar convite.');
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [isOpen, initialToken, initialCode]);

  const handleSearchByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      const inv = await getInviteByCode(inputCode);
      if (inv) {
        setInvite(inv);
      } else {
        setError('Código de convite inválido ou expirado.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao validar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;
    setProcessing(true);
    setError('');
    try {
      const userName = profile?.displayName || user.displayName || user.email || 'Sócio';
      await acceptWorkspaceInvite(invite, user.uid, userName, updateProfile);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccessRedirect) onSuccessRedirect();
        onClose();
        // Clear query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar convite.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSignInAndAccept = async () => {
    try {
      await signIn();
      // Auth state listener will update user, then user can click accept or auto accept
    } catch (err: any) {
      setError('Erro ao autenticar com o Google.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success State */}
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Convite Aceito!</h3>
              <p className="text-xs text-zinc-400">
                Você agora faz parte do ambiente financeiro compartilhado. Redirecionando...
              </p>
            </div>
          ) : loading ? (
            <div className="py-12 text-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-xs text-zinc-400 font-bold">Validando convite...</p>
            </div>
          ) : !invite ? (
            /* Search by 4-digit code form if no active invite loaded */
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Código de Convite</h3>
                  <p className="text-xs text-zinc-400">Insira o código de 4 dígitos enviado pelo sócio</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSearchByCode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 text-center">
                    Código (4 Dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="4729"
                    className="w-full text-center font-mono text-3xl tracking-[0.5em] bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inputCode.length !== 4}
                  className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  Continuar <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </form>
            </div>
          ) : (
            /* Active Invite Screen */
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Convite Recebido
                </span>
                <h3 className="text-xl font-black text-white tracking-tight">VOCÊ FOI CONVIDADO</h3>
                <p className="text-xs text-zinc-400 leading-relaxed px-4">
                  Você recebeu um convite para participar do ambiente financeiro compartilhado de <strong className="text-white">{invite.ownerName}</strong>.
                </p>
              </div>

              {/* Workspace Badge Info */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Espaço:</span>
                  <span className="font-bold text-white">{invite.coupleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Proprietário:</span>
                  <span className="font-bold text-emerald-400">{invite.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Código de Convite:</span>
                  <span className="font-mono font-black text-amber-400 tracking-widest">{invite.code}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Status Validation & Action Button */}
              {invite.status !== 'PENDENTE' ? (
                <div className="p-4 bg-zinc-900 rounded-2xl text-center border border-zinc-800 space-y-1">
                  <p className="text-xs font-bold text-rose-400">Este convite está {invite.status.toLowerCase()}.</p>
                  <p className="text-[10px] text-zinc-500">Solicite um novo convite ao proprietário.</p>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-400 text-center">Para aceitar o convite, entre com sua conta Google:</p>
                  <button
                    onClick={handleSignInAndAccept}
                    className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Continuar com Google
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAcceptInvite}
                  disabled={processing}
                  className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  {processing ? 'Entrando no Espaço...' : 'ACEITAR CONVITE E ENTRAR'}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
