import { useEffect, useState } from 'react';
import { getTopicMeta, loadTopic } from '../data/topics';
import { getEssentialMeta, loadEssential } from '../data/essentials';

/**
 * Lazy-loads a full content file for a slug.
 * status: 'loading' | 'ready' | 'missing' | 'error'
 */
export function useLazyContent(slug, getMeta, load) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let alive = true;
    if (!getMeta(slug)) {
      setState({ status: 'missing', data: null });
      return undefined;
    }
    setState({ status: 'loading', data: null });
    load(slug)
      .then((data) => alive && setState(data ? { status: 'ready', data } : { status: 'missing', data: null }))
      .catch(() => alive && setState({ status: 'error', data: null }));
    return () => {
      alive = false;
    };
  }, [slug, getMeta, load]);

  return state;
}

export function useTopic(slug) {
  const { status, data } = useLazyContent(slug, getTopicMeta, loadTopic);
  return { status, topic: data };
}

export function useEssential(slug) {
  const { status, data } = useLazyContent(slug, getEssentialMeta, loadEssential);
  return { status, essential: data };
}
