import { useMemo, useRef, useState } from 'react';
import { Award, Download, Lock, Table2 } from 'lucide-react';
import IntroLine from '../components/ui/IntroLine';
import { useT } from '../hooks/useT';
import Button from '../components/ui/Button';
import LevelBadge from '../components/ui/LevelBadge';
import ProgressBar from '../components/ui/ProgressBar';
import { topics } from '../data/topics';
import { essentials } from '../data/essentials';
import { LEVELS, getLevel } from '../data/levels';
import { useProgress } from '../hooks/useProgress';
import { useEssentialsProgress } from '../hooks/useEssentialsProgress';
import { useStreak } from '../hooks/useStreak';
import { useReview } from '../hooks/useReview';
import { usePlacement } from '../hooks/usePlacement';
import { useActivityLog } from '../hooks/useActivityLog';
import { useSettings } from '../hooks/useSettings';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { buildCalendar, computeBadges, dayScore, wordsPerWeek } from '../utils/achievements';
import { downloadCertificate } from '../utils/certificate';

// Sequential one-hue ramps (validated with the dataviz ordinal checks: monotone, ΔL ≥ 0.06, light end ≥ 2:1)
const CELL = [
  'bg-neutral-200/80 dark:bg-white/[0.06]',
  'bg-[#D6A11E] dark:bg-[#6B5212]',
  'bg-[#B07E08] dark:bg-[#9C7414]',
  'bg-[#875F00] dark:bg-[#D4A017]',
  'bg-[#5C4000] dark:bg-[#FDC52B]',
];
const BAR = 'bg-[#B07E08] dark:bg-[#FDC52B]';
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtDate = (key, opts = { month: 'short', day: 'numeric' }) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts);
};

/** Shared hover tooltip, positioned inside a relative container. */
function useTooltip() {
  const boxRef = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, lines) => {
    const box = boxRef.current?.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    if (!box) return;
    setTip({ x: r.left - box.left + r.width / 2, y: r.top - box.top, lines });
  };
  const hide = () => setTip(null);
  const node = tip && (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-brand-ink px-3 py-2 text-xs text-white shadow-lift dark:bg-white dark:text-brand-ink"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      {tip.lines.map((l, i) => (
        <div key={i} className={i === 0 ? 'font-semibold' : 'opacity-80'}>
          {l}
        </div>
      ))}
    </div>
  );
  return { boxRef, show, hide, node };
}

function Tile({ label, value, sub }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-4xl font-extrabold tracking-tightest text-brand-ink dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{sub}</p>}
    </div>
  );
}

