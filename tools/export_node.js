// Run the REAL browser export path (deck-shell.js exportPPTX) under Node with a
// minimal DOM shim, so the exporter can be exercised without a browser and a
// .pptx can be produced server-side.
//
// This is deliberately NOT a reimplementation: standard-deck.js, deck-layouts.js
// and deck-shell.js are executed verbatim in a shared vm context. A bug found
// here is a bug in the code the browser runs.
const fs = require('fs'), path = require('path'), vm = require('vm');

const SRC = process.env.MMW_SRC || '/mnt/workspace/output/mmw-v2/';
// Assets are read from their own root: the published copies live on a synced
// surface where some files block indefinitely on read.
const ASSETS = process.env.MMW_ASSETS || SRC;
const OUT = process.argv[2] || '/tmp/mmw_layout_reference.pptx';
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

// ---- image cache: real bytes as data URIs, keyed by the path layouts use ----
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const imageCache = {};
// Assets may be served re-encoded (photos flattened to JPEG, oversized art
// downscaled) to keep the exported deck a sensible size. _map.json maps the
// logical name the layouts use to the file actually on disk; the data URI
// carries the real MIME, which is what decides the media part's type.
const AMAP = (() => {
  const f = path.join(ASSETS, '_map.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
})();
function cacheOne(logical, file) {
  const ext = path.extname(file).toLowerCase();
  if (!MIME[ext]) return;
  const abs = path.join(ASSETS, file);
  if (!fs.existsSync(abs)) return;
  const uri = 'data:' + MIME[ext] + ';base64,' + fs.readFileSync(abs).toString('base64');
  imageCache[logical] = uri;
  imageCache[path.basename(logical)] = uri;   // layouts sometimes use the bare name
}
function cacheDir(dir) {
  if (AMAP) {
    Object.entries(AMAP).forEach(([logical, file]) => {
      if (logical.startsWith(dir.replace(/^assets\//, '') + '/')) cacheOne('assets/' + logical, file);
    });
    return;
  }
  const abs = path.join(ASSETS, dir);
  if (!fs.existsSync(abs)) return;
  for (const f of fs.readdirSync(abs)) cacheOne(dir + '/' + f, dir + '/' + f);
}
console.error('[1] caching assets...');
['assets/logos', 'assets/backgrounds', 'assets/photos', 'assets/social'].forEach(cacheDir);
console.error('[2] cached', Object.keys(imageCache).length, 'entries');

// The four brand-mark ids the artifact declares as hidden <img> tags.
// Inline placeholder tile for photo wells. Generated once and embedded rather
// than read from a scratch file -- a temp path gets cleared between runs and
// the export then dies with ENOENT partway through.
const PLACEHOLDER = 'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAAPAAAACWAQMAAAB1c8kWAAAABlBMVEXW1tbA' +
  'wMDLy8v/2PXBAAAAAXRSTlMAQObYZgAAAClJREFUeNrtwTEBAAAAwqD1T20J' +
  'T6AAAAAAAAAAAAAAAAAAAAAAAOBvAAABAAABAAABAAABAAABAAABAAABAAAB' +
  'AAABAAABAAABAAABAAABAAABAAABAAABAAABAAABAAABAAABAAABAAAB';

const REFS = {
  gi0:  'assets/logos/mmw_logo_black.png',
  gi0w: 'assets/logos/mmw_logo_white.png',
  gi1:  'assets/logos/wpp_mazda_lockup_black.png',
  gi1w: 'assets/logos/wpp_mazda_lockup_white.png'
};

// ---- DOM shim: only what the render+export path actually touches ----
const noop = () => {};
global.noop = noop;
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), style: {}, children: [], attrs: {},
    classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
    setAttribute(k, v) { this.attrs[k] = v; if (k === 'src') this.src = v; },
    getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i > -1) this.children.splice(i, 1); return c; },
    insertBefore(c) { this.children.unshift(c); return c; },
    replaceChild(n) { return n; }, contains: () => false,
    get firstChild() { return this.children[0] || null; },
    get lastChild() { return this.children[this.children.length - 1] || null; },
    querySelector: () => makeEl('div'), querySelectorAll: () => [],
    addEventListener: noop, removeEventListener: noop, click: noop, focus: noop,
    insertAdjacentHTML: noop, remove: noop,
    // Canvas is used to rasterize icons and to cache prefetched images. Under
    // Node there is no real 2D context, so hand back an inert one: icons come
    // out blank, every other element is unaffected.
    getContext: () => new Proxy({}, {
      get: (t, k) => {
        if (k === 'canvas') return null;
        if (k === 'measureText') return () => ({ width: 0 });
        if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
        if (k === 'createLinearGradient' || k === 'createRadialGradient')
          return () => ({ addColorStop: noop });
        return typeof k === 'string' ? noop : undefined;
      },
      set: () => true
    }),
    // Photo wells are drawn on a canvas by generatePlaceholderImage(). With no
    // real canvas here, hand back a pre-rendered placeholder tile so the wells
    // still appear in the exported deck instead of vanishing.
    toDataURL: () => PLACEHOLDER,
    scrollIntoView: noop, setSelectionRange: noop, select: noop,
    animate: () => ({ finished: Promise.resolve(), cancel: noop }),
    getBoundingClientRect: () => ({ x:0, y:0, width:0, height:0, top:0, left:0, right:0, bottom:0 })
  };
  Object.defineProperty(el, 'innerHTML', { get(){ return ''; }, set(){}, configurable: true });
  Object.defineProperty(el, 'textContent', { get(){ return ''; }, set(){}, configurable: true });
  return el;
}
const body = makeEl('body');
const document = {
  body, head: makeEl('head'), documentElement: makeEl('html'),
  createElement: makeEl,
  createElementNS: (_, t) => makeEl(t),
  getElementById(id) {
    if (REFS[id]) { const im = makeEl('img'); im.setAttribute('src', REFS[id]); return im; }
    return null;
  },
  querySelector: () => makeEl('div'), querySelectorAll: () => [],
  addEventListener: noop, removeEventListener: noop
};

