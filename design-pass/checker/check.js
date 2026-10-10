// Design Pass checker core: reads a .pptx (a JSZip instance) and reports, per
// slide, what Design Pass would fix and what it would queue for a designer,
// against rules/mmw_rules.json.
//
// check() only reads. fix() runs the same pass again with the report's
// approved fixes and edits the XML at the exact spot each finding came from,
// so a fix can only ever be something the report listed.
//
// Runs in the browser (window.DesignPassCheck) and in node (module.exports);
// node passes DOMParser, XMLSerializer and sha256 in opts.
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
  var POL = rules.policy, cache = {}, hashCache = {}, docPath = new Map(), dirty = {};
  var applying = !!opts.apply, failed = [];

  function read(p) {
    if (!p) return Promise.resolve(null);
    if (cache[p] !== undefined) return Promise.resolve(cache[p]);
    var f = zip.file(p);
    if (!f) return Promise.resolve(cache[p] = null);
    return f.async('string').then(function (s) { var d = new DP().parseFromString(s, 'application/xml'); docPath.set(d, p); return (cache[p] = d); });
  }
  function touch(node) { var d = node.ownerDocument || node; if (docPath.has(d)) dirty[docPath.get(d)] = d; }
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
  // add() records a finding and returns true when fix() was asked to apply it.
  function bucket(list, n) {
    var idx = {};
    return function add(check, key, f) {
      var k = check + '|' + key, go = applying && opts.apply.has(n + '|' + k);
      if (idx[k]) { idx[k].count += f.count || 1; if (f.sample && idx[k].samples.length < 3 && idx[k].samples.indexOf(f.sample) < 0) idx[k].samples.push(f.sample); return go; }
      var action = (POL.checks[check] || {}).action || 'flag';
      if (f.force_flag) action = 'flag';
      var o = { check: check, key: key, action: action, msg: f.msg, count: f.count || 1, samples: f.sample ? [f.sample] : [] };
      if (f.from !== undefined) o.from = f.from;
      if (f.to !== undefined) o.to = f.to;
      if (f.rec) o.rec = f.rec;
      idx[k] = o; list.push(o);
      return go;
    };
  }
  var deckFindings = []; report.deck.findings = deckFindings;
  var addDeck = bucket(deckFindings, 0);

  var scale = 1, theme = null, clrMap = {}, deckOnTemplate = false, masters = {}, slideWin = 13.33, slideHin = 7.5;
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
  function loadMaster(mp) {
    return Promise.all([read(mp), rels(mp)]).then(function (m) {
      var M = (masters[mp] = { clrMap: {}, theme: { colors: {}, fonts: {} }, themeDoc: null, mmwNames: 0, mmw: false });
      var cm = m[0] && kid(m[0].documentElement, 'p', 'clrMap');
      if (cm) for (var i = 0; i < cm.attributes.length; i++) M.clrMap[cm.attributes[i].name] = cm.attributes[i].value;
      var lps = Object.keys(m[1]).filter(function (k) { return m[1][k].type === 'slideLayout'; }).map(function (k) { return m[1][k].target; });
      return Promise.all([read(relOfType(m[1], 'theme'))].concat(lps.map(read))).then(function (docs) {
        var t = docs[0], names = {};
        M.themeDoc = t;
        if (t) {
          clrMap = M.clrMap; theme = M.theme;   // colourOf() resolves through these
          var cs = all(t, 'a', 'clrScheme')[0];
          kids(cs, 'a').forEach(function (c) { var v = kids(c, 'a')[0]; if (v) M.theme.colors[c.localName] = colourOf(v); });
          ['majorFont', 'minorFont'].forEach(function (k) { var l = path(all(t, 'a', k)[0], 'a:latin'); M.theme.fonts[k === 'majorFont' ? 'major' : 'minor'] = l && l.getAttribute('typeface'); });
        }
        docs.slice(1).forEach(function (d) { var c = d && path(d.documentElement, 'p:cSld'); if (c && rules.template_layouts[c.getAttribute('name')]) names[c.getAttribute('name')] = 1; });
        M.mmwNames = Object.keys(names).length;
        M.mmw = M.mmwNames >= POL.template_detect.min_layouts || (M.mmwNames > 0 && M.theme.fonts.major === rules.theme.fonts.major);
      });
    });
  }
  function ensurePng() {
    return read('[Content_Types].xml').then(function (ct) {
      var has = Array.prototype.some.call(ct.getElementsByTagName('Default'), function (d) { return (d.getAttribute('Extension') || '').toLowerCase() === 'png'; });
      if (has) return;
      var d = ct.createElementNS(ct.documentElement.namespaceURI, 'Default');
      d.setAttribute('Extension', 'png'); d.setAttribute('ContentType', 'image/png');
      ct.documentElement.insertBefore(d, ct.documentElement.firstChild); touch(d);
    });
  }
  function isAnnotation(hex) { return (rules.palette.annotations || [rules.palette.annotation]).some(function (a) { return de2000(hex, a) <= POL.colour.exact_de; }); }
  function useMaster(M) { if (M) { theme = M.theme; clrMap = M.clrMap; } }
  // Replace a colour element with a plain srgbClr, keeping its transparency.
  function setColour(el, hex) {
    var n = el.ownerDocument.createElementNS(NS.a, 'a:srgbClr');
    n.setAttribute('val', hex.slice(1));
    kids(el, 'a', 'alpha').forEach(function (a) { n.appendChild(a.cloneNode(true)); });
    el.parentNode.replaceChild(n, el); touch(n);
  }
  function remove(el) { if (el && el.parentNode) { touch(el); el.parentNode.removeChild(el); } }
  function fmtBg(b) { return !b ? 'none' : b.kind === 'solid' ? tokenName(b.hex) + (rules.palette.by_hex[b.hex] ? ' ' + b.hex : '') : b.asset ? 'image ' + b.asset : b.kind; }
  function short(s) { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > 60 ? s.slice(0, 57) + '...' : s; }

  // ---- deck level ----
  return read('ppt/presentation.xml').then(function (pres) {
    var sz = pres && kid(pres.documentElement, 'p', 'sldSz');
    if (!sz) throw new Error('Not a PowerPoint presentation (no ppt/presentation.xml)');
    var wIn = +sz.getAttribute('cx') / EMU, hIn = +sz.getAttribute('cy') / EMU;
    slideWin = wIn; slideHin = hIn;
    scale = wIn / rules.canvas.engine_in[0];
    report.deck.slide_in = [+wIn.toFixed(3), +hIn.toFixed(3)];
    report.deck.scale = +scale.toFixed(4);
    if (Math.abs(wIn / hIn - 16 / 9) > 0.02)
      addDeck('off_template', 'aspect', { msg: 'Slide size ' + wIn.toFixed(2) + ' x ' + hIn.toFixed(2) + ' in is not 16:9', force_flag: true,
        rec: 'Rebuild on the MMW template (16:9); content will need re-layout.' });
    return rels('ppt/presentation.xml').then(function (prels) {
      var ids = all(pres, 'p', 'sldId').map(function (s) { return prels[s.getAttributeNS(NS.r, 'id')]; }).filter(Boolean).map(function (r) { return r.target; });
      // Every slide master, its theme, and whether it is an MMW master: one that
      // carries the MMW layouts (a template-derived master carries all 66).
      // Judged per master, not per slide layout name -- "Title & Bullets" is
      // also a Keynote default, and a deck can mix MMW and pasted masters.
      var mpaths = Object.keys(prels).filter(function (k) { return prels[k].type === 'slideMaster'; }).map(function (k) { return prels[k].target; });
      return Promise.all(mpaths.map(loadMaster)).then(function () {
        var mmw = mpaths.filter(function (m) { return masters[m].mmw; });
        deckOnTemplate = mmw.length > 0;
        report.deck.on_template = deckOnTemplate;
        report.deck.masters = mpaths.map(function (m) { return { part: m, mmw_layouts: masters[m].mmwNames, mmw: masters[m].mmw }; });
        var M = masters[mmw[0] || mpaths[0]];
        useMaster(M);
        report.deck.theme = theme;
        var T = rules.theme;
        ['major', 'minor'].forEach(function (k) {
          if (theme.fonts[k] !== T.fonts[k] &&
              addDeck('theme_fonts', k, { msg: 'Theme ' + (k === 'major' ? 'heading' : 'body') + ' font is ' + (theme.fonts[k] || 'unset'), from: theme.fonts[k], to: T.fonts[k] })) {
            var l = M.themeDoc && path(all(M.themeDoc, 'a', k + 'Font')[0], 'a:latin');
            if (l) { l.setAttribute('typeface', T.fonts[k]); ['panose', 'pitchFamily', 'charset'].forEach(function (a) { l.removeAttribute(a); }); touch(l); }
          }
        });
        var diff = Object.keys(T.colors).filter(function (k) { return theme.colors[k] !== T.colors[k]; });
        if (diff.length)
          addDeck('theme_colours', 'scheme', { msg: 'Theme colour scheme differs from the template in ' + diff.length + ' slot' + (diff.length > 1 ? 's' : '') + ': ' + diff.join(', '),
            rec: 'Expected if the deck was not started from the MMW template; colours are checked per slide either way.' });
        return ids;
      });
    });
  }).then(function (slidePaths) {
    report.deck.slides = slidePaths.length;
    var seq = Promise.resolve();
    slidePaths.forEach(function (sp, i) { seq = seq.then(function () { return checkSlide(sp, i + 1); }); });
    return seq;
  }).then(function () {
    rollUp();
    // fix = changed automatically; flag = designer queue; info = shown, not counted.
    var sum = { fix: 0, flag: 0, info: 0, by_check: {}, slides_with_findings: 0, queue: 0 };
    report.deck.findings.concat.apply(report.deck.findings, report.slides.map(function (s) { return s.findings; })).forEach(function (f) {
      sum[f.action] = (sum[f.action] || 0) + 1;
      var b = (sum.by_check[f.check] = sum.by_check[f.check] || { fix: 0, flag: 0, info: 0, instances: 0 });
      b[f.action] = (b[f.action] || 0) + 1; b.instances += f.count;
    });
    report.slides.forEach(function (s) {
      if (s.findings.length) sum.slides_with_findings++;
      if (s.findings.some(function (f) { return f.action === 'flag'; })) sum.queue++;
    });
    report.summary = sum;
    if (!applying) return report;
    var XS = opts.XMLSerializer || root.XMLSerializer;
    Object.keys(dirty).forEach(function (p) {
      var x = new XS().serializeToString(dirty[p]);
      if (x.slice(0, 5) !== '<?xml') x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + x;
      zip.file(p, x);
    });
    report.changed_parts = Object.keys(dirty).length;
    report.failed = failed;
    return report;
  });

  // Deck-wide patterns are one decision, not one flag per slide.
  function rollUp() {
    var R = POL.rollup, total = report.slides.length;
    var off = report.slides.filter(function (s) { return s.on === 'other'; });
    var rebuild = !!(total && off.length / total >= R.off_template_share);
    report.deck.rebuild = rebuild;
    if (rebuild) {
      var lc = {};
      off.forEach(function (s) { lc[s.layout] = (lc[s.layout] || 0) + 1; });
      addDeck('off_template', 'deck', { msg: 'Deck is not on the MMW template: ' + off.length + ' of ' + total + ' slides (layouts: ' +
          Object.keys(lc).sort(function (a, b) { return lc[b] - lc[a]; }).slice(0, 4).map(function (k) { return '"' + k + '" x' + lc[k]; }).join(', ') + ')',
        force_flag: true, rec: 'Too different to fix in place: rebuild it with the MMW Presentation Builder agent in WPP Open, which produces on-brand slides from this content. No automatic fixes are offered for this deck.' });
      // Only what helps the rebuild stays: split proposals, pasted charts,
      // author markers. Fonts, colours, palette etc. are reset by the rebuild.
      report.slides.forEach(function (s) { s.findings = s.findings.filter(function (f) { return R.keep_on_rebuild.indexOf(f.check) >= 0 && f.action !== 'fix'; }); });
      for (var i = deckFindings.length - 1; i >= 0; i--) if (deckFindings[i].action === 'fix' || deckFindings[i].check === 'theme_colours') deckFindings.splice(i, 1);
      return;
    }
    var pal = {};
    report.slides.forEach(function (s) {
      s.findings.forEach(function (f) {
        if (f.check !== 'colour' || f.action === 'fix') return;
        var p = (pal[f.from] = pal[f.from] || { hex: f.from, slides: 0, uses: 0, nearest: f.msg.replace(/^.*nearest /, '') });
        p.slides++; p.uses += f.count;
      });
    });
    var wide = Object.keys(pal).filter(function (h) { return pal[h].slides >= Math.max(R.palette_min_slides, total * R.palette_min_share); });
    if (wide.length) {
      var items = wide.map(function (h) { return pal[h]; }).sort(function (a, b) { return b.slides - a.slides || b.uses - a.uses; });
      addDeck('colour', 'palette', { msg: 'Deck uses its own palette: ' + items.length + ' off-brand colour' + (items.length > 1 ? 's' : '') + ' recurring across slides', force_flag: true,
        rec: 'Decide once with a designer: map each to an MMW colour (nearest shown) or keep it as a deliberate client/partner palette.' });
      var shown = items.slice(0, 12).map(function (p) { return p.hex + ' on ' + p.slides + ' slide' + (p.slides > 1 ? 's' : '') + ' (nearest ' + p.nearest + ')'; });
      if (items.length > 12) shown.push('... and ' + (items.length - 12) + ' more, each on fewer slides');
      deckFindings[deckFindings.length - 1].items = shown;
      report.slides.forEach(function (s) { s.findings = s.findings.filter(function (f) { return !(f.check === 'colour' && f.action !== 'fix' && wide.indexOf(f.from) >= 0); }); });
    }
  }

  // ---- slide level ----
  function checkSlide(slidePath, n) {
    var S = { n: n, part: slidePath, findings: [] }, add = bucket(S.findings, n);
    report.slides.push(S);
    return Promise.all([read(slidePath), rels(slidePath)]).then(function (r) {
      var doc = r[0], srels = r[1], layoutPath = relOfType(srels, 'slideLayout');
      return Promise.all([read(layoutPath), rels(layoutPath)]).then(function (lr) {
        var ldoc = lr[0], mpath = relOfType(lr[1], 'slideMaster');
        return read(mpath).then(function (mdoc) {
          var M = masters[mpath];
          useMaster(M);
          return run(doc, srels, ldoc, lr[1], mdoc, M && M.mmw);
        });
      });
    });

    function run(doc, srels, ldoc, lrels, mdoc, onMmwMaster) {
      var csld = path(doc.documentElement, 'p:cSld');
      var lname = ldoc ? (path(ldoc.documentElement, 'p:cSld').getAttribute('name') || '') : '';
      S.layout = lname;
      var TL = onMmwMaster ? rules.template_layouts[lname] : null;
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
          rec: 'Rebuild this slide with the MMW Presentation Builder agent in WPP Open.' });
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
          if (add('background', 'bg', { msg: 'Background ' + fmtBg(bg) + ' -> ' + (one ? fmtBg(allowed[0]) : '?') + ' ("' + lname + '")', from: fmtBg(bg),
            to: one ? fmtBg(allowed[0]) : null, force_flag: !one || allowed[0].kind !== 'solid',
            rec: one ? (allowed[0].kind !== 'solid' ? 'Layout uses ' + fmtBg(allowed[0]) + ' -- reapply the layout background.' : null) : 'Layout allows ' + allowed.map(fmtBg).join(' or ') + ' -- pick one.' }))
            setBg(doc, allowed[0].hex);
        }
      }
      // If the background is about to be fixed, judge logos against the fixed one.
      var bgFixTo = TL && bg && S.findings.some(function (f) { return f.check === 'background' && f.action === 'fix'; }) ? TL.backgrounds[0] : null;
      var dark = bgFixTo ? luminance(bgFixTo.hex) < 0.5 : bg && bg.kind === 'solid' ? luminance(bg.hex) < 0.5 : null;
      function setBg(d, hex) {
        var c = path(d.documentElement, 'p:cSld'), old = kid(c, 'p', 'bg');
        var mk = function (tag) { return d.createElementNS(tag.charAt(0) === 'p' ? NS.p : NS.a, tag); };
        var nb = mk('p:bg'), pr = mk('p:bgPr'), sf = mk('a:solidFill'), clr = mk('a:srgbClr');
        clr.setAttribute('val', hex.slice(1)); sf.appendChild(clr); pr.appendChild(sf); pr.appendChild(mk('a:effectLst')); nb.appendChild(pr);
        if (old) c.replaceChild(nb, old); else c.insertBefore(nb, c.firstChild);
        touch(nb);
      }
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
        if (ph && !txt.trim() && ['sldNum', 'dt', 'ftr', 'hdr'].indexOf(ph.type) < 0 &&
            add('placeholder_text', 'empty-' + ph.type, { msg: ph.type === 'pic' ? 'Empty photo well' : 'Empty ' + ph.type + ' placeholder removed (it shows "Click to add..." while editing)',
              force_flag: ph.type === 'pic', rec: ph.type === 'pic' ? 'Add the photo or remove the well.' : null })) { remove(sp); return; }
        if (!tb) return;
        var low = txt.toLowerCase(), dropParas = [];
        phrases.forEach(function (p) {
          var re = new RegExp('(^|\\W)' + p.replace(/[.*+?^${}()|[\]\\%]/g, '\\$&') + '($|\\W)');
          if (re.test(low) && add('placeholder_text', 'phrase-' + p, { msg: 'Placeholder text "' + p + '" removed', sample: short(txt), force_flag: p === 'tbd' || p === 'xx%',
              rec: p === 'tbd' || p === 'xx%' ? 'Author marker: confirm the final value.' : null }))
            kids(tb, 'a', 'p').forEach(function (para) { if (re.test(textOf(para).toLowerCase()) && dropParas.indexOf(para) < 0) dropParas.push(para); });
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
          if (hex && isAnnotation(hex)) {
            if (add('annotation', 'cb', { msg: 'Template annotation text removed', sample: short(t) })) remove(r);
            return;
          }
          // font
          var lat = rpr && kid(rpr, 'a', 'latin'), face = lat && lat.getAttribute('typeface');
          if (face && face.charAt(0) === '+') face = face.indexOf('mj') > 0 ? theme.fonts.major : theme.fonts.minor;
          var szAttr = rpr && rpr.getAttribute('sz'), pt = szAttr ? +szAttr / 100 / scale : null;
          if (face && rules.fonts.allowed.indexOf(face) < 0 && rules.fonts.symbol.indexOf(face) < 0) {
            var role = isTitle || (pt && pt >= POL.fonts.display_min_pt) ? 'display' : 'body';
            var to = POL.fonts.by_role[role], ask = POL.fonts.flag_faces[face];
            if (ask) add('font_face', face + '?', { msg: face + ' is not an MMW template font', from: face, force_flag: true, sample: short(t), rec: ask });
            else if (add('font_face', face + '>' + to, { msg: face + ' -> ' + to, from: face, to: to, sample: short(t) })) {
              lat.setAttribute('typeface', to); ['panose', 'pitchFamily', 'charset'].forEach(function (a) { lat.removeAttribute(a); }); touch(lat);
            }
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
            if (add('casing', 'cap', { msg: 'ALL CAPS restored (the layout sets caps; this text switched them off)', sample: short(t), from: cap, to: 'all' })) { rpr.removeAttribute('cap'); touch(rpr); }
          if (hex) colourFinding(hex, 'text', t, ce);
        });
        if (dropParas.length) {
          dropParas.forEach(remove);
          if (!textOf(tb).trim()) { if (ph) { remove(sp); return; } }
          else if (!kids(tb, 'a', 'p').length) tb.appendChild(tb.ownerDocument.createElementNS(NS.a, 'a:p'));
        }
        if (!kids(tb, 'a', 'p').length) { tb.appendChild(tb.ownerDocument.createElementNS(NS.a, 'a:p')); touch(tb); }
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
          var ds = refs.map(function (r) {
            return Math.max(Math.abs(sx.x / scale - r[0]), Math.abs(sx.y / scale - r[1]), Math.abs(sx.w / scale - r[2]), Math.abs(sx.h / scale - r[3]));
          });
          var d = Math.min.apply(null, ds), ref = refs[ds.indexOf(d)];
          if (d > 0.005 && d <= POL.position.flag_in &&
              add('position', 'ph-' + (ph.idx || ph.type), { msg: (ph.type === 'title' ? 'Title' : 'Placeholder ' + (ph.idx || ph.type)) + ' snapped ' + d.toFixed(2) + ' in back to its template position',
                from: +d.toFixed(2), to: 0, force_flag: d > POL.position.snap_in,
                rec: d > POL.position.snap_in ? 'Snap back to the template position unless the move was deliberate.' : null })) {
            var xf = path(sp, 'p:spPr/a:xfrm'), E = function (v) { return String(Math.round(v * scale * EMU)); };
            kid(xf, 'a', 'off').setAttribute('x', E(ref[0])); kid(xf, 'a', 'off').setAttribute('y', E(ref[1]));
            kid(xf, 'a', 'ext').setAttribute('cx', E(ref[2])); kid(xf, 'a', 'ext').setAttribute('cy', E(ref[3]));
            touch(xf);
          }
        }
      });

      // annotation lines/arrows: text-free shapes drawn in an annotation colour
      all(csld, 'p', 'sp').concat(all(csld, 'p', 'cxnSp')).forEach(function (c) {
        if (!c.parentNode || textOf(c).trim()) return;
        var pr = kid(c, 'p', 'spPr'), ln = pr && kid(pr, 'a', 'ln'), lh = ln && fillHex(ln), fh = pr && fillHex(pr);
        if ((lh && isAnnotation(lh) && (!fh || isAnnotation(fh))) || (fh && isAnnotation(fh) && !lh))
          if (add('annotation', 'shape', { msg: 'Template annotation arrow/line removed', sample: nameOf(c).name })) remove(c);
      });

      // non-text colours: fills and lines on shapes, table cells
      all(csld, 'a', 'solidFill').forEach(function (sf) {
        if (up(sf, 'a', ['rPr', 'defRPr', 'endParaRPr', 'effectLst']) || up(sf, 'p', ['bg'])) return;
        var ce = kids(sf, 'a')[0], hex = ce && colourOf(ce);
        if (hex) colourFinding(hex, up(sf, 'a', ['ln']) ? 'line' : 'fill', null, ce);
      });
      S.words = words; S.max_paras = maxParas;

      // text fit: text that needs more room than its box and runs into other
      // text or off the slide (measured with the real font widths)
      if (rules.metrics) textFit();

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
          if (!m || watermark) return;
          // What the mark actually sits on: a panel behind it beats the slide background.
          var under = behind(p), onDark = under && under.hex ? luminance(under.hex) < 0.5 : dark;
          if (under && under.unknown) {
            if ((m.for_bg === 'dark') !== dark)
              add('logo_variant', m.asset + '?', { msg: (m.mark === 'logo' ? 'MMW logo' : 'WPP/Mazda lockup') + ' (' + m.variant + ') may be on the wrong background', force_flag: true,
                rec: 'It sits on a ' + under.unknown + ', so the variant cannot be judged automatically: check it reads clearly.' });
            return;
          }
          if (onDark !== null && (m.for_bg === 'dark') !== onDark &&
              add('logo_variant', m.asset, { msg: (m.mark === 'logo' ? 'MMW logo' : 'WPP/Mazda lockup') + ' ' + m.variant + ' -> ' + (m.variant === 'white' ? 'black' : 'white') + ' (on ' + (onDark ? 'dark' : 'light') + ')',
                from: m.asset, to: m.swap }))
            return swapLogo(rid, m.swap).catch(function (e) { failed.push({ slide: n, check: 'logo_variant', msg: 'Could not fetch ' + m.swap + ': ' + e.message }); });
        });
      }).filter(Boolean);
      return Promise.all(picJobs);

      // The fill directly behind a picture: the last shape before it in the
      // stacking order whose box holds the picture's centre. Groups and
      // non-solid fills come back as unknown -- then the logo is only flagged.
      function behind(pic) {
        if (up(pic, 'p', ['grpSp'])) return { unknown: 'grouped shape' };
        var px = xfrmOf(pic);
        if (!px) return null;
        var cx = px.x + px.w / 2, cy = px.y + px.h / 2, hit = null;
        var tree = path(doc.documentElement, 'p:cSld/p:spTree');
        for (var c = tree.firstChild; c && c !== pic; c = c.nextSibling) {
          if (c.nodeType !== 1) continue;
          var bx = c.localName === 'grpSp' ? (function () { var x = path(c, 'p:grpSpPr/a:xfrm'), o = x && kid(x, 'a', 'off'), e = x && kid(x, 'a', 'ext');
            return o && e ? { x: +o.getAttribute('x') / EMU, y: +o.getAttribute('y') / EMU, w: +e.getAttribute('cx') / EMU, h: +e.getAttribute('cy') / EMU } : null; })() : xfrmOf(c);
          if (!bx || cx < bx.x || cx > bx.x + bx.w || cy < bx.y || cy > bx.y + bx.h) continue;
          if (c.localName === 'grpSp') { hit = { unknown: 'grouped shape' }; continue; }
          if (c.localName === 'pic') { hit = { unknown: 'picture' }; continue; }
          var pr = kid(c, 'p', 'spPr');
          if (!pr || kid(pr, 'a', 'noFill')) continue;
          if (kid(pr, 'a', 'gradFill') || kid(pr, 'a', 'blipFill') || kid(pr, 'a', 'pattFill')) { hit = { unknown: 'gradient or picture fill' }; continue; }
          var fh = fillHex(pr);
          if (fh) hit = { hex: fh };
        }
        return hit;
      }
      function textFit() {
        var TF = POL.text_fit, slideH = slideHin, slideW = slideWin;
        var boxes = [];
        all(csld, 'p', 'sp').forEach(function (sp) {
          if (!sp.parentNode) return;
          var tb = kid(sp, 'p', 'txBody');
          if (!tb || !textOf(tb).trim()) return;
          var ph = phOf(sp), lsp = ph && ldoc ? layoutPh(ldoc, ph) : null;
          var box = absBox(sp) || (lsp && xfrmOf(lsp));
          if (!box || box.w <= 0) return;
          var bp = kid(tb, 'a', 'bodyPr'), lbp = lsp && path(lsp, 'p:txBody/a:bodyPr');
          var ins = function (k, d) { var v = bp && bp.getAttribute(k); if (v == null && lbp) v = lbp.getAttribute(k); return v != null ? +v / EMU : d; };
          var L = ins('lIns', 0.1), Rr = ins('rIns', 0.1), T = ins('tIns', 0.05), B = ins('bIns', 0.05);
          if ((bp && bp.getAttribute('wrap')) === 'none') return;
          var auto = bp && (kid(bp, 'a', 'normAutofit') || kid(bp, 'a', 'spAutoFit') || kid(bp, 'a', 'noAutofit'));
          var fontScale = auto && auto.localName === 'normAutofit' && auto.getAttribute('fontScale') ? +auto.getAttribute('fontScale') / 100000 : 1;
          var lnRed = auto && auto.localName === 'normAutofit' && auto.getAttribute('lnSpcReduction') ? +auto.getAttribute('lnSpcReduction') / 100000 : 0;
          var mz = measure(tb, sp, lsp, box.w - L - Rr, fontScale, lnRed), need = mz.h + T + B;   // inches
          var anchor = (bp && bp.getAttribute('anchor')) || (lbp && lbp.getAttribute('anchor')) || 't';
          var top = anchor === 'ctr' ? box.y + (box.h - need) / 2 : anchor === 'b' ? box.y + box.h - need : box.y;
          boxes.push({ sp: sp, box: box, need: need, top: top, bottom: top + need, textTop: top + T, textBottom: top + need - B, line: mz.line,
            grows: auto && auto.localName === 'spAutoFit',
            label: short(paraTexts(tb).join(' ')).slice(0, 40) });
        });
        // Real collisions overflow by whole lines; a 10% estimate error on a
        // box that sits tight against its neighbour must not count. So: the
        // overflow is at least most of a line, and it reaches half a line into
        // the other box's text (not just its padding).
        boxes.forEach(function (a) {
          var over = a.need - a.box.h;
          if (over < Math.max(TF.tolerance_in * scale, TF.min_overflow_lines * a.line)) return;
          // what the overflowing text runs into
          var hit = boxes.filter(function (b) {
            if (b === a) return false;
            var hx = Math.min(a.box.x + a.box.w, b.box.x + b.box.w) - Math.max(a.box.x, b.box.x);
            var vy = Math.min(a.textBottom, b.textBottom) - Math.max(a.textTop, b.textTop);
            // only text the overflow reaches: b starts inside a's spill, not a's own box
            var spill = b.top >= a.box.y + a.box.h - TF.tolerance_in || b.bottom <= a.box.y + TF.tolerance_in;
            return spill && hx > Math.min(a.box.w, b.box.w) * 0.1 && vy > TF.min_overlap_lines * Math.min(a.line, b.line);
          })[0];
          var offSlide = a.textBottom > slideH + a.line / 2 || a.textTop < -a.line / 2;
          if (!hit && !offSlide) return;
          var cut = Math.max(5, Math.round((1 - (a.box.h - 0.0) / a.need) * 100));
          add('text_fit', 'fit-' + nameOf(a.sp).name, {
            msg: '"' + a.label + '" needs ' + (a.need / scale).toFixed(2) + ' in but its box is ' + (a.box.h / scale).toFixed(2) + ' in' +
              (hit ? ' -- it runs into "' + hit.label + '"' : ' -- it runs off the slide'),
            sample: a.label, from: +(a.need / scale).toFixed(2), to: +(a.box.h / scale).toFixed(2),
            rec: 'Cut about ' + cut + '% of this copy, or give it more room' + (S.on === 'builder' ? ' (regenerate the slide with the builder agent with shorter copy)' : '') + '.' });
        });
      }
      // Height (inches) the paragraphs of a text body need at width w (inches).
      function measure(tb, sp, lsp, w, fontScale, lnRed) {
        var M = rules.metrics, h = 0, maxLine = 0;
        var lst = function (el, lvl, attr, sub) {
          var d = el && path(el, 'p:txBody/a:lstStyle/a:lvl' + lvl + 'pPr' + (sub ? '/' + sub : ''));
          return d ? d.getAttribute(attr) : null;
        };
        kids(tb, 'a', 'p').forEach(function (p, i) {
          var ppr = kid(p, 'a', 'pPr'), lvl = (ppr && +ppr.getAttribute('lvl') || 0) + 1;
          var runs = kids(p, 'a', 'r'), text = runs.map(textOf).join('');
          var r0 = runs[0] && kid(runs[0], 'a', 'rPr'), end = kid(p, 'a', 'endParaRPr');
          var szA = (r0 && r0.getAttribute('sz')) || (!runs.length && end && end.getAttribute('sz')) || (ppr && path(ppr, 'a:defRPr') && path(ppr, 'a:defRPr').getAttribute('sz')) ||
            lst(sp, lvl, 'sz', 'a:defRPr') || lst(lsp, lvl, 'sz', 'a:defRPr') || 1800;
          var pt = +szA / 100 * fontScale;
          var lat = r0 && kid(r0, 'a', 'latin'), face = (lat && lat.getAttribute('typeface')) || theme.fonts.minor || 'Arial';
          if (face.charAt(0) === '+') face = face.indexOf('mj') > 0 ? theme.fonts.major : theme.fonts.minor;
          var bold = r0 && r0.getAttribute('b') === '1';
          var F = M[bold && M[face + ' Bold'] ? face + ' Bold' : face] || M[bold ? 'Arial Bold' : 'Arial'];
          var spc = r0 && r0.getAttribute('spc') ? +r0.getAttribute('spc') / 100 : 0;   // pt per char
          var cap = r0 && r0.getAttribute('cap') === 'all';
          // line spacing: paragraph, then shape / layout list styles; 100% default
          var ls = ppr && path(ppr, 'a:lnSpc'), pct = 1, pts = null;
          var lsEl = ls || (sp && path(sp, 'p:txBody/a:lstStyle/a:lvl' + lvl + 'pPr/a:lnSpc')) || (lsp && path(lsp, 'p:txBody/a:lstStyle/a:lvl' + lvl + 'pPr/a:lnSpc'));
          if (lsEl) { var a1 = kid(lsEl, 'a', 'spcPct'), a2 = kid(lsEl, 'a', 'spcPts'); if (a1) pct = +a1.getAttribute('val') / 100000; if (a2) pts = +a2.getAttribute('val') / 100; }
          pct = Math.max(0.5, pct - lnRed);
          var lineH = pts != null ? pts : pt * F.line * pct;   // pt
          var space = function (tag) { var e = ppr && path(ppr, 'a:' + tag); if (!e) return 0; var q = kid(e, 'a', 'spcPts'), r = kid(e, 'a', 'spcPct'); return q ? +q.getAttribute('val') / 100 : r ? +r.getAttribute('val') / 100000 * pt : 0; };
          var marL = ppr && ppr.getAttribute('marL') ? +ppr.getAttribute('marL') / EMU : 0;
          var avail = (w - marL) * 72;   // pt
          var cw = function (ch) { var c = (cap ? ch.toUpperCase() : ch).charCodeAt(0), v = F.w[c]; return (v != null ? v : 550) / 1000 * pt + spc; };
          // segments between line breaks (<a:br>), each wrapped on its own
          var segs = [''];
          kids(p, 'a').forEach(function (c) { if (c.localName === 'br') segs.push(''); else if (c.localName === 'r' || c.localName === 'fld') segs[segs.length - 1] += textOf(c); });
          var lines = 0;
          segs.forEach(function (seg) {
            if (!seg) { lines++; return; }
            var x = 0, n = 1;
            seg.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              var tw = 0; for (var k = 0; k < tok.length; k++) tw += cw(tok.charAt(k));
              if (/^\s+$/.test(tok)) { x += tw; return; }
              if (x > 0 && x + tw > avail) { n++; x = tw; } else x += tw;
            });
            lines += n;
          });
          h += lines * lineH + (i ? space('spcBef') : 0) + space('spcAft');
          maxLine = Math.max(maxLine, lineH);
        });
        return { h: h / 72, line: maxLine / 72 };
      }
      // Absolute box (inches) of a shape, through any group transforms.
      function absBox(sp) {
        var b = xfrmOf(sp);
        if (!b) return null;
        for (var g = sp.parentNode; g && g.localName === 'grpSp'; g = g.parentNode) {
          var x = path(g, 'p:grpSpPr/a:xfrm');
          if (!x) continue;
          var o = kid(x, 'a', 'off'), e = kid(x, 'a', 'ext'), co = kid(x, 'a', 'chOff'), ce = kid(x, 'a', 'chExt');
          if (!o || !e || !co || !ce) continue;
          var sx = +ce.getAttribute('cx') ? +e.getAttribute('cx') / +ce.getAttribute('cx') : 1, sy = +ce.getAttribute('cy') ? +e.getAttribute('cy') / +ce.getAttribute('cy') : 1;
          b = { x: +o.getAttribute('x') / EMU + (b.x - +co.getAttribute('x') / EMU) * sx, y: +o.getAttribute('y') / EMU + (b.y - +co.getAttribute('y') / EMU) * sy, w: b.w * sx, h: b.h * sy };
        }
        return b;
      }
      // Point this slide's picture at the other variant, added to ppt/media once.
      function swapLogo(rid, asset) {
        var media = 'ppt/media/designpass_' + asset;
        var have = zip.file(media) ? Promise.resolve() : opts.fetchAsset(asset).then(function (buf) { zip.file(media, buf); return ensurePng(); });
        return have.then(function () {
          var i = slidePath.lastIndexOf('/'), rp = slidePath.slice(0, i) + '/_rels/' + slidePath.slice(i + 1) + '.rels';
          return read(rp).then(function (rd) {
            Array.prototype.forEach.call(rd.getElementsByTagName('Relationship'), function (r) {
              if (r.getAttribute('Id') === rid) { r.setAttribute('Target', '../media/designpass_' + asset); touch(r); }
            });
          });
        });
      }
      function colourFinding(hex, where, sample, el) {
        if (opts.collect) { S.colours = S.colours || {}; S.colours[hex] = (S.colours[hex] || 0) + 1; }
        if (isAnnotation(hex)) return;   // the annotation check owns these
        if (POL.colour.ignore.indexOf(hex) >= 0 && where === 'text') return;
        var c = classify(hex);
        if (c.on) return;
        if (c.snap) { if (add('colour', hex + '>' + c.to, { msg: hex + ' -> ' + c.toName, from: hex, to: c.toName, sample: sample && short(sample) }) && el) setColour(el, c.to); }
        else add('colour', hex + '?', { msg: hex + ' is off palette (' + where + '); nearest ' + c.toName + ' (dE ' + c.d + ')', from: hex, force_flag: true,
          rec: c.d <= POL.colour.snap_max_de ? 'Between ' + c.toName + ' and ' + c.alt + ' -- pick one.' : 'No close brand colour -- recolour or confirm it is intentional (e.g. a client or partner colour).' });
      }
    }
  }
}

