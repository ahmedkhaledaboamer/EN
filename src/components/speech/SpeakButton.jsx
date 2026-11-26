import { Square, Volume2 } from 'lucide-react';
import { useSpeechContext } from './SpeechContext';

/**
 * Round 🔊 button. Click to speak `text`, click again while playing to stop.
 */
export default function SpeakButton({ text, id = text, rate, size = 'md', label, className = '' }) {
  const { speak, stop, speakingId, supported } = useSpeechContext();
  const active = speakingId === id;
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 15 : 18;

  return (
    <button
      type="button"
      onClick={() => (active ? stop() : speak(text, { id, rate }))}
      disabled={!supported}
      aria-label={active ? 'Stop audio' : label ?? `Listen: ${text}`}
      title={supported ? (active ? 'Stop' : 'Listen') : 'Audio is not supported in this browser'}
      className={`relative flex shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${dims} ${
        active
          ? 'bg-brand-yellow text-brand-ink'
          : 'bg-neutral-200/80 text-brand-ink hover:bg-brand-yellow/60 dark:bg-white/10 dark:text-white dark:hover:bg-brand-yellow/25'
      } ${className}`}
    >
      {active && (
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-brand-yellow/50" />
      )}
      {active ? <Square size={icon - 4} fill="currentColor" aria-hidden="true" /> : <Volume2 size={icon} aria-hidden="true" />}
    </button>
  );
}