function ActivityCalendar({ log, showTable }) {
  const columns = useMemo(() => buildCalendar(log, 18), [log]);
  const { boxRef, show, hide, node } = useTooltip();
  const active = columns.flat().filter((c) => c.score > 0 && !c.future);

  return (
    <div>
      <div ref={boxRef} className="relative overflow-x-auto pb-1">
        <div className="flex gap-[3px]" role="img" aria-label={`Study calendar: ${active.length} active days in the last 18 weeks`}>
          <div className="mr-1 flex flex-col gap-[3px] pt-5 text-[10px] text-neutral-500 dark:text-neutral-400">
            {DAYS.map((d, i) => (
              <span key={d} className="flex h-[14px] items-center">
                {i % 2 ? d : ''}
              </span>
            ))}
          </div>
          {columns.map((col, w) => (
            <div key={col[0].date} className="flex flex-col gap-[3px]">
              <span className="h-[17px] text-[10px] text-neutral-500 dark:text-neutral-400">
                {w % 4 === 0 ? fmtDate(col[0].date, { month: 'short' }) : ''}
              </span>
              {col.map((cell) => (
                <span
                  key={cell.date}
                  onMouseEnter={(e) =>
                    !cell.future &&
                    show(e, [
                      fmtDate(cell.date, { weekday: 'short', month: 'short', day: 'numeric' }),
                      cell.score ? `${plural(cell.words, 'word')} · ${plural(log[cell.date]?.sessions ?? 0, 'session')}` : 'No activity',
                    ])
                  }
                  onMouseLeave={hide}
                  className={`h-[14px] w-[14px] rounded-[4px] ${cell.future ? 'opacity-0' : CELL[cell.level]}`}
                />
              ))}
            </div>
          ))}
        </div>
        {node}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        Less
        {CELL.map((c, i) => (
          <span key={i} className={`h-[12px] w-[12px] rounded-[3px] ${c}`} aria-hidden="true" />
        ))}
        More
      </div>
      {showTable && (
        <table className="mt-4 w-full text-left text-sm">
          <caption className="mb-2 text-left font-semibold text-brand-ink dark:text-white">Active days</caption>
          <thead>
            <tr className="text-xs text-neutral-500">
              <th className="py-1">Date</th>
              <th className="py-1">Words</th>
              <th className="py-1">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {active.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2">
                  No activity yet.
                </td>
              </tr>
            )}
            {[...active].reverse().map((c) => (
              <tr key={c.date} className="border-t border-neutral-200/70 dark:border-white/10">
                <td className="py-1">{fmtDate(c.date, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                <td className="py-1">{c.words}</td>
                <td className="py-1">{log[c.date]?.sessions ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function WeeklyChart({ log, showTable }) {
  const weeks = useMemo(() => wordsPerWeek(log, 10), [log]);
  const max = Math.max(1, ...weeks.map((w) => w.words));
  const maxIndex = weeks.findIndex((w) => w.words === max);
  const { boxRef, show, hide, node } = useTooltip();
  const last = weeks.length - 1;

  return (
    <div>
      <div ref={boxRef} className="relative">
        <div className="flex h-44 items-end gap-1.5 border-b border-neutral-300 dark:border-white/15" role="img" aria-label={`Words learned per week, last 10 weeks. This week: ${weeks[last].words}.`}>
          {weeks.map((w, i) => {
            const labelled = i === last || (i === maxIndex && w.words > 0);
            return (
              <div
                key={w.start}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={(e) => show(e, [`Week of ${fmtDate(w.start)}`, `${plural(w.words, 'word')} learned`])}
                onMouseLeave={hide}
              >
                {labelled && <span className="mb-1 text-xs font-semibold text-brand-ink dark:text-white">{w.words}</span>}
                <div
                  className={`w-full max-w-[38px] rounded-t-[4px] transition-opacity group-hover:opacity-80 ${BAR}`}
                  style={{ height: `${(w.words / max) * 100}%`, minHeight: w.words ? 4 : 0 }}
                />
              </div>
            );
          })}
        </div>
        {node}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
        {weeks.map((w, i) => (
          <span key={w.start} className="flex-1 text-center">
            {i % 2 === 1 || i === last ? fmtDate(w.start) : ''}
          </span>
        ))}
      </div>
      {showTable && (
        <table className="mt-4 w-full text-left text-sm">
          <caption className="mb-2 text-left font-semibold text-brand-ink dark:text-white">Words per week</caption>
          <tbody>
            {[...weeks].reverse().map((w) => (
              <tr key={w.start} className="border-t border-neutral-200/70 dark:border-white/10">
                <td className="py-1">Week of {fmtDate(w.start)}</td>
                <td className="py-1 text-right font-mono">{w.words}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Certificates({ levelStats }) {
  const { settings, update } = useSettings();
  const [busy, setBusy] = useState(null);
  const [preview, setPreview] = useState(null);
  const name = settings.learnerName.trim();

  const download = async (levelId) => {
    if (!name) return;
    setBusy(levelId);
    try {
      const canvas = await downloadCertificate({
        name,
        level: getLevel(levelId),
        topicsCount: levelStats[levelId].total,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
      setPreview(canvas.toDataURL('image/png'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-5 max-w-sm">
        <label htmlFor="learner-name" className="mb-1.5 block text-sm font-medium text-brand-ink dark:text-white">
          Name on your certificates
        </label>
        <input
          id="learner-name"
          value={settings.learnerName}
          onChange={(e) => update({ learnerName: e.target.value.slice(0, 40) })}
          placeholder="Your full name"
          className="w-full rounded-full border-2 border-transparent bg-white/80 px-4 py-2.5 text-brand-ink outline-none focus:border-brand-yellow dark:bg-white/5 dark:text-white"
        />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEVELS.filter((l) => levelStats[l.id]?.total).map((l) => {
          const { done, total } = levelStats[l.id];
          const earned = done >= total;
          return (
            <li key={l.id} className={`glass-card p-5 ${earned ? 'ring-2 ring-brand-yellow' : ''}`}>
              <div className="flex items-center justify-between">
                <LevelBadge level={l.id} showName />
                {earned ? <Award size={22} className="text-brand-gold dark:text-brand-yellow" aria-hidden="true" /> : <Lock size={18} className="text-neutral-400" aria-hidden="true" />}
              </div>
              <p className="mb-2 mt-4 text-sm">
                {done}/{total} topics completed
              </p>
              <ProgressBar value={(done / total) * 100} label={`${l.id} certificate progress`} />
              <Button
                size="sm"
                className="mt-4 w-full"
                variant={earned ? 'primary' : 'secondary'}
                disabled={!earned || !name || busy === l.id}
                onClick={() => download(l.id)}
              >
                <Download size={14} aria-hidden="true" />
                {earned ? (name ? (busy === l.id ? 'Preparing…' : 'Download certificate') : 'Add your name first') : 'Complete all topics to unlock'}
              </Button>
            </li>
          );
        })}
      </ul>
      {preview && (
        <figure className="glass-card mt-6 p-4">
          <img src={preview} alt="Your certificate" className="w-full rounded-2xl" />
          <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Downloaded. You can share it or print it.
          </figcaption>
        </figure>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const t = useT();
  const topicProgress = useProgress();
  const essentialsProgress = useEssentialsProgress();
  const { streak, best } = useStreak();
  const { mastered } = useReview();
  const { placement } = usePlacement();
  const { log } = useActivityLog();
  const [sounds] = useLocalStorage(STORAGE_KEYS.pronunciation, {});
  const [showTable, setShowTable] = useState(false);

  const levelStats = useMemo(() => {
    const out = {};
    LEVELS.forEach((l) => {
      const list = topics.filter((t) => t.level === l.id);
      out[l.id] = { total: list.length, done: list.filter((t) => topicProgress.progress[t.slug]?.completed).length };
    });
    return out;
  }, [topicProgress.progress]);

  const activeDays = Object.values(log).filter((d) => dayScore(d) > 0).length;
  const wordsLearned = topicProgress.learnedTotal + essentialsProgress.learnedTotal;
  const badges = computeBadges({
    wordsLearned,
    topicsCompleted: topicProgress.completedCount,
    essentialsCompleted: essentialsProgress.completedCount,
    bestStreak: best,
    mastered,
    placementTaken: Boolean(placement),
    activeDays,
    soundsPracticed: Object.keys(sounds).length,
    levels: levelStats,
  });
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="progress-title">
      <IntroLine>{t("Your journey")}</IntroLine>
      <h1 id="progress-title" className="mt-5 text-4xl sm:text-6xl">
        {t("My")} <span className="text-highlight">{t("progress.")}</span>
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Words learned" value={wordsLearned} sub="topics + essentials" />
        <Tile label="Topics completed" value={`${topicProgress.completedCount}/${topics.length}`} sub={`${essentialsProgress.completedCount}/${essentials.length} essentials`} />
        <Tile label="Current streak" value={`${streak}d`} sub={`best ${best} days · ${activeDays} study days`} />
        <Tile label="Badges" value={`${unlocked}/${badges.length}`} sub={placement?.level ? `level ${placement.level}` : 'take the placement test'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="text-xl">Study calendar</h2>
          <p className="mb-4 text-sm">Each square is a day. Darker = more words and sessions.</p>
          <ActivityCalendar log={log} showTable={showTable} />
        </div>
        <div className="glass-card p-5 sm:p-6">
          <h2 className="text-xl">Words learned per week</h2>
          <p className="mb-4 text-sm">Last 10 weeks.</p>
          <WeeklyChart log={log} showTable={showTable} />
        </div>
      </div>
      <div className="mt-3 text-right">
        <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
          <Table2 size={14} aria-hidden="true" /> {showTable ? 'Hide tables' : 'Show as table'}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl sm:text-3xl">
          Badges <span className="text-highlight">{unlocked}</span>
          <span className="text-neutral-400">/{badges.length}</span>
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <li
              key={b.id}
              className={`glass-card flex flex-col items-center p-4 text-center ${b.unlocked ? '' : 'opacity-70'}`}
              aria-label={`${b.title}: ${b.unlocked ? 'unlocked' : `${b.value} of ${b.target}`}`}
            >
              <span className={`text-4xl ${b.unlocked ? '' : 'grayscale'}`} aria-hidden="true">
                {b.emoji}
              </span>
              <p className="mt-2 text-sm font-semibold text-brand-ink dark:text-white">{b.title}</p>
              <p dir="rtl" lang="ar" className="text-xs text-neutral-500 dark:text-neutral-400">
                {b.titleAr}
              </p>
              {b.unlocked ? (
                <span className="mt-2 rounded-full bg-brand-yellow px-2 py-0.5 text-[11px] font-bold text-brand-ink">Unlocked</span>
              ) : (
                <div className="mt-2 w-full">
                  <ProgressBar value={(b.value / b.target) * 100} label={`${b.title} progress`} />
                  <p className="mt-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    {b.value}/{b.target}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl sm:text-3xl">
          <span className="text-highlight">Certificates</span>
        </h2>
        <p className="mb-5 mt-2">Complete every topic of a level to earn its certificate.</p>
        <Certificates levelStats={levelStats} />
      </div>
    </section>
  );
}
