import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/*
  User preferences (ebs:settings).
    voiceURI       – preferred English voice ('' = automatic en-US pick)
    rateScale      – speech speed multiplier (0.7 – 1.2)
    showArabic     – show Arabic translations by default (sentences, story, dialogue)
    textSize       – 'normal' | 'large'
    dailyGoal      – words to learn per day
    learnerName    – name printed on certificates
*/
export const DEFAULT_SETTINGS = {
  voiceURI: '',
  rateScale: 1,
  showArabic: false,
  textSize: 'normal',
  dailyGoal: 10,
  learnerName: '',
};

export function useSettings() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...stored };

  const update = useCallback(
    (patch) => setStored((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    [setStored],
  );
  const reset = useCallback(() => setStored(DEFAULT_SETTINGS), [setStored]);

  return { settings, update, reset };
}
