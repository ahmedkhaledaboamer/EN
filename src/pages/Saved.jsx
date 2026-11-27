import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bookmark, BookmarkX, Layers, List, Search, Target, X } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import SpeakButton from '../components/speech/SpeakButton';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import Flashcards from '../components/essentials/Flashcards';
import QuizRunner from '../components/practice/QuizRunner';
import { getTopicMeta } from '../data/topics';
import { getEssentialMeta } from '../data/essentials';
import { ESSENTIALS_PREFIX, useSavedWords } from '../hooks/useSavedWords';
import { useProgress } from '../hooks/useProgress';
import { useEssentialsProgress } from '../hooks/useEssentialsProgress';
import { useStreak } from '../hooks/useStreak';
import { useMistakes } from '../hooks/useMistakes';
import { buildEssentialsQuiz } from '../utils/quiz';
import { isSpeechSupported } from '../utils/speech';
import { isRecognitionSupported } from '../hooks/useSpeechRecognition';

const TABS = [
  { id: 'list', label: 'List', icon: List },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: Target },
];
const SOURCES = [
  { id: 'all', label: 'All' },
  { id: 'topic', label: 'Topics' },
  { id: 'essentials', label: 'Essentials' },
];
const MIN_QUIZ_WORDS = 4;

/** Where a saved word comes from: { kind, slug, meta, to } */
function sourceOf(saved) {
  if (saved.slug.startsWith(ESSENTIALS_PREFIX)) {
    const slug = saved.slug.slice(ESSENTIALS_PREFIX.length);
    return { kind: 'essentials', slug, meta: getEssentialMeta(slug), to: `/essentials/${slug}` };
  }
  return { kind: 'topic', slug: saved.slug, meta: getTopicMeta(saved.slug), to: `/topics/${saved.slug}` };
}

function EmptyState() {
  return (
    <div className="glass-card mx-auto max-w-xl p-8 text-center sm:p-12">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/40 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200">
        <Bookmark size={28} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-3xl">
        No saved words <span className="text-highlight">yet.</span>
      </h2>
      <p className="mt-3">
        Tap the bookmark on any word card to keep it here. Then review your list with flashcards and a quiz.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to="/topics">
          Browse topics <ArrowRight size={16} aria-hidden="true" />
        </Button>
        <Button to="/essentials" variant="secondary">
          Essentials
        </Button>
      </div>
    </div>
  );
}

