/** Small rounded label: level, counts, status. */
const tones = {
  neutral: 'bg-neutral-200/70 text-neutral-700 dark:bg-white/10 dark:text-neutral-200',
  // amber-900 instead of brand-gold here to keep contrast high on the yellow tint
  gold: 'bg-brand-yellow/30 text-amber-900 dark:bg-brand-yellow/15 dark:text-brand-yellow',
  outline:
    'border border-dashed border-neutral-300 text-neutral-500 dark:border-white/20 dark:text-neutral-400',
};

export default function Chip({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
