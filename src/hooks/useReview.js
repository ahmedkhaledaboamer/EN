import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useProgress } from './useProgress';
import { useEssentialsProgress } from './useEssentialsProgress';
import { useSavedWords } from './useSavedWords';
import { STORAGE_KEYS } from '../utils/storage';
import { addDays, todayKey } from '../utils/date';

/*
  Spaced repetition (Leitner boxes).
  The review deck = every word you marked "Got it" (topics + essentials) + every saved word.
  Each card has a box (1–5). "I knew it" moves it up a box and schedules it further away;
  "I forgot" sends it back to box 1 (due tomorrow).

  Stored shape (ebs:review): { "supermarket|cashier": { box: 2, due: "2026-11-30" } }
  Keys use the same source format as saved words: "<topic-slug>" or "essentials/<slug>".
*/
export const INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }; // days until the next review
export const MAX_BOX = 5;
export const SESSION_SIZE = 20;
const EMPTY = {};

export const reviewKey = (source, en) => `${source}|${en}`;
export const splitKey = (key) => {
  const i = key.lastIndexOf('|');
  return { source: key.slice(0, i), en: key.slice(i + 1) };
};

/** Pure scheduling step, exported for tests. */
export function nextSchedule(current, knew, today = todayKey()) {
  // A new card counts as box 1: knowing it moves it to box 2 (3 days), forgetting keeps it at 1 (tomorrow)
  const box = knew ? Math.min((current?.box ?? 1) + 1, MAX_BOX) : 1;
  return { box, due: addDays(today, INTERVALS[box]) };
}

export function useReview() {
  const [schedule, setSchedule] = useLocalStorage(STORAGE_KEYS.review, EMPTY);
  const topics = useProgress();
  const essentials = useEssentialsProgress();
  const { savedWords } = useSavedWords();

  // Every card in the deck (keys only, so this is cheap enough for the Home page)
  const deckKeys = useMemo(() => {
    const keys = new Set();
    Object.entries(topics.progress).forEach(([slug, p]) =>
      (p.learnedWords ?? []).forEach((en) => keys.add(reviewKey(slug, en))),
    );
    Object.entries(essentials.progress).forEach(([slug, p]) =>
      (p.learnedWords ?? []).forEach((en) => keys.add(reviewKey(`essentials/${slug}`, en))),
    );
    savedWords.forEach((w) => keys.add(reviewKey(w.slug, w.en)));
    return [...keys];
  }, [topics.progress, essentials.progress, savedWords]);

  const today = todayKey();
  // Due = never reviewed yet, or scheduled for today or earlier. Overdue first, new cards last.
  const dueKeys = useMemo(() => {
    const due = deckKeys.filter((k) => !schedule[k] || schedule[k].due <= today);
    return due.sort((a, b) => (schedule[a]?.due ?? '9999').localeCompare(schedule[b]?.due ?? '9999'));
  }, [deckKeys, schedule, today]);

  const mastered = useMemo(() => deckKeys.filter((k) => schedule[k]?.box === MAX_BOX).length, [deckKeys, schedule]);

  const grade = useCallback(
    (key, knew) => setSchedule((prev) => ({ ...prev, [key]: nextSchedule(prev[key], knew) })),
    [setSchedule],
  );

  return {
    schedule,
    deckKeys,
    dueKeys,
    dueCount: dueKeys.length,
    total: deckKeys.length,
    mastered,
    grade,
    savedWords,
  };
}
