// Pure helpers for the mini games (easy to test).
import { shuffle } from './answers';

/** Usable words: have English + Arabic, deduplicated by English and by Arabic. */
export function cleanWords(words) {
  const seenEn = new Set();
  const seenAr = new Set();
  return (words ?? []).filter((w) => {
    if (!w?.en || !w?.ar) return false;
    const en = w.en.toLowerCase();
    if (seenEn.has(en) || seenAr.has(w.ar)) return false;
    seenEn.add(en);
    seenAr.add(w.ar);
    return true;
  });
}

/** n random words for a Match round. */
export function pickPairs(words, n = 6) {
  return shuffle(cleanWords(words)).slice(0, n);
}

/** One Speed-round question: an English word + 4 Arabic options. */
export function makeSpeedQuestion(words, avoidEn) {
  const pool = cleanWords(words);
  const candidates = pool.filter((w) => w.en !== avoidEn);
  const target = shuffle(candidates.length ? candidates : pool)[0];
  const wrong = shuffle(pool.filter((w) => w.en !== target.en)).slice(0, 3).map((w) => w.ar);
  return { word: target, options: shuffle([target.ar, ...wrong]), answer: target.ar };
}

const normalizeSpelling = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[-\s]+/g, ' ')
    .trim();

/**
 * Compare a typed spelling with the target.
 * Returns { correct, letters: [{ char, ok }] } where letters follow the target (for coloring).
 */
export function checkSpelling(target, input) {
  const a = normalizeSpelling(target);
  const b = normalizeSpelling(input);
  const letters = [...target].map((char, i) => {
    const typed = b[i] ?? '';
    return { char, ok: normalizeSpelling(char) === '' ? true : normalizeSpelling(char) === typed };
  });
  return { correct: a === b, letters };
}

/** Words that make sense to spell (letters, spaces, hyphens, apostrophes; not too long). */
export function spellableWords(words) {
  return cleanWords(words).filter((w) => /^[a-zA-Z' -]{2,18}$/.test(w.en));
}
