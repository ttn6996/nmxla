import React, { useState } from 'react';
import { BookOpen, Award, ListFilter, BarChart2, X } from 'lucide-react';
import { StudyMode } from '../types';
import coreKnowledge from '../../question/cotloi.txt?raw';

interface NavigationProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onSelectMode }) => {
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [isCoreKnowledgeOpen, setIsCoreKnowledgeOpen] = useState(false);

  const handleSecretClick = () => {
    const nextClickCount = secretClickCount + 1;
    if (nextClickCount === 9) {
      setSecretClickCount(0);
      setIsCoreKnowledgeOpen(true);
      return;
    }
    setSecretClickCount(nextClickCount);
  };

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
          <button
            type="button"
            onClick={handleSecretClick}
            aria-label="Khu vực kiến thức cốt lõi"
            className="ml-1 flex items-center justify-center px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/40 transition-colors hover:bg-slate-500/70 dark:bg-slate-500/40 dark:hover:bg-slate-400/70" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation Bar (>=48px touch targets) */}
      <nav aria-label="Điều hướng di động" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 h-16">
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
          <button
            type="button"
            onClick={handleSecretClick}
            aria-label="Khu vực kiến thức cốt lõi"
            className="flex flex-col items-center justify-center min-h-[48px] py-1 focus-visible:outline-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/40 transition-colors hover:bg-slate-500/70 dark:bg-slate-500/40 dark:hover:bg-slate-400/70" />
          </button>
        </div>
      </nav>

      {isCoreKnowledgeOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsCoreKnowledgeOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="core-knowledge-title"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-7">
              <h2 id="core-knowledge-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                Kiến thức cốt lõi
              </h2>
              <button
                type="button"
                onClick={() => setIsCoreKnowledgeOpen(false)}
                aria-label="Đóng kiến thức cốt lõi"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="overflow-y-auto px-5 py-5 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:px-7">
              <div className="whitespace-pre-wrap font-sans">{coreKnowledge}</div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

