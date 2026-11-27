import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { todayKey } from '../utils/date';

/*
  Daily activity history, used by the Progress page (calendar + weekly chart + badges).
  Stored shape (ebs:activity): { "2026-11-27": { words: 6, sessions: 3 } }
    words    – words/items learned that day ("Got it", "I know it")
    sessions – study actions that day (practice/quiz finished, word learned, review…)
*/
const EMPTY = {};
const MAX_DAYS = 400; // keep about a year of history

function bump(log, field) {
  const today = todayKey();
  const day = log[today] ?? { words: 0, sessions: 0 };
  const next = { ...log, [today]: { ...day, [field]: (day[field] ?? 0) + 1 } };
  const keys = Object.keys(next);
  if (keys.length > MAX_DAYS) {
    keys.sort().slice(0, keys.length - MAX_DAYS).forEach((k) => delete next[k]);
  }
  return next;
}

export function useActivityLog() {
  const [log, setLog] = useLocalStorage(STORAGE_KEYS.activity, EMPTY);
  const logWord = useCallback(() => setLog((prev) => bump(prev, 'words')), [setLog]);
  const logSession = useCallback(() => setLog((prev) => bump(prev, 'sessions')), [setLog]);
  return { log, logWord, logSession };
}
