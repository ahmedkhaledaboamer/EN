import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cancelSpeech } from '../utils/speech';
import { compareSpeech } from '../utils/speechCompare';

// Web Speech API: speech-to-text. Chrome/Edge (desktop + Android) and Safari support it
// (prefixed as webkitSpeechRecognition); Firefox doesn't. In Chrome the audio is sent
// to Google's servers, so it needs an internet connection.
const Recognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const isRecognitionSupported = Boolean(Recognition);

// Only one microphone session at a time across the whole page
let activeRecognizer = null;

const IDLE = { listening: false, interim: '', transcripts: null, error: null };

/**
 * Listen once and compare what was said with `target`.
 *   const check = useSpeakCheck('Where can I find the milk?');
 *   check.toggle()  → start / stop listening
 *   check.result    → { score, words: [{ text, ok }], heard, verdict } after speaking
 */
export function useSpeakCheck(target) {
  const [state, setState] = useState(IDLE);
  const recRef = useRef(null);

  const start = useCallback(() => {
    if (!Recognition) return;
    cancelSpeech(); // don't let the app's own voice be recognized
    activeRecognizer?.abort?.();

    let rec;
    try {
      rec = new Recognition();
    } catch {
      setState({ ...IDLE, error: 'start-failed' });
      return;
    }
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    activeRecognizer = rec;
    recRef.current = rec;
    setState({ ...IDLE, listening: true });

    rec.onresult = (e) => {
      const results = Array.from(e.results);
      const interim = results.map((r) => r[0]?.transcript ?? '').join(' ').trim();
      if (results.length && results.every((r) => r.isFinal)) {
        // One full transcript per alternative index (falls back to the top alternative)
        const maxAlt = Math.max(...results.map((r) => r.length));
        const transcripts = Array.from({ length: maxAlt }, (_, k) =>
          results.map((r) => (r[k] ?? r[0]).transcript).join(' ').trim(),
        ).filter(Boolean);
        setState((s) => ({ ...s, interim, transcripts }));
      } else {
        setState((s) => ({ ...s, interim }));
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'aborted') return;
      setState((s) => ({ ...s, listening: false, error: e.error || 'unknown' }));
    };
    rec.onend = () => {
      if (activeRecognizer === rec) activeRecognizer = null;
      setState((s) => ({
        ...s,
        listening: false,
        // Ended without any final words and no other error → nothing was heard
        error: s.error ?? (s.transcripts ? null : 'no-speech'),
      }));
    };

    try {
      rec.start();
    } catch {
      setState({ ...IDLE, error: 'start-failed' });
    }
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);
  const reset = useCallback(() => {
    recRef.current?.abort?.();
    setState(IDLE);
  }, []);
  const toggle = useCallback(() => (state.listening ? stop() : start()), [state.listening, start, stop]);

  // Release the microphone when the component goes away
  useEffect(() => () => recRef.current?.abort?.(), []);
  // A different target means old feedback no longer applies
  useEffect(() => setState(IDLE), [target]);

  const result = useMemo(
    () => (state.transcripts ? compareSpeech(target, state.transcripts) : null),
    [state.transcripts, target],
  );

  return { supported: isRecognitionSupported, ...state, result, start, stop, toggle, reset };
}

/** Friendly text for recognition errors. */
export function recognitionErrorMessage(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Allow microphone access in your browser to practice speaking.';
    case 'no-speech':
      return "I didn't hear anything. Tap the mic and try again.";
    case 'audio-capture':
      return 'No microphone was found on this device.';
    case 'network':
      return 'Speech recognition needs an internet connection.';
    default:
      return 'Something went wrong with the microphone. Please try again.';
  }
}
