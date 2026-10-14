import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { StudySessionType } from '../../types';
import { X, BookOpen, Plus } from 'lucide-react';

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetSubjectName?: string;
}

export const StudyModal: React.FC<StudyModalProps> = ({
  isOpen,
  onClose,
  presetSubjectName,
}) => {
  const { subjects, addSubject, addStudySession } = usePace();

  const [subjectName, setSubjectName] = useState(
    presetSubjectName || (subjects.length > 0 ? subjects[0].name : 'General Academic')
  );
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubColor, setNewSubColor] = useState('#3b82f6');

  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionType, setSessionType] = useState<StudySessionType>('revision');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddNewSubject = async () => {
    if (!newSubName.trim()) return;
    await addSubject({
      name: newSubName.trim(),
      code: newSubCode.trim() || undefined,
      color: newSubColor,
      targetWeeklyHours: 5,
    });
    setSubjectName(newSubName.trim());
    setIsAddingNewSubject(false);
    setNewSubName('');
    setNewSubCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setError('Please select or create a subject');
      return;
    }

    const matched = subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase());

    await addStudySession({
      subjectId: matched?.id,
      subjectName: subjectName.trim(),
      topic: topic.trim() || undefined,
      durationMinutes: Number(durationMinutes) || 45,
      date,
      sessionType,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0e13] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-[#ccff00]">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">LOG ACADEMIC STUDY SESSION</h2>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Subject *
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewSubject(!isAddingNewSubject)}
                className="text-[11px] font-semibold text-[#ccff00] hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                {isAddingNewSubject ? 'Select Existing' : 'New Subject'}
              </button>
            </div>

            {isAddingNewSubject ? (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Subject name (e.g. Linear Algebra, Biomechanics)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code (e.g. MATH 101)"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="flex-1 rounded bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                  <select
                    value={newSubColor}
                    onChange={(e) => setNewSubColor(e.target.value)}
                    className="rounded bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="#3b82f6">Blue</option>
                    <option value="#10b981">Green</option>
                    <option value="#a855f7">Purple</option>
                    <option value="#f59e0b">Amber</option>
                    <option value="#ef4444">Red</option>
                    <option value="#ccff00">Lime</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddNewSubject}
                    className="rounded bg-[#ccff00] px-3 py-1 text-xs font-bold text-black"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
                {subjects.length === 0 && <option value="General Studies">General Studies</option>}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Topic / Chapter / Problem Set
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Kinetic Chain Dynamics or Past Paper 2024"
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Duration (Min)
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
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as StudySessionType)}
                className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-[#ccff00] capitalize"
              >
                <option value="revision">Revision</option>
                <option value="assignment">Assignment</option>
                <option value="lecture">Lecture / Class</option>
                <option value="exam_prep">Exam Prep</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Study Notes / Key Takeaways
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Formulas memorized, confusion points, next steps..."
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
              Log Study Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
