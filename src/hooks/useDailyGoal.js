import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useSettings } from './useSettings';
import { STORAGE_KEYS } from '../utils/storage';
import { todayKey } from '../utils/date';

/*
  Words learned today vs. the daily goal from Settings.
  Stored shape (ebs:daily): { date: '2026-11-27', count: 4 } — resets automatically on a new day.
*/
const EMPTY = { date: null, count: 0 };

export function useDailyGoal() {
  const [daily, setDaily] = useLocalStorage(STORAGE_KEYS.daily, EMPTY);
  const { settings } = useSettings();
  const today = todayKey();
  const done = daily.date === today ? daily.count : 0;

  /** Count one learned word for today. */
  const addWord = useCallback(
    () =>
      setDaily((prev) => {
        const t = todayKey();
        return { date: t, count: (prev.date === t ? prev.count : 0) + 1 };
      }),
    [setDaily],
  );

  return { done, goal: settings.dailyGoal, reached: done >= settings.dailyGoal, addWord };
}
