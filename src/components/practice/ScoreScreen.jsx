import { motion } from 'framer-motion';
import { ArrowRight, BookA, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { PASS_PERCENT } from '../../hooks/useProgress';

function headline(percent) {
  if (percent === 100) return ['Perfect', 'score!'];
  if (percent >= 85) return ['Excellent', 'work!'];
  if (percent >= PASS_PERCENT) return ['Topic', 'completed!'];
  if (percent >= 40) return ['Almost', 'there.'];
  return ['Keep', 'practicing.'];
}

/** messages (optional): { pass, fail } to replace the default topic wording. */
export default function ScoreScreen({ correct, total, result, mistakes, next, review, onRetry, messages }) {
  const { percent, passed, isNewBest } = result;
  const [first, gold] = headline(percent);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10"
    >
      <span
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          passed ? 'bg-brand-yellow text-brand-ink shadow-yellow' : 'bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
        }`}
        aria-hidden="true"
      >
        <Trophy size={36} />
      </span>

      <h2 className="mt-6 text-4xl sm:text-5xl">
        {first} <span className="text-highlight">{gold}</span>
      </h2>

      <p className="mt-4 font-display text-6xl font-extrabold tracking-tightest text-brand-ink dark:text-white" aria-live="polite">
        {correct}
        <span className="text-3xl text-neutral-400">/{total}</span>
      </p>
      <div className="mx-auto mt-4 max-w-xs">
        <ProgressBar value={percent} label="Score" />
        <p className="mt-2 font-mono text-sm">{percent}%</p>
      </div>

      {isNewBest && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-purple/40 px-3 py-1 text-sm font-semibold text-violet-900 dark:bg-violet-500/20 dark:text-violet-200">
          <Sparkles size={14} aria-hidden="true" /> New best score
        </p>
      )}

      <p className="mx-auto mt-4 max-w-md">
        {passed
          ? messages?.pass ?? 'This topic is marked as completed. Great job!'
          : messages?.fail ?? `You need ${PASS_PERCENT}% to complete this topic. Review the words and try again.`}
      </p>

      {mistakes.length > 0 && (
        <div className="mt-8 text-left">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Review your mistakes
          </p>
          <ul className="space-y-2">
            {mistakes.map((m) => (
              <li key={m.index} className="rounded-2xl bg-white/70 p-3 text-sm dark:bg-white/5">
                <p className="text-neutral-500 dark:text-neutral-400">{m.prompt}</p>
                <p className="mt-1">
                  <span className="text-rose-600 line-through dark:text-rose-400">{m.given}</span>{' '}
                  <ArrowRight size={12} className="inline" aria-hidden="true" />{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">{m.answer}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {passed && next ? (
          <>
            <Button to={next.to}>
              {next.label} <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button variant="secondary" onClick={onRetry}>
              <RotateCcw size={16} aria-hidden="true" /> Try again
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onRetry}>
              <RotateCcw size={16} aria-hidden="true" /> Try again
            </Button>
            {review && (
              <Button variant="secondary" onClick={review.onClick}>
                <BookA size={16} aria-hidden="true" /> {review.label}
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
