import { describe, expect, it } from 'vitest';
import { buildWordMatchers, segmentSentence, splitSentences } from './storyText';

const words = (list) => buildWordMatchers(list.map((en) => ({ en })));
const tapped = (sentence, list) =>
  segmentSentence(sentence, words(list))
    .filter((s) => s.type === 'word')
    .map((s) => s.text);

describe('splitSentences', () => {
  it('keeps closing quotes with their sentence', () => {
    expect(splitSentences('She asks, "Where is the milk?" He smiles. OK!')).toEqual([
      'She asks, "Where is the milk?"',
      'He smiles.',
      'OK!',
    ]);
  });
});

describe('segmentSentence', () => {
  it('matches simple inflections', () => {
    expect(tapped('She buys groceries and checks the receipts.', ['buy', 'grocery', 'check', 'receipt'])).toEqual([
      'buys',
      'groceries',
      'checks',
      'receipts',
    ]);
  });

  it('matches irregular forms', () => {
    expect(tapped('He woke up and his teeth hurt.', ['wake up', 'tooth'])).toEqual(['woke up', 'teeth']);
  });

  it('matches multi-word phrases before single words', () => {
    expect(tapped('Check the expiration date first.', ['date', 'expiration date'])).toEqual(['expiration date']);
  });

  it('does not match a phrase across punctuation', () => {
    expect(tapped('Wake, up!', ['wake up'])).toEqual([]);
  });

  it('is lossless: joining segments gives back the sentence', () => {
    const sentence = 'At the checkout, the cashier says, "That\'s $42, please."';
    const joined = segmentSentence(sentence, words(['checkout', 'cashier']))
      .map((s) => s.text)
      .join('');
    expect(joined).toBe(sentence);
  });
});
