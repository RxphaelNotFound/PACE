import React, { useState, useMemo } from 'react';
import { usePace } from '../../context/PaceContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, CalendarActivityType } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  Trash2,
  AlertCircle,
  Dumbbell,
  BookOpen,
  User,
  Share2,
} from 'lucide-react';

interface CalendarViewProps {
  onOpenNewEvent: (presetDate?: string, presetType?: CalendarActivityType) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenNewEvent }) => {
  const { calendarEvents, deleteCalendarEvent, syncGoogleCalendar } = usePace();
  const { hasGoogleCalendarAccess, loginWithGoogle } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Deletion confirmation modal state (MANDATORY per Workspace integration skill)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute days in month grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const calendarDays = useMemo(() => {
    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      days.push({ day: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d
        .toString()
        .padStart(2, '0')}`;
      days.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      days.push({ day: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Events filtered by type
  const filteredEvents = useMemo(() => {
    if (typeFilter === 'all') return calendarEvents;
    return calendarEvents.filter((e) => e.type === typeFilter);
  }, [calendarEvents, typeFilter]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.startDate.startsWith(selectedDateStr));
  }, [filteredEvents, selectedDateStr]);

  // Google Calendar Sync handler
  const handleSyncGoogleCalendar = async () => {
    if (!hasGoogleCalendarAccess) {
      await loginWithGoogle();
      return;
    }

    setSyncingGoogle(true);
    setSyncFeedback(null);
    try {
      const res = await syncGoogleCalendar();
      setSyncFeedback(
        `Bi-directional sync successful: ${res.imported} pulled from Google, ${res.exported} exported to Google, ${res.matched} matched local, ${res.alertsCreated} alerts created.`
      );
      setTimeout(() => setSyncFeedback(null), 6000);
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message || 'Check connection or permissions'}`);
    } finally {
      setSyncingGoogle(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteCalendarEvent(eventToDelete.id, true);
      setEventToDelete(null);
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  const getTypeColor = (type: CalendarActivityType) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500 text-white';
      case 'deadline':
        return 'bg-amber-400 text-black';
      case 'training':
        return 'bg-[#ccff00] text-black';
      case 'study':
        return 'bg-blue-400 text-black';
      case 'personal':
        return 'bg-purple-400 text-black';
      default:
        return 'bg-zinc-400 text-black';
    }
  };

  const getTypeIcon = (type: CalendarActivityType) => {
    switch (type) {
      case 'exam':
        return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
      case 'deadline':
        return <Clock className="h-3.5 w-3.5 text-amber-400" />;
      case 'training':
        return <Dumbbell className="h-3.5 w-3.5 text-[#ccff00]" />;
      case 'study':
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <User className="h-3.5 w-3.5 text-purple-400" />;
    }
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#ccff00]" />
            IN-APP MASTER CALENDAR
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Command centre schedule for exam dates, academic deadlines, athletic training blocks, and study quotas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenNewEvent(selectedDateStr)}
            className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Event / Exam</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-xs text-zinc-200 animate-in fade-in">
          {syncFeedback}
        </div>
      )}

      {/* Navigation and View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-extrabold text-white tracking-wide min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View Toggle & Type Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => setViewMode('month')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'month' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'agenda' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-white focus:border-[#ccff00]"
          >
            <option value="all">All Activities</option>
            <option value="exam">Examinations</option>
            <option value="deadline">Deadlines</option>
            <option value="training">Training</option>
            <option value="study">Study</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Month Grid (2 cols) */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5">
            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mt-2">
              {calendarDays.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = todayIso === cell.dateStr;
                const daysEvents = filteredEvents.filter((e) =>
                  e.startDate.startsWith(cell.dateStr)
                );

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[64px] sm:min-h-[80px] rounded-lg p-1.5 text-left transition flex flex-col justify-between border ${
                      isSelected
                        ? 'border-[#ccff00] bg-zinc-800/90'
                        : isToday
                        ? 'border-zinc-700 bg-zinc-900/90'
                        : cell.isCurrentMonth
                        ? 'border-zinc-800/60 bg-zinc-950/60 hover:border-zinc-700'
                        : 'border-transparent bg-zinc-950/20 opacity-30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-[#ccff00] text-black font-black'
                            : isSelected
                            ? 'text-[#ccff00]'
                            : 'text-zinc-300'
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* Dot indicators for events on this date */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {daysEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${getTypeColor(e.type).split(' ')[0]}`}
                          title={`${e.title} (${e.type})`}
                        />
                      ))}
                      {daysEvents.length > 3 && (
                        <span className="text-[8px] font-bold text-zinc-400">
                          +{daysEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector (1 col) */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
                  Selected Schedule
                </span>
                <h3 className="text-sm font-black text-white">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => onOpenNewEvent(selectedDateStr)}
                className="rounded-lg bg-zinc-800 p-1.5 text-zinc-300 hover:text-white"
                title="Add event on this date"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-400">No scheduled activities for this date.</p>
                <button
                  onClick={() => onOpenNewEvent(selectedDateStr)}
                  className="mt-3 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-[#ccff00] hover:bg-zinc-700"
                >
                  + Schedule Event
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateEvents.map((evt) => {
                  const startTime = !evt.allDay
                    ? new Date(evt.startDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'All Day';

                  return (
                    <div
                      key={evt.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(evt.type)}
                          <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {evt.type}
                          </span>
                        </div>
                        <button
                          onClick={() => setEventToDelete(evt)}
                          className="text-zinc-600 hover:text-red-400"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-white">{evt.title}</div>

                      {evt.notes && (
                        <p className="text-[11px] text-zinc-400 leading-snug">{evt.notes}</p>
                      )}

                      <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {startTime}
                        </span>
                        {evt.googleEventId && (
                          <span className="text-[9px] font-semibold text-[#ccff00] flex items-center gap-1">
                            <Share2 className="h-2.5 w-2.5" /> G-Cal Synced
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Chronological Agenda
          </h2>
          {filteredEvents.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No events in schedule.</p>
          ) : (
            <div className="space-y-2">
              {[...filteredEvents]
                .sort(
                  (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                )
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(evt.type)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{evt.title}</span>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                            {evt.type}
                          </span>
                        </div>
                        {evt.notes && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">{evt.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 self-end sm:self-auto">
                      <span>
                        {new Date(evt.startDate).toLocaleDateString()} {!evt.allDay && new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => setEventToDelete(evt)}
                        className="text-zinc-600 hover:text-red-400"
                        title="Delete event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before Deleting Calendar Events */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0e14] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Delete Scheduled Event?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">"{eventToDelete.title}"</span> scheduled for{' '}
              <span className="font-semibold text-zinc-200">
                {new Date(eventToDelete.startDate).toLocaleDateString()}
              </span>
              ?
              {eventToDelete.googleEventId && (
                <span className="block mt-2 text-amber-400">
                  This will also remove the event from your Google Calendar. This action cannot be
                  undone.
                </span>
              )}
            </p>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
