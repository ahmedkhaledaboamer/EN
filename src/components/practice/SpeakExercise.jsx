import { Mic } from 'lucide-react';
import Button from '../ui/Button';
import SpeakButton from '../speech/SpeakButton';
import MicButton from '../speech/MicButton';
import SpeakFeedback from '../speech/SpeakFeedback';
import { useSpeakCheck } from '../../hooks/useSpeechRecognition';
import { SPEAK_PASS } from '../../utils/speechCompare';

/**
 * "Say it": read the sentence out loud. You can try as many times as you like,
 * then submit your best attempt. Correct when at least SPEAK_PASS% of the words were heard.
 *   exercise: { type: 'speak', answer: 'English sentence', note?: 'Arabic meaning' }
 */
export default function SpeakExercise({ exercise, locked, onSubmit }) {
  const check = useSpeakCheck(exercise.answer);
  const { result, error } = check;
  const micBlocked = error === 'not-allowed' || error === 'service-not-allowed' || error === 'audio-capture';

  const submit = () =>
    onSubmit({ correct: (result?.score ?? 0) >= SPEAK_PASS, given: result?.heard || '(nothing heard)' });

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Mic size={16} aria-hidden="true" /> Say this sentence out loud:
      </p>
      <div className="mt-3 flex items-start gap-3">
        <p className="flex-1 text-xl font-semibold leading-relaxed text-brand-ink sm:text-2xl dark:text-white">
          {exercise.answer}
        </p>
        <SpeakButton text={exercise.answer} id="speak-exercise-model" label="Listen first" />
      </div>
      {exercise.note && (
        <p dir="rtl" lang="ar" className="mt-2 text-neutral-500 dark:text-neutral-400">
          {exercise.note}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <MicButton check={check} size="lg" label="Start speaking" />
        <p className="text-sm">
          {check.listening ? 'Listening… tap again to stop.' : result ? 'Try again or check your answer.' : 'Tap the mic and speak clearly.'}
        </p>
      </div>

      <SpeakFeedback check={check} />

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={submit} disabled={locked || !result || check.listening}>
          Check
        </Button>
        {micBlocked && (
          <Button variant="ghost" onClick={() => onSubmit({ correct: false, given: '(skipped: no microphone)' })} disabled={locked}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
