import React, { useState, useEffect, useMemo } from 'react';
import { usePace } from '../../context/PaceContext';
import { Subject, StudySession } from '../../types';
import {
  BookOpen,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  FolderPlus,
  CheckCircle,
} from 'lucide-react';

interface StudyViewProps {
  onOpenNewStudy: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ onOpenNewStudy }) => {
  const {
    studySessions,
    subjects,
    addSubject,
    deleteSubject,
    addStudySession,
    deleteStudySession,
  } = usePace();

  // Live Focus Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchSubject, setStopwatchSubject] = useState(
    subjects.length > 0 ? subjects[0].name : 'General Academic'
  );
  const [stopwatchTopic, setStopwatchTopic] = useState('');

  // New subject inline state
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubColor, setNewSubColor] = useState('#3b82f6');
  const [newSubTarget, setNewSubTarget] = useState(6);

  // Filter
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Live stopwatch timer ticker
  useEffect(() => {
    let interval: any = null;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  const handleSaveStopwatchSession = async () => {
    if (stopwatchSeconds < 30) {
      setStopwatchRunning(false);
      setStopwatchSeconds(0);
      return;
    }

    const durationMins = Math.max(1, Math.round(stopwatchSeconds / 60));
    const matched = subjects.find(
      (s) => s.name.toLowerCase() === stopwatchSubject.toLowerCase()
    );

    await addStudySession({
      subjectId: matched?.id,
      subjectName: stopwatchSubject,
      topic: stopwatchTopic.trim() || 'Focused Study Sprint',
      durationMinutes: durationMins,
      date: new Date().toISOString().slice(0, 10),
      sessionType: 'revision',
      notes: 'Recorded via live PACE Focus Stopwatch.',
    });

    setStopwatchRunning(false);
    setStopwatchSeconds(0);
    setStopwatchTopic('');
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    await addSubject({
      name: newSubName.trim(),
      code: newSubCode.trim() || undefined,
      color: newSubColor,
      targetWeeklyHours: Number(newSubTarget) || 5,
    });

    setNewSubName('');
    setNewSubCode('');
    setIsAddingSubject(false);
  };

  // Aggregated study totals
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const todayMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [studySessions, todayStr]);

  const weekMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date >= sevenDaysAgo)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [studySessions, sevenDaysAgo]);

  const monthMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date >= thirtyDaysAgo)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [studySessions, thirtyDaysAgo]);

  // Breakdown by subject
  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    studySessions.forEach((s) => {
      const current = map.get(s.subjectName) || 0;
      map.set(s.subjectName, current + s.durationMinutes);
    });
    return Array.from(map.entries()).map(([name, mins]) => ({
      name,
      mins,
      hours: (mins / 60).toFixed(1),
    }));
  }, [studySessions]);

  const filteredSessions = useMemo(() => {
    if (selectedSubjectFilter === 'all') return studySessions;
    return studySessions.filter((s) => s.subjectName === selectedSubjectFilter);
  }, [studySessions, selectedSubjectFilter]);

  const formatStopwatch = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Live Focus Stopwatch Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Hub Banner (2 Cols) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c11] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                <BookOpen className="h-3.5 w-3.5" />
                Academic Discipline Hub
              </div>
              <h1 className="mt-1 text-2xl font-black text-white uppercase">ACADEMIC MANAGEMENT</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Log focus hours, customize course subjects, and maintain high academic standards.
              </p>
            </div>

            <button
              onClick={onOpenNewStudy}
              className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Log Study Session</span>
            </button>
          </div>

          {/* Aggregate Totals Pill Bar */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4">
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Today</div>
              <div className="text-xl font-black text-white mt-0.5">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
            </div>

            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Past 7 Days</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}m
              </div>
            </div>

            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Past 30 Days</div>
              <div className="text-xl font-black text-[#ccff00] mt-0.5">
                {Math.floor(monthMinutes / 60)}h {monthMinutes % 60}m
              </div>
            </div>
          </div>
        </div>

        {/* Live Focus Stopwatch (1 Col) */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e14] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ccff00]" />
                Live Focus Stopwatch
              </span>
              {stopwatchRunning && (
                <span className="flex items-center gap-1 rounded-full bg-red-950/80 border border-red-800 px-2 py-0.5 text-[9px] font-bold text-red-400 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Recording
                </span>
              )}
            </div>

            <div className="mt-3 text-center py-2">
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatStopwatch(stopwatchSeconds)}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <select
                value={stopwatchSubject}
                onChange={(e) => setStopwatchSubject(e.target.value)}
                disabled={stopwatchRunning}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                {subjects.length === 0 && <option value="General Studies">General Studies</option>}
              </select>

              <input
                type="text"
                placeholder="Session focus topic..."
                value={stopwatchTopic}
                onChange={(e) => setStopwatchTopic(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {!stopwatchRunning ? (
              <button
                onClick={() => setStopwatchRunning(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#ccff00] py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10"
              >
                <Play className="h-3.5 w-3.5 fill-black" />
                <span>Start Focus</span>
              </button>
            ) : (
              <button
                onClick={() => setStopwatchRunning(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-2 text-xs font-bold text-black hover:bg-amber-300 transition active:scale-95"
              >
                <Pause className="h-3.5 w-3.5 fill-black" />
                <span>Pause</span>
              </button>
            )}

            {stopwatchSeconds > 0 && (
              <>
                <button
                  onClick={handleSaveStopwatchSession}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 text-xs font-bold transition active:scale-95"
                  title="Save study session"
                >
                  Save Log
                </button>
                <button
                  onClick={() => {
                    setStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2.5 py-2 text-xs font-bold transition"
                  title="Reset timer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Custom Subjects Management */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-[#ccff00]" />
              Configured Subjects & Target Weekly Quotas
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add your own subjects without restrictions. Set target study hours per week.
            </p>
          </div>

          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="flex items-center gap-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 transition"
          >
            <Plus className="h-3.5 w-3.5 text-[#ccff00]" />
            <span>Add Custom Subject</span>
          </button>
        </div>

        {isAddingSubject && (
          <form
            onSubmit={handleCreateSubject}
            className="mb-4 rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3 animate-in fade-in"
          >
            <h3 className="text-xs font-bold uppercase text-white">Create New Course / Subject</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Subject Name (e.g. Organic Chemistry)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="sm:col-span-2 rounded bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Code (e.g. CHEM 201)"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                className="rounded bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="number"
                min="1"
                max="40"
                placeholder="Target Hours/Wk"
                value={newSubTarget}
                onChange={(e) => setNewSubTarget(Number(e.target.value))}
                className="rounded bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Color:</span>
                <select
                  value={newSubColor}
                  onChange={(e) => setNewSubColor(e.target.value)}
                  className="rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white"
                >
                  <option value="#3b82f6">Blue</option>
                  <option value="#10b981">Green</option>
                  <option value="#a855f7">Purple</option>
                  <option value="#f59e0b">Amber</option>
                  <option value="#ef4444">Red</option>
                  <option value="#ccff00">Lime</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="rounded px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#ccff00] px-3.5 py-1 text-xs font-bold text-black hover:bg-[#b8e600]"
                >
                  Save Subject
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Subjects List Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const totalMins = studySessions
              .filter((s) => s.subjectName === sub.name)
              .reduce((sum, s) => sum + s.durationMinutes, 0);

            return (
              <div
                key={sub.id}
                className="rounded-lg bg-zinc-950 border border-zinc-800 p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {sub.name}
                      </span>
                    </div>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="text-zinc-600 hover:text-red-400"
                        title="Delete subject"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {sub.code && <div className="text-[10px] text-zinc-500 mt-0.5">{sub.code}</div>}
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Total Study:</span>
                  <span className="font-extrabold text-white">
                    {(totalMins / 60).toFixed(1)} hrs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Sessions Log History */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Academic Study Session History
            </h2>
            <p className="text-xs text-zinc-400">Past study blocks, revision logs, and exam preps</p>
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-white focus:border-[#ccff00]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center bg-zinc-950/40">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400">No study sessions recorded for this filter.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/90 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{session.subjectName}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 uppercase">
                      {session.sessionType.replace('_', ' ')}
                    </span>
                  </div>
                  {session.topic && (
                    <div className="text-xs text-zinc-300 font-medium">{session.topic}</div>
                  )}
                  {session.notes && <p className="text-[11px] text-zinc-400">{session.notes}</p>}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs border-t sm:border-t-0 border-zinc-900 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(session.date + 'T00:00:00').toLocaleDateString()}</span>
                  </div>

                  <div className="font-extrabold text-[#ccff00] text-sm">
                    {session.durationMinutes} min
                  </div>

                  <button
                    onClick={() => deleteStudySession(session.id)}
                    className="text-zinc-600 hover:text-red-400 transition"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
