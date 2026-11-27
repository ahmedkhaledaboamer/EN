import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Check } from 'lucide-react';
import SpeakButton from '../speech/SpeakButton';
import MicButton from '../speech/MicButton';
import SpeakFeedback from '../speech/SpeakFeedback';
import { useSpeakCheck } from '../../hooks/useSpeechRecognition';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Bold the word (or a simple inflection of it) inside its example sentence. */
function HighlightedExample({ sentence, word }) {
  const re = new RegExp(`\\b(${escapeRe(word)}(?:s|es|ed|d|ing)?)\\b`, 'i');
  const parts = sentence.split(re);
  if (parts.length === 1) return sentence;
  return parts.map((p, i) =>
    i === 1 ? (
      <strong key={i} className="font-semibold text-brand-ink dark:text-white">
        {p}
      </strong>
    ) : (
      p
    ),
  );
}

export default function WordCard({ word, learned, saved, onToggleLearned, onToggleSaved }) {
  const id = `word-${word.en}`;
  const check = useSpeakCheck(word.en);
  return (
    <motion.article
      layout
      className={`glass-card flex h-full flex-col p-5 transition-shadow hover:shadow-lift sm:p-6 ${
        learned ? 'ring-2 ring-brand-yellow' : ''
      }`}
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`${id}-title`} className="break-words text-2xl">
            {word.en}
          </h3>
          <p className="mt-1 font-mono text-sm text-neutral-500 dark:text-neutral-400">{word.phonetic}</p>
        </div>
        <div className="flex shrink-0 gap-1.5 sm:gap-2">
          <SpeakButton text={word.en} id={id} label={`Listen to "${word.en}"`} />
          <MicButton check={check} label={`Say "${word.en}"`} />
          <button
            type="button"
            onClick={onToggleSaved}
            aria-pressed={saved}
            aria-label={saved ? `Remove "${word.en}" from saved words` : `Save "${word.en}"`}
            title={saved ? 'Saved' : 'Save word'}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              saved
                ? 'bg-brand-purple/50 text-violet-900 dark:bg-violet-500/25 dark:text-violet-200'
                : 'bg-neutral-200/80 text-brand-ink hover:bg-brand-purple/40 dark:bg-white/10 dark:text-white dark:hover:bg-violet-500/20'
            }`}
          >
            {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <p dir="rtl" lang="ar" className="mt-4 text-lg font-semibold text-brand-ink dark:text-white">
        {word.ar}
      </p>

      <SpeakFeedback check={check} compact onRetry={check.start} />

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/60 p-3 dark:bg-white/5">
        <div className="flex-1">
          <p className="text-sm italic leading-relaxed">
            “<HighlightedExample sentence={word.example} word={word.en} />”
          </p>
          {word.exampleAr && (
            <p dir="rtl" lang="ar" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {word.exampleAr}
            </p>
          )}
        </div>
        <SpeakButton text={word.example} id={`${id}-example`} size="sm" label="Listen to the example" />
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onToggleLearned}
          aria-pressed={learned}
          className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
            learned
              ? 'bg-brand-yellow text-brand-ink shadow-yellow'
              : 'bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
          }`}
        >
          {learned ? (
            <>
              <Check size={16} strokeWidth={3} aria-hidden="true" /> Learned
            </>
          ) : (
            'Got it'
          )}
        </button>
      </div>
    </motion.article>
  );
}
