import { Clock } from 'lucide-react';
import TopicsGrid from './TopicsGrid';
import { LEVELS } from '../../data/levels';

function LevelHeading({ level, count }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span aria-hidden="true" className={`h-3 w-3 translate-y-[-2px] self-center rounded-full ${level.dot}`} />
      <h2 className="text-2xl sm:text-3xl">
        {level.id} <span className="text-neutral-400">·</span> <span className="text-highlight">{level.name}</span>
      </h2>
      <span dir="rtl" lang="ar" className="text-neutral-500 dark:text-neutral-400">
        {level.nameAr}
      </span>
      <span className="ml-auto font-mono text-xs text-neutral-500 dark:text-neutral-400">
        {count} {count === 1 ? 'topic' : 'topics'}
      </span>
    </div>
  );
}

function LevelComingSoon({ level }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-neutral-300/80 bg-white/30 p-6 dark:border-white/15 dark:bg-white/[0.02]">
      <Clock size={22} className="shrink-0 text-neutral-400" aria-hidden="true" />
      <div>
        <p className="font-semibold text-brand-ink dark:text-white">Coming soon</p>
        <p className="text-sm">
          No {level.id} topics yet. Add one with <code className="font-mono text-xs">&quot;level&quot;: &quot;{level.id}&quot;</code>.
        </p>
      </div>
    </div>
  );
}

/**
 * Topics grouped under level headings ("A1 · Beginner").
 *   levelIds  – which levels to render (in order)
 *   showEmpty – render a "Coming soon" block for levels without topics
 */
export default function LevelGroupedGrid({ topics, levelIds, showEmpty = true }) {
  const levels = LEVELS.filter((l) => levelIds.includes(l.id));
  return (
    <div className="space-y-14">
      {levels.map((level) => {
        const items = topics.filter((t) => t.level === level.id);
        if (!items.length && !showEmpty) return null;
        return (
          <section key={level.id} aria-label={`${level.id} ${level.name}`}>
            <LevelHeading level={level} count={items.length} />
            {items.length ? <TopicsGrid topics={items} /> : <LevelComingSoon level={level} />}
          </section>
        );
      })}
    </div>
  );
}
