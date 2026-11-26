import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { topics as allTopics } from '../data/topics';

/*
  Stored shape (one object per storage key):
  {
    supermarket: { learnedWords: ['cashier', 'aisle'], completed: true, bestScore: 88, completedAt: '...' }
  }
  "learnedWords" holds topic words or essentials items (by their `en`).
*/
const EMPTY = {};
export const PASS_PERCENT = 70;

/**
 * Builds a progress hook for one content collection.
 * Topics and essentials share the logic but use separate storage keys.
 */
export function makeProgressHook(storageKey, getAll) {
  return function useContentProgress() {
    const [progress, setProgress] = useLocalStorage(storageKey, EMPTY);

    /** Works with a meta object (wordKeys) or a full file (words[] / items[]). */
    const getTopicProgress = useCallback(
      (entry) => {
        const saved = progress[entry.slug] ?? {};
        const keys = entry.wordKeys ?? (entry.words ?? entry.items ?? []).map((w) => w.en);
        const total = keys.length;
        // Only count words that still exist in the file
        const learned = (saved.learnedWords ?? []).filter((en) => keys.includes(en)).length;
        const completed = Boolean(saved.completed);
        const percent = completed ? 100 : total ? Math.round((learned / total) * 100) : 0;
        const bestScore = saved.bestScore ?? null; // best practice/quiz score, in percent
        const status = completed
          ? 'completed'
          : learned > 0 || bestScore !== null
            ? 'in-progress'
            : 'not-started';
        return { learned, total, percent, completed, bestScore, status };
      },
      [progress],
    );

    const isWordLearned = useCallback(
      (slug, en) => Boolean(progress[slug]?.learnedWords?.includes(en)),
      [progress],
    );

    /** Set a word's learned state explicitly (value = true/false), or toggle it (value omitted). */
    const setWordLearned = useCallback(
      (slug, en, value) =>
        setProgress((prev) => {
          const entry = prev[slug] ?? {};
          const list = entry.learnedWords ?? [];
          const has = list.includes(en);
          const want = value === undefined ? !has : value;
          if (want === has) return prev;
          const learnedWords = want ? [...list, en] : list.filter((w) => w !== en);
          return { ...prev, [slug]: { ...entry, learnedWords } };
        }),
      [setProgress],
    );

    const toggleWordLearned = useCallback(
      (slug, en) => setWordLearned(slug, en),
      [setWordLearned],
    );

    /**
     * Save a practice/quiz result. Keeps the best score (percent) and marks the
     * entry completed at PASS_PERCENT or more. A completed entry stays completed.
     */
    const recordPracticeResult = useCallback(
      (slug, correct, total) => {
        const percent = total ? Math.round((correct / total) * 100) : 0;
        const previousBest = progress[slug]?.bestScore ?? null;
        const passed = percent >= PASS_PERCENT;
        setProgress((prev) => {
          const entry = prev[slug] ?? {};
          return {
            ...prev,
            [slug]: {
              ...entry,
              bestScore: Math.max(percent, entry.bestScore ?? 0),
              completed: Boolean(entry.completed) || passed,
              completedAt: entry.completedAt ?? (passed ? new Date().toISOString() : undefined),
            },
          };
        });
        return { percent, passed, isNewBest: previousBest === null || percent > previousBest };
      },
      [progress, setProgress],
    );

    const completedCount = useMemo(
      () => getAll().filter((t) => progress[t.slug]?.completed).length,
      [progress],
    );

    /** Total learned words/items across the whole collection. */
    const learnedTotal = useMemo(
      () =>
        getAll().reduce(
          (sum, t) => sum + (progress[t.slug]?.learnedWords ?? []).filter((en) => t.wordKeys.includes(en)).length,
          0,
        ),
      [progress],
    );

    return {
      progress,
      getTopicProgress,
      isWordLearned,
      setWordLearned,
      toggleWordLearned,
      recordPracticeResult,
      completedCount,
      learnedTotal,
    };
  };
}

/** Progress for situation topics. */
export const useProgress = makeProgressHook(STORAGE_KEYS.progress, () => allTopics);
