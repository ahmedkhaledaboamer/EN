import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/*
  Stored shape:
  [{ slug: 'supermarket', en: 'cashier', ar: 'كاشير', phonetic: '/kæˈʃɪr/',
     example: '…', exampleAr: '…', savedAt: '…' }]
  `slug` is a topic slug, or "essentials/<slug>" for essentials items.
  Older entries may only have slug/en/ar; the UI handles missing fields.
*/
const EMPTY = [];

export const ESSENTIALS_PREFIX = 'essentials/';

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
          : [
              ...prev,
              {
                slug,
                en: word.en,
                ar: word.ar,
                phonetic: word.phonetic,
                example: word.example,
                exampleAr: word.exampleAr,
                savedAt: new Date().toISOString(),
              },
            ],
      ),
    [setSavedWords],
  );

  const removeSaved = useCallback(
    (slug, en) => setSavedWords((prev) => prev.filter((w) => !(w.slug === slug && w.en === en))),
    [setSavedWords],
  );

  return { savedWords, savedCount: savedWords.length, isSaved, toggleSaved, removeSaved };
}
