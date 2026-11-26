import { LEVELS } from '../../data/levels';

/**
 * Level filter: All · A1 · A2 · B1 · B2 · C1 · C2 (each with its level color dot).
 * value: 'All' or a level id. counts (optional): { A1: 12, ... } shown next to each level.
 */
export default function LevelChips({ value, onChange, counts }) {
  const options = [{ id: 'All', name: 'All levels' }, ...LEVELS];
  return (
    <div role="group" aria-label="Filter by level" className="flex flex-wrap gap-1.5">
      {options.map((l) => {
        const selected = value === l.id;
        const count = counts?.[l.id];
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            aria-pressed={selected}
            title={l.id === 'All' ? 'All levels' : `${l.id} · ${l.name}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
              selected
                ? 'bg-brand-yellow text-brand-ink shadow-yellow'
                : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15'
            }`}
          >
            {l.dot && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${l.dot}`} />}
            {l.id === 'All' ? 'All' : l.id}
            {count !== undefined && (
              <span className={`font-mono text-xs ${selected ? 'text-brand-ink/70' : 'text-neutral-400'}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
