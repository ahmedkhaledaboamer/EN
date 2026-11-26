import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/*
  Stored shape: [{ slug: 'supermarket', en: 'cashier', ar: 'كاشير', savedAt: '...' }]
*/
const EMPTY = [];

export function useSavedWords() {
  const [savedWords, setSavedWords] = useLocalStorage(STORAGE_KEYS.savedWords, EMPTY);

  const isSaved = useCallback(
    (slug, en) => savedWords.some((w) => w.slug === slug && w.en === en),
    [savedWords],
  );

  const toggleSaved = useCallback(
    (slug, word) =>
      setSavedWords((prev) =>
        prev.some((w) => w.slug === slug && w.en === word.en)
          ? prev.filter((w) => !(w.slug === slug && w.en === word.en))
          : [...prev, { slug, en: word.en, ar: word.ar, savedAt: new Date().toISOString() }],
      ),
    [setSavedWords],
  );

  return { savedWords, savedCount: savedWords.length, isSaved, toggleSaved };
}
