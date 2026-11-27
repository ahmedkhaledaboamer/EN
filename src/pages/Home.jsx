import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/home/Hero';
import StatsRow from '../components/home/StatsRow';
import TodayTopic from '../components/home/TodayTopic';
import ReviewBanner from '../components/home/ReviewBanner';
import GamesStrip from '../components/home/GamesStrip';
import PlacementBanner from '../components/home/PlacementBanner';
import TopicsGrid from '../components/topics/TopicsGrid';
import LevelGroupedGrid from '../components/topics/LevelGroupedGrid';
import LevelChips from '../components/ui/LevelChips';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import { topics, isTopicReady } from '../data/topics';
import { essentials } from '../data/essentials';
import { LEVEL_IDS } from '../data/levels';
import { useEssentialsProgress } from '../hooks/useEssentialsProgress';
import { useProgress } from '../hooks/useProgress';
import { useSavedWords } from '../hooks/useSavedWords';
import { useStreak } from '../hooks/useStreak';
import { useTodayTopic } from '../hooks/useTodayTopic';
import { useDailyGoal } from '../hooks/useDailyGoal';
import { usePlacement } from '../hooks/usePlacement';
import { useT } from '../hooks/useT';

const PATH_SIZE = 6;

const levelCounts = Object.fromEntries(LEVEL_IDS.map((id) => [id, topics.filter((t) => t.level === id).length]));
levelCounts.All = topics.length;

/** The next PATH_SIZE topics on the learning path, starting at today's topic. */
function getUpNext(todayTopic) {
  const start = todayTopic ? topics.findIndex((t) => t.slug === todayTopic.slug) : 0;
  const from = Math.max(0, Math.min(start, topics.length - PATH_SIZE));
  return topics.slice(from, from + PATH_SIZE);
}

export default function Home() {
  const { completedCount, getTopicProgress } = useProgress();
  const essentialsProgress = useEssentialsProgress();
  const { savedCount } = useSavedWords();
  const { streak, best } = useStreak();
  const daily = useDailyGoal();
  const { placement } = usePlacement();
  const t = useT();
  const { topic: todayTopic, allDone } = useTodayTopic();
  const [level, setLevel] = useState('All');

  const readyCount = topics.filter(isTopicReady).length;
  const upNext = getUpNext(todayTopic);

  return (
    <>
      <Hero todayTopic={todayTopic} streak={streak} />

      {/* Big invitation right under the hero until the placement test is taken */}
      {!placement && <PlacementBanner />}

      <StatsRow
        streak={streak}
        best={best}
        daily={daily}
        savedCount={savedCount}
        completedCount={completedCount}
        readyCount={readyCount}
        essentials={{
          completed: essentialsProgress.completedCount,
          total: essentials.length,
          learnedItems: essentialsProgress.learnedTotal,
        }}
      />

      {placement && <PlacementBanner />}
      <ReviewBanner />

      <TodayTopic
        topic={todayTopic}
        progress={todayTopic ? getTopicProgress(todayTopic) : null}
        allDone={allDone}
      />

      <GamesStrip />

      <section id="topics" aria-labelledby="topics-title" className="mt-20 scroll-mt-24 pb-10 sm:mt-28">
        <SectionHeading
          id="topics-title"
          eyebrow={t('Your learning path')}
          title={
            <>
              {t('Pick a')} <span className="text-highlight">{t('situation.')}</span>
            </>
          }
          description={
            level === 'All'
              ? t('{total} situations from A1 to C2. Here are the next {n} on your path.', { total: topics.length, n: upNext.length })
              : t('All {level} situations.', { level })
          }
          action={
            <Button to="/topics" variant="secondary">
              {t('All {n} topics', { n: topics.length })} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          }
        />
        <div className="mb-8">
          <LevelChips value={level} onChange={setLevel} counts={levelCounts} />
        </div>
        {level === 'All' ? (
          <TopicsGrid topics={upNext} />
        ) : (
          <LevelGroupedGrid topics={topics} levelIds={[level]} />
        )}
      </section>
    </>
  );
}
