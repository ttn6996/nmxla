import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import { Question, OptionKey, StudyMode } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PracticeView } from './components/PracticeView';
import { ExamView } from './components/ExamView';
import { ListView } from './components/ListView';
import { AnalyticsView } from './components/AnalyticsView';
import {
  getStorageData,
  savePracticeAnswer,
  toggleBookmarkStorage,
  saveInstantFeedbackPref,
  saveShuffleModePref,
  clearAllData,
} from './utils/storage';

export const App: React.FC = () => {
  const questions: Question[] = questionsData as Question[];

  // App & View State
  const [currentMode, setCurrentMode] = useState<StudyMode>('practice');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nmxla_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Persistent User Progress
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, OptionKey>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const data = getStorageData();
    setPracticeAnswers(data.practiceAnswers);
    setBookmarks(data.bookmarks);
    setInstantFeedback(data.instantFeedback);
    setShuffleMode(data.shuffleMode);
  }, []);

  // Sync Dark Mode with document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nmxla_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nmxla_theme', 'light');
    }
  }, [darkMode]);

  // Answer handler
  const handleAnswer = (questionId: number, answer: OptionKey) => {
    setPracticeAnswers((prev) => {
      const next = { ...prev, [questionId]: answer };
      savePracticeAnswer(questionId, answer);
      return next;
    });
  };

  // Toggle bookmark handler
  const handleToggleBookmark = (questionId: number) => {
    const isNowBookmarked = toggleBookmarkStorage(questionId);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, questionId] : prev.filter((id) => id !== questionId)
    );
  };

  // Toggle feedback
  const handleToggleInstantFeedback = () => {
    const nextVal = !instantFeedback;
    setInstantFeedback(nextVal);
    saveInstantFeedbackPref(nextVal);
  };

  // Toggle shuffle
  const handleToggleShuffle = () => {
    const nextVal = !shuffleMode;
    setShuffleMode(nextVal);
    saveShuffleModePref(nextVal);
  };

  // Reset all progress
  const handleResetProgress = () => {
    clearAllData();
    setPracticeAnswers({});
    setBookmarks([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onResetProgress={handleResetProgress}
        totalAnswered={Object.keys(practiceAnswers).length}
        totalQuestions={questions.length}
      />

      {/* Main Navigation Tabs */}
      <Navigation currentMode={currentMode} onSelectMode={setCurrentMode} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentMode === 'practice' && (
          <PracticeView
            questions={questions}
            practiceAnswers={practiceAnswers}
            bookmarks={bookmarks}
            instantFeedback={instantFeedback}
            shuffleMode={shuffleMode}
            onAnswer={handleAnswer}
            onToggleBookmark={handleToggleBookmark}
            onToggleInstantFeedback={handleToggleInstantFeedback}
            onToggleShuffle={handleToggleShuffle}
          />
        )}

        {currentMode === 'exam' && <ExamView questions={questions} />}

        {currentMode === 'list' && (
          <ListView
            questions={questions}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentMode === 'analytics' && (
          <AnalyticsView
            questions={questions}
            practiceAnswers={practiceAnswers}
            bookmarks={bookmarks}
            onNavigateToPractice={() => {
              setCurrentMode('practice');
            }}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Hệ thống ôn tập trắc nghiệm Nhập môn Xử lý ảnh (NMXLA) - 400 câu hỏi</p>
      </footer>
    </div>
  );
};

export default App;
