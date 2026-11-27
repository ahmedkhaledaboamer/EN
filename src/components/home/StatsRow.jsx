import { Link } from 'react-router-dom';
import { Blocks, Bookmark, CircleCheckBig, Flame } from 'lucide-react';
import StatCard from './StatCard';
import Reveal from '../ui/Reveal';

/** essentials: { completed, total, learnedItems } */
export default function StatsRow({ streak, best, savedCount, completedCount, readyCount, essentials, daily }) {
  // daily: { done, goal } words learned today vs. the goal from Settings
  const streakHint = `Today ${daily.done}/${daily.goal} words${daily.done >= daily.goal ? ' ✓' : ''}`;

  return (
    <section aria-label="Your stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Reveal>
        <StatCard
          icon={Flame}
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
          label="Streak"
          value={streak}
          suffix={streak === 1 ? 'day' : 'days'}
          hint={best > streak ? `${streakHint} · best ${best}` : streakHint}
        />
      </Reveal>
      <Reveal delay={0.08}>
        <Link to="/saved" className="block rounded-3xl">
          <StatCard
            icon={Bookmark}
            iconClass="bg-brand-purple/40 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300"
            label="Saved words"
            value={savedCount}
            suffix={savedCount === 1 ? 'word' : 'words'}
            hint={savedCount ? 'Open your word list' : 'Bookmark words on any word card'}
          />
        </Link>
      </Reveal>
      <Reveal delay={0.16}>
        <StatCard
          icon={CircleCheckBig}
          iconClass="bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow"
          label="Completed topics"
          value={completedCount}
          suffix={`/ ${readyCount}`}
          hint={completedCount ? 'Keep going!' : 'Finish a practice to complete a topic'}
        />
      </Reveal>
      <Reveal delay={0.24}>
        <Link to="/essentials" className="block rounded-3xl">
          <StatCard
            icon={Blocks}
            iconClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
            label="Essentials"
            value={essentials.completed}
            suffix={`/ ${essentials.total}`}
            hint={`${essentials.learnedItems} core items learned`}
          />
        </Link>
      </Reveal>
    </section>
  );
}
