import TopicCard from './TopicCard';
import Reveal from '../ui/Reveal';
import { useProgress } from '../../hooks/useProgress';
import { isReady } from '../../data/registry';

/**
 * Grid of cards. Ready entries first, then "coming soon" ones.
 * Pass `useProgressHook`, `basePath` and `details` to reuse it for essentials.
 */
export default function TopicsGrid({ topics, useProgressHook = useProgress, basePath = '/topics', details }) {
  const { getTopicProgress } = useProgressHook();
  const sorted = [...topics.filter(isReady), ...topics.filter((t) => !isReady(t))];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((topic, i) => (
        <li key={topic.slug}>
          <Reveal delay={Math.min(i * 0.06, 0.3)} className="h-full">
            <TopicCard
              topic={topic}
              progress={getTopicProgress(topic)}
              basePath={basePath}
              details={details?.(topic)}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
