import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ClipboardCheck, Flame, Volume2 } from 'lucide-react';
import { usePlacement } from '../../hooks/usePlacement';
import { useT } from '../../hooks/useT';
import Button from '../ui/Button';
import IntroLine from '../ui/IntroLine';
import MonoLine from '../ui/MonoLine';
import CodeWindow from '../ui/CodeWindow';
import FloatingBadge from '../ui/FloatingBadge';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' },
  }),
};

export default function Hero({ todayTopic, streak }) {
  const { placement } = usePlacement();
  const t = useT();
  const firstWord = todayTopic?.preview?.[0];
  const codeData = todayTopic
    ? { name: todayTopic.title, words: todayTopic.wordsCount, level: todayTopic.level }
    : { name: 'All done', completed: true };

  return (
    <section
      aria-labelledby="hero-title"
      className="grid items-center gap-14 pb-16 pt-10 sm:pb-20 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-10"
    >
      {/* Copy */}
      <div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <IntroLine>{t("Hi, I'm learning English")}</IntroLine>
        </motion.div>

        <motion.h1
          id="hero-title"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-6 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl"
        >
          {t('Learn English by')} <span className="text-highlight">{t('real situations.')}</span>
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-6">
          <MonoLine path="~/topic" command={todayTopic?.slug ?? 'review --all'} />
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2.5}
          className="mt-5 max-w-lg text-base sm:text-lg"
        >
          {t('One situation a day: the words, the sentences, a short story, one grammar point, and practice.')}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button to={todayTopic ? `/topics/${todayTopic.slug}` : '/topics'}>
            {t("Start Today's Topic")} <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <Button href="#topics" variant="secondary">
            {t('Browse Topics')}
          </Button>
        </motion.div>

        {!placement && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-5">
            <Link
              to="/placement"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-dashed border-brand-yellow px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-yellow/15 dark:text-white"
            >
              <ClipboardCheck size={16} className="text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
              {t('Not sure of your level? Take the 5-minute test')}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Signature code window + floating badges */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-md px-4 py-10 sm:px-8"
        aria-hidden="true"
      >
        <CodeWindow name="topic" fileName="today.js" data={codeData} />

        {todayTopic && (
          <FloatingBadge className="-top-1 left-0 sm:-left-4" delay={0}>
            <span>{todayTopic.emoji}</span> {todayTopic.title}
          </FloatingBadge>
        )}
        <FloatingBadge className="-right-1 top-1/2 sm:-right-6" delay={1.2}>
          <Flame size={16} className="text-orange-500" />
          {streak > 0 ? `${streak}-day streak` : 'Start a streak'}
        </FloatingBadge>
        {firstWord?.phonetic && (
          <FloatingBadge className="-bottom-2 left-6" delay={2.1}>
            <Volume2 size={16} className="text-brand-gold dark:text-brand-yellow" />
            {firstWord.phonetic}
          </FloatingBadge>
        )}
        {todayTopic && (
          <FloatingBadge className="-top-3 right-4 hidden sm:flex" delay={0.6}>
            <BookOpen size={16} /> {todayTopic.level}
          </FloatingBadge>
        )}
      </motion.div>
    </section>
  );
}
