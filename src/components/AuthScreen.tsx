import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Wallet, Heart, ArrowRight } from 'lucide-react';

export default function AuthScreen() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-4 border-white">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">Amor & Finanças</h1>
        <p className="text-gray-500 mb-8">
          O controle financeiro feito para quem constrói o futuro em dupla.
        </p>

        <button
          onClick={signIn}
          className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/component/google_logo.svg" 
            alt="Google" 
            className="w-5 h-5 bg-white rounded-full p-0.5"
            referrerPolicy="no-referrer"
          />
          Entrar com Google
        </button>

        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">01</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Simples</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">02</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Realtime</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">03</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Seguro</div>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-xs text-gray-400 max-w-xs text-center leading-relaxed">
        Ao entrar, você concorda com os termos de uso e política de privacidade do sistema.
      </p>
    </div>
  );
}
