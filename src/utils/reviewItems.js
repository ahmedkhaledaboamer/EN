import { splitKey } from '../hooks/useReview';
import { loadTopic } from '../data/topics';
import { loadEssential } from '../data/essentials';

/** Resolve review keys to full word data (saved words already carry it; others are loaded lazily). */
export async function loadReviewItems(keys, savedWords) {
  const saved = new Map(savedWords.map((w) => [`${w.slug}|${w.en}`, w]));
  const sources = [...new Set(keys.filter((k) => !saved.get(k)?.ar).map((k) => splitKey(k).source))];
  const words = new Map();
  await Promise.all(
    sources.map(async (source) => {
      const file = source.startsWith('essentials/')
        ? await loadEssential(source.slice('essentials/'.length))
        : await loadTopic(source);
      (file?.words ?? file?.items ?? []).forEach((w) => words.set(`${source}|${w.en}`, w));
    }),
  );
  const seenEn = new Set();
  return keys
    .map((key) => ({ key, ...(words.get(key) ?? saved.get(key)) }))
    .filter((w) => w.en && w.ar && !seenEn.has(w.en) && seenEn.add(w.en));
}
