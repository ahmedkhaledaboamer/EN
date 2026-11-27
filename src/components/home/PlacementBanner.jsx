import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Clock, Headphones, ListChecks, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import LevelBadge from '../ui/LevelBadge';
import Reveal from '../ui/Reveal';
import { usePlacement } from '../../hooks/usePlacement';
import { getLevel } from '../../data/levels';
import { STAGES } from '../../data/placement';

/** Visual "ladder" of the test stages: A1 → B2, each step taller. */
function LevelLadder({ current }) {
  return (
    <div className="flex items-end gap-2 sm:gap-3" aria-hidden="true">
      {STAGES.map((id, i) => {
        const level = getLevel(id);
        const reached = current && STAGES.indexOf(current) >= i;
        return (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            whileInView={{ height: 44 + i * 30, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: 'easeOut' }}
            className={`flex w-14 flex-col items-center justify-start rounded-t-2xl pt-2 sm:w-16 ${
              reached || !current ? level.badge : 'bg-neutral-200/70 text-neutral-400 dark:bg-white/5'
            }`}
          >
            <span className="font-display text-sm font-extrabold">{id}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Home: a big invitation to the placement test (before it's taken),
 * or a compact "your level" strip with a retake link (after).
 */
export default function PlacementBanner() {
  const { placement } = usePlacement();

  if (placement) {
    const level = placement.level ? getLevel(placement.level) : null;
    return (
      <Reveal className="mt-6">
        <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/40 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200">
              <ClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold tracking-tight text-brand-ink dark:text-white">
                Your level: <LevelBadge level={placement.level ?? 'A1'} showName />
              </p>
              <p className="text-sm">
                {level ? `Your path starts at ${placement.startLevel}.` : 'Your path starts at A1.'} Feeling stronger? Test again
                anytime.
              </p>
            </div>
          </div>
          <Button to="/placement" variant="secondary" className="shrink-0">
            <RotateCcw size={16} aria-hidden="true" /> Retake the test
          </Button>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className="mb-6">
      <section
        aria-labelledby="placement-card-title"
        className="relative overflow-hidden rounded-3xl border-2 border-brand-yellow bg-white/70 p-6 shadow-lift backdrop-blur-xl sm:p-10 dark:bg-white/[0.04]"
      >
        {/* Soft brand glows inside the card */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-purple/40 blur-3xl dark:bg-violet-600/25" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-brand-yellow/30 blur-3xl dark:bg-brand-yellow/10" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-ink">
              <ClipboardCheck size={14} aria-hidden="true" /> Placement test
            </span>
            <h2 id="placement-card-title" className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
              What&apos;s your <span className="text-highlight">level?</span>
            </h2>
            <p dir="rtl" lang="ar" className="mt-2 text-left text-xl font-semibold text-brand-ink dark:text-white">
              اعرف مستواك في ٥ دقايق، وابدأ من المكان الصح.
            </p>
            <p className="mt-3 max-w-lg">
              Answer a few short questions from easy to hard. We&apos;ll tell you your level and start your learning path there.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2 text-sm">
              {[
                { icon: Clock, text: '~5 minutes' },
                { icon: ListChecks, text: 'Up to 24 questions' },
                { icon: Headphones, text: 'Includes listening' },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-medium text-brand-ink dark:bg-white/10 dark:text-white"
                >
                  <Icon size={14} aria-hidden="true" /> {text}
                </li>
              ))}
            </ul>

            <Button to="/placement" size="lg" className="mt-7">
              Find my level <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3 lg:items-end">
            <LevelLadder />
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">A1 → B2 · stops when it gets too hard</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
