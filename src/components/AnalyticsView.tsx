import React, { useMemo } from 'react';
import { 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  Layers, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Question, OptionKey } from '../types';

interface AnalyticsViewProps {
  questions: Question[];
  practiceAnswers: Record<number, OptionKey>;
  bookmarks: number[];
  onNavigateToPractice: (filter?: 'incorrect' | 'bookmarked') => void;
  onResetProgress: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions,
  practiceAnswers,
  bookmarks,
  onNavigateToPractice,
  onResetProgress,
}) => {
  // Compute overall telemetry
  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    const answeredIds = Object.keys(practiceAnswers).map(Number);

    answeredIds.forEach((id) => {
      const q = questions.find((item) => item.id === id);
      if (q) {
        if (practiceAnswers[id] === q.answer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const totalAnswered = answeredIds.length;
    const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
    const completionRate = Math.round((totalAnswered / questions.length) * 100);

    return {
      totalAnswered,
      totalQuestions: questions.length,
      correct,
      incorrect,
      accuracy,
      completionRate,
      bookmarkedCount: bookmarks.length,
    };
  }, [questions, practiceAnswers, bookmarks]);

  // Compute stats per chapter
  const chapterStats = useMemo(() => {
    const map = new Map<number, { id: number; name: string; total: number; answered: number; correct: number }>();

    questions.forEach((q) => {
      if (!map.has(q.chapterId)) {
        map.set(q.chapterId, {
          id: q.chapterId,
          name: q.chapterName,
          total: 0,
          answered: 0,
          correct: 0,
        });
      }
      const entry = map.get(q.chapterId)!;
      entry.total++;

      if (practiceAnswers[q.id] !== undefined) {
        entry.answered++;
        if (practiceAnswers[q.id] === q.answer) {
          entry.correct++;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [questions, practiceAnswers]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12 space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Tiến Độ Học Tập
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tổng quan kết quả ôn luyện trắc nghiệm Xử lý ảnh
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Độ hoàn thành ngân hàng câu hỏi</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono">
              {stats.totalAnswered} / {stats.totalQuestions} ({stats.completionRate}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Số câu đúng</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.correct}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Số câu sai</span>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
              {stats.incorrect}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Độ chính xác</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {stats.accuracy}%
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Đã đánh dấu</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {stats.bookmarkedCount}
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {stats.incorrect > 0 && (
              <button
                onClick={() => onNavigateToPractice('incorrect')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 font-medium text-xs sm:text-sm interactive-tap"
              >
                <span>Ôn tập lại {stats.incorrect} câu làm sai</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {stats.bookmarkedCount > 0 && (
              <button
                onClick={() => onNavigateToPractice('bookmarked')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 font-medium text-xs sm:text-sm interactive-tap"
              >
                <span>Xem lại {stats.bookmarkedCount} câu đã lưu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử làm bài?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium interactive-tap"
            title="Đặt lại toàn bộ tiến độ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa tiến độ</span>
          </button>
        </div>
      </div>

      {/* Chapter Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
          Chi tiết theo từng chương
        </h3>

        <div className="space-y-4">
          {chapterStats.map((ch) => {
            const chRate = Math.round((ch.answered / ch.total) * 100);
            const chAccuracy = ch.answered > 0 ? Math.round((ch.correct / ch.answered) * 100) : 0;

            return (
              <div
                key={ch.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Chương {ch.id}: {ch.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>
                      Tiến độ: <strong className="text-slate-700 dark:text-slate-300">{ch.answered}/{ch.total}</strong> ({chRate}%)
                    </span>
                    {ch.answered > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Đúng: {chAccuracy}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${chRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
