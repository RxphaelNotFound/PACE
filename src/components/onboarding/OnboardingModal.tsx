import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Dumbbell,
  WifiOff,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
    updateUserProfile,
  } = useAuth();

  const [step, setStep] = useState<'intro' | 'auth' | 'profile'>('intro');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<'Dual Athlete-Student' | 'Athletics' | 'Academics'>('Dual Athlete-Student');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      setStep('profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed. You can continue offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      setStep('profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    loginAsGuest();
    setStep('profile');
  };

  const handleFinishProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateUserProfile({
        displayName: name.trim(),
        primaryFocus: focus,
        goals: goals.trim() || 'Achieve peak performance in academic and athletic benchmarks.',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0a0a0f] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle Lime glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#ccff00]/10 blur-3xl pointer-events-none" />

        {/* STEP 1: ANIMATED INTRO */}
        {step === 'intro' && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700 text-[#ccff00] shadow-inner">
              <span className="font-black text-2xl tracking-tighter">P</span>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#ccff00] flex items-center justify-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Next-Gen Performance Command
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                PACE <span className="text-[#ccff00]">2.0</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                The athletic command centre built for dedicated students and competitive athletes.
                Manage missions, log workouts and PRs, track study hours, and build unbreakable consistency.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 py-2 text-left">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <Dumbbell className="h-4 w-4 text-[#ccff00] mb-1.5" />
                <div className="text-[11px] font-bold text-white">Athletic Benchmarks</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Lifts, splits & validated PBs</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <BookOpen className="h-4 w-4 text-blue-400 mb-1.5" />
                <div className="text-[11px] font-bold text-white">Academic Lab</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Live focus stopwatch & exams</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400 mb-1.5" />
                <div className="text-[11px] font-bold text-white">Discipline Heat Map</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">16-week consistency engine</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setStep('auth')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition active:scale-95 shadow-lg shadow-[#ccff00]/20"
              >
                <span>Enter Command Centre</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleOfflineMode}
                className="w-full text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 py-1"
              >
                <WifiOff className="h-3 w-3" />
                <span>Continue Offline as Guest</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUTHENTICATION SCREEN */}
        {step === 'auth' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <span className="font-extrabold text-sm uppercase tracking-wider text-[#ccff00]">
                PACE 2.0 Account Gate
              </span>
              <h2 className="mt-1 text-2xl font-black text-white">
                {authMode === 'signup' ? 'CREATE ATHLETE ACCOUNT' : 'WELCOME BACK'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sync across devices or run in offline-first mode anytime.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-950/60 border border-red-800 p-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            {/* Official Google Sign-In Material Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">
                    Continue with Google
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Or with Email & Password
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@domain.com"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
              >
                {loading
                  ? 'Verifying...'
                  : authMode === 'signup'
                  ? 'Sign Up with Email'
                  : 'Sign In with Email'}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                className="text-zinc-400 hover:text-white"
              >
                {authMode === 'signup'
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>

              <button
                type="button"
                onClick={handleOfflineMode}
                className="text-[#ccff00] font-semibold hover:underline"
              >
                Use Offline / Guest
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INITIAL PROFILE & GOALS SETUP */}
        {step === 'profile' && (
          <form onSubmit={handleFinishProfile} className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <span className="font-extrabold text-sm uppercase tracking-wider text-[#ccff00]">
                Initial Setup
              </span>
              <h2 className="mt-1 text-2xl font-black text-white">SET YOUR FOCUS PROTOCOL</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customize PACE 2.0 to your athletic and academic priorities.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Preferred Athlete / Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Primary Focus Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Dual Athlete-Student' as const, label: 'Dual Focus' },
                  { id: 'Athletics' as const, label: 'Athletics' },
                  { id: 'Academics' as const, label: 'Academics' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFocus(item.id)}
                    className={`rounded-lg border py-2 text-xs font-bold transition ${
                      focus === item.id
                        ? 'border-[#ccff00] bg-zinc-800 text-[#ccff00]'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Primary Goal / Objective
              </label>
              <input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Sub-6.80s 60m electronic time and First Class honours"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#ccff00] py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition active:scale-95 shadow-lg shadow-[#ccff00]/20 mt-2"
            >
              Launch PACE 2.0 Command
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
