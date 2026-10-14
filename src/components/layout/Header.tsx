import React from 'react';
import {
  Flame,
  Bell,
  Cloud,
  CloudOff,
  RefreshCw,
  User,
  Zap,
} from 'lucide-react';
import { usePace } from '../../context/PaceContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile, onOpenNotifications }) => {
  const { currentStreak, consistencyScore, syncState, unreadNotificationsCount, triggerManualSync } = usePace();
  const { profile, isGuest, currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#070709]/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700/60 shadow-inner">
            <span className="font-black text-sm tracking-tighter text-[#ccff00]">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-white text-base sm:text-lg">
                PACE <span className="text-[#ccff00]">2.0</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-zinc-800/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border border-zinc-700/50">
                Performance Lab
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Metrics & Quick Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sync status indicator */}
          <button
            onClick={triggerManualSync}
            title={
              syncState === 'syncing'
                ? 'Syncing with cloud...'
                : syncState === 'offline'
                ? 'Offline mode (changes saved locally)'
                : syncState === 'synced'
                ? 'Synced with cloud'
                : 'Online. Click to refresh sync'
            }
            className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-xs border border-zinc-800 text-zinc-400 hover:border-zinc-700 transition"
          >
            {syncState === 'syncing' && (
              <RefreshCw className="h-3 w-3 animate-spin text-[#ccff00]" />
            )}
            {syncState === 'offline' && (
              <CloudOff className="h-3 w-3 text-amber-500" />
            )}
            {(syncState === 'online' || syncState === 'synced') && (
              <Cloud className="h-3 w-3 text-[#ccff00]" />
            )}
            <span className="hidden md:inline capitalize text-[11px] font-medium">
              {syncState}
            </span>
          </button>

          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-semibold border border-zinc-800">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-white">{currentStreak}</span>
            <span className="text-[10px] text-zinc-400 uppercase hidden sm:inline">Days</span>
          </div>

          {/* Consistency Badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-semibold border border-zinc-800">
            <Zap className="h-3.5 w-3.5 text-[#ccff00]" />
            <span className="text-zinc-300">Consistency:</span>
            <span className="text-[#ccff00] font-bold">{consistencyScore}%</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ccff00] text-[10px] font-bold text-black">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile / Account Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 hover:border-zinc-700 transition"
            aria-label="Open athlete settings"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs font-bold text-[#ccff00] overflow-hidden">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline text-xs font-medium text-zinc-200 max-w-[100px] truncate">
              {profile.displayName || (isGuest ? 'Guest' : 'Athlete')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
