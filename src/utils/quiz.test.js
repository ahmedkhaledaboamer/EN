import { describe, expect, it } from 'vitest';
import { buildEssentialsQuiz, itemRegex } from './quiz';

const essentials = Object.values(import.meta.glob('../data/essentials/*.json', { eager: true, import: 'default' }));

const ITEMS = [
  { en: 'my', ar: 'ـي', example: 'This is my phone.', exampleAr: 'ده تليفوني.' },
  { en: 'your', ar: 'ـك', example: 'Is this your bag?', exampleAr: 'دي شنطتك؟' },
  { en: 'his', ar: 'ـه', example: 'His car is blue.', exampleAr: 'عربيته زرقا.' },
  { en: 'her', ar: 'ـها', example: 'Her name is Mona.', exampleAr: 'اسمها منى.' },
  { en: 'our', ar: 'ـنا', example: 'Our house is big.', exampleAr: 'بيتنا كبير.' },
];

function checkQuestion(q) {
  expect(q.type).toBe('mcq');
  expect(q.options).toContain(q.answer);
  expect(new Set(q.options).size).toBe(q.options.length);
  expect(q.options.length).toBeGreaterThanOrEqual(2);
  if (q.label === 'Fill the blank') expect(q.question).toContain('___');
}

describe('itemRegex', () => {
  it('matches whole words only', () => {
    expect(itemRegex('he').test('He is my brother.')).toBe(true);
    expect(itemRegex('he').test('My brother is here.')).toBe(false);
    expect(itemRegex('a.m.').test('I wake up at 7 a.m.')).toBe(true);
  });
});

describe('buildEssentialsQuiz', () => {
  it('builds 10 valid questions mixing all three kinds', () => {
    const qs = buildEssentialsQuiz(ITEMS, 10);
    expect(qs).toHaveLength(10);
    qs.forEach(checkQuestion);
    expect(new Set(qs.map((q) => q.label))).toEqual(
      new Set(['English → Arabic', 'Arabic → English', 'Fill the blank']),
    );
  });

  it('never repeats the same item with the same kind', () => {
    const qs = buildEssentialsQuiz(ITEMS, 10);
    const keys = qs.map((q) => `${q.label}|${q.answer}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('returns an empty quiz for no items', () => {
    expect(buildEssentialsQuiz([], 10)).toEqual([]);
  });

  it.each(essentials.map((e) => [e.slug, e]))('works for every essentials category: %s', (_, e) => {
    for (let run = 0; run < 10; run++) {
      const qs = buildEssentialsQuiz(e.items, 10);
      expect(qs).toHaveLength(10);
      qs.forEach(checkQuestion);
    }
  });
});
