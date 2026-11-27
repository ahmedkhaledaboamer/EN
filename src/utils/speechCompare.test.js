import { describe, expect, it } from 'vitest';
import { compareSpeech, speechTokens } from './speechCompare';

describe('speechTokens', () => {
  it('expands contractions and numbers, ignores case and punctuation', () => {
    expect(speechTokens("I'm here at 7 A.M.!")).toEqual(['i', 'am', 'here', 'at', 'seven', 'am']);
    expect(speechTokens('twenty-one')).toEqual(['twenty', 'one']);
    expect(speechTokens('21')).toEqual(['twenty', 'one']);
    expect(speechTokens("Can't")).toEqual(['can', 'not']);
    expect(speechTokens('$42')).toEqual(['forty', 'two', 'dollars']);
  });
});

describe('compareSpeech', () => {
  const target = 'Where can I find the milk?';

  it('gives 100% for a perfect attempt', () => {
    const r = compareSpeech(target, ['where can I find the milk']);
    expect(r.score).toBe(100);
    expect(r.verdict).toBe('great');
    expect(r.words.every((w) => w.ok)).toBe(true);
  });

  it('marks missing or wrong words', () => {
    const r = compareSpeech(target, ['where can I find milk']);
    expect(r.words.map((w) => w.ok)).toEqual([true, true, true, true, false, true]);
    expect(r.score).toBe(83);
  });

  it('picks the best of several alternatives', () => {
    const r = compareSpeech(target, ['wear can eye fine the milk', 'where can I find the milk']);
    expect(r.score).toBe(100);
    expect(r.heard).toBe('where can I find the milk');
  });

  it('accepts digits and contractions for the same words', () => {
    expect(compareSpeech("I'm twenty years old.", ['I am 20 years old']).score).toBe(100);
    expect(compareSpeech('The shop closes at 10 p.m.', ['the shop closes at ten PM']).score).toBe(100);
  });

  it('returns a low score when nothing matches', () => {
    const r = compareSpeech(target, ['good morning everyone']);
    expect(r.score).toBe(0);
    expect(r.verdict).toBe('retry');
  });

  it('works for single words', () => {
    expect(compareSpeech('cashier', ['Cashier.']).verdict).toBe('great');
    expect(compareSpeech('aisle', ["I'll"]).verdict).toBe('retry');
  });
});
