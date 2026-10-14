import React from 'react';
import { Calendar, Clock, Dumbbell, X, ArrowRight } from 'lucide-react';

export interface InAppAlertData {
  id: string;
  title: string;
  message: string;
  category: 'training' | 'deadline';
  dateStr?: string;
  timeStr?: string;
}

interface InAppAlertBannerProps {
  alerts: InAppAlertData[];
  onDismiss: (id: string) => void;
  onNavigateToCalendar: () => void;
}

export const InAppAlertBanner: React.FC<InAppAlertBannerProps> = ({
  alerts,
  onDismiss,
  onNavigateToCalendar,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-[calc(100%-2rem)] pointer-events-none"
    >
      {alerts.map((alert) => {
        const isTraining = alert.category === 'training';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 ${
              isTraining
                ? 'bg-[#0f150c]/95 border-[#ccff00]/60 text-zinc-100 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                : 'bg-[#181109]/95 border-amber-500/60 text-zinc-100 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Category Icon Badge */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  isTraining
                    ? 'bg-[#ccff00]/15 border-[#ccff00]/40 text-[#ccff00]'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                }`}
              >
                {isTraining ? (
                  <Dumbbell className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isTraining
                          ? 'bg-[#ccff00] text-black font-black'
                          : 'bg-amber-400 text-black font-black'
                      }`}
                    >
                      {isTraining ? 'Training Alert' : 'Deadline Alert'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Google Calendar
                    </span>
                  </div>

                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-zinc-400 hover:text-white p-1 rounded transition"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="mt-1 text-xs sm:text-sm font-bold text-white truncate">
                  {alert.title}
                </h4>

                <p className="mt-0.5 text-[11px] text-zinc-300 leading-snug line-clamp-2">
                  {alert.message}
                </p>

                {/* Schedule Quick Action */}
                <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {alert.dateStr && alert.timeStr
                      ? `${alert.dateStr} • ${alert.timeStr}`
                      : 'Scheduled on calendar'}
                  </span>
                  <button
                    onClick={() => {
                      onDismiss(alert.id);
                      onNavigateToCalendar();
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold transition hover:underline ${
                      isTraining ? 'text-[#ccff00]' : 'text-amber-400'
                    }`}
                  >
                    <span>View in Schedule</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
