import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Languages } from 'lucide-react';
import SpeakButton from '../../speech/SpeakButton';

export default function SentencesTab({ topic }) {
  const [revealed, setRevealed] = useState(() => new Set());
  const allShown = revealed.size === topic.sentences.length;

  const toggleOne = (i) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const toggleAll = () =>
    setRevealed(allShown ? new Set() : new Set(topic.sentences.map((_, i) => i)));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">Listen, repeat out loud, then check the Arabic meaning.</p>
        <button
          type="button"
          onClick={toggleAll}
          aria-pressed={allShown}
          className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-200/80 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          <Languages size={16} aria-hidden="true" />
          {allShown ? 'Hide all translations' : 'Show all translations'}
        </button>
      </div>

      <ol className="space-y-3">
        {topic.sentences.map((s, i) => {
          const open = revealed.has(i);
          const arId = `sentence-ar-${i}`;
          return (
            <li key={s.en} className="glass-card p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-7 shrink-0 font-mono text-sm text-brand-gold dark:text-brand-yellow" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="flex-1 text-base font-semibold text-brand-ink sm:text-lg dark:text-white">{s.en}</p>
                <SpeakButton text={s.en} id={`sentence-${i}`} />
                <button
                  type="button"
                  onClick={() => toggleOne(i)}
                  aria-expanded={open}
                  aria-controls={arId}
                  aria-label={open ? 'Hide translation' : 'Show translation'}
                  title={open ? 'Hide translation' : 'Show translation'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  {open ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.p
                    id={arId}
                    dir="rtl"
                    lang="ar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden text-lg text-neutral-600 dark:text-neutral-300"
                  >
                    <span className="block pt-3">{s.ar}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
