import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Users, UserPlus, ArrowRight, Check, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Onboarding() {
  const { user, updateProfile, logout } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createCouple = async (type: 'Personal' | 'Business') => {
    if (!user) return;
    setLoading(true);
    try {
      const coupleId = `space_${Math.random().toString(36).substring(2, 15)}`;
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const coupleRef = doc(db, 'couples', coupleId);
      await setDoc(coupleRef, {
        partner1: user.uid,
        partner2: null,
        inviteCode: newInviteCode,
        type,
        name: type === 'Personal' ? 'Finanças Pessoais' : 'Finanças Empresariais',
        createdAt: new Date().toISOString(),
      });

      await updateProfile({ currentCoupleId: coupleId, role: 'partner1' });
    } catch (err) {
      setError('Erro ao criar espaço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const joinCouple = async () => {
    if (!user || !inviteCode) return;
    setLoading(true);
    setError('');
    try {
      const couplesRef = collection(db, 'couples');
      const q = query(couplesRef, where('inviteCode', '==', inviteCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Código de convite não encontrado.');
        return;
      }

      const coupleDoc = querySnapshot.docs[0];
      const coupleData = coupleDoc.data();

      if (coupleData.partner2) {
        setError('Este espaço já está completo.');
        return;
      }

      await updateDoc(coupleDoc.ref, {
        partner2: user.uid
      });

      await updateProfile({ currentCoupleId: coupleDoc.id, role: 'partner2' });
    } catch (err) {
      setError('Erro ao entrar no espaço. Verifique o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-4 relative">
      <button 
        onClick={() => logout()}
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Sair
      </button>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-3 max-w-4xl w-full"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full grid md:grid-cols-2 gap-8"
      >
        <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center text-center shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Criar Espaço Financeiro</h2>
          <p className="text-zinc-400 text-xs mb-8 leading-relaxed">
            Inicie um controle financeiro completo Pessoal ou de Gestão do seu negócio.
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={() => createCouple('Personal')}
              disabled={loading}
              className="w-full bg-emerald-400 text-black py-3.5 rounded-2xl font-bold text-xs hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Finanças Pessoais <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => createCouple('Business')}
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-xs border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Gestão de Negócio <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center text-center shadow-2xl">
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-zinc-400">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Entrar com Convite</h2>
          <p className="text-zinc-400 text-xs mb-8 leading-relaxed">
            Insira o código de convite recebido para se conectar a um espaço existente.
          </p>
          
          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
            <button
              onClick={joinCouple}
              disabled={loading || !inviteCode}
              className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-xs border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Acessar Espaço <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
