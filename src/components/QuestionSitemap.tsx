import React, { useState, useMemo } from 'react';
import { 
  X, 
  Pin,
  PinOff
} from 'lucide-react';
import { Question, OptionKey } from '../types';

interface QuestionSitemapProps {
  questions: Question[];
  currentQuestionId: number;
  practiceAnswers: Record<number, OptionKey>;
  bookmarks: number[];
  onSelectQuestion: (questionId: number) => void;
  isOpen: boolean;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  currentRank: string;
}

type SitemapFilter = 'all' | 'correct' | 'incorrect' | 'unanswered' | 'bookmarked';

export const QuestionSitemap: React.FC<QuestionSitemapProps> = ({
  questions,
  currentQuestionId,
  practiceAnswers,
  bookmarks,
  onSelectQuestion,
  isOpen,
  onClose,
  isPinned = false,
  onTogglePin,
  currentRank,
}) => {
  const [filter, setFilter] = useState<SitemapFilter>('all');
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0 = all

  // Extract chapters
  const chapters = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>();
    questions.forEach((q) => {
      if (!map.has(q.chapterId)) {
        map.set(q.chapterId, { id: q.chapterId, name: q.chapterName, count: 0 });
      }
      map.get(q.chapterId)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [questions]);

  // Statistics
  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const userAns = practiceAnswers[q.id];
      if (userAns === undefined) {
        unanswered++;
      } else if (userAns === q.answer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return {
      total: questions.length,
      correct,
      incorrect,
      unanswered,
      bookmarked: bookmarks.length,
    };
  }, [questions, practiceAnswers, bookmarks]);

  // Filtered list of questions in the sitemap
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedChapter > 0 && q.chapterId !== selectedChapter) {
        return false;
      }

      const userAns = practiceAnswers[q.id];
      if (filter === 'correct') {
        return userAns !== undefined && userAns === q.answer;
      }
      if (filter === 'incorrect') {
        return userAns !== undefined && userAns !== q.answer;
      }
      if (filter === 'unanswered') {
        return userAns === undefined;
      }
      if (filter === 'bookmarked') {
        return bookmarks.includes(q.id);
      }
      return true;
    });
  }, [questions, filter, selectedChapter, practiceAnswers, bookmarks]);

  if (!isOpen) return null;

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Top Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base leading-tight">
            Sitemap câu hỏi ({filteredQuestions.length}/{questions.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bản đồ câu hỏi trực quan - Nhấp để nhảy nhanh
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Bỏ ghim thanh bên' : 'Ghim cố định thanh bên'}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 interactive-tap"
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 interactive-tap"
            aria-label="Đóng sitemap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend & Telemetry Bar */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <span>Cấp hiện tại:</span>
          <span>{currentRank}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Đúng: {stats.correct}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Sai: {stats.incorrect}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Chưa làm: {stats.unanswered}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Đã lưu: {stats.bookmarked}</span>
        </div>
      </div>

      {/* Filter and Chapter selectors */}
      <div className="p-4 space-y-2.5 border-b border-slate-100 dark:border-slate-800">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1">
          {(
            [
              { key: 'all', label: `Tất cả (${questions.length})` },
              { key: 'correct', label: `Đúng (${stats.correct})` },
              { key: 'incorrect', label: `Sai (${stats.incorrect})` },
              { key: 'unanswered', label: `Chưa làm (${stats.unanswered})` },
              { key: 'bookmarked', label: `Đã lưu (${stats.bookmarked})` },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors interactive-tap ${
                filter === item.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chapter select dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value={0}>Tất cả 8 chương ({questions.length} câu)</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Chương {ch.id}: {ch.name} ({ch.count} câu)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Question buttons */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {filteredQuestions.map((q) => {
              const userAns = practiceAnswers[q.id];
              const isAnswered = userAns !== undefined;
              const isCorrect = isAnswered && userAns === q.answer;
              const isIncorrect = isAnswered && userAns !== q.answer;
              const isBookmarked = bookmarks.includes(q.id);
              const isActive = q.id === currentQuestionId;

              let style = 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';

              if (isCorrect) {
                style = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold';
              } else if (isIncorrect) {
                style = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold';
              }

              if (isActive) {
                style += ' ring-2 ring-blue-500 dark:ring-blue-400 font-bold shadow-sm';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onSelectQuestion(q.id);
                    if (!isPinned) {
                      onClose();
                    }
                  }}
                  title={`Câu ${q.id}: Chương ${q.chapterId} - ${
                    isCorrect ? 'Đã làm đúng' : isIncorrect ? 'Đã làm sai' : 'Chưa làm'
                  }`}
                  className={`h-9 rounded-lg border text-xs flex items-center justify-center relative transition-all interactive-tap ${style}`}
                >
                  <span>{q.id}</span>
                  {isBookmarked && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Không có câu hỏi nào thỏa mãn bộ lọc đã chọn.
          </div>
        )}
      </div>
    </div>
  );

  // If pinned sidebar on desktop
  if (isPinned) {
    return (
      <aside className="w-80 h-[calc(100vh-6rem)] sticky top-20 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hidden lg:block shrink-0">
        {content}
      </aside>
    );
  }

  // Modal / Drawer overlay
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {content}
      </div>
    </div>
  );
};
