import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, RotateCcw } from 'lucide-react';
import { recognitionErrorMessage } from '../../hooks/useSpeechRecognition';

const VERDICTS = {
  great: { text: 'Great!', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  almost: { text: 'Almost', className: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200' },
  retry: { text: 'Try again', className: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' },
};

/**
 * Shows what happened after a 🎤 attempt: listening state, error, or the
 * target sentence with each word green (heard) or red (missed).
 * hideTarget: do not print the target words (used when the answer must stay secret).
 */
export default function SpeakFeedback({ check, compact = false, onRetry, hideTarget = false, className = '' }) {
  const { listening, interim, error, result } = check;
  const visible = listening || error || result;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`overflow-hidden ${className}`}
          aria-live="polite"
        >
          <div className={`rounded-2xl bg-white/70 dark:bg-white/5 ${compact ? 'mt-3 p-3 text-sm' : 'mt-4 p-4'}`}>
            {listening && (
              <p className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden="true" />
                Listening… speak now
                {interim && <span className="ml-1 truncate italic text-neutral-500 dark:text-neutral-400">“{interim}”</span>}
              </p>
            )}

            {!listening && error && (
              <p className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {recognitionErrorMessage(error)}
              </p>
            )}

            {!listening && !error && result && (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICTS[result.verdict].className}`}>
                    {VERDICTS[result.verdict].text} · {result.score}%
                  </span>
                  {onRetry && result.verdict !== 'great' && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-white/10"
                    >
                      <RotateCcw size={12} aria-hidden="true" /> Try again
                    </button>
                  )}
                </div>
                {!hideTarget && (!compact || result.words.length > 1) ? (
                  <p className={`mt-2 font-semibold leading-relaxed ${compact ? '' : 'text-lg'}`}>
                    {result.words.map((w, i) => (
                      <span
                        key={i}
                        className={w.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 underline decoration-rose-400 decoration-2 underline-offset-4 dark:text-rose-300'}
                      >
                        {w.text}{' '}
                      </span>
                    ))}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  We heard: <span className="italic">“{result.heard}”</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
