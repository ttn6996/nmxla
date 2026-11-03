import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Shuffle, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Layers, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Question, OptionKey, PracticeFilter } from '../types';

interface PracticeViewProps {
  questions: Question[];
  practiceAnswers: Record<number, OptionKey>;
  bookmarks: number[];
  instantFeedback: boolean;
  shuffleMode: boolean;
  onAnswer: (questionId: number, answer: OptionKey) => void;
  onToggleBookmark: (questionId: number) => void;
  onToggleInstantFeedback: () => void;
  onToggleShuffle: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  questions,
  practiceAnswers,
  bookmarks,
  instantFeedback,
  shuffleMode,
  onAnswer,
  onToggleBookmark,
  onToggleInstantFeedback,
  onToggleShuffle,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0 = all
  const [statusFilter, setStatusFilter] = useState<PracticeFilter>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState<boolean>(false);
  const [jumpInput, setJumpInput] = useState<string>('');

  // Extract chapters list
  const chapters = useMemo(() => {
    const map = new Map<number, string>();
    questions.forEach((q) => {
      if (!map.has(q.chapterId)) {
        map.set(q.chapterId, q.chapterName);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, name]) => ({ id, name }));
  }, [questions]);

  // Filter questions based on chapter and status
  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (selectedChapter > 0) {
      result = result.filter((q) => q.chapterId === selectedChapter);
    }

    if (statusFilter === 'unanswered') {
      result = result.filter((q) => practiceAnswers[q.id] === undefined);
    } else if (statusFilter === 'incorrect') {
      result = result.filter(
        (q) => practiceAnswers[q.id] !== undefined && practiceAnswers[q.id] !== q.answer
      );
    } else if (statusFilter === 'bookmarked') {
      result = result.filter((q) => bookmarks.includes(q.id));
    }

    if (shuffleMode) {
      // Deterministic shuffle using question id modulo seed for stability
      result = [...result].sort((a, b) => ((a.id * 37) % 1000) - ((b.id * 37) % 1000));
    }

