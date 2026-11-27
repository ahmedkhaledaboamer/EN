import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookA, BookOpen, Clock, Lightbulb, MessageSquareText, MessagesSquare, Target } from 'lucide-react';
import TopicHeader from '../components/topic/TopicHeader';
import Tabs from '../components/ui/Tabs';
import SpeechNotice from '../components/speech/SpeechNotice';
import { SpeechProvider } from '../components/speech/SpeechContext';
import WordsTab from '../components/topic/tabs/WordsTab';
import SentencesTab from '../components/topic/tabs/SentencesTab';
import StoryTab from '../components/topic/tabs/StoryTab';
import DialogueTab from '../components/topic/tabs/DialogueTab';
import GrammarTab from '../components/topic/tabs/GrammarTab';
import PracticeTab from '../components/topic/tabs/PracticeTab';
import Button from '../components/ui/Button';
import NotFound from './NotFound';
import LoadingState from '../components/ui/LoadingState';
import { getTopicMeta, isTopicReady } from '../data/topics';
import { useProgress } from '../hooks/useProgress';
import { useTopic } from '../hooks/useTopic';

const TABS = [
  { id: 'words', label: 'Words', icon: BookA },
  { id: 'sentences', label: 'Sentences', icon: MessageSquareText },
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'dialogue', label: 'Dialogue', icon: MessagesSquare },
  { id: 'grammar', label: 'Grammar', icon: Lightbulb },
  { id: 'practice', label: 'Practice', icon: Target },
];

export function ComingSoon({ meta }) {
  return (
    <div className="glass-card mx-auto max-w-xl p-8 text-center sm:p-12">
      <Clock size={32} className="mx-auto text-brand-gold dark:text-brand-yellow" aria-hidden="true" />
      <h2 className="mt-4 text-3xl">
        Coming <span className="text-highlight">soon.</span>
      </h2>
      <p className="mt-3">This situation has no words yet.</p>
      <p className="mt-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">
        src/data/topics/{meta.slug}.json → words: []
      </p>
      <Button to="/topics" variant="secondary" className="mt-6">
        Browse other topics
      </Button>
    </div>
  );
}

export default function TopicPage() {
  const { slug } = useParams();
  const meta = getTopicMeta(slug);
  const { status, topic } = useTopic(slug);
  const { getTopicProgress } = useProgress();
  const [params, setParams] = useSearchParams();

  // The Dialogue tab only appears for topics that have a dialogue
  const tabs = topic && !topic.dialogue ? TABS.filter((t) => t.id !== 'dialogue') : TABS;
  const requested = params.get('tab');
  const tab = tabs.some((t) => t.id === requested) ? requested : 'words';
  const setTab = useCallback(
    (id) => setParams(id === 'words' ? {} : { tab: id }, { replace: true }),
    [setParams],
  );

  if (!meta) return <NotFound />;

  const progress = getTopicProgress(meta);

  let body;
  if (status === 'loading') body = <LoadingState />;
  else if (status !== 'ready') {
    body = <p className="glass-card p-8 text-center">Sorry, this topic could not be loaded.</p>;
  } else if (!isTopicReady(topic)) body = <ComingSoon meta={meta} />;
  else {
    const panels = {
      words: <WordsTab topic={topic} />,
      sentences: <SentencesTab topic={topic} />,
      story: <StoryTab topic={topic} />,
      dialogue: topic.dialogue ? <DialogueTab topic={topic} /> : null,
      grammar: <GrammarTab topic={topic} />,
      practice: <PracticeTab topic={topic} onReviewWords={() => setTab('words')} />,
    };
    body = (
      <>
        <Tabs tabs={tabs} active={tab} onChange={setTab} label="Topic sections" pillId="topic-tab-pill" />
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
      <TopicHeader meta={meta} progress={progress} />
      <div className="mt-8 pb-10">{body}</div>
    </SpeechProvider>
  );
}
