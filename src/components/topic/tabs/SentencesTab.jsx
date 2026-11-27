import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Languages } from 'lucide-react';
import SpeakButton from '../../speech/SpeakButton';
import MicButton from '../../speech/MicButton';
import SpeakFeedback from '../../speech/SpeakFeedback';
import { isRecognitionSupported, useSpeakCheck } from '../../../hooks/useSpeechRecognition';

function SentenceRow({ sentence, index, open, onToggle }) {
  const check = useSpeakCheck(sentence.en);
  const arId = `sentence-ar-${index}`;

  return (
    <li className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="w-7 shrink-0 font-mono text-sm text-brand-gold dark:text-brand-yellow" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="flex-1 text-base font-semibold text-brand-ink sm:text-lg dark:text-white">{sentence.en}</p>
        <SpeakButton text={sentence.en} id={`sentence-${index}`} />
        <MicButton check={check} label={`Say: ${sentence.en}`} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={arId}
          aria-label={open ? 'Hide translation' : 'Show translation'}
          title={open ? 'Hide translation' : 'Show translation'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          {open ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            id={arId}
            dir="rtl"
            lang="ar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden text-lg text-neutral-600 dark:text-neutral-300"
          >
            <span className="block pt-3">{sentence.ar}</span>
          </motion.p>
        )}
      </AnimatePresence>
      <SpeakFeedback check={check} onRetry={check.start} />
    </li>
  );
}

export default function SentencesTab({ topic }) {
  const [revealed, setRevealed] = useState(() => new Set());
  const allShown = revealed.size === topic.sentences.length;

  const toggleOne = (i) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const toggleAll = () =>
    setRevealed(allShown ? new Set() : new Set(topic.sentences.map((_, i) => i)));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          Listen, then {isRecognitionSupported ? 'tap 🎤 and say it yourself' : 'repeat it out loud'}. Check the Arabic
          meaning when you need it.
        </p>
        <button
          type="button"
          onClick={toggleAll}
          aria-pressed={allShown}
          className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-200/80 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          <Languages size={16} aria-hidden="true" />
          {allShown ? 'Hide all translations' : 'Show all translations'}
        </button>
      </div>

      <ol className="space-y-3">
        {topic.sentences.map((s, i) => (
          <SentenceRow key={s.en} sentence={s} index={i} open={revealed.has(i)} onToggle={() => toggleOne(i)} />
        ))}
      </ol>
    </div>
  );
}
