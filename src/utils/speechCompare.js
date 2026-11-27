// Compare what the learner said (speech-recognition transcripts) with the target
// sentence, word by word. Tolerant to case, punctuation, contractions ("I'm" = "I am")
// and digits ("7" = "seven"), because recognizers often write those differently.
import { normalizeAnswer } from './answers';

const CONTRACTIONS = {
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "what's": 'what is',
  "where's": 'where is',
  "who's": 'who is',
  "how's": 'how is',
  "let's": 'let us',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'll": 'i will',
  "you'll": 'you will',
  "we'll": 'we will',
  "they'll": 'they will',
  "he'll": 'he will',
  "she'll": 'she will',
  "it'll": 'it will',
  "i'd": 'i would',
  "you'd": 'you would',
  "we'd": 'we would',
  "they'd": 'they would',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "can't": 'can not',
  cannot: 'can not',
  "couldn't": 'could not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "mustn't": 'must not',
  okay: 'ok',
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 0–999 → words ("42" → "forty two"). Larger numbers are left as digits. */
function numberToWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
  if (n < 1000) {
    const rest = n % 100;
    return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` ${numberToWords(rest)}` : ''}`;
  }
  return String(n);
}

/** Normalized comparison tokens for a piece of text. */
export function speechTokens(text = '') {
  const prepared = String(text)
    .toLowerCase()
    .replace(/\ba\.?\s?m\.?(?=\s|$|[^\p{L}])/gu, ' am ')
    .replace(/\bp\.?\s?m\.?(?=\s|$|[^\p{L}])/gu, ' pm ')
    .replace(/(\d+):(\d+)/g, '$1 $2')
    .replace(/\$(\d+)/g, '$1 dollars')
    .replace(/%/g, ' percent');
  return normalizeAnswer(prepared)
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .flatMap((t) => (CONTRACTIONS[t] ?? t).split(' '))
    .flatMap((t) => (/^\d+$/.test(t) ? numberToWords(Number(t)).split(' ') : [t]));
}

/** Longest-common-subsequence alignment → set of matched indices in `a`. */
function lcsMatches(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const matched = new Set();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      matched.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return matched;
}

function scoreOne(target, heard) {
  // Keep the target's original words for display, and know which tokens belong to each
  const words = target.trim().split(/\s+/).filter(Boolean);
  const ranges = [];
  const targetTokens = [];
  words.forEach((w) => {
    const toks = speechTokens(w);
    ranges.push([targetTokens.length, targetTokens.length + toks.length]);
    targetTokens.push(...toks);
  });

  const matched = lcsMatches(targetTokens, speechTokens(heard));
  const score = targetTokens.length ? Math.round((matched.size / targetTokens.length) * 100) : 0;
  const result = words.map((text, i) => {
    const [from, to] = ranges[i];
    let ok = true;
    for (let k = from; k < to; k++) if (!matched.has(k)) ok = false;
    return { text, ok };
  });
  return { score, words: result, heard };
}

/**
 * Compare a target with one or more recognition alternatives; returns the best match:
 * { score: 0–100, words: [{ text, ok }], heard, verdict: 'great' | 'almost' | 'retry' }
 */
export function compareSpeech(target, transcripts = []) {
  const list = (Array.isArray(transcripts) ? transcripts : [transcripts]).filter(Boolean);
  if (!list.length) return { score: 0, words: target.split(/\s+/).map((text) => ({ text, ok: false })), heard: '', verdict: 'retry' };
  const best = list.map((t) => scoreOne(target, t)).sort((a, b) => b.score - a.score)[0];
  const verdict = best.score >= 80 ? 'great' : best.score >= 50 ? 'almost' : 'retry';
  return { ...best, verdict };
}

/** Score needed to count a "Say it" exercise as correct. */
export const SPEAK_PASS = 70;
