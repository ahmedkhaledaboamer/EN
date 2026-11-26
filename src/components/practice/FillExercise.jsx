import { useEffect, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import Button from '../ui/Button';
import GapText from './GapText';
import { isSameAnswer } from '../../utils/answers';

/** `accept` (optional) lists other answers that are also correct. */
export default function FillExercise({ exercise, locked, onSubmit }) {
  const [value, setValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (locked || !value.trim()) return;
    const accepted = [exercise.answer, ...(exercise.accept ?? [])];
    const correct = accepted.some((a) => isSameAnswer(a, value));
    setResult(correct);
    onSubmit({ correct, given: value });
  };

  const border =
    result === null ? 'border-brand-yellow' : result ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-rose-500 text-rose-700 dark:text-rose-300';

  return (
    <form onSubmit={submit}>
      <p className="text-xl font-semibold leading-[2.2] text-brand-ink sm:text-2xl sm:leading-[2.2] dark:text-white">
        <GapText text={exercise.sentence}>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={locked}
            aria-label="Your answer"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`mx-1 inline-block w-36 border-b-[3px] bg-transparent px-1 text-center font-semibold outline-none focus:bg-brand-yellow/10 sm:w-44 ${border}`}
          />
        </GapText>
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={locked || !value.trim()}>
          Check
        </Button>
        {exercise.hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-neutral-200/70 dark:hover:bg-white/10"
          >
            <Lightbulb size={16} aria-hidden="true" /> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && (
          <span dir="rtl" lang="ar" className="rounded-full bg-brand-yellow/25 px-3 py-1 text-sm font-semibold text-amber-900 dark:text-brand-yellow">
            {exercise.hint}
          </span>
        )}
      </div>
    </form>
  );
}
