import WordList from '../../learn/WordList';
import { useProgress } from '../../../hooks/useProgress';

export default function WordsTab({ topic }) {
  const { isWordLearned, setWordLearned } = useProgress();
  return (
    <WordList
      items={topic.words}
      isLearned={(en) => isWordLearned(topic.slug, en)}
      setLearned={(en, value) => setWordLearned(topic.slug, en, value)}
      saveSlug={topic.slug}
    />
  );
}
