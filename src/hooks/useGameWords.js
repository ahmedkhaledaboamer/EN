import { useEffect, useMemo, useState } from 'react';
import { loadTopic, topics } from '../data/topics';
import { essentials, loadEssential } from '../data/essentials';
import { useReview } from './useReview';
import { useTodayTopic } from './useTodayTopic';
import { loadReviewItems } from '../utils/reviewItems';

/*
  Word sources for the games:
    'mine'            – words you learned (Got it) + saved words
    'topic:<slug>'    – a topic's 20 words
    'essentials:<slug>' – an essentials category's items
*/
export const MIN_GAME_WORDS = 6;

export function useGameSources() {
  const { deckKeys } = useReview();
  const { topic: today } = useTodayTopic();
  const defaultSource = deckKeys.length >= MIN_GAME_WORDS ? 'mine' : `topic:${today?.slug ?? topics[0]?.slug}`;
  return { defaultSource, myCount: deckKeys.length, today, topics, essentials };
}

/** Loads the words for a source. Returns { status, words }. */
export function useGameWords(source) {
  const { deckKeys, savedWords } = useReview();
  const [state, setState] = useState({ status: 'loading', words: [] });
  const keyList = useMemo(() => deckKeys.join(','), [deckKeys]);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', words: [] });
    const load = async () => {
      if (source === 'mine') return loadReviewItems(deckKeys, savedWords);
      const [kind, slug] = source.split(':');
      const file = kind === 'essentials' ? await loadEssential(slug) : await loadTopic(slug);
      return file?.words ?? file?.items ?? [];
    };
    load()
      .then((words) => alive && setState({ status: 'ready', words }))
      .catch(() => alive && setState({ status: 'error', words: [] }));
    return () => {
      alive = false;
    };
    // deckKeys is tracked through keyList
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, keyList]);

  return state;
}
