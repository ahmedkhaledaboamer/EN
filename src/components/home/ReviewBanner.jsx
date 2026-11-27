import { ArrowRight, Layers } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { useReview } from '../../hooks/useReview';
import { useMistakes } from '../../hooks/useMistakes';
import { useT } from '../../hooks/useT';

/** Reminder on Home when words are due for review or mistakes are waiting. Hidden otherwise. */
export default function ReviewBanner() {
  const { dueCount } = useReview();
  const { mistakesCount } = useMistakes();
  const t = useT();
  if (!dueCount && !mistakesCount) return null;

  const parts = [];
  if (dueCount) parts.push(t('{n} words to review', { n: dueCount }));
  if (mistakesCount) parts.push(t('{n} mistakes to fix', { n: mistakesCount }));

  return (
    <Reveal className="mt-6">
      <div className="glass-card flex flex-col gap-4 border-l-4 !border-l-brand-yellow p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow">
            <Layers size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-brand-ink dark:text-white">{t('Daily review')}</p>
            <p className="text-sm">{parts.join(' · ')}. {t('A few minutes keeps them in your memory.')}</p>
          </div>
        </div>
        <Button to={dueCount ? '/review' : '/review?tab=mistakes'} className="shrink-0">
          {t('Start review')} <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </Reveal>
  );
}
