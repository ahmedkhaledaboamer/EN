import { Lightbulb } from 'lucide-react';
import EssentialTable from './EssentialTable';
import WordList from '../learn/WordList';
import { useEssentialsProgress } from '../../hooks/useEssentialsProgress';

export default function LearnTab({ essential }) {
  const { isWordLearned, setWordLearned } = useEssentialsProgress();
  const { slug } = essential;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {essential.intro && (
          <div className="glass-card p-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {'// quick guide'}
            </p>
            <p dir="rtl" lang="ar" className="text-lg leading-loose text-brand-ink dark:text-neutral-100">
              {essential.intro}
            </p>
          </div>
        )}
        {essential.tips?.length > 0 && (
          <div className="rounded-3xl border-2 border-brand-yellow bg-brand-yellow/15 p-6 shadow-soft dark:bg-brand-yellow/10">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-900 dark:text-brand-yellow">
              <Lightbulb size={14} aria-hidden="true" /> Common mistakes
            </p>
            <ul dir="rtl" lang="ar" className="mt-3 list-disc space-y-2 pr-5 text-brand-ink dark:text-white">
              {essential.tips.map((tip) => (
                <li key={tip} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {essential.table && <EssentialTable table={essential.table} caption={`${essential.title} table`} />}

      <WordList
        items={essential.items}
        isLearned={(en) => isWordLearned(slug, en)}
        setLearned={(en, value) => setWordLearned(slug, en, value)}
        saveSlug={`essentials/${slug}`}
        noun="items"
      />
    </div>
  );
}