    return result;
  }, [questions, selectedChapter, statusFilter, practiceAnswers, bookmarks, shuffleMode]);

  // Adjust current index when filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length) {
      setCurrentIndex(Math.max(0, filteredQuestions.length - 1));
    }
    setShowExplanation(false);
  }, [filteredQuestions.length]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];
  const userAnswer: OptionKey | undefined = currentQuestion ? practiceAnswers[currentQuestion.id] : undefined;
  const isBookmarked = currentQuestion ? bookmarks.includes(currentQuestion.id) : false;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!currentQuestion) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Special: If key is B and pressed alone, check if user meant bookmark or option B
        // To avoid conflict, 1, 2, 3, 4 map to A, B, C, D directly
        onAnswer(currentQuestion.id, key as OptionKey);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const map: Record<string, OptionKey> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        onAnswer(currentQuestion.id, map[e.key]);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setShowExplanation((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, currentIndex, filteredQuestions.length]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = parseInt(jumpInput, 10);
    if (!isNaN(targetId)) {
      const foundIdx = filteredQuestions.findIndex((q) => q.id === targetId);
      if (foundIdx >= 0) {
        setCurrentIndex(foundIdx);
        setShowExplanation(false);
        setJumpInput('');
      } else {
        alert(`Không tìm thấy câu ${targetId} trong bộ lọc hiện tại.`);
      }
    }
  };

  // Option keys
  const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
      {/* Control & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
        {/* Top Controls: Chapter Selector & Utility Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(Number(e.target.value));
                setCurrentIndex(0);
              }}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value={0}>Tất cả các chương ({questions.length} câu)</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chương {ch.id}: {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Instant Feedback Toggle */}
            <button
              onClick={onToggleInstantFeedback}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                instantFeedback
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
              title="Hiện đáp án ngay khi chọn"
            >
              {instantFeedback ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{instantFeedback ? 'Đáp án: Bật' : 'Đáp án: Tắt'}</span>
            </button>

            {/* Shuffle Toggle */}
            <button
              onClick={onToggleShuffle}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                shuffleMode
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
              title="Xáo trộn thứ tự câu hỏi"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{shuffleMode ? 'Xáo trộn: Bật' : 'Xáo trộn: Tắt'}</span>
            </button>

            {/* Flashcard View Toggle */}
            <button
              onClick={() => setIsFlashcardMode(!isFlashcardMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isFlashcardMode
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
              title="Chế độ Thẻ ghi nhớ (Flashcard)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isFlashcardMode ? 'Thẻ Flashcard' : 'Trắc nghiệm'}</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3">
          {(
            [
              { key: 'all', label: 'Tất cả' },
              { key: 'unanswered', label: 'Chưa làm' },
              { key: 'incorrect', label: 'Làm sai' },
              { key: 'bookmarked', label: 'Đã lưu' },
            ] as const
          ).map((item) => {
            const isActive = statusFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setStatusFilter(item.key);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredQuestions.length} câu phù hợp
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      {currentQuestion ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          {/* Card Top Metadata Bar */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs shrink-0">
                Câu {currentQuestion.id}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Chương {currentQuestion.chapterId}: {currentQuestion.chapterName}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Question Position */}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>

              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(currentQuestion.id)}
                aria-label={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi này'}
                title={isBookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi để ôn lại'}
                className={`p-1.5 rounded-lg border transition-colors interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-white text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed mb-6">
              {currentQuestion.question}
            </h2>

            {/* Standard Multiple Choice Mode */}
            {!isFlashcardMode ? (
              <div className="space-y-3">
                {optionKeys.map((key) => {
                  const optText = currentQuestion.options[key];
                  const isSelected = userAnswer === key;
                  const isCorrectAnswer = currentQuestion.answer === key;
                  const showResult = instantFeedback && userAnswer !== undefined;

                  let containerStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                  if (showResult) {
                    if (isCorrectAnswer) {
                      containerStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-medium';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                    } else if (isSelected) {
                      containerStyle = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
                      badgeStyle = 'bg-rose-600 text-white border-rose-600';
                    } else {
                      containerStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 text-slate-600 dark:text-slate-400';
                    }
                  } else if (isSelected) {
                    containerStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium';
                    badgeStyle = 'bg-blue-600 text-white border-blue-600';
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => onAnswer(currentQuestion.id, key)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3.5 transition-all interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[48px] ${containerStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
                        {key}
                      </span>
                      <span className="flex-1 text-sm sm:text-base leading-snug pt-0.5">
                        {optText}
                      </span>
                      {showResult && isCorrectAnswer && (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <X className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Flashcard Mode */
              <div className="py-4">
                <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Khái niệm trọng tâm
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {currentQuestion.concept}
                  </p>

                  {showExplanation ? (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-3">
                        Đáp án: {currentQuestion.answer}
                      </span>
                      <p className="text-base text-slate-800 dark:text-slate-200 font-medium">
                        {currentQuestion.correctText}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm interactive-tap"
                    >
                      Nhấn để lật thẻ xem đáp án
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Explanation Section */}
            {!isFlashcardMode && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-none"
                  >
                    <span>{showExplanation ? 'Ẩn giải thích' : 'Xem giải thích chi tiết'}</span>
                  </button>

                  {userAnswer !== undefined && (
                    <span className="flex items-center gap-1 text-xs font-medium">
                      {userAnswer === currentQuestion.answer ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Trả lời chính xác
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Chưa chính xác (Đáp án: {currentQuestion.answer})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {showExplanation && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-700 dark:text-slate-300 animate-in fade-in">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Giải thích:
                    </p>
                    <p className="leading-relaxed">{currentQuestion.explanation}</p>
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Thuộc mục: {currentQuestion.concept}</span>
                      <span>Chương {currentQuestion.chapterId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card Navigation Controls */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            {/* Jump To Question Form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs text-slate-500">Đến câu:</span>
              <input
                type="number"
                min={1}
                max={400}
                placeholder="#"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-14 sm:w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 interactive-tap"
              >
                Đi
              </button>
            </form>

            <button
              onClick={goToNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Câu sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <p className="text-base font-medium mb-2">Không có câu hỏi nào thỏa mãn bộ lọc</p>
          <p className="text-xs text-slate-400 mb-4">Hãy thử chọn chương khác hoặc đổi trạng thái lọc.</p>
          <button
            onClick={() => {
              setSelectedChapter(0);
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
          >
            Hiện tất cả câu hỏi
          </button>
        </div>
      )}
    </div>
  );
};