// Plain-text change log + designer queue, for people and for the Open agent.
function toText(rep, fileName, applied) {
  var L = [], pend = function (f) { return f.count > 1 ? ' (x' + f.count + ')' : ''; };
  L.push('DESIGN PASS REPORT -- ' + (fileName || 'deck') + ' -- ' + rep.deck.slides + ' slides');
  L.push((applied ? 'Fixed' : 'Would fix automatically') + ': ' + (applied ? applied.deck.length + applied.slides.reduce(function (t, s) { return t + s.findings.length; }, 0) : rep.summary.fix) +
    ' | Designer queue: ' + rep.summary.flag + ' items on ' + rep.summary.queue + ' slides');
  L.push('');
  var deckFlags = rep.deck.findings.filter(function (f) { return f.action === 'flag'; });
  var deckOther = rep.deck.findings.filter(function (f) { return f.action !== 'flag'; });
  if (deckOther.length) {
    L.push('DECK');
    deckOther.forEach(function (f) {
      L.push('  [' + f.action + '] ' + f.msg + (f.rec ? ' -- ' + f.rec : ''));
      (f.items || []).forEach(function (i) { L.push('      ' + i); });
    });
    L.push('');
  }
  L.push(applied ? 'CHANGE LOG (applied in the corrected copy)' : 'CHANGE LOG (would fix)');
  if (applied && applied.deck.length) L.push('  Deck: ' + applied.deck.map(function (f) { return f.msg; }).join('; '));
  (applied ? applied.slides : rep.slides).forEach(function (s) {
    var fx = s.findings.filter(function (f) { return f.action === 'fix'; });
    if (fx.length) L.push('  Slide ' + s.n + ': ' + fx.map(function (f) { return f.msg + pend(f); }).join('; '));
  });
  L.push('', 'DESIGNER QUEUE (beyond these fixes: use the MMW Presentation Builder agent in WPP Open)');
  if (deckFlags.length) {
    L.push('  Whole deck');
    deckFlags.forEach(function (f) {
      L.push('    - ' + f.msg + (f.rec ? ' -- ' + f.rec : ''));
      (f.items || []).forEach(function (i) { L.push('        ' + i); });
    });
  }
  rep.slides.forEach(function (s) {
    var fl = s.findings.filter(function (f) { return f.action === 'flag'; });
    if (!fl.length) return;
    L.push('  Slide ' + s.n + (s.title ? ' "' + s.title + '"' : '') + ' [' + (s.layout || 'no layout') + ']');
    fl.forEach(function (f) { L.push('    - ' + f.msg + pend(f) + (f.rec ? ' -- ' + f.rec : '')); });
  });
  return L.join('\n');
}

