import React, { useState, useMemo } from 'react';
import { usePace } from '../../context/PaceContext';
import { Mission, MissionCategory, MissionPriority } from '../../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Archive,
  Trash2,
  Edit2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface MissionsViewProps {
  onOpenCreateMission: () => void;
  onEditMission: (mission: Mission) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  onOpenCreateMission,
  onEditMission,
}) => {
  const { missions, toggleMissionComplete, archiveMission, deleteMission } = usePace();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue' | 'archived'>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const now = new Date();

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(query);
        const matchDesc = m.description?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && m.category !== selectedCategory) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'all' && m.priority !== priorityFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter === 'active') {
        return m.status === 'active';
      }
      if (statusFilter === 'completed') {
        return m.status === 'completed';
      }
      if (statusFilter === 'archived') {
        return m.status === 'archived';
      }
      if (statusFilter === 'overdue') {
        if (m.status !== 'active' || !m.deadline) return false;
        return new Date(m.deadline) < now;
      }

      return true;
    });
  }, [missions, search, selectedCategory, statusFilter, priorityFilter, now]);

  const categories: MissionCategory[] = ['Training', 'Study', 'Personal', 'Wellbeing'];

  const getPriorityBadge = (p: MissionPriority) => {
    switch (p) {
      case 'high':
        return 'text-red-400 bg-red-950/40 border-red-800/60';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      default:
        return 'text-zinc-400 bg-zinc-800/40 border-zinc-700/60';
    }
  };

  const activeCount = missions.filter((m) => m.status === 'active').length;
  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const overdueCount = missions.filter(
    (m) => m.status === 'active' && m.deadline && new Date(m.deadline) < now
  ).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ccff00]" />
            Missions & Habit Execution
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Structured task management designed for athletic and academic discipline
          </p>
        </div>

        <button
          onClick={onOpenCreateMission}
          className="flex items-center gap-2 rounded-lg bg-[#ccff00] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Deploy New Mission</span>
        </button>
      </div>

      {/* Quick stats pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('active')}
          className={`rounded-xl border p-3 text-left transition ${
            statusFilter === 'active'
              ? 'border-[#ccff00] bg-zinc-900/90'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-zinc-400">Active Missions</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{activeCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`rounded-xl border p-3 text-left transition ${
            statusFilter === 'completed'
              ? 'border-[#ccff00] bg-zinc-900/90'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-zinc-400">Completed</div>
          <div className="text-xl font-extrabold text-[#ccff00] mt-0.5">{completedCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`rounded-xl border p-3 text-left transition ${
            statusFilter === 'overdue'
              ? 'border-red-500 bg-red-950/40'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-red-400">Overdue</div>
          <div className="text-xl font-extrabold text-red-400 mt-0.5">{overdueCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl border p-3 text-left transition ${
            statusFilter === 'all'
              ? 'border-[#ccff00] bg-zinc-900/90'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-zinc-400">Total Registry</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{missions.length}</div>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search missions by keywords or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 focus:border-[#ccff00]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 focus:border-[#ccff00]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority Only</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase transition ${
              selectedCategory === 'all'
                ? 'bg-[#ccff00] text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase transition ${
                selectedCategory === c
                  ? 'bg-[#ccff00] text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
            <CheckCircle2 className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Missions Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Your mission roster is empty. Deploy a new mission to begin tracking.'}
            </p>
            <button
              onClick={onOpenCreateMission}
              className="mt-4 rounded-lg bg-[#ccff00] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition"
            >
              + Create Mission
            </button>
          </div>
        ) : (
          filteredMissions.map((m) => {
            const isDone = m.status === 'completed';
            const isArchived = m.status === 'archived';
            const isOverdue =
              m.status === 'active' && m.deadline && new Date(m.deadline) < now;

            return (
              <div
                key={m.id}
                className={`group rounded-xl border p-4 transition-all ${
                  isDone
                    ? 'border-zinc-900 bg-zinc-950/40'
                    : isOverdue
                    ? 'border-red-900/60 bg-red-950/10'
                    : 'border-zinc-800/80 bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleMissionComplete(m.id)}
                    className="mt-0.5 text-zinc-500 hover:text-[#ccff00] transition active:scale-90"
                    title={isDone ? 'Mark as active' : 'Complete mission'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-[#ccff00]" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600 hover:text-zinc-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold tracking-tight ${
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
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                        {m.category}
                      </span>
                      {m.recurrence !== 'none' && (
                        <span className="rounded bg-blue-950/60 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold uppercase flex items-center gap-1">
                          <RotateCcw className="h-2.5 w-2.5" />
                          {m.recurrence}
                        </span>
                      )}
                    </div>

                    {m.description && (
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                        {m.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="mt-2.5 flex items-center gap-4 text-[11px] text-zinc-500 flex-wrap">
                      {m.deadline && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue ? 'text-red-400 font-semibold' : 'text-zinc-400'
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(m.deadline).toLocaleDateString()}{' '}
                          {new Date(m.deadline).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}

                      {isDone && m.completedAt && (
                        <span className="text-zinc-500">
                          Completed: {new Date(m.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditMission(m)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      title="Edit Mission"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!isArchived ? (
                      <button
                        onClick={() => archiveMission(m.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                        title="Archive Mission"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => deleteMission(m.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      title="Delete Mission"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
