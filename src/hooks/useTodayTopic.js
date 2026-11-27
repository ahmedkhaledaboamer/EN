import { useMemo } from 'react';
import { topics, isTopicReady } from '../data/topics';
import { LEVEL_IDS } from '../data/levels';
import { useProgress } from './useProgress';
import { usePlacement } from './usePlacement';

const rank = (level) => LEVEL_IDS.indexOf(level);

/**
 * Today's topic = the first ready topic that isn't completed yet.
 * After the placement test, topics below your starting level are skipped.
 * If nothing is left at or above it (e.g. placed at B2 before B2 content exists),
 * the highest level that still has open topics is used.
 * Returns { topic, allDone }.
 */
export function useTodayTopic() {
  const { progress } = useProgress();
  const { placement } = usePlacement();

  return useMemo(() => {
    const open = topics.filter(isTopicReady).filter((t) => !progress[t.slug]?.completed);
    let topic = open[0] ?? null;

    const start = placement?.startLevel;
    if (start && open.length) {
      const atOrAbove = open.find((t) => rank(t.level) >= rank(start));
      if (atOrAbove) topic = atOrAbove;
      else {
        const highest = Math.max(...open.map((t) => rank(t.level)));
        topic = open.find((t) => rank(t.level) === highest);
      }
    }
    const anyReady = topics.some(isTopicReady);
    return { topic, allDone: anyReady && topic === null };
  }, [progress, placement]);
}
