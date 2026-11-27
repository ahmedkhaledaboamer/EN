import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Languages, Mic, Pause, Play, Square, X } from 'lucide-react';
import ShadowingPanel from '../../speech/ShadowingPanel';
import HighlightLastWord from '../../ui/HighlightLastWord';
import ProgressBar from '../../ui/ProgressBar';
import SpeakButton from '../../speech/SpeakButton';
import { useSpeechContext } from '../../speech/SpeechContext';
import { cancelSpeech, speak as speakText } from '../../../utils/speech';
import { buildWordMatchers, segmentSentence, splitSentences } from '../../../utils/storyText';
import { useSettings } from '../../../hooks/useSettings';

const RATES = { normal: 0.95, slow: 0.7 };

/** Plays the story sentence by sentence (reliable pause/resume across browsers). */
function useStoryPlayer(sentences, rate) {
  const [status, setStatus] = useState('idle'); // idle | playing | paused
  const [index, setIndex] = useState(0);
  const runRef = useRef(0);

  const playFrom = useCallback(
    (start) => {
      const run = ++runRef.current;
      setStatus('playing');
      const step = (k) => {
        if (runRef.current !== run) return;
        if (k >= sentences.length) {
          setStatus('idle');
          setIndex(0);
          return;
        }
        setIndex(k);
        speakText(sentences[k], {
          rate,
          onEnd: (info) => {
            if (runRef.current !== run) return;
            // Something else started speaking (e.g. a word's 🔊): pause here
            if (info?.interrupted) {
              runRef.current++;
              setStatus('paused');
              return;
            }
            step(k + 1);
          },
          onError: () => {
            if (runRef.current === run) setStatus('idle');
          },
        });
      };
      step(start);
    },
    [sentences, rate],
  );

  const pause = useCallback(() => {
    runRef.current++;
    cancelSpeech();
    setStatus('paused');
  }, []);

  const stop = useCallback(() => {
    runRef.current++;
    cancelSpeech();
    setStatus('idle');
    setIndex(0);
  }, []);

  // Stop when leaving the tab
  useEffect(
    () => () => {
      runRef.current++;
      cancelSpeech();
    },
    [],
  );

  return { status, index, playFrom, pause, stop };
}

