import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { INTERVALS, nextSchedule, reviewKey, splitKey, useReview } from './useReview';
import { exerciseId, useMistakes } from './useMistakes';
import { useProgress } from './useProgress';
import { useSavedWords } from './useSavedWords';

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('nextSchedule (Leitner boxes)', () => {
  it('moves up one box when you knew it, and back to box 1 when you forgot', () => {
    expect(nextSchedule(undefined, true, '2026-11-27')).toEqual({ box: 2, due: '2026-11-30' });
    expect(nextSchedule(undefined, false, '2026-11-27')).toEqual({ box: 1, due: '2026-11-28' });
    expect(nextSchedule({ box: 1 }, true, '2026-11-27')).toEqual({ box: 2, due: '2026-11-30' });
    expect(nextSchedule({ box: 3 }, true, '2026-11-27')).toEqual({ box: 4, due: '2026-12-11' });
    expect(nextSchedule({ box: 5 }, true, '2026-11-27').box).toBe(5);
    expect(nextSchedule({ box: 4 }, false, '2026-11-27')).toEqual({ box: 1, due: '2026-11-28' });
  });

  it('uses growing intervals', () => {
    expect(Object.values(INTERVALS)).toEqual([1, 3, 7, 14, 30]);
  });

  it('keys round-trip', () => {
    expect(splitKey(reviewKey('essentials/months', 'May'))).toEqual({ source: 'essentials/months', en: 'May' });
  });
});

describe('useReview', () => {
  it('builds the deck from learned and saved words, and schedules after grading', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-27T10:00:00'));

    const progress = renderHook(() => useProgress());
    const saved = renderHook(() => useSavedWords());
    const review = renderHook(() => useReview());

    act(() => progress.result.current.setWordLearned('supermarket', 'cashier', true));
    act(() => saved.result.current.toggleSaved('hotel', { en: 'balcony', ar: 'بلكونة' }));
    expect(review.result.current.total).toBe(2);
    expect(review.result.current.dueCount).toBe(2); // new cards are due right away

    act(() => review.result.current.grade('supermarket|cashier', true));
    expect(review.result.current.dueCount).toBe(1);

    // Known on first sight → back in 3 days
    vi.setSystemTime(new Date('2026-11-29T10:00:00'));
    review.rerender();
    expect(review.result.current.dueKeys).not.toContain('supermarket|cashier');
    vi.setSystemTime(new Date('2026-11-30T10:00:00'));
    review.rerender();
    expect(review.result.current.dueKeys).toContain('supermarket|cashier');
  });
});

describe('useMistakes', () => {
  const ex = { type: 'mcq', question: 'Where do you pay?', options: ['At the checkout', 'On the shelf'], answer: 'At the checkout' };
  const source = { title: 'Supermarket', emoji: '🛒', to: '/topics/supermarket?tab=practice' };

  it('adds wrong answers, counts repeats, and removes them when answered right', () => {
    const { result } = renderHook(() => useMistakes());
    act(() => result.current.recordAnswer(ex, { correct: false, given: 'On the shelf' }, source));
    act(() => result.current.recordAnswer(ex, { correct: false, given: 'On the shelf' }, source));
    expect(result.current.mistakesCount).toBe(1);
    expect(result.current.mistakes[0]).toMatchObject({ id: exerciseId(ex), misses: 2, source });

    act(() => result.current.recordAnswer(ex, { correct: true, given: 'At the checkout' }, source));
    expect(result.current.mistakesCount).toBe(0);
  });

  it('ignores skipped speaking exercises', () => {
    const { result } = renderHook(() => useMistakes());
    act(() =>
      result.current.recordAnswer({ type: 'speak', answer: 'Hello' }, { correct: false, given: '(skipped: no microphone)' }, source),
    );
    expect(result.current.mistakesCount).toBe(0);
  });
});
