import React from 'react';
import { BookOpen, Award, ListFilter, BarChart2 } from 'lucide-react';
import { StudyMode } from '../types';

interface NavigationProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onSelectMode }) => {
  const tabs = [
    { id: 'practice' as StudyMode, label: 'Luyện tập', icon: BookOpen },
    { id: 'exam' as StudyMode, label: 'Thi thử', icon: Award },
    { id: 'list' as StudyMode, label: 'Tra cứu & Đề', icon: ListFilter },
    { id: 'analytics' as StudyMode, label: 'Tiến độ', icon: BarChart2 },
  ];

  return (
    <>
      {/* Desktop / Tablet Tab Bar */}
      <nav aria-label="Điều hướng chính" className="hidden sm:block border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectMode(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation Bar (>=48px touch targets) */}
      <nav aria-label="Điều hướng di động" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectMode(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative focus-visible:outline-none ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-tight tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
