// Icon bundle: MMW primary, Phosphor thin fallback, name resolution.
global.window = {};
const warnings = [];
global.console = Object.assign(Object.create(console), { warn: (m) => warnings.push(String(m)) });
require('../deck-icons.js');
const I = global.window.DeckIcons;
let fail = 0;
function check(c, m) { if (!c) { fail++; console.log('FAIL  ' + m); } else console.log('ok    ' + m); }
const all = I.list();
check(all.filter((n) => n.startsWith('mmw-')).length === 72, '72 mmw-* icons');
check(all.filter((n) => n.startsWith('ph-')).length >= 1500, 'Phosphor thin set present (' + all.filter((n) => n.startsWith('ph-')).length + ')');
const car = I.get('ph-car', '#123456', 40);
check(/^<svg width="40" height="40" class="ph"/.test(car) && /stroke="#123456"/.test(car) && /stroke-width="8"/.test(car) && /<\/svg>$/.test(car), 'ph-car expands to a recoloured thin-stroke SVG');
check(/fill="#123456"/.test(I.get('ph-dots-three', '#123456')), 'fill-only Phosphor icons recolour (were always black)');
check(I.resolve('steering-wheel') === 'ph-steering-wheel', 'bare Phosphor name resolves to ph-*');
check(I.resolve('target') === 'target', 'legacy Lucide name still resolves (old decks)');
check(I.resolve('mmw-idea') === 'mmw-idea' && I.has('mmw-idea'), 'mmw-* resolves');
warnings.length = 0;
check(I.get('not-an-icon') === '' && !I.has('not-an-icon') && warnings.length === 1, 'unknown name: empty + one warning');
check(/^data:image\/svg\+xml;base64,/.test(I.toDataURL('ph-calendar-dots', 48, '#000000')), 'ph-* exports as an SVG data URI');
console.log('\n' + (fail ? fail + ' FAILED' : 'all icon checks passed'));
process.exit(fail ? 1 : 0);
