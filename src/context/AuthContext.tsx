import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleSignIn,
  emailSignIn,
  emailSignUp,
  logoutUser,
  setCachedAccessToken,
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile;
  isGuest: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasGoogleCalendarAccess: boolean;
}

const defaultProfile: UserProfile = {
  userId: 'guest',
  displayName: 'Athlete',
  primaryFocus: 'Dual Athlete-Student',
  primarySport: 'Track & Field',
  goals: 'Break personal bests and maintain dean’s list honours.',
  dailyGoalMissions: 4,
  dailyGoalStudyMinutes: 120,
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('pace20_profile');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('pace20_is_guest') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [hasGoogleCalendarAccess, setHasGoogleCalendarAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsGuest(false);
        localStorage.removeItem('pace20_is_guest');

        // Check or create user profile doc in Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            localStorage.setItem('pace20_profile', JSON.stringify(data));
          } else {
            const newProf: UserProfile = {
              userId: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Athlete',
              email: firebaseUser.email || undefined,
              primaryFocus: 'Dual Athlete-Student',
              primarySport: 'Athletics & Training',
              goals: 'Maintain peak discipline across academics and athletics.',
              dailyGoalMissions: 4,
              dailyGoalStudyMinutes: 120,
              notificationsEnabled: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProf);
            setProfile(newProf);
            localStorage.setItem('pace20_profile', JSON.stringify(newProf));
          }
        } catch (err) {
          console.warn('Could not load user profile from Firestore:', err);
        }
      } else {
        setCurrentUser(null);
        setHasGoogleCalendarAccess(false);
        setCachedAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { user, accessToken } = await googleSignIn();
    if (user) {
      setCurrentUser(user);
      setIsGuest(false);
      localStorage.removeItem('pace20_is_guest');
      if (accessToken) {
        setHasGoogleCalendarAccess(true);
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await emailSignIn(email, pass);
    setCurrentUser(res.user);
    setIsGuest(false);
    localStorage.removeItem('pace20_is_guest');
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const res = await emailSignUp(email, pass);
    const newProf: UserProfile = {
      userId: res.user.uid,
      displayName: name || email.split('@')[0] || 'Athlete',
      email: email,
      primaryFocus: 'Dual Athlete-Student',
      primarySport: 'Track & Field / Conditioning',
      goals: 'Dominate both the arena and the classroom.',
      dailyGoalMissions: 4,
      dailyGoalStudyMinutes: 120,
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), newProf);
    } catch (e) {
      console.warn('Error saving profile to cloud:', e);
    }
    setProfile(newProf);
    localStorage.setItem('pace20_profile', JSON.stringify(newProf));
    setCurrentUser(res.user);
    setIsGuest(false);
    localStorage.removeItem('pace20_is_guest');
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('pace20_is_guest', 'true');
    const guestProf: UserProfile = {
      ...defaultProfile,
      displayName: profile.displayName || 'Guest Athlete',
    };
    setProfile(guestProf);
    localStorage.setItem('pace20_profile', JSON.stringify(guestProf));
    setLoading(false);
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsGuest(false);
    localStorage.removeItem('pace20_is_guest');
    setHasGoogleCalendarAccess(false);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem('pace20_profile', JSON.stringify(updated));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Could not update profile in cloud:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isGuest,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        updateUserProfile,
        hasGoogleCalendarAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
