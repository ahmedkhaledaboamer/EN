import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, CircleCheckBig, Layers, NotebookPen, Target, Trash2 } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import { useT } from '../hooks/useT';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import Flashcards from '../components/essentials/Flashcards';
import QuizRunner from '../components/practice/QuizRunner';
import { LoadingState } from './TopicPage';
import { SESSION_SIZE, splitKey, useReview } from '../hooks/useReview';
import { exerciseId, useMistakes } from '../hooks/useMistakes';
import { useStreak } from '../hooks/useStreak';
import { loadTopic } from '../data/topics';
import { loadEssential } from '../data/essentials';

const TABS = [
  { id: 'review', label: 'Daily review', icon: Layers },
  { id: 'mistakes', label: 'Mistakes', icon: NotebookPen },
];
const MISTAKES_PER_QUIZ = 10;

/** Resolve review keys to full word data (saved words already carry it; others are loaded lazily). */
async function loadReviewItems(keys, savedWords) {
  const saved = new Map(savedWords.map((w) => [`${w.slug}|${w.en}`, w]));
  const sources = [...new Set(keys.filter((k) => !saved.get(k)?.ar).map((k) => splitKey(k).source))];
  const words = new Map();
  await Promise.all(
    sources.map(async (source) => {
      const file = source.startsWith('essentials/')
        ? await loadEssential(source.slice('essentials/'.length))
        : await loadTopic(source);
      (file?.words ?? file?.items ?? []).forEach((w) => words.set(`${source}|${w.en}`, w));
    }),
  );
  const seenEn = new Set();
  return keys
    .map((key) => ({ key, ...(words.get(key) ?? saved.get(key)) }))
    .filter((w) => w.en && w.ar && !seenEn.has(w.en) && seenEn.add(w.en));
}

