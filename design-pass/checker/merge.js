// Design Pass slide merge: put slides from a generated deck (the builder
// engine's PPTX export) into the original deck, in place of the slides they
// replace, in the original order. Used by targeted updates: the designer keeps
// the original file, and the corrected copy has rebuilt slides exactly where
// the old ones were.
//
//   merge(orig, gen, order, opts) -> Promise<{ log }>
//     orig, gen  JSZip instances (orig is modified in place)
//     order      the output deck, in order: [{ orig: n } | { gen: k }, ...]
//                (1-based slide numbers). Original slides left out of
//                `order` are removed; a split is two { gen } entries.
//
// What comes across with each generated slide: the slide, its notes, media,
// charts (+ embedded workbooks), and -- once -- the generated deck's slide
// master, its layouts and theme, registered as an extra master. If the decks
// differ in slide size (a template-made deck is 26.667in wide, the engine's
// 13.33in), the imported parts are scaled to fit.
(function (root) {
'use strict';
var REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function merge(orig, gen, order, opts) {
  opts = opts || {};
  var log = [], files = {}, ct = null, genCt = null;
  var readStr = function (z, p) { var f = z.file(p); return f ? f.async('string') : Promise.resolve(null); };
  var dirOf = function (p) { return p.slice(0, p.lastIndexOf('/')); };
  var relsOf = function (p) { var i = p.lastIndexOf('/'); return p.slice(0, i) + '/_rels/' + p.slice(i + 1) + '.rels'; };
  var resolve = function (base, t) {
    if (t.charAt(0) === '/') return t.slice(1);
    var parts = dirOf(base).split('/');
    t.split('/').forEach(function (s) { if (s === '..') parts.pop(); else if (s !== '.') parts.push(s); });
    return parts.join('/');
  };
  var relTarget = function (from, to) {   // relative path from part `from` to part `to`
    var a = dirOf(from).split('/'), b = to.split('/'), i = 0;
    while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
    var up = []; for (var j = i; j < a.length; j++) up.push('..');
    return up.concat(b.slice(i)).join('/');
  };
  var parseRels = function (xml) {
    var out = [];
    (xml || '').replace(/<Relationship\b([^>]*)\/?>/g, function (m, attrs) {
      var g = function (k) { var r = new RegExp('\\b' + k + '="([^"]*)"').exec(attrs); return r ? r[1] : null; };
      out.push({ id: g('Id'), type: g('Type'), target: g('Target'), mode: g('TargetMode'), raw: m });
    });
    return out;
  };
  var relsXml = function (rels) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      rels.map(function (r) { return '<Relationship Id="' + r.id + '" Type="' + r.type + '" Target="' + r.target + '"' + (r.mode ? ' TargetMode="' + r.mode + '"' : '') + '/>'; }).join('') +
      '</Relationships>';
  };
  // Content types: an Override per part, Defaults per extension.
  var ctOf = function (xml, part) {
    var m = new RegExp('<Override[^>]*PartName="/' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*ContentType="([^"]+)"').exec(xml) ||
            new RegExp('<Override[^>]*ContentType="([^"]+)"[^>]*PartName="/' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"').exec(xml);
    if (m) return { override: m[1] };
    var ext = part.split('.').pop().toLowerCase();
    var d = new RegExp('<Default[^>]*Extension="' + ext + '"[^>]*ContentType="([^"]+)"', 'i').exec(xml) ||
            new RegExp('<Default[^>]*ContentType="([^"]+)"[^>]*Extension="' + ext + '"', 'i').exec(xml);
    return d ? { ext: ext, def: d[1] } : null;
  };
  var addCt = function (part, info) {
    if (!info) return;
    if (info.override) {
      if (ct.indexOf('PartName="/' + part + '"') < 0) ct = ct.replace('</Types>', '<Override PartName="/' + part + '" ContentType="' + info.override + '"/></Types>');
    } else if (!new RegExp('Extension="' + info.ext + '"', 'i').test(ct)) {
      ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="' + info.ext + '" ContentType="' + info.def + '"/>');
    }
  };
  var dropCt = function (part) {
    ct = ct.replace(new RegExp('<Override[^>]*PartName="/' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*/>'), '');
  };
  // Next free name for a part like ppt/slides/slide{N}.xml
  var used = {};
  Object.keys(orig.files).forEach(function (p) { used[p] = 1; });
  var fresh = function (dir, stem, ext) {
    for (var i = 1; ; i++) { var p = dir + '/' + stem + i + '.' + ext; if (!used[p]) { used[p] = 1; return p; } }
  };

  var scale = 1;
  // Scale everything measured in EMU or points by s (rounded).
  function scaleXml(xml, s) {
    if (s === 1) return xml;
    var k = function (v) { return String(Math.round(+v * s)); };
    return xml
      .replace(/(<a:(?:off|chOff)\b[^>]*?\bx=")(-?\d+)("[^>]*?\by=")(-?\d+)"/g, function (m, a, x, b, y) { return a + k(x) + b + k(y) + '"'; })
      .replace(/(<a:(?:ext|chExt)\b[^>]*?\bcx=")(\d+)("[^>]*?\bcy=")(\d+)"/g, function (m, a, x, b, y) { return a + k(x) + b + k(y) + '"'; })
      .replace(/(<a:bodyPr\b[^>]*>)/g, function (m) { return m.replace(/\b([lrtb]Ins)="(\d+)"/g, function (q, n, v) { return n + '="' + k(v) + '"'; }); })
      .replace(/(<a:(?:pPr|lvl\dpPr)\b[^>]*>)/g, function (m) { return m.replace(/\b(marL|marR|indent|defTabSz)="(-?\d+)"/g, function (q, n, v) { return n + '="' + k(v) + '"'; }); })
      .replace(/<a:(?:rPr|defRPr|endParaRPr)\b[^>]*>/g, function (m) { return m.replace(/\b(sz|spc)="(-?\d+)"/g, function (q, n, v) { return n + '="' + k(v) + '"'; }); })
      .replace(/(<a:spcPts\b[^>]*?\bval=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:buSzPts\b[^>]*?\bval=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:ln\b[^>]*?\bw=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:tab\b[^>]*?\bpos=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:gridCol\b[^>]*?\bw=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:tr\b[^>]*?\bh=")(\d+)"/g, function (m, a, v) { return a + k(v) + '"'; })
      .replace(/(<a:(?:outerShdw|innerShdw)\b[^>]*>)/g, function (m) { return m.replace(/\b(blurRad|dist)="(\d+)"/g, function (q, n, v) { return n + '="' + k(v) + '"'; }); })
      .replace(/(<a:tc\b[^>]*>)|(<a:tcPr\b[^>]*>)/g, function (m) { return m.replace(/\bmar([LRTB])="(\d+)"/g, function (q, n, v) { return 'mar' + n + '="' + k(v) + '"'; }); });
  }
  // Only parts drawn on the slide canvas scale; notes pages have their own size.
  var scales = function (p) { return /^ppt\/(slides|slideLayouts|slideMasters|charts)\//.test(p); };
  var origNmPart = null;   // set once presentation rels are read
  // Relationships that point at something the original already has.
  var mapGlobal = function (kind, tgt) {
    if (kind === 'notesMaster' && origNmPart) return origNmPart;
    if (kind === 'slideLayout' && copied[tgt]) return copied[tgt];
    return null;
  };

  var copied = {};   // gen part -> new orig part
  var genRelsCache = {};
  var genRels = function (p) {
    if (genRelsCache[p]) return Promise.resolve(genRelsCache[p]);
    return readStr(gen, relsOf(p)).then(function (x) { return (genRelsCache[p] = parseRels(x)); });
  };

  // Copy one generated part (and, recursively, what it points to) into orig.
  // `map` decides the new name; `xmlFix` rewrites the copied XML.
  function copyPart(gp, opts2) {
    if (copied[gp]) return Promise.resolve(copied[gp]);
    opts2 = opts2 || {};
    var file = gp.split('/').pop(), ext = file.split('.').pop(), stem = file.slice(0, -ext.length - 1).replace(/[-\d]+$/, '') || 'part';
    var np = opts2.name || fresh(dirOf(gp), stem, ext);
    copied[gp] = np;
    var isXml = /\.(xml|rels)$/i.test(gp);
    return (isXml ? readStr(gen, gp) : gen.file(gp).async('uint8array')).then(function (body) {
      if (isXml) body = scaleXml(body, scales(gp) ? scale : 1);
      addCt(np, ctOf(genCt, gp));
      return genRels(gp).then(function (rels) {
        var out = [];
        return rels.reduce(function (p, r) {
          return p.then(function () {
            if (r.mode === 'External') { out.push(r); return; }
            var tgt = resolve(gp, r.target), kind = r.type.split('/').pop();
            if (opts2.skipRel && opts2.skipRel(kind, tgt)) return;
            var mapped = (opts2.mapRel && opts2.mapRel(kind, tgt)) || mapGlobal(kind, tgt);
            if (mapped) { out.push({ id: r.id, type: r.type, target: relTarget(np, mapped) }); return; }
            return copyPart(tgt).then(function (n2) { out.push({ id: r.id, type: r.type, target: relTarget(np, n2) }); });
          });
        }, Promise.resolve()).then(function () {
          if (opts2.xmlFix && isXml) body = opts2.xmlFix(body);
          files[np] = body;
          if (rels.length) files[relsOf(np)] = relsXml(out);
          return np;
        });
      });
    });
  }

  var pres, presRels, genPres, genPresRels, genSlides;
  return Promise.all([readStr(orig, '[Content_Types].xml'), readStr(gen, '[Content_Types].xml'),
    readStr(orig, 'ppt/presentation.xml'), readStr(orig, 'ppt/_rels/presentation.xml.rels'),
    readStr(gen, 'ppt/presentation.xml'), readStr(gen, 'ppt/_rels/presentation.xml.rels')]).then(function (r) {
    ct = r[0]; genCt = r[1]; pres = r[2]; presRels = parseRels(r[3]); genPres = r[4]; genPresRels = parseRels(r[5]);
    var onm = presRels.filter(function (x) { return /notesMaster$/.test(x.type); })[0];
    origNmPart = onm ? resolve('ppt/presentation.xml', onm.target) : null;
    var w = function (x) { return +/<p:sldSz[^>]*\bcx="(\d+)"/.exec(x)[1]; }, h = function (x) { return +/<p:sldSz[^>]*\bcy="(\d+)"/.exec(x)[1]; };
    scale = w(pres) / w(genPres);
    if (Math.abs(w(pres) / h(pres) - w(genPres) / h(genPres)) > 0.02) throw new Error('The original deck is not 16:9; rebuilt slides cannot be placed in it (use a full conversion).');
    if (Math.abs(scale - 1) < 0.001) scale = 1;
    log.push('scale ' + scale.toFixed(4));
    var byRid = function (rels, id) { return rels.filter(function (x) { return x.id === id; })[0]; };
    var list = function (xml, rels, tag) {
      var out = [], re = new RegExp('<p:' + tag + ' id="(\\d+)" r:id="([^"]+)"\\s*/>', 'g'), m;
      while ((m = re.exec(xml))) out.push({ id: +m[1], rid: m[2], part: resolve('ppt/presentation.xml', byRid(rels, m[2]).target), raw: m[0] });
      return out;
    };
    var origSlides = list(pres, presRels, 'sldId');
    genSlides = list(genPres, genPresRels, 'sldId');

    // ---- the masters the copied slides use, each imported once ----
    // (with all their layouts and theme, registered as extra masters)
    var donors = order.filter(function (o) { return o.gen; }).map(function (o) { return genSlides[o.gen - 1]; }).filter(Boolean);
    var masterDone = Promise.all(donors.map(function (g) {
      return genRels(g.part).then(function (rs) {
        var lay = rs.filter(function (r) { return /slideLayout$/.test(r.type); })[0];
        if (!lay) return null;
        var lp = resolve(g.part, lay.target);
        return genRels(lp).then(function (lr) { var m = lr.filter(function (r) { return /slideMaster$/.test(r.type); })[0]; return m ? resolve(lp, m.target) : null; });
      });
    })).then(function (ms) {
      var need = ms.filter(function (m, i) { return m && ms.indexOf(m) === i; });
      if (!need.length) return;
      // ids: masters and layouts share one id space, all > 2^31
      var maxId = 2147483648;
      (pres.match(/<p:sldMasterId id="(\d+)"/g) || []).forEach(function (s) { maxId = Math.max(maxId, +/(\d+)/.exec(s)[1]); });
      return Promise.all(Object.keys(orig.files).filter(function (p) { return /^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(p); })
        .map(function (p) { return readStr(orig, p); })).then(function (xs) {
        xs.forEach(function (x) { (x.match(/<p:sldLayoutId id="(\d+)"/g) || []).forEach(function (s) { maxId = Math.max(maxId, +/(\d+)/.exec(s)[1]); }); });
        var nextId = maxId + 1;
        return need.reduce(function (p, gmPart) {
          return p.then(function () {
            var masterId = nextId++;
            return copyPart(gmPart, {
              xmlFix: function (x) { return x.replace(/<p:sldLayoutId id="\d+"/g, function () { return '<p:sldLayoutId id="' + (nextId++) + '"'; }); }
            }).then(function (nm) {
              var rid = 'rId' + (1 + presRels.reduce(function (mx, x) { return Math.max(mx, +String(x.id).replace(/\D/g, '') || 0); }, 0));
              presRels.push({ id: rid, type: REL + '/slideMaster', target: relTarget('ppt/presentation.xml', nm) });
              pres = pres.replace('</p:sldMasterIdLst>', '<p:sldMasterId id="' + masterId + '" r:id="' + rid + '"/></p:sldMasterIdLst>');
              log.push('imported master ' + gmPart + ' -> ' + nm);
            });
          });
        }, Promise.resolve());
      });
    });

    return masterDone.then(function () {
      // notes: generated notes slides point at the generated notes master;
      // reuse the original's if it has one, else import it

      var maxSldId = Math.max.apply(null, [255].concat(origSlides.map(function (s) { return s.id; })));
      var nextRid = function () { return 'rId' + (1 + presRels.reduce(function (mx, x) { return Math.max(mx, +String(x.id).replace(/\D/g, '') || 0); }, 0)); };
      var newIds = {}, entries = [];
      return order.reduce(function (p, o) {
        return p.then(function () {
          if (o.orig) { var s = origSlides[o.orig - 1]; if (!s) throw new Error('No original slide ' + o.orig); entries.push(s.raw); return; }
          var g = genSlides[o.gen - 1];
          if (!g) throw new Error('No generated slide ' + o.gen);
          return copyPart(g.part, {
            mapRel: function (kind, tgt) { return kind === 'slideLayout' ? copied[tgt] : null; },
            skipRel: function () { return false; }
          }).then(function (np) {
            // notes slides of copied slides: point their notesMaster at the original's
            var id = ++maxSldId, rid = nextRid();
            presRels.push({ id: rid, type: REL + '/slide', target: relTarget('ppt/presentation.xml', np) });
            entries.push('<p:sldId id="' + id + '" r:id="' + rid + '"/>');
            (newIds[o.replaces] = newIds[o.replaces] || []).push(id);
            log.push('slide gen ' + o.gen + ' -> ' + np + (o.replaces ? ' (replaces original ' + o.replaces + ')' : ''));
          });
        });
      }, Promise.resolve()).then(function () {
        // a notes master copied from gen (original had none) must be registered
        Object.keys(copied).forEach(function (gp) {
          if (!/notesMaster\d+\.xml$/.test(gp) || origNmPart) return;
          var rid = nextRid();
          presRels.push({ id: rid, type: REL + '/notesMaster', target: relTarget('ppt/presentation.xml', copied[gp]) });
          if (/<p:notesMasterIdLst>/.test(pres)) pres = pres.replace('</p:notesMasterIdLst>', '<p:notesMasterId r:id="' + rid + '"/></p:notesMasterIdLst>');
          else pres = pres.replace('</p:sldMasterIdLst>', '</p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="' + rid + '"/></p:notesMasterIdLst>');
        });
        // the new slide list
        pres = pres.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, '<p:sldIdLst>' + entries.join('') + '</p:sldIdLst>');
        // original slides no longer in the deck: drop their parts and rels
        var kept = {}; order.forEach(function (o) { if (o.orig) kept[o.orig] = 1; });
        var gone = origSlides.filter(function (s, i) { return !kept[i + 1]; });
        var dropJobs = gone.map(function (s) {
          presRels = presRels.filter(function (r) { return r.id !== s.rid; });
          return readStr(orig, relsOf(s.part)).then(function (rx) {
            parseRels(rx).forEach(function (r) {
              if (/notesSlide$/.test(r.type)) { var np = resolve(s.part, r.target); orig.remove(np); orig.remove(relsOf(np)); dropCt(np); }
            });
            orig.remove(s.part); orig.remove(relsOf(s.part)); dropCt(s.part);
          });
        });
        // sections (p14:sectionLst) list slide ids: swap a replaced id for its new ones
        var oldIdBy = {}; origSlides.forEach(function (s, i) { oldIdBy[i + 1] = s.id; });
        pres = pres.replace(/<p14:sldIdLst>([\s\S]*?)<\/p14:sldIdLst>/g, function (m, inner) {
          return '<p14:sldIdLst>' + inner.replace(/<p14:sldId id="(\d+)"\s*\/>/g, function (q, id) {
            var n = +Object.keys(oldIdBy).filter(function (k) { return oldIdBy[k] === +id; })[0];
            if (kept[n]) return q;
            return (newIds[n] || []).map(function (x) { return '<p14:sldId id="' + x + '"/>'; }).join('');
          }) + '</p14:sldIdLst>';
        });
        return Promise.all(dropJobs);
      });
    });
  }).then(function () {
    Object.keys(files).forEach(function (p) { orig.file(p, files[p]); });
    orig.file('ppt/presentation.xml', pres);
    orig.file('ppt/_rels/presentation.xml.rels', relsXml(presRels));
    // drop content-type entries for parts that do not exist (removed slides,
    // and PptxGenJS lists slideMaster2-4 it never writes)
    ct = ct.replace(/<Override[^>]*PartName="\/([^"]+)"[^>]*\/>/g, function (m, part) { return orig.file(part) ? m : ''; });
    orig.file('[Content_Types].xml', ct);
    return readStr(orig, 'docProps/app.xml').then(function (app) {
      if (app) orig.file('docProps/app.xml', app.replace(/<Slides>\d+<\/Slides>/, '<Slides>' + order.length + '</Slides>'));
      return { log: log, scale: scale };
    });
  });
}

var api = { merge: merge };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DesignPassMerge = api;
})(typeof window !== 'undefined' ? window : globalThis);
