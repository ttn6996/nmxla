export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  correctText: string;
  explanation: string;
  chapterId: number;
  chapterName: string;
  concept: string;
}

export interface ChapterInfo {
  id: number;
  name: string;
  total: number;
}

export type StudyMode = 'practice' | 'exam' | 'list' | 'analytics';

export type PracticeFilter = 'all' | 'unanswered' | 'incorrect' | 'bookmarked';

export interface ExamSession {
  questionIds: number[];
  answers: Record<number, OptionKey>;
  timeRemaining: number;
  totalDurationSeconds: number;
  submitted: boolean;
  score?: number;
  totalQuestions?: number;
  startedAt: number;
}
