import QuizRunner from '../../practice/QuizRunner';
import { useProgress } from '../../../hooks/useProgress';
import { useStreak } from '../../../hooks/useStreak';
import { getNextTopic } from '../../../data/topics';

export default function PracticeTab({ topic, onReviewWords }) {
  const { recordPracticeResult } = useProgress();
  const { recordActivity } = useStreak();
  const nextTopic = getNextTopic(topic.slug);

  const onFinish = (correct, total) => {
    recordActivity();
    return recordPracticeResult(topic.slug, correct, total);
  };

  return (
    <QuizRunner
      exercises={topic.exercises}
      onFinish={onFinish}
      next={nextTopic ? { to: `/topics/${nextTopic.slug}`, label: `Next: ${nextTopic.title}` } : null}
      review={{ label: 'Review words', onClick: onReviewWords }}
    />
  );
}
