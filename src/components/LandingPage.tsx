import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CreditCard, 
  Users, 
  LayoutDashboard,
  KeyRound
} from 'lucide-react';

interface LandingPageProps {
  onOpenCodeModal?: () => void;
}

export default function LandingPage({ onOpenCodeModal }: LandingPageProps) {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black font-black">
              <LayoutDashboard className="w-4 h-4 text-black" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight uppercase">Avrax Finance</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCodeModal && (
              <button
                onClick={onOpenCodeModal}
                className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-bold transition-colors px-3 py-2"
              >
                <KeyRound className="w-3.5 h-3.5" /> Possui um código?
              </button>
            )}
            <button 
              onClick={signIn}
              className="bg-emerald-400 text-black px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 transition-all transform active:scale-95"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Centro de Comando Financeiro</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6 text-white">
              Gestão Financeira Pessoal e de Negócio de Alta Performance
            </h1>
            <p className="text-zinc-400 text-base mb-8 max-w-lg leading-relaxed">
              Controle entradas, saídas, investimentos, tráfego pago, cartões de crédito, dívidas e cobranças em um único sistema integrado rápido e seguro no Firebase.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={signIn}
                className="bg-emerald-400 text-black px-8 py-3.5 rounded-2xl text-xs font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-300 transition-all flex items-center gap-2 transform active:scale-95"
              >
                Entrar com Google <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenCodeModal && (
                <button
                  onClick={onOpenCodeModal}
                  className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" /> Inserir código de convite
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dashboard Executivo</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">Ao Vivo</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Saldo Atual</span>
                <p className="text-2xl font-black text-white mt-1">R$ 28.450,00</p>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Resultado do Mês</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">+R$ 8.920,00</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl text-xs">
                <span className="text-zinc-300 font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-400" /> Fatura Nubank</span>
                <span className="text-rose-400 font-bold">-R$ 1.250,00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl text-xs">
                <span className="text-zinc-300 font-bold flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Cliente João (Landing Page)</span>
                <span className="text-emerald-400 font-bold">+R$ 3.500,00</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
