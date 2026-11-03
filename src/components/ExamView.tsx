import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Timer, 
  Flag, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { Question, OptionKey } from '../types';

interface ExamViewProps {
  questions: Question[];
  onFinishExamPractice?: (wrongQuestionIds: number[]) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ questions }) => {
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  
  // Configuration
  const [questionCount, setQuestionCount] = useState<number>(40);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0 = all

  // Exam runtime state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Result review filter
  const [resultFilter, setResultFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted]);

  // Start exam handler
  const handleStartExam = () => {
    let pool = questions;
    if (selectedChapter > 0) {
      pool = pool.filter((q) => q.chapterId === selectedChapter);
    }

    // Shuffle pool randomly
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setExamQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeRemaining(durationMinutes * 60);
    setExamSubmitted(false);
    setExamStarted(true);
  };

  const handleSelectOption = (key: OptionKey) => {
    if (examSubmitted || !examQuestions[currentIndex]) return;
    const qid = examQuestions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  };

  const handleToggleFlag = () => {
    if (!examQuestions[currentIndex]) return;
    const qid = examQuestions[currentIndex].id;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  };

  const handleSubmitExam = () => {
    setShowSubmitModal(false);
    setExamSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Score calculation
  const scoreStats = useMemo(() => {
    if (!examSubmitted || examQuestions.length === 0) return null;
    let correct = 0;
    const wrongIds: number[] = [];

    examQuestions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      } else {
        wrongIds.push(q.id);
      }
    });

    const score10 = ((correct / examQuestions.length) * 10).toFixed(1);
    const percentage = Math.round((correct / examQuestions.length) * 100);

    let rank = 'Cần cố gắng thêm';
    if (Number(score10) >= 9.0) rank = 'Xuất sắc';
    else if (Number(score10) >= 8.0) rank = 'Giỏi';
    else if (Number(score10) >= 6.5) rank = 'Khá';
    else if (Number(score10) >= 5.0) rank = 'Trung bình';

    return {
      correct,
      total: examQuestions.length,
      wrong: examQuestions.length - correct,
      score10,
      percentage,
      rank,
      wrongIds,
      timeSpent: durationMinutes * 60 - timeRemaining,
    };
  }, [examSubmitted, examQuestions, answers, durationMinutes, timeRemaining]);

  const currentQ = examQuestions[currentIndex];

  // 1. Setup Screen
  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Thi Thử Trắc Nghiệm NMXLA
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Mô phỏng thi trắc nghiệm thực tế với đồng hồ bấm giờ và chấm điểm tự động.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Choose Questions Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Số lượng câu hỏi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { count: 20, time: 15 },
                  { count: 40, time: 30 },
                  { count: 50, time: 40 },
                  { count: 60, time: 50 },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => {
                      setQuestionCount(item.count);
                      setDurationMinutes(item.time);
                    }}
                    className={`p-3 rounded-lg border text-center transition-all interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      questionCount === item.count
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base font-bold">{item.count} câu</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.time} phút</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope / Chapter */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Phạm vi kiến thức
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value={0}>Toàn bộ chương trình (Ngẫu nhiên 400 câu)</option>
                <option value={1}>Chương 1: Tổng quan & Thu nhận ảnh</option>
                <option value={2}>Chương 2: Nâng cao chất lượng ảnh</option>
                <option value={3}>Chương 3: Khôi phục ảnh & Lọc nhiễu</option>
                <option value={4}>Chương 4: Phát hiện biên & Hình thái học</option>
                <option value={5}>Chương 5: Phân vùng ảnh</option>
                <option value={6}>Chương 6: Nén dữ liệu ảnh</option>
                <option value={7}>Chương 7: Nhận dạng ảnh & Học máy</option>
                <option value={8}>Chương 8: Chuẩn đầu ra & Phương pháp học</option>
              </select>
            </div>

            {/* Info rules */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Quy định thi thử:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Thời gian làm bài: {durationMinutes} phút.</li>
                <li>Không hiển thị đáp án trong lúc làm để đảm bảo tính khách quan.</li>
                <li>Có thể cắm cờ (Flag) câu khó để quay lại xem xét trước khi nộp.</li>
                <li>Khi hết thời gian, hệ thống sẽ tự động nộp bài và tính điểm.</li>
              </ul>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base flex items-center justify-center gap-2 interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bắt đầu làm bài thi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Result Screen
  if (examSubmitted && scoreStats) {
    const filteredReviewQuestions = examQuestions.filter((q) => {
      const isCorrect = answers[q.id] === q.answer;
      if (resultFilter === 'correct') return isCorrect;
      if (resultFilter === 'wrong') return !isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs mb-2">
                Kết Quả Thi Thử
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Xếp loại: {scoreStats.rank}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Thời gian hoàn thành: {formatTime(scoreStats.timeSpent)} / {durationMinutes} phút
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {scoreStats.score10}
                <span className="text-lg font-normal text-slate-400"> / 10</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                Đúng {scoreStats.correct}/{scoreStats.total} câu ({scoreStats.percentage}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {scoreStats.correct}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Số câu đúng</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
              <div className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300">
                {scoreStats.wrong}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400">Số câu sai</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                {scoreStats.total - Object.keys(answers).length}
              </div>
              <div className="text-xs text-slate-500">Chưa trả lời</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setExamStarted(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm interactive-tap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thi đề mới</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Xem lại chi tiết từng câu hỏi
            </h3>
            <div className="flex items-center gap-1.5">
              {(
                [
                  { key: 'all', label: 'Tất cả' },
                  { key: 'correct', label: 'Câu đúng' },
                  { key: 'wrong', label: 'Câu sai' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setResultFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border interactive-tap ${
                    resultFilter === tab.key
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredReviewQuestions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.answer;
            const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Câu {idx + 1} (Gốc: Câu {q.id})
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{isCorrect ? 'Đúng' : 'Sai'}</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
                  {q.question}
                </p>

                <div className="space-y-2 pt-1">
                  {optionKeys.map((k) => {
                    const isRightAnswer = q.answer === k;
                    const isUserChoice = userAns === k;

                    let optStyle = 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                    if (isRightAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-medium';
                    } else if (isUserChoice && !isRightAnswer) {
                      optStyle = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
                    }

                    return (
                      <div
                        key={k}
                        className={`p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 ${optStyle}`}
                      >
                        <span className="font-bold shrink-0">{k}.</span>
                        <span className="flex-1">{q.options[k]}</span>
                        {isRightAnswer && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            Đáp án đúng
                          </span>
                        )}
                        {isUserChoice && !isRightAnswer && (
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                            Bạn đã chọn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 mt-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Giải thích: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Active Exam View
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeRemaining < 300; // less than 5 mins

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 sm:pb-12">
      {/* Floating Active Exam Bar */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-6 shadow-sm flex items-center justify-between gap-4">
        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm sm:text-base border ${
            isTimeWarning
              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span>{formatTime(timeRemaining)}</span>
        </div>

        {/* Progress summary */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Đã làm: <span className="font-bold text-blue-600 dark:text-blue-400">{answeredCount}</span>/{examQuestions.length} câu
        </div>

        {/* Submit Button */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm interactive-tap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
        >
          Nộp bài
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 columns) */}
        <div className="lg:col-span-3">
          {currentQ && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                  Câu {currentIndex + 1} / {examQuestions.length}
                </span>

                <button
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border interactive-tap ${
                    flagged.has(currentQ.id)
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:text-slate-700'
                  }`}
                  title="Cắm cờ để xem lại sau"
                >
                  <Flag className="w-3.5 h-3.5" fill={flagged.has(currentQ.id) ? 'currentColor' : 'none'} />
                  <span>{flagged.has(currentQ.id) ? 'Đã cắm cờ' : 'Đặt cờ'}</span>
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 mb-6 leading-relaxed">
                {currentQ.question}
              </h3>

              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                  const isSelected = answers[currentQ.id] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 transition-all interactive-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[48px] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1 text-sm sm:text-base leading-snug pt-0.5">
                        {currentQ.options[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40 interactive-tap"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                  disabled={currentIndex === examQuestions.length - 1}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium disabled:opacity-40 interactive-tap"
                >
                  <span>Câu sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Question Navigation Grid (1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Danh sách câu hỏi
            </h4>
            <div className="grid grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto p-1">
              {examQuestions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged.has(q.id);

                let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-blue-500 font-bold';
                }
                if (isAnswered) {
                  btnStyle += ' bg-blue-600 text-white dark:bg-blue-600';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-md text-xs font-medium border flex items-center justify-center relative interactive-tap ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600"></span>
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700"></span>
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Đã cắm cờ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 text-slate-900 dark:text-slate-100">
            <h3 className="font-bold text-base mb-2">Xác nhận nộp bài</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Bạn đã hoàn thành <span className="font-bold text-blue-600">{answeredCount}</span>/
              {examQuestions.length} câu hỏi.
              {answeredCount < examQuestions.length && (
                <span className="block mt-1 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  Còn {examQuestions.length - answeredCount} câu chưa trả lời!
                </span>
              )}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 interactive-tap"
              >
                Làm tiếp
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold interactive-tap"
              >
                Nộp ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
