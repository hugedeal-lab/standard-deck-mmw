// Copy budgets: how many characters each text field of each layout holds.
//
// For every layout in the QA deck (test-deck.html) and every text field it
// fills, grow that field -- all instances of it at once, e.g. every
// items[].caption -- with realistic copy while the rest of the slide keeps its
// sample content, and dispatch through the real engine. The engine's own text
// fit (fitTexts in deck-layouts.js) decides the result, so the budgets and
// the engine's overflow warnings can never disagree:
//   fits  = longest copy that keeps the template's look: small type at its
//           design size, display type (>14pt) inside its own box
//   max   = longest copy before it collides with something (small type
//           shrinks to fit first; display type wraps into free space)
//
// Writes COPY_BUDGETS.md (full table) and regenerates the budget block in
// mmw_presentation_builder_prompt.txt between its BEGIN/END COPY BUDGETS
// markers.
//
// Usage:  node tools/copy_budgets.js        (rebuild test-deck.html first if
//                                            layouts or samples changed)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = { StandardDeck: { SD_CONST: { SLIDE_W: 13.33, SLIDE_H: 7.5, SAFE_X_MIN: 0.5, SAFE_Y_MIN: 0.75 } } };
const warnings = [];
console.warn = (m) => warnings.push(String(m));
console.error = () => {};   // legacy-alias notices etc. are not copy problems
require(path.join(ROOT, 'deck-layouts.js'));
require(path.join(ROOT, 'map-data.js'));
require(path.join(ROOT, 'deck-maps.js'));
const DL = window.DeckLayouts;

const html = fs.readFileSync(path.join(ROOT, 'test-deck.html'), 'utf8');
const a = html.indexOf('var D=[') + 6, b = html.indexOf('\n];', a);
const D = JSON.parse(html.slice(a, b + 2));

// Keys that are not copy: styling, data, references, structured inputs.
const SKIP = new Set(['layout', 'bgColor', 'bgImage', 'notes', 'style', 'type', 'tone', 'color', 'icon',
  'dark', 'src', 'images', 'marker', 'fit', 'highlight', 'globes', 'chart', 'code', 'stroke', 'noStroke',
  'legend', 'size', 'cities', 'els', 'pct', 'number', 'col', 'row', 'colSpan', 'rowSpan', 'hereLabel']);
const WORDS = ('drive consideration with intenders across priority markets while retail partners ' +
  'support the launch through creative refreshes and always on social').split(' ');
const GRID = [];
for (let L = 4; L < 40; L += 2) GRID.push(L);
for (let L = 40; L < 120; L += 5) GRID.push(L);
for (let L = 120; L < 300; L += 10) GRID.push(L);
for (let L = 300; L <= 600; L += 25) GRID.push(L);

function copyOf(L, tag) {
  let s = tag;
  for (let i = 0; s.length < L; i++) s += ' ' + WORDS[i % WORDS.length];
  return s.slice(0, Math.max(L, tag.length));
}
// Collect field paths: [{norm, path:[keys...]}]
function fields(v, p, out, key) {
  if (typeof v === 'string') { if (!SKIP.has(key) && v.trim()) out.push(p.slice()); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => fields(x, p.concat(i), out, key)); return; }
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) fields(x, p.concat(k), out, k);
}
const norm = (p) => p.map((k) => (typeof k === 'number' ? '[]' : '.' + k)).join('').replace(/^\./, '').replace(/\.\[\]/g, '[]');
function setAt(o, p, v) { let t = o; for (let i = 0; i < p.length - 1; i++) t = t[p[i]]; t[p[p.length - 1]] = v; }
const clone = (x) => JSON.parse(JSON.stringify(x));
const textOf = (e) => (e.paras ? e.paras.map((q) => (q.runs || []).map((r) => r.text || '').join('')).join(' ') : String(e.text || ''));

let gid = 0;
function trial(row, group, L) {
  const tagBase = 'Zq' + (gid++) + 'x';
  const d = clone(row);
  group.forEach((p, j) => setAt(d, p, copyOf(L, tagBase + j)));
  warnings.length = 0;
  const raw = (DL.LAYOUT_MAP[row.layout] || (() => []))(clone(d)) || [];
  const els = DL.dispatch(clone(d)) || [];
  const re = new RegExp(tagBase, 'i');
  const hit = els.filter((e) => e.type === 't' && re.test(textOf(e)));
  if (!hit.length) return 'absent';
  if (warnings.some((w) => re.test(w))) return 'over';
  // Display type never shrinks; past its own box it is no longer the
  // template's look even where nothing collides.
  if (hit.some((e) => e.size > 14 && DL.TEXT_FIT.overBy(e, e.size, e.h) > 0)) return 'shrunk';
  const shrunk = hit.some((e) => {
    const r = raw.find((x) => x.type === 't' && textOf(x) === textOf(e) && x.x === e.x && x.y === e.y);
    return r && r.size && e.size < r.size;
  });
  return shrunk ? 'shrunk' : 'fits';
}

