import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { Mission, MissionCategory, MissionPriority, MissionRecurrence } from '../../types';
import { X, CheckSquare, Calendar, Flag } from 'lucide-react';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Mission | null;
}

export const MissionModal: React.FC<MissionModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addMission, updateMission } = usePace();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<MissionCategory>(initialData?.category || 'Training');
  const [priority, setPriority] = useState<MissionPriority>(initialData?.priority || 'high');
  const [recurrence, setRecurrence] = useState<MissionRecurrence>(initialData?.recurrence || 'none');
  const [deadlineDate, setDeadlineDate] = useState(
    initialData?.deadline ? initialData.deadline.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [deadlineTime, setDeadlineTime] = useState(
    initialData?.deadline && initialData.deadline.length > 11
      ? initialData.deadline.slice(11, 16)
      : '18:00'
  );
  const [hasDeadline, setHasDeadline] = useState(!!initialData?.deadline);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Mission title is required');
      return;
    }

    const deadline = hasDeadline ? `${deadlineDate}T${deadlineTime}:00` : null;

    if (initialData) {
      await updateMission(initialData.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        recurrence,
        deadline,
      });
    } else {
      await addMission({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        recurrence,
        deadline,
      });
    }

    onClose();
  };

  const categories: MissionCategory[] = ['Training', 'Study', 'Personal', 'Wellbeing'];
  const priorities: MissionPriority[] = ['low', 'medium', 'high'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0e13] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {initialData ? 'EDIT MISSION' : 'DEPLOY NEW MISSION'}
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
              placeholder="e.g. 5x300m Speed Endurance or Complete Thermodynamics Assignment"
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Description / Action Protocol
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key cues, targets, reps, or notes..."
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MissionCategory)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MissionPriority)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none capitalize"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as MissionRecurrence)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none capitalize"
              >
                <option value="none">One-off Mission</option>
                <option value="daily">Daily Habit (Regenerates Daily)</option>
                <option value="weekly">Weekly Target</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => setHasDeadline(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-[#ccff00] focus:ring-[#ccff00]"
                />
                <span className="text-xs font-semibold text-zinc-300">Set Deadline</span>
              </label>
            </div>
          </div>

          {hasDeadline && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-[#ccff00]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-[#ccff00]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#ccff00] px-5 py-2 text-xs font-bold text-black hover:bg-[#b8e600] transition active:scale-95 shadow-md shadow-[#ccff00]/20"
            >
              {initialData ? 'Update Mission' : 'Deploy Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
