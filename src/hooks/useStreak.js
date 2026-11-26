import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { todayKey, yesterdayKey } from '../utils/date';

/*
  Stored shape: { count: 3, best: 5, lastDate: '2026-11-26' }
  Call recordActivity() whenever the user studies (learns a word, finishes practice...).
*/
const INITIAL = { count: 0, best: 0, lastDate: null };

export function useStreak() {
  const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.streak, INITIAL);

  const today = todayKey();
  const alive = streak.lastDate === today || streak.lastDate === yesterdayKey();
  const current = alive ? streak.count : 0;

  const recordActivity = useCallback(
    () =>
      setStreak((prev) => {
        const t = todayKey();
        if (prev.lastDate === t) return prev;
        const count = prev.lastDate === yesterdayKey() ? prev.count + 1 : 1;
        return { count, best: Math.max(prev.best ?? 0, count), lastDate: t };
      }),
    [setStreak],
  );

  return {
    streak: current,
    best: Math.max(streak.best ?? 0, current),
    studiedToday: streak.lastDate === today,
    recordActivity,
  };
}
