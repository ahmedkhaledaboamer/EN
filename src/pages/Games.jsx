import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Puzzle, RotateCcw, SpellCheck, Trophy, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import LoadingState from '../components/ui/LoadingState';
import MatchGame from '../components/games/MatchGame';
import SpeedRound from '../components/games/SpeedRound';
import SpellingGame from '../components/games/SpellingGame';
import { LEVELS } from '../data/levels';
import { MIN_GAME_WORDS, useGameSources, useGameWords } from '../hooks/useGameWords';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStreak } from '../hooks/useStreak';
import { useT } from '../hooks/useT';
import { STORAGE_KEYS } from '../utils/storage';
import { cleanWords } from '../utils/games';

export const GAMES = [
  {
    id: 'match',
    title: 'Match',
    descAr: 'وصّل كل كلمة بمعناها في أسرع وقت.',
    desc: 'Connect each word with its meaning, fast.',
    icon: Puzzle,
    Component: MatchGame,
    lowerIsBetter: true,
    unit: 's',
  },
  {
    id: 'speed',
    title: 'Speed round',
    descAr: '٦٠ ثانية: جاوب صح على أكبر عدد كلمات.',
    desc: '60 seconds: as many right answers as you can.',
    icon: Zap,
    Component: SpeedRound,
  },
  {
    id: 'spelling',
    title: 'Spelling',
    descAr: 'اسمع الكلمة واكتبها حرف حرف.',
    desc: 'Hear the word and type it letter by letter.',
    icon: SpellCheck,
    Component: SpellingGame,
  },
];

function SourcePicker({ value, onChange }) {
  const t = useT();
  const { myCount, today, topics, essentials } = useGameSources();
  return (
    <div className="glass-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
      <label htmlFor="game-source" className="shrink-0 text-sm font-semibold text-brand-ink dark:text-white">
        {t('Words from:')}
      </label>
      <select
        id="game-source"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-2xl border-2 border-transparent bg-white/80 px-4 py-2.5 text-brand-ink outline-none focus:border-brand-yellow dark:bg-white/5 dark:text-white"
      >
        <option value="mine" disabled={myCount < MIN_GAME_WORDS}>
          {t('My words (learned & saved)')} · {myCount}
        </option>
        {today && <option value={`topic:${today.slug}`}>{t("Today's topic")}: {today.title}</option>}
        {LEVELS.map((l) => {
          const list = topics.filter((x) => x.level === l.id);
          return list.length ? (
            <optgroup key={l.id} label={`${t('Topics')} · ${l.id}`}>
              {list.map((x) => (
                <option key={x.slug} value={`topic:${x.slug}`}>
                  {x.emoji} {x.title}
                </option>
              ))}
            </optgroup>
          ) : null;
        })}
        <optgroup label={t('Essentials')}>
          {essentials.map((x) => (
            <option key={x.slug} value={`essentials:${x.slug}`}>
              {x.emoji} {x.title}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

function Result({ game, result, best, isNewBest, onAgain, onBack }) {
  const t = useT();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <Trophy size={36} className="mx-auto text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
      <p className="mt-4 font-display text-6xl font-extrabold tracking-tightest text-brand-ink dark:text-white">{result.label}</p>
      {result.detail && <p className="mt-1 text-sm">{result.detail}</p>}
      {result.mistakes !== undefined && <p className="mt-1 text-sm">{t('mistakes')}: {result.mistakes}</p>}
      <p className="mt-3">
        {isNewBest ? (
          <span className="rounded-full bg-brand-yellow px-3 py-1 font-bold text-brand-ink">🎉 {t('New best score')}</span>
        ) : (
          <span className="font-mono text-sm">
            {t('Best')}: {best}
            {game.unit ?? ''}
          </span>
        )}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onAgain}>
          <RotateCcw size={16} aria-hidden="true" /> {t('Play again')}
        </Button>
        <Button variant="secondary" onClick={onBack}>
          {t('Other games')}
        </Button>
      </div>
    </motion.div>
  );
}

export default function Games() {
  const t = useT();
  const { defaultSource } = useGameSources();
  const [params, setParams] = useSearchParams();
  const [source, setSource] = useState(null);
  const activeSource = source ?? defaultSource;
  const { status, words } = useGameWords(activeSource);
  const [bests, setBests] = useLocalStorage(STORAGE_KEYS.games, {});
  const { recordActivity } = useStreak();
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);

  const game = GAMES.find((g) => g.id === params.get('game'));
  const openGame = (id) => {
    setResult(null);
    setRound((r) => r + 1);
    setParams(id ? { game: id } : {}, { replace: false });
  };

  const onFinish = useCallback(
    (r) => {
      recordActivity();
      const prev = bests[game.id];
      const better = prev === undefined || (game.lowerIsBetter ? r.score < prev : r.score > prev);
      if (better) setBests((b) => ({ ...b, [game.id]: r.score }));
      setResult({ ...r, isNewBest: better && (prev !== undefined || r.score > 0), best: better ? r.score : prev });
    },
    [bests, game, recordActivity, setBests],
  );

  const enough = cleanWords(words).length >= MIN_GAME_WORDS;

  return (
    <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="games-title">
      <IntroLine>{t('Learn while you play')}</IntroLine>
      <h1 id="games-title" className="mt-5 text-4xl sm:text-6xl">
        {t('Quick')} <span className="text-highlight">{t('games.')}</span>
      </h1>

      <div className="mt-8">
        <SourcePicker
          value={activeSource}
          onChange={(v) => {
            setSource(v);
            setResult(null);
            setRound((r) => r + 1);
          }}
        />
      </div>

      {!game ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {GAMES.map((g) => (
            <li key={g.id}>
              <motion.button
                type="button"
                whileHover={{ y: -6 }}
                onClick={() => openGame(g.id)}
                className="glass-card flex h-full w-full flex-col items-start p-6 text-left transition-shadow hover:shadow-lift"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow">
                  <g.icon size={26} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl">{t(g.title)}</h2>
                <p className="mt-1 text-sm">{g.desc}</p>
                <p dir="rtl" lang="ar" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {g.descAr}
                </p>
                {bests[g.id] !== undefined && (
                  <p className="mt-3 font-mono text-xs">
                    🏆 {t('Best')}: {bests[g.id]}
                    {g.unit ?? ''}
                  </p>
                )}
              </motion.button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto mt-8 max-w-2xl">
          <button
            type="button"
            onClick={() => openGame(null)}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-200/70 hover:text-brand-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> {t('All games')}
          </button>
          <div className="glass-card p-5 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-2xl">
              <game.icon size={22} className="text-brand-gold dark:text-brand-yellow" aria-hidden="true" /> {t(game.title)}
            </h2>
            {status === 'loading' ? (
              <LoadingState />
            ) : !enough ? (
              <p className="text-center">{t('Not enough words in this list. Pick another one above.')}</p>
            ) : result ? (
              <Result
                game={game}
                result={result}
                best={result.best}
                isNewBest={result.isNewBest}
                onAgain={() => {
                  setResult(null);
                  setRound((r) => r + 1);
                }}
                onBack={() => openGame(null)}
              />
            ) : (
              <game.Component key={`${game.id}-${round}-${activeSource}`} words={words} onFinish={onFinish} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