function SavedRow({ word, onRemove }) {
  return (
    <li className="glass-card flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-extrabold tracking-tight text-brand-ink dark:text-white">
          {word.en}
        </p>
        {word.phonetic && <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{word.phonetic}</p>}
        <p dir="rtl" lang="ar" className="mt-1 text-right text-neutral-600 dark:text-neutral-300">
          {word.ar}
        </p>
      </div>
      <SpeakButton text={word.en} id={`saved-${word.slug}-${word.en}`} size="sm" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove "${word.en}" from saved words`}
        title="Remove"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
      >
        <BookmarkX size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

function ListTab({ savedWords, removeSaved }) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');

  // Group by source, most recently saved group first
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();
    [...savedWords]
      .sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))
      .forEach((w) => {
        const src = sourceOf(w);
        if (source !== 'all' && src.kind !== source) return;
        if (q && !w.en.toLowerCase().includes(q) && !(w.ar ?? '').includes(query.trim())) return;
        if (!map.has(w.slug)) map.set(w.slug, { src, words: [] });
        map.get(w.slug).words.push(w);
      });
    return [...map.values()];
  }, [savedWords, query, source]);

  return (
    <div>
      <div className="glass-card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <label htmlFor="saved-search" className="sr-only">
            Search saved words
          </label>
          <input
            id="saved-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in English or Arabic…"
            className="w-full rounded-full border-2 border-transparent bg-white/80 py-2.5 pl-11 pr-10 text-brand-ink outline-none placeholder:text-neutral-400 focus:border-brand-yellow dark:bg-white/5 dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-neutral-200/70 dark:hover:bg-white/10"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Filter by source" className="flex gap-1.5">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(s.id)}
              aria-pressed={source === s.id}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                source === s.id
                  ? 'bg-brand-yellow text-brand-ink shadow-yellow'
                  : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="glass-card p-8 text-center">No saved words match.</p>
      ) : (
        <div className="space-y-10">
          {groups.map(({ src, words }) => (
            <section key={`${src.kind}-${src.slug}`} aria-label={src.meta?.title ?? src.slug}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {src.meta?.emoji ?? '📘'}
                </span>
                <h2 className="text-xl sm:text-2xl">
                  {src.meta ? (
                    <Link to={src.to} className="hover:underline hover:decoration-brand-yellow hover:decoration-2 hover:underline-offset-4">
                      {src.meta.title}
                    </Link>
                  ) : (
                    src.slug
                  )}
                </h2>
                <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  {src.kind === 'essentials' ? 'essentials' : 'topic'} · {words.length}
                </span>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {words.map((w) => (
                  <SavedRow key={w.en} word={w} onRemove={() => removeSaved(w.slug, w.en)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Locked({ count }) {
  return (
    <div className="glass-card mx-auto max-w-xl p-8 text-center">
      <p className="font-mono text-sm">savedWords.length &lt; {MIN_QUIZ_WORDS}</p>
      <p className="mt-2">
        Save at least {MIN_QUIZ_WORDS} words to unlock the quiz. You have {count}.
      </p>
    </div>
  );
}

export default function Saved() {
  const { savedWords, removeSaved } = useSavedWords();
  const topicProgress = useProgress();
  const essentialsProgress = useEssentialsProgress();
  const { recordActivity } = useStreak();
  const { recordAnswer } = useMistakes();
  const [params, setParams] = useSearchParams();
  const [round, setRound] = useState(0);

  const requested = params.get('tab');
  const tab = TABS.some((t) => t.id === requested) ? requested : 'list';
  const setTab = useCallback(
    (id) => setParams(id === 'list' ? {} : { tab: id }, { replace: true }),
    [setParams],
  );

  // One card per English word (the same word can be saved from two places)
  const unique = useMemo(() => {
    const seen = new Set();
    return savedWords.filter((w) => (seen.has(w.en) ? false : (seen.add(w.en), true)));
  }, [savedWords]);
  const byEn = useMemo(() => Object.fromEntries(unique.map((w) => [w.en, w])), [unique]);

  // "Known" on a flashcard updates the progress of the word's own topic / category
  const progressFor = (w) => (sourceOf(w).kind === 'essentials' ? essentialsProgress : topicProgress);
  const isLearned = (en) => {
    const w = byEn[en];
    return w ? progressFor(w).isWordLearned(sourceOf(w).slug, en) : false;
  };
  const setLearned = (en, value) => {
    const w = byEn[en];
    if (w) progressFor(w).setWordLearned(sourceOf(w).slug, en, value);
  };

  const questions = useMemo(
    () =>
      unique.length >= MIN_QUIZ_WORDS
        ? buildEssentialsQuiz(unique, 10, { listen: isSpeechSupported, speak: isRecognitionSupported })
        : [],
    // `round` builds a fresh quiz on retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unique, round],
  );

  const onFinish = (correct, total) => {
    recordActivity();
    const percent = total ? Math.round((correct / total) * 100) : 0;
    return { percent, passed: percent >= 70, isNewBest: false };
  };

  const panels = {
    list: <ListTab savedWords={savedWords} removeSaved={removeSaved} />,
    flashcards: <Flashcards key={unique.length} items={unique} isLearned={isLearned} setLearned={setLearned} onActivity={recordActivity} />,
    quiz:
      unique.length < MIN_QUIZ_WORDS ? (
        <Locked count={unique.length} />
      ) : (
        <QuizRunner
          key={round}
          exercises={questions}
          onFinish={onFinish}
          onAnswer={(ex, answer) => recordAnswer(ex, answer, { title: 'Saved words', emoji: '🔖', to: '/saved?tab=quiz' })}
          onRetry={() => setRound((r) => r + 1)}
          review={{ label: 'Back to my list', onClick: () => setTab('list') }}
          messages={{
            pass: 'Great! Your saved words are sticking.',
            fail: 'Review your list and the flashcards, then try a new quiz.',
          }}
        />
      ),
  };

  return (
    <SpeechProvider>
      <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="saved-title">
        <IntroLine>Your word list</IntroLine>
        <h1 id="saved-title" className="mt-5 text-4xl sm:text-6xl">
          Saved <span className="text-highlight">words.</span>
        </h1>
        <p className="mt-4 font-mono text-sm">
          {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} · from topics and essentials
        </p>

        <div className="mt-8">
          {savedWords.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <Tabs tabs={TABS} active={tab} onChange={setTab} label="Saved words sections" pillId="saved-tab-pill" />
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
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-4"
                >
                  {panels[tab]}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </SpeechProvider>
  );
}
