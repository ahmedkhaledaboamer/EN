// Content checks that use the app's own logic (the validator covers the JSON shape).
import { describe, expect, it } from 'vitest';
import { topics, TOPIC_ORDER, loadTopic } from './topics';
import { essentials, ESSENTIALS_ORDER } from './essentials';
import { buildWordMatchers, segmentSentence, splitSentences } from '../utils/storyText';
import { isSameAnswer } from '../utils/answers';

const fullTopics = import.meta.glob('./topics/*.json', { eager: true, import: 'default' });

describe('registries', () => {
  it('every registered slug has metadata, in order', () => {
    expect(topics.map((t) => t.slug)).toEqual(TOPIC_ORDER);
    expect(essentials.map((e) => e.slug)).toEqual(ESSENTIALS_ORDER);
  });

  it('metadata stays light (no story or exercises)', () => {
    const meta = topics[0];
    expect(meta).not.toHaveProperty('story');
    expect(meta).not.toHaveProperty('exercises');
    expect(meta.wordKeys).toHaveLength(meta.wordsCount);
  });

  it('lazy-loads a full topic', async () => {
    const t = await loadTopic('hotel');
    expect(t.story.text.length).toBeGreaterThan(100);
    expect(await loadTopic('does-not-exist')).toBeNull();
  });
});

describe.each(Object.values(fullTopics).map((t) => [t.slug, t]))('topic %s', (_, topic) => {
  it('story has at least 8 tappable topic words', () => {
    const matchers = buildWordMatchers(topic.words);
    const found = new Set(
      splitSentences(topic.story.text).flatMap((s) =>
        segmentSentence(s, matchers)
          .filter((seg) => seg.type === 'word')
          .map((seg) => seg.word.en),
      ),
    );
    expect(found.size).toBeGreaterThanOrEqual(8);
  });

  it('every exercise can be answered correctly in the app', () => {
    topic.exercises.forEach((ex) => {
      if (ex.type === 'mcq') expect(ex.options).toContain(ex.answer);
      if (ex.type === 'order') {
        expect([...ex.words].sort()).toEqual(ex.answer.trim().split(/\s+/).sort());
      }
      if (ex.type === 'listen') expect(isSameAnswer(ex.audioText, ex.answer)).toBe(true);
      if (ex.type === 'fill') expect(ex.sentence.split('___')).toHaveLength(2);
    });
  });
});
