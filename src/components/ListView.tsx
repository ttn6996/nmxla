import React, { useState, useMemo } from 'react';
import { Search, Bookmark, ChevronDown, ChevronUp, Check, Filter } from 'lucide-react';
import { Question } from '../types';

interface ListViewProps {
  questions: Question[];
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  questions,
  bookmarks,
  onToggleBookmark,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Extract chapters
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

  // Filtered list
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return questions.filter((q) => {
      if (selectedChapter > 0 && q.chapterId !== selectedChapter) return false;
      if (showOnlyBookmarks && !bookmarks.includes(q.id)) return false;

      if (!term) return true;

      const inQuestion = q.question.toLowerCase().includes(term);
      const inConcept = q.concept.toLowerCase().includes(term);
      const inExplanation = q.explanation.toLowerCase().includes(term);
      const inOptions = Object.values(q.options).some((opt) =>
        opt.toLowerCase().includes(term)
      );

      return inQuestion || inConcept || inExplanation || inOptions;
    });
  }, [questions, searchTerm, selectedChapter, showOnlyBookmarks, bookmarks]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ khóa (ví dụ: Huffman, RGB, Otsu, Sobel, Laplace)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value={0}>Tất cả các chương</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chương {ch.id}: {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border interactive-tap ${
                showOnlyBookmarks
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={showOnlyBookmarks ? 'currentColor' : 'none'} />
              <span>Chỉ câu đã lưu ({bookmarks.length})</span>
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filtered.length} kết quả
            </span>
          </div>
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            const isBookmarked = bookmarks.includes(q.id);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
                        Câu {q.id}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Chương {q.chapterId}: {q.chapterName}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(q.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors interactive-tap ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-white text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 hover:text-slate-700'
                      }`}
                      title={isBookmarked ? 'Bỏ lưu' : 'Lưu câu hỏi'}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={isExpanded ? 'Thu gọn' : 'Xem đáp án'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="space-y-1.5 pt-2">
                      {(['A', 'B', 'C', 'D'] as const).map((key) => {
                        const isCorrect = q.answer === key;
                        return (
                          <div
                            key={key}
                            className={`p-2.5 rounded-lg text-xs sm:text-sm flex items-start gap-2.5 border ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-medium'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold shrink-0">{key}.</span>
                            <span className="flex-1">{q.options[key]}</span>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                                <Check className="w-3.5 h-3.5" /> Đúng
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Giải thích: </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
            <p className="text-base font-medium mb-1">Không tìm thấy câu hỏi phù hợp</p>
            <p className="text-xs text-slate-400">Thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
};

