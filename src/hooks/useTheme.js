import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

// Light is the default. Dark mode only applies when the user turns it on
// (the choice is saved in localStorage).
const DEFAULT_THEME = 'light';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [setTheme],
  );

  return { theme, isDark: theme === 'dark', toggleTheme };
}
