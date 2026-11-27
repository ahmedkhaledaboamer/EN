// ─────────────────────────────────────────────────────────────
//  Topic registry
//
//  To add a topic:
//    1. Copy supermarket.json to <slug>.json in this folder and edit it.
//    2. Add the slug to TOPIC_ORDER below (position = learning-path order).
//    3. Run `npm run validate`.
//  No component changes needed.
//
//  Performance: lists (Home, /topics) only load a small "meta" object per
//  topic (see contentMetaPlugin in vite.config.js). The full JSON (words,
//  story, exercises...) is lazy-loaded when you open a topic page.
// ─────────────────────────────────────────────────────────────
import { createRegistry, isReady } from '../registry';

export const TOPIC_ORDER = [
  'supermarket',
  'meeting-people',
  'daily-routine',
  'family-home',
  'coffee-shop',
  'restaurant',
  'clothes-shopping',
  'school',
  'weather',
  'directions',
  'taxi',
  'gym-sports',
  'pharmacy',
  'hospital',
  'dentist',
  'vacation',
  'hotel',
  'airport',
  'public-transport',
  'cooking',
  'barber-salon',
  'party',
  'movies',
  'bank',
  'phone-internet',
  'online-shopping',
  'office-work',
  'developer-workday',
  'job-interview',
  'renting-apartment',
  'police-emergency',
  'car-rental',
  'complaints',
  'healthy-lifestyle',
  'neighbors',
  'travel-problems',
  'social-media',
  'volunteering',
  'negotiation',
  'presentations',
  'environment',
  'university-life',
  'news-media',
  'relationships',
  'startup',
  'technology-ai',
  'leadership',
  'debate-persuasion',
  'economy-finance',
  'law-rights',
  'psychology',
  'culture-identity',
  'academic-writing',
  'future-of-work',
  'idioms',
  'diplomacy',
  'literature-art',
  'ethics',
  'science-innovation',
  'humor-wordplay',
  'global-affairs',
];

const registry = createRegistry(
  TOPIC_ORDER,
  import.meta.glob('./*.json', { eager: true, query: '?meta', import: 'default' }),
  import.meta.glob('./*.json', { import: 'default' }),
);

/** Topic metadata in learning-path order. */
export const topics = registry.list;
export const getTopicMeta = registry.getMeta;
export const loadTopic = registry.load;
export const getNextTopic = registry.getNext;
export const isTopicReady = isReady;
