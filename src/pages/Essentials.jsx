import IntroLine from '../components/ui/IntroLine';
import { useT } from '../hooks/useT';
import ProgressBar from '../components/ui/ProgressBar';
import TopicsGrid from '../components/topics/TopicsGrid';
import { essentials } from '../data/essentials';
import { useEssentialsProgress } from '../hooks/useEssentialsProgress';

const totalItems = essentials.reduce((n, e) => n + e.wordsCount, 0);

export default function Essentials() {
  const t = useT();
  const { completedCount, learnedTotal } = useEssentialsProgress();

  return (
    <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="essentials-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <IntroLine>{t("Building blocks")}</IntroLine>
          <h1 id="essentials-title" className="mt-5 text-4xl sm:text-6xl">
            {t("The")} <span className="text-highlight">{t("essentials.")}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base sm:text-lg">
            Days, numbers, pronouns, prepositions… the small words every situation is built from. Learn them,
            flip the flashcards, then take a quick quiz.
          </p>
          <p dir="rtl" lang="ar" className="mt-2 max-w-xl text-left text-neutral-500 dark:text-neutral-400">
            الكلمات الأساسية اللي بتستخدمها في كل موقف.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Categories completed</p>
            <p className="font-mono text-sm text-brand-ink dark:text-white">
              {completedCount}/{essentials.length}
            </p>
          </div>
          <ProgressBar
            value={essentials.length ? (completedCount / essentials.length) * 100 : 0}
            label="Essentials categories completed"
            className="mt-2"
          />
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm font-medium">Items learned</p>
            <p className="font-mono text-sm text-brand-ink dark:text-white">
              {learnedTotal}/{totalItems}
            </p>
          </div>
          <ProgressBar value={totalItems ? (learnedTotal / totalItems) * 100 : 0} label="Essentials items learned" className="mt-2" />
        </div>
      </div>

      <div className="mt-12">
        {essentials.length ? (
          <TopicsGrid
            topics={essentials}
            useProgressHook={useEssentialsProgress}
            basePath="/essentials"
            details={(e) => `${e.wordsCount} items · quiz`}
          />
        ) : (
          <p className="glass-card p-8 text-center">No essentials yet.</p>
        )}
      </div>
    </section>
  );
}
