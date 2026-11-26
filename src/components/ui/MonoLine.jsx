/** Terminal-style detail, e.g. ~/topic $ supermarket */
export default function MonoLine({ path = '~/topic', command, className = '' }) {
  return (
    <p className={`font-mono text-xs text-neutral-500 sm:text-sm dark:text-neutral-400 ${className}`}>
      <span className="text-brand-gold dark:text-brand-yellow">{path}</span>
      <span className="mx-2">$</span>
      <span className="text-brand-ink dark:text-white">{command}</span>
      <span
        aria-hidden="true"
        className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-brand-yellow"
      />
    </p>
  );
}
