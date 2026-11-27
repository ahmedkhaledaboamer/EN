import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/home/Hero';
import StatsRow from '../components/home/StatsRow';
import TodayTopic from '../components/home/TodayTopic';
import ReviewBanner from '../components/home/ReviewBanner';
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

      <section id="topics" aria-labelledby="topics-title" className="mt-20 scroll-mt-24 pb-10 sm:mt-28">
        <SectionHeading
          id="topics-title"
          eyebrow="Your learning path"
          title={
            <>
              Pick a <span className="text-highlight">situation.</span>
            </>
          }
          description={
            level === 'All'
              ? `${topics.length} situations from A1 to C2. Here are the next ${upNext.length} on your path.`
              : `All ${level} situations.`
          }
          action={
            <Button to="/topics" variant="secondary">
              All {topics.length} topics <ArrowRight size={16} aria-hidden="true" />
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
