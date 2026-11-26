import { describe, expect, it } from 'vitest';
import { isSameAnswer, normalizeAnswer, shuffle, shuffleDifferent } from './answers';

describe('normalizeAnswer / isSameAnswer', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalizeAnswer('  Here is   your CHANGE! ')).toBe('here is your change');
    expect(isSameAnswer('Where can I find the milk?', 'where can i find the milk')).toBe(true);
  });

  it('treats curly and straight apostrophes the same', () => {
    expect(isSameAnswer('I’d like a bag', "I'd like a bag")).toBe(true);
  });

  it('keeps different words different', () => {
    expect(isSameAnswer('loose', 'tight')).toBe(false);
  });
});

describe('shuffle helpers', () => {
  it('shuffle keeps every element', () => {
    const list = [1, 2, 3, 4, 5];
    expect(shuffle(list).sort()).toEqual(list);
  });

  it('shuffleDifferent never returns the original order', () => {
    const list = ['Where', 'can', 'I', 'find', 'it?'];
    for (let i = 0; i < 50; i++) {
      expect(shuffleDifferent(list)).not.toEqual(list);
    }
  });
});