function WordPopup({ word, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-label={`Meaning of ${word.en}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md"
    >
      <div className="glass-card flex items-center gap-4 !bg-white/90 p-4 shadow-lift dark:!bg-night-surface/95">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-extrabold tracking-tight text-brand-ink dark:text-white">{word.en}</p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{word.phonetic}</p>
          <p dir="rtl" lang="ar" className="mt-1 text-lg font-semibold text-brand-ink dark:text-white">
            {word.ar}
          </p>
        </div>
        <SpeakButton text={word.en} id={`story-word-${word.en}`} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200/70 dark:hover:bg-white/10"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

export default function StoryTab({ topic }) {
  const { story } = topic;
  const { supported } = useSpeechContext();
  const [speed, setSpeed] = useState('normal');
  const [selected, setSelected] = useState(null);
  const { settings } = useSettings();
  const [showTranslation, setShowTranslation] = useState(settings.showArabic);

  const sentences = useMemo(() => splitSentences(story.text), [story.text]);
  const matchers = useMemo(() => buildWordMatchers(topic.words), [topic.words]);
  const segmented = useMemo(() => sentences.map((s) => segmentSentence(s, matchers)), [sentences, matchers]);
  const wordCount = useMemo(() => story.text.trim().split(/\s+/).length, [story.text]);

  const { status, index, playFrom, pause, stop } = useStoryPlayer(sentences, RATES[speed]);
  const playing = status === 'playing';

  const onPlayPause = () => {
    if (playing) pause();
    else playFrom(status === 'paused' ? index : 0);
  };

  const changeSpeed = (next) => {
    setSpeed(next);
    if (playing) pause(); // new rate applies on the next play
  };

  const closePopup = useCallback(() => setSelected(null), []);
  const [shadowing, setShadowing] = useState(false);

  if (shadowing) {
    return (
      <div className="mx-auto max-w-3xl">
        <ShadowingPanel items={sentences.map((en) => ({ en }))} onClose={() => setShadowing(false)} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <article className="glass-card p-6 sm:p-8" aria-labelledby="story-title">
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {wordCount} words · ~{Math.max(1, Math.round(wordCount / 130))} min · tap a{' '}
          <span className="underline decoration-brand-yellow decoration-2 underline-offset-4">highlighted word</span> for its meaning
        </p>
        <h2 id="story-title" className="mt-3 text-3xl sm:text-4xl">
          <HighlightLastWord text={story.title} />
        </h2>

        <p className="mt-6 text-lg leading-[2] text-neutral-700 sm:text-xl sm:leading-[2] dark:text-neutral-200">
          {segmented.map((segments, si) => (
            <span
              key={si}
              className={`rounded-lg transition-colors duration-300 ${
                status !== 'idle' && si === index ? 'bg-brand-yellow/30 dark:bg-brand-yellow/20' : ''
              }`}
            >
              {segments.map((seg, k) =>
                seg.type === 'word' ? (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSelected(seg.word)}
                    aria-label={`${seg.text}: show meaning`}
                    className={`rounded-md font-semibold text-brand-ink underline decoration-brand-yellow decoration-2 underline-offset-4 transition-colors hover:bg-brand-yellow/30 dark:text-white ${
                      selected?.en === seg.word.en ? 'bg-brand-yellow/40' : ''
                    }`}
                  >
                    {seg.text}
                  </button>
                ) : (
                  <span key={k}>{seg.text}</span>
                ),
              )}{' '}
            </span>
          ))}
        </p>

        <AnimatePresence initial={false}>
          {showTranslation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p
                dir="rtl"
                lang="ar"
                className="mt-8 border-t border-neutral-200/80 pt-6 text-lg leading-loose text-neutral-600 dark:border-white/10 dark:text-neutral-300"
              >
                {story.translation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </article>

      {/* Player */}
      <aside className="lg:sticky lg:top-40 lg:self-start">
        <div className="glass-card p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Listen</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onPlayPause}
              disabled={!supported}
              aria-label={playing ? 'Pause story' : status === 'paused' ? 'Resume story' : 'Play story'}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow text-brand-ink shadow-yellow transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
            >
              {playing ? <Pause size={22} fill="currentColor" aria-hidden="true" /> : <Play size={22} fill="currentColor" className="ml-0.5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={status === 'idle'}
              aria-label="Stop"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 disabled:opacity-40 dark:bg-white/10 dark:text-white"
            >
              <Square size={16} fill="currentColor" aria-hidden="true" />
            </button>
            <div className="ml-auto flex rounded-full bg-neutral-200/70 p-1 dark:bg-white/10" role="group" aria-label="Speed">
              {Object.keys(RATES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeSpeed(key)}
                  aria-pressed={speed === key}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    speed === key ? 'bg-white text-brand-ink shadow-sm dark:bg-white/20 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span>{status === 'idle' ? 'Ready' : status === 'paused' ? 'Paused' : 'Playing'}</span>
              <span className="font-mono" aria-live="polite">
                {status === 'idle' ? 0 : index + 1}/{sentences.length}
              </span>
            </div>
            <ProgressBar
              value={status === 'idle' ? 0 : ((index + 1) / sentences.length) * 100}
              label="Story audio progress"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          aria-pressed={showTranslation}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-200/80 px-4 py-3 text-sm font-semibold text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          <Languages size={16} aria-hidden="true" />
          {showTranslation ? 'Hide Arabic translation' : 'Show Arabic translation'}
        </button>
        <button
          type="button"
          onClick={() => {
            stop();
            setShadowing(true);
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-3 text-sm font-semibold text-brand-ink shadow-yellow transition-transform hover:-translate-y-0.5"
        >
          <Mic size={16} aria-hidden="true" /> Shadowing: repeat each sentence
        </button>
      </aside>

      <AnimatePresence>{selected && <WordPopup key={selected.en} word={selected} onClose={closePopup} />}</AnimatePresence>
    </div>
  );
}
