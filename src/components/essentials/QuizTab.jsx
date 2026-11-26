import { useMemo, useState } from 'react';
import QuizRunner from '../practice/QuizRunner';
import { buildEssentialsQuiz } from '../../utils/quiz';
import { useEssentialsProgress } from '../../hooks/useEssentialsProgress';
import { useStreak } from '../../hooks/useStreak';
import { getNextEssential } from '../../data/essentials';

const QUESTIONS = 10;

/** 10 auto-generated questions; "Try again" builds a fresh random set. */
export default function QuizTab({ essential, onReview }) {
  const { recordPracticeResult } = useEssentialsProgress();
  const { recordActivity } = useStreak();
  const [round, setRound] = useState(0);

  const questions = useMemo(
    () => buildEssentialsQuiz(essential.items, QUESTIONS),
    // `round` forces a new random quiz on retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [essential.items, round],
  );
  const next = getNextEssential(essential.slug);

  const onFinish = (correct, total) => {
    recordActivity();
    return recordPracticeResult(essential.slug, correct, total);
  };

  return (
    <QuizRunner
      key={round}
      exercises={questions}
      onFinish={onFinish}
      onRetry={() => setRound((r) => r + 1)}
      next={next ? { to: `/essentials/${next.slug}`, label: `Next: ${next.title}` } : null}
      review={{ label: 'Review items', onClick: onReview }}
    />
  );
}
