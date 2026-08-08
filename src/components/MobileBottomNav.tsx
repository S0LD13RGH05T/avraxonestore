import React, { useState } from 'react';
import { TabType } from './Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  CalendarDays, 
  Grid3X3, 
  TrendingUp, 
  Zap, 
  Users, 
  CircleAlert, 
  BarChart3, 
  History, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function MobileBottomNav({ activeTab, setActiveTab }: MobileBottomNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainNavItems = [
    { id: 'home' as TabType, label: 'Início', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'Lançamentos', icon: ArrowLeftRight },
    // Center MENU button is handled separately
    { id: 'goals' as TabType, label: 'Objetivos', icon: Target },
    { id: 'calendar' as TabType, label: 'Calendário', icon: CalendarDays },
  ];

  const secondaryNavItems = [
    { id: 'investments' as TabType, label: 'Investimentos', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'traffic' as TabType, label: 'Tráfego Pago', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'clients' as TabType, label: 'Clientes', icon: Users, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'debts' as TabType, label: 'Dívidas', icon: CircleAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'reports' as TabType, label: 'Relatórios', icon: BarChart3, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'history' as TabType, label: 'Histórico', icon: History, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'settings' as TabType, label: 'Configurações', icon: Settings, color: 'text-zinc-300 bg-zinc-800/50 border-zinc-700' },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Expanded Grid 3x3 Overlay Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Expanded Menu Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm text-white uppercase tracking-wider">Recursos e Módulos</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3x3 Grid Layout */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center group active:scale-95",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30"
                          : "bg-zinc-900/60 text-zinc-300 border-zinc-800/80 hover:bg-zinc-800"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 border transition-transform group-hover:scale-110", item.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight text-white leading-tight line-clamp-1">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl lg:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 px-3 shadow-2xl">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {/* Item 1: Início */}
          <button
            onClick={() => handleSelectTab(mainNavItems[0].id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all active:scale-90",
              activeTab === 'home' ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Início</span>
            {activeTab === 'home' && <span className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5" />}
          </button>

          {/* Item 2: Movimentações */}
          <button
            onClick={() => handleSelectTab(mainNavItems[1].id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all active:scale-90",
              activeTab === 'transactions' ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <ArrowLeftRight className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Extrato</span>
            {activeTab === 'transactions' && <span className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5" />}
          </button>

          {/* Center Prominent MENU Button (Grid3X3) */}
          <div className="flex justify-center -mt-5 relative z-10">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "w-13 h-13 rounded-2xl flex flex-col items-center justify-center border-2 transition-all transform active:scale-90 shadow-xl",
                isMenuOpen
                  ? "bg-emerald-400 text-black border-emerald-300 shadow-emerald-500/40 rotate-45"
                  : "bg-zinc-950 text-emerald-400 border-emerald-500/60 shadow-emerald-500/20 hover:border-emerald-400"
              )}
            >
              <Grid3X3 className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Item 4: Objetivos */}
          <button
            onClick={() => handleSelectTab(mainNavItems[2].id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all active:scale-90",
              activeTab === 'goals' ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Objetivos</span>
            {activeTab === 'goals' && <span className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5" />}
          </button>

          {/* Item 5: Calendário */}
          <button
            onClick={() => handleSelectTab(mainNavItems[3].id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all active:scale-90",
              activeTab === 'calendar' ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Agenda</span>
            {activeTab === 'calendar' && <span className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5" />}
          </button>
        </div>
      </nav>
    </>
  );
}
