// Design Pass deck extract: what the Design Pass agent needs to plan a deck,
// as compact text the designer pastes into the agent chat. Per slide: text
// by box (reading order, with position), pictures (media path the plan can
// reuse as "orig:<path>"), native chart data, notes, identified layout and
// the checker's findings. Pairs with check.js (the report it summarises).
//
//   extract(zip, report, { DOMParser, sha256Hex, fileName }) -> Promise<string>
(function (root) {
'use strict';
var NS = { a: 'http://schemas.openxmlformats.org/drawingml/2006/main', p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', c: 'http://schemas.openxmlformats.org/drawingml/2006/chart' };
var EMU = 914400;

function extract(zip, report, opts) {
  opts = opts || {};
  var DP = opts.DOMParser || root.DOMParser;
  var parse = function (s) { return new DP().parseFromString(s, 'application/xml'); };
  var read = function (p) { var f = zip.file(p); return f ? f.async('string') : Promise.resolve(null); };
  var all = function (el, ns, n) { return el ? Array.prototype.slice.call(el.getElementsByTagNameNS(NS[ns], n)) : []; };
  var kid = function (el, ns, n) { for (var c = el && el.firstChild; c; c = c.nextSibling) if (c.nodeType === 1 && c.namespaceURI === NS[ns] && c.localName === n) return c; return null; };
  var resolve = function (base, t) { var parts = base.split('/'); parts.pop(); t.split('/').forEach(function (s) { if (s === '..') parts.pop(); else if (s !== '.') parts.push(s); }); return parts.join('/'); };
  var rels = function (p) {
    var i = p.lastIndexOf('/');
    return read(p.slice(0, i) + '/_rels/' + p.slice(i + 1) + '.rels').then(function (x) {
      var out = {};
      (x || '').replace(/<Relationship\b([^>]*)\/?>/g, function (m, a) {
        var g = function (k) { var r = new RegExp('\\b' + k + '="([^"]*)"').exec(a); return r ? r[1] : null; };
        if (g('TargetMode') !== 'External') out[g('Id')] = { type: g('Type').split('/').pop(), target: resolve(p, g('Target')) };
      });
      return out;
    });
  };
  var q = function (s) { return '"' + String(s).replace(/\s+/g, ' ').trim().replace(/"/g, "'") + '"'; };
  var inch = function (v) { return Math.round(+v / EMU / (report.deck.scale || 1) * 10) / 10; };
  var box = function (el) {
    var x = kid(kid(el, 'p', 'spPr') || kid(el, 'p', 'grpSpPr') || el, 'a', 'xfrm') || kid(el, 'p', 'xfrm');
    var o = x && kid(x, 'a', 'off'), e = x && kid(x, 'a', 'ext');
    return o && e ? [inch(o.getAttribute('x')), inch(o.getAttribute('y')), inch(e.getAttribute('cx')), inch(e.getAttribute('cy'))] : null;
  };

  return read('ppt/presentation.xml').then(function (px) {
    return rels('ppt/presentation.xml').then(function (pr) {
      var pres = parse(px);
      var slides = all(pres, 'p', 'sldId').map(function (s) { var r = pr[s.getAttributeNS(NS.r, 'id')]; return r && r.target; });
      var sc = report.scores || {};
      var L = [];
      L.push('DESIGN PASS EXTRACT v1');
      L.push('deck: ' + (opts.fileName || 'deck.pptx') + ' | sha256: ' + (opts.sha256Hex || '?') + ' | slides: ' + report.deck.slides +
        ' | size: ' + report.deck.slide_in.join(' x ') + ' in (positions below in 13.33 x 7.5 engine inches)');
      var src = report.deck.on_template ? 'built on the MMW template' : report.deck.builder ? (report.deck.builder.current ? 'MMW Presentation Builder output' : report.deck.builder.why) : 'not on the MMW template';
      L.push('source: ' + src + (report.deck.rebuild ? ' | REBUILD RECOMMENDED' : ''));
      if (sc.categories && sc.categories.length) L.push('brand readiness: ' + sc.overall.before + (sc.overall.after !== sc.overall.before ? ' (' + sc.overall.after + ' after auto-fixes)' : '') + ' | ' +
        sc.categories.map(function (c) { return c.label + ' ' + c.before; }).join(', '));
      report.deck.findings.forEach(function (f) { L.push('deck ' + (f.action === 'fix' ? '[auto-fix] ' : f.action === 'flag' ? '[designer] ' : '[note] ') + f.msg); });
      L.push('');

      var seq = Promise.resolve();
      slides.forEach(function (sp, i) {
        seq = seq.then(function () {
          return Promise.all([read(sp), rels(sp)]).then(function (r) {
            var doc = parse(r[0]), sr = r[1], S = report.slides[i] || {};
            var head = 'S' + (i + 1) + ' | layout: ' + (S.layout || '?') + ' (' + (S.on || '?') + ')' +
              (S.layout_match ? ' | matched: ' + S.layout_match : S.spec ? ' | spec: ' + S.spec : '') +
              (S.background ? ' | bg: ' + (S.background.hex || S.background.kind) : '');
            L.push(head);
            var tree = kid(kid(doc.documentElement, 'p', 'cSld'), 'p', 'spTree');
            var items = [];
            all(tree, 'p', 'sp').forEach(function (sp2) {
              var tb = kid(sp2, 'p', 'txBody');
              if (!tb) return;
              var paras = all(tb, 'a', 'p').map(function (p) {
                var t = all(p, 'a', 't').map(function (x) { return x.textContent; }).join('');
                var pPr = kid(p, 'a', 'pPr'), bullet = pPr && (kid(pPr, 'a', 'buChar') || kid(pPr, 'a', 'buAutoNum'));
                return t.trim() ? (bullet ? '• ' : '') + t.trim() : '';
              }).filter(Boolean);
              if (!paras.length) return;
              var nv = sp2.getElementsByTagNameNS(NS.p, 'ph')[0];
              var b = box(sp2) || [0, 0, 0, 0];
              items.push({ y: b[1], x: b[0], line: '  text' + (nv ? ' [' + (nv.getAttribute('type') || 'body') + ']' : '') + ' @' + b.join(',') + ': ' + paras.map(q).join(' / ') });
            });
            all(tree, 'p', 'pic').forEach(function (pic) {
              var blip = pic.getElementsByTagNameNS(NS.a, 'blip')[0], rid = blip && blip.getAttributeNS(NS.r, 'embed'), t = rid && sr[rid];
              if (!t) return;
              var b = box(pic) || [0, 0, 0, 0], nm = pic.getElementsByTagNameNS(NS.p, 'cNvPr')[0];
              var kind = /\.(emf|wmf)$/i.test(t.target) ? 'pasted EMF/WMF (often a chart/table)' : b[2] * b[3] > 20 ? 'large picture' : b[2] * b[3] < 1 ? 'small picture (logo/icon?)' : 'picture';
              items.push({ y: b[1], x: b[0], line: '  pic @' + b.join(',') + ': orig:' + t.target + ' (' + kind + (nm && nm.getAttribute('descr') ? ', alt ' + q(nm.getAttribute('descr')) : '') + ')' });
            });
            var charts = all(tree, 'p', 'graphicFrame').map(function (g) {
              var c = g.getElementsByTagNameNS(NS.c, 'chart')[0], rid = c && c.getAttributeNS(NS.r, 'id'), t = rid && sr[rid];
              return t ? { b: box(g) || [0, 0, 0, 0], part: t.target } : null;
            }).filter(Boolean);
            var tables = all(tree, 'a', 'tbl').map(function (tbl) {
              return all(tbl, 'a', 'tr').map(function (tr) { return all(tr, 'a', 'tc').map(function (tc) { return all(tc, 'a', 't').map(function (x) { return x.textContent; }).join(' ').trim(); }).join(' | '); });
            });
            tables.forEach(function (rows) { items.push({ y: 99, x: 0, line: '  table: ' + rows.slice(0, 12).map(q).join(' / ') + (rows.length > 12 ? ' (+' + (rows.length - 12) + ' rows)' : '') }); });
            var notesRel = Object.keys(sr).filter(function (k) { return sr[k].type === 'notesSlide'; })[0];
            return Promise.all(charts.map(function (ch) { return read(ch.part).then(function (cx) { return { ch: ch, cx: cx }; }); }).concat([notesRel ? read(sr[notesRel].target) : null]))
              .then(function (res) {
                var notesX = res.pop();
                res.forEach(function (o) {
                  if (!o.cx) return;
                  var cd = parse(o.cx), plot = cd.getElementsByTagNameNS(NS.c, 'plotArea')[0], type = '?';
                  for (var c = plot && plot.firstChild; c; c = c.nextSibling) if (c.nodeType === 1 && /Chart$/.test(c.localName)) {
                    type = c.localName.replace('Chart', ''); var bd = kid(c, 'c', 'barDir'); if (bd) type = bd.getAttribute('val') === 'bar' ? 'bar' : 'column'; break;
                  }
                  var ser = all(cd, 'c', 'ser').map(function (s) {
                    var name = all(kid(s, 'c', 'tx'), 'c', 'v').map(function (v) { return v.textContent; }).join('');
                    var cats = all(kid(s, 'c', 'cat'), 'c', 'pt').map(function (p) { return (p.getElementsByTagNameNS(NS.c, 'v')[0] || {}).textContent; });
                    var vals = all(kid(s, 'c', 'val'), 'c', 'pt').map(function (p) { return (p.getElementsByTagNameNS(NS.c, 'v')[0] || {}).textContent; });
                    return q(name || 'series') + ': ' + vals.map(function (v, j) { return (cats[j] != null ? cats[j] + '=' : '') + v; }).join(', ');
                  });
                  items.push({ y: o.ch.b[1], x: o.ch.b[0], line: '  chart @' + o.ch.b.join(',') + ': native ' + type + ' | ' + ser.join(' | ') });
                });
                items.sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (it) { L.push(it.line); });
                if (notesX) {
                  var nd = parse(notesX), nt = all(nd, 'p', 'sp').filter(function (s) { var ph = s.getElementsByTagNameNS(NS.p, 'ph')[0]; return ph && ph.getAttribute('type') === 'body'; })
                    .map(function (s) { return all(s, 'a', 't').map(function (x) { return x.textContent; }).join(' '); }).join(' ').trim();
                  if (nt) L.push('  notes: ' + q(nt));
                }
                (S.findings || []).forEach(function (f) { L.push('  ' + (f.action === 'fix' ? '[auto-fix] ' : '[designer] ') + f.msg + (f.count > 1 ? ' (x' + f.count + ')' : '')); });
                L.push('');
              });
          });
        });
      });
      return seq.then(function () { L.push('END OF EXTRACT'); return L.join('\n'); });
    });
  });
}

var api = { extract: extract };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DesignPassExtract = api;
})(typeof window !== 'undefined' ? window : globalThis);
