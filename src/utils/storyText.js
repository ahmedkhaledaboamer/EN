// Helpers for the Story tab: split text into sentences (for audio) and find
// topic words inside the text (for tap-to-translate), including simple
// inflections ("buys", "checked", "teeth") and multi-word phrases ("wake up").

/** Split a story into sentences, keeping closing quotes with their sentence. */
export function splitSentences(text = '') {
  const parts = text.match(/[^.!?]+(?:[.!?]+["”’)]*|$)/g) ?? [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

const IRREGULAR = {
  tooth: ['teeth'],
  child: ['children'],
  person: ['people'],
  man: ['men'],
  woman: ['women'],
  wake: ['woke', 'woken'],
  get: ['got', 'gets', 'getting'],
  take: ['took', 'taken'],
  buy: ['bought'],
  pay: ['paid'],
  go: ['went', 'gone', 'goes'],
  sleep: ['slept'],
  run: ['ran', 'running'],
  win: ['won', 'winning'],
  lose: ['lost'],
  speak: ['spoke', 'spoken'],
  meet: ['met'],
  eat: ['ate', 'eaten'],
  drink: ['drank', 'drunk'],
  find: ['found'],
  steal: ['stole', 'stolen'],
  leave: ['left'],
  make: ['made'],
  bring: ['brought'],
  think: ['thought'],
  give: ['gave', 'given'],
  feel: ['felt'],
  write: ['wrote', 'written'],
  sell: ['sold'],
  tell: ['told'],
  say: ['said'],
  see: ['saw', 'seen'],
  come: ['came'],
  sit: ['sat', 'sitting'],
  stand: ['stood'],
  fly: ['flew', 'flown', 'flies'],
  ride: ['rode', 'ridden'],
  drive: ['drove', 'driven'],
  begin: ['began', 'begun'],
  forget: ['forgot', 'forgotten'],
  break: ['broke', 'broken'],
  choose: ['chose', 'chosen'],
  cut: ['cutting'],
  put: ['putting'],
  shut: ['shutting'],
  hurt: ['hurting'],
  born: ['born'],
  be: ['am', 'is', 'are', 'was', 'were', 'been'],
  have: ['has', 'had'],
  do: ['does', 'did', 'done'],
};

function formsOf(base) {
  const w = base.toLowerCase();
  const f = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}'s`]);
  if (/[^aeiou]y$/.test(w)) {
    f.add(`${w.slice(0, -1)}ies`);
    f.add(`${w.slice(0, -1)}ied`);
  }
  if (/e$/.test(w)) f.add(`${w.slice(0, -1)}ing`);
  if (/fe$/.test(w)) f.add(`${w.slice(0, -2)}ves`);
  else if (/f$/.test(w)) f.add(`${w.slice(0, -1)}ves`);
  // stop → stopped / stopping
  if (/[^aeiou][aeiou][bdgklmnprt]$/.test(w)) {
    const doubled = w + w.slice(-1);
    f.add(`${doubled}ed`);
    f.add(`${doubled}ing`);
  }
  (IRREGULAR[w] ?? []).forEach((x) => f.add(x));
  return f;
}

/** Build matchers from topic words, longest phrases first. */
export function buildWordMatchers(words = []) {
  return words
    .map((word) => ({
      word,
      parts: word.en.toLowerCase().split(/\s+/).map(formsOf),
    }))
    .sort((a, b) => b.parts.length - a.parts.length);
}

const TOKEN_RE = /^([^\p{L}\p{N}]*)((?:[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*))?(.*)$/u;

function parseChunk(chunk) {
  const m = chunk.match(TOKEN_RE);
  if (!m || !m[2]) return null;
  return { pre: m[1], core: m[2].toLowerCase().replace(/’/g, "'"), post: m[3] };
}

/**
 * Split one sentence into segments:
 *   { type: 'text', text } | { type: 'word', text, word }
 */
export function segmentSentence(sentence, matchers) {
  const chunks = sentence.split(/(\s+)/); // [word, space, word, space, ...]
  const tokens = chunks.map((c) => (/^\s*$/.test(c) ? null : parseChunk(c)));
  const segments = [];
  const pushText = (text) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last?.type === 'text') last.text += text;
    else segments.push({ type: 'text', text });
  };

  let i = 0;
  while (i < chunks.length) {
    let matched = null;
    if (tokens[i]) {
      for (const m of matchers) {
        let j = i;
        let ok = true;
        for (let p = 0; p < m.parts.length; p++) {
          const tok = tokens[j];
          // Inside a phrase, punctuation between words breaks the match ("wake, up")
          if (!tok || !m.parts[p].has(tok.core) || (p < m.parts.length - 1 && tok.post) || (p > 0 && tok.pre)) {
            ok = false;
            break;
          }
          if (p < m.parts.length - 1) j += 2; // skip the whitespace chunk
        }
        if (ok) {
          matched = { word: m.word, end: j };
          break;
        }
      }
    }

    if (matched) {
      const first = tokens[i];
      const last = tokens[matched.end];
      const full = chunks.slice(i, matched.end + 1).join('');
      pushText(first.pre);
      segments.push({
        type: 'word',
        word: matched.word,
        text: full.slice(first.pre.length, full.length - last.post.length),
      });
      pushText(last.post);
      i = matched.end + 1;
    } else {
      pushText(chunks[i]);
      i += 1;
    }
  }
  return segments;
}
