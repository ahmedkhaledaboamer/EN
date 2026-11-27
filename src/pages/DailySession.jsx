import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CircleCheck, Clock, Layers, Sparkles, Target, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import { LoadingState } from './TopicPage';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import Flashcards from '../components/essentials/Flashcards';
import QuizRunner from '../components/practice/QuizRunner';
import { loadTopic } from '../data/topics';
import { useTodayTopic } from '../hooks/useTodayTopic';
import { useProgress } from '../hooks/useProgress';
import { useReview } from '../hooks/useReview';
import { useMistakes, exerciseId } from '../hooks/useMistakes';
import { useStreak } from '../hooks/useStreak';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isRecognitionSupported } from '../hooks/useSpeechRecognition';
import { useT } from '../hooks/useT';
import { isSpeechSupported } from '../utils/speech';
import { STORAGE_KEYS } from '../utils/storage';
import { todayKey } from '../utils/date';
import { loadReviewItems } from '../utils/reviewItems';
import { SESSION_LIMITS, buildSessionPractice, newWordsFor } from '../utils/dailySession';

const STEP_META = {
  review: { label: 'Review', icon: Layers },
  new: { label: 'New words', icon: Sparkles },
  practice: { label: 'Practice', icon: Target },
};

function Stepper({ steps, current }) {
  const t = useT();
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2" aria-label="Session steps">
      {steps.map((s, i) => {
        const { icon: Icon, label } = STEP_META[s];
        const state = i < current ? 'done' : i === current ? 'now' : 'next';
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                state === 'now'
                  ? 'bg-brand-yellow text-brand-ink shadow-yellow'
                  : state === 'done'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-neutral-200/70 text-neutral-500 dark:bg-white/10 dark:text-neutral-400'
              }`}
              aria-current={state === 'now' ? 'step' : undefined}
            >
              {state === 'done' ? <CircleCheck size={15} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}
              {i + 1}. {t(label)}
            </span>
            {i < steps.length - 1 && <span className="text-neutral-400" aria-hidden="true">→</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default function DailySession() {
  const t = useT();
  const { topic: todayMeta } = useTodayTopic();
  const topicProgress = useProgress();
  const { dueKeys, grade, savedWords } = useReview();
  const { mistakes, recordAnswer } = useMistakes();
  const { recordActivity } = useStreak();
  const [session, setSession] = useLocalStorage(STORAGE_KEYS.session, { date: null, count: 0 });

  const [topic, setTopic] = useState(null);
  const [plan, setPlan] = useState(null); // frozen when the session starts
  const [step, setStep] = useState(0);
  const [practiceScore, setPracticeScore] = useState(null);
  const doneToday = session.date === todayKey();

  useEffect(() => {
    let alive = true;
    if (todayMeta) loadTopic(todayMeta.slug).then((data) => alive && setTopic(data));
    return () => {
      alive = false;
    };
  }, [todayMeta]);

  const isLearned = (en) => topicProgress.isWordLearned(topic?.slug, en);
  const preview = topic && {
    review: Math.min(dueKeys.length, SESSION_LIMITS.review),
    newWords: newWordsFor(topic, isLearned).length,
    mistakes: Math.min(mistakes.length, SESSION_LIMITS.mistakes),
  };

  const start = async () => {
    const reviewItems = await loadReviewItems(dueKeys.slice(0, SESSION_LIMITS.review), savedWords);
    const newWords = newWordsFor(topic, isLearned);
    const practice = buildSessionPractice({
      topic,
      mistakes,
      speakSupported: isRecognitionSupported,
      listenSupported: isSpeechSupported,
    });
    const steps = [reviewItems.length && 'review', newWords.length && 'new', practice.length && 'practice'].filter(Boolean);
    setPlan({ steps, reviewItems, newWords, practice });
    setStep(0);
    setPracticeScore(null);
  };

  const nextStep = () => setStep((s) => s + 1);

  // Session finished
  useEffect(() => {
    if (plan && step >= plan.steps.length) {
      setSession((prev) => ({ date: todayKey(), count: prev.date === todayKey() ? prev.count + 1 : 1 }));
      recordActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, step]);

  const source = topic && { title: topic.title, emoji: topic.emoji, to: `/topics/${topic.slug}?tab=practice` };
  const mistakeSource = Object.fromEntries(mistakes.map((m) => [m.id, m.source]));

  let body;
  if (!todayMeta) {
    body = <p className="glass-card p-8 text-center">{t('You finished every topic. Use the review to keep your English fresh.')}</p>;
  } else if (!topic) {
    body = <LoadingState />;
  } else if (!plan) {
    body = (
      <div className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow">
          <Zap size={30} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-3xl sm:text-4xl">
          {t('Your plan for')} <span className="text-highlight">{t('today.')}</span>
        </h2>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm">
          <Clock size={14} aria-hidden="true" /> {t('about 15 minutes')} · {topic.emoji} {topic.title}
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {[
            [Layers, t('{n} words to review', { n: preview.review }), preview.review],
            [Sparkles, t('{n} new words from {topic}', { n: preview.newWords, topic: topic.title }), preview.newWords],
            [Target, t('Mixed practice: listen, write, speak{m}', { m: preview.mistakes ? t(' + {n} of your mistakes', { n: preview.mistakes }) : '' }), 1],
          ]
            .filter(([, , n]) => n > 0)
            .map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/5">
                <Icon size={18} className="shrink-0 text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
                <span className="font-medium text-brand-ink dark:text-white">{text}</span>
              </li>
            ))}
        </ul>
        {doneToday && (
          <p className="mt-5 text-sm text-emerald-700 dark:text-emerald-300">
            ✓ {t('You already did a session today. Another one is a great bonus!')}
          </p>
        )}
        <Button className="mt-8" size="lg" onClick={start}>
          {t('Start session')} <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    );
  } else if (step >= plan.steps.length) {
    body = (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10">
        <p className="text-5xl" aria-hidden="true">
          🎉
        </p>
        <h2 className="mt-4 text-3xl sm:text-4xl">
          {t('Session')} <span className="text-highlight">{t('complete!')}</span>
        </h2>
        <ul className="mx-auto mt-6 max-w-xs space-y-1 text-left">
          {plan.reviewItems.length > 0 && <li>✓ {t('{n} words to review', { n: plan.reviewItems.length })}</li>}
          {plan.newWords.length > 0 && <li>✓ {t('{n} new words from {topic}', { n: plan.newWords.length, topic: topic.title })}</li>}
          {practiceScore !== null && <li>✓ {t('Practice score: {n}%', { n: practiceScore })}</li>}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to={`/topics/${topic.slug}`}>
            {t('Continue with {topic}', { topic: topic.title })} <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button to="/" variant="secondary">
            {t('Home')}
          </Button>
        </div>
      </motion.div>
    );
  } else {
    const current = plan.steps[step];
    body = (
      <>
        <Stepper steps={plan.steps} current={step} />
        <SpeechNotice />
        {current === 'review' && (
          <Flashcards
            key="review"
            items={plan.reviewItems}
            isLearned={() => false}
            setLearned={(en, knew) => {
              const item = plan.reviewItems.find((i) => i.en === en);
              if (item) grade(item.key, knew);
            }}
            onActivity={recordActivity}
            onDone={nextStep}
            doneLabel={t('Continue')}
          />
        )}
        {current === 'new' && (
          <Flashcards
            key="new"
            items={plan.newWords}
            isLearned={isLearned}
            setLearned={(en, value) => topicProgress.setWordLearned(topic.slug, en, value)}
            onActivity={recordActivity}
            onDone={nextStep}
            doneLabel={t('Continue')}
          />
        )}
        {current === 'practice' && (
          <QuizRunner
            key="practice"
            exercises={plan.practice}
            onAnswer={(ex, answer) => recordAnswer(ex, answer, mistakeSource[exerciseId(ex)] ?? source)}
            onFinish={(correct, total) => {
              const percent = total ? Math.round((correct / total) * 100) : 0;
              setPracticeScore(percent);
              return { percent, passed: percent >= 70, isNewBest: false };
            }}
            next={{ label: t('Finish session'), onClick: nextStep, always: true }}
            messages={{
              pass: t('Great work! Mistakes you fixed were removed from your notebook.'),
              fail: t('Good effort. The questions you missed were added to your mistakes notebook.'),
            }}
          />
        )}
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={nextStep}>
            {t('Skip this step')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <SpeechProvider>
      <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="session-title">
        <IntroLine>{t('15 minutes a day')}</IntroLine>
        <h1 id="session-title" className="mt-5 text-4xl sm:text-6xl">
          {t("Today's")} <span className="text-highlight">{t('session.')}</span>
        </h1>
        <div className="mt-10">{body}</div>
      </section>
    </SpeechProvider>
  );
}

