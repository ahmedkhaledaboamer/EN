import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, EyeOff, Headphones, Mic, Repeat, RotateCcw, SkipForward, Square, Trophy } from 'lucide-react';
import Button from '../../ui/Button';
import HighlightLastWord from '../../ui/HighlightLastWord';
import SpeakButton from '../../speech/SpeakButton';
import MicButton from '../../speech/MicButton';
import SpeakFeedback from '../../speech/SpeakFeedback';
import { cancelSpeech, speak as speakText } from '../../../utils/speech';
import { isRecognitionSupported, useSpeakCheck } from '../../../hooks/useSpeechRecognition';
import { useStreak } from '../../../hooks/useStreak';
import { useSettings } from '../../../hooks/useSettings';

// A slightly different pitch per role so the two speakers sound different
const PITCH = { A: 1.15, B: 0.9 };
const pitchOf = (speaker) => PITCH[speaker] ?? 1;

function scoreChip(score) {
  if (score === null || score === undefined) return null;
  if (score === 'skipped') return { text: 'skipped', className: 'bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-300' };
  if (score >= 80) return { text: `${score}%`, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' };
  if (score >= 50) return { text: `${score}%`, className: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200' };
  return { text: `${score}%`, className: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' };
}

/** One chat bubble. Learner lines sit on the right in yellow. */
function Bubble({ line, role, mine, active, current, score, showAr, children }) {
  const chip = scoreChip(score);
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      data-current={current ? 'true' : undefined}
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-3.5 shadow-soft transition-shadow sm:max-w-[75%] ${
          mine
            ? 'rounded-br-lg bg-brand-yellow/25 dark:bg-brand-yellow/10'
            : 'glass-card !rounded-3xl !rounded-bl-lg'
        } ${active ? 'ring-2 ring-brand-yellow' : ''}`}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {role?.name}
            {mine && ' · you'}
          </span>
          {chip && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${chip.className}`}>{chip.text}</span>}
        </div>
        {children ?? (
          <>
            <p className="font-semibold text-brand-ink dark:text-white">{line.en}</p>
            {showAr && (
              <p dir="rtl" lang="ar" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {line.ar}
              </p>
            )}
          </>
        )}
      </div>
    </motion.li>
  );
}

/** The learner's current turn: say the line (or skip), then continue. */
function LearnerTurn({ line, role, hideText, onDone }) {
  const check = useSpeakCheck(line.en);
  const attempted = Boolean(check.result);
  const secret = hideText && !attempted;

  return (
    <Bubble line={line} role={role} mine active current>
      {secret ? (
        <>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Say it in English:</p>
          <p dir="rtl" lang="ar" className="mt-1 text-lg font-bold text-brand-ink dark:text-white">
            {line.ar}
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold text-brand-ink dark:text-white">{line.en}</p>
          <p dir="rtl" lang="ar" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {line.ar}
          </p>
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isRecognitionSupported ? (
          <>
            <MicButton check={check} label="Say your line" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {check.listening ? 'Listening…' : attempted ? 'Try again or continue' : 'Your turn: tap 🎤'}
            </span>
          </>
        ) : (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Say it out loud, then continue.</span>
        )}
        {!secret && <SpeakButton text={line.en} id="dialogue-model" size="sm" label="Hear how to say it" rate={0.85} />}
      </div>

      <SpeakFeedback check={check} compact hideTarget={secret} onRetry={check.start} />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => onDone(attempted ? check.result.score : isRecognitionSupported ? 'skipped' : null)}
          disabled={check.listening || (isRecognitionSupported && !attempted)}
        >
          Continue <ArrowRight size={14} aria-hidden="true" />
        </Button>
        {isRecognitionSupported && !attempted && (
          <Button size="sm" variant="ghost" onClick={() => onDone('skipped')}>
            <SkipForward size={14} aria-hidden="true" /> Skip
          </Button>
        )}
      </div>
    </Bubble>
  );
}