const budgets = {};   // layout -> norm -> {fits, max}
// tableOfContents measures its own list (prompt section 15.1: 9 entries,
// ~31 chars each) and drops what doesn't fit, so it is not budgeted here.
const EXCLUDE = new Set(['tableOfContents']);
for (const row of D) {
  if (!DL.LAYOUT_MAP[row.layout] || EXCLUDE.has(row.layout)) continue;
  const all = []; fields(row, [], all, '');
  const groups = {};
  all.forEach((p) => (groups[norm(p)] = groups[norm(p)] || []).push(p));
  for (const [name, group] of Object.entries(groups)) {
    let fits = 0, max = 0, absent = true, shrank = false;
    for (const L of GRID) {
      const r = trial(row, group, L);
      if (r === 'absent') continue;
      absent = false;
      if (r === 'over') break;
      max = L;
      if (r === 'shrunk') shrank = true;
      else if (!shrank) fits = L;
    }
    if (absent) continue;
    const B = (budgets[row.layout] = budgets[row.layout] || {});
    const prev = B[name];
    B[name] = prev ? { fits: Math.min(prev.fits, fits), max: Math.min(prev.max, max) } : { fits, max };
  }
}

const TOP = GRID[GRID.length - 1];
const fmt = (v) => (v.max >= TOP ? (v.fits >= TOP ? '600+' : v.fits + '/600+') : v.fits === v.max ? String(v.max) : v.fits + '/' + v.max);

// COPY_BUDGETS.md
const md = ['# Copy budgets', '',
  'Characters each text field holds before it overflows, per layout. Generated by',
  '`tools/copy_budgets.js` from the engine\'s own text-fit check (`fitTexts` in',
  'deck-layouts.js), so these numbers and the engine\'s overflow warnings agree.', '',
  '`N/M`: up to N characters keeps the template\'s look (small type at its design size,',
  'display type inside its own box). Up to M it still renders cleanly: small type shrinks,',
  'display type wraps into free space. Past M the engine warns and the copy collides or spills',
  'in PowerPoint. A single number means both are the same. `[]` = per item (every item of that list). Budgets assume the other fields',
  'carry typical copy; a crowded slide holds a little less. `tableOfContents` is not listed:',
  'it measures its own list (prompt section 15.1).', '',
  '| Layout | Field | Budget |', '|---|---|---|'];
for (const [l, B] of Object.entries(budgets))
  for (const [f, v] of Object.entries(B)) md.push('| `' + l + '` | `' + f + '` | ' + fmt(v) + ' |');
fs.writeFileSync(path.join(ROOT, 'COPY_BUDGETS.md'), md.join('\n') + '\n');

// Compact block for the prompt: layouts with identical budgets share a line
// (the 8 dividers, the Light/Dark pairs, the social sheets).
const byLine = new Map();
for (const [l, B] of Object.entries(budgets)) {
  const key = Object.entries(B).map(([f, v]) => f + ' ' + fmt(v)).join(' | ');
  byLine.set(key, (byLine.get(key) || []).concat(l));
}
const lines = [...byLine].map(([key, ls]) => ls.join(', ') + ': ' + key);
const P = path.join(ROOT, 'mmw_presentation_builder_prompt.txt');
const BEGIN = '-- BEGIN COPY BUDGETS (generated by tools/copy_budgets.js) --', END = '-- END COPY BUDGETS --';
let prompt = fs.readFileSync(P, 'utf8');
if (prompt.includes(BEGIN)) {
  prompt = prompt.slice(0, prompt.indexOf(BEGIN)) + BEGIN + '\n' + lines.join('\n') + '\n' + prompt.slice(prompt.indexOf(END));
  fs.writeFileSync(P, prompt);
  console.log('updated prompt budget block');
} else console.log('prompt has no budget markers -- block not written');
console.log('wrote COPY_BUDGETS.md: ' + Object.keys(budgets).length + ' layouts, ' +
  Object.values(budgets).reduce((n, B) => n + Object.keys(B).length, 0) + ' fields');
