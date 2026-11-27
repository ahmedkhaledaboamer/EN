import { isRecognitionSupported } from '../hooks/useSpeechRecognition';

/** Extra Practice exercises built from a topic's sentences. */
export const WRITE_COUNT = 2; // "Write it" (Arabic → English), always
export const SPEAK_COUNT = 2; // "Say it", only when the browser can recognize speech

/** Total questions in a topic's Practice tab (JSON exercises + writing + speaking). */
export function practiceCount(exercisesCount = 0, sentencesCount = 0) {
  if (!sentencesCount) return exercisesCount;
  return exercisesCount + WRITE_COUNT + (isRecognitionSupported ? SPEAK_COUNT : 0);
}
