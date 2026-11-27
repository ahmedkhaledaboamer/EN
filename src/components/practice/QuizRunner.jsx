import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleCheck, CircleX } from 'lucide-react';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import ProgressBar from '../ui/ProgressBar';
import McqExercise from './McqExercise';
import FillExercise from './FillExercise';
import OrderExercise from './OrderExercise';
import ListenExercise from './ListenExercise';
import SpeakExercise from './SpeakExercise';
import WriteExercise from './WriteExercise';
import ScoreScreen from './ScoreScreen';
import { useSpeechContext } from '../speech/SpeechContext';
import { useT } from '../../hooks/useT';

const TYPES = {
  mcq: { label: 'Multiple choice', Component: McqExercise },
  fill: { label: 'Fill in the blank', Component: FillExercise },
  order: { label: 'Put in order', Component: OrderExercise },
  listen: { label: 'Listen & type', Component: ListenExercise },
  speak: { label: 'Say it', Component: SpeakExercise },
  write: { label: 'Write it', Component: WriteExercise },
};

/** Short description of an exercise, for the mistakes list. */
function promptOf(ex) {
  if (ex.type === 'mcq') return ex.audio ? `Listen: ${ex.audio}` : ex.question;
  if (ex.type === 'fill') return ex.sentence;
  if (ex.type === 'order') return 'Put the words in order';
  if (ex.type === 'write') return `Write: ${ex.note}`;
  if (ex.type === 'speak') return ex.hideAnswer ? `Say in English: ${ex.note}` : `Say: ${ex.answer}`;
  return 'Listen & type';
}

/**
 * Runs a list of exercises with instant feedback and a final score screen.
 *   exercises – [{ type: 'mcq' | 'fill' | 'order' | 'listen', ..., label? }]
 *   onFinish  – (correct, total) => { percent, passed, isNewBest }   (save progress here)
 *   next      – optional { to, label } shown when passed
 *   review    – optional { label, onClick } shown when failed
 *   onRetry   – optional; if given, the parent rebuilds the quiz (e.g. new random questions)
 *   messages  – optional { pass, fail } text for the score screen
 *   onAnswer  – optional (exercise, { correct, given }) => void, called after every answer (mistakes notebook)
 */
export default function QuizRunner({ exercises: all, onFinish, next, review, onRetry, messages, onAnswer }) {
  const t = useT();
  const exercises = all.filter((ex) => TYPES[ex.type]);
  const { stop } = useSpeechContext();

  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { correct, given }
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);
  const nextRef = useRef(null);

  const current = exercises[index];
  const lastAnswer = answers[index];
  const correctCount = answers.filter((a) => a?.correct).length;

  useEffect(() => {
    if (locked) nextRef.current?.focus();
  }, [locked]);

  const onSubmit = (answer) => {
    onAnswer?.(current, answer);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = answer;
      return copy;
    });
    setLocked(true);
  };

  const goNext = () => {
    stop();
    if (index + 1 < exercises.length) {
      setIndex(index + 1);
      setLocked(false);
      return;
    }
    // Finished: save once, here (not in an effect)
    setResult(onFinish(correctCount, exercises.length));
  };

  const retry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    setAttempt((a) => a + 1);
    setIndex(0);
    setAnswers([]);
    setLocked(false);
    setResult(null);
  };

  if (exercises.length === 0) {
    return <p className="glass-card p-8 text-center">No exercises here yet.</p>;
  }

  if (result) {
    const mistakes = exercises
      .map((ex, i) => ({ ex, i, a: answers[i] }))
      .filter(({ a }) => !a?.correct)
      .map(({ ex, i, a }) => ({ index: i, prompt: promptOf(ex), given: a?.given || '—', answer: ex.answer }));
    return (
      <ScoreScreen
        correct={correctCount}
        total={exercises.length}
        result={result}
        mistakes={mistakes}
        next={next}
        review={review}
        onRetry={retry}
        messages={messages}
      />
    );
  }

  const { Component, label } = TYPES[current.type];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-sm">
          {t('Question')} <span className="font-semibold text-brand-ink dark:text-white">{index + 1}</span>/{exercises.length}
        </p>
        <ol className="flex gap-1.5" aria-label="Answers so far">
          {exercises.map((_, i) => {
            const a = answers[i];
            return (
              <li
                key={i}
                aria-label={`Question ${i + 1}: ${a ? (a.correct ? 'correct' : 'wrong') : i === index ? 'current' : 'not answered'}`}
                className={`h-2.5 w-2.5 rounded-full sm:w-5 ${
                  a ? (a.correct ? 'bg-emerald-500' : 'bg-rose-500') : i === index ? 'bg-brand-yellow' : 'bg-neutral-300 dark:bg-white/15'
                }`}
              />
            );
          })}
        </ol>
      </div>
      <ProgressBar value={(index / exercises.length) * 100} label="Quiz progress" className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${attempt}-${index}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-6 sm:p-8"
        >
          <Chip tone="gold" className="mb-5">
            {t(current.label ?? label)}
          </Chip>
          <Component exercise={current} locked={locked} onSubmit={onSubmit} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {locked && lastAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`mt-4 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between ${
              lastAnswer.correct
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200'
                : 'bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {lastAnswer.correct ? (
                <CircleCheck size={24} className="shrink-0" aria-hidden="true" />
              ) : (
                <CircleX size={24} className="shrink-0" aria-hidden="true" />
              )}
              <div>
                <p className="font-semibold">{t(lastAnswer.correct ? 'Correct!' : 'Not quite.')}</p>
                {!lastAnswer.correct && (
                  <p className="mt-0.5 text-sm">
                    {t('Correct answer:')} <strong>{current.answer}</strong>
                  </p>
                )}
              </div>
            </div>
            <Button ref={nextRef} onClick={goNext} className="shrink-0">
              {t(index + 1 < exercises.length ? 'Next question' : 'See my score')}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
