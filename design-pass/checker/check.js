// Design Pass checker core: reads a .pptx (a JSZip instance) and reports, per
// slide, what Design Pass would fix and what it would queue for a designer,
// against rules/mmw_rules.json. Report only -- it never edits the deck.
//
// Runs in the browser (window.DesignPassCheck) and in node (module.exports);
// node passes a DOMParser and a sha256 function in opts.
(function (root) {
'use strict';
var NS = {
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
};
var EMU = 914400;

// ---- xml helpers ------------------------------------------------------
function kids(el, ns, name) {
  var out = [];
  for (var c = el && el.firstChild; c; c = c.nextSibling)
    if (c.nodeType === 1 && (!ns || c.namespaceURI === NS[ns]) && (!name || c.localName === name)) out.push(c);
  return out;
}
function kid(el, ns, name) { return kids(el, ns, name)[0] || null; }
function path(el, steps) {   // path(el, 'p:cSld/p:bg/p:bgPr')
  var s = steps.split('/');
  for (var i = 0; el && i < s.length; i++) { var q = s[i].split(':'); el = kid(el, q[0], q[1]); }
  return el;
}
function all(el, ns, name) { return el ? Array.prototype.slice.call(el.getElementsByTagNameNS(NS[ns], name)) : []; }
function up(el, ns, names) {   // nearest ancestor with one of these local names
  for (var e = el.parentNode; e && e.nodeType === 1; e = e.parentNode)
    if (e.namespaceURI === NS[ns] && names.indexOf(e.localName) >= 0) return e;
  return null;
}
function textOf(el) { return all(el, 'a', 't').map(function (t) { return t.textContent; }).join(''); }
function paraTexts(txBody) {
  return kids(txBody, 'a', 'p').map(function (p) { return textOf(p); });
}

// ---- colour -----------------------------------------------------------
function hexToRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase(); }
function rgbToHsl(c) {
  var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
  if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, s, l];
}
function hslToRgb(x) {
  var h = x[0], s = x[1], l = x[2];
  if (!s) return [l * 255, l * 255, l * 255];
  function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
function lab(hex) {
  var c = hexToRgb(hex).map(function (v) { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; });
  var x = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function de2000(h1, h2) {   // CIEDE2000
  var L1 = lab(h1), L2 = lab(h2), rad = Math.PI / 180;
  var C1 = Math.hypot(L1[1], L1[2]), C2 = Math.hypot(L2[1], L2[2]), Cb = (C1 + C2) / 2;
  var G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  var a1 = L1[1] * (1 + G), a2 = L2[1] * (1 + G), c1 = Math.hypot(a1, L1[2]), c2 = Math.hypot(a2, L2[2]);
  var hh1 = Math.atan2(L1[2], a1) / rad; if (hh1 < 0) hh1 += 360;
  var hh2 = Math.atan2(L2[2], a2) / rad; if (hh2 < 0) hh2 += 360;
  var dL = L2[0] - L1[0], dC = c2 - c1, dh = 0;
  if (c1 * c2) { dh = hh2 - hh1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  var dH = 2 * Math.sqrt(c1 * c2) * Math.sin(dh / 2 * rad);
  var Lb = (L1[0] + L2[0]) / 2, cb = (c1 + c2) / 2, hb = hh1 + hh2;
  if (c1 * c2) { hb = Math.abs(hh1 - hh2) > 180 ? (hh1 + hh2 + (hh1 + hh2 < 360 ? 360 : -360)) / 2 : (hh1 + hh2) / 2; }
  var T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  var Sl = 1 + 0.015 * Math.pow(Lb - 50, 2) / Math.sqrt(20 + Math.pow(Lb - 50, 2)), Sc = 1 + 0.045 * cb, Sh = 1 + 0.015 * cb * T;
  var Rt = -2 * Math.sqrt(Math.pow(cb, 7) / (Math.pow(cb, 7) + Math.pow(25, 7))) * Math.sin(60 * Math.exp(-Math.pow((hb - 275) / 25, 2)) * rad);
  return Math.sqrt(Math.pow(dL / Sl, 2) + Math.pow(dC / Sc, 2) + Math.pow(dH / Sh, 2) + Rt * (dC / Sc) * (dH / Sh));
}
function luminance(hex) { var c = hexToRgb(hex); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }

// ---- the check --------------------------------------------------------
function check(zip, rules, opts) {
  opts = opts || {};
  var DP = opts.DOMParser || root.DOMParser;
  var sha256 = opts.sha256 || function (buf) {
    return root.crypto.subtle.digest('SHA-256', buf).then(function (d) {
      return Array.prototype.map.call(new Uint8Array(d), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join('');
    });
  };
  var POL = rules.policy, cache = {}, hashCache = {};

  function read(p) {
    if (cache[p] !== undefined) return Promise.resolve(cache[p]);
    var f = zip.file(p);
    if (!f) return Promise.resolve(cache[p] = null);
    return f.async('string').then(function (s) { return (cache[p] = new DP().parseFromString(s, 'application/xml')); });
  }
  function resolve(base, target) {
    if (target.charAt(0) === '/') return target.slice(1);
    var parts = base.split('/'); parts.pop();
    target.split('/').forEach(function (s) { if (s === '..') parts.pop(); else if (s !== '.') parts.push(s); });
    return parts.join('/');
  }
  function rels(part) {
    var i = part.lastIndexOf('/');
    return read(part.slice(0, i) + '/_rels/' + part.slice(i + 1) + '.rels').then(function (d) {
      var out = {};
      if (d) Array.prototype.forEach.call(d.getElementsByTagName('Relationship'), function (r) {
        out[r.getAttribute('Id')] = { type: r.getAttribute('Type').split('/').pop(), target: r.getAttribute('TargetMode') === 'External' ? null : resolve(part, r.getAttribute('Target')) };
      });
      return out;
    });
  }
  function relOfType(rs, type) { for (var k in rs) if (rs[k].type === type) return rs[k].target; return null; }
  function hashOf(p) {
    if (hashCache[p]) return hashCache[p];
    var f = zip.file(p);
    return (hashCache[p] = f ? f.async('arraybuffer').then(sha256) : Promise.resolve(null));
  }

  // palette lookups
  var tokenHexes = Object.keys(rules.palette.by_hex);
  var knownHexes = tokenHexes.concat(Object.keys(rules.palette.template_observed));
  function tokenName(hex) { return (rules.palette.by_hex[hex] || [])[0] || hex; }
  var colourMemo = {};
  function classify(hex) {
    if (colourMemo[hex]) return colourMemo[hex];
    var C = POL.colour, best = Infinity;
    knownHexes.forEach(function (k) { best = Math.min(best, de2000(hex, k)); });
    if (best <= C.exact_de) return (colourMemo[hex] = { on: true });
    var ranked = tokenHexes.map(function (k) { return { hex: k, d: de2000(hex, k) }; }).sort(function (a, b) { return a.d - b.d; });
    var t1 = ranked[0], t2 = ranked[1];
    // Unambiguous: the runner-up is clearly further away, in absolute terms or
    // (for near-misses like #2A2A2A vs asphalt, dE 1.3) at least twice as far.
    var snap = t1.d <= C.snap_max_de && (t2.d - t1.d >= C.ambiguity_margin_de || t2.d >= 2 * t1.d);
    return (colourMemo[hex] = { on: false, snap: snap, to: t1.hex, toName: tokenName(t1.hex), d: +t1.d.toFixed(1),
      alt: snap ? null : tokenName(t2.hex) });
  }

  // ---- report building ----
  var report = { schema: 'design-pass-report/1', rules: { schema: rules.schema, sources: rules.sources }, deck: {}, slides: [] };
  function bucket(list) {
    var idx = {};
    return function add(check, key, f) {
      var k = check + '|' + key;
      if (idx[k]) { idx[k].count += f.count || 1; if (f.sample && idx[k].samples.length < 3 && idx[k].samples.indexOf(f.sample) < 0) idx[k].samples.push(f.sample); return; }
      var action = (POL.checks[check] || {}).action || 'flag';
      if (f.force_flag) action = 'flag';
      var o = { check: check, action: action, msg: f.msg, count: f.count || 1, samples: f.sample ? [f.sample] : [] };
      if (f.from !== undefined) o.from = f.from;
      if (f.to !== undefined) o.to = f.to;
      if (f.rec) o.rec = f.rec;
      idx[k] = o; list.push(o);
    };
  }
  var deckFindings = []; report.deck.findings = deckFindings;
  var addDeck = bucket(deckFindings);

  var scale = 1, theme = null, clrMap = {}, deckOnTemplate = false;
  function themeHex(name) {
    var n = clrMap[name] || name;
    return theme && theme.colors[n] || null;
  }
  // A colour element (srgbClr / schemeClr / sysClr / prstClr) -> hex with lum mods applied.
  function colourOf(el) {
    var hex = null, ln = el.localName;
    if (ln === 'srgbClr') hex = '#' + el.getAttribute('val').toUpperCase();
    else if (ln === 'schemeClr') hex = themeHex(el.getAttribute('val'));
    else if (ln === 'sysClr') hex = '#' + (el.getAttribute('lastClr') || '000000').toUpperCase();
    else if (ln === 'prstClr') hex = { black: '#000000', white: '#FFFFFF' }[el.getAttribute('val')] || null;
    if (!hex) return null;
    var mod = 0, lm = 1, lo = 0;
    kids(el, 'a').forEach(function (m) {
      var v = +m.getAttribute('val') / 100000;
      if (m.localName === 'lumMod') { lm = v; mod = 1; } else if (m.localName === 'lumOff') { lo = v; mod = 1; }
      else if (m.localName === 'shade') { hex = rgbToHex(hexToRgb(hex).map(function (c) { return c * v; })); }
      else if (m.localName === 'tint') { hex = rgbToHex(hexToRgb(hex).map(function (c) { return c + (255 - c) * (1 - v); })); }
    });
    if (mod) { var h = rgbToHsl(hexToRgb(hex)); h[2] = Math.min(1, h[2] * lm + lo); hex = rgbToHex(hslToRgb(h)); }
    return hex;
  }
  function fillHex(container) {   // first solidFill colour under a bg/spPr-like container
    var sf = kid(container, 'a', 'solidFill');
    if (!sf) return null;
    var c = kids(sf, 'a')[0];
    return c ? colourOf(c) : null;
  }
  function bgOf(doc) {
    var bg = doc && path(doc.documentElement, 'p:cSld/p:bg');
    if (!bg) return null;
    var pr = kid(bg, 'p', 'bgPr');
    if (pr) {
      if (kid(pr, 'a', 'blipFill')) return { kind: 'picture' };
      if (kid(pr, 'a', 'gradFill')) return { kind: 'gradient' };
      var h = fillHex(pr);
      return h ? { kind: 'solid', hex: h } : { kind: 'other' };
    }
    var ref = kid(bg, 'p', 'bgRef');
    if (ref) { var c = kids(ref, 'a')[0]; var hx = c && colourOf(c); return hx ? { kind: 'solid', hex: hx, approx: true } : { kind: 'other' }; }
    return { kind: 'other' };
  }
  function phOf(sp) {
    var nv = kids(sp).filter(function (c) { return /^nv/.test(c.localName); })[0];
    var ph = nv && path(nv, 'p:nvPr/p:ph');
    return ph ? { type: ph.getAttribute('type') || 'body', idx: ph.getAttribute('idx') } : null;
  }
  function nameOf(sp) {
    var nv = kids(sp).filter(function (c) { return /^nv/.test(c.localName); })[0];
    var c = nv && kid(nv, 'p', 'cNvPr');
    return c ? { name: c.getAttribute('name') || '', descr: c.getAttribute('descr') || '' } : { name: '', descr: '' };
  }
  function xfrmOf(sp) {
    var x = path(sp, 'p:spPr/a:xfrm');
    if (!x) return null;
    var o = kid(x, 'a', 'off'), e = kid(x, 'a', 'ext');
    if (!o || !e) return null;
    return { x: +o.getAttribute('x') / EMU, y: +o.getAttribute('y') / EMU, w: +e.getAttribute('cx') / EMU, h: +e.getAttribute('cy') / EMU };
  }
  function layoutPh(layoutDoc, ph) {
    var hit = null;
    all(layoutDoc, 'p', 'sp').some(function (sp) {
      var q = phOf(sp);
      if (!q) return false;
      if ((ph.idx != null && q.idx === ph.idx) || (ph.idx == null && q.type === ph.type)) { hit = sp; return true; }
      return false;
    });
    return hit;
  }
  function capOf(sp) {
    var d = sp && path(sp, 'p:txBody/a:lstStyle/a:lvl1pPr/a:defRPr');
    return d ? d.getAttribute('cap') : null;
  }
  function fmtBg(b) { return !b ? 'none' : b.kind === 'solid' ? tokenName(b.hex) + (rules.palette.by_hex[b.hex] ? ' ' + b.hex : '') : b.asset ? 'image ' + b.asset : b.kind; }
  function short(s) { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > 60 ? s.slice(0, 57) + '...' : s; }

  // ---- deck level ----
  return read('ppt/presentation.xml').then(function (pres) {
    var sz = pres && kid(pres.documentElement, 'p', 'sldSz');
    if (!sz) throw new Error('Not a PowerPoint presentation (no ppt/presentation.xml)');
    var wIn = +sz.getAttribute('cx') / EMU, hIn = +sz.getAttribute('cy') / EMU;
    scale = wIn / rules.canvas.engine_in[0];
    report.deck.slide_in = [+wIn.toFixed(3), +hIn.toFixed(3)];
    report.deck.scale = +scale.toFixed(4);
    if (Math.abs(wIn / hIn - 16 / 9) > 0.02)
      addDeck('off_template', 'aspect', { msg: 'Slide size ' + wIn.toFixed(2) + ' x ' + hIn.toFixed(2) + ' in is not 16:9', force_flag: true,
        rec: 'Rebuild on the MMW template (16:9); content will need re-layout.' });
    return rels('ppt/presentation.xml').then(function (prels) {
      var ids = all(pres, 'p', 'sldId').map(function (s) { return prels[s.getAttributeNS(NS.r, 'id')]; }).filter(Boolean).map(function (r) { return r.target; });
      var master = relOfType(prels, 'slideMaster') || 'ppt/slideMasters/slideMaster1.xml';
      return Promise.all([read(master), rels(master)]).then(function (m) {
        var cm = m[0] && kid(m[0].documentElement, 'p', 'clrMap');
        if (cm) for (var i = 0; i < cm.attributes.length; i++) clrMap[cm.attributes[i].name] = cm.attributes[i].value;
        var tp = relOfType(m[1], 'theme');
        return read(tp).then(function (t) {
          theme = { colors: {}, fonts: {} };
          if (t) {
            var cs = all(t, 'a', 'clrScheme')[0];
            kids(cs, 'a').forEach(function (c) { var v = kids(c, 'a')[0]; if (v) theme.colors[c.localName] = colourOf(v); });
            ['majorFont', 'minorFont'].forEach(function (k) { var l = path(all(t, 'a', k)[0], 'a:latin'); theme.fonts[k === 'majorFont' ? 'major' : 'minor'] = l && l.getAttribute('typeface'); });
          }
          report.deck.theme = theme;
          var T = rules.theme;
          ['major', 'minor'].forEach(function (k) {
            if (theme.fonts[k] !== T.fonts[k])
              addDeck('theme_fonts', k, { msg: 'Theme ' + (k === 'major' ? 'heading' : 'body') + ' font is ' + (theme.fonts[k] || 'unset'), from: theme.fonts[k], to: T.fonts[k] });
          });
          var diff = Object.keys(T.colors).filter(function (k) { return theme.colors[k] !== T.colors[k]; });
          if (diff.length)
            addDeck('theme_colours', 'scheme', { msg: 'Theme colour scheme differs from the template in ' + diff.length + ' slot' + (diff.length > 1 ? 's' : '') + ': ' + diff.join(', '),
              rec: 'Expected if the deck was not started from the MMW template; colours are checked per slide either way.' });
          return ids;
        });
      });
    });
  }).then(function (slidePaths) {
    report.deck.slides = slidePaths.length;
    // Is the deck built on the MMW template? Judged from the layouts its masters
    // carry, not from one slide's layout name: a template-derived deck carries
    // dozens of MMW layouts, and some MMW names ("Title & Bullets") are also
    // Keynote defaults.
    var layoutParts = Object.keys(zip.files).filter(function (p) { return /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(p); });
    var seq = Promise.all(layoutParts.map(read)).then(function (docs) {
      var names = {};
      docs.forEach(function (d) { var c = d && path(d.documentElement, 'p:cSld'); if (c && rules.template_layouts[c.getAttribute('name')]) names[c.getAttribute('name')] = 1; });
      var n = Object.keys(names).length;
      deckOnTemplate = n >= POL.template_detect.min_layouts || (n > 0 && rules.fonts.allowed.indexOf(theme.fonts.major) >= 0);
      report.deck.mmw_layouts_in_masters = n;
      report.deck.on_template = deckOnTemplate;
    });
    slidePaths.forEach(function (sp, i) { seq = seq.then(function () { return checkSlide(sp, i + 1); }); });
    return seq;
  }).then(function () {
    rollUp();
    var sum = { fix: 0, flag: 0, by_check: {}, slides_with_findings: 0, queue: 0 };
    report.deck.findings.concat.apply(report.deck.findings, report.slides.map(function (s) { return s.findings; })).forEach(function (f) {
      sum[f.action === 'fix' ? 'fix' : 'flag']++;
      var b = (sum.by_check[f.check] = sum.by_check[f.check] || { fix: 0, flag: 0, instances: 0 });
      b[f.action === 'fix' ? 'fix' : 'flag']++; b.instances += f.count;
    });
    report.slides.forEach(function (s) {
      if (s.findings.length) sum.slides_with_findings++;
      if (s.findings.some(function (f) { return f.action !== 'fix'; })) sum.queue++;
    });
    report.summary = sum;
    return report;
  });

  // Deck-wide patterns are one decision, not one flag per slide.
  function rollUp() {
    var R = POL.rollup, total = report.slides.length;
    var off = report.slides.filter(function (s) { return s.on === 'other'; });
    var rebuild = total && off.length / total >= R.off_template_share;
    if (rebuild) {
      var lc = {};
      off.forEach(function (s) { lc[s.layout] = (lc[s.layout] || 0) + 1; });
      addDeck('off_template', 'deck', { msg: 'Deck is not on the MMW template: ' + off.length + ' of ' + total + ' slides (layouts: ' +
          Object.keys(lc).sort(function (a, b) { return lc[b] - lc[a]; }).slice(0, 4).map(function (k) { return '"' + k + '" x' + lc[k]; }).join(', ') + ')',
        force_flag: true, rec: 'Rebuild through the builder rather than fixing slide by slide; per-slide rebuild notes are left out.' });
      off.forEach(function (s) { s.findings = s.findings.filter(function (f) { return f.check !== 'off_template'; }); });
    }
    var pal = {};
    report.slides.forEach(function (s) {
      s.findings.forEach(function (f) {
        // On a deck headed for a rebuild, colour snaps go into the palette
        // decision too: snapping one colour of a deck's own palette mixes two.
        if (f.check !== 'colour' || (f.action === 'fix' && !rebuild)) return;
        var p = (pal[f.from] = pal[f.from] || { hex: f.from, slides: 0, uses: 0,
          nearest: f.action === 'fix' ? f.to + ', close match' : f.msg.replace(/^.*nearest /, '') });
        p.slides++; p.uses += f.count;
      });
    });
    // A deck headed for a rebuild gets its colours reset anyway: list them all once.
    var wide = Object.keys(pal).filter(function (h) { return rebuild || pal[h].slides >= Math.max(R.palette_min_slides, total * R.palette_min_share); });
    if (wide.length) {
      var items = wide.map(function (h) { return pal[h]; }).sort(function (a, b) { return b.slides - a.slides || b.uses - a.uses; });
      addDeck('colour', 'palette', { msg: 'Deck uses its own palette: ' + items.length + ' off-brand colour' + (items.length > 1 ? 's' : '') + (rebuild ? '' : ' recurring across slides'), force_flag: true,
        rec: 'Decide once with a designer: map each to an MMW colour (nearest shown) or keep it as a deliberate client/partner palette.' });
      var shown = items.slice(0, 12).map(function (p) { return p.hex + ' on ' + p.slides + ' slide' + (p.slides > 1 ? 's' : '') + ' (nearest ' + p.nearest + ')'; });
      if (items.length > 12) shown.push('... and ' + (items.length - 12) + ' more, each on fewer slides');
      deckFindings[deckFindings.length - 1].items = shown;
      report.slides.forEach(function (s) { s.findings = s.findings.filter(function (f) { return !(f.check === 'colour' && (f.action !== 'fix' || rebuild) && wide.indexOf(f.from) >= 0); }); });
    }
  }

  // ---- slide level ----
  function checkSlide(slidePath, n) {
    var S = { n: n, part: slidePath, findings: [] }, add = bucket(S.findings);
    report.slides.push(S);
    return Promise.all([read(slidePath), rels(slidePath)]).then(function (r) {
      var doc = r[0], srels = r[1], layoutPath = relOfType(srels, 'slideLayout');
      return Promise.all([read(layoutPath), rels(layoutPath)]).then(function (lr) {
        var ldoc = lr[0], mpath = relOfType(lr[1], 'slideMaster');
        return read(mpath).then(function (mdoc) { return run(doc, srels, ldoc, lr[1], mdoc); });
      });
    });

    function run(doc, srels, ldoc, lrels, mdoc) {
      var csld = path(doc.documentElement, 'p:cSld');
      var lname = ldoc ? (path(ldoc.documentElement, 'p:cSld').getAttribute('name') || '') : '';
      S.layout = lname;
      var TL = deckOnTemplate ? rules.template_layouts[lname] : null;
      S.on = TL ? 'template' : /^SD_(LIGHT|DARK)/.test(lname) ? 'builder' : 'other';
      if (TL) S.specs = TL.specs;
      var shapes = all(csld, 'p', 'sp'), pics = all(csld, 'p', 'pic');
      var titleSp = shapes.filter(function (s) { var q = phOf(s); return q && (q.type === 'title' || q.type === 'ctrTitle'); })[0];
      var joined = function (sp) { var tb = kid(sp, 'p', 'txBody'); return tb ? paraTexts(tb).join(' ') : ''; };
      var field = function (sp) { var q = phOf(sp); return q && ['sldNum', 'dt', 'ftr', 'hdr'].indexOf(q.type) >= 0; };
      S.title = short(titleSp ? joined(titleSp) : (shapes.filter(function (sp) { return !field(sp); }).map(joined)
        .filter(function (t) { return t.trim() && !/^\d+$/.test(t.trim()); })[0] || ''));
      S.charts = all(csld, 'a', 'graphicData').filter(function (g) { return /chart/.test(g.getAttribute('uri') || ''); }).length;
      S.pictures = pics.length;

      if (S.on === 'other')
        add('off_template', 'layout', { msg: 'Not on an MMW layout (layout "' + (lname || 'unnamed') + '")', force_flag: true,
          rec: 'Rebuild through the builder: extract the content, pick the MMW layout for what this slide says, regenerate.' });
      if (S.on === 'builder')
        S.note = 'Builder output: MMW layout identified by geometry (not yet implemented).';

      // background
      var bg = bgOf(doc) || bgOf(ldoc) || bgOf(mdoc);
      S.background = bg;
      if (TL && bg) {
        var allowed = TL.backgrounds;
        var ok = allowed.some(function (a) { return bg.kind === 'solid' ? a.kind === 'solid' && de2000(a.hex, bg.hex) <= POL.colour.exact_de : a.kind !== 'solid' && bg.kind === 'picture'; });
        if (!ok) {
          var solids = allowed.filter(function (a) { return a.kind === 'solid'; });
          var one = allowed.length === 1;
          add('background', 'bg', { msg: 'Background ' + fmtBg(bg) + ' is not a "' + lname + '" background', from: fmtBg(bg),
            to: one ? fmtBg(allowed[0]) : null, force_flag: !one,
            rec: one ? null : 'Layout allows ' + allowed.map(fmtBg).join(' or ') + ' -- pick one.' });
        }
      }
      var dark = bg && bg.kind === 'solid' ? luminance(bg.hex) < 0.5 : null;
      if (dark === null && TL) {
        var ds = TL.specs.map(function (s) { var b = rules.layouts[s].background; return b ? b.dark : null; });
        if (ds.every(function (d) { return d === ds[0]; })) dark = ds[0];
      }
      S.dark = dark;

      // text: fonts, sizes, colours, annotations, placeholder text, casing, copy fit
      var words = 0, maxParas = 0, bodyParas = [];
      var phrases = POL.placeholder_text.phrases;
      shapes.forEach(function (sp) {
        var ph = phOf(sp), tb = kid(sp, 'p', 'txBody'), txt = tb ? textOf(tb) : '';
        var isTitle = ph && (ph.type === 'title' || ph.type === 'ctrTitle');
        if (ph && !txt.trim() && ['sldNum', 'dt', 'ftr', 'hdr'].indexOf(ph.type) < 0)
          add('placeholder_text', 'empty-' + ph.type, { msg: ph.type === 'pic' ? 'Empty photo well' : 'Empty ' + ph.type + ' placeholder (shows "Click to add..." while editing)',
            force_flag: ph.type === 'pic', rec: ph.type === 'pic' ? 'Add the photo or remove the well.' : null });
        if (!tb) return;
        var low = txt.toLowerCase();
        phrases.forEach(function (p) {
          if (new RegExp('(^|\\W)' + p.replace(/[.*+?^${}()|[\]\\%]/g, '\\$&') + '($|\\W)').test(low))
            add('placeholder_text', 'phrase-' + p, { msg: 'Placeholder text "' + p + '"', sample: short(txt), force_flag: p === 'tbd' || p === 'xx%',
              rec: p === 'tbd' || p === 'xx%' ? 'Author marker: confirm the final value.' : null });
        });
        var paras = paraTexts(tb).filter(function (t) { return t.trim(); });
        words += txt.split(/\s+/).filter(Boolean).length;
        if (!isTitle && paras.length > maxParas) { maxParas = paras.length; bodyParas = paras; }

        var lsp = ph && ldoc ? layoutPh(ldoc, ph) : null, lcap = capOf(lsp);
        all(tb, 'a', 'r').forEach(function (r) {
          var rpr = kid(r, 'a', 'rPr'), t = textOf(r);
          if (!t.trim()) return;
          // colour (annotation first: it is never content)
          var sf = rpr && kid(rpr, 'a', 'solidFill'), ce = sf && kids(sf, 'a')[0], hex = ce && colourOf(ce);
          if (hex && de2000(hex, rules.palette.annotation) <= POL.colour.exact_de) {
            add('annotation', 'cb', { msg: 'Template annotation (#CB297B)', sample: short(t) });
            return;
          }
          // font
          var lat = rpr && kid(rpr, 'a', 'latin'), face = lat && lat.getAttribute('typeface');
          if (face && face.charAt(0) === '+') face = face.indexOf('mj') > 0 ? theme.fonts.major : theme.fonts.minor;
          var szAttr = rpr && rpr.getAttribute('sz'), pt = szAttr ? +szAttr / 100 / scale : null;
          if (face && rules.fonts.allowed.indexOf(face) < 0 && rules.fonts.symbol.indexOf(face) < 0) {
            var role = isTitle || (pt && pt >= POL.fonts.display_min_pt) ? 'display' : 'body';
            var to = POL.fonts.by_role[role];
            add('font_face', face + '>' + to, { msg: face + ' -> ' + to, from: face, to: to, sample: short(t) });
          }
          // size on the scale
          // (template slides only: builder slides are sized by the engine's own
          // text fit, and off-template slides get rebuilt anyway)
          if (TL && pt && face && rules.type_scale[face]) {
            var near = rules.type_scale[face].reduce(function (b, s) { return Math.abs(s.pt - pt) < Math.abs(b - pt) ? s.pt : b; }, Infinity);
            if (Math.abs(near - pt) > POL.type_scale.tolerance_pt)
              add('type_scale', face + '@' + pt.toFixed(1), { msg: face + ' ' + pt.toFixed(1) + 'pt is off the type scale (nearest ' + near + 'pt)', from: +pt.toFixed(1), to: near });
          }
          // casing overridden against the layout
          var cap = rpr && rpr.getAttribute('cap');
          if (lcap === 'all' && cap && cap !== 'all')
            add('casing', 'cap', { msg: 'Caps switched off where the layout sets ALL CAPS', sample: short(t), from: cap, to: 'all' });
          if (hex) colourFinding(hex, 'text', t);
        });
        // copy fit: title against its budget, when the layout has one spec
        if (isTitle && TL && TL.specs.length === 1) {
          var B = rules.layouts[TL.specs[0]].copy_budgets.title;
          if (B && B.max && txt.length > B.max * POL.density.over_budget_ratio)
            add('copy_fit', 'title', { msg: 'Title is ' + txt.length + ' characters; this layout holds ' + B.max + ' (' + B.fits + ' at template size)', sample: short(txt),
              rec: 'Shorten to about ' + B.fits + ' characters or move detail to the body.' });
        }
        // position against the layout's placeholder
        // (or against the same placeholder on the template's own demo slides,
        // which designers duplicate -- several sit 0.1-0.2 in off the layout)
        var sx = xfrmOf(sp), lx = lsp && xfrmOf(lsp), pk = ph && (ph.idx || ph.type);
        if (opts.collect && sx && ph) { S.ph_pos = S.ph_pos || {}; S.ph_pos[pk] = [sx.x, sx.y, sx.w, sx.h].map(function (v) { return +(v / scale).toFixed(3); }); }
        if (TL && sx && lx) {
          var refs = [[lx.x, lx.y, lx.w, lx.h].map(function (v) { return v / scale; })].concat((TL.ph_positions || {})[pk] || []);
          var d = Math.min.apply(null, refs.map(function (r) {
            return Math.max(Math.abs(sx.x / scale - r[0]), Math.abs(sx.y / scale - r[1]), Math.abs(sx.w / scale - r[2]), Math.abs(sx.h / scale - r[3]));
          }));
          if (d > 0.005 && d <= POL.position.flag_in)
            add('position', 'ph-' + (ph.idx || ph.type), { msg: (ph.type === 'title' ? 'Title' : 'Placeholder ' + (ph.idx || ph.type)) + ' is ' + d.toFixed(2) + ' in off its template position',
              from: +d.toFixed(2), to: 0, force_flag: d > POL.position.snap_in,
              rec: d > POL.position.snap_in ? 'Snap back to the template position unless the move was deliberate.' : null });
        }
      });

      // non-text colours: fills and lines on shapes, table cells
      all(csld, 'a', 'solidFill').forEach(function (sf) {
        if (up(sf, 'a', ['rPr', 'defRPr', 'endParaRPr', 'effectLst']) || up(sf, 'p', ['bg'])) return;
        var ce = kids(sf, 'a')[0], hex = ce && colourOf(ce);
        if (hex) colourFinding(hex, up(sf, 'a', ['ln']) ? 'line' : 'fill', null);
      });
      S.words = words; S.max_paras = maxParas;

      // density
      var maxW = POL.density.max_words_per_slide, maxP = POL.density.max_bullets;
      if (TL && TL.template_words) maxW = Math.max(maxW, Math.round(TL.template_words * POL.density.split_ratio));
      if (TL && TL.template_paras) maxP = Math.max(maxP, TL.template_paras);
      if (!TL) maxP = Infinity;   // no layout to compare a list length against
      if (words > maxW || maxParas > maxP) {
        var k = Math.ceil(bodyParas.length / 2);
        add('density', 'dense', { msg: words + ' words (this layout holds about ' + maxW + ')' + (maxParas > maxP ? ', ' + maxParas + ' points in one block' : ''),
          rec: bodyParas.length > 1 ? 'Too dense -- split into 2: "' + short(bodyParas[0]) + '" ... / "' + short(bodyParas[k]) + '" ...' : 'Too dense -- cut copy or move detail to the notes.' });
      }

      // pictures: brand marks on the wrong background; pictures that are probably charts
      var picJobs = pics.map(function (p) {
        var blip = all(p, 'a', 'blip')[0], rid = blip && blip.getAttributeNS(NS.r, 'embed'), tgt = rid && srels[rid] && srels[rid].target;
        if (!tgt) return null;
        var nm = nameOf(p), amf = all(blip, 'a', 'alphaModFix')[0], src = all(p, 'a', 'srcRect')[0];
        // A faded or cropped mark is a watermark (e.g. the 3.5% motion mark on
        // builder dividers), not the logo -- its variant is a design choice.
        var watermark = (amf && +amf.getAttribute('amt') < 50000) || (src && ['l', 't', 'r', 'b'].some(function (k) { return +(src.getAttribute(k) || 0) > 1000; }));
        if (/\.(emf|wmf)$/i.test(tgt))
          add('chart_image', 'emf', { msg: 'Pasted ' + tgt.split('.').pop().toUpperCase() + ' picture -- usually a chart or table from Excel', sample: nm.name,
            rec: 'Rebuild as a native chart; verify numbers -- they are read from an image.' });
        return hashOf(tgt).then(function (h) {
          var m = h && rules.brand_marks[h];
          if (m && !watermark && dark !== null && (m.for_bg === 'dark') !== dark)
            add('logo_variant', m.asset, { msg: (m.mark === 'logo' ? 'MMW logo' : 'WPP/Mazda lockup') + ' (' + m.variant + ') on a ' + (dark ? 'dark' : 'light') + ' background',
              from: m.asset, to: m.swap });
        });
      }).filter(Boolean);
      return Promise.all(picJobs);

      function colourFinding(hex, where, sample) {
        if (opts.collect) { S.colours = S.colours || {}; S.colours[hex] = (S.colours[hex] || 0) + 1; }
        if (POL.colour.ignore.indexOf(hex) >= 0 && where === 'text') return;
        var c = classify(hex);
        if (c.on) return;
        if (c.snap) add('colour', hex + '>' + c.to, { msg: hex + ' -> ' + c.toName + ' (' + where + ')', from: hex, to: c.toName, sample: sample && short(sample) });
        else add('colour', hex + '?', { msg: hex + ' is off palette (' + where + '); nearest ' + c.toName + ' (dE ' + c.d + ')', from: hex, force_flag: true,
          rec: c.d <= POL.colour.snap_max_de ? 'Between ' + c.toName + ' and ' + c.alt + ' -- pick one.' : 'No close brand colour -- recolour or confirm it is intentional (e.g. a client or partner colour).' });
      }
    }
  }
}

// Plain-text change log + designer queue, for people and for the Open agent.
function toText(rep, fileName) {
  var L = [], pend = function (f) { return f.count > 1 ? ' (x' + f.count + ')' : ''; };
  L.push('DESIGN PASS REPORT -- ' + (fileName || 'deck') + ' -- ' + rep.deck.slides + ' slides');
  L.push('Would fix automatically: ' + rep.summary.fix + ' | Designer queue: ' + rep.summary.flag + ' items on ' + rep.summary.queue + ' slides');
  L.push('');
  if (rep.deck.findings.length) {
    L.push('DECK');
    rep.deck.findings.forEach(function (f) {
      L.push('  [' + f.action + '] ' + f.msg + (f.rec ? ' -- ' + f.rec : ''));
      (f.items || []).forEach(function (i) { L.push('      ' + i); });
    });
    L.push('');
  }
  L.push('CHANGE LOG (would fix)');
  rep.slides.forEach(function (s) {
    var fx = s.findings.filter(function (f) { return f.action === 'fix'; });
    if (fx.length) L.push('  Slide ' + s.n + ': ' + fx.map(function (f) { return f.msg + pend(f); }).join('; '));
  });
  L.push('', 'DESIGNER QUEUE');
  rep.slides.forEach(function (s) {
    var fl = s.findings.filter(function (f) { return f.action !== 'fix'; });
    if (!fl.length) return;
    L.push('  Slide ' + s.n + (s.title ? ' "' + s.title + '"' : '') + ' [' + (s.layout || 'no layout') + ']');
    fl.forEach(function (f) { L.push('    - ' + f.msg + pend(f) + (f.rec ? ' -- ' + f.rec : '')); });
  });
  return L.join('\n');
}

var api = { check: check, toText: toText, de2000: de2000 };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DesignPassCheck = api;
})(typeof window !== 'undefined' ? window : globalThis);
