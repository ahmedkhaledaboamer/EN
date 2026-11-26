import { useCallback, useSyncExternalStore } from 'react';
import { readRaw, writeStorage, STORAGE_EVENT } from '../utils/storage';

// Parsed values cached by raw string, so the same stored JSON always returns
// the same object reference (required by useSyncExternalStore).
const cache = new Map();

function getSnapshot(key, fallback) {
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value;

  let value = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(callback) {
  // `storage` = other tabs, STORAGE_EVENT = this tab
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

/**
 * Persistent state shared by every component that uses the same key.
 * setValue accepts a value or an updater function, like useState.
 */
export function useLocalStorage(key, fallback) {
  const value = useSyncExternalStore(subscribe, () => getSnapshot(key, fallback));

  const setValue = useCallback(
    (next) => {
      const prev = getSnapshot(key, fallback);
      const resolved = typeof next === 'function' ? next(prev) : next;
      writeStorage(key, resolved);
    },
    // fallback is intentionally excluded: callers often pass a fresh literal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue];
}
