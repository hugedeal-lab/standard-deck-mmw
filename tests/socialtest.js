// Social spec sheets: every phone is the template's two layers -- the phone
// PNG (body + shadow) under the platform screen -- at the 7.30 template's
// geometry. Regression for 2026-10, when sheets drew the screen alone (no
// body or shadow), the TikTok carousel drew no phones and Reddit sat on navy.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 }, PALETTE: {} } };
console.warn = () => {}; console.error = () => {};
require('../deck-layouts.js');
const DL = global.window.DeckLayouts, fs = require('fs'), path = require('path');
let fail = 0;
function check(c, m) { if (!c) { fail++; console.log('FAIL  ' + m); } else console.log('ok    ' + m); }
const PHONES = { metaVideoStatic:2, metaCarousel1x1:1, metaCarousel4x5:1, pinterest2x3:1, pinterest1x1:1,
  tiktokVideoStatic:2, tiktokCarousel:5, redditVideoStatic4x5:2, redditVideoStatic1x1:2, redditCarousel:1 };
const imgs = (els) => els.filter((e) => e.type === 'img');
const isPhone = (e) => /phone_mockup/.test(e.src);
for (const [l, n] of Object.entries(PHONES)) {
  const els = DL.dispatch({ layout:l, text:'X' });
  const im = imgs(els), phones = im.filter(isPhone);
  check(phones.length === n, l + ': ' + n + ' phone bod' + (n > 1 ? 'ies' : 'y') + ' (got ' + phones.length + ')');
  const lastPhone = Math.max(...phones.map((p) => els.indexOf(p)));
  const screens = im.filter((e) => !isPhone(e) && /social\/(meta_(reel|carousel)|tiktok_video|reddit_(post_4x5|video|carousel)|pinterest_(pin|1x1|2x3))/.test(e.src));
  check(screens.length && screens.every((s) => els.indexOf(s) > lastPhone), l + ': screens drawn above the phones');
}
// Supplied photos land inside the screens, not over the phone body.
const els = DL.dispatch({ layout:'tiktokVideoStatic', images:['a.jpg', 'b.jpg'] });
const a = els.find((e) => e.src === 'a.jpg');
check(a && a.y > 1.418 && a.y + a.h < 1.418 + 5.128, 'tiktok photo sits inside the screen, below the status bar and above the nav');
check(!DL.dispatch({ layout:'pinterest2x3' }).some((e) => e.type === 's' && e.fill === 'black'), 'pinterest 2:3 has no stray black button');
// Every social asset the layouts name exists.
const missing = [];
for (const l of Object.keys(PHONES)) imgs(DL.dispatch({ layout:l })).forEach((e) => {
  const m = /assets\/(social\/[^?]+)$/.exec(e.src); if (m && !fs.existsSync(path.join(__dirname, '..', 'assets', m[1]))) missing.push(m[1]);
});
check(!missing.length, 'all social assets exist' + (missing.length ? ' (' + [...new Set(missing)].join(', ') + ')' : ''));
console.log('\n' + (fail ? fail + ' FAILED' : 'all social checks passed'));
process.exit(fail ? 1 : 0);
