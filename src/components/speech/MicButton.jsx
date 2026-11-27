import { Mic, Square } from 'lucide-react';

/** Round 🎤 button driven by useSpeakCheck(). Hidden when the browser can't recognize speech. */
export default function MicButton({ check, size = 'md', label = 'Say it', className = '' }) {
  if (!check.supported) return null;
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
  const icon = size === 'sm' ? 15 : size === 'lg' ? 26 : 18;

  return (
    <button
      type="button"
      onClick={check.toggle}
      aria-pressed={check.listening}
      aria-label={check.listening ? 'Stop recording' : label}
      title={check.listening ? 'Stop' : 'Say it — check your pronunciation'}
      className={`relative flex shrink-0 items-center justify-center rounded-full transition-colors ${dims} ${
        check.listening
          ? 'bg-rose-500 text-white'
          : size === 'lg'
            ? 'bg-brand-yellow text-brand-ink shadow-yellow hover:-translate-y-0.5'
            : 'bg-neutral-200/80 text-brand-ink hover:bg-brand-yellow/60 dark:bg-white/10 dark:text-white dark:hover:bg-brand-yellow/25'
      } ${className}`}
    >
      {check.listening && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />}
      {check.listening ? (
        <Square size={icon - 4} fill="currentColor" aria-hidden="true" />
      ) : (
        <Mic size={icon} aria-hidden="true" />
      )}
    </button>
  );
}
