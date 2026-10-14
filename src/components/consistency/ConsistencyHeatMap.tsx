import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { ConsistencyDay } from '../../types';
import { Flame, Award, Calendar, CheckCircle, Dumbbell, BookOpen } from 'lucide-react';

export const ConsistencyHeatMap: React.FC = () => {
  const { heatMapData, currentStreak, longestStreak, consistencyScore } = usePace();
  const [selectedDay, setSelectedDay] = useState<ConsistencyDay | null>(null);

  // Group the 112 days into 16 weeks of 7 days
  const weeks: ConsistencyDay[][] = [];
  for (let i = 0; i < heatMapData.length; i += 7) {
    weeks.push(heatMapData.slice(i, i + 7));
  }

  const getCellColor = (level: number) => {
    switch (level) {
      case 3:
        return 'bg-[#ccff00] text-black shadow-[0_0_8px_rgba(204,255,0,0.4)]';
      case 2:
        return 'bg-[#84cc16] text-black';
      case 1:
        return 'bg-[#3f6212] text-white';
      default:
        return 'bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-600';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ccff00]"></span>
            Consistency Engine
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            16-week historical discipline matrix based on genuine athletic and academic activity
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded-sm bg-zinc-800/80"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-[#3f6212]"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-[#84cc16]"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-[#ccff00]"></span>
          <span>More</span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-1.5 min-w-[500px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
              {week.map((day) => {
                const isSelected = selectedDay?.date === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    title={`${formatDate(day.date)}: ${day.missionsCount} missions, ${day.trainingMinutes}m training, ${day.studyMinutes}m study`}
                    className={`h-3 sm:h-3.5 w-full rounded-sm transition-all duration-150 ${getCellColor(
                      day.level
                    )} ${isSelected ? 'ring-2 ring-white scale-125 z-10' : 'hover:scale-110'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Day Inspector Popover / Drawer */}
      {selectedDay && (
        <div className="mt-4 rounded-lg bg-zinc-950 border border-zinc-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${getCellColor(
                selectedDay.level
              )}`}
            >
              L{selectedDay.level}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {formatDate(selectedDay.date)}
              </div>
              <div className="text-[11px] text-zinc-400">
                {selectedDay.level === 0 ? 'Rest day recorded' : 'Active discipline logged'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>{selectedDay.missionsCount} Missions</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Dumbbell className="h-3.5 w-3.5 text-blue-400" />
              <span>{selectedDay.trainingMinutes}m Workout</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>{selectedDay.studyMinutes}m Study</span>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-zinc-500 hover:text-white text-xs underline ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quick Summary Pill Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-zinc-800/60 pt-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Current Streak</div>
            <div className="text-sm font-extrabold text-white">{currentStreak} Days</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#ccff00]" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Longest Streak</div>
            <div className="text-sm font-extrabold text-white">{longestStreak} Days</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Active Days (16W)</div>
            <div className="text-sm font-extrabold text-white">
              {heatMapData.filter((d) => d.level > 0).length} / 112
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#ccff00]" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">30D Consistency</div>
            <div className="text-sm font-extrabold text-[#ccff00]">{consistencyScore}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