function ReviewTab() {
  const { dueKeys, dueCount, total, mastered, grade, savedWords, schedule } = useReview();
  const { recordActivity } = useStreak();
  // Freeze the session when it starts, so grading cards doesn't reshuffle it
  const [sessionKeys, setSessionKeys] = useState(null);
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!sessionKeys) return undefined;
    let alive = true;
    setItems(null);
    loadReviewItems(sessionKeys, savedWords).then((list) => alive && setItems(list));
    return () => {
      alive = false;
    };
    // savedWords only matters when the session starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKeys]);

  const keyByEn = useMemo(() => Object.fromEntries((items ?? []).map((i) => [i.en, i.key])), [items]);
  const nextDue = useMemo(() => {
    const dates = Object.values(schedule).map((s) => s.due).sort();
    return dates[0] ?? null;
  }, [schedule]);

  const stats = (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Due today', value: dueCount, icon: CalendarCheck },
        { label: 'In your deck', value: total, icon: Layers },
        { label: 'Mastered', value: mastered, icon: CircleCheckBig },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="glass-card flex items-center gap-3 p-4">
          <Icon size={20} className="text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className="font-display text-2xl font-extrabold tracking-tightest text-brand-ink dark:text-white">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (sessionKeys) {
    if (!items) return <LoadingState />;
    return (
      <div>
        <Flashcards
          key={sessionKeys.join()}
          items={items}
          isLearned={() => false}
          setLearned={(en, knew) => keyByEn[en] && grade(keyByEn[en], knew)}
          onActivity={recordActivity}
        />
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setSessionKeys(null)}>
            Finish review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats}
      <div className="glass-card p-6 text-center sm:p-10">
        {total === 0 ? (
          <>
            <h2 className="text-2xl sm:text-3xl">
              Your deck is <span className="text-highlight">empty.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md">
              Words you mark with <strong>Got it</strong> or bookmark are added here, and come back at the right time:
              after 1 day, 3 days, a week, two weeks, then a month.
            </p>
            <Button to="/topics" className="mt-6">
              Learn some words
            </Button>
          </>
        ) : dueCount === 0 ? (
          <>
            <h2 className="text-2xl sm:text-3xl">
              All caught <span className="text-highlight">up!</span>
            </h2>
            <p className="mt-3">Nothing to review today.{nextDue && ` Next review: ${nextDue}.`}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl">
              {dueCount} {dueCount === 1 ? 'word' : 'words'} to <span className="text-highlight">review.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md">
              Flip each card. "I know it" sends the word further away; "Still learning" brings it back tomorrow.
              {dueCount > SESSION_SIZE && ` Today's session: ${SESSION_SIZE} cards.`}
            </p>
            <Button className="mt-6" onClick={() => setSessionKeys(dueKeys.slice(0, SESSION_SIZE))}>
              <Layers size={16} aria-hidden="true" /> Start review
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

const TYPE_LABELS = {
  mcq: 'Multiple choice',
  fill: 'Fill in the blank',
  order: 'Put in order',
  listen: 'Listen & type',
  speak: 'Say it',
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function promptText(ex) {
  if (ex.type === 'mcq') return ex.audio ? `🔊 ${ex.audio}` : ex.question;
  if (ex.type === 'fill') return ex.sentence;
  if (ex.type === 'order') return ex.words.join(' / ');
  if (ex.type === 'listen') return `🔊 ${ex.audioText}`;
  if (ex.type === 'speak') return ex.hideAnswer ? `🎤 ${ex.note}` : `🎤 ${ex.answer}`;
  return ex.answer;
}

function MistakesTab() {
  const { mistakes, recordAnswer, removeMistake, clearMistakes } = useMistakes();
  const { recordActivity } = useStreak();
  const [round, setRound] = useState(null);

  const sourceById = useMemo(() => Object.fromEntries(mistakes.map((m) => [m.id, m.source])), [mistakes]);
  // Snapshot the questions when a practice round starts
  const exercises = useMemo(
    () => (round === null ? [] : mistakes.slice(0, MISTAKES_PER_QUIZ).map((m) => m.exercise)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );

  if (round !== null && exercises.length) {
    return (
      <QuizRunner
        key={round}
        exercises={exercises}
        onAnswer={(ex, answer) => recordAnswer(ex, answer, sourceById[exerciseId(ex)])}
        onFinish={(correct, total) => {
          recordActivity();
          const percent = total ? Math.round((correct / total) * 100) : 0;
          return { percent, passed: percent >= 70, isNewBest: false };
        }}
        onRetry={() => setRound((r) => r + 1)}
        review={{ label: 'Back to my notebook', onClick: () => setRound(null) }}
        messages={{
          pass: 'Nice! Every question you got right was removed from your notebook.',
          fail: 'Correct answers were removed from your notebook. Keep going!',
        }}
      />
    );
  }

  if (!mistakes.length) {
    return (
      <div className="glass-card p-8 text-center sm:p-10">
        <h2 className="text-2xl sm:text-3xl">
          No mistakes <span className="text-highlight">yet.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md">
          When you get a question wrong in Practice or a quiz, it's saved here. Answer it correctly later and it disappears.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="text-brand-ink dark:text-white">{plural(mistakes.length, 'question')}</strong> to fix.
          Answer correctly to clear them.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setRound(0)}>
            <Target size={16} aria-hidden="true" /> Practice {plural(Math.min(mistakes.length, MISTAKES_PER_QUIZ), 'mistake')}
          </Button>
          <Button variant="ghost" onClick={() => window.confirm('Clear your whole mistakes notebook?') && clearMistakes()}>
            Clear all
          </Button>
        </div>
      </div>

      <ul className="space-y-3">
        {mistakes.map((m) => (
          <li key={m.id} className="glass-card flex items-start gap-4 p-4">
            <span className="text-2xl" aria-hidden="true">
              {m.source?.emoji ?? '📝'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {m.source?.to ? (
                  <Link to={m.source.to} className="font-semibold hover:underline">
                    {m.source.title}
                  </Link>
                ) : (
                  m.source?.title ?? 'Quiz'
                )}
                {' · '}
                {m.exercise.label ?? TYPE_LABELS[m.exercise.type] ?? m.exercise.type} · missed {m.misses}×
              </p>
              <p className="mt-1 truncate font-medium text-brand-ink dark:text-white">{promptText(m.exercise)}</p>
              <p className="mt-0.5 text-sm">
                Answer: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{m.exercise.answer}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeMistake(m.id)}
              aria-label="Remove from notebook"
              title="Remove"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Review() {
  const t = useT();
  const { dueCount } = useReview();
  const { mistakesCount } = useMistakes();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'review';
  const setTab = useCallback((id) => setParams(id === 'review' ? {} : { tab: id }, { replace: true }), [setParams]);
  const tabs = TABS.map((t) => ({
    ...t,
    label: `${t.label} · ${t.id === 'review' ? dueCount : mistakesCount}`,
  }));

  return (
    <SpeechProvider>
      <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="review-title">
        <IntroLine>{t("Remember what you learn")}</IntroLine>
        <h1 id="review-title" className="mt-5 text-4xl sm:text-6xl">
          {t("Daily")} <span className="text-highlight">{t("review.")}</span>
        </h1>
        <p className="mt-4 max-w-xl">
          Spaced repetition brings each word back just before you forget it. Your mistakes from every quiz are collected
          here too.
        </p>

        <div className="mt-8">
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Review sections" pillId="review-tab-pill" />
          <SpeechNotice />
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              {tab === 'review' ? <ReviewTab /> : <MistakesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </SpeechProvider>
  );
}
