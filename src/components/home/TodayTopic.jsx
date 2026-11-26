import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import LevelBadge from '../ui/LevelBadge';
import HighlightLastWord from '../ui/HighlightLastWord';
import ProgressBar from '../ui/ProgressBar';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';

function WordPreview({ word }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/5">
      <div className="min-w-0">
        <p className="truncate font-semibold text-brand-ink dark:text-white">{word.en}</p>
        <p className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">{word.phonetic}</p>
      </div>
      <p dir="rtl" lang="ar" className="shrink-0 text-sm text-neutral-600 dark:text-neutral-300">
        {word.ar}
      </p>
    </li>
  );
}

function AllDone() {
  return (
    <div className="glass-card flex flex-col items-center px-6 py-12 text-center">
      <Sparkles size={32} className="text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
      <h3 className="mt-4 text-2xl sm:text-3xl">
        You finished <span className="text-highlight">every topic.</span>
      </h3>
      <p className="mt-2 max-w-md">Add a new topic file, or review an old situation.</p>
      <Button to="/topics" variant="secondary" className="mt-6">
        Review topics
      </Button>
    </div>
  );
}

function NoTopics() {
  return (
    <div className="glass-card px-6 py-12 text-center">
      <p className="font-mono text-sm">topics.filter(isTopicReady).length === 0</p>
      <p className="mt-2">Add words to a topic JSON file to get started.</p>
    </div>
  );
}

/** `topic` is a topic meta object (see data/topics/index.js). */
export default function TodayTopic({ topic, progress, allDone }) {
  return (
    <section aria-labelledby="today-title" className="mt-20 sm:mt-28">
      <SectionHeading
        id="today-title"
        eyebrow="Today's topic"
        title={
          <>
            Your situation <span className="text-highlight">for today.</span>
          </>
        }
      />

      <Reveal>
        {!topic ? (
          allDone ? <AllDone /> : <NoTopics />
        ) : (
          <div className="glass-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            {/* Left: info */}
            <div>
              <div className="flex items-start gap-4">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/25 text-4xl sm:h-20 sm:w-20 sm:text-5xl dark:bg-brand-yellow/10"
                  aria-hidden="true"
                >
                  {topic.emoji}
                </span>
                <div>
                  <h3 className="text-3xl sm:text-4xl">
                    <HighlightLastWord text={topic.title} />
                  </h3>
                  <p dir="rtl" lang="ar" className="mt-1 text-right text-lg text-neutral-600 sm:text-left dark:text-neutral-300">
                    {topic.titleAr}
                  </p>
                </div>
              </div>

              {topic.description && <p className="mt-5">{topic.description}</p>}

              <div className="mt-5 flex flex-wrap gap-2">
                <LevelBadge level={topic.level} showName />
                <Chip>{topic.wordsCount} words</Chip>
                <Chip>{topic.sentencesCount} sentences</Chip>
                <Chip>{topic.exercisesCount} exercises</Chip>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Words learned</span>
                  <span className="font-mono text-brand-ink dark:text-white">
                    {progress.learned}/{progress.total}
                  </span>
                </div>
                <ProgressBar value={progress.percent} label={`${topic.title} progress`} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button to={`/topics/${topic.slug}`}>
                  {progress.status === 'not-started' ? 'Start lesson' : 'Continue lesson'}
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                {progress.bestScore !== null && (
                  <span className="font-mono text-xs">best practice score: {progress.bestScore}%</span>
                )}
              </div>
            </div>

            {/* Right: word preview */}
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                First words
              </p>
              <ul className="space-y-2">
                {topic.preview.map((w) => (
                  <WordPreview key={w.en} word={w} />
                ))}
              </ul>
              {topic.wordsCount > topic.preview.length && (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  + {topic.wordsCount - topic.preview.length} more words inside
                </p>
              )}
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}
