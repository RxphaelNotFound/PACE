import React, { useState, useMemo } from 'react';
import { usePace } from '../../context/PaceContext';
import { TrainingRecord } from '../../types';
import {
  Dumbbell,
  Award,
  Plus,
  Flame,
  Calendar,
  Clock,
  Trash2,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

interface PerformanceViewProps {
  onOpenNewTraining: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ onOpenNewTraining }) => {
  const { trainingRecords, deleteTrainingRecord } = usePace();

  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  const sports = useMemo(() => {
    const set = new Set<string>();
    trainingRecords.forEach((r) => set.add(r.sport));
    return Array.from(set);
  }, [trainingRecords]);

  const filteredRecords = useMemo(() => {
    return trainingRecords.filter((r) => {
      if (selectedSport !== 'all' && r.sport !== selectedSport) return false;
      if (selectedEventType !== 'all' && r.eventType !== selectedEventType) return false;
      return true;
    });
  }, [trainingRecords, selectedSport, selectedEventType]);

  // Aggregate stats
  const totalVolumeMinutes = useMemo(() => {
    return trainingRecords.reduce((sum, r) => sum + r.durationMinutes, 0);
  }, [trainingRecords]);

  const personalBests = useMemo(() => {
    return trainingRecords.filter((r) => r.isPersonalBest);
  }, [trainingRecords]);

  return (
    <div className="space-y-6">
      {/* Hero Athletic Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/pace_athletic_track_1791994168481.jpg"
            alt="Athletic track performance"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              <Zap className="h-3.5 w-3.5" />
              Athletic Engine & Personal Best Archive
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              ATHLETIC PERFORMANCE
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 max-w-xl">
              Track session volume, benchmark time trials, competition results, and validated Personal Bests.
            </p>
          </div>

          <button
            onClick={onOpenNewTraining}
            className="flex items-center gap-2 rounded-lg bg-[#ccff00] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-lg shadow-[#ccff00]/20 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Log Performance</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Total Sessions</div>
          <div className="text-2xl font-black text-white mt-1">{trainingRecords.length}</div>
          <div className="text-[10px] text-zinc-500 mt-1">Logged workouts</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Personal Bests</div>
          <div className="text-2xl font-black text-[#ccff00] mt-1">{personalBests.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Verified records</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Total Volume</div>
          <div className="text-2xl font-black text-white mt-1">
            {Math.floor(totalVolumeMinutes / 60)}h {totalVolumeMinutes % 60}m
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Time under tension</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Active Sports</div>
          <div className="text-2xl font-black text-white mt-1">{sports.length || 1}</div>
          <div className="text-[10px] text-zinc-500 mt-1">Discipline branches</div>
        </div>
      </div>

      {/* Hall of Personal Bests Showcase */}
      {personalBests.length > 0 && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5">
          <h2 className="text-xs font-bold tracking-wide uppercase text-white flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-[#ccff00]" />
            Hall of Personal Bests (PR Archive)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalBests.map((pb) => (
              <div
                key={pb.id}
                className="rounded-lg bg-zinc-950 border border-[#ccff00]/30 p-3.5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">{pb.sport}</span>
                  <span className="rounded bg-[#ccff00] px-1.5 py-0.5 text-[9px] font-black text-black uppercase">
                    PB
                  </span>
                </div>
                <div className="text-sm font-black text-white mt-1 truncate">{pb.title}</div>
                {pb.metricValue && (
                  <div className="mt-2 text-xl font-extrabold text-[#ccff00]">
                    {pb.metricValue}{' '}
                    <span className="text-xs text-zinc-400 font-semibold">{pb.metricUnit}</span>
                  </div>
                )}
                <div className="mt-2 text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Set on {new Date(pb.date + 'T00:00:00').toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-white focus:border-[#ccff00]"
          >
            <option value="all">All Sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-white focus:border-[#ccff00] capitalize"
          >
            <option value="all">All Event Types</option>
            <option value="session">Training Sessions</option>
            <option value="time_trial">Time Trials</option>
            <option value="competition">Competitions</option>
            <option value="event">Meets & Events</option>
          </select>
        </div>

        <div className="text-xs text-zinc-400">
          Showing {filteredRecords.length} performance logs
        </div>
      </div>

      {/* Training Records Feed */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
            <Dumbbell className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              No Training Logs Recorded
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Start building your athletic benchmark history by logging your first workout or time trial.
            </p>
            <button
              onClick={onOpenNewTraining}
              className="mt-4 rounded-lg bg-[#ccff00] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition"
            >
              + Log Workout
            </button>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 hover:border-zinc-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
                      {rec.sport}
                    </span>
                    <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 capitalize">
                      {rec.eventType.replace('_', ' ')}
                    </span>
                    {rec.isPersonalBest && (
                      <span className="rounded bg-[#ccff00] px-1.5 py-0.5 text-[9px] font-black text-black uppercase">
                        ★ Personal Best
                      </span>
                    )}
                    {rec.intensity && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Flame className="h-3 w-3 fill-amber-400" /> RPE {rec.intensity}/5
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white">{rec.title}</h3>

                  {rec.notes && (
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">{rec.notes}</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(rec.date + 'T00:00:00').toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rec.durationMinutes} Minutes
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-zinc-800/60 pt-2 sm:pt-0">
                  {rec.metricValue !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-black text-[#ccff00]">
                        {rec.metricValue}{' '}
                        <span className="text-xs text-zinc-400 font-semibold">{rec.metricUnit}</span>
                      </div>
                      {rec.metricName && (
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                          {rec.metricName}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => deleteTrainingRecord(rec.id)}
                    className="rounded p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
