import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookA, Ear, Lightbulb, Mic } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import HighlightLastWord from '../components/ui/HighlightLastWord';
import MonoLine from '../components/ui/MonoLine';
import SpeakButton from '../components/speech/SpeakButton';
import MicButton from '../components/speech/MicButton';
import SpeakFeedback from '../components/speech/SpeakFeedback';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import QuizRunner from '../components/practice/QuizRunner';
import NotFound from './NotFound';
import { SOUND_GROUPS, buildListeningQuiz, getSoundGroup } from '../data/pronunciation';
import { isRecognitionSupported, useSpeakCheck } from '../hooks/useSpeechRecognition';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStreak } from '../hooks/useStreak';
import { STORAGE_KEYS } from '../utils/storage';

const TABS = [
  { id: 'learn', label: 'Learn', icon: BookA },
  { id: 'listen', label: 'Listen', icon: Ear },
  { id: 'say', label: 'Say it', icon: Mic },
];

function LearnTab({ group }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-2 border-brand-yellow bg-brand-yellow/15 p-6 shadow-soft dark:bg-brand-yellow/10">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-900 dark:text-brand-yellow">
          <Lightbulb size={14} aria-hidden="true" /> How to make the sound
        </p>
        <p dir="rtl" lang="ar" className="mt-3 text-lg leading-loose text-brand-ink dark:text-white">
          {group.tipAr}
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-brand-yellow/25 dark:bg-brand-yellow/10">
              {group.sounds.map((s) => (
                <th key={s} scope="col" className="px-4 py-3 font-mono text-sm font-semibold text-amber-900 dark:text-brand-yellow">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.pairs.map((p) => (
              <tr key={p.a} className="border-t border-neutral-200/70 dark:border-white/10">
                {[
                  [p.a, p.aAr],
                  [p.b, p.bAr],
                ].map(([word, ar]) => (
                  <td key={word} className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <SpeakButton text={word} id={`pair-${word}`} size="sm" />
                      <div>
                        <p className="font-semibold text-brand-ink dark:text-white">{word}</p>
                        <p dir="rtl" lang="ar" className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                          {ar}
                        </p>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-sm">Listen to each pair a few times, then test your ear in the Listen tab.</p>
    </div>
  );
}

function SayRow({ word, ar, partner }) {
  const check = useSpeakCheck(word);
  // Single words: the recognizer returns a real word, so hearing the partner word means the sound was off
  const heardPartner = check.result && check.result.heard.toLowerCase().includes(partner.toLowerCase());
  return (
    <li className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-extrabold tracking-tight text-brand-ink dark:text-white">{word}</p>
          <p dir="rtl" lang="ar" className="text-left text-sm text-neutral-500 dark:text-neutral-400">
            {ar} · not <span className="font-semibold">{partner}</span>
          </p>
        </div>
        <SpeakButton text={word} id={`say-model-${word}`} size="sm" label={`Hear "${word}"`} />
        <MicButton check={check} label={`Say "${word}"`} />
      </div>
      {heardPartner ? (
        <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">
          It sounded like <strong>“{partner}”</strong>. Listen to the model and try again.
        </p>
      ) : (
        <SpeakFeedback check={check} compact onRetry={check.start} />
      )}
    </li>
  );
}

function SayTab({ group }) {
  if (!isRecognitionSupported) {
    return (
      <p className="glass-card p-8 text-center">
        Speech recognition isn&apos;t available in this browser. Try Chrome or Edge to practice speaking.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-5 text-sm">
        Tap 🎤 and say each word clearly. If the app hears the other word of the pair, that sound needs more practice.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {group.pairs.flatMap((p) => [
          <SayRow key={p.a} word={p.a} ar={p.aAr} partner={p.b} />,
          <SayRow key={p.b} word={p.b} ar={p.bAr} partner={p.a} />,
        ])}
      </ul>
    </div>
  );
}

function ListenTab({ group, onBest }) {
  const { recordActivity } = useStreak();
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildListeningQuiz(group, 10), [group, round]);
  return (
    <QuizRunner
      key={round}
      exercises={questions}
      onRetry={() => setRound((r) => r + 1)}
      onFinish={(correct, total) => {
        recordActivity();
        const percent = total ? Math.round((correct / total) * 100) : 0;
        const isNewBest = onBest(percent);
        return { percent, passed: percent >= 80, isNewBest };
      }}
      messages={{
        pass: 'Great ear! Now practice saying the words in the "Say it" tab.',
        fail: 'These sounds are tricky. Listen to the pairs again in the Learn tab, then try once more.',
      }}
    />
  );
}

export default function SoundGroupPage() {
  const { id } = useParams();
  const group = getSoundGroup(id);
  const [params, setParams] = useSearchParams();
  const [scores, setScores] = useLocalStorage(STORAGE_KEYS.pronunciation, {});
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'learn';
  const setTab = useCallback((t) => setParams(t === 'learn' ? {} : { tab: t }, { replace: true }), [setParams]);

  if (!group) return <NotFound />;

  const onBest = (percent) => {
    const prev = scores[group.id]?.best;
    setScores((s) => ({ ...s, [group.id]: { best: Math.max(percent, s[group.id]?.best ?? 0) } }));
    return prev === undefined || percent > prev;
  };
  const index = SOUND_GROUPS.findIndex((g) => g.id === group.id);
  const next = SOUND_GROUPS[index + 1];

  return (
    <SpeechProvider>
      <header className="pt-6 sm:pt-10">
        <Link
          to="/pronunciation"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-200/70 hover:text-brand-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" /> All sounds
        </Link>
        <div className="mt-6 flex items-start gap-4 sm:gap-6">
          <span className="glass-card flex h-20 w-20 shrink-0 items-center justify-center text-5xl sm:h-24 sm:w-24" aria-hidden="true">
            {group.emoji}
          </span>
          <div>
            <MonoLine path="~/sounds" command={group.sounds.join(' vs ')} />
            <h1 className="mt-2 text-4xl sm:text-5xl">
              <HighlightLastWord text={group.title} />
            </h1>
            <p dir="rtl" lang="ar" className="mt-1 text-left text-lg text-neutral-600 dark:text-neutral-300">
              {group.titleAr}
            </p>
            {scores[group.id]?.best !== undefined && (
              <p className="mt-2 font-mono text-xs">best listening score: {scores[group.id].best}%</p>
            )}
          </div>
        </div>
      </header>

      <div className="mt-8 pb-10">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Sound practice" pillId="sound-tab-pill" />
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
            {tab === 'learn' && <LearnTab group={group} />}
            {tab === 'listen' && <ListenTab group={group} onBest={onBest} />}
            {tab === 'say' && <SayTab group={group} />}
          </motion.div>
        </AnimatePresence>
        {next && (
          <p className="mt-10 text-center text-sm">
            Next sound:{' '}
            <Link to={`/pronunciation/${next.id}`} className="font-semibold text-brand-gold underline underline-offset-4 dark:text-brand-yellow">
              {next.title}
            </Link>
          </p>
        )}
      </div>
    </SpeechProvider>
  );
}
