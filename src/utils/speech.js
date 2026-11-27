// Web Speech API helpers (text-to-speech).
// - Picks an en-US voice explicitly (with a list of good-sounding preferred voices).
// - Voices often load asynchronously: we listen for `voiceschanged`.
// - If no English voice exists, we still speak with lang="en-US" and the browser default.

export const isSpeechSupported =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function';

// Higher in the list = preferred. Matched with `includes` on voice.name.
const PREFERRED_VOICES = [
  'Google US English',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Guy',
  'Samantha',
  'Alex',
  'Microsoft Zira',
  'Microsoft David',
];

const normLang = (lang = '') => lang.replace('_', '-').toLowerCase();

export function pickEnglishVoice(voices) {
  if (!voices?.length) return null;
  const enUS = voices.filter((v) => normLang(v.lang) === 'en-us');
  for (const name of PREFERRED_VOICES) {
    const match = enUS.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return (
    enUS.find((v) => v.localService) ??
    enUS[0] ??
    voices.find((v) => normLang(v.lang).startsWith('en')) ??
    null
  );
}

let cachedVoice = null;
let allVoices = [];
// User preferences (set from Settings): preferred voice and speed multiplier
let prefs = { voiceURI: '', rateScale: 1 };

/** Apply Settings: preferred voice (by voiceURI, '' = automatic) and speed multiplier. */
export function setSpeechPrefs(next) {
  prefs = { ...prefs, ...next };
}

/** All English voices available on this device (for the Settings voice picker). */
export function getEnglishVoices() {
  return allVoices.filter((v) => normLang(v.lang).startsWith('en'));
}

function currentVoice() {
  if (prefs.voiceURI) {
    const chosen = allVoices.find((v) => v.voiceURI === prefs.voiceURI);
    if (chosen) return chosen;
  }
  return cachedVoice;
}
let voicesLoaded = false;
const listeners = new Set();

function refreshVoices() {
  if (!isSpeechSupported) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      allVoices = voices;
      cachedVoice = pickEnglishVoice(voices);
      voicesLoaded = true;
      listeners.forEach((fn) => fn());
    }
  } catch {
    /* ignore */
  }
}

if (isSpeechSupported) {
  refreshVoices();
  try {
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  } catch {
    // Older Safari: no addEventListener on speechSynthesis
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }
  // Some browsers never fire voiceschanged: mark as loaded after a grace period.
  setTimeout(() => {
    if (!voicesLoaded) {
      voicesLoaded = true;
      listeners.forEach((fn) => fn());
    }
  }, 2000);
}

/** Subscribe to voice-list changes. Returns an unsubscribe function. */
export function onVoicesChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getVoiceState() {
  return { voice: cachedVoice, loaded: voicesLoaded };
}

/**
 * Speak `text`. Cancels anything already speaking.
 * Returns the utterance (or null when speech isn't available).
 */
export function speak(text, { rate = 0.95, pitch = 1, onStart, onEnd, onError } = {}) {
  if (!isSpeechSupported || !text) {
    onError?.();
    return null;
  }
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    const voice = currentVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = Math.min(2, Math.max(0.3, rate * (prefs.rateScale || 1)));
    u.pitch = pitch;
    u.onstart = () => onStart?.();
    u.onend = () => onEnd?.();
    u.onerror = (e) => {
      // "interrupted"/"canceled" are expected when we cancel on purpose
      if (e?.error === 'interrupted' || e?.error === 'canceled') onEnd?.({ interrupted: true });
      else onError?.(e);
    };
    // Chrome can get stuck in a paused state; resume() is a harmless no-op otherwise.
    synth.resume();
    synth.speak(u);
    return u;
  } catch (e) {
    onError?.(e);
    return null;
  }
}

export function cancelSpeech() {
  if (!isSpeechSupported) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
