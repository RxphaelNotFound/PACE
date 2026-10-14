import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { useAuth } from '../../context/AuthContext';
import { ConsistencyHeatMap } from '../consistency/ConsistencyHeatMap';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Dumbbell,
  Calendar,
  Sparkles,
  ArrowRight,
  Award,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewMission: () => void;
  onOpenNewTraining: () => void;
  onOpenNewStudy: () => void;
  onOpenNewEvent: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewMission,
  onOpenNewTraining,
  onOpenNewStudy,
  onOpenNewEvent,
  onNavigateTab,
}) => {
  const {
    missions,
    todayCompletedMissions,
    todayTotalMissions,
    todayMissionPercentage,
    todayStudyMinutes,
    currentStreak,
    consistencyScore,
    toggleMissionComplete,
    upcomingDeadlinesAndExams,
    recentPBs,
  } = usePace();
  const { profile } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Today's missions
  const todayMissions = missions.filter((m) => {
    if (m.status === 'completed' && m.completedAt?.startsWith(todayStr)) return true;
    if (m.deadline?.startsWith(todayStr)) return true;
    if (m.recurrence === 'daily') return true;
    if (m.status === 'active') return true;
    return false;
  }).slice(0, 6);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-red-400 bg-red-950/40 border-red-800/40';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      default:
        return 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Action Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d12] p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></span>
              {formattedToday} • {profile.primaryFocus || 'Dual Athlete-Student'}
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              COMMAND READY,{' '}
              <span className="text-[#ccff00]">{profile.displayName || 'ATHLETE'}</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xl">
              {profile.goals || 'Execute today’s training benchmarks, study quotas, and active missions.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Mission</span>
            </button>
            <button
              onClick={onOpenNewTraining}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition active:scale-95"
            >
              <Dumbbell className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>Athletic Log</span>
            </button>
            <button
              onClick={onOpenNewStudy}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition active:scale-95"
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Study Session</span>
            </button>
            <button
              onClick={onOpenNewEvent}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition active:scale-95"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-[#ccff00]/5 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Vital Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Mission Completion */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Missions Today</span>
            <CheckCircle2 className="h-4 w-4 text-[#ccff00]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {todayCompletedMissions}
            </span>
            <span className="text-xs text-zinc-500 font-semibold">/ {todayTotalMissions} Done</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#ccff00] transition-all duration-500"
              style={{ width: `${todayMissionPercentage}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-400 font-medium flex justify-between">
            <span>Completion Rate</span>
            <span className="text-[#ccff00] font-bold">{todayMissionPercentage}%</span>
          </div>
        </div>

        {/* Metric 2: Consistency Score */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>30D Consistency</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#ccff00]">
              {consistencyScore}%
            </span>
            <span className="text-xs text-zinc-500 font-semibold">Target: 85%</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-400 font-medium flex justify-between">
            <span>Discipline index</span>
            <span className="text-emerald-400 font-bold">
              {consistencyScore >= 80 ? 'Elite' : consistencyScore >= 60 ? 'Consistent' : 'Building'}
            </span>
          </div>
        </div>

        {/* Metric 3: Today's Study Time */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Study Focus Today</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((todayStudyMinutes / (profile.dailyGoalStudyMinutes || 120)) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-400 font-medium flex justify-between">
            <span>Goal: {profile.dailyGoalStudyMinutes || 120}m</span>
            <span className="text-blue-400 font-bold">
              {Math.min(100, Math.round((todayStudyMinutes / (profile.dailyGoalStudyMinutes || 120)) * 100))}%
            </span>
          </div>
        </div>

        {/* Metric 4: Current Activity Streak */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Streak</span>
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{currentStreak}</span>
            <span className="text-xs text-zinc-500 font-semibold">Consecutive Days</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((dayIdx) => (
              <div
                key={dayIdx}
                className={`h-1.5 flex-1 rounded-full ${
                  dayIdx <= (currentStreak % 7 || (currentStreak > 0 ? 7 : 0))
                    ? 'bg-amber-400'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-400 font-medium flex justify-between">
            <span>Keep momentum alive</span>
            <span className="text-amber-400 font-bold">🔥 Hot</span>
          </div>
        </div>
      </div>

      {/* Consistency Engine Heat Map */}
      <ConsistencyHeatMap />

      {/* 2-Column Split: Active Missions & Schedules / PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's High-Impact Missions */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ccff00]" />
                Today's Priority Missions
              </h2>
              <p className="text-xs text-zinc-400">
                Action items required to preserve discipline and progress
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('missions')}
              className="text-xs font-bold text-[#ccff00] hover:underline flex items-center gap-1"
            >
              All Missions <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {todayMissions.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-zinc-800">
              <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-xs font-semibold text-zinc-400">No active missions scheduled for today</p>
              <button
                onClick={onOpenNewMission}
                className="mt-3 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-[#ccff00] hover:bg-zinc-700 transition"
              >
                + Create Today's First Mission
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayMissions.map((m) => {
                const isDone = m.status === 'completed';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                      isDone
                        ? 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                        : 'bg-zinc-950/90 border-zinc-800/90 hover:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleMissionComplete(m.id)}
                      className="mt-0.5 text-zinc-500 hover:text-[#ccff00] transition active:scale-90"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-[#ccff00]" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            isDone ? 'line-through text-zinc-500' : 'text-white'
                          }`}
                        >
                          {m.title}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${getPriorityBadge(
                            m.priority
                          )}`}
                        >
                          {m.priority}
                        </span>
                        <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 border border-zinc-800">
                          {m.category}
                        </span>
                      </div>
                      {m.description && (
                        <p className="mt-1 text-[11px] text-zinc-400 truncate">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Examinations & Recent PBs */}
        <div className="space-y-6">
          {/* Upcoming Examinations and Deadlines */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wide uppercase text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                Deadlines & Exams
              </h3>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-[11px] font-bold text-zinc-400 hover:text-white"
              >
                Calendar
              </button>
            </div>

            {upcomingDeadlinesAndExams.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">No impending examinations in next 14 days.</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlinesAndExams.slice(0, 3).map((item) => {
                  const date = new Date(item.startDate);
                  const isExam = item.type === 'exam';
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-2.5 flex items-start gap-2.5"
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 rounded-full ${
                          isExam ? 'bg-red-400' : 'bg-amber-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>
                            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          {!item.allDay && (
                            <span>
                              {date.toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          <span
                            className={`uppercase font-bold text-[9px] ${
                              isExam ? 'text-red-400' : 'text-amber-400'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Athletic Personal Bests */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wide uppercase text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-[#ccff00]" />
                Recent Personal Bests
              </h3>
              <button
                onClick={() => onNavigateTab('performance')}
                className="text-[11px] font-bold text-zinc-400 hover:text-white"
              >
                Log
              </button>
            </div>

            {recentPBs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">
                No personal bests recorded yet. Record your time trials and lifts!
              </p>
            ) : (
              <div className="space-y-2">
                {recentPBs.map((pb) => (
                  <div
                    key={pb.id}
                    className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{pb.title}</div>
                      <div className="text-[10px] text-zinc-400">{pb.sport}</div>
                    </div>
                    {pb.metricValue && (
                      <div className="text-right">
                        <span className="text-xs font-black text-[#ccff00]">
                          {pb.metricValue} {pb.metricUnit}
                        </span>
                        <div className="text-[9px] font-bold uppercase text-emerald-400">PB</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
