import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import Chip from '../ui/Chip';
import LevelBadge from '../ui/LevelBadge';
import ProgressBar from '../ui/ProgressBar';
import { isReady } from '../../data/registry';
import { useT } from '../../hooks/useT';
import { practiceCount } from '../../utils/practice';

function CardHeader({ topic, completed }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-5xl leading-none" aria-hidden="true">
        {topic.emoji}
      </span>
      <div className="flex items-center gap-2">
        <LevelBadge level={topic.level} />
        {completed && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow text-brand-ink shadow-yellow"
            title="Completed"
          >
            <Check size={16} strokeWidth={3} aria-hidden="true" />
            <span className="sr-only">Completed</span>
          </span>
        )}
      </div>
    </div>
  );
}

function CardTitle({ topic }) {
  return (
    <div className="mt-6">
      <h3 className="text-2xl">{topic.title}</h3>
      <p dir="rtl" lang="ar" className="mt-0.5 text-left text-sm text-neutral-500 dark:text-neutral-400">
        {topic.titleAr}
      </p>
    </div>
  );
}

/** Placeholder with no words yet: muted, dashed, not clickable. */
function EmptyCard({ topic }) {
  return (
    <div
      className="flex h-full flex-col rounded-3xl border-2 border-dashed border-neutral-300/80 bg-white/30 p-6 dark:border-white/15 dark:bg-white/[0.02]"
      aria-label={`${topic.title}: coming soon`}
    >
      <div className="opacity-60 grayscale">
        <CardHeader topic={topic} completed={false} />
        <CardTitle topic={topic} />
      </div>
      <div className="mt-auto pt-6">
        <Chip tone="outline">
          <Clock size={12} aria-hidden="true" /> Coming soon
        </Chip>
        <p className="mt-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          words: [] <span className="text-neutral-400 dark:text-neutral-500">{`// ${topic.slug}.json`}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Card for a topic or an essentials category (both use the same meta shape).
 *   basePath – '/topics' or '/essentials'
 *   details  – mono line under the title; defaults to "20 words · 8 exercises"
 */
export default function TopicCard({ topic, progress, basePath = '/topics', details }) {
  const t = useT();
  if (!isReady(topic)) return <EmptyCard topic={topic} />;

  const { learned, total, percent, completed, bestScore } = progress;
  const line = details ?? `${t('{n} words', { n: total })} · ${t('{n} exercises', { n: practiceCount(topic.exercisesCount, topic.sentencesCount) })}`;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
      <Link
        to={`${basePath}/${topic.slug}`}
        className="glass-card flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-lift"
        aria-label={`${topic.title}, level ${topic.level}, ${learned} of ${total} learned${completed ? ', completed' : ''}`}
      >
        <CardHeader topic={topic} completed={completed} />
        <CardTitle topic={topic} />

        <p className="mt-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {line}
          {bestScore !== null && ` · best ${bestScore}%`}
        </p>

        <div className="mt-auto pt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span>{t(completed ? 'Completed' : 'Progress')}</span>
            <span className="font-mono text-brand-ink dark:text-white">{percent}%</span>
          </div>
          <ProgressBar value={percent} label={`${topic.title} progress`} />
        </div>
      </Link>
    </motion.div>
  );
}
