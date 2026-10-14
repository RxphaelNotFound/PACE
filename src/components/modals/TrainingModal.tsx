import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { EventType } from '../../types';
import { X, Dumbbell, Award, Flame } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose }) => {
  const { addTrainingRecord } = usePace();

  const [sport, setSport] = useState('Track & Field (Sprint)');
  const [customSport, setCustomSport] = useState('');
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('session');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState<number | ''>('');
  const [metricUnit, setMetricUnit] = useState('seconds');
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [intensity, setIntensity] = useState(4);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const sportsList = [
    'Track & Field (Sprint)',
    'Track & Field (Distance)',
    'Strength & Conditioning',
    'Swimming',
    'Cycling',
    'Rowing',
    'Basketball',
    'Soccer',
    'Combat / Martial Arts',
    'Other Sport',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Workout / Event title is required');
      return;
    }

    const finalSport = sport === 'Other Sport' && customSport.trim() ? customSport.trim() : sport;

    await addTrainingRecord({
      sport: finalSport,
      title: title.trim(),
      eventType,
      date,
      durationMinutes: Number(durationMinutes) || 30,
      metricName: metricName.trim() || undefined,
      metricValue: metricValue !== '' ? Number(metricValue) : undefined,
      metricUnit: metricUnit.trim() || undefined,
      isPersonalBest,
      intensity,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0e13] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
              <Dumbbell className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">LOG ATHLETIC PERFORMANCE</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Sport / Discipline *
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none"
              >
                {sportsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none capitalize"
              >
                <option value="session">Training Session</option>
                <option value="time_trial">Time Trial / Test</option>
                <option value="competition">Official Competition</option>
                <option value="event">Athletic Meet / Event</option>
              </select>
            </div>
          </div>

          {sport === 'Other Sport' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Custom Sport Name
              </label>
              <input
                type="text"
                value={customSport}
                onChange={(e) => setCustomSport(e.target.value)}
                placeholder="e.g. Crossfit, Decathlon, Gymnastics"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Session Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 6x150m Spikes at Race Pace or Heavy Squat Triple"
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="600"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-[#ccff00]"
              />
            </div>
          </div>

          {/* Performance Metric Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#ccff00]" />
                Key Performance Benchmark (Optional)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#ccff00]">
                <input
                  type="checkbox"
                  checked={isPersonalBest}
                  onChange={(e) => setIsPersonalBest(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-[#ccff00] focus:ring-[#ccff00]"
                />
                Mark as PB
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">
                  Metric Name
                </label>
                <input
                  type="text"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  placeholder="e.g. 60m Time or Squat"
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">
                  Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 6.84 or 160"
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-0.5">
                  Unit
                </label>
                <input
                  type="text"
                  value={metricUnit}
                  onChange={(e) => setMetricUnit(e.target.value)}
                  placeholder="e.g. seconds, kg, km"
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Session RPE Intensity (1-5)
              </label>
              <span className="text-xs font-bold text-[#ccff00] flex items-center gap-1">
                <Flame className="h-3 w-3" /> Level {intensity} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-[#ccff00] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Coaching & Recovery Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kinematic cues, surface conditions, weather, felt sharpness..."
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

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
              Log Performance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
