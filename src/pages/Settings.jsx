import { useEffect, useRef, useState } from 'react';
import { CloudDownload, Download, RotateCcw, Upload, Volume2 } from 'lucide-react';
import Button from '../components/ui/Button';
import IntroLine from '../components/ui/IntroLine';
import { useSettings, DEFAULT_SETTINGS } from '../hooks/useSettings';
import { getEnglishVoices, isSpeechSupported, onVoicesChange, speak } from '../utils/speech';
import { TOPIC_ORDER, loadTopic } from '../data/topics';
import { ESSENTIALS_ORDER, loadEssential } from '../data/essentials';
import { useT } from '../hooks/useT';
import { preloadPages } from '../App';

const GOALS = [5, 10, 15, 20, 30];
const PREFIX = 'ebs:';

function Section({ title, description, children }) {
  const t = useT();
  return (
    <section className="glass-card p-5 sm:p-6">
      <h2 className="text-xl sm:text-2xl">{t(title)}</h2>
      {description && <p className="mt-1 text-sm">{t(description)}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="font-medium text-brand-ink dark:text-white">{t(label)}</span>
        {hint && <span className="mt-0.5 block text-sm">{t(hint)}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-yellow' : 'bg-neutral-300 dark:bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </label>
  );
}

function Chips({ options, value, onChange, label, format = (v) => v }) {
  const t = useT();
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            value === o
              ? 'bg-brand-yellow text-brand-ink shadow-yellow'
              : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300/70 dark:bg-white/10 dark:text-neutral-300'
          }`}
        >
          {t(String(format(o)))}
        </button>
      ))}
    </div>
  );
}

/** Download every ebs:* localStorage entry as a JSON backup file. */
function exportProgress() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) data[key] = localStorage.getItem(key);
  }
  const blob = new Blob([JSON.stringify({ app: 'english-by-situations', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `english-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Settings() {
  const t = useT();
  const { settings, update, reset } = useSettings();
  const [voices, setVoices] = useState(getEnglishVoices);
  const [message, setMessage] = useState(null);
  const [offline, setOffline] = useState('idle'); // idle | working | done | error
  const fileRef = useRef(null);

  useEffect(() => onVoicesChange(() => setVoices(getEnglishVoices())), []);

  const flash = (text, tone = 'ok') => {
    setMessage({ text, tone });
    setTimeout(() => setMessage(null), 4000);
  };

  const importProgress = async (file) => {
    try {
      const json = JSON.parse(await file.text());
      const data = json?.data;
      if (json?.app !== 'english-by-situations' || !data || typeof data !== 'object') throw new Error('bad file');
      const entries = Object.entries(data).filter(([k, v]) => k.startsWith(PREFIX) && typeof v === 'string');
      if (!entries.length) throw new Error('empty');
      if (!window.confirm('Replace your current progress with this backup?')) return;
      entries.forEach(([k, v]) => localStorage.setItem(k, v));
      window.location.reload();
    } catch {
      flash('This file is not a valid backup.', 'error');
    }
  };

  const resetAll = () => {
    if (!window.confirm('Delete ALL your progress, saved words, streak and settings? This cannot be undone.')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const downloadForOffline = async () => {
    setOffline('working');
    try {
      await Promise.all([preloadPages(), ...TOPIC_ORDER.map(loadTopic), ...ESSENTIALS_ORDER.map(loadEssential)]);
      setOffline('done');
    } catch {
      setOffline('error');
    }
  };

  return (
    <section className="mx-auto max-w-3xl pb-10 pt-10 sm:pt-16" aria-labelledby="settings-title">
      <IntroLine>{t('Make it yours')}</IntroLine>
      <h1 id="settings-title" className="mt-5 text-4xl sm:text-6xl">
        <span className="text-highlight">{t('Settings')}.</span>
      </h1>

      {message && (
        <p
          role="status"
          className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
            message.tone === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-8 space-y-6">
        <Section title="Interface language" description="Buttons and instructions. The English you learn stays in English.">
          <Chips
            label="Interface language"
            options={['en', 'ar']}
            value={settings.uiLanguage}
            onChange={(v) => update({ uiLanguage: v })}
            format={(v) => (v === 'en' ? 'English' : 'العربية')}
          />
        </Section>

        <Section title="Voice" description="The voice that reads words, sentences and stories.">
          {isSpeechSupported ? (
            <>
              <div>
                <label htmlFor="voice" className="mb-2 block font-medium text-brand-ink dark:text-white">
                  {t('English voice')}
                </label>
                <div className="flex gap-2">
                  <select
                    id="voice"
                    value={settings.voiceURI}
                    onChange={(e) => update({ voiceURI: e.target.value })}
                    className="min-w-0 flex-1 rounded-2xl border-2 border-transparent bg-white/80 px-4 py-2.5 text-brand-ink outline-none focus:border-brand-yellow dark:bg-white/5 dark:text-white"
                  >
                    <option value="">Automatic (best US English voice)</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <Button variant="secondary" onClick={() => speak('Hello! This is how I sound. Where can I find the milk?')}>
                    <Volume2 size={16} aria-hidden="true" /> Test
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="rate" className="mb-2 flex justify-between font-medium text-brand-ink dark:text-white">
                  {t('Speed')} <span className="font-mono text-sm">{settings.rateScale.toFixed(1)}×</span>
                </label>
                <input
                  id="rate"
                  type="range"
                  min="0.7"
                  max="1.2"
                  step="0.1"
                  value={settings.rateScale}
                  onChange={(e) => update({ rateScale: Number(e.target.value) })}
                  className="w-full accent-[#FDC52B]"
                />
                <div className="mt-1 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm">Audio isn&apos;t supported in this browser.</p>
          )}
        </Section>

        <Section title="Reading">
          <Toggle
            checked={settings.showArabic}
            onChange={(v) => update({ showArabic: v })}
            label="Show Arabic translations by default"
            hint="For sentences, stories and dialogues. You can still hide them on each page."
          />
          <div>
            <p className="mb-2 font-medium text-brand-ink dark:text-white">Text size</p>
            <Chips
              label="Text size"
              options={['normal', 'large']}
              value={settings.textSize}
              onChange={(v) => update({ textSize: v })}
              format={(v) => (v === 'normal' ? 'Normal' : 'Large')}
            />
          </div>
        </Section>

        <Section title="Daily goal" description="How many new words you want to learn each day. Shown on the Home page.">
          <Chips
            label="Daily goal"
            options={GOALS}
            value={settings.dailyGoal}
            onChange={(v) => update({ dailyGoal: v })}
            format={(v) => `${v} words`}
          />
        </Section>

        <Section
          title="Offline & backup"
          description="Your progress is stored in this browser only. Back it up to move it to another device."
        >
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportProgress}>
              <Download size={16} aria-hidden="true" /> {t('Download backup')}
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={16} aria-hidden="true" /> {t('Restore from backup')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importProgress(e.target.files[0])}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={downloadForOffline} disabled={offline === 'working'}>
              <CloudDownload size={16} aria-hidden="true" />
              {offline === 'working' ? 'Downloading…' : t('Make all lessons available offline')}
            </Button>
            {offline === 'done' && <span className="text-sm text-emerald-700 dark:text-emerald-300">All lessons are ready offline ✓</span>}
            {offline === 'error' && <span className="text-sm text-rose-700 dark:text-rose-300">Could not download. Check your connection.</span>}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Offline works after installing the app or visiting once. The microphone (speech recognition) still needs internet.
          </p>
        </Section>

        <Section title="Reset">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                reset();
                flash('Settings restored to default.');
              }}
              disabled={JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS)}
            >
              <RotateCcw size={16} aria-hidden="true" /> {t('Default settings')}
            </Button>
            <Button variant="ghost" onClick={resetAll} className="text-rose-700 dark:text-rose-300">
              {t('Delete all progress')}
            </Button>
          </div>
        </Section>
      </div>
    </section>
  );
}
