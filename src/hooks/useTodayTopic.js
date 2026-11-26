import { useMemo } from 'react';
import { topics, isTopicReady } from '../data/topics';
import { useProgress } from './useProgress';

/**
 * Today's topic = the first ready topic (has words) that isn't completed yet.
 * Returns { topic, allDone }. topic is null when everything is completed
 * or no topic has content yet.
 */
export function useTodayTopic() {
  const { progress } = useProgress();

  return useMemo(() => {
    const ready = topics.filter(isTopicReady);
    const topic = ready.find((t) => !progress[t.slug]?.completed) ?? null;
    return { topic, allDone: ready.length > 0 && topic === null };
  }, [progress]);
}
