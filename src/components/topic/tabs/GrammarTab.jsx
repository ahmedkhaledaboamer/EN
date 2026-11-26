import HighlightLastWord from '../../ui/HighlightLastWord';
import IntroLine from '../../ui/IntroLine';
import SpeakButton from '../../speech/SpeakButton';

export default function GrammarTab({ topic }) {
  const { grammar } = topic;
  const ruleLines = (grammar.rule ?? '').split('\n').filter(Boolean);
  // Examples can be { en, ar } objects or plain strings
  const examples = (grammar.examples ?? []).map((e) => (typeof e === 'string' ? { en: e } : e));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <IntroLine>One grammar point</IntroLine>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            <HighlightLastWord text={grammar.title} />
          </h2>
        </div>

        <div className="glass-card p-6">
          <p dir="rtl" lang="ar" className="text-lg leading-loose text-brand-ink dark:text-neutral-100">
            {grammar.explanationAr}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-brand-yellow bg-brand-yellow/15 p-6 shadow-soft dark:bg-brand-yellow/10">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-900 dark:text-brand-yellow">
            {'// the rule'}
          </p>
          <ul className="mt-3 space-y-2">
            {ruleLines.map((line) => (
              <li key={line} className="font-display text-lg font-bold tracking-tight text-brand-ink dark:text-white">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl">
          Examples from <span className="text-highlight">{topic.title.toLowerCase()}</span>
        </h3>
        <ul className="space-y-3">
          {examples.map((ex, i) => (
            <li key={ex.en} className="glass-card flex items-start gap-3 p-4 sm:p-5">
              <span className="mt-1 w-6 shrink-0 font-mono text-sm text-brand-gold dark:text-brand-yellow" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-brand-ink dark:text-white">{ex.en}</p>
                {ex.ar && (
                  <p dir="rtl" lang="ar" className="mt-1 text-neutral-600 dark:text-neutral-300">
                    {ex.ar}
                  </p>
                )}
              </div>
              <SpeakButton text={ex.en} id={`grammar-${i}`} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
