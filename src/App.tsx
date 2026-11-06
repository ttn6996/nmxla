import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import questionsData from './data/questions.json';
import { Question, OptionKey, StudyMode } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PracticeView } from './components/PracticeView';
import { ExamView } from './components/ExamView';
import { ListView } from './components/ListView';
import { AnalyticsView } from './components/AnalyticsView';
import { CoreKnowledgeView } from './components/CoreKnowledgeView';
import {
  getStorageData,
  savePracticeAnswer,
  toggleBookmarkStorage,
  saveInstantFeedbackPref,
  saveShuffleModePref,
  clearAllData,
} from './utils/storage';

const cultivationRanks = [
  'Luyện Khí sơ kỳ',
  'Luyện Khí trung kỳ',
  'Luyện Khí hậu kỳ',
  'Luyện Khí đỉnh phong',
  'Trúc Cơ sơ kỳ',
  'Trúc Cơ trung kỳ',
  'Trúc Cơ hậu kỳ',
  'Trúc Cơ đỉnh phong',
  'Kim Đan sơ kỳ',
  'Kim Đan trung kỳ',
  'Kim Đan hậu kỳ',
  'Kim Đan đỉnh phong',
  'Nguyên Anh sơ kỳ',
  'Nguyên Anh trung kỳ',
  'Nguyên Anh hậu kỳ',
  'Nguyên Anh đỉnh phong',
  'Hóa Thần sơ kỳ',
  'Hóa Thần trung kỳ',
  'Hóa Thần hậu kỳ',
  'Hóa Thần đỉnh phong',
];

export const App: React.FC = () => {
  const questions: Question[] = questionsData as Question[];

  // App & View State
  const [currentMode, setCurrentMode] = useState<StudyMode>('practice');
  const modeBeforeCoreRef = useRef<StudyMode>('practice');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nmxla_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Persistent User Progress
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, OptionKey>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [shuffleMode, setShuffleMode] = useState<boolean>(() => localStorage.getItem('nmxla_shuffle_mode') === 'true');
  const [promotionRank, setPromotionRank] = useState<number | null>(null);
  const totalAnswered = Object.keys(practiceAnswers).length;
  const currentRank = totalAnswered < 20
    ? 'Phàm nhân'
    : cultivationRanks[Math.min(Math.floor(totalAnswered / 20) - 1, cultivationRanks.length - 1)];

  const handleSelectMode = (mode: StudyMode) => {
    if (mode !== 'core') modeBeforeCoreRef.current = mode;
    setCurrentMode(mode);
  };

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
    const isFirstAnswer = practiceAnswers[questionId] === undefined;
    const nextAnsweredCount = Object.keys(practiceAnswers).length + (isFirstAnswer ? 1 : 0);

    setPracticeAnswers((prev) => {
      const next = { ...prev, [questionId]: answer };
      savePracticeAnswer(questionId, answer);
      return next;
    });

    // Count each question once, regardless of whether the selected answer is correct.
    if (isFirstAnswer && nextAnsweredCount % 20 === 0) {
      const rankIndex = nextAnsweredCount / 20 - 1;
      if (rankIndex < cultivationRanks.length) setPromotionRank(rankIndex);
    }
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
    localStorage.removeItem('nmxla_last_practice_question');
    setPracticeAnswers({});
    setBookmarks([]);
    setPromotionRank(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onResetProgress={handleResetProgress}
        totalAnswered={totalAnswered}
        totalQuestions={questions.length}
        currentRank={currentRank}
      />

      {/* Main Navigation Tabs */}
      <Navigation currentMode={currentMode} onSelectMode={handleSelectMode} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentMode === 'practice' && (
          <PracticeView
            questions={questions}
            practiceAnswers={practiceAnswers}
            bookmarks={bookmarks}
            instantFeedback={instantFeedback}
            shuffleMode={shuffleMode}
            currentRank={currentRank}
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
              handleSelectMode('practice');
            }}
            onResetProgress={handleResetProgress}
          />
        )}

        {currentMode === 'core' && (
          <CoreKnowledgeView onBack={() => handleSelectMode(modeBeforeCoreRef.current)} />
        )}
      </main>

      {promotionRank !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setPromotionRank(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-title"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-amber-200 bg-white p-7 text-center shadow-2xl dark:border-amber-900 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPromotionRank(null)}
              aria-label="Đóng thông báo thăng cấp"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Đã hoàn thành {(promotionRank + 1) * 20} câu
            </p>
            <h2 id="promotion-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Chúc mừng thăng cấp!
            </h2>
            <p className="mt-3 text-lg font-semibold text-amber-600 dark:text-amber-400">
              {cultivationRanks[promotionRank]}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {promotionRank === cultivationRanks.length - 1
                ? 'Bạn đã hoàn thành toàn bộ 400 câu hỏi!'
                : `Cứ tiếp tục tu luyện, mốc tiếp theo là ${(promotionRank + 2) * 20} câu.`}
            </p>
            <button
              type="button"
              onClick={() => setPromotionRank(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Tiếp tục luyện tập
            </button>
          </section>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Hệ thống ôn tập trắc nghiệm Nhập môn Xử lý ảnh (NMXLA) - 400 câu hỏi</p>
      </footer>
    </div>
  );
};

export default App;
