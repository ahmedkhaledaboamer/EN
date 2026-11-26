import { useState } from 'react';
import { motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import Button from '../ui/Button';
import { isSameAnswer, shuffleDifferent } from '../../utils/answers';

/** Tap words to build the sentence; tap a placed word to send it back. */
export default function OrderExercise({ exercise, locked, onSubmit }) {
  // Keep indices so repeated words ("the", "the") stay distinct
  const [bank] = useState(() => shuffleDifferent(exercise.words.map((w, i) => ({ w, i }))));
  const [chosen, setChosen] = useState([]);
  const [result, setResult] = useState(null);

  const available = bank.filter((t) => !chosen.includes(t.i));
  const sentence = chosen.map((i) => exercise.words[i]).join(' ');

  const check = () => {
    const correct = isSameAnswer(sentence, exercise.answer);
    setResult(correct);
    onSubmit({ correct, given: sentence });
  };

  const chip =
    'rounded-xl border-2 px-3.5 py-2 font-semibold text-brand-ink transition-colors dark:text-white disabled:cursor-default';

  return (
    <div>
      <p className="text-lg font-semibold text-brand-ink dark:text-white">Put the words in the correct order.</p>

      <div
        aria-label="Your sentence"
        className={`mt-5 flex min-h-[4.5rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 ${
          result === null
            ? 'border-neutral-300 dark:border-white/20'
            : result
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10'
              : 'border-rose-500 bg-rose-50/60 dark:bg-rose-500/10'
        }`}
      >
        {chosen.length === 0 && <span className="px-2 text-sm text-neutral-400">Tap the words below…</span>}
        {chosen.map((i) => (
          <motion.button
            layout
            key={i}
            type="button"
            disabled={locked}
            onClick={() => setChosen((c) => c.filter((x) => x !== i))}
            aria-label={`Remove "${exercise.words[i]}"`}
            className={`${chip} border-brand-yellow bg-brand-yellow/25`}
          >
            {exercise.words[i]}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex min-h-[3rem] flex-wrap gap-2" aria-label="Available words">
        {available.map(({ w, i }) => (
          <motion.button
            layout
            key={i}
            type="button"
            disabled={locked}
            onClick={() => setChosen((c) => [...c, i])}
            className={`${chip} border-neutral-200 bg-white/80 hover:border-brand-yellow dark:border-white/15 dark:bg-white/5`}
          >
            {w}
          </motion.button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={check} disabled={locked || available.length > 0}>
          Check
        </Button>
        <Button variant="ghost" onClick={() => setChosen([])} disabled={locked || chosen.length === 0}>
          <Undo2 size={16} aria-hidden="true" /> Reset
        </Button>
      </div>
    </div>
  );
}
