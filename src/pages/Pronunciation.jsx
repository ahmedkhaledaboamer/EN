import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IntroLine from '../components/ui/IntroLine';
import { useT } from '../hooks/useT';
import Reveal from '../components/ui/Reveal';
import { SOUND_GROUPS } from '../data/pronunciation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

export default function Pronunciation() {
  const t = useT();
  const [scores] = useLocalStorage(STORAGE_KEYS.pronunciation, {});

  return (
    <section className="pb-10 pt-10 sm:pt-16" aria-labelledby="sounds-title">
      <IntroLine>{t("Sounds for Arabic speakers")}</IntroLine>
      <h1 id="sounds-title" className="mt-5 text-4xl sm:text-6xl">
        {t("Say it")} <span className="text-highlight">{t("right.")}</span>
      </h1>
      <p className="mt-4 max-w-2xl">
        Six sound pairs that Arabic speakers often mix up. Listen to the difference, test your ear, then say the words
        into the microphone.
      </p>
      <p dir="rtl" lang="ar" className="mt-2 max-w-2xl text-left text-neutral-500 dark:text-neutral-400">
        أصوات مش موجودة في العربي أو بنلخبط بينها، زي p و b، و ship و sheep. اتمرّن عليها عشان كلامك يبقى مفهوم.
      </p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SOUND_GROUPS.map((g, i) => {
          const best = scores[g.id]?.best;
          return (
            <li key={g.id}>
              <Reveal delay={Math.min(i * 0.06, 0.3)} className="h-full">
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
                  <Link to={`/pronunciation/${g.id}`} className="glass-card flex h-full flex-col p-6 transition-shadow hover:shadow-lift">
                    <div className="flex items-start justify-between">
                      <span className="text-5xl leading-none" aria-hidden="true">
                        {g.emoji}
                      </span>
                      <span className="font-mono text-sm text-brand-gold dark:text-brand-yellow">{g.sounds.join('  vs  ')}</span>
                    </div>
                    <h2 className="mt-6 text-2xl">{g.title}</h2>
                    <p dir="rtl" lang="ar" className="mt-0.5 text-left text-sm text-neutral-500 dark:text-neutral-400">
                      {g.titleAr}
                    </p>
                    <p className="mt-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {g.pairs[0].a} / {g.pairs[0].b} · {g.pairs.length} pairs
                      {best !== undefined && ` · best ${best}%`}
                    </p>
                  </Link>
                </motion.div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
