// ─────────────────────────────────────────────────────────────
//  Essentials registry: core building-block vocabulary
//  (days, numbers, pronouns, prepositions...).
//
//  To add a category: create <slug>.json in this folder (copy possessives.json),
//  add the slug to ESSENTIALS_ORDER, then run `npm run validate`.
// ─────────────────────────────────────────────────────────────
import { createRegistry, isReady } from '../registry';

export const ESSENTIALS_ORDER = [
  'days-of-week',
  'months',
  'seasons',
  'numbers-and-ordinals',
  'time',
  'colors',
  'personal-pronouns',
  'object-pronouns',
  'possessives',
  'demonstratives',
  'prepositions-of-place',
  'prepositions-of-time',
  'prepositions-of-movement',
  'directions-and-positions',
  'question-words',
  'articles-and-quantifiers',
  'common-verbs',
  'opposites',
  'frequency-and-connectors',
  'body-parts',
  'feelings-and-emotions',
  'jobs-and-professions',
];

const registry = createRegistry(
  ESSENTIALS_ORDER,
  import.meta.glob('./*.json', { eager: true, query: '?meta', import: 'default' }),
  import.meta.glob('./*.json', { import: 'default' }),
);

export const essentials = registry.list;
export const getEssentialMeta = registry.getMeta;
export const loadEssential = registry.load;
export const getNextEssential = registry.getNext;
export const isEssentialReady = isReady;
