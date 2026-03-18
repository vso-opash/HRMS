"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock session first
    const mockSession = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
    if (mockSession) {
      const mockData = JSON.parse(mockSession);
      setUser(mockData.user as User);
      setProfile(mockData.profile);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to employee profile for real-time role updates
        const profileRef = doc(db, 'employees', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        const unsubProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data());
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

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user');
    }
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'super_admin' || user?.email === 'vso.opash@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, logout }}>
      {!loading && children}
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
