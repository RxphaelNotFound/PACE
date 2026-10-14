import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePace } from '../../context/PaceContext';
import {
  User,
  X,
  Cloud,
  LogOut,
  RefreshCw,
  Download,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { currentUser, profile, updateUserProfile, logout, isGuest } = useAuth();
  const { syncState, triggerManualSync, exportAppDataJson, resetToDefaultData } = usePace();

  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [goals, setGoals] = useState(profile.goals || '');
  const [primaryFocus, setPrimaryFocus] = useState(profile.primaryFocus || 'Dual Athlete-Student');
  const [primarySport, setPrimarySport] = useState(profile.primarySport || 'Track & Field');
  const [dailyGoalMissions, setDailyGoalMissions] = useState(profile.dailyGoalMissions || 4);
  const [dailyGoalStudyMinutes, setDailyGoalStudyMinutes] = useState(
    profile.dailyGoalStudyMinutes || 120
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile.notificationsEnabled ?? true
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName: displayName.trim(),
      goals: goals.trim(),
      primaryFocus: primaryFocus as any,
      primarySport: primarySport.trim(),
      dailyGoalMissions: Number(dailyGoalMissions) || 4,
      dailyGoalStudyMinutes: Number(dailyGoalStudyMinutes) || 120,
      notificationsEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    onOpenAuth();
  };

  const handleConfirmReset = () => {
    resetToDefaultData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0c0c11] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              ATHLETE PROFILE & SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account / Sync Status Card */}
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                {currentUser?.email || (isGuest ? 'Guest Mode (Local Storage)' : profile.displayName)}
              </div>
              <div className="text-[11px] text-zinc-400">
                {currentUser ? 'Authenticated with Firebase Cloud' : 'Offline / Guest user'}
              </div>
            </div>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-zinc-700"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="rounded-lg bg-[#ccff00] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#b8e600]"
              >
                Sign In / Sync
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Cloud className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>Status: <strong className="text-white capitalize">{syncState}</strong></span>
            </div>
            <button
              onClick={triggerManualSync}
              className="text-[#ccff00] hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              <RefreshCw className="h-3 w-3" /> Force Cloud Sync
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 rounded-lg bg-emerald-950/60 border border-emerald-800 p-2.5 text-xs text-emerald-200 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Profile and performance goals updated!</span>
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Athlete Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Primary Sport / Arena
              </label>
              <input
                type="text"
                value={primarySport}
                onChange={(e) => setPrimarySport(e.target.value)}
                placeholder="e.g. Track & Field, Swimming, Gym"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Primary Focus Mode
            </label>
            <select
              value={primaryFocus}
              onChange={(e) => setPrimaryFocus(e.target.value as any)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00]"
            >
              <option value="Dual Athlete-Student">Dual Athlete-Student (Balanced Command)</option>
              <option value="Athletics">Athletics Priority (Peak Competition Focus)</option>
              <option value="Academics">Academics Priority (Exam & Study Focus)</option>
              <option value="General">General Personal Productivity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Core Athletic & Academic Goals
            </label>
            <textarea
              rows={2}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Qualify for Nationals in 100m sprint and earn Dean's list 3.9+ GPA"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Daily Mission Target
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyGoalMissions}
                onChange={(e) => setDailyGoalMissions(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Daily Study Target (Mins)
              </label>
              <input
                type="number"
                min="15"
                max="600"
                value={dailyGoalStudyMinutes}
                onChange={(e) => setDailyGoalStudyMinutes(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-[#ccff00] focus:ring-[#ccff00]"
              />
              <span className="text-xs font-medium text-zinc-300">
                Enable In-App Deadline & Exam Reminders
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-zinc-500 hover:text-amber-400 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Sample Data</span>
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#ccff00] px-5 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="mt-4 rounded-xl bg-amber-950/40 border border-amber-800/80 p-3.5 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Reset to default sample data?</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              This replaces your current records with fresh student-athlete benchmark templates.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-black hover:bg-amber-400"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
