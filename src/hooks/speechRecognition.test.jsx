import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

/** Minimal fake of the browser's SpeechRecognition. */
class FakeRecognition {
  static last = null;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onend?.();
  }
  abort() {}
  /** Simulate the browser delivering a final result with alternatives. */
  say(...alternatives) {
    const result = alternatives.map((transcript) => ({ transcript }));
    result.isFinal = true;
    this.onresult?.({ resultIndex: 0, results: [result] });
    this.onend?.();
  }
  fail(error) {
    this.onerror?.({ error });
    this.onend?.();
  }
}

async function loadHook() {
  vi.resetModules();
  vi.stubGlobal('webkitSpeechRecognition', FakeRecognition);
  return import('./useSpeechRecognition');
}

afterEach(() => vi.unstubAllGlobals());

describe('useSpeakCheck', () => {
  it('listens, then scores what was said', async () => {
    const { useSpeakCheck, isRecognitionSupported } = await loadHook();
    expect(isRecognitionSupported).toBe(true);

    const { result } = renderHook(() => useSpeakCheck('Can I pay by card?'));
    act(() => result.current.start());
    expect(result.current.listening).toBe(true);
    expect(FakeRecognition.last.lang).toBe('en-US');

    act(() => FakeRecognition.last.say('can I pay by car', 'can I pay by card'));
    expect(result.current.listening).toBe(false);
    expect(result.current.result).toMatchObject({ score: 100, verdict: 'great', heard: 'can I pay by card' });
  });

  it('reports a blocked microphone', async () => {
    const { useSpeakCheck, recognitionErrorMessage } = await loadHook();
    const { result } = renderHook(() => useSpeakCheck('hello'));
    act(() => result.current.start());
    act(() => FakeRecognition.last.fail('not-allowed'));
    expect(result.current.error).toBe('not-allowed');
    expect(recognitionErrorMessage('not-allowed')).toMatch(/microphone/i);
  });

  it('treats ending without words as "no speech"', async () => {
    const { useSpeakCheck } = await loadHook();
    const { result } = renderHook(() => useSpeakCheck('hello'));
    act(() => result.current.start());
    act(() => FakeRecognition.last.stop());
    expect(result.current.error).toBe('no-speech');
  });
});
