import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Puzzle, SpellCheck, Zap } from 'lucide-react';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { useT } from '../../hooks/useT';

const ITEMS = [
  { id: 'match', title: 'Match', icon: Puzzle, ar: 'وصّل الكلمة بمعناها' },
  { id: 'speed', title: 'Speed round', icon: Zap, ar: '٦٠ ثانية تحدي' },
  { id: 'spelling', title: 'Spelling', icon: SpellCheck, ar: 'اسمع واكتب' },
];

/** Home: three quick games, one tap away. */
export default function GamesStrip() {
  const t = useT();
  return (
    <section aria-labelledby="games-strip-title" className="mt-20 sm:mt-28">
      <SectionHeading
        id="games-strip-title"
        eyebrow={t('Learn while you play')}
        title={
          <>
            {t('Quick')} <span className="text-highlight">{t('games.')}</span>
          </>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-3">
        {ITEMS.map(({ id, title, icon: Icon, ar }, i) => (
          <li key={id}>
            <Reveal delay={i * 0.06}>
              <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <Link to={`/games?game=${id}`} className="glass-card flex items-center gap-4 p-5 transition-shadow hover:shadow-lift">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/30 text-amber-800 dark:bg-brand-yellow/15 dark:text-brand-yellow">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-extrabold tracking-tight text-brand-ink dark:text-white">{t(title)}</span>
                    <span dir="rtl" lang="ar" className="block text-sm text-neutral-500 dark:text-neutral-400">
                      {ar}
                    </span>
                  </span>
                </Link>
              </motion.div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
