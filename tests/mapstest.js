// Maps: mapUS (data map) and mapWorld (decorative). Dispatches every style /
// marker mode and checks the things that broke during development:
// projection accuracy, label placement, the dense-map dot fallback, overlap
// separation, small-state dots, and asset paths.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 } } };
const warnings = [];
global.console = Object.assign(Object.create(console), { warn: (m) => warnings.push(String(m)) });
require('../deck-layouts.js'); require('../map-data.js'); require('../deck-maps.js');
const DL = global.window.DeckLayouts, M = DL.MAPS;
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.log('FAIL  ' + msg); } else console.log('ok    ' + msg); }
function near(a, b, tol) { return Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol; }

// Projection matches d3.geoAlbersUsa().scale(1300).translate([487.5,305]) --
// the projection the geometry was built with (values from d3 itself).
check(near(M.project(-118.24, 34.05), [86.87, 363.18], 0.02), 'projection: Los Angeles');
check(near(M.project(-74.0, 40.71), [869.83, 215.78], 0.02), 'projection: New York');
check(near(M.project(-149.9, 61.22), [112.3, 544.3], 0.1), 'projection: Anchorage (Alaska inset)');
check(near(M.project(-157.86, 21.31), [266.9, 549.1], 0.1), 'projection: Honolulu (Hawaii inset)');

const data = global.window.MMW_MAP_DATA.us;
check(data.states.length === 51, '51 states (incl. DC) in map-data');
const dotted = new Set(); for (let i = 2; i < data.dots.length; i += 3) dotted.add(data.dots[i]);
check(dotted.size === 51, 'every state, DC included, has at least one dot');

function run(cfg) { warnings.length = 0; const els = DL.dispatch(Object.assign({ layout: 'mapUS', title: 'T' }, cfg)); return els; }
const by = (els, t) => els.filter(e => e.type === t);

// Solid, sparse -> template pins (polygon + hole), one shape per state ring.
let e = run({ style: 'solid', highlight: ['CA', 'Texas'], cities: ['Irvine', 'Dallas', 'Chicago', 'Boston'] });
const pins = by(e, 's').filter(x => x.points && x.strokeWidth === 0.75);   // template pin (states use 0.6)
const stateShapes = by(e, 's').filter(x => x.points && x.strokeWidth === 0.6);
check(pins.length === 4, 'solid: 4 template pins for 4 sparse cities');
check(stateShapes.length === data.states.reduce((n, st) => n + st.r.length, 0), 'solid: one freeform per state ring (' + stateShapes.length + ')');
check(e.some(x => x.type === 's' && x.fill === '#BFA588'), 'solid: highlight accepts postal code and name');
check(warnings.length === 0, 'solid sparse: no warnings');

// Dense -> automatic dot markers, overlap separation keeps markers apart.
e = run({ style: 'solid', cities: ['Los Angeles', 'Irvine', 'New York', 'Newark', 'Boston', 'Providence', 'Hartford', 'Philadelphia'] });
const markers = by(e, 'o').filter(x => Math.abs(x.w - 0.11) < 1e-6);
check(markers.length === 8, 'dense: switches to 8 dot markers');
let minGap = 9;
for (let i = 0; i < markers.length; i++) for (let j = i + 1; j < markers.length; j++)
  minGap = Math.min(minGap, Math.hypot(markers[i].x - markers[j].x, markers[i].y - markers[j].y));
check(minGap >= 0.124, 'dense: no two dot markers overlap (min centre gap ' + minGap.toFixed(3) + 'in)');
const labels = by(e, 't').filter(x => x.size === 8 && x.caps);
check(labels.length === 8, 'dense: every city labelled');

// Dots style: ~1.7k dots, plates behind labels, highlighted DC visible.
e = run({ style: 'dots', highlight: ['DC'], cities: ['Chicago'] });
check(by(e, 'o').length > 1600, 'dots: dot grid emitted');
check(by(e, 'o').some(x => x.fill === '#BFA588'), 'dots: DC highlight shows (at least one tan dot)');

// Unknown inputs warn instead of silently vanishing.
run({ highlight: ['ZZ'], cities: ['Atlantis'] });
check(warnings.some(w => /unknown state "ZZ"/.test(w)) && warnings.some(w => /no city "Atlantis"/.test(w)), 'unknown state / city warn');
// lat/lon for places not in the city list.
e = run({ cities: [{ name: 'Mazda R&D', lat: 33.66, lon: -117.84 }] });
check(by(e, 't').some(x => x.text === 'Mazda R&D'), 'lat/lon city placed');

// mapWorld: each style emits its asset(s), resolved under assets/maps/.
for (const [style, n] of [['solid', 1], ['dots', 1], ['globes', 4]]) {
  const w = DL.dispatch({ layout: 'mapWorld', style, title: 'T' }).filter(x => x.type === 'img');
  check(w.length === n && w.every(x => /^assets\/maps\/(world|globe)_[a-z_]+\.png$/.test(x.src)), 'mapWorld ' + style + ': ' + n + ' asset image(s)');
}
const lightSolid = DL.dispatch({ layout: 'mapWorld', dark: 0, bgColor: '#EEEEEE', title: 'T' }).find(x => x.type === 'img');
check(/world_solid_light\.png$/.test(lightSolid.src), 'mapWorld: light chassis uses light asset');
const fs = require('fs'), path = require('path');
const files = fs.readdirSync(path.join(__dirname, '..', 'assets', 'maps'));
const want = ['world_solid_dark', 'world_solid_light', 'world_dots'].concat(...['americas', 'atlantic', 'europe_africa', 'asia_pacific'].map(g => ['globe_' + g + '_dark', 'globe_' + g + '_light']));
check(want.every(f => files.includes(f + '.png')), 'all 11 map assets present');

console.log('\n' + (fail ? fail + ' FAILED' : 'all map checks passed'));
process.exit(fail ? 1 : 0);
