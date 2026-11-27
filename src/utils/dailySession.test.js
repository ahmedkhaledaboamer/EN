import { describe, expect, it } from 'vitest';
import { buildSessionPractice, newWordsFor, SESSION_LIMITS } from './dailySession';
import { compareSpeech } from './speechCompare';
import { WRITE_PASS } from '../components/practice/WriteExercise';

const topic = Object.values(import.meta.glob('../data/topics/supermarket.json', { eager: true, import: 'default' }))[0];

describe('daily session', () => {
  it('picks the next unlearned words', () => {
    const learned = new Set(['cashier', 'aisle']);
    const words = newWordsFor(topic, (en) => learned.has(en));
    expect(words).toHaveLength(SESSION_LIMITS.newWords);
    expect(words.map((w) => w.en)).not.toContain('cashier');
  });

  it('mixes mistakes, listening, writing and speaking', () => {
    const mistake = { id: 'x', exercise: { type: 'fill', sentence: 'I need to ___.', answer: 'pay' } };
    const qs = buildSessionPractice({ topic, mistakes: [mistake], speakSupported: true, listenSupported: true });
    expect(qs[0]).toBe(mistake.exercise);
    expect(qs.filter((q) => q.type === 'write')).toHaveLength(2);
    expect(qs.filter((q) => q.type === 'speak')).toHaveLength(2);
    const listen = qs.filter((q) => q.audio);
    expect(listen).toHaveLength(2);
    listen.forEach((q) => expect(q.options).toContain(q.answer));
    // write and speak use different sentences
    const write = qs.filter((q) => q.type === 'write').map((q) => q.answer);
    const speak = qs.filter((q) => q.type === 'speak').map((q) => q.answer);
    expect(write.some((w) => speak.includes(w))).toBe(false);
  });

  it('leaves out speaking when the microphone is not supported', () => {
    const qs = buildSessionPractice({ topic, speakSupported: false, listenSupported: false });
    expect(qs.every((q) => q.type === 'write')).toBe(true);
  });
});

describe('writing check', () => {
  it('accepts small wording differences and rejects wrong sentences', () => {
    const model = "I'd like a bag, please.";
    expect(compareSpeech(model, ['I would like a bag please']).score).toBeGreaterThanOrEqual(WRITE_PASS);
    expect(compareSpeech(model, ['I want a bag']).score).toBeLessThan(WRITE_PASS);
  });
});
