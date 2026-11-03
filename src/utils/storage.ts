import { OptionKey } from '../types';

const STORAGE_KEYS = {
  PRACTICE_ANSWERS: 'nmxla_practice_answers',
  BOOKMARKS: 'nmxla_bookmarks',
  EXAM_SESSION: 'nmxla_exam_session',
  INSTANT_FEEDBACK: 'nmxla_instant_feedback',
  THEME: 'nmxla_theme',
  SHUFFLE_MODE: 'nmxla_shuffle_mode'
};

export const getStorageData = () => {
  try {
    const practiceAnswers: Record<number, OptionKey> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PRACTICE_ANSWERS) || '{}'
    );
    const bookmarks: number[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]'
    );
    const instantFeedback: boolean = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INSTANT_FEEDBACK) || 'true'
    );
    const shuffleMode: boolean = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SHUFFLE_MODE) || 'false'
    );
    return { practiceAnswers, bookmarks, instantFeedback, shuffleMode };
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
    return {
      practiceAnswers: {},
      bookmarks: [],
      instantFeedback: true,
      shuffleMode: false
    };
  }
};

export const savePracticeAnswer = (questionId: number, answer: OptionKey) => {
  try {
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRACTICE_ANSWERS) || '{}');
    answers[questionId] = answer;
    localStorage.setItem(STORAGE_KEYS.PRACTICE_ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answer', e);
  }
};

export const clearPracticeAnswers = () => {
  localStorage.removeItem(STORAGE_KEYS.PRACTICE_ANSWERS);
};

export const toggleBookmarkStorage = (questionId: number): boolean => {
  try {
    const bookmarks: number[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]'
    );
    const index = bookmarks.indexOf(questionId);
    let updated: number[];
    let isBookmarked: boolean;
    if (index >= 0) {
      updated = bookmarks.filter((id) => id !== questionId);
      isBookmarked = false;
    } else {
      updated = [...bookmarks, questionId];
      isBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return isBookmarked;
  } catch (e) {
    console.error('Failed to toggle bookmark', e);
    return false;
  }
};

export const saveInstantFeedbackPref = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEYS.INSTANT_FEEDBACK, JSON.stringify(enabled));
};

export const saveShuffleModePref = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEYS.SHUFFLE_MODE, JSON.stringify(enabled));
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PRACTICE_ANSWERS);
  localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  localStorage.removeItem(STORAGE_KEYS.EXAM_SESSION);
};

