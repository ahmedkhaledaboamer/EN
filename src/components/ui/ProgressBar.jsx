import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, label = 'Progress', className = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  // Any progress above 0 gets a visible sliver (5%); aria-valuenow keeps the real value.
  const visual = pct > 0 ? Math.max(pct, 5) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full bg-neutral-200/90 dark:bg-white/10 ${className}`}
    >
      <motion.div
        className="h-full rounded-full bg-brand-yellow"
        initial={{ width: 0 }}
        animate={{ width: `${visual}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
