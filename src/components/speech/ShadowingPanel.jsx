import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Headphones, RotateCcw, Trophy, X } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import MicButton from './MicButton';
import SpeakFeedback from './SpeakFeedback';
import { isRecognitionSupported, useSpeakCheck } from '../../hooks/useSpeechRecognition';
import { useStreak } from '../../hooks/useStreak';
import { useT } from '../../hooks/useT';
import { speak as speakText } from '../../utils/speech';

/** One sentence: hear it, then repeat it into the mic. Remounted per sentence (key). */
function ShadowStep({ item, autoPlay, onScore, rate }) {
  const t = useT();
  const check = useSpeakCheck(item.en);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(
    (slow = false) => {
      setPlaying(true);
      speakText(item.en, { rate: slow ? 0.7 : rate, onEnd: () => setPlaying(false), onError: () => setPlaying(false) });
    },
    [item.en, rate],
  );

  // Hear the model first, automatically
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => play(), 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoPlay, play]);

  useEffect(() => {
    if (check.result) onScore(check.result.score);
  }, [check.result, onScore]);

  return (
    <div>
      <p className="text-2xl font-semibold leading-relaxed text-brand-ink sm:text-3xl dark:text-white">{item.en}</p>
      {item.ar && (
        <p dir="rtl" lang="ar" className="mt-2 text-neutral-500 dark:text-neutral-400">
          {item.ar}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => play()} disabled={playing}>
          <Headphones size={16} aria-hidden="true" /> {playing ? t('Playing…') : t('Listen')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => play(true)} disabled={playing}>
          {t('Slow')}
        </Button>
        {isRecognitionSupported ? (
          <>
            <MicButton check={check} size="lg" label="Repeat the sentence" />
            <span className="text-sm">{check.listening ? t('Listening… speak now') : t('Now repeat it')}</span>
          </>
        ) : (
          <span className="text-sm">{t('Repeat it out loud, then go to the next one.')}</span>
        )}
      </div>
      <SpeakFeedback check={check} onRetry={check.start} />
    </div>
  );
}

/**
 * Shadowing: listen to each sentence and repeat it right away.
 *   items: [{ en, ar? }]
 */
export default function ShadowingPanel({ items, onClose, rate = 0.9 }) {
  const t = useT();
  const { recordActivity } = useStreak();
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [done, setDone] = useState(false);

  const onScore = useCallback((score) => setScores((s) => ({ ...s, [index]: Math.max(score, s[index] ?? 0) })), [index]);
  const values = Object.values(scores);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  const next = () => {
    if (index + 1 < items.length) setIndex(index + 1);
    else {
      setDone(true);
      recordActivity();
    }
  };

  if (done) {
    return (
      <div className="glass-card p-6 text-center sm:p-8">
        <Trophy size={30} className="mx-auto text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
        <h3 className="mt-3 text-2xl">{t('Shadowing done!')}</h3>
        <p className="mt-2">
          {average !== null
            ? t('Average score: {n}% over {k} sentences.', { n: average, k: values.length })
            : t('Great practice! Use the microphone next time to get a score.')}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              setScores({});
              setIndex(0);
              setDone(false);
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> {t('Again')}
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              {t('Close')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-sm">
          {t('Sentence')} <strong className="text-brand-ink dark:text-white">{index + 1}</strong>/{items.length}
          {average !== null && <span className="ml-3 text-neutral-500 dark:text-neutral-400">avg {average}%</span>}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-200/70 dark:hover:bg-white/10"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <ProgressBar value={(index / items.length) * 100} label="Shadowing progress" className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          <ShadowStep item={items[index]} autoPlay onScore={onScore} rate={rate} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ArrowLeft size={16} aria-hidden="true" /> {t('Back')}
        </Button>
        <Button onClick={next}>
          {index + 1 < items.length ? t('Next sentence') : t('Finish')} <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
