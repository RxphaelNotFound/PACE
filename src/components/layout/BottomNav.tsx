import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Activity,
  BookOpen,
  Calendar,
  BarChart2,
  Sparkles,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'missions'
  | 'performance'
  | 'study'
  | 'calendar'
  | 'analytics'
  | 'vision';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Command', icon: LayoutDashboard },
    { id: 'missions' as const, label: 'Missions', icon: CheckSquare },
    { id: 'performance' as const, label: 'Athletic', icon: Activity },
    { id: 'study' as const, label: 'Study', icon: BookOpen },
    { id: 'calendar' as const, label: 'Schedule', icon: Calendar },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'vision' as const, label: 'Vision AI', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Tabs */}
      <nav aria-label="Desktop Navigation" className="hidden md:block sticky top-[57px] z-30 w-full border-b border-zinc-800/60 bg-[#0a0a0e]/95 backdrop-blur-md px-6 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-[#ccff00] border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-[#0a0a0e]/95 backdrop-blur-lg px-2 py-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center rounded-lg py-1 px-2 transition-all relative ${
                  isActive ? 'text-[#ccff00]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                <span className="text-[10px] font-medium tracking-tight mt-0.5">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-[#ccff00]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
