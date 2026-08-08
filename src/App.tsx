import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import InviteScreenModal from './components/InviteScreenModal';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  
  // URL Invite detection
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    // Check URL parameters for ?invite=TOKEN or ?code=4729
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite') || params.get('token');
    const code = params.get('code');

    if (token) {
      setInviteToken(token);
      setShowInviteModal(true);
    } else if (code && code.length === 4) {
      setInviteCode(code);
      setShowInviteModal(true);
    }
  }, []);

  // Inject theme color
  useEffect(() => {
    if (profile?.themeColor) {
      document.documentElement.style.setProperty('--primary-color', profile.themeColor);
    } else {
      document.documentElement.style.setProperty('--primary-color', '#10b981');
    }
  }, [profile?.themeColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      {/* Invite Modal interception */}
      <InviteScreenModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        initialToken={inviteToken}
        initialCode={inviteCode}
        onSuccessRedirect={() => {
          setShowInviteModal(false);
        }}
      />

      {!user ? (
        <LandingPage onOpenCodeModal={() => {
          setInviteToken(null);
          setInviteCode(null);
          setShowInviteModal(true);
        }} />
      ) : !profile?.currentCoupleId ? (
        <Onboarding onOpenCodeModal={() => {
          setInviteToken(null);
          setInviteCode(null);
          setShowInviteModal(true);
        }} />
      ) : (
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
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