// Apply the report's fixes. `checks` limits it to some categories (default:
// every fix-action check). The deck must be the same file the report came
// from. Mutates `zip`; returns the second-pass report, whose fix findings are
// exactly what was changed (minus `failed`).
function fix(zip, rules, report, opts) {
  opts = opts || {};
  if (report.deck.rebuild) return Promise.reject(new Error('This deck needs a rebuild, not fixes.'));
  var want = opts.checks || Object.keys(rules.policy.checks).filter(function (c) { return rules.policy.checks[c].action === 'fix'; });
  var apply = new Set();
  var take = function (n) { return function (f) { if (f.action === 'fix' && want.indexOf(f.check) >= 0) apply.add(n + '|' + f.check + '|' + f.key); }; };
  report.deck.findings.forEach(take(0));
  report.slides.forEach(function (s) { s.findings.forEach(take(s.n)); });
  var o = {}; for (var k in opts) o[k] = opts[k];
  o.apply = apply;
  return check(zip, rules, o).then(function (rep) {
    var keep = function (n) { return function (f) { return f.action === 'fix' && apply.has(n + '|' + f.check + '|' + f.key); }; };
    rep.applied = { deck: rep.deck.findings.filter(keep(0)), slides: rep.slides.map(function (s) { return { n: s.n, findings: s.findings.filter(keep(s.n)) }; })
      .filter(function (s) { return s.findings.length; }) };
    return rep;
  });
}

var api = { check: check, fix: fix, toText: toText, de2000: de2000 };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DesignPassCheck = api;
})(typeof window !== 'undefined' ? window : globalThis);
