import { describe, expect, it } from 'vitest';
import { checkSpelling, cleanWords, makeSpeedQuestion, pickPairs, spellableWords } from './games';

const WORDS = [
  { en: 'cashier', ar: 'كاشير' },
  { en: 'aisle', ar: 'ممر' },
  { en: 'receipt', ar: 'إيصال' },
  { en: 'discount', ar: 'خصم' },
  { en: 'cart', ar: 'عربية' },
  { en: 'basket', ar: 'سلة' },
  { en: 'expiration date', ar: 'تاريخ الصلاحية' },
  { en: 'Cashier', ar: 'مكرر' }, // duplicate English (case)
  { en: 'shelf', ar: 'ممر' }, // duplicate Arabic
  { en: 'no meaning' },
];

describe('cleanWords', () => {
  it('drops words without Arabic and duplicates', () => {
    expect(cleanWords(WORDS).map((w) => w.en)).toEqual(['cashier', 'aisle', 'receipt', 'discount', 'cart', 'basket', 'expiration date']);
  });
});

describe('pickPairs / makeSpeedQuestion', () => {
  it('picks unique pairs', () => {
    const pairs = pickPairs(WORDS, 6);
    expect(pairs).toHaveLength(6);
    expect(new Set(pairs.map((p) => p.ar)).size).toBe(6);
  });

  it('builds a question with 4 distinct options including the answer', () => {
    for (let i = 0; i < 30; i++) {
      const q = makeSpeedQuestion(WORDS, 'cashier');
      expect(q.word.en).not.toBe('cashier');
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(4);
    }
  });
});

describe('spelling', () => {
  it('accepts the right spelling, ignoring case and hyphen/space', () => {
    expect(checkSpelling('check-in', 'Check in').correct).toBe(true);
    expect(checkSpelling('receipt', 'RECEIPT').correct).toBe(true);
  });

  it('marks wrong letters', () => {
    const r = checkSpelling('receipt', 'reciept');
    expect(r.correct).toBe(false);
    expect(r.letters.map((l) => l.ok)).toEqual([true, true, true, false, false, true, true]);
  });

  it('keeps only spellable words', () => {
    expect(spellableWords([{ en: 'Wi-Fi', ar: 'واي فاي' }, { en: 'Q&A session', ar: 'أسئلة' }, { en: '7 a.m.', ar: 'الصبح' }]).map((w) => w.en)).toEqual(['Wi-Fi']);
  });
});
