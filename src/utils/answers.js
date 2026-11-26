/** Lowercase, unify quotes, drop punctuation, collapse spaces. */
export function normalizeAnswer(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}'\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSameAnswer(a, b) {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle, retrying a few times so the result differs from the original order. */
export function shuffleDifferent(list) {
  if (list.length < 2) return [...list];
  for (let i = 0; i < 10; i++) {
    const s = shuffle(list);
    if (s.some((v, k) => v !== list[k])) return s;
  }
  return [...list].reverse();
}
