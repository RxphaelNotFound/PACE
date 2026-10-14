import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarActivityType } from '../../types';
import { X, Calendar, Share2 } from 'lucide-react';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDate?: string;
  presetType?: CalendarActivityType;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  presetDate,
  presetType,
}) => {
  const { addCalendarEvent } = usePace();
  const { hasGoogleCalendarAccess } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarActivityType>(presetType || 'exam');
  const [startDate, setStartDate] = useState(
    presetDate || new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [syncToGoogle, setSyncToGoogle] = useState(hasGoogleCalendarAccess);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const fullStart = allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`;
      const fullEnd = allDay ? `${startDate}T23:59:59` : `${startDate}T${endTime}:00`;

      await addCalendarEvent(
        {
          title: title.trim(),
          type,
          startDate: fullStart,
          endDate: fullEnd,
          allDay,
          notes: notes.trim() || undefined,
          status: 'scheduled',
        },
        syncToGoogle
      );

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule event');
    } finally {
      setSubmitting(false);
    }
  };

  const types: { value: CalendarActivityType; label: string; color: string }[] = [
    { value: 'exam', label: 'Examination / Test', color: 'text-red-400' },
    { value: 'deadline', label: 'Assignment Deadline', color: 'text-amber-400' },
    { value: 'training', label: 'Training / Meet', color: 'text-[#ccff00]' },
    { value: 'study', label: 'Study Session', color: 'text-blue-400' },
    { value: 'personal', label: 'Personal / Recovery', color: 'text-purple-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0e13] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              SCHEDULE EVENT / EXAMINATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/60 border border-red-800 p-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry Final Exam or Regional Track Finals"
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Event Classification
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarActivityType)}
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-[#ccff00] focus:ring-[#ccff00]"
                />
                <span className="text-xs font-semibold text-zinc-300">All-day event</span>
              </label>
            </div>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-[#ccff00]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-[#ccff00]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Notes / Location / Preparation
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Exam room, required gear, weight check, submission portal..."
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          {/* Google Calendar Sync Option */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#ccff00]" />
              <div>
                <div className="text-xs font-bold text-white">Google Calendar Sync</div>
                <div className="text-[11px] text-zinc-400">
                  {hasGoogleCalendarAccess
                    ? 'Sync immediately to your primary Google Calendar'
                    : 'Sign in with Google to enable automatic 2-way calendar sync'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              disabled={!hasGoogleCalendarAccess}
              checked={syncToGoogle && hasGoogleCalendarAccess}
              onChange={(e) => setSyncToGoogle(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-[#ccff00] focus:ring-[#ccff00] disabled:opacity-40"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-[#ccff00] px-5 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/20 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Save to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
