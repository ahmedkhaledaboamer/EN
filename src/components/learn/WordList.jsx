import { useState } from 'react';
import WordCard from './WordCard';
import { useSavedWords } from '../../hooks/useSavedWords';
import { useStreak } from '../../hooks/useStreak';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To learn' },
  { id: 'learned', label: 'Learned' },
];

/**
 * Grid of WordCards with a learned filter. Used by topic Words tabs and essentials Learn tabs.
 *   items        – [{ en, ar, phonetic, example, exampleAr? }]
 *   isLearned    – (en) => boolean
 *   setLearned   – (en, value) => void
 *   saveSlug     – key used for saved words (e.g. "supermarket", "essentials/months")
 */
export default function WordList({ items, isLearned, setLearned, saveSlug, noun = 'words' }) {
  const { isSaved, toggleSaved } = useSavedWords();
  const { recordActivity } = useStreak();
  const [filter, setFilter] = useState('all');

  const learnedCount = items.filter((w) => isLearned(w.en)).length;
  const visible = items.filter((w) => {
    const learned = isLearned(w.en);
    return filter === 'all' || (filter === 'learned' ? learned : !learned);
  });

  const onToggleLearned = (word) => {
    const wasLearned = isLearned(word.en);
    setLearned(word.en, !wasLearned);
    if (!wasLearned) recordActivity();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-mono font-semibold text-brand-ink dark:text-white">
            {learnedCount}/{items.length}
          </span>{' '}
          {noun} learned. Tap <strong className="text-brand-ink dark:text-white">Got it</strong> when you know one.
        </p>
        <div className="flex gap-1.5" role="group" aria-label={`Filter ${noun}`}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.id
                  ? 'bg-brand-ink text-white dark:bg-white dark:text-brand-ink'
                  : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="glass-card p-8 text-center">
          {filter === 'learned' ? `No learned ${noun} yet. Start with "Got it".` : `You learned all of them. 🎉`}
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((word) => (
            <li key={word.en}>
              <WordCard
                word={word}
                learned={isLearned(word.en)}
                saved={isSaved(saveSlug, word.en)}
                onToggleLearned={() => onToggleLearned(word)}
                onToggleSaved={() => toggleSaved(saveSlug, word)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
