import { useState } from 'react';
import { Eye, Headphones, Volume1, Volume2 } from 'lucide-react';
import Button from '../ui/Button';
import { useSpeechContext } from '../speech/SpeechContext';
import { isSameAnswer } from '../../utils/answers';
import { useT } from '../../hooks/useT';

export default function ListenExercise({ exercise, locked, onSubmit }) {
  const t = useT();
  const { speak, speakingId, supported } = useSpeechContext();
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (locked || !value.trim()) return;
    const correct = isSameAnswer(exercise.answer, value);
    setResult(correct);
    onSubmit({ correct, given: value });
  };

  const playBtn =
    'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-40';

  return (
    <form onSubmit={submit}>
      <p className="flex items-center gap-2 text-lg font-semibold text-brand-ink dark:text-white">
        <Headphones size={20} aria-hidden="true" /> {t('Listen and type what you hear.')}
      </p>

      {supported ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => speak(exercise.audioText, { id: 'listen-normal', rate: 0.9 })}
            className={`${playBtn} bg-brand-yellow text-brand-ink shadow-yellow hover:-translate-y-0.5`}
          >
            <Volume2 size={18} aria-hidden="true" />
            {t(speakingId === 'listen-normal' ? 'Playing…' : 'Play')}
          </button>
          <button
            type="button"
            onClick={() => speak(exercise.audioText, { id: 'listen-slow', rate: 0.6 })}
            className={`${playBtn} bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white`}
          >
            <Volume1 size={18} aria-hidden="true" />
            {t(speakingId === 'listen-slow' ? 'Playing…' : 'Slow')}
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-amber-50/80 p-4 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
          Audio isn&apos;t available in this browser.{' '}
          {revealed ? (
            <span className="font-semibold">“{exercise.audioText}”</span>
          ) : (
            <button type="button" onClick={() => setRevealed(true)} className="inline-flex items-center gap-1 font-semibold underline">
              <Eye size={14} aria-hidden="true" /> Show the sentence instead
            </button>
          )}
        </div>
      )}

      <label htmlFor="listen-input" className="sr-only">
        Type the sentence you heard
      </label>
      <input
        id="listen-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={locked}
        placeholder={t('Type the sentence…')}
        autoComplete="off"
        spellCheck={false}
        className={`mt-5 w-full rounded-2xl border-2 bg-white/80 px-4 py-3.5 text-lg text-brand-ink outline-none placeholder:text-neutral-400 focus:border-brand-yellow dark:bg-white/5 dark:text-white ${
          result === null
            ? 'border-neutral-200 dark:border-white/15'
            : result
              ? 'border-emerald-500'
              : 'border-rose-500'
        }`}
      />
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{t("Capital letters and punctuation don't matter.")}</p>

      <div className="mt-5">
        <Button type="submit" disabled={locked || !value.trim()}>
          {t('Check')}
        </Button>
      </div>
    </form>
  );
}
