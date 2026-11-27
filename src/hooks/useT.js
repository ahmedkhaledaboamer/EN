import { useCallback } from 'react';
import { useSettings } from './useSettings';
import ar from '../i18n/ar';

const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : text);

/**
 * Interface translation. Usage: const t = useT(); t('Start Learning'); t('{n} words', { n: 20 })
 * Keys are the English text, so a missing translation simply shows English.
 */
export function useT() {
  const { settings } = useSettings();
  const lang = settings.uiLanguage;
  return useCallback(
    (key, vars) => fill(lang === 'ar' && ar[key] !== undefined ? ar[key] : key, vars),
    [lang],
  );
}

export function useUiLanguage() {
  const { settings, update } = useSettings();
  return {
    lang: settings.uiLanguage,
    isArabic: settings.uiLanguage === 'ar',
    setLang: (uiLanguage) => update({ uiLanguage }),
    toggle: () => update({ uiLanguage: settings.uiLanguage === 'ar' ? 'en' : 'ar' }),
  };
}
