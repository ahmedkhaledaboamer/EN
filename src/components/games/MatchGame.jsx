import { useEffect, useMemo, useState } from 'react';
import { pickPairs } from '../../utils/games';
import { shuffle } from '../../utils/answers';
import { useT } from '../../hooks/useT';

const PAIRS = 6;

/** Match each English word with its Arabic meaning, as fast as possible. */
export default function MatchGame({ words, onFinish }) {
  const t = useT();
  const pairs = useMemo(() => pickPairs(words, PAIRS), [words]);
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);

  const [selected, setSelected] = useState(null); // { side: 'en' | 'ar', en }
  const [matched, setMatched] = useState(() => new Set());
  const [wrong, setWrong] = useState(null); // { firstSide, firstEn, secondEn } flashing red
  const [mistakes, setMistakes] = useState(0);
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const pick = (side, en) => {
    if (matched.has(en) || wrong) return;
    if (!selected || selected.side === side) {
      setSelected({ side, en });
      return;
    }
    if (selected.en === en) {
      const next = new Set(matched).add(en);
      setMatched(next);
      setSelected(null);
      if (next.size === pairs.length) {
        const seconds = Math.round((Date.now() - start) / 100) / 10;
        setTimeout(() => onFinish({ score: seconds, mistakes, lowerIsBetter: true, label: `${seconds}s` }), 400);
      }
    } else {
      setMistakes((m) => m + 1);
      setWrong({ firstSide: selected.side, firstEn: selected.en, secondEn: en });
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 450);
    }
  };

  const tile = (side, w) => {
    const isMatched = matched.has(w.en);
    const isSelected = selected?.side === side && selected.en === w.en;
    // The two tiles of a wrong attempt: the first pick (its side) and the second pick (the other side)
    const isWrong = Boolean(wrong) && (side === wrong.firstSide ? w.en === wrong.firstEn : w.en === wrong.secondEn);
    return (
      <button
        key={`${side}-${w.en}`}
        type="button"
        onClick={() => pick(side, w.en)}
        disabled={isMatched}
        dir={side === 'ar' ? 'rtl' : undefined}
        lang={side === 'ar' ? 'ar' : undefined}
        className={`min-h-[3.5rem] w-full rounded-2xl border-2 px-4 py-3 text-center font-semibold transition-all ${
          isMatched
            ? 'scale-95 border-emerald-400 bg-emerald-50 text-emerald-700 opacity-50 dark:bg-emerald-500/10 dark:text-emerald-300'
            : isWrong
              ? 'animate-pulse border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200'
              : isSelected
                ? 'border-brand-yellow bg-brand-yellow/25 text-brand-ink dark:text-white'
                : 'border-neutral-200 bg-white/80 text-brand-ink hover:border-brand-yellow dark:border-white/10 dark:bg-white/5 dark:text-white'
        }`}
      >
        {side === 'en' ? w.en : w.ar}
      </button>
    );
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between font-mono text-sm">
        <span>
          {t('Matched')} <strong className="text-brand-ink dark:text-white">{matched.size}</strong>/{pairs.length}
        </span>
        <span>
          ⏱ <strong className="text-brand-ink dark:text-white">{((now - start) / 1000).toFixed(1)}s</strong> · {t('mistakes')}{' '}
          {mistakes}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-3">{left.map((w) => tile('en', w))}</div>
        <div className="flex flex-col gap-3">{right.map((w) => tile('ar', w))}</div>
      </div>
    </div>
  );
}
