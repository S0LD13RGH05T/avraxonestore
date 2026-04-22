import { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading } = useAuth();

  // Inject theme color
  useEffect(() => {
    if (profile?.themeColor) {
      document.documentElement.style.setProperty('--primary-color', profile.themeColor);
    } else {
      // Default color
      document.documentElement.style.setProperty('--primary-color', '#6366f1');
    }
  }, [profile?.themeColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-primary font-bold text-2xl tracking-tighter"
        >
          Gestor Financeiro
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!profile?.currentCoupleId) {
    return <Onboarding />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Dashboard />
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
