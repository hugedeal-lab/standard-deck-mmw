// Text fit (fitTexts in deck-layouts.js) and the social spec-sheet copy API.
// Cases marked "verified" were checked against a real PPTX export rendered in
// LibreOffice when the fit pass was built.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 } } };
const warnings = [];
global.console = Object.assign(Object.create(console), { warn: (m) => warnings.push(String(m)), error: () => {} });
require('../deck-layouts.js'); require('../map-data.js'); require('../deck-maps.js');
const DL = global.window.DeckLayouts, fs = require('fs'), path = require('path');
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.log('FAIL  ' + msg); } else console.log('ok    ' + msg); }
const clone = (x) => JSON.parse(JSON.stringify(x));
const overflow = () => warnings.filter((w) => /overflows its box|runs into/.test(w));
function run(d) { warnings.length = 0; return DL.dispatch(clone(d)); }
const POST = ('Meet the all-new Mazda CX-50. Built for the road less traveled, with standard i-Activ AWD, rugged ' +
  'styling and a cabin crafted with premium materials. Whether it is a weekend trail or the daily commute, every ' +
  'drive feels intentional. Explore trims, compare features and build yours today with exclusive offers at ' +
  'participating dealers. Limited-time financing on select models. See your local Mazda dealer for complete ' +
  'details and eligibility. Some features shown may be optional or require an upgrade package.').slice(0, 500);

// 1. The QA deck's sample content fits everywhere: no warnings, nothing shrunk.
const html = fs.readFileSync(path.join(__dirname, '..', 'test-deck.html'), 'utf8');
const a = html.indexOf('var D=[') + 6, D = JSON.parse(html.slice(a, html.indexOf('\n];', a) + 2));
let noisy = [], shrunk = [];
for (const d of D) {
  const raw = DL.LAYOUT_MAP[d.layout] ? DL.LAYOUT_MAP[d.layout](clone(d)) : [];
  const els = run(d);
  if (overflow().length) noisy.push(d.layout);
  if (els.some((e, i) => e.type === 't' && raw[i] && raw[i].size !== e.size)) shrunk.push(d.layout);
}
check(!noisy.length, 'QA deck: no overflow warnings' + (noisy.length ? ' (' + noisy.join(', ') + ')' : ''));
check(!shrunk.length, 'QA deck: no text shrunk' + (shrunk.length ? ' (' + shrunk.join(', ') + ')' : ''));

// 2. Social copy goes in the copy boxes; the template labels stay fixed.
for (const layout of ['metaCarousel4x5', 'metaVideoStatic', 'youtubeVideoAd']) {
  const els = run({ layout, copy: { postCopy: POST, headline: 'Engineered for the road less traveled with standard i-Activ AWD and more.',
    alts: 'Mazda CX-50 on a coastal road at golden hour.', cta: 'Build & Price', destination: 'Destination: VLP', format: 'Carousel' } });
  const t = (s) => els.find((e) => e.type === 't' && e.text === s);
  const body = t(POST);
  check(t('Post copy (500 ch):') && t('Headline (100 ch):') && t('Alts:'), layout + ': template labels unchanged');
  check(body && body.h > 1 && body.size < 11.5 && body.size >= 6.5, layout + ': 500-char post copy in the body box, shrunk to ' + (body && body.size) + 'pt');
  check(!overflow().length, layout + ': full-length copy raises no overflow (verified)');
  check(t('CTA: Build & Price') && t('Destination: VLP'), layout + ': bare CTA value gets its label; prefixed value kept');
}
// Legacy positional items still land in the same boxes.
let els = run({ layout: 'metaCarousel1x1', items: ['Alt', 'Legacy post copy', 'Carousel', 'Legacy headline'] });
check(els.some((e) => e.text === 'Legacy post copy' && e.h === 1.17), 'legacy items[1] still fills carousel post copy');

// 3. Over-long display copy warns rather than silently spilling.
run({ layout: 'moodboardWardrobe', title: 'Concept: Weekend Getaway', subtitle: 'Supporting subhead', text: 'Body.' });
check(overflow().length >= 1, 'moodboardWardrobe: 3-line title over the subhead warns (verified)');
run({ layout: 'content05', title: 'Section Heading', subhead: 'Supporting subhead', text: 'Body.' });
check(!overflow().length, 'content05: 2-line bottom-anchored title grows upward cleanly (verified)');
run({ layout: 'reportGray', tag: 'Q3', intro: 'Where the work stands today.', title: 'A report title that runs well past the forty-five character budget for the chassis' });
check(overflow().length >= 1, 'reportGray: over-budget title warns');
run({ layout: 'reportJourneyMap', panels: [{ tone: 'dark', header: 'Development', date: 'May \u2013 Jun', sections: [] }] });
check(overflow().length === 1 && /runs into/.test(overflow()[0]), 'reportJourneyMap: a long panel header running into its date warns');
run({ layout: 'reportJourneyMap', panels: [{ tone: 'dark', header: 'Discover', date: 'Jan \u2013 Feb', sections: [] }] });
check(!overflow().length, 'reportJourneyMap: "Discover" clears its date (verified)');
// 4. Shrink never goes below its floor.
els = run({ layout: 'metaCarousel1x1', copy: { postCopy: POST + ' ' + POST } });
const big = els.find((e) => e.text === POST + ' ' + POST);
check(big.size === 6.5 && overflow().length >= 1, '1000-char post copy: stops at the 6.5pt floor and warns');

console.log('\n' + (fail ? fail + ' FAILED' : 'all fit checks passed'));
process.exit(fail ? 1 : 0);
