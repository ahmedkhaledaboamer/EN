import { useMemo } from 'react';
import QuizRunner from '../../practice/QuizRunner';
import { useProgress } from '../../../hooks/useProgress';
import { useStreak } from '../../../hooks/useStreak';
import { useMistakes } from '../../../hooks/useMistakes';
import { isRecognitionSupported } from '../../../hooks/useSpeechRecognition';
import { getNextTopic } from '../../../data/topics';
import { shuffle } from '../../../utils/answers';

/** Extra exercises built from the topic's sentences: "Write it" always, "Say it" when the mic is supported. */
const WRITE_COUNT = 2;
const SPEAK_COUNT = 2;

export default function PracticeTab({ topic, onReviewWords }) {
  const { recordPracticeResult } = useProgress();
  const { recordActivity } = useStreak();
  const { recordAnswer } = useMistakes();
  const source = { title: topic.title, emoji: topic.emoji, to: `/topics/${topic.slug}?tab=practice` };
  const nextTopic = getNextTopic(topic.slug);

  // The topic's 8 exercises + 2 "Write it" (Arabic → English) + 2 "Say it", from different sentences
  const exercises = useMemo(() => {
    if (!topic.sentences?.length) return topic.exercises;
    const picked = shuffle(topic.sentences);
    const write = picked.slice(0, WRITE_COUNT).map((s) => ({ type: 'write', answer: s.en, note: s.ar }));
    const speak = isRecognitionSupported
      ? picked.slice(WRITE_COUNT, WRITE_COUNT + SPEAK_COUNT).map((s) => ({ type: 'speak', answer: s.en, note: s.ar }))
      : [];
    return [...topic.exercises, ...write, ...speak];
  }, [topic]);

  const onFinish = (correct, total) => {
    recordActivity();
    return recordPracticeResult(topic.slug, correct, total);
  };

  return (
    <QuizRunner
      exercises={exercises}
      onFinish={onFinish}
      onAnswer={(ex, answer) => recordAnswer(ex, answer, source)}
      next={nextTopic ? { to: `/topics/${nextTopic.slug}`, label: `Next: ${nextTopic.title}` } : null}
      review={{ label: 'Review words', onClick: onReviewWords }}
    />
  );
}
