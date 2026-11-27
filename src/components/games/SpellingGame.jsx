import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Lightbulb, Volume2 } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { checkSpelling, spellableWords } from '../../utils/games';
import { shuffle } from '../../utils/answers';
import { isSpeechSupported, speak } from '../../utils/speech';
import { useT } from '../../hooks/useT';

const ROUNDS = 10;

/** Hear a word (and see its meaning), then type its spelling. */
export default function SpellingGame({ words, onFinish }) {
  const t = useT();
  const list = useMemo(() => shuffle(spellableWords(words)).slice(0, ROUNDS), [words]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef(null);
  const word = list[index];

  const play = useCallback((slow) => word && speak(word.en, { rate: slow ? 0.6 : 0.85 }), [word]);

  // New word: play it and focus the input
  useEffect(() => {
    if (!word) return;
    setValue('');
    setResult(null);
    setHint(false);
    const timer = setTimeout(() => play(false), 250);
    inputRef.current?.focus();
    return () => clearTimeout(timer);
  }, [word, play]);

  if (list.length < 3) {
    return <p className="text-center">{t('Not enough words to spell here. Pick another word list.')}</p>;
  }

  const check = (e) => {
    e.preventDefault();
    if (result || !value.trim()) return;
    const r = checkSpelling(word.en, value);
    setResult(r);
    if (r.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 < list.length) setIndex(index + 1);
    else onFinish({ score, label: `${score}/${list.length}` });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-sm">
        <span>
          {t('Word')} <strong className="text-brand-ink dark:text-white">{index + 1}</strong>/{list.length}
        </span>
        <span>
          {t('Score')} <strong className="text-brand-ink dark:text-white">{score}</strong>
        </span>
      </div>
      <ProgressBar value={(index / list.length) * 100} label="Spelling progress" className="mb-6" />

      <div className="flex flex-col items-center text-center">
        {isSpeechSupported ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => play(false)}
              aria-label="Hear the word"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-brand-ink shadow-yellow transition-transform hover:-translate-y-0.5"
            >
              <Volume2 size={28} aria-hidden="true" />
            </button>
            <Button variant="ghost" size="sm" onClick={() => play(true)}>
              {t('Slow')}
            </Button>
          </div>
        ) : (
          <p className="font-mono">{word.phonetic}</p>
        )}
        <p dir="rtl" lang="ar" className="mt-4 text-2xl font-bold text-brand-ink dark:text-white">
          {word.ar}
        </p>
        {hint && !result && (
          <p className="mt-2 font-mono text-lg tracking-[0.3em] text-brand-gold dark:text-brand-yellow">
            {word.en[0]}
            {word.en
              .slice(1)
              .split('')
              .map((c) => (c === ' ' ? ' ' : '_'))
              .join('')}
          </p>
        )}
      </div>

      <form onSubmit={check} className="mx-auto mt-6 max-w-md">
        <label htmlFor="spell-input" className="sr-only">
          Type the spelling
        </label>
        <input
          id="spell-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={Boolean(result)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t('Type the word…')}
          className={`w-full rounded-2xl border-2 bg-white/80 px-4 py-3 text-center font-mono text-2xl tracking-wider text-brand-ink outline-none focus:border-brand-yellow dark:bg-white/5 dark:text-white ${
            result ? (result.correct ? 'border-emerald-500' : 'border-rose-500') : 'border-neutral-200 dark:border-white/15'
          }`}
        />

        {result && (
          <div className="mt-4 text-center">
            <p className="font-semibold">{result.correct ? `✓ ${t('Correct!')}` : t('The right spelling:')}</p>
            <p className="mt-1 font-mono text-2xl tracking-wider">
              {result.letters.map((l, i) => (
                <span key={i} className={l.ok ? 'text-emerald-700 dark:text-emerald-300' : 'font-bold text-rose-600 underline dark:text-rose-300'}>
                  {l.char}
                </span>
              ))}
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {result ? (
            <Button onClick={next}>
              {index + 1 < list.length ? t('Next word') : t('See my score')} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          ) : (
            <>
              <Button type="submit" disabled={!value.trim()}>
                {t('Check')}
              </Button>
              <Button variant="ghost" onClick={() => setHint(true)} disabled={hint}>
                <Lightbulb size={16} aria-hidden="true" /> {t('Hint')}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
