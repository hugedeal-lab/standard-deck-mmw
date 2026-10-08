// Slide backgrounds: every layout gets its template background unless the deck
// supplies a usable one. Regression for a 2026-10 test deck whose grey and
// white slides exported black -- it passed colour tokens ('paper') and left
// others out, and PptxGenJS writes any non-hex colour as #000000.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 },
  PALETTE: { paper:'#EEEEEE', asphalt:'#262626', lt2:'#D5D5D5', white:'#FFFFFF' } } };
const warnings = [];
global.console = Object.assign(Object.create(console), { warn: (m) => warnings.push(String(m)), error: () => {} });
require('../deck-layouts.js'); require('../map-data.js'); require('../deck-maps.js');
const DL = global.window.DeckLayouts, fs = require('fs'), path = require('path');
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.log('FAIL  ' + msg); } else console.log('ok    ' + msg); }
function run(d) { const s = JSON.parse(JSON.stringify(d)); DL.dispatch(s); return s; }
const HEX = /^#[0-9A-F]{6}$/;

// Every layout ends up with a usable background when the deck gives none.
const missing = [];
for (const slug of Object.keys(DL.LAYOUT_MAP)) {
  const s = run({ layout: slug, title: 'T' });
  const ok = (s.bgColor && HEX.test(s.bgColor)) || s.bgImage || (s.images && s.images.length);
  if (!ok && slug !== 'dividerPhoto' && slug !== 'mapWorld') missing.push(slug);
}
check(!missing.length, 'every layout gets a template background when none is given' + (missing.length ? ' (' + missing.join(', ') + ')' : ''));

let s = run({ layout: 'content01', bgColor: 'paper' });
check(s.bgColor === '#EEEEEE' && s.dark === 0, "token 'paper' -> #EEEEEE, light");
s = run({ layout: 'thankYouDark', bgColor: 'asphalt' });
check(s.bgColor === '#262626' && s.dark === 1, "token 'asphalt' -> #262626, dark");
s = run({ layout: 'content05', bgColor: '#eee' });
check(s.bgColor === '#EEEEEE', "3-digit hex '#eee' -> #EEEEEE");
warnings.length = 0;
s = run({ layout: 'reportStrategyStack', bgColor: 'nonsense' });
check(s.bgColor === '#EEEEEE' && s.dark === 0 && warnings.some((w) => /not a colour/.test(w)), "junk 'nonsense' -> template #EEEEEE, with a warning");
s = run({ layout: 'dividerCanopy', tag: 'x', title: 'y' });
check(s.bgColor === '#253724' && s.dark === 1, 'missing bgColor on dividerCanopy -> #253724, dark');
s = run({ layout: 'dividerDark2', title: 'y' });
check(/backgrounds\/pattern_dark2\.png$/.test(s.bgImage) && s.dark === 1, 'dividerDark2 -> pattern_dark2.png, dark (QA deck used to give it thankyou_texture)');
s = run({ layout: 'redditDivider' });
check(/social\/divider_platform_reddit_pinterest\.png$/.test(s.bgImage), 'redditDivider -> social/ asset path');
s = run({ layout: 'twoRowsLight', bgColor: '#123456' });
check(s.bgColor === '#123456' && s.dark === 1, 'a valid explicit bgColor is kept; dark follows its luminance');

// Pre-pass leaves the photo cover to deckInit's rotating pool.
s = JSON.parse(JSON.stringify({ layout: 'coverPhoto', title: 'T' }));
DL.normalizeBackground(s);
check(!s.bgImage, 'deckInit pre-pass leaves coverPhoto to the photo pool');

// Every image the table names exists on disk.
const bad = Object.entries(DL.LAYOUT_BG).filter(([, v]) => v.bgImage &&
  !fs.existsSync(path.join(__dirname, '..', 'assets', (v.bgImage.includes('/') ? '' : 'backgrounds/') + v.bgImage)));
check(!bad.length, 'every LAYOUT_BG image exists' + (bad.length ? ' (' + bad.map((b) => b[0]).join(', ') + ')' : ''));

console.log('\n' + (fail ? fail + ' FAILED' : 'all background checks passed'));
process.exit(fail ? 1 : 0);
