// Auto-generated quiz for essentials categories and saved words.
// Question kinds:
//   en-ar  : English word → pick the Arabic meaning
//   ar-en  : Arabic meaning → pick the English word
//   fill   : example sentence with the word blanked → pick the word
//            (the Arabic translation of the example is shown as a hint,
//             so similar items like "Monday"/"Tuesday" stay unambiguous)
//   listen : hear the word (not shown) → pick the Arabic meaning   [voice]
//   say    : see the Arabic meaning → say the English word         [voice]
import { shuffle } from './answers';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Up to n wrong options from other items, never equal in meaning or form to `item`. */
function distractors(items, item, field, n = 3) {
  const values = items
    .filter((x) => x.en !== item.en && x.ar !== item.ar)
    .map((x) => x[field])
    .filter((v) => v && v !== item[field]);
  return shuffle([...new Set(values)]).slice(0, n);
}

/** Regex that finds the item inside its example (whole word/phrase, case-insensitive). */
export function itemRegex(en) {
  return new RegExp(`(^|[^\\p{L}\\p{N}'])(${escapeRe(en)})(?=$|[^\\p{L}\\p{N}'])`, 'iu');
}

const MAKERS = {
  'en-ar': (item, items) => {
    const wrong = distractors(items, item, 'ar');
    if (!wrong.length) return null;
    return {
      type: 'mcq',
      label: 'English → Arabic',
      prompt: 'What does this mean?',
      question: item.en,
      options: [item.ar, ...wrong],
      answer: item.ar,
      optionsDir: 'rtl',
    };
  },
  'ar-en': (item, items) => {
    const wrong = distractors(items, item, 'en');
    if (!wrong.length) return null;
    return {
      type: 'mcq',
      label: 'Arabic → English',
      prompt: 'Choose the English word:',
      question: item.ar,
      questionDir: 'rtl',
      options: [item.en, ...wrong],
      answer: item.en,
    };
  },
  fill: (item, items) => {
    const re = itemRegex(item.en);
    if (!item.example || !re.test(item.example)) return null;
    const wrong = distractors(items, item, 'en');
    if (!wrong.length) return null;
    return {
      type: 'mcq',
      label: 'Fill the blank',
      prompt: 'Complete the sentence:',
      question: item.example.replace(re, '$1___'),
      note: item.exampleAr,
      options: [item.en, ...wrong],
      answer: item.en,
    };
  },
  // Voice: hear the word (not shown), pick its meaning. Needs text-to-speech.
  listen: (item, items) => {
    const wrong = distractors(items, item, 'ar');
    if (!wrong.length) return null;
    return {
      type: 'mcq',
      label: 'Listen & choose',
      prompt: 'Listen and choose the meaning:',
      audio: item.en,
      question: '',
      options: [item.ar, ...wrong],
      answer: item.ar,
      optionsDir: 'rtl',
    };
  },
  // Voice: see the Arabic meaning, say the English word. Needs speech recognition.
  say: (item) => ({
    type: 'speak',
    label: 'Say it',
    answer: item.en,
    note: item.ar,
    hideAnswer: true,
  }),
};

const TEXT_KINDS = ['en-ar', 'ar-en', 'fill'];

/**
 * Build `count` questions (mixed kinds, no repeated item+kind pair).
 *   options.listen – add "Listen & choose" questions (browser can speak)
 *   options.speak  – add "Say it" questions (browser can recognize speech)
 */
export function buildEssentialsQuiz(items, count = 10, { listen = false, speak = false } = {}) {
  if (!items?.length) return [];
  const KINDS = [...TEXT_KINDS, ...(listen ? ['listen'] : []), ...(speak ? ['say'] : [])];
  const pool = shuffle(items);
  const used = new Set();
  const questions = [];
  const maxTries = pool.length * KINDS.length;

  for (let i = 0; questions.length < count && i < maxTries; i++) {
    const k = i % pool.length;
    const lap = Math.floor(i / pool.length);
    const item = pool[k];
    // Rotate kinds by position, shifted by the lap, so each item gets a different kind on every lap
    const kind = KINDS[(k + lap) % KINDS.length];
    const key = `${item.en}|${kind}`;
    if (used.has(key)) continue;
    const q = MAKERS[kind](item, items);
    if (q) {
      used.add(key);
      questions.push(q);
    }
  }
  return questions;
}
