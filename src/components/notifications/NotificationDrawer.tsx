import React from 'react';
import { usePace } from '../../context/PaceContext';
import {
  Bell,
  X,
  AlertCircle,
  Clock,
  Flame,
  Check,
  Trash2,
  Calendar,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    requestBrowserNotifications,
  } = usePace();

  if (!isOpen) return null;

  const handleItemClick = (n: any) => {
    markNotificationRead(n.id);
    if (n.linkTab) {
      onNavigateTab(n.linkTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-[#0c0c11] border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Command Notifications
                </h2>
                <p className="text-[11px] text-zinc-400">Impending deadlines and reminders</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Browser Notification Permission Banner */}
          {'Notification' in window && Notification.permission !== 'granted' && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-300">
                <span className="font-bold text-white block">Enable Native Alerts</span>
                Receive background alerts for exam deadlines.
              </div>
              <button
                onClick={requestBrowserNotifications}
                className="rounded-lg bg-[#ccff00] px-3 py-1 text-xs font-bold text-black hover:bg-[#b8e600] whitespace-nowrap"
              >
                Allow
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[70vh]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <Bell className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
                <p className="text-xs">All clear. No urgent mission or exam alerts.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`rounded-xl border p-3.5 transition cursor-pointer ${
                    n.read
                      ? 'border-zinc-900 bg-zinc-950/40 text-zinc-500'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === 'exam' && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}
                    {n.type === 'deadline' && <Clock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />}
                    {n.type === 'streak' && <Flame className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />}
                    {n.type === 'google_calendar' && <Calendar className="h-4 w-4 text-[#ccff00] mt-0.5 shrink-0" />}

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{n.title}</span>
                        {n.type === 'google_calendar' && (
                          <span className="rounded bg-[#ccff00]/15 text-[#ccff00] text-[9px] font-bold px-1 py-0.2">
                            G-Cal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
