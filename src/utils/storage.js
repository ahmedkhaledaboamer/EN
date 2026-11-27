// All localStorage access goes through here, wrapped in try/catch
// (private mode, quota errors, or corrupted JSON must never crash the app).
// If localStorage is unavailable, values live in memory for the session.

export const STORAGE_KEYS = {
  theme: 'ebs:theme',
  progress: 'ebs:progress',
  savedWords: 'ebs:saved-words',
  streak: 'ebs:streak',
  essentialsProgress: 'ebs:essentials-progress',
  review: 'ebs:review',
  mistakes: 'ebs:mistakes',
  settings: 'ebs:settings',
  daily: 'ebs:daily',
  placement: 'ebs:placement',
  pronunciation: 'ebs:pronunciation',
  activity: 'ebs:activity',
  session: 'ebs:session',
  games: 'ebs:games',
};

/** Fired on window after every write so all hooks in the same tab re-read. */
export const STORAGE_EVENT = 'ebs:storage';

const memory = new Map();

export function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.has(key) ? memory.get(key) : null;
  }
}

export function readStorage(key, fallback) {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  const raw = JSON.stringify(value);
  let ok = true;
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    memory.set(key, raw);
    ok = false;
  }
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {
    /* ignore */
  }
  return ok;
}

export function removeStorage(key) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
