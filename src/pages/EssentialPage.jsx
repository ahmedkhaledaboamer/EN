import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookA, Layers, Target } from 'lucide-react';
import TopicHeader from '../components/topic/TopicHeader';
import Tabs from '../components/ui/Tabs';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import LearnTab from '../components/essentials/LearnTab';
import Flashcards from '../components/essentials/Flashcards';
import QuizTab from '../components/essentials/QuizTab';
import NotFound from './NotFound';
import { LoadingState } from './TopicPage';
import { getEssentialMeta } from '../data/essentials';
import { useEssentialsProgress } from '../hooks/useEssentialsProgress';
import { useStreak } from '../hooks/useStreak';
import { useEssential } from '../hooks/useTopic';

const TABS = [
  { id: 'learn', label: 'Learn', icon: BookA },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: Target },
];

export default function EssentialPage() {
  const { slug } = useParams();
  const meta = getEssentialMeta(slug);
  const { status, essential } = useEssential(slug);
  const { getTopicProgress, isWordLearned, setWordLearned } = useEssentialsProgress();
  const { recordActivity } = useStreak();
  const [params, setParams] = useSearchParams();

  const requested = params.get('tab');
  const tab = TABS.some((t) => t.id === requested) ? requested : 'learn';
  const setTab = useCallback(
    (id) => setParams(id === 'learn' ? {} : { tab: id }, { replace: true }),
    [setParams],
  );

  if (!meta) return <NotFound />;

  let body;
  if (status === 'loading') body = <LoadingState />;
  else if (status !== 'ready') {
    body = <p className="glass-card p-8 text-center">Sorry, this category could not be loaded.</p>;
  } else {
    const panels = {
      learn: <LearnTab essential={essential} />,
      flashcards: (
        <Flashcards
          items={essential.items}
          isLearned={(en) => isWordLearned(slug, en)}
          setLearned={(en, value) => setWordLearned(slug, en, value)}
          onActivity={recordActivity}
        />
      ),
      quiz: <QuizTab essential={essential} onReview={() => setTab('learn')} />,
    };
    body = (
      <>
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Essentials sections" pillId="essential-tab-pill" />
        <SpeechNotice />
        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4"
          >
            {panels[tab]}
          </motion.section>
        </AnimatePresence>
      </>
    );
  }

  return (
    <SpeechProvider>
      <TopicHeader
        meta={meta}
        progress={getTopicProgress(meta)}
        backTo="/essentials"
        backLabel="All essentials"
        monoPath="~/essentials"
        learnedLabel="Items learned"
      />
      <div className="mt-8 pb-10">{body}</div>
    </SpeechProvider>
  );
}