export default function DialogueTab({ topic }) {
  const { dialogue } = topic;
  const lines = dialogue.lines;
  const roles = useMemo(() => Object.fromEntries(dialogue.roles.map((r) => [r.id, r])), [dialogue.roles]);
  const { recordActivity } = useStreak();

  const [learner, setLearner] = useState(dialogue.learnerRole);
  const [mode, setMode] = useState('idle'); // idle | listen | practice | done
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [hideText, setHideText] = useState(false);
  const { settings } = useSettings();
  const [showAr, setShowAr] = useState(settings.showArabic);
  const runRef = useRef(0);
  const listRef = useRef(null);

  const stopAll = useCallback(() => {
    runRef.current++;
    cancelSpeech();
  }, []);

  // Stop when leaving the tab
  useEffect(() => stopAll, [stopAll]);

  // Keep the current line in view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-current="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [index, mode]);

  /** Listen mode: read the whole conversation, one line after another. */
  const listenAll = () => {
    stopAll();
    const run = runRef.current;
    setMode('listen');
    const step = (k) => {
      if (runRef.current !== run) return;
      if (k >= lines.length) {
        setMode('idle');
        return;
      }
      setIndex(k);
      speakText(lines[k].en, {
        rate: 0.92,
        pitch: pitchOf(lines[k].speaker),
        onEnd: (info) => {
          if (runRef.current !== run || info?.interrupted) return;
          setTimeout(() => step(k + 1), 350);
        },
        onError: () => runRef.current === run && setMode('idle'),
      });
    };
    step(0);
  };

  const startPractice = () => {
    stopAll();
    setScores({});
    setIndex(0);
    setMode('practice');
  };

  // Practice mode: the partner's lines are spoken automatically
  useEffect(() => {
    if (mode !== 'practice') return undefined;
    if (index >= lines.length) {
      setMode('done');
      recordActivity();
      return undefined;
    }
    const line = lines[index];
    if (line.speaker === learner) return undefined; // wait for the learner
    const run = ++runRef.current;
    const t = setTimeout(() => {
      speakText(line.en, {
        rate: 0.92,
        pitch: pitchOf(line.speaker),
        onEnd: (info) => {
          if (runRef.current !== run || info?.interrupted) return;
          setTimeout(() => runRef.current === run && setIndex((i) => i + 1), 400);
        },
        // No speech available: just move on
        onError: () => runRef.current === run && setIndex((i) => i + 1),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [mode, index, learner, lines, recordActivity]);

  const learnerDone = (score) => {
    setScores((s) => ({ ...s, [index]: score }));
    setIndex((i) => i + 1);
  };

  const switchRole = (id) => {
    stopAll();
    setLearner(id);
    setMode('idle');
    setIndex(0);
    setScores({});
  };

  // Results
  const numeric = Object.values(scores).filter((s) => typeof s === 'number');
  const average = numeric.length ? Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length) : null;
  const myLines = lines.filter((l) => l.speaker === learner).length;

  const visibleLines = mode === 'practice' ? lines.slice(0, index + 1) : lines;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Scene + controls */}
      <div className="glass-card p-5 sm:p-6">
        <h2 className="text-2xl sm:text-3xl">
          <HighlightLastWord text={dialogue.title} />
        </h2>
        <p dir="rtl" lang="ar" className="mt-2 text-neutral-600 dark:text-neutral-300">
          {dialogue.settingAr}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Your role
          </p>
          <div role="group" aria-label="Choose your role" className="flex flex-wrap gap-2">
            {dialogue.roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => switchRole(r.id)}
                aria-pressed={learner === r.id}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  learner === r.id
                    ? 'bg-brand-yellow text-brand-ink shadow-yellow'
                    : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300'
                }`}
              >
                {r.name} <span dir="rtl" lang="ar" className="font-normal opacity-70">· {r.nameAr.replace(' (إنت)', '')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {mode === 'listen' ? (
            <Button
              variant="secondary"
              onClick={() => {
                stopAll();
                setMode('idle');
              }}
            >
              <Square size={14} fill="currentColor" aria-hidden="true" /> Stop
            </Button>
          ) : (
            <Button variant="secondary" onClick={listenAll}>
              <Headphones size={16} aria-hidden="true" /> Listen to the conversation
            </Button>
          )}
          <Button onClick={startPractice}>
            <Mic size={16} aria-hidden="true" /> {mode === 'practice' ? 'Restart role-play' : 'Start role-play'}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={hideText} onChange={(e) => setHideText(e.target.checked)} className="h-4 w-4 accent-[#FDC52B]" />
            <EyeOff size={14} aria-hidden="true" /> Hide my lines (say them from the Arabic)
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={showAr} onChange={(e) => setShowAr(e.target.checked)} className="h-4 w-4 accent-[#FDC52B]" />
            Show Arabic translation
          </label>
        </div>
      </div>

      {/* Conversation */}
      <ol ref={listRef} className="mt-6 space-y-3" aria-label="Conversation" aria-live="polite">
        {visibleLines.map((line, i) => {
          const mine = line.speaker === learner;
          const current = (mode === 'practice' || mode === 'listen') && i === index;
          if (mode === 'practice' && mine && i === index) {
            return <LearnerTurn key={`turn-${i}`} line={line} role={roles[line.speaker]} hideText={hideText} onDone={learnerDone} />;
          }
          return (
            <Bubble
              key={i}
              line={line}
              role={roles[line.speaker]}
              mine={mine}
              active={current}
              current={current}
              score={scores[i]}
              showAr={showAr || (mode === 'practice' && hideText && mine)}
            />
          );
        })}
      </ol>

      {/* Result */}
      <AnimatePresence>
        {mode === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card mt-6 p-6 text-center"
          >
            <Trophy size={28} className="mx-auto text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
            <h3 className="mt-3 text-2xl">
              Conversation <span className="text-highlight">done!</span>
            </h3>
            <p className="mt-2">
              {average !== null
                ? `Average score: ${average}% over ${numeric.length} of your ${myLines} lines.`
                : 'Nice! Try it with the microphone to get a score.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button onClick={startPractice}>
                <RotateCcw size={16} aria-hidden="true" /> Practice again
              </Button>
              <Button
                variant="secondary"
                onClick={() => switchRole(dialogue.roles.find((r) => r.id !== learner).id)}
              >
                <Repeat size={16} aria-hidden="true" /> Switch roles
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
