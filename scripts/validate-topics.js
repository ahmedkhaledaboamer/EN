#!/usr/bin/env node
/**
 * Validates every topic JSON (src/data/topics/) and essentials JSON (src/data/essentials/).
 *
 *   node scripts/validate-topics.js                 → everything + registry checks
 *   node scripts/validate-topics.js bank months     → only these slugs (no registry check)
 *   node scripts/validate-topics.js --essentials    → one collection (--topics / --essentials)
 *
 * Errors make the script exit with code 1. Warnings are printed but do not fail.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOPICS_DIR = path.join(ROOT, 'src', 'data', 'topics');
const INDEX_FILE = path.join(TOPICS_DIR, 'index.js');

const COUNTS = { words: 20, sentences: 10, exercises: 8 };
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EXERCISE_TYPES = ['mcq', 'fill', 'order', 'listen'];
const STORY_WORDS = { min: 120, max: 180 };
const ARABIC_RE = /[؀-ۿ]/;

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const tokens = (s) => s.trim().split(/\s+/);

function validateTopic(file) {
  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  const expectedSlug = path.basename(file, '.json');
  let t;
  try {
    t = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { slug: expectedSlug, errors: [`Invalid JSON: ${e.message}`], warnings };
  }

  const arabic = (value, where) => {
    if (!isNonEmptyString(value)) err(`${where} is empty`);
    else if (!ARABIC_RE.test(value)) err(`${where} has no Arabic text`);
  };

  // ── Top-level fields ───────────────────────────────────────
  for (const key of ['slug', 'title', 'emoji', 'level']) {
    if (!isNonEmptyString(t[key])) err(`missing "${key}"`);
  }
  arabic(t.titleAr, 'titleAr');
  if (t.slug && t.slug !== expectedSlug) err(`slug "${t.slug}" does not match file name "${expectedSlug}.json"`);
  if (t.level && !LEVELS.includes(t.level)) err(`level "${t.level}" is not one of ${LEVELS.join(', ')}`);
  if (!isNonEmptyString(t.description)) warn('missing "description"');
  if (t.descriptionAr !== undefined && t.descriptionAr !== '') arabic(t.descriptionAr, 'descriptionAr');
  else warn('missing "descriptionAr"');

  for (const key of ['words', 'sentences', 'exercises']) {
    if (!Array.isArray(t[key])) err(`"${key}" must be an array`);
    else if (t[key].length !== COUNTS[key]) err(`${key}: expected ${COUNTS[key]}, found ${t[key].length}`);
  }

  // ── Words ──────────────────────────────────────────────────
  const seen = new Set();
  (Array.isArray(t.words) ? t.words : []).forEach((w, i) => {
    const where = `words[${i}]${w?.en ? ` "${w.en}"` : ''}`;
    for (const key of ['en', 'phonetic', 'example']) {
      if (!isNonEmptyString(w?.[key])) err(`${where}: missing "${key}"`);
    }
    arabic(w?.ar, `${where}.ar`);
    if (isNonEmptyString(w?.phonetic) && !/^\/.+\/$/.test(w.phonetic.trim())) {
      err(`${where}: phonetic must look like /.../`);
    }
    const key = w?.en?.toLowerCase();
    if (key) {
      if (seen.has(key)) err(`${where}: duplicate word`);
      seen.add(key);
    }
  });

  // ── Sentences ──────────────────────────────────────────────
  (Array.isArray(t.sentences) ? t.sentences : []).forEach((s, i) => {
    if (!isNonEmptyString(s?.en)) err(`sentences[${i}]: missing "en"`);
    arabic(s?.ar, `sentences[${i}].ar`);
  });

  // ── Story ──────────────────────────────────────────────────
  if (!t.story || typeof t.story !== 'object') err('missing "story"');
  else {
    if (!isNonEmptyString(t.story.title)) err('story.title is empty');
    if (!isNonEmptyString(t.story.text)) err('story.text is empty');
    arabic(t.story.translation, 'story.translation');
    if (isNonEmptyString(t.story.text)) {
      const n = tokens(t.story.text).length;
      if (n < STORY_WORDS.min || n > STORY_WORDS.max) {
        warn(`story has ${n} words (target ${STORY_WORDS.min}-${STORY_WORDS.max})`);
      }
    }
  }

  // ── Grammar ────────────────────────────────────────────────
  if (!t.grammar || typeof t.grammar !== 'object') err('missing "grammar"');
  else {
    if (!isNonEmptyString(t.grammar.title)) err('grammar.title is empty');
    arabic(t.grammar.explanationAr, 'grammar.explanationAr');
    if (!isNonEmptyString(t.grammar.rule)) err('grammar.rule is empty');
    const ex = t.grammar.examples;
    if (!Array.isArray(ex) || ex.length === 0) err('grammar.examples is empty');
    else {
      if (ex.length < 4 || ex.length > 5) warn(`grammar has ${ex.length} examples (target 4-5)`);
      ex.forEach((e, i) => {
        if (typeof e === 'string') {
          if (!isNonEmptyString(e)) err(`grammar.examples[${i}] is empty`);
          return;
        }
        if (!isNonEmptyString(e?.en)) err(`grammar.examples[${i}]: missing "en"`);
        arabic(e?.ar, `grammar.examples[${i}].ar`);
      });
    }
  }

  // ── Exercises ──────────────────────────────────────────────
  (Array.isArray(t.exercises) ? t.exercises : []).forEach((ex, i) => {
    const where = `exercises[${i}] (${ex?.type ?? '?'})`;
    if (!EXERCISE_TYPES.includes(ex?.type)) {
      err(`${where}: unknown type, use one of ${EXERCISE_TYPES.join(', ')}`);
      return;
    }
    if (!isNonEmptyString(ex.answer)) err(`${where}: missing "answer"`);

    if (ex.type === 'mcq') {
      if (!isNonEmptyString(ex.question)) err(`${where}: missing "question"`);
      if (!Array.isArray(ex.options) || ex.options.length < 2) err(`${where}: needs at least 2 options`);
      else {
        if (!ex.options.includes(ex.answer)) err(`${where}: answer "${ex.answer}" is not one of the options`);
        if (new Set(ex.options).size !== ex.options.length) err(`${where}: duplicate options`);
      }
    }
    if (ex.type === 'fill') {
      if (!isNonEmptyString(ex.sentence) || !ex.sentence.includes('___')) {
        err(`${where}: sentence must contain "___"`);
      } else if (ex.sentence.split('___').length !== 2) {
        err(`${where}: sentence must contain exactly one "___"`);
      }
      // Optional: other answers that are also correct
      if (ex.accept !== undefined && (!Array.isArray(ex.accept) || !ex.accept.every(isNonEmptyString))) {
        err(`${where}: "accept" must be an array of non-empty strings`);
      }
    }
    if (ex.type === 'order') {
      // The words are shuffled, so compare them as a multiset with the answer's tokens.
      if (!Array.isArray(ex.words) || ex.words.length < 2) err(`${where}: needs at least 2 words`);
      else if (isNonEmptyString(ex.answer)) {
        const a = [...ex.words].sort().join(' ');
        const b = tokens(ex.answer).sort().join(' ');
        if (a !== b) err(`${where}: words do not form the answer "${ex.answer}"`);
        if (ex.words.join(' ') === ex.answer.trim()) warn(`${where}: words are already in the correct order`);
      }
    }
    if (ex.type === 'listen') {
      if (!isNonEmptyString(ex.audioText)) err(`${where}: missing "audioText"`);
    }
  });

  return { slug: t.slug ?? expectedSlug, errors, warnings };
}

// ── Essentials ───────────────────────────────────────────────
const ESSENTIALS_DIR = path.join(ROOT, 'src', 'data', 'essentials');
const MIN_ITEMS = 4; // the quiz needs at least 3 wrong options

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const containsItem = (sentence, en) =>
  new RegExp(`(^|[^\\p{L}\\p{N}'])${escapeRe(en)}(?=$|[^\\p{L}\\p{N}'])`, 'iu').test(sentence);

function validateEssential(file) {
  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  const expectedSlug = path.basename(file, '.json');
  let t;
  try {
    t = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { slug: expectedSlug, errors: [`Invalid JSON: ${e.message}`], warnings };
  }
  const arabic = (value, where) => {
    if (!isNonEmptyString(value)) err(`${where} is empty`);
    else if (!ARABIC_RE.test(value)) err(`${where} has no Arabic text`);
  };

  for (const key of ['slug', 'title', 'emoji', 'level']) {
    if (!isNonEmptyString(t[key])) err(`missing "${key}"`);
  }
  arabic(t.titleAr, 'titleAr');
  arabic(t.intro, 'intro');
  if (t.slug && t.slug !== expectedSlug) err(`slug "${t.slug}" does not match file name "${expectedSlug}.json"`);
  if (t.level && !LEVELS.includes(t.level)) err(`level "${t.level}" is not one of ${LEVELS.join(', ')}`);

  // Items
  if (!Array.isArray(t.items)) err('"items" must be an array');
  else if (t.items.length < MIN_ITEMS) err(`items: need at least ${MIN_ITEMS}, found ${t.items.length}`);
  const seen = new Set();
  let fillable = 0;
  (Array.isArray(t.items) ? t.items : []).forEach((it, i) => {
    const where = `items[${i}]${it?.en ? ` "${it.en}"` : ''}`;
    for (const key of ['en', 'phonetic', 'example']) {
      if (!isNonEmptyString(it?.[key])) err(`${where}: missing "${key}"`);
    }
    arabic(it?.ar, `${where}.ar`);
    arabic(it?.exampleAr, `${where}.exampleAr`);
    if (isNonEmptyString(it?.phonetic) && !/^\/.+\/$/.test(it.phonetic.trim())) err(`${where}: phonetic must look like /.../`);
    const key = it?.en?.toLowerCase();
    if (key) {
      if (seen.has(key)) err(`${where}: duplicate item`);
      seen.add(key);
    }
    if (isNonEmptyString(it?.en) && isNonEmptyString(it?.example)) {
      if (containsItem(it.example, it.en)) fillable++;
      else warn(`${where}: example does not contain "${it.en}" (skipped by fill-the-blank questions)`);
    }
  });
  const arValues = (t.items ?? []).map((it) => it?.ar).filter(Boolean);
  if (new Set(arValues).size !== arValues.length) warn('two items share the same Arabic meaning');
  if (Array.isArray(t.items) && t.items.length && fillable < Math.min(4, t.items.length)) {
    warn(`only ${fillable} items can be used for fill-the-blank questions`);
  }

  // Optional table: { columns, rows } or an array of rows (first = header)
  if (t.table !== undefined && t.table !== null) {
    let columns;
    let rows;
    if (Array.isArray(t.table)) [columns, ...rows] = t.table;
    else ({ columns, rows } = t.table);
    if (!Array.isArray(columns) || !columns.length || !columns.every(isNonEmptyString)) {
      err('table: "columns" must be non-empty strings');
    } else if (!Array.isArray(rows) || !rows.length) err('table: needs at least one row');
    else {
      rows.forEach((row, r) => {
        if (!Array.isArray(row)) err(`table row ${r + 1} must be an array`);
        else if (row.length !== columns.length) err(`table row ${r + 1} has ${row.length} cells, expected ${columns.length}`);
        else if (!row.some(isNonEmptyString)) err(`table row ${r + 1} is empty`);
      });
    }
  }

  // Optional tips: Arabic strings
  if (t.tips !== undefined) {
    if (!Array.isArray(t.tips)) err('"tips" must be an array');
    else t.tips.forEach((tip, i) => arabic(tip, `tips[${i}]`));
  }

  return { slug: t.slug ?? expectedSlug, errors, warnings };
}

// ── Registry ─────────────────────────────────────────────────
function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

function readRegistry(indexFile, constName) {
  if (!fs.existsSync(indexFile)) return null;
  const src = fs.readFileSync(indexFile, 'utf8');
  const match = src.match(new RegExp(`${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return null;
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

function checkRegistry(collection) {
  const errors = [];
  const warnings = [];
  const registry = readRegistry(collection.index, collection.constName);
  if (!registry) {
    errors.push(`could not find ${collection.constName} in ${path.relative(ROOT, collection.index)}`);
    return { errors, warnings };
  }
  const fileSlugs = new Set(listJson(collection.dir).map((f) => path.basename(f, '.json')));
  registry.forEach((slug) => {
    if (!fileSlugs.has(slug)) errors.push(`"${slug}" is in ${collection.constName} but ${slug}.json does not exist`);
  });
  registry
    .filter((s, i) => registry.indexOf(s) !== i)
    .forEach((s) => errors.push(`"${s}" appears twice in ${collection.constName}`));
  fileSlugs.forEach((slug) => {
    if (!registry.includes(slug)) {
      warnings.push(`${slug}.json is not registered in ${collection.constName} (it won't appear in the app)`);
    }
  });
  return { errors, warnings };
}

// ── Run ──────────────────────────────────────────────────────
const COLLECTIONS = [
  { name: 'Topics', dir: TOPICS_DIR, index: INDEX_FILE, constName: 'TOPIC_ORDER', validate: validateTopic },
  {
    name: 'Essentials',
    dir: ESSENTIALS_DIR,
    index: path.join(ESSENTIALS_DIR, 'index.js'),
    constName: 'ESSENTIALS_ORDER',
    validate: validateEssential,
  },
];

// Args: slugs (looked up in topics and essentials), or --topics / --essentials for one collection
const args = process.argv.slice(2);
const onlyCollection = args.includes('--topics') ? 'Topics' : args.includes('--essentials') ? 'Essentials' : null;
const only = args.filter((a) => !a.startsWith('--')).map((s) => s.replace(/\.json$/, ''));

let errorCount = 0;
let warnCount = 0;
let passed = 0;
let failed = 0;

for (const col of COLLECTIONS) {
  if (onlyCollection && col.name !== onlyCollection) continue;

  const files = only.length
    ? only.map((slug) => path.join(col.dir, `${slug}.json`)).filter((f) => fs.existsSync(f))
    : listJson(col.dir);
  if (!files.length && only.length) continue;

  const results = files.map((f) => col.validate(f));
  console.log(c.bold(`\n${col.name}: validating ${results.length} file(s)\n`));
  for (const r of results) {
    const status = r.errors.length ? c.red('✗') : r.warnings.length ? c.yellow('!') : c.green('✓');
    console.log(`${status} ${r.slug}`);
    r.errors.forEach((e) => console.log(`    ${c.red('error')}  ${e}`));
    r.warnings.forEach((w) => console.log(`    ${c.yellow('warn')}   ${w}`));
    errorCount += r.errors.length;
    warnCount += r.warnings.length;
    if (r.errors.length) failed++;
    else passed++;
  }

  // Duplicate slugs inside the collection
  const counts = {};
  results.forEach((r) => (counts[r.slug] = (counts[r.slug] ?? 0) + 1));
  const globalErrors = Object.entries(counts)
    .filter(([, n]) => n > 1)
    .map(([slug]) => `duplicate slug "${slug}"`);
  let globalWarnings = [];

  // Registry check (full run only)
  if (!only.length) {
    const reg = checkRegistry(col);
    globalErrors.push(...reg.errors);
    globalWarnings = reg.warnings;
  }
  if (globalErrors.length || globalWarnings.length) {
    console.log(c.bold(`\n${col.name} registry`));
    globalErrors.forEach((e) => console.log(`    ${c.red('error')}  ${e}`));
    globalWarnings.forEach((w) => console.log(`    ${c.yellow('warn')}   ${w}`));
  }
  errorCount += globalErrors.length;
  warnCount += globalWarnings.length;
}

// Slugs passed as arguments that exist nowhere
const missing = only.filter((slug) => !COLLECTIONS.some((col) => fs.existsSync(path.join(col.dir, `${slug}.json`))));
missing.forEach((slug) => console.log(`${c.red('✗')} ${slug}\n    ${c.red('error')}  file not found`));
errorCount += missing.length;
failed += missing.length;

console.log(
  `\n${c.bold('Summary:')} ${passed} passed, ${failed} failed · ${errorCount} error(s), ${warnCount} warning(s)\n`,
);
process.exit(errorCount ? 1 : 0);
