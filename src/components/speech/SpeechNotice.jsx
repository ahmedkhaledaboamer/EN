import { CircleAlert } from 'lucide-react';
import { useSpeechContext } from './SpeechContext';

/** Small notice when audio can't work as expected. Renders nothing when all is fine. */
export default function SpeechNotice() {
  const { supported, voice, voicesLoaded } = useSpeechContext();

  let message = null;
  if (!supported) {
    message = "Audio isn't supported in this browser. Try Chrome, Edge or Safari to hear the words.";
  } else if (voicesLoaded && !voice) {
    message = 'No US English voice was found on this device, so the default voice is used.';
  }
  if (!message) return null;

  return (
    <p
      role="status"
      className="mb-6 flex items-start gap-2 rounded-2xl border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
    >
      <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
