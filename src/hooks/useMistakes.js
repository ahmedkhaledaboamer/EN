import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/*
  Mistakes notebook: every exercise you get wrong in any quiz is kept here,
  with where it came from. Answering it correctly (anywhere) removes it.

  Stored shape (ebs:mistakes):
  [{ id, exercise, source: { title, emoji, to }, misses: 2, addedAt, lastAt }]
*/
const EMPTY = [];
const MAX_MISTAKES = 200;

/** Stable id for an exercise, built from its content. */
export function exerciseId(ex) {
  return [ex.type, ex.question, ex.sentence, ex.audioText, ex.audio, ex.note, ex.answer]
    .map((v) => v ?? '')
    .join('|');
}

export function useMistakes() {
  const [mistakes, setMistakes] = useLocalStorage(STORAGE_KEYS.mistakes, EMPTY);

  /** Call after every answer. Wrong → added (or its miss count grows). Right → removed. */
  const recordAnswer = useCallback(
    (exercise, answer, source) => {
      // A skipped speaking exercise (no microphone) is not a real mistake
      if (exercise.type === 'speak' && String(answer.given).startsWith('(skipped')) return;
      const id = exerciseId(exercise);
      const now = new Date().toISOString();
      setMistakes((prev) => {
        // Match by stored id or by the stored exercise content (robust to older id formats)
        const same = (m) => m.id === id || exerciseId(m.exercise) === id;
        const existing = prev.find(same);
        if (answer.correct) return existing ? prev.filter((m) => !same(m)) : prev;
        if (existing) {
          return prev.map((m) => (same(m) ? { ...m, misses: m.misses + 1, lastAt: now } : m));
        }
        return [{ id, exercise, source, misses: 1, addedAt: now, lastAt: now }, ...prev].slice(0, MAX_MISTAKES);
      });
    },
    [setMistakes],
  );

  const removeMistake = useCallback((id) => setMistakes((prev) => prev.filter((m) => m.id !== id)), [setMistakes]);
  const clearMistakes = useCallback(() => setMistakes(EMPTY), [setMistakes]);

  return { mistakes, mistakesCount: mistakes.length, recordAnswer, removeMistake, clearMistakes };
}
