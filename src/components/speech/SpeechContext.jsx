import { createContext, useContext } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

// One speech instance per topic page, so only one thing speaks at a time
// and every 🔊 button knows which item is currently playing.
const SpeechContext = createContext(null);

export function SpeechProvider({ children }) {
  const speech = useSpeech();
  return <SpeechContext.Provider value={speech}>{children}</SpeechContext.Provider>;
}

export function useSpeechContext() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeechContext must be used inside <SpeechProvider>');
  return ctx;
}