const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, Date, Math, JSON,
  document, navigator: { userAgent: 'node' }, location: { href: 'file:///' },
  requestAnimationFrame: cb => setTimeout(cb, 0),
  URL: { createObjectURL: () => 'blob:stub', revokeObjectURL: noop },
  Blob,  // Node has a real Blob; JSZip and PptxGenJS both accept it
  // The shell prefetches via new Image() + canvas.toDataURL(). Under Node the
  // cache is seeded directly from disk, so this stub just reports success.
  Image: class {
    constructor() { this._src = ''; }
    set src(v) { this._src = v; setTimeout(() => this.onerror && this.onerror(), 0); }
    get src() { return this._src; }
  },
  // btoa is a browser global; deck-icons.js uses it for its SVG data URIs.
  btoa: function (str) { return Buffer.from(str, 'binary').toString('base64'); },
  unescape: unescape, encodeURIComponent: encodeURIComponent,
  JSZip: require('/usr/lib/node_modules/jszip'),
  PptxGenJS: require('/usr/lib/node_modules/pptxgenjs'),
  __captured: null,
  addEventListener: noop, removeEventListener: noop,
  innerWidth: 1920, innerHeight: 1200, devicePixelRatio: 1,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop })
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function run(file, code) {
  try { vm.runInContext(code || read(file), sandbox, { filename: file }); }
  catch (e) { console.error(`\n!! ${file} threw while loading:\n   ${e.message}\n`); throw e; }
}

// Accent globals, exactly as the artifact declares them.
run('accent.js', "var AH='#C4A584';var AL='#FFE0C0';var AD='#9C7C5C';");
console.error('[3] loading engine...');
run('deck-icons.js');
run('standard-deck.js');
run('deck-layouts.js');
run('deck-shell.js');
console.error('[4] engine loaded');

// Slide data: reuse the harness's own 67-slide D array so this matches what the
// browser renders, rather than inventing a second source of truth.
const harness = fs.readFileSync(path.join(SRC, 'test-deck.html'), 'utf8');
const D = JSON.parse('[' + harness.split('var D=[')[1].split('\n];')[0] + ']');
sandbox.D = D;

console.error('[5] deckInit...');
sandbox.deckInit({ title: 'MMW Layout Reference', contentFooter: 'Internal \u2014 Layout QA' });
Object.assign(sandbox.StandardShell._imageCache, imageCache);

console.log(`loaded deck-layouts ${sandbox.DeckLayouts.VERSION}, ${D.length} slides`);

// Capture the blob the exporter builds instead of "downloading" it.
sandbox.URL.createObjectURL = (blob) => { sandbox.__captured = blob; return 'blob:stub'; };

(async () => {
  await sandbox.StandardShell.exportPPTX();
  for (let i = 0; i < 400 && !sandbox.__captured; i++) await new Promise(r => setTimeout(r, 50));
  if (!sandbox.__captured) { console.error('!! no blob was produced'); process.exit(1); }
  const blob = sandbox.__captured;
  const buf = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(OUT, buf);
  console.log(`wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB)`);
})().catch(e => { console.error('\n!! EXPORT FAILED:', e.message, '\n', e.stack); process.exit(1); });
