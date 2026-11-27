import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { setSpeechPrefs } from '../../utils/speech';

/** Applies global settings outside React state: speech voice/speed and text size. Renders nothing. */
export default function SettingsSync() {
  const { settings } = useSettings();

  useEffect(() => {
    setSpeechPrefs({ voiceURI: settings.voiceURI, rateScale: settings.rateScale });
  }, [settings.voiceURI, settings.rateScale]);

  useEffect(() => {
    // Tailwind sizes are in rem, so scaling the root font size scales the whole UI
    document.documentElement.style.fontSize = settings.textSize === 'large' ? '112.5%' : '';
  }, [settings.textSize]);

  return null;
}
