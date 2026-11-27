import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import LevelGroupedGrid from '../components/topics/LevelGroupedGrid';
import IntroLine from '../components/ui/IntroLine';
import { useT } from '../hooks/useT';
import LevelChips from '../components/ui/LevelChips';
import Button from '../components/ui/Button';
import { topics } from '../data/topics';
import { LEVEL_IDS } from '../data/levels';
import { useProgress } from '../hooks/useProgress';

const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'not-started', label: 'Not started' },
];

const levelCounts = Object.fromEntries(LEVEL_IDS.map((id) => [id, topics.filter((t) => t.level === id).length]));
levelCounts.All = topics.length;

export default function Topics() {
  const t = useT();
  const { getTopicProgress } = useProgress();
  const [params, setParams] = useSearchParams();

  // Filters live in the URL, so Back/refresh keeps them
  const query = params.get('q') ?? '';
  const level = LEVEL_IDS.includes(params.get('level')) ? params.get('level') : 'All';
  const status = STATUSES.some((s) => s.id === params.get('status')) ? params.get('status') : 'all';

  const update = (key, value, empty) => {
    const next = new URLSearchParams(params);
    if (!value || value === empty) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((t) => {
      if (level !== 'All' && t.level !== level) return false;
      if (status !== 'all' && getTopicProgress(t).status !== status) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.titleAr.includes(query.trim()) ||
        t.description.toLowerCase().includes(q) ||
        t.wordKeys.some((w) => w.toLowerCase().includes(q))
      );
    });
  }, [query, level, status, getTopicProgress]);

  const searching = Boolean(query.trim()) || status !== 'all';
  const levelIds = level === 'All' ? LEVEL_IDS : [level];

  return (
    <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="topics-page-title">
      <IntroLine>{t("All situations")}</IntroLine>
      <h1 id="topics-page-title" className="mt-5 text-4xl sm:text-6xl">
        {t("Browse")} <span className="text-highlight">{t("topics.")}</span>
      </h1>
      <p className="mt-4 font-mono text-sm">
        {topics.length} situations · A1 → C2 · search by topic or by word
      </p>
      <p className="mt-2 text-sm">
        Not sure which level?{' '}
        <Link to="/placement" className="font-semibold text-brand-gold underline decoration-2 underline-offset-4 dark:text-brand-yellow">
          Take the placement test
        </Link>
      </p>

      {/* Filters */}
      <div className="glass-card mt-8 space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <label htmlFor="topic-search" className="sr-only">
            Search topics
          </label>
          <input
            id="topic-search"
            type="search"
            value={query}
            onChange={(e) => update('q', e.target.value, '')}
            placeholder="Search: hotel, refund, مطعم…"
            className="w-full rounded-full border-2 border-transparent bg-white/80 py-3 pl-11 pr-11 text-brand-ink outline-none placeholder:text-neutral-400 focus:border-brand-yellow dark:bg-white/5 dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => update('q', '', '')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-neutral-200/70 dark:hover:bg-white/10"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <LevelChips value={level} onChange={(v) => update('level', v, 'All')} counts={levelCounts} />
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {STATUSES.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => update('status', o.id, 'all')}
              aria-pressed={status === o.id}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                status === o.id
                  ? 'bg-brand-ink text-white dark:bg-white dark:text-brand-ink'
                  : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-8 mt-6 text-sm" aria-live="polite">
        Showing <strong className="text-brand-ink dark:text-white">{filtered.length}</strong> of {topics.length} topics
      </p>

      {searching && filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="font-mono text-sm">topics.filter(…).length === 0</p>
          <p className="mt-2">No topics match these filters.</p>
          <Button variant="secondary" className="mt-5" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </Button>
        </div>
      ) : (
        // While searching, hide empty levels; otherwise show "Coming soon" for them
        <LevelGroupedGrid topics={filtered} levelIds={levelIds} showEmpty={!searching} />
      )}
    </section>
  );
}
