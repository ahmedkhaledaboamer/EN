import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `import meta from './file.json?meta'` (topics and essentials) returns only the fields needed by
 * topic cards and lists, so the Home page and /topics don't bundle every
 * word, story and exercise. The full file is lazy-loaded on the topic page.
 * Returns JSON text; Vite's built-in JSON plugin turns it into a module.
 */
function contentMetaPlugin() {
  return {
    name: 'topic-meta',
    enforce: 'pre',
    async load(id) {
      const [file, query = ''] = id.split('?');
      if (!file.endsWith('.json') || !new URLSearchParams(query).has('meta')) return null;

      this.addWatchFile(file);
      const t = JSON.parse(await readFile(file, 'utf8'));
      // Topics have `words`, essentials have `items`; both expose the same meta shape.
      const words = Array.isArray(t.words) ? t.words : Array.isArray(t.items) ? t.items : [];

      return JSON.stringify({
        slug: t.slug,
        title: t.title,
        titleAr: t.titleAr,
        emoji: t.emoji,
        level: t.level,
        description: t.description ?? '',
        descriptionAr: t.descriptionAr ?? '',
        wordsCount: words.length,
        sentencesCount: t.sentences?.length ?? 0,
        exercisesCount: t.exercises?.length ?? 0,
        wordKeys: words.map((w) => w.en),
        preview: words.slice(0, 4).map(({ en, ar, phonetic }) => ({ en, ar, phonetic })),
      });
    },
  };
}

export default defineConfig({
  plugins: [contentMetaPlugin(), react()],
  test: {
    environment: 'jsdom',
    globals: true, // lets Testing Library clean up the DOM after each test
    include: ['src/**/*.test.{js,jsx}'],
  },
});
