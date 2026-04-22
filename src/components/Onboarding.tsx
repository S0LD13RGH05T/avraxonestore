import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, query, collection, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Users, UserPlus, ArrowRight, Check, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Onboarding() {
  const { user, profile, updateProfile, logout } = useAuth();
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
        type, // Guardar o tipo (Pessoal ou Empresarial)
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative">
      {/* Back Button */}
      <button 
        onClick={() => logout()}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Sair e Voltar ao Início
      </button>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 max-w-4xl w-full"
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
        {/* Workspace Creation Options */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Criar Novo Perfil</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            Comece um controle financeiro Pessoal ou Empresarial isolado.
          </p>
          <div className="w-full space-y-4">
            <button
              onClick={() => createCouple('Personal')}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Ponto Pessoal <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => createCouple('Business')}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Controle Empresarial <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Join Option - More Muted/Gray */}
        <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 flex flex-col items-center text-center opacity-80">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight text-slate-600">Entrar em Workspace</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed">
            Convite estático: insira o código compartilhado pelo criador do Workspace.
          </p>
          
          <div className="w-full space-y-4">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center font-mono text-xl tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
            <button
              onClick={joinCouple}
              disabled={loading || !inviteCode}
              className="w-full bg-slate-300 text-white py-4 rounded-2xl font-bold hover:bg-slate-400 transition-all flex items-center justify-center gap-2"
            >
              Unir Contas <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
