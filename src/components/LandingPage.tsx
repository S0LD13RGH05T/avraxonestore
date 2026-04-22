import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { 
  Heart, 
  Wallet, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  Flag,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Amor & Finanças</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 px-8">
            <a href="#features" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#testimonials" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Depoimentos</a>
            <a href="#security" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Segurança</a>
          </div>

          <button 
            onClick={signIn}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Começar Grátis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Controle em tempo real</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-8">
              O futuro se reconstrói <span className="text-primary italic">em dupla.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
              O controle financeiro compartilhado para casais que querem sair das dívidas, bater metas e construir um patrimônio juntos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={signIn}
                className="group bg-primary text-white px-8 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.05] transition-all"
              >
                Ativar Minha Conta 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex -space-x-3 items-center px-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} alt="Avatar" className="w-10 h-10 rounded-full border-4 border-white object-cover shadow-sm" referrerPolicy="no-referrer" />
                ))}
                <span className="pl-6 text-sm font-bold text-gray-400">+500 casais ativos</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gray-50 rounded-[3rem] p-4 relative z-10 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="App Showcase" 
                className="rounded-[2.5rem] shadow-sm grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tudo sob controle.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Gestão financeira inteligente, simplificada para o seu dia a dia, seja pessoal ou empresarial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Sincronização Realtime"
              description="Quando um lança uma despesa, o outro recebe a notificação instantaneamente no dashboard."
            />
            <FeatureCard 
              icon={<CreditCard className="w-6 h-6 text-orange-500" />}
              title="Gestão de Dívidas"
              description="Organize o que deve, acompanhe o progresso de quitação e receba alertas de vencimento."
            />
            <FeatureCard 
              icon={<Flag className="w-6 h-6 text-blue-500" />}
              title="Metas Compartilhadas"
              description="Viagens, casa própria ou reserva de emergência. Acompanhem juntos cada centavo poupado."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-emerald-500" />}
              title="Calendário Mensal"
              description="Visão clara de quando o dinheiro entra e sai, facilitando o planejamento do mês."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-purple-500" />}
              title="Privacidade Total"
              description="Dados criptografados e acesso restrito apenas ao casal via convite seguro."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-pink-500" />}
              title="Perfis Individuais"
              description="Saiba quem gastou o quê sem perder a visão do patrimônio total da família."
            />
          </div>
        </div>
      </section>

      {/* Security Info */}
      <section id="security" className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
               <h2 className="text-5xl font-bold tracking-tight">Segurança bancária para <span className="text-accent underline decoration-4 underline-offset-8">sua paz.</span></h2>
               <div className="space-y-6">
                  <SecurityItem title="Auth via Google" description="Utilizamos a infraestrutura do Google para garantir que só você acesse seus dados." />
                  <SecurityItem title="Sem Acesso à Conta" description="Nós nunca pedimos senhas de banco. Você apenas registra seus movimentos de forma manual e inteligente." />
                  <SecurityItem title="Código de Convite" description="Ninguém pode entrar no seu perfil sem o código único de convite gerado por você." />
               </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-[4rem] p-12 border border-gray-100 flex items-center justify-center">
               <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                  <ShieldCheck className="w-16 h-16 text-accent mb-6" />
                  <p className="text-2xl font-bold mb-4">Dados Protegidos</p>
                  <p className="text-gray-400 font-medium leading-relaxed">Seus dados são armazenados de forma isolada em servidores seguros.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 italic">Prontos para <br/>o próximo nível?</h2>
          <p className="text-xl text-gray-500 mb-12 font-medium">Cadastre-se agora e receba acesso vitalício ao painel compartilhado.</p>
          <button 
            onClick={signIn}
            className="bg-primary text-white px-12 py-6 rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            Ativar Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-bold">Amor & Finanças</span>
          </div>
          <p className="text-sm font-medium text-gray-400 italic">Uma parceria para toda a vida.</p>
          <p className="text-xs text-gray-400">© 2026 Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-[3rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 font-medium leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SecurityItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent" />
        </div>
      </div>
      <div>
        <p className="font-bold text-lg mb-1">{title}</p>
        <p className="text-gray-400 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
