import { ArrowRight, ClipboardCheck } from 'lucide-react';
import Button from '../ui/Button';
import LevelBadge from '../ui/LevelBadge';
import Reveal from '../ui/Reveal';
import { usePlacement } from '../../hooks/usePlacement';

/** Invites new learners to the placement test; after it, shows their level with a retake link. */
export default function PlacementBanner() {
  const { placement } = usePlacement();

  if (placement) {
    return (
      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        Your level: <LevelBadge level={placement.level ?? 'A1'} showName />
        <Button to="/placement" variant="ghost" size="sm">
          Retake the test
        </Button>
      </p>
    );
  }

  return (
    <Reveal className="mt-6">
      <div className="glass-card flex flex-col gap-4 border-l-4 !border-l-brand-purple p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/40 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200">
            <ClipboardCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-brand-ink dark:text-white">
              Not sure where to start?
            </p>
            <p className="text-sm">Take the 5-minute placement test and we&apos;ll start you at the right level.</p>
          </div>
        </div>
        <Button to="/placement" className="shrink-0">
          Find my level <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </Reveal>
  );
}
