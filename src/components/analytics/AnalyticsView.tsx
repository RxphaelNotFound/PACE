import React, { useState, useMemo } from 'react';
import { usePace } from '../../context/PaceContext';
import {
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  Download,
  Upload,
  Calendar,
  Zap,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    missions,
    trainingRecords,
    studySessions,
    consistencyScore,
    currentStreak,
    longestStreak,
    exportAppDataJson,
    importAppDataJson,
  } = usePace();

  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const rangeDays = timeRange === 'all' ? 365 : Number(timeRange);
  const cutoffDate = new Date(Date.now() - rangeDays * 86400000).toISOString().slice(0, 10);

  // Filtered datasets based on time range
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => m.createdAt >= cutoffDate);
  }, [missions, cutoffDate]);

  const filteredTraining = useMemo(() => {
    return trainingRecords.filter((t) => t.date >= cutoffDate);
  }, [trainingRecords, cutoffDate]);

  const filteredStudy = useMemo(() => {
    return studySessions.filter((s) => s.date >= cutoffDate);
  }, [studySessions, cutoffDate]);

  // Mission metrics
  const completedMissionsCount = filteredMissions.filter((m) => m.status === 'completed').length;
  const totalMissionsCount = filteredMissions.length;
  const missionRate = totalMissionsCount > 0 ? Math.round((completedMissionsCount / totalMissionsCount) * 100) : 100;

  // Study metrics
  const totalStudyMinutes = filteredStudy.reduce((sum, s) => sum + s.durationMinutes, 0);
  const studyHours = (totalStudyMinutes / 60).toFixed(1);

  // Training metrics
  const totalTrainingMinutes = filteredTraining.reduce((sum, t) => sum + t.durationMinutes, 0);
  const trainingHours = (totalTrainingMinutes / 60).toFixed(1);
  const prsCount = filteredTraining.filter((t) => t.isPersonalBest).length;

  // Study hours by subject
  const subjectDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudy.forEach((s) => {
      const prev = map.get(s.subjectName) || 0;
      map.set(s.subjectName, prev + s.durationMinutes);
    });
    return Array.from(map.entries())
      .map(([name, mins]) => ({
        name,
        mins,
        hours: (mins / 60).toFixed(1),
        pct: totalStudyMinutes > 0 ? Math.round((mins / totalStudyMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.mins - a.mins);
  }, [filteredStudy, totalStudyMinutes]);

  // Export JSON file
  const handleExport = () => {
    const jsonStr = exportAppDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PACE2.0_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const success = await importAppDataJson(content);
      if (success) {
        setImportStatus('Backup data imported successfully!');
      } else {
        setImportStatus('Failed to parse valid PACE 2.0 backup JSON.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#ccff00]" />
            PERFORMANCE ANALYTICS & REPORTS
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Objective metrics, consistency calculations, and academic/athletic trends
          </p>
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 p-1">
          {(['7', '30', '90', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded px-3 py-1 text-xs font-bold transition uppercase ${
                timeRange === r
                  ? 'bg-[#ccff00] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Time' : `${r} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Mission Rate</span>
            <CheckCircle2 className="h-4 w-4 text-[#ccff00]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{missionRate}%</div>
          <div className="text-[10px] text-zinc-500 mt-1">
            {completedMissionsCount} completed / {totalMissionsCount} deployed
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Study Volume</span>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-blue-400">{studyHours} hrs</div>
          <div className="text-[10px] text-zinc-500 mt-1">{filteredStudy.length} focus sessions</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Athletic Volume</span>
            <Dumbbell className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
            {trainingHours} hrs
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">{filteredTraining.length} workouts logged</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Discipline Record</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{prsCount} PBs</div>
          <div className="text-[10px] text-zinc-500 mt-1">Current streak: {currentStreak} days</div>
        </div>
      </div>

      {/* 2-Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Breakdown Chart */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            Study Distribution by Subject ({timeRange === 'all' ? 'All Time' : `${timeRange}D`})
          </h2>

          {subjectDistribution.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No study logged in this window.</p>
          ) : (
            <div className="space-y-3">
              {subjectDistribution.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="font-mono text-zinc-400">
                      {item.hours} hrs ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consistency & Discipline Profile */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#ccff00]" />
            Discipline & Consistency Profile
          </h2>

          <div className="space-y-3">
            <div className="rounded-lg bg-zinc-950 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Consistency Score</div>
                <div className="text-[11px] text-zinc-400">Based on past 30 active days</div>
              </div>
              <div className="text-xl font-black text-[#ccff00]">{consistencyScore}%</div>
            </div>

            <div className="rounded-lg bg-zinc-950 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Current Streak</div>
                <div className="text-[11px] text-zinc-400">Unbroken daily execution</div>
              </div>
              <div className="text-xl font-black text-amber-400">{currentStreak} Days</div>
            </div>

            <div className="rounded-lg bg-zinc-950 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Longest Streak</div>
                <div className="text-[11px] text-zinc-400">Historical peak performance</div>
              </div>
              <div className="text-xl font-black text-white">{longestStreak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Data Portability & Backup
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Export a complete JSON backup of all your missions, study records, training PRs, and events.
          </p>
          {importStatus && <p className="text-xs text-[#ccff00] mt-1">{importStatus}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-[#ccff00]" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition cursor-pointer">
            <Upload className="h-3.5 w-3.5 text-blue-400" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
