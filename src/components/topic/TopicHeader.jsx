import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Chip from '../ui/Chip';
import LevelBadge from '../ui/LevelBadge';
import HighlightLastWord from '../ui/HighlightLastWord';
import MonoLine from '../ui/MonoLine';
import ProgressBar from '../ui/ProgressBar';

/** Topic page header. Rendered from the light meta object, so it shows instantly. */
export default function TopicHeader({
  meta,
  progress,
  backTo = '/topics',
  backLabel = 'All topics',
  monoPath = '~/topic',
  learnedLabel = 'Words learned',
}) {
  return (
    <header className="pt-6 sm:pt-10">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-brand-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end"
      >
        <div className="flex items-start gap-4 sm:gap-6">
          <span
            className="glass-card flex h-20 w-20 shrink-0 items-center justify-center text-5xl sm:h-24 sm:w-24 sm:text-6xl"
            aria-hidden="true"
          >
            {meta.emoji}
          </span>
          <div className="min-w-0">
            <MonoLine path={monoPath} command={meta.slug} />
            <h1 className="mt-2 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              <HighlightLastWord text={meta.title} />
            </h1>
            <p dir="rtl" lang="ar" className="mt-1 text-right text-lg text-neutral-600 sm:text-left dark:text-neutral-300">
              {meta.titleAr}
            </p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex flex-wrap gap-2">
            <LevelBadge level={meta.level} showName />
            {progress.completed && (
              <Chip tone="gold">
                <Check size={12} strokeWidth={3} aria-hidden="true" /> Completed
              </Chip>
            )}
            {progress.bestScore !== null && <Chip>Best {progress.bestScore}%</Chip>}
          </div>
          <div className="mb-2 mt-4 flex justify-between text-sm">
            <span>{learnedLabel}</span>
            <span className="font-mono text-brand-ink dark:text-white">
              {progress.learned}/{progress.total}
            </span>
          </div>
          <ProgressBar
            value={progress.total ? (progress.learned / progress.total) * 100 : 0}
            label={learnedLabel}
          />
        </div>
      </motion.div>

      {meta.description && <p className="mt-6 max-w-2xl text-base sm:text-lg">{meta.description}</p>}
    </header>
  );
}
