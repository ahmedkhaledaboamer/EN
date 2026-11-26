/**
 * Shared registry logic for lazily loaded content folders (topics, essentials).
 *
 *   order       – slugs in display / learning-path order (the "registration")
 *   metaModules – import.meta.glob('./*.json', { eager: true, query: '?meta', import: 'default' })
 *   loaders     – import.meta.glob('./*.json', { import: 'default' })
 *
 * import.meta.glob must be called with literals in each folder's index.js,
 * so the globs are created there and passed in.
 */
export function createRegistry(order, metaModules, loaders) {
  const fileOf = (slug) => `./${slug}.json`;
  const list = order.map((slug) => metaModules[fileOf(slug)]).filter(Boolean);

  return {
    list,
    getMeta: (slug) => list.find((t) => t.slug === slug) ?? null,
    /** Full JSON (lazy). Resolves to null if the slug isn't registered. */
    load: async (slug) => {
      if (!order.includes(slug)) return null;
      const load = loaders[fileOf(slug)];
      return load ? load() : null;
    },
    getNext: (slug) => {
      const i = list.findIndex((t) => t.slug === slug);
      return i >= 0 ? list[i + 1] ?? null : null;
    },
  };
}

/** Works with meta objects (wordsCount) and full files (words[] or items[]). */
export function isReady(entry) {
  return (entry?.wordsCount ?? entry?.words?.length ?? entry?.items?.length ?? 0) > 0;
}
