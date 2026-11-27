import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Shuffle, Undo2 } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import SpeakButton from '../speech/SpeakButton';
import { shuffle } from '../../utils/answers';
import { useDailyGoal } from '../../hooks/useDailyGoal';

/**
 * Flip cards. "I know it" marks the item as learned (same progress as "Got it"),
 * "Still learning" un-marks it. Keyboard: Enter/Space flip, → know it, ← still learning.
 */
export default function Flashcards({ items, isLearned, setLearned, onActivity, onDone, doneLabel = 'Continue' }) {
  const [deck, setDeck] = useState(items);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({}); // en → 'known' | 'unknown'
  const { addWord } = useDailyGoal();

  const card = deck[pos];
  const done = pos >= deck.length;

  const restart = (nextDeck) => {
    setDeck(nextDeck);
    setPos(0);
    setFlipped(false);
    setSession({});
  };

  const mark = useCallback(
    (known) => {
      if (!card) return;
      setLearned(card.en, known);
      if (known) {
        onActivity?.();
        addWord();
      }
      setSession((s) => ({ ...s, [card.en]: known ? 'known' : 'unknown' }));
      setFlipped(false);
      setPos((p) => p + 1);
    },
    [card, setLearned, onActivity, addWord],
  );

  useEffect(() => {
    if (done) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight') mark(true);
      if (e.key === 'ArrowLeft') mark(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, mark]);

  if (done) {
    const unknown = deck.filter((it) => session[it.en] === 'unknown');
    const known = deck.length - unknown.length;
    return (
      <div className="glass-card mx-auto max-w-xl p-8 text-center sm:p-10">
        <h2 className="text-3xl sm:text-4xl">
          Deck <span className="text-highlight">finished.</span>
        </h2>
        <p className="mt-4 font-display text-5xl font-extrabold tracking-tightest text-brand-ink dark:text-white">
          {known}
          <span className="text-2xl text-neutral-400">/{deck.length}</span>
        </p>
        <p className="mt-2">cards you already know</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onDone && (
            <Button onClick={onDone}>
              {doneLabel} →
            </Button>
          )}
          {unknown.length > 0 && (
            <Button onClick={() => restart(unknown)}>
              <Undo2 size={16} aria-hidden="true" /> Review {unknown.length} still learning
            </Button>
          )}
          <Button variant={unknown.length ? 'secondary' : 'primary'} onClick={() => restart(shuffle(items))}>
            <RotateCcw size={16} aria-hidden="true" /> Start again
          </Button>
        </div>
      </div>
    );
  }

  const flip = () => setFlipped((f) => !f);
  const face =
    'absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-6 text-center [backface-visibility:hidden]';

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-sm">
          Card <span className="font-semibold text-brand-ink dark:text-white">{pos + 1}</span>/{deck.length}
        </p>
        <Button variant="ghost" size="sm" onClick={() => restart(shuffle(deck))}>
          <Shuffle size={14} aria-hidden="true" /> Shuffle
        </Button>
      </div>
      <ProgressBar value={(pos / deck.length) * 100} label="Flashcards progress" className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${card.en}-${pos}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="[perspective:1200px]"
        >
          <motion.div
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? `${card.en}: ${card.ar}. Press to flip back.` : `${card.en}. Press to see the meaning.`}
            onClick={flip}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flip();
              }
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative h-72 cursor-pointer select-none [transform-style:preserve-3d] sm:h-80"
          >
            {/* Front */}
            <div className={`${face} glass-card`}>
              {isLearned(card.en) && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-yellow px-2.5 py-1 text-xs font-semibold text-brand-ink">
                  <Check size={12} strokeWidth={3} aria-hidden="true" /> Known
                </span>
              )}
              <p className="font-display text-4xl font-extrabold tracking-tightest text-brand-ink sm:text-5xl dark:text-white">
                {card.en}
              </p>
              <p className="mt-2 font-mono text-sm text-neutral-500 dark:text-neutral-400">{card.phonetic}</p>
              <div className="mt-5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <SpeakButton text={card.en} id={`flash-${card.en}`} />
              </div>
              <p className="absolute bottom-4 text-xs text-neutral-400">Tap to flip</p>
            </div>
            {/* Back */}
            <div className={`${face} glass-card !bg-brand-yellow/20 [transform:rotateY(180deg)] dark:!bg-brand-yellow/10`}>
              <p dir="rtl" lang="ar" className="text-3xl font-bold text-brand-ink sm:text-4xl dark:text-white">
                {card.ar}
              </p>
              {card.example && (
                <>
                  <p className="mt-5 text-sm italic">“{card.example}”</p>
                  {card.exampleAr && (
                    <p dir="rtl" lang="ar" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {card.exampleAr}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => mark(false)}>
          ← Still learning
        </Button>
        <Button onClick={() => mark(true)}>
          I know it →
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Keyboard: Enter to flip · ← still learning · → I know it
      </p>
    </div>
  );
}
