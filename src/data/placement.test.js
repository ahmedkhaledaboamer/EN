import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { PLACEMENT_QUESTIONS, STAGES, questionsFor, scorePlacement } from './placement';
import { useTodayTopic } from '../hooks/useTodayTopic';
import { usePlacement } from '../hooks/usePlacement';

beforeEach(() => localStorage.clear());

describe('placement questions', () => {
  it('has 6 questions per stage, each with its answer among the options', () => {
    STAGES.forEach((s) => expect(questionsFor(s)).toHaveLength(6));
    PLACEMENT_QUESTIONS.forEach((q) => {
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
    });
  });
});

describe('scorePlacement', () => {
  it('places a complete beginner at A1', () => {
    expect(scorePlacement({ A1: 2 })).toMatchObject({ level: null, startLevel: 'A1' });
  });

  it('uses the highest stage passed in a row', () => {
    expect(scorePlacement({ A1: 6, A2: 5, B1: 3 })).toMatchObject({ level: 'A2', startLevel: 'B1' });
    expect(scorePlacement({ A1: 4 })).toMatchObject({ level: 'A1', startLevel: 'A2' });
  });

  it('does not skip a failed stage', () => {
    expect(scorePlacement({ A1: 6, A2: 2, B1: 6 })).toMatchObject({ level: 'A1', startLevel: 'A2' });
  });

  it('caps at B2 when everything is passed', () => {
    expect(scorePlacement({ A1: 6, A2: 6, B1: 6, B2: 6 })).toMatchObject({ level: 'B2', startLevel: 'B2' });
  });
});

describe("today's topic after placement", () => {
  it('starts at the placed level', () => {
    const today = renderHook(() => useTodayTopic());
    const placement = renderHook(() => usePlacement());
    expect(today.result.current.topic.level).toBe('A2'); // supermarket, first in the path

    act(() => placement.result.current.savePlacement(scorePlacement({ A1: 6, A2: 6, B1: 2 })));
    expect(today.result.current.topic.level).toBe('B1');
  });

  it('falls back to the highest available level when placed above the content', () => {
    const today = renderHook(() => useTodayTopic());
    const placement = renderHook(() => usePlacement());
    act(() => placement.result.current.savePlacement(scorePlacement({ A1: 6, A2: 6, B1: 6, B2: 6 })));
    expect(today.result.current.topic.level).toBe('B1');
  });
});
