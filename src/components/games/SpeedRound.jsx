import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { makeSpeedQuestion } from '../../utils/games';
import { useT } from '../../hooks/useT';
import ProgressBar from '../ui/ProgressBar';

const SECONDS = 60;

/** 60 seconds: pick the right meaning for as many words as you can. */
export default function SpeedRound({ words, onFinish }) {
  const t = useT();
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [q, setQ] = useState(() => makeSpeedQuestion(words));
  const [flash, setFlash] = useState(null); // { option, correct }
  const finished = useRef(false);
  const stats = useRef({ score: 0, bestCombo: 0, answered: 0 });

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !finished.current) {
      finished.current = true;
      const { score: s, bestCombo: c, answered } = stats.current;
      onFinish({ score: s, label: `${s}`, detail: `${answered} answered · best combo ${c}` });
    }
  }, [timeLeft, onFinish]);

  const answer = (option) => {
    if (flash || timeLeft === 0) return;
    const correct = option === q.answer;
    setFlash({ option, correct });
    stats.current.answered += 1;
    if (correct) {
      const c = combo + 1;
      stats.current.score += 1;
      stats.current.bestCombo = Math.max(stats.current.bestCombo, c);
      setScore((s) => s + 1);
      setCombo(c);
      setBestCombo((b) => Math.max(b, c));
    } else {
      setCombo(0);
    }
    setTimeout(
      () => {
        setFlash(null);
        setQ(makeSpeedQuestion(words, q.word.en));
      },
      correct ? 220 : 650,
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-sm">
        <span>
          {t('Score')} <strong className="text-2xl text-brand-ink dark:text-white">{score}</strong>
        </span>
        {combo >= 2 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <Flame size={14} aria-hidden="true" /> ×{combo}
          </span>
        )}
        <span>
          ⏱ <strong className={`text-2xl ${timeLeft <= 10 ? 'text-rose-600 dark:text-rose-400' : 'text-brand-ink dark:text-white'}`}>{timeLeft}</strong>s
        </span>
      </div>
      <ProgressBar value={(timeLeft / SECONDS) * 100} label="Time left" className="mb-6" />

      <p className="text-center font-display text-4xl font-extrabold tracking-tightest text-brand-ink sm:text-5xl dark:text-white">{q.word.en}</p>
      {q.word.phonetic && <p className="mt-1 text-center font-mono text-sm text-neutral-500 dark:text-neutral-400">{q.word.phonetic}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {q.options.map((option) => {
          const state =
            flash && option === q.answer
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15'
              : flash?.option === option
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15'
                : 'border-neutral-200 bg-white/80 hover:border-brand-yellow dark:border-white/10 dark:bg-white/5';
          return (
            <button
              key={option}
              type="button"
              dir="rtl"
              lang="ar"
              onClick={() => answer(option)}
              className={`rounded-2xl border-2 px-4 py-4 text-lg font-semibold text-brand-ink transition-colors dark:text-white ${state}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {t('Best combo')}: {bestCombo}
      </p>
    </div>
  );
}
