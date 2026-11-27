import { Link } from 'react-router-dom';
import { Blocks, Bookmark, CircleCheckBig, Flame } from 'lucide-react';
import StatCard from './StatCard';
import Reveal from '../ui/Reveal';
import { useT } from '../../hooks/useT';

/** essentials: { completed, total, learnedItems } */
export default function StatsRow({ streak, best, savedCount, completedCount, readyCount, essentials, daily }) {
  // daily: { done, goal } words learned today vs. the goal from Settings
  const t = useT();
  const streakHint = `${t('Today {done}/{goal} words', daily)}${daily.done >= daily.goal ? ' ✓' : ''}`;

  return (
    <section aria-label="Your stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Reveal>
        <Link to="/progress" className="block rounded-3xl">
        <StatCard
          icon={Flame}
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
          label={t('Streak')}
          value={streak}
          suffix={t(streak === 1 ? 'day' : 'days')}
          hint={best > streak ? `${streakHint} · best ${best}` : streakHint}
        />
        </Link>
      </Reveal>
      <Reveal delay={0.08}>
        <Link to="/saved" className="block rounded-3xl">
          <StatCard
            icon={Bookmark}
            iconClass="bg-brand-purple/40 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300"
            label={t('Saved words')}
            value={savedCount}
            suffix={t(savedCount === 1 ? 'word' : 'words')}
            hint={t(savedCount ? 'Open your word list' : 'Bookmark words on any word card')}
          />
        </Link>
      </Reveal>
      <Reveal delay={0.16}>
        <StatCard
          icon={CircleCheckBig}
          iconClass="bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow"
          label={t('Completed topics')}
          value={completedCount}
          suffix={`/ ${readyCount}`}
          hint={t(completedCount ? 'Keep going!' : 'Finish a practice to complete a topic')}
        />
      </Reveal>
      <Reveal delay={0.24}>
        <Link to="/essentials" className="block rounded-3xl">
          <StatCard
            icon={Blocks}
            iconClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
            label={t('Essentials')}
            value={essentials.completed}
            suffix={`/ ${essentials.total}`}
            hint={t('{n} core items learned', { n: essentials.learnedItems })}
          />
        </Link>
      </Reveal>
    </section>
  );
}
