import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { shuffle } from '../../utils/answers';
import GapText from './GapText';

export default function McqExercise({ exercise, locked, onSubmit }) {
  const [options] = useState(() => shuffle(exercise.options));
  const [picked, setPicked] = useState(null);

  const choose = (option) => {
    if (locked) return;
    setPicked(option);
    onSubmit({ correct: option === exercise.answer, given: option });
  };

  // Optional fields (used by the essentials quiz):
  //   prompt      – small instruction above the question
  //   questionDir – 'rtl' when the question is Arabic
  //   note        – small Arabic helper line under the question
  //   optionsDir  – 'rtl' when the options are Arabic
  const rtlQuestion = exercise.questionDir === 'rtl';
  const rtlOptions = exercise.optionsDir === 'rtl';

  return (
    <div>
      {exercise.prompt && <p className="mb-2 text-sm font-medium">{exercise.prompt}</p>}
      <p
        dir={rtlQuestion ? 'rtl' : undefined}
        lang={rtlQuestion ? 'ar' : undefined}
        className="text-xl font-semibold leading-relaxed text-brand-ink sm:text-2xl dark:text-white"
      >
        <GapText text={exercise.question} />
      </p>
      {exercise.note && (
        <p dir="rtl" lang="ar" className="mt-2 text-neutral-500 dark:text-neutral-400">
          {exercise.note}
        </p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isAnswer = option === exercise.answer;
          const isPicked = option === picked;
          let state =
            'border-neutral-200 bg-white/70 hover:border-brand-yellow hover:bg-brand-yellow/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-yellow/60';
          if (locked && isAnswer) state = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15';
          else if (locked && isPicked) state = 'border-rose-500 bg-rose-50 dark:bg-rose-500/15';
          else if (locked) state = 'border-neutral-200 bg-white/40 opacity-60 dark:border-white/10 dark:bg-white/5';

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={locked}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-medium text-brand-ink transition-colors dark:text-white ${state}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200/80 font-mono text-xs dark:bg-white/10">
                {locked && isAnswer ? (
                  <Check size={14} strokeWidth={3} className="text-emerald-600" aria-hidden="true" />
                ) : locked && isPicked ? (
                  <X size={14} strokeWidth={3} className="text-rose-600" aria-hidden="true" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span dir={rtlOptions ? "rtl" : undefined} lang={rtlOptions ? "ar" : undefined} className={rtlOptions ? "flex-1 text-right text-lg" : undefined}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
