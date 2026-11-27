// Builds the mixed "today's session": review → new words → mixed practice.
import { shuffle } from './answers';

export const SESSION_LIMITS = { review: 5, newWords: 5, mistakes: 2, listen: 2, write: 2, speak: 2 };

/** The next words of a topic that haven't been learned yet. */
export function newWordsFor(topic, isLearned, n = SESSION_LIMITS.newWords) {
  return (topic?.words ?? []).filter((w) => !isLearned(w.en)).slice(0, n);
}

/** "Hear the word, pick its meaning" questions from a topic's words. */
function listenQuestions(words, n) {
  return shuffle(words)
    .slice(0, n)
    .map((w) => {
      const wrong = shuffle(words.filter((x) => x.en !== w.en && x.ar !== w.ar)).slice(0, 3).map((x) => x.ar);
      return {
        type: 'mcq',
        label: 'Listen & choose',
        prompt: 'Listen and choose the meaning:',
        audio: w.en,
        question: '',
        options: [w.ar, ...wrong],
        answer: w.ar,
        optionsDir: 'rtl',
      };
    })
    .filter((q) => q.options.length >= 2);
}

/**
 * Mixed practice for the session:
 *   mistakes from the notebook → listening → writing (Arabic → English) → speaking.
 */
export function buildSessionPractice({ topic, mistakes = [], speakSupported = false, listenSupported = true }) {
  const L = SESSION_LIMITS;
  const fromMistakes = mistakes.slice(0, L.mistakes).map((m) => m.exercise);
  const sentences = shuffle(topic?.sentences ?? []);
  const write = sentences.slice(0, L.write).map((s) => ({ type: 'write', answer: s.en, note: s.ar }));
  const speak = speakSupported
    ? sentences.slice(L.write, L.write + L.speak).map((s) => ({ type: 'speak', answer: s.en, note: s.ar }))
    : [];
  const listen = listenSupported ? listenQuestions(topic?.words ?? [], L.listen) : [];
  return [...fromMistakes, ...listen, ...write, ...speak];
}
