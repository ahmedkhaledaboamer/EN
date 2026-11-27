import { useT } from '../../hooks/useT';

export default function Footer() {
  const t = useT();
  return (
    // w-full: inside the Layout's flex column, mx-auto alone would shrink the footer to its content
    <footer className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200/80 pt-6 text-sm sm:flex-row dark:border-white/10">
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
          <span className="text-brand-gold dark:text-brand-yellow">~/english</span> $ one situation a day
        </p>
        <p className="text-neutral-500 dark:text-neutral-400">
          {t('Made by')} <span className="font-semibold text-brand-gold dark:text-brand-yellow">Ahmed Khaled</span> · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
