import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useStreak } from './useStreak';
import { useProgress } from './useProgress';
import { useSavedWords } from './useSavedWords';
import { STORAGE_KEYS } from '../utils/storage';
import { getTopicMeta } from '../data/topics';

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

const setToday = (iso) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
};

describe('useStreak', () => {
  it('starts at 1 and does not double-count the same day', () => {
    setToday('2026-11-20T10:00:00');
    const { result } = renderHook(() => useStreak());
    expect(result.current.streak).toBe(0);
    act(() => result.current.recordActivity());
    act(() => result.current.recordActivity());
    expect(result.current.streak).toBe(1);
    expect(result.current.studiedToday).toBe(true);
  });

  it('grows on consecutive days and resets after a missed day', () => {
    setToday('2026-11-20T10:00:00');
    const { result, rerender } = renderHook(() => useStreak());
    act(() => result.current.recordActivity());

    setToday('2026-11-21T09:00:00');
    rerender();
    act(() => result.current.recordActivity());
    expect(result.current.streak).toBe(2);

    setToday('2026-11-23T09:00:00'); // missed the 22nd
    rerender();
    expect(result.current.streak).toBe(0);
    act(() => result.current.recordActivity());
    expect(result.current.streak).toBe(1);
    expect(result.current.best).toBe(2);
  });
});

describe('useProgress', () => {
  const meta = getTopicMeta('supermarket');

  it('tracks learned words and status', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.getTopicProgress(meta).status).toBe('not-started');

    act(() => result.current.setWordLearned('supermarket', 'cashier', true));
    const p = result.current.getTopicProgress(meta);
    expect(p.learned).toBe(1);
    expect(p.total).toBe(20);
    expect(p.status).toBe('in-progress');

    act(() => result.current.toggleWordLearned('supermarket', 'cashier'));
    expect(result.current.getTopicProgress(meta).learned).toBe(0);
  });

  it('completes a topic at 70% and keeps the best score', () => {
    const { result } = renderHook(() => useProgress());

    let r;
    act(() => {
      r = result.current.recordPracticeResult('supermarket', 5, 8); // 63%
    });
    expect(r).toMatchObject({ percent: 63, passed: false, isNewBest: true });
    expect(result.current.getTopicProgress(meta).completed).toBe(false);

    act(() => {
      r = result.current.recordPracticeResult('supermarket', 6, 8); // 75%
    });
    expect(r.passed).toBe(true);
    expect(result.current.getTopicProgress(meta)).toMatchObject({ completed: true, bestScore: 75, percent: 100 });

    act(() => {
      r = result.current.recordPracticeResult('supermarket', 2, 8); // worse: stays completed, best unchanged
    });
    expect(r.isNewBest).toBe(false);
    expect(result.current.getTopicProgress(meta)).toMatchObject({ completed: true, bestScore: 75 });
    expect(result.current.completedCount).toBe(1);
  });

  it('shares state between hook instances and persists it', () => {
    const a = renderHook(() => useProgress());
    const b = renderHook(() => useProgress());
    act(() => a.result.current.setWordLearned('supermarket', 'aisle', true));
    expect(b.result.current.isWordLearned('supermarket', 'aisle')).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)).supermarket.learnedWords).toEqual(['aisle']);
  });
});

describe('useSavedWords', () => {
  const word = { en: 'cashier', ar: 'كاشير', phonetic: '/kæˈʃɪr/', example: 'The cashier is nice.', exampleAr: 'الكاشير لطيف.' };

  it('saves full word details and removes them', () => {
    const { result } = renderHook(() => useSavedWords());
    act(() => result.current.toggleSaved('supermarket', word));
    expect(result.current.savedCount).toBe(1);
    expect(result.current.savedWords[0]).toMatchObject({ slug: 'supermarket', ...word });
    expect(result.current.isSaved('supermarket', 'cashier')).toBe(true);

    act(() => result.current.removeSaved('supermarket', 'cashier'));
    expect(result.current.savedCount).toBe(0);
  });

  it('survives corrupted localStorage data', () => {
    localStorage.setItem(STORAGE_KEYS.savedWords, '{not json');
    const { result } = renderHook(() => useSavedWords());
    expect(result.current.savedWords).toEqual([]);
  });
});
