/* ============================================================
deck-maps.js -- US map layout (mapUS) for standard-deck-mmw

Loads AFTER deck-layouts.js and map-data.js. Registers one layout,
`mapUS`, into DeckLayouts. Two styles, both taken from the template's own
map slide (7/30/26 template, slide 114):
  style:'solid'  states as filled shapes (template: grey land)
  style:'dots'   a dot grid over the land (template: dotted world map)
Highlighted states turn Spark tan (#BFA588) in either style. Cities get a
marker and a label; labels are placed to avoid each other and the markers,
and fall back to a leader line when nothing fits next to the marker.

Solid-style states export to PPTX as real freeform shapes (one per state,
or per island), so a user can still click a state in PowerPoint and recolour
it by hand.

Geometry is generated -- see tools/build_us_map.js. This file is hand-written.
============================================================ */
(function () {
'use strict';

var DL = window.DeckLayouts;
var DATA = window.MMW_MAP_DATA && window.MMW_MAP_DATA.us;
if (!DL) { console.error('[deck-maps] deck-layouts.js must load first.'); return; }
if (!DATA) { console.error('[deck-maps] map-data.js must load before deck-maps.js.'); return; }

// ------------------------------------------------------------
// Lookups
// ------------------------------------------------------------
var STATE_BY = {};          // 'CA' and 'california' -> state record
DATA.states.forEach(function (s) { STATE_BY[s.id] = s; STATE_BY[s.n.toLowerCase()] = s; });
function findState(v) {
  if (!v) return null;
  var k = String(v).trim();
  return STATE_BY[k.toUpperCase()] || STATE_BY[k.toLowerCase()] || null;
}

// Cities: name -> list, most populous first (the build sorts by population).
var CITY_BY = {};
DATA.cities.forEach(function (c) {
  var k = c[0].toLowerCase();
  (CITY_BY[k] = CITY_BY[k] || []).push(c);
});

// Albers USA, matching d3.geoAlbersUsa().scale(1300).translate([487.5,305])
// -- the projection the geometry was built with. Verified against d3 to the
// hundredth of a unit for the lower 48; Alaska and Hawaii use d3's insets.
var RAD = Math.PI / 180;
function conic(par0, par1, rot, cLon, cLat, scale, tx, ty) {
  var p0 = par0 * RAD, p1 = par1 * RAD, n = (Math.sin(p0) + Math.sin(p1)) / 2;
  var C = 1 + Math.sin(p0) * (2 * n - Math.sin(p0)), r0 = Math.sqrt(C) / n;
  function raw(l, f) { var r = Math.sqrt(C - 2 * n * Math.sin(f)) / n; return [r * Math.sin(l * n), r0 - r * Math.cos(l * n)]; }
  var c = raw(cLon * RAD, cLat * RAD);
  return function (lon, lat) {
    var p = raw((lon + rot) * RAD, lat * RAD);
    return [tx + scale * (p[0] - c[0]), ty - scale * (p[1] - c[1])];
  };
}
var K = 1300, TX = 487.5, TY = 305;
var LOWER48 = conic(29.5, 45.5, 96, -0.6, 38.7, K, TX, TY);
var ALASKA  = conic(55, 65, 154, -2, 58.5, 0.35 * K, TX - 0.307 * K, TY + 0.201 * K);
var HAWAII  = conic(8, 18, 157, -3, 19.9, K, TX - 0.205 * K, TY + 0.212 * K);
function project(lon, lat) {
  if (lat > 50 && lon < -129) return ALASKA(lon, lat);
  if (lat < 23 && lon < -150) return HAWAII(lon, lat);
  return LOWER48(lon, lat);
}

// A city entry is {name, state?} (looked up) or {name, lat, lon} (projected).
function resolveCity(c) {
  if (typeof c === 'string') c = { name: c };
  if (!c || !c.name) return null;
  var out = { label: c.label || c.name, note: c.note || '' };
  if (typeof c.lat === 'number' && typeof c.lon === 'number') {
    var p = project(c.lon, c.lat); out.x = p[0]; out.y = p[1]; return out;
  }
  var list = CITY_BY[String(c.name).toLowerCase()];
  if (list && c.state) {
    var st = findState(c.state);
    list = list.filter(function (r) { return st && r[1] === st.id; });
  }
  if (!list || !list.length) {
    console.warn('[deck-maps] mapUS: no city "' + c.name + '"' + (c.state ? ' (' + c.state + ')' : '') +
      ' in the bundled list -- pass lat/lon for it. Skipped.');
    return null;
  }
  out.x = list[0][2]; out.y = list[0][3];
  return out;
}

// ------------------------------------------------------------
// Frame
// ------------------------------------------------------------
var BBOX = (function () {
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  DATA.states.forEach(function (s) { s.r.forEach(function (r) {
    for (var i = 0; i < r.length; i += 2) {
      if (r[i] < x0) x0 = r[i]; if (r[i] > x1) x1 = r[i];
      if (r[i + 1] < y0) y0 = r[i + 1]; if (r[i + 1] > y1) y1 = r[i + 1];
    }
  }); });
  return { x0: x0, y0: y0, x1: x1, y1: y1 };
})();

// Template pin (Google Shape 3337 on slide 114), bezier outline flattened to
// box fractions. Aspect 0.68 (452852 x 666401 EMU); tip at x=0.482, y=1.
var PIN_PTS = [[0.498,0],[0.418,0.004],[0.341,0.017],[0.27,0.038],[0.204,0.066],[0.146,0.099],[0.096,0.139],[0.056,0.183],[0.025,0.232],[0.007,0.284],[0,0.339],[0.004,0.369],[0.014,0.403],[0.03,0.438],[0.048,0.473],[0.069,0.507],[0.089,0.538],[0.108,0.565],[0.123,0.586],[0.133,0.6],[0.137,0.605],[0.482,1],[0.839,0.609],[0.844,0.604],[0.856,0.591],[0.874,0.571],[0.896,0.545],[0.92,0.514],[0.943,0.48],[0.965,0.444],[0.983,0.408],[0.996,0.372],[1,0.339],[0.993,0.284],[0.974,0.232],[0.944,0.183],[0.903,0.139],[0.853,0.099],[0.795,0.066],[0.729,0.038],[0.657,0.017],[0.58,0.004]];
var PIN_H = 0.21, PIN_W = PIN_H * 0.68, PIN_TIP = 0.482;

// Map area below the report chassis (same chassis as reportGray/reportDark).
var AREA = { x: 0.61, y: 1.92, w: 12.12, h: 5.13 };

function frame() {
  var bw = BBOX.x1 - BBOX.x0, bh = BBOX.y1 - BBOX.y0;
  var k = Math.min(AREA.w / bw, AREA.h / bh);
  var ox = AREA.x + (AREA.w - bw * k) / 2 - BBOX.x0 * k;
  var oy = AREA.y + (AREA.h - bh * k) / 2 - BBOX.y0 * k;
  return { k: k, X: function (u) { return ox + u * k; }, Y: function (v) { return oy + v * k; } };
}

// ------------------------------------------------------------
// Label placement
// ------------------------------------------------------------
// Width estimate for Arial bold caps: ~0.78em per glyph plus tracking. Errs
// wide on purpose -- a box that's too narrow wraps the name onto two lines.
function textW(s, pt, track) { return String(s).length * (pt / 72) * 0.84 + String(s).length * (track || 0) / 72; }
function hit(a, b, pad) {
  return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
}
var BOUNDS = { x: 0.35, y: 1.85, w: 12.63, h: 5.45 };
function inside(r) { return r.x >= BOUNDS.x && r.y >= BOUNDS.y && r.x + r.w <= BOUNDS.x + BOUNDS.w && r.y + r.h <= BOUNDS.y + BOUNDS.h; }

function placeLabels(pts) {
  // pts: [{px,py,lw,lh}] in inches. Greedy, in the order given -- the deck
  // author's order is the priority order.
  // Each point carries its marker footprint (box), the spot labels hang off
  // (ax, ay -- the pin's head, or the dot's centre) and its half-width.
  var obstacles = pts.map(function (p) { return p.box; });
  var placed = [];
  pts.forEach(function (p, self) {
    var w = p.lw, h = p.lh, done = null, G = p.half + 0.035, ax = p.ax, ay = p.ay;
    var near = [
      [ax + G, ay - h / 2, 'l'], [ax - G - w, ay - h / 2, 'r'],
      [ax + G * 0.6, ay - h - G * 0.4, 'l'], [ax + G * 0.6, ay + G * 0.4, 'l'],
      [ax - G * 0.6 - w, ay - h - G * 0.4, 'r'], [ax - G * 0.6 - w, ay + G * 0.4, 'r'],
      [ax - w / 2, p.box.y - h - 0.03, 'c'], [ax - w / 2, p.box.y + p.box.h + 0.03, 'c']
    ];
    function free(r) {
      if (!inside(r)) return false;
      for (var i = 0; i < placed.length; i++) if (hit(r, placed[i], 0.03)) return false;
      for (var j = 0; j < obstacles.length; j++) if (j !== self && hit(r, obstacles[j], 0.01)) return false;
      return true;
    }
    for (var i = 0; i < near.length && !done; i++) {
      var r = { x: near[i][0], y: near[i][1], w: w, h: h };
      if (free(r)) done = { r: r, align: near[i][2], leader: false };
    }
    // Nothing adjacent fits: walk outward in 16 directions, with a leader line.
    for (var d = 0.35; d <= 1.6 && !done; d += 0.2) {
      for (var a = 0; a < 16 && !done; a++) {
        var ang = (a / 16) * 2 * Math.PI;
        var cx = ax + Math.cos(ang) * d, cy = ay + Math.sin(ang) * d;
        var right = Math.cos(ang) >= 0;
        var r2 = { x: right ? cx : cx - w, y: cy - h / 2, w: w, h: h };
        if (free(r2)) done = { r: r2, align: right ? 'l' : 'r', leader: true, ax: right ? r2.x : r2.x + w, ay: cy };
      }
    }
    if (!done) {
      console.warn('[deck-maps] mapUS: no clear spot for a label; it may overlap.');
      done = { r: { x: ax + G, y: ay - h / 2, w: w, h: h }, align: 'l', leader: false };
    }
    placed.push(done.r);
    p.place = done;
  });
}

// ------------------------------------------------------------
// Layout
// ------------------------------------------------------------
function layout_mapUS(cfg) {
  var els = [];
  var dark = cfg.dark === 1;
  var BG = dark ? '#262626' : '#EEEEEE';
  var LAND = dark ? '#808080' : '#CCCCCC';        // solid: template's grey land
  var DOT = dark ? '#5E5E5E' : '#C2C2C2';         // dots: muted base
  var HI = '#BFA588';                             // Spark (accentDim) -- the template's map tan
  var INK = dark ? '#EEEEEE' : '#262626';
  var SUB = dark ? '#868686' : '#808080';

  // Chassis -- identical to reportGray / reportDark.
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  var F = frame();
  var hiSet = {};
  (cfg.highlight || []).forEach(function (h) {
    var s = findState(h);
    if (s) hiSet[s.id] = 1;
    else console.warn('[deck-maps] mapUS: unknown state "' + h + '" in highlight -- use a postal code (CA) or name.');
  });

  if (cfg.style === 'dots') {
    var dia = DATA.dotSpacing * F.k * 0.62;
    for (var i = 0; i < DATA.dots.length; i += 3) {
      var st = DATA.states[DATA.dots[i + 2]];
      els.push({ type:'o', x:F.X(DATA.dots[i]) - dia / 2, y:F.Y(DATA.dots[i + 1]) - dia / 2,
        w:dia, h:dia, fill: hiSet[st.id] ? HI : DOT });
    }
  } else {
    DATA.states.forEach(function (s) {
      s.r.forEach(function (r) {
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, j;
        for (j = 0; j < r.length; j += 2) {
          var X = F.X(r[j]), Y = F.Y(r[j + 1]);
          if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
        }
        var w = Math.max(x1 - x0, 0.001), h = Math.max(y1 - y0, 0.001), pts = [];
        for (j = 0; j < r.length; j += 2) {
          pts.push([+((F.X(r[j]) - x0) / w).toFixed(4), +((F.Y(r[j + 1]) - y0) / h).toFixed(4)]);
        }
        els.push({ type:'s', x:x0, y:y0, w:w, h:h, points:pts,
          fill: hiSet[s.id] ? HI : LAND, stroke: BG, strokeWidth: 0.6 });
      });
    });
  }

  // Cities: marker + label.
  var NAME_PT = 8, NOTE_PT = 7, TRACK = 0.6;
  var pts = [], raw = [];
  (cfg.cities || []).forEach(function (c) { var r = resolveCity(c); if (r) raw.push(r); });
  // Pins read well on a sparse map; where two cities sit closer than a pin is
  // wide, overlapping teardrops are worse than dots. Switch the WHOLE map, so
  // markers stay consistent. cfg.marker forces either.
  var marker = cfg.marker;
  if (marker !== 'pin' && marker !== 'dot') {
    marker = 'pin';
    for (var a = 0; a < raw.length && marker === 'pin'; a++) for (var b = a + 1; b < raw.length; b++) {
      if (Math.hypot(F.X(raw[a].x) - F.X(raw[b].x), F.Y(raw[a].y) - F.Y(raw[b].y)) < PIN_W * 1.15) { marker = 'dot'; break; }
    }
  }
  // Dots that would overlap get pushed apart until they just touch (a few
  // hundredths of an inch -- single-digit miles at this scale), so close pairs
  // like Los Angeles / Irvine read as two places instead of one blob.
  var pos = raw.map(function (r) { return [F.X(r.x), F.Y(r.y)]; });
  if (marker === 'dot') {
    var MIN = 0.125;
    for (var it = 0; it < 30; it++) {
      var moved = false;
      for (var i1 = 0; i1 < pos.length; i1++) for (var i2 = i1 + 1; i2 < pos.length; i2++) {
        var ddx = pos[i2][0] - pos[i1][0], ddy = pos[i2][1] - pos[i1][1], dd = Math.hypot(ddx, ddy);
        if (dd >= MIN) continue;
        if (dd < 1e-6) { ddx = 1; ddy = 0; dd = 1; }
        var push = (MIN - dd) / 2;
        pos[i1][0] -= ddx / dd * push; pos[i1][1] -= ddy / dd * push;
        pos[i2][0] += ddx / dd * push; pos[i2][1] += ddy / dd * push; moved = true;
      }
      if (!moved) break;
    }
  }
  raw.forEach(function (r, ri) {
    var lw = Math.max(textW(r.label, NAME_PT, TRACK), r.note ? String(r.note).length * (NOTE_PT / 72) * 0.56 : 0) + 0.08;
    var lh = r.note ? 0.32 : 0.17;
    var px = pos[ri][0], py = pos[ri][1], q = { px: px, py: py, lw: lw, lh: lh, label: r.label, note: r.note };
    if (marker === 'pin') {
      q.box = { x: px - PIN_TIP * PIN_W, y: py - PIN_H, w: PIN_W, h: PIN_H };
      q.ax = q.box.x + PIN_W * 0.5; q.ay = q.box.y + PIN_H * 0.339; q.half = PIN_W / 2;
    } else {
      q.box = { x: px - 0.07, y: py - 0.07, w: 0.14, h: 0.14 }; q.ax = px; q.ay = py; q.half = 0.055;
    }
    pts.push(q);
  });
  placeLabels(pts);
  // Draw order: leaders, then label plates, then markers, then text -- so a
  // leader never crosses a marker or a name.
  var dots = cfg.style === 'dots';
  pts.forEach(function (p) {
    var pl = p.place;
    if (pl.leader) els.push({ type:'ln', x:p.ax, y:p.ay, w:pl.ax - p.ax, h:pl.ay - p.ay, color: SUB, weight: 0.5 });
  });
  // On the dot grid a name sitting on dots is hard to read; a plate in the
  // slide colour clears the dots behind it. Solid land reads fine without one.
  if (dots) pts.forEach(function (p) {
    var r = p.place.r;
    els.push({ type:'s', x:r.x - 0.03, y:r.y - 0.01, w:r.w + 0.06, h:r.h + 0.02, fill: BG });
  });
  pts.forEach(function (p) {
    if (marker === 'pin') {
      // The template's own location pin (7/30/26 slide 114): a teardrop with an
      // oval hole, tip on the exact point. The hole is drawn in the slide
      // colour -- the engine's polygons can't carry a real cut-out.
      els.push({ type:'s', x:p.box.x, y:p.box.y, w:PIN_W, h:PIN_H, points:PIN_PTS, fill: INK, stroke: BG, strokeWidth: 0.75 });
      els.push({ type:'o', x:p.box.x + PIN_W * 0.209, y:p.box.y + PIN_H * 0.134, w:PIN_W * 0.572, h:PIN_H * 0.389, fill: BG });
    } else {
      var M = 0.11;
      els.push({ type:'o', x:p.px - M / 2, y:p.py - M / 2, w:M, h:M, fill: INK, stroke: BG, strokeWidth: 1.25 });
    }
  });
  // Text boxes are drawn wider than the collision estimate, growing AWAY from
  // the marker: a name that runs a little wider than estimated then has room
  // instead of wrapping. Min 0.85in keeps the engine's "compact" (<=0.8in)
  // text path out of it -- that path centres text, so an overlong name gets
  // clipped at both ends.
  pts.forEach(function (p) {
    var pl = p.place, r = pl.r;
    var al = pl.align === 'r' ? 'right' : (pl.align === 'c' ? 'center' : 'left');
    var dw = Math.max(r.w * 1.45, 0.85);
    var dx = al === 'left' ? r.x : (al === 'right' ? r.x + r.w - dw : r.x + r.w / 2 - dw / 2);
    els.push({ type:'t', text:p.label, x:dx, y:r.y, w:dw, h:0.17, font:'B', size:NAME_PT, color:INK,
      bold:true, caps:true, charSpacing:TRACK, align:al, valign:'middle', lineSpacing:1,
      insets:{l:0.02,t:0,r:0.02,b:0} });
    if (p.note) els.push({ type:'t', text:p.note, x:dx, y:r.y + 0.16, w:dw, h:0.15, font:'B', size:NOTE_PT,
      color:SUB, caps:false, align:al, valign:'top', lineSpacing:1, insets:{l:0.02,t:0,r:0.02,b:0} });
  });

  // Legend: one swatch for the highlight colour.
  if (cfg.legend && Object.keys(hiSet).length) {
    var ly = AREA.y + AREA.h - 0.2;
    if (cfg.style === 'dots') els.push({ type:'o', x:0.66, y:ly + 0.035, w:0.1, h:0.1, fill:HI });
    else els.push({ type:'s', x:0.66, y:ly + 0.035, w:0.16, h:0.1, fill:HI });
    els.push({ type:'t', text:cfg.legend, x:0.88, y:ly, w:4, h:0.17, font:'B', size:8, color:SUB,
      caps:true, charSpacing:TRACK, valign:'middle', lineSpacing:1, insets:{l:0,t:0,r:0,b:0} });
  }
  return els;
}

// ============================================================
// LAYOUT: mapWorld -- decorative world map / globes (no data)
// The template's own map graphics (7/30/26 slide 114) on the report
// chassis, for "global reach / markets / footprint" framing. These carry
// no country boundaries -- for highlighting specific places use mapUS.
//   style:'solid' (default)  grey continents
//   style:'dots'             Spark dot-matrix world
//   style:'globes'           a row of globes; cfg.globes picks which, from
//                            'americas','atlantic','europe-africa','asia-pacific'
//                            (default all four, west to east); cfg.captions
//                            labels each one.
// Defaults to the dark chassis (the template's map slide is dark); dark:0
// with a light bgColor switches to the light-slide asset variants.
// ============================================================
var A = (typeof window !== 'undefined' && window.MMW_ASSET_BASE) || 'assets/';
if (A.slice(-1) !== '/') A += '/';
var WORLD = { solid: { file: 'world_solid', aspect: 2400 / 1237, variants: true },
              dots:  { file: 'world_dots',  aspect: 2400 / 1183, variants: false } };
var GLOBES = ['americas', 'atlantic', 'europe-africa', 'asia-pacific'];

function layout_mapWorld(cfg) {
  if (!cfg.bgColor && !cfg.bgImage && cfg.dark === undefined) { cfg.bgColor = '#262626'; cfg.dark = 1; }
  var dark = cfg.dark === 1, els = [];
  var SUB = dark ? '#868686' : '#808080', INK = dark ? '#EEEEEE' : '#262626';
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  var shade = dark ? '_dark' : '_light';

  if (cfg.style === 'globes') {
    var pick = (cfg.globes && cfg.globes.length ? cfg.globes : GLOBES).filter(function (g) {
      var ok = GLOBES.indexOf(g) > -1;
      if (!ok) console.warn('[deck-maps] mapWorld: unknown globe "' + g + '" -- use ' + GLOBES.join(', ') + '.');
      return ok;
    }).slice(0, 4);
    var caps = cfg.captions || [];
    var D = 2.45, gap = 0.55, total = pick.length * D + (pick.length - 1) * gap;
    var x0 = 0.61 + (12.12 - total) / 2, y0 = caps.length ? 2.55 : 2.85;
    pick.forEach(function (g, i) {
      var x = x0 + i * (D + gap);
      els.push({ type:'img', src: A + 'maps/globe_' + g.replace('-', '_') + shade + '.png', x:x, y:y0, w:D, h:D * 782 / 800 });
      if (caps[i]) els.push({ type:'t', text:caps[i], x:x - 0.3, y:y0 + D + 0.2, w:D + 0.6, h:0.3, font:'B', size:9,
        color:INK, bold:true, caps:true, charSpacing:0.6, align:'center', valign:'top', lineSpacing:1,
        insets:{l:0,t:0,r:0,b:0} });
    });
    return els;
  }
  var W = WORLD[cfg.style] || WORLD.solid;
  var areaW = 12.12, areaH = 5.05, h = Math.min(areaH, areaW / W.aspect), w = h * W.aspect;
  els.push({ type:'img', src: A + 'maps/' + W.file + (W.variants ? shade : '') + '.png',
    x: 0.61 + (areaW - w) / 2, y: 1.95 + (areaH - h) / 2, w: w, h: h });
  return els;
}

DL.LAYOUT_MAP.mapUS = layout_mapUS;
DL.LAYOUT_MAP.mapWorld = layout_mapWorld;
DL.LAYOUT_KEYS.mapWorld = ['tag', 'title', 'intro', 'text', 'style', 'globes', 'captions'];
DL.LAYOUT_KEYS.mapUS = ['tag', 'title', 'intro', 'text', 'style', 'highlight', 'cities', 'legend', 'marker'];
DL.MAPS = { project: project, findState: findState, resolveCity: resolveCity };
})();
