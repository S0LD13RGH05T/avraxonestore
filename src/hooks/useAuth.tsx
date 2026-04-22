import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currentCoupleId?: string;
  workspaceIds?: string[];
  balance?: number;
  role?: string;
  themeColor?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        const userDocRef = doc(db, 'users', user.uid);
        
        // Use real-time sync for profile
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
          } else {
            // Initial profile creation
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              workspaceIds: [],
              balance: 0
            };
            setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
          }
        });

        setLoading(false);
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    
    // Calculate new workspace IDs array
    const currentWorkspaceIds = profile?.workspaceIds || [];
    let updatedWorkspaceIds = [...currentWorkspaceIds];
    
    if (data.currentCoupleId && !updatedWorkspaceIds.includes(data.currentCoupleId)) {
      updatedWorkspaceIds.push(data.currentCoupleId);
    }

    // Use provided workspaceIds or calculated ones
    const finalWorkspaceIds = data.workspaceIds !== undefined ? data.workspaceIds : updatedWorkspaceIds;

    await setDoc(userDocRef, {
      ...data,
      workspaceIds: finalWorkspaceIds
    }, { merge: true });
  };

  const switchWorkspace = async (workspaceId: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      currentCoupleId: workspaceId
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, updateProfile, switchWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
