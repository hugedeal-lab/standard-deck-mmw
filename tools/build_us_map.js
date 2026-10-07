#!/usr/bin/env node
/* ============================================================
build_us_map.js -- generates map-data.js (US geometry for the mapUS layout)

Inputs (public data, downloaded once -- not committed):
  states-albers-10m.json   us-atlas@3 (ISC; geometry is US Census, public domain)
      https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json
  ne_10m_populated_places_simple.geojson   Natural Earth (public domain)
      https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_populated_places_simple.geojson

The us-atlas "albers" files are already projected with
d3.geoAlbersUsa().scale(1300).translate([487.5, 305]) into a 975x610 frame,
with Alaska and Hawaii repositioned as insets. Cities are projected with the
same projection so they land exactly on the boundaries.

Usage:
  npm i topojson-client@3 d3-geo@3        (anywhere; point NODE_PATH at it)
  NODE_PATH=/path/to/node_modules node tools/build_us_map.js <states.json> <places.geojson> > map-data.js
============================================================ */
'use strict';
const fs = require('fs');
const topojson = require('topojson-client');
const d3 = require('d3-geo');

const [statesPath, placesPath] = process.argv.slice(2);
if (!statesPath || !placesPath) {
  console.error('usage: build_us_map.js <states-albers-10m.json> <places.geojson>');
  process.exit(1);
}

const FIPS = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC',
  '12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY',
  '22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT',
  '31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH',
  '40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT',
  '50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY'
};

// Frame and tuning. Units are the 975x610 albers frame.
const W = 975, H = 610;
const SIMPLIFY = 0.7;      // Douglas-Peucker tolerance; ~9.3k -> ~3k points
const MIN_RING_AREA = 4;   // drop specks (tiny islands) below this, unless it's a state's only ring
const DOT_SPACING = 14;    // dotted-style grid pitch -- ~1.7k dots, same density as the template's world dot map
const CITY_MIN_POP = 0;    // Natural Earth's US set is already curated (~770 places)

// ---------- geometry helpers ----------
function area(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
}
function centroid(r) {
  let x = 0, y = 0, a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
    x += (r[j][0] + r[i][0]) * f; y += (r[j][1] + r[i][1]) * f; a += f;
  }
  a *= 3; return a ? [x / a, y / a] : r[0];
}
function dp(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop(); let maxD = 0, idx = -1;
    const [x1, y1] = pts[s], [x2, y2] = pts[e], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    // A closed ring starts and ends on the same point, so the "segment" is
    // degenerate -- fall back to distance from that point, or every vertex
    // scores 0 and the whole ring collapses.
    const degenerate = dx === 0 && dy === 0;
    for (let i = s + 1; i < e; i++) {
      const d = degenerate ? Math.hypot(pts[i][0] - x1, pts[i][1] - y1)
                           : Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function inRing(x, y, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    if (((r[i][1] > y) !== (r[j][1] > y)) &&
        (x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0])) c = !c;
  }
  return c;
}

// ---------- states ----------
const topo = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
const feats = topojson.feature(topo, topo.objects.states).features;
const states = [];          // [{id, n, r:[flat rings], c:[x,y]}]
const fullRings = [];       // unsimplified outer rings per state, for dot assignment
let ptsIn = 0, ptsOut = 0;
feats.forEach(f => {
  const id = FIPS[f.id]; if (!id) return;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const outers = polys.map(p => p[0]);         // holes ignored: no state has a meaningful one
  outers.forEach(r => ptsIn += r.length);
  const biggest = outers.reduce((a, b) => area(a) > area(b) ? a : b);
  const kept = outers.filter(r => r === biggest || area(r) >= MIN_RING_AREA)
                     .map(r => dp(r, SIMPLIFY)).filter(r => r.length >= 4);
  kept.forEach(r => ptsOut += r.length);
  const c = centroid(biggest);
  states.push({ id, n: f.properties.name,
    r: kept.map(r => r.flatMap(p => [+p[0].toFixed(1), +p[1].toFixed(1)])),
    c: [+c[0].toFixed(1), +c[1].toFixed(1)] });
  fullRings.push({ id, rings: outers });
});
states.sort((a, b) => a.id < b.id ? -1 : 1);
const sIdx = {}; states.forEach((s, i) => sIdx[s.id] = i);

// ---------- dot grid ----------
// Square grid, offset half a pitch so dots don't sit on the frame edge.
// Each dot belongs to the state whose (full-resolution) outline contains it.
const dots = [];
for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
  for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
    for (const s of fullRings) {
      if (s.rings.some(r => inRing(x, y, r))) { dots.push(x, y, sIdx[s.id]); break; }
    }
  }
}

// A state small enough to fall between grid points (DC) would have no dots,
// so highlighting it would show nothing. Give it one, at its centroid.
const hasDot = new Set(); for (let i = 2; i < dots.length; i += 3) hasDot.add(dots[i]);
states.forEach((s, i) => { if (!hasDot.has(i)) dots.push(+s.c[0].toFixed(1), +s.c[1].toFixed(1), i); });

// ---------- cities ----------
const proj = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const NAME2ID = {}; feats.forEach(f => { if (FIPS[f.id]) NAME2ID[f.properties.name] = FIPS[f.id]; });
const places = JSON.parse(fs.readFileSync(placesPath, 'utf8')).features
  .filter(f => f.properties.adm0_a3 === 'USA' && (f.properties.pop_max || 0) >= CITY_MIN_POP);
const seen = new Set(); const cities = [];
places.sort((a, b) => (b.properties.pop_max || 0) - (a.properties.pop_max || 0)).forEach(f => {
  const p = f.properties, st = NAME2ID[p.adm1name];
  const xy = proj([p.longitude, p.latitude]);
  if (!st || !xy) return;
  const key = p.name + '|' + st; if (seen.has(key)) return; seen.add(key);
  cities.push([p.name, st, +xy[0].toFixed(1), +xy[1].toFixed(1), p.pop_max || 0]);
});

// Projection check for the inline lower-48 formula in deck-maps.js -- printed
// to stderr so a rebuild flags drift.
const probe = [[-118.24, 34.05], [-74.0, 40.71], [-87.63, 41.88], [-80.19, 25.76], [-122.33, 47.61]];
console.error('[build_us_map] states', states.length, 'points', ptsIn, '->', ptsOut,
  '| dots', dots.length / 3, '| cities', cities.length);
console.error('[build_us_map] probe', JSON.stringify(probe.map(p => proj(p).map(v => +v.toFixed(2)))));

process.stdout.write(
'/* map-data.js -- GENERATED by tools/build_us_map.js. Do not hand-edit.\n' +
'   Geometry: US Census via us-atlas@3 (states-albers-10m), public domain.\n' +
'   Cities: Natural Earth populated places, public domain.\n' +
'   Frame: 975x610, d3.geoAlbersUsa().scale(1300).translate([487.5,305]). */\n' +
'window.MMW_MAP_DATA = ' + JSON.stringify({
  us: { w: W, h: H, dotSpacing: DOT_SPACING, states, dots, cities,
        cityFields: ['name', 'state', 'x', 'y', 'pop'] }
}) + ';\n');
