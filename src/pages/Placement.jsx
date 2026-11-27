import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Clock, Headphones, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import LevelBadge from '../components/ui/LevelBadge';
import ProgressBar from '../components/ui/ProgressBar';
import SpeakButton from '../components/speech/SpeakButton';
import { SpeechProvider } from '../components/speech/SpeechContext';
import { DONT_KNOW, PASS_PER_STAGE, STAGES, questionsFor, scorePlacement } from '../data/placement';
import { getLevel } from '../data/levels';
import { topics } from '../data/topics';
import { usePlacement } from '../hooks/usePlacement';
import { useTodayTopic } from '../hooks/useTodayTopic';
import { isSpeechSupported } from '../utils/speech';
import { shuffle } from '../utils/answers';

const PER_STAGE = questionsFor('A1').length;

function Intro({ onStart, previous }) {
  return (
    <div className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow">
        <ClipboardCheck size={30} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-3xl sm:text-4xl">
        Find your <span className="text-highlight">level.</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md">
        Up to {STAGES.length * PER_STAGE} short questions in {STAGES.length} stages, from easy to hard. The test stops
        when a stage gets too difficult.
      </p>
      <p dir="rtl" lang="ar" className="mx-auto mt-2 max-w-md text-neutral-500 dark:text-neutral-400">
        جاوب بصراحة، ولو مش عارف الإجابة اختار «I don&apos;t know» بدل ما تخمّن، عشان النتيجة تبقى دقيقة.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={15} aria-hidden="true" /> about 5 minutes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Headphones size={15} aria-hidden="true" /> includes listening
        </span>
      </div>
      {previous?.takenAt && (
        <p className="mt-4 text-sm">
          Last result: <LevelBadge level={previous.level ?? 'A1'} showName />
        </p>
      )}
      <Button className="mt-8" size="lg" onClick={onStart}>
        {previous ? 'Take the test again' : 'Start the test'} <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}

function Question({ q, number, total, stageIndex, onAnswer }) {
  // Shuffle options once per question; "I don't know" always last
  const options = useMemo(() => [...shuffle(q.options), DONT_KNOW], [q]);
  const [picked, setPicked] = useState(null);

  const choose = (option) => {
    if (picked) return;
    setPicked(option);
    setTimeout(() => onAnswer(option === q.answer), 250);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-mono">
          Question <strong className="text-brand-ink dark:text-white">{number}</strong>
        </span>
        <span className="font-mono text-neutral-500 dark:text-neutral-400">
          Stage {stageIndex + 1} of {STAGES.length}
        </span>
      </div>
      <ProgressBar value={((number - 1) / total) * 100} label="Test progress" className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={number}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-6 sm:p-8"
        >
          {q.audio && (
            <div className="mb-5 flex items-center gap-3">
              {isSpeechSupported ? (
                <>
                  <SpeakButton text={q.audio} id={`placement-${number}`} label="Play the audio" className="!h-14 !w-14" />
                  <SpeakButton text={q.audio} id={`placement-slow-${number}`} rate={0.65} size="sm" label="Play slowly" />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Listen, then answer</span>
                </>
              ) : (
                <p className="rounded-2xl bg-white/70 px-4 py-3 italic dark:bg-white/5">“{q.audio}”</p>
              )}
            </div>
          )}
          <p className="text-xl font-semibold leading-relaxed text-brand-ink sm:text-2xl dark:text-white">
            {q.question.split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="mx-1 inline-block w-16 translate-y-1 border-b-[3px] border-brand-yellow" />}
              </span>
            ))}
          </p>
          <div className="mt-6 grid gap-3">
            {options.map((option) => {
              const dontKnow = option === DONT_KNOW;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  disabled={Boolean(picked)}
                  className={`rounded-2xl border-2 px-4 py-3.5 text-left font-medium transition-colors ${
                    picked === option
                      ? 'border-brand-yellow bg-brand-yellow/25 text-brand-ink dark:text-white'
                      : dontKnow
                        ? 'border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 dark:border-white/15 dark:text-neutral-400'
                        : 'border-neutral-200 bg-white/70 text-brand-ink hover:border-brand-yellow hover:bg-brand-yellow/10 dark:border-white/10 dark:bg-white/5 dark:text-white'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Result({ result, onRetake }) {
  const { topic } = useTodayTopic();
  const level = result.level ? getLevel(result.level) : null;
  const start = getLevel(result.startLevel);
  const hasStartTopics = topics.some((t) => t.level === result.startLevel);
  const allPassed = STAGES.every((s) => (result.scores[s] ?? 0) >= PASS_PER_STAGE);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10"
    >
      <p className="font-mono text-sm text-neutral-500 dark:text-neutral-400">your level</p>
      <h2 className="mt-2 text-5xl sm:text-6xl">
        {level ? (
          <>
            {level.id} <span className="text-highlight">{level.name}.</span>
          </>
        ) : (
          <>
            Just <span className="text-highlight">starting.</span>
          </>
        )}
      </h2>
      {level && (
        <p dir="rtl" lang="ar" className="mt-2 text-lg text-neutral-500 dark:text-neutral-400">
          {level.nameAr}
        </p>
      )}

      {/* Per-stage breakdown */}
      <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
        {STAGES.map((stage) => {
          const score = result.scores[stage];
          const reached = score !== undefined;
          return (
            <li key={stage} className="flex items-center gap-3">
              <LevelBadge level={stage} />
              <div className="flex-1">
                <ProgressBar value={reached ? (score / PER_STAGE) * 100 : 0} label={`${stage} score`} />
              </div>
              <span className="w-16 text-right font-mono text-sm">
                {reached ? `${score}/${PER_STAGE}` : '—'}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mx-auto mt-8 max-w-md">
        {allPassed
          ? `Excellent! You passed every stage. Start with the ${start.id} · ${start.name} topics to push further.`
          : hasStartTopics
            ? `Start with the ${start.id} · ${start.name} topics. Today's topic on the Home page now starts there.`
            : `You're ready for ${start.id}. ${start.id} topics are coming soon. Until then, the highest available topics are your path.`}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {topic && (
          <Button to={`/topics/${topic.slug}`}>
            Start: {topic.title} <ArrowRight size={16} aria-hidden="true" />
          </Button>
        )}
        <Button to={`/topics?level=${hasStartTopics ? result.startLevel : ''}`} variant="secondary">
          Browse {hasStartTopics ? start.id : ''} topics
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          <RotateCcw size={16} aria-hidden="true" /> Retake
        </Button>
      </div>
    </motion.div>
  );
}

export default function Placement() {
  const { placement, savePlacement } = usePlacement();
  const [phase, setPhase] = useState(placement ? 'result' : 'intro'); // intro | test | result
  const [stageIndex, setStageIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [count, setCount] = useState(1);

  const stage = STAGES[stageIndex];
  const stageQuestions = useMemo(() => questionsFor(stage), [stage]);

  const start = () => {
    setStageIndex(0);
    setQIndex(0);
    setScores({});
    setCount(1);
    setPhase('test');
  };

  const finish = (finalScores) => {
    savePlacement(scorePlacement(finalScores));
    setPhase('result');
  };

  const onAnswer = (correct) => {
    const nextScores = { ...scores, [stage]: (scores[stage] ?? 0) + (correct ? 1 : 0) };
    setScores(nextScores);
    setCount((c) => c + 1);

    if (qIndex + 1 < stageQuestions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    // End of a stage: continue only if it was passed
    const passed = nextScores[stage] >= PASS_PER_STAGE;
    if (passed && stageIndex + 1 < STAGES.length) {
      setStageIndex(stageIndex + 1);
      setQIndex(0);
    } else {
      finish(nextScores);
    }
  };

  return (
    <SpeechProvider>
      <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="placement-title">
        <IntroLine>Placement test</IntroLine>
        <h1 id="placement-title" className="mt-5 text-4xl sm:text-6xl">
          What&apos;s your <span className="text-highlight">level?</span>
        </h1>
        <div className="mt-10">
          {phase === 'intro' && <Intro onStart={start} previous={placement} />}
          {phase === 'test' && (
            <Question
              key={`${stage}-${qIndex}`}
              q={stageQuestions[qIndex]}
              number={count}
              total={STAGES.length * PER_STAGE}
              stageIndex={stageIndex}
              onAnswer={onAnswer}
            />
          )}
          {phase === 'result' && placement && <Result result={placement} onRetake={start} />}
        </div>
      </section>
    </SpeechProvider>
  );
}
