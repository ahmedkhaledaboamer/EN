import { useEffect, useRef, useState } from 'react';
import { PenLine } from 'lucide-react';
import Button from '../ui/Button';
import { compareSpeech } from '../../utils/speechCompare';
import { useT } from '../../hooks/useT';

/** Score needed to count a translation as correct (translations can be worded a little differently). */
export const WRITE_PASS = 75;

/**
 * "Write it": translate an Arabic sentence into English.
 *   exercise: { type: 'write', note: 'Arabic sentence', answer: 'Model English sentence' }
 * Words are matched in order, ignoring case, punctuation, contractions and digits.
 */
export default function WriteExercise({ exercise, locked, onSubmit }) {
  const t = useT();
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (locked || !value.trim()) return;
    const r = compareSpeech(exercise.answer, [value]);
    setResult(r);
    onSubmit({ correct: r.score >= WRITE_PASS, given: value.trim() });
  };

  return (
    <form onSubmit={submit}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <PenLine size={16} aria-hidden="true" /> {t('Write this in English:')}
      </p>
      <p dir="rtl" lang="ar" className="mt-3 text-2xl font-bold leading-relaxed text-brand-ink sm:text-3xl dark:text-white">
        {exercise.note}
      </p>

      <label htmlFor="write-input" className="sr-only">
        Your English translation
      </label>
      <textarea
        id="write-input"
        ref={inputRef}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) submit(e);
        }}
        disabled={locked}
        placeholder={t('Type your English sentence…')}
        autoComplete="off"
        spellCheck={false}
        className={`mt-5 w-full resize-none rounded-2xl border-2 bg-white/80 px-4 py-3 text-lg text-brand-ink outline-none placeholder:text-neutral-400 focus:border-brand-yellow dark:bg-white/5 dark:text-white ${
          result === null ? 'border-neutral-200 dark:border-white/15' : result.score >= WRITE_PASS ? 'border-emerald-500' : 'border-rose-500'
        }`}
      />

      {result && (
        <div className="mt-3 rounded-2xl bg-white/70 p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t('Model answer')} · {result.score}%
          </p>
          <p className="mt-1 text-lg font-semibold">
            {result.words.map((w, i) => (
              <span
                key={i}
                className={w.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 underline decoration-rose-400 decoration-2 underline-offset-4 dark:text-rose-300'}
              >
                {w.text}{' '}
              </span>
            ))}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t('Green = you had it · red = missing or different')}</p>
        </div>
      )}

      {!result && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {t("Capital letters and punctuation don't matter.")}
        </p>
      )}
      <div className="mt-5">
        <Button type="submit" disabled={locked || !value.trim()}>
          {t('Check')}
        </Button>
      </div>
    </form>
  );
}
