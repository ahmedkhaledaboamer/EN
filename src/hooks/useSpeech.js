import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelSpeech,
  getVoiceState,
  isSpeechSupported,
  onVoicesChange,
  speak as speakText,
} from '../utils/speech';

/**
 * Text-to-speech for components.
 *   const { speak, stop, speakingId, supported, voice, voicesLoaded } = useSpeech();
 *   speak('Hello', { id: 'word-hello' })  → speakingId === 'word-hello' while it plays
 */
export function useSpeech() {
  const [voiceState, setVoiceState] = useState(getVoiceState);
  const [speakingId, setSpeakingId] = useState(null);
  // Each speak() call gets a token so late "end" events from a cancelled
  // utterance don't clear the state of the newer one.
  const tokenRef = useRef(0);

  useEffect(() => onVoicesChange(() => setVoiceState(getVoiceState())), []);

  // Stop talking when the component unmounts (e.g. leaving the page)
  useEffect(() => () => cancelSpeech(), []);

  const speak = useCallback((text, { id = text, rate, pitch, onEnd } = {}) => {
    const token = ++tokenRef.current;
    setSpeakingId(id);
    const done = (info) => {
      if (tokenRef.current === token) setSpeakingId(null);
      onEnd?.(info);
    };
    speakText(text, { rate, pitch, onEnd: done, onError: () => done({ error: true }) });
  }, []);

  const stop = useCallback(() => {
    tokenRef.current++;
    cancelSpeech();
    setSpeakingId(null);
  }, []);

  return {
    supported: isSpeechSupported,
    voice: voiceState.voice,
    voicesLoaded: voiceState.loaded,
    speakingId,
    speak,
    stop,
  };
}
