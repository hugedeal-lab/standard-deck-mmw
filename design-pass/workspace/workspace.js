// MMW Design Pass workspace: the page the Design Pass agent emits as its
// artifact. Loaded from the pinned CDN after the builder engine and the
// Design Pass checker scripts.
//
//   Phase 1 (no plan): the designer drops the deck -> Lighthouse-style report
//     + a deck extract to paste back to the agent.
//   Phase 2 (the agent's PLAN): the designer drops the same deck -> fixes,
//     rebuilt slides through the engine (original photos reused), merged in
//     the original order -> corrected copy + post-update report.
//
//   DesignPassWorkspace.start({ plan: PLAN | null })
(function (root) {
'use strict';
var SCRIPT = document.currentScript && document.currentScript.src;
var BASE = SCRIPT ? SCRIPT.replace(/design-pass\/workspace\/.*$/, '') : '';
var PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
var ACTIONS = { keep: 'Keep as is', fix: 'Fix in place', rebuild: 'Rebuild', drop: 'Remove' };

var CSS = [
  '.dpw-head{max-width:980px;margin:0 auto;padding:20px 16px 0}.dpw-head h1{font-size:22px;margin:0}.dpw-head p{color:var(--muted,#6B6B6B);margin:4px 0 0}',
  '.dpw-panel{background:var(--card,#fff);border-radius:10px;padding:14px 16px;margin:14px 0}.dpw-panel h2{margin:0 0 8px;font-size:17px}',
  '.dpw-panel textarea{width:100%;height:180px;font:12px/1.45 Menlo,Consolas,monospace;border:1px solid rgba(128,128,128,.3);border-radius:6px;padding:8px;background:transparent;color:inherit}',
  '.dpw-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}',
  '.dpw-plan{width:100%;border-collapse:collapse;font-size:14px}.dpw-plan td,.dpw-plan th{padding:6px 8px;border-top:1px solid rgba(128,128,128,.22);text-align:left;vertical-align:top}',
  '.dpw-plan th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#6B6B6B)}',
  '.dpw-act{display:inline-block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;border-radius:4px;padding:1px 6px;background:rgba(128,128,128,.18)}',
  '.dpw-act.rebuild{color:var(--avg-t,#B35A00)}.dpw-act.fix{color:var(--pass-t,#018642)}.dpw-act.drop{color:var(--fail-t,#D60F00)}',
  '.dpw-steps{list-style:none;padding:0;margin:6px 0;font-size:14px}.dpw-steps li{margin:3px 0}.dpw-steps .ok{color:var(--pass-t,#018642)}.dpw-steps .bad{color:var(--fail-t,#D60F00)}',
  '.dpw-chg{border-top:1px solid rgba(128,128,128,.22);padding:10px 0;font-size:14px}.dpw-chg h3{font-size:15px;margin:0 0 4px}.dpw-chg .ba{display:grid;grid-template-columns:70px 1fr;gap:2px 10px}',
  '.dpw-chg .lbl{color:var(--muted,#6B6B6B)}.dpw-ok{color:var(--pass-t,#018642)}.dpw-warn{color:var(--fail-t,#D60F00)}',
  '#dpw-preview{margin-top:10px}#dpw-preview #sd-viewport{transform-origin:top left}',
  'body{background:var(--bg,#EEEEEE)!important}'
].join('\n');

function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function hex(buf) { return crypto.subtle.digest('SHA-256', buf).then(function (d) { return Array.prototype.map.call(new Uint8Array(d), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(''); }); }
function save(name, data, type) {
  var url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type })), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
}
function copyText(t, btn, label) {
  function done(ok) { btn.textContent = ok ? 'Copied' : 'Copy failed: use Download'; setTimeout(function () { btn.textContent = label; }, 2000); }
  function fb() { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok; }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(fb()); }); else done(fb());
}

function start(cfg) {
  cfg = cfg || {};
  var plan = cfg.plan || null;
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  injectBrandMarks();
  var head = el('div', { 'class': 'dpw-head' }, '<h1>MMW Design Pass</h1><p>' + (plan
    ? 'Plan from the agent for <b>' + esc(plan.deck && plan.deck.file || 'your deck') + '</b>. Drop the same deck to apply it. Your original is never changed.'
    : 'Drop the deck to evaluate it. Then send the extract below to the Design Pass agent.') + '</p>');
  document.body.appendChild(head);
  if (plan) head.appendChild(planTable(plan));
  var host = el('main'); document.body.appendChild(host);
  // a script that failed to load (the CDN can briefly refuse a new commit)
  var need = { DeckLayouts: 'MMW engine (layouts)', StandardShell: 'MMW engine (export)', PptxGenJS: 'PowerPoint export library',
    DesignPassCheck: 'Design Pass checker', DesignPassUI: 'Design Pass report', DesignPassExtract: 'Design Pass extract', DesignPassMerge: 'Design Pass merge' };
  var missing = Object.keys(need).filter(function (k) { return typeof root[k] === 'undefined'; });
  if (missing.length) {
    host.innerHTML = '<div class="dpw-head"><div class="dpw-panel"><b>Part of the workspace did not load:</b> ' + esc(missing.map(function (k) { return need[k]; }).join(', ')) +
      '. The CDN sometimes needs a minute after an update. <button onclick="location.reload()">Reload</button></div></div>';
    return Promise.resolve();
  }
  host.innerHTML = '<p style="max-width:980px;margin:16px auto;padding:0 16px">Loading the MMW rules...</p>';
  return loadRules(cfg.rulesUrl || BASE + 'rules/mmw_rules.json')
    .then(function (rules) {
      var ui = DesignPassUI.mount(host, { rules: rules, fix: false, agentBox: false, onChecked: function (ctx) { return plan ? phase2(ctx, rules, plan, ui) : phase1(ctx, rules, ui); } });
    })
    .catch(function (e) { host.innerHTML = '<p style="max-width:980px;margin:16px auto;padding:0 16px;color:#D60F00">Could not load the MMW rules (' + esc(e.message) + '). Check the connection and reload.</p>'; });
}

// jsDelivr can answer 404 for a minute while it first fetches a new commit:
// retry once, then GitHub's raw mirror of the same commit.
function loadRules(url) {
  var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); };
  var mirror = url.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@/]+)@([^/]+)\//, 'https://raw.githubusercontent.com/$1/$2/$3/');
  return get(url).catch(function () {
    return new Promise(function (r) { setTimeout(r, 1500); }).then(function () { return get(url); });
  }).catch(function (e) { if (mirror === url) throw e; return get(mirror); });
}

// The engine reads the four brand marks from the page by id.
function injectBrandMarks() {
  var base = (root.MMW_ASSET_BASE || '').replace(/\/?$/, '/') + 'logos/';
  [['gi0', 'mmw_logo_black.png'], ['gi0w', 'mmw_logo_white.png'], ['gi1', 'wpp_mazda_lockup_black.png'], ['gi1w', 'wpp_mazda_lockup_white.png']].forEach(function (m) {
    if (document.getElementById(m[0])) return;
    var i = el('img', { id: m[0], src: base + m[1], alt: '' }); i.style.display = 'none'; document.body.appendChild(i);
  });
}

function planTable(plan) {
  var p = el('div', { 'class': 'dpw-panel' });
  var rows = (plan.slides || []).map(function (s) {
    var n = (s.d || []).length;
    var what = s.action === 'rebuild' ? (s.d || []).map(function (d) { return esc(d.layout); }).join(' + ') + (n > 1 ? ' <span class="dpw-act">split ' + n + '</span>' : '') : '';
    return '<tr><td>' + s.n + '</td><td><span class="dpw-act ' + esc(s.action) + '">' + esc(ACTIONS[s.action] || s.action) + '</span> ' + what + '</td><td>' + esc(s.why || '') + '</td></tr>';
  }).join('');
  p.innerHTML = '<h2>The plan (' + esc(plan.mode === 'full' ? 'full conversion to the MMW template' : 'targeted updates') + ')</h2>' +
    '<table class="dpw-plan"><tr><th>Slide</th><th>Action</th><th>Why</th></tr>' + rows + '</table>';
  return p;
}

// ---------------- phase 1: report + extract for the agent ----------------
function phase1(ctx, rules, ui) {
  return hex(ctx.buf).then(function (sha) {
    return DesignPassExtract.extract(ctx.zip, ctx.report, { fileName: ctx.file.name, sha256Hex: sha }).then(function (text) {
      var p = el('div', { 'class': 'dpw-panel', id: 'dpw-extract' },
        '<h2>Send this to the Design Pass agent</h2><p class="muted" style="margin:0 0 8px">Paste it into the agent chat. It holds the report plus each slide\'s text, pictures and notes, so the agent can propose a plan. ' +
        'If the deck has charts as pictures, upload those pictures to the chat too.</p><textarea readonly></textarea>' +
        '<div class="dpw-row"><button id="dpw-copy">Copy for the agent</button><button class="ghost" id="dpw-dl">Download extract (text)</button></div>');
      p.querySelector('textarea').value = text;
      var old = document.getElementById('dpw-extract'); if (old) old.remove();
      var hero = ui.$('hero'); hero.parentNode.insertBefore(p, hero.nextSibling);
      p.querySelector('#dpw-copy').onclick = function () { copyText(text, this, 'Copy for the agent'); };
      p.querySelector('#dpw-dl').onclick = function () { save(ctx.file.name.replace(/\.pptx$/i, '') + '_designpass_extract.txt', text, 'text/plain'); };
    });
  });
}

// ---------------- phase 2: run the plan ----------------
function phase2(ctx, rules, plan, ui) {
  var panel = el('div', { 'class': 'dpw-panel', id: 'dpw-run' }, '<h2>Applying the plan</h2><ul class="dpw-steps"></ul>');
  var old = document.getElementById('dpw-run'); if (old) old.remove();
  var hero = ui.$('hero'); hero.parentNode.insertBefore(panel, hero.nextSibling);
  var steps = panel.querySelector('.dpw-steps');
  var step = function (msg, cls) { var li = el('li', cls ? { 'class': cls } : {}, esc(msg)); steps.appendChild(li); return li; };
  var report = ctx.report, n = report.deck.slides;

  return Promise.all([hex(ctx.buf), slideTexts(ctx.zip)]).then(function (pre) {
    var sha = pre[0], texts = pre[1];
    // 1. the plan must be for this deck and cover every slide once
    var problems = validate(plan, report, sha, texts);
    if (problems.hard.length) { problems.hard.forEach(function (m) { step(m, 'bad'); }); throw new Error('stopped'); }
    problems.soft.forEach(function (m) { step(m); });
    step('Plan checked: ' + n + ' slides, mode ' + (plan.mode === 'full' ? 'full conversion' : 'targeted'), 'ok');
    var bySlide = {}; plan.slides.forEach(function (s) { bySlide[s.n] = s; });

    // 2. rebuilt slides through the engine, original pictures reused
    var D = [], genOf = {};
    for (var i = 1; i <= n; i++) {
      var s = bySlide[i];
      if (s && s.action === 'rebuild') { genOf[i] = []; s.d.forEach(function (d) { D.push(JSON.parse(JSON.stringify(d))); genOf[i].push(D.length); }); }
    }
    // pre-flight: every word the plan gives a rebuilt slide must reach the slide
    plan.slides.forEach(function (s) {
      if (s.action !== 'rebuild') return;
      s.d.forEach(function (d, j) {
        var lost = preflight(d);
        if (lost.length) step('Slide ' + s.n + (s.d.length > 1 ? ' (part ' + (j + 1) + ')' : '') + ': the ' + d.layout + ' layout does not show ' + lost.join('; ') + ' -- check the plan', 'bad');
      });
    });
    var genZipP = !D.length ? Promise.resolve(null) : resolveOrigImages(D, ctx.zip).then(function () {
      var li = step('Rebuilding ' + D.length + ' slide' + (D.length > 1 ? 's' : '') + ' on MMW layouts...');
      return buildWithEngine(D, plan.title || report.deck.title || 'Design Pass').then(function (ab) { li.className = 'ok'; li.textContent = 'Rebuilt ' + D.length + ' slide' + (D.length > 1 ? 's' : '') + ' with the MMW engine (preview below)'; return JSZip.loadAsync(ab); });
    });

    return genZipP.then(function (genZip) {
      // 3. fixes on the original, then the merge, in the original order
      var fixSlides = plan.slides.filter(function (s) { return s.action === 'fix'; }).map(function (s) { return s.n; });
      return JSZip.loadAsync(ctx.buf).then(function (origZip) {
        var applied = null, order = [], base, donor;
        var fixP = (plan.mode !== 'full' && (fixSlides.length || plan.deck_fixes !== false)) ?
          DesignPassCheck.fix(origZip, rules, report, { slides: fixSlides, deck: plan.deck_fixes !== false,
            fetchAsset: function (name) { return fetch(rules.assets_base + name).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); }); } })
            .then(function (rep) { applied = rep.applied; step('Fixed in place: ' + (rep.applied.slides.length) + ' slide' + (rep.applied.slides.length === 1 ? '' : 's') + (rep.applied.deck.length ? ' + deck theme' : ''), 'ok'); })
          : Promise.resolve();
        return fixP.then(function () {
          if (plan.mode === 'full') {
            // base = the rebuilt deck; kept slides come over from the original
            base = genZip; donor = origZip;
            for (var k = 1; k <= n; k++) {
              var s2 = bySlide[k];
              if (s2.action === 'rebuild') genOf[k].forEach(function (g) { order.push({ orig: g }); });
              else if (s2.action === 'keep' || s2.action === 'fix') order.push({ gen: k, replaces: k });
            }
          } else {
            base = origZip; donor = genZip;
            for (var j = 1; j <= n; j++) {
              var s3 = bySlide[j];
              if (s3.action === 'rebuild') genOf[j].forEach(function (g) { order.push({ gen: g, replaces: j }); });
              else if (s3.action !== 'drop') order.push({ orig: j });
            }
          }
          var mergeP = (donor && order.some(function (o) { return o.gen; })) || order.length !== n || plan.mode === 'full'
            ? DesignPassMerge.merge(base, donor || base, order) : Promise.resolve();
          return mergeP.then(function () {
            step('Assembled ' + order.length + ' slides in the original order', 'ok');
            return base.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE', compressionOptions: { level: 1 } });
          }).then(function (outBuf) {
            var outName = ctx.file.name.replace(/\.pptx$/i, '') + '_designpass.pptx';
            save(outName, new Blob([outBuf], { type: PPTX_MIME }));
            step('Downloaded ' + outName + ' -- open it in PowerPoint to check', 'ok');
            // 4. re-check the result and write the post-update report
            return JSZip.loadAsync(outBuf).then(function (outZip) {
              return DesignPassCheck.check(outZip, rules).then(function (after) {
                return Promise.all([slideTexts(ctx.zip), slideTexts(outZip)]).then(function (tx) {
                  var post = postReport({ plan: plan, before: report, after: after, order: order, genOf: genOf, applied: applied,
                    textBefore: tx[0], textAfter: tx[1], file: ctx.file.name, outName: outName });
                  showPost(panel, post);
                });
              });
            });
          });
        });
      });
    });
  }).catch(function (e) { if (e.message !== 'stopped') step('Could not apply the plan: ' + e.message, 'bad'); });
}

function norm(t) { return String(t || '').toLowerCase().replace(/&amp;/g, '&').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
function validate(plan, report, sha, texts) {
  var hard = [], soft = [], n = report.deck.slides, seen = {};
  if (!plan.slides || !plan.slides.length) hard.push('The plan has no slides.');
  if (plan.deck && plan.deck.sha256 && plan.deck.sha256 !== sha) hard.push('This is not the deck the plan was made for (its fingerprint differs). Drop the same file you sent to the agent.');
  if (plan.deck && plan.deck.slides && plan.deck.slides !== n) hard.push('The plan is for a ' + plan.deck.slides + '-slide deck; this file has ' + n + ' slides. Drop the same file you gave the agent.');
  // each planned slide may carry a short quote from its own text: proves the
  // file and the slide numbering match what the agent read
  (plan.slides || []).forEach(function (s) {
    if (s.quote && s.n >= 1 && s.n <= n && norm(texts[s.n - 1]).indexOf(norm(s.quote)) < 0)
      hard.push('Slide ' + s.n + ' does not contain "' + s.quote + '" -- this may be a different version of the deck, or the slide numbers are off.');
  });
  (plan.slides || []).forEach(function (s) {
    if (!(s.n >= 1 && s.n <= n)) hard.push('The plan mentions slide ' + s.n + ', but the deck has ' + n + '.');
    if (seen[s.n]) hard.push('The plan lists slide ' + s.n + ' twice.');
    seen[s.n] = 1;
    if (!ACTIONS[s.action]) hard.push('Slide ' + s.n + ': unknown action "' + s.action + '".');
    if (s.action === 'rebuild') {
      if (!s.d || !s.d.length) hard.push('Slide ' + s.n + ' is to be rebuilt but the plan gives no slide data.');
      (s.d || []).forEach(function (d) { if (!d.layout || !(root.DeckLayouts && root.DeckLayouts.resolve(d.layout))) hard.push('Slide ' + s.n + ': "' + d.layout + '" is not an MMW layout.'); });
    }
    if (plan.mode === 'full' && s.action === 'fix') soft.push('Slide ' + s.n + ': "fix" in a full conversion keeps the original slide as is.');
  });
  // slides the plan does not mention: safe mechanical fixes (targeted), or carried over (full)
  var dflt = plan.default_action || (plan.mode === 'full' ? 'keep' : 'fix');
  var missing = []; for (var i = 1; i <= n; i++) if (!seen[i]) missing.push(i);
  if (missing.length) soft.push('Not in the plan, ' + (dflt === 'fix' ? 'mechanical fixes only' : 'kept as is') + ': slide' + (missing.length > 1 ? 's ' : ' ') + ranges(missing) + '.');
  if (plan.mode === 'full' && !(plan.slides || []).some(function (s) { return s.action === 'rebuild'; })) hard.push('A full conversion needs at least one rebuilt slide.');
  if (report.deck.rebuild && plan.mode !== 'full') soft.push('This deck is not on the MMW template; a full conversion is recommended.');
  // fill gaps so every slide has an action
  for (var j = 1; j <= n; j++) if (!seen[j]) plan.slides.push({ n: j, action: dflt, why: dflt === 'fix' ? 'Mechanical fixes only' : 'Not in the plan' });
  plan.slides.sort(function (a, b) { return a.n - b.n; });
  return { hard: hard, soft: soft };
}

// "orig:ppt/media/image3.png" in images[] / bgImage -> data URI from the original deck
function resolveOrigImages(D, zip) {
  var jobs = [], mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml' };
  // "orig:slide5" / "orig:slide5#2" = the largest / 2nd-largest picture on original slide 5
  var bySlide = null;
  function pictures() {
    if (bySlide) return bySlide;
    return (bySlide = slidePictures(zip));
  }
  function load(ref) {
    var m = /^orig:slide(\d+)(?:#(\d+))?$/i.exec(ref);
    if (m) return pictures().then(function (ps) { var list = ps[+m[1] - 1] || [], pic = list[(+m[2] || 1) - 1]; return pic ? load('orig:' + pic) : null; });
    var p = ref.slice(5), f = zip.file(p), ext = p.split('.').pop().toLowerCase();
    if (!f || !mime[ext]) return Promise.resolve(null);
    return f.async('base64').then(function (b64) {
      var uri = 'data:' + mime[ext] + ';base64,' + b64;
      return new Promise(function (res) {   // natural size, for the engine's cover crop
        var im = new Image(); im.onload = function () { try { root._imageDims[uri] = { w: im.naturalWidth, h: im.naturalHeight }; } catch (e) {} res(uri); }; im.onerror = function () { res(uri); }; im.src = uri;
      });
    });
  }
  D.forEach(function (d) {
    if (Array.isArray(d.images)) d.images.forEach(function (ref, i) { if (typeof ref === 'string' && ref.indexOf('orig:') === 0) jobs.push(load(ref).then(function (u) { d.images[i] = u || undefined; })); });
    if (typeof d.bgImage === 'string' && d.bgImage.indexOf('orig:') === 0) jobs.push(load(d.bgImage).then(function (u) { if (u) d.bgImage = u; else delete d.bgImage; }));
  });
  return Promise.all(jobs);
}

// Pictures on each slide (media paths), largest first. Logos/icons under a
// square inch are left out: they are furniture, not photography.
function slidePictures(zip) {
  var A = 'http://schemas.openxmlformats.org/drawingml/2006/main', P = 'http://schemas.openxmlformats.org/presentationml/2006/main', R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  return zip.file('ppt/presentation.xml').async('string').then(function (px) {
    return zip.file('ppt/_rels/presentation.xml.rels').async('string').then(function (rx) {
      var rid = {}; rx.replace(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g, function (m, id, t) { rid[id] = 'ppt/' + t.replace(/^\/?ppt\//, ''); });
      var ids = []; px.replace(/<p:sldId [^>]*r:id="([^"]+)"/g, function (m, id) { ids.push(rid[id]); });
      return Promise.all(ids.map(function (sp) {
        var relsP = sp.replace(/slides\/(slide\d+\.xml)$/, 'slides/_rels/$1.rels');
        return Promise.all([zip.file(sp).async('string'), zip.file(relsP) ? zip.file(relsP).async('string') : '']).then(function (r) {
          var rel = {}; r[1].replace(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g, function (m, id, t) { rel[id] = 'ppt/' + t.replace(/^\.\.\//, ''); });
          var doc = new DOMParser().parseFromString(r[0], 'application/xml'), out = [];
          Array.prototype.forEach.call(doc.getElementsByTagNameNS(P, 'pic'), function (pic) {
            var b = pic.getElementsByTagNameNS(A, 'blip')[0], e = pic.getElementsByTagNameNS(A, 'ext')[0];
            var t = b && rel[b.getAttributeNS(R, 'embed')], area = e ? (+e.getAttribute('cx') / 914400) * (+e.getAttribute('cy') / 914400) : 0;
            if (t && /\.(png|jpe?g|gif)$/i.test(t) && area >= 1) out.push({ t: t, a: area });
          });
          return out.sort(function (x, y) { return y.a - x.a; }).map(function (x) { return x.t; });
        });
      }));
    });
  });
}

// Render D with the builder engine and capture its PPTX export in memory.
function buildWithEngine(D, title) {
  var wrap = el('div', { 'class': 'dpw-panel', id: 'dpw-preview' }, '<h2>Rebuilt slides</h2><div id="sd-viewport"></div>');
  var run = document.getElementById('dpw-run'); run.parentNode.insertBefore(wrap, run.nextSibling);
  root.D = D;
  deckInit({ title: title });
  var bar = document.querySelector('.sd-toolbar'); if (bar) wrap.insertBefore(bar, wrap.children[1]);
  // the engine's own Download would save only the rebuilt slides
  var dlb = document.querySelector('.sd-download-btn'); if (dlb) dlb.style.display = 'none';
  return new Promise(function (resolve, reject) {
    var mk = URL.createObjectURL, click = HTMLAnchorElement.prototype.click, done = false;
    var restore = function () { URL.createObjectURL = mk; HTMLAnchorElement.prototype.click = click; };
    URL.createObjectURL = function (b) {
      // the engine clicks its download link right after this call: keep that
      // click blocked until the current task ends, then restore both
      if (!done && b && b.type === PPTX_MIME) { done = true; setTimeout(restore, 0); b.arrayBuffer().then(resolve, reject); }
      return mk.apply(URL, arguments);
    };
    HTMLAnchorElement.prototype.click = function () { if (/\.pptx$/i.test(this.download || '') && !this.hasAttribute('data-dp')) return; return click.apply(this, arguments); };
    setTimeout(function () { if (!done) { restore(); reject(new Error('the engine did not export the rebuilt slides')); } }, 120000);
    root.StandardShell.exportPPTX();
  });
}

// Words in a slide's data that the engine does not render, by field.
var NOT_COPY = { layout: 1, notes: 1, bgColor: 1, bgImage: 1, dark: 1, images: 1, icon: 1, tone: 1, style: 1, color: 1, src: 1, chart: 1, highlight: 1, fit: 1 };
function preflight(d) {
  var els;
  try { els = root.DeckLayouts.dispatch(JSON.parse(JSON.stringify(d))) || []; } catch (e) { return ['anything (' + e.message + ')']; }
  var shown = {};
  els.forEach(function (e) {
    var t = e.text != null ? String(e.text) : e.paras ? e.paras.map(function (p) { return (p.runs || []).map(function (r) { return r.text || ''; }).join(' '); }).join(' ') : '';
    if (e.type === 'tbl') t = (e.headers || []).join(' ') + ' ' + (e.rows || []).map(function (r) { return r.join(' '); }).join(' ');
    if (e.type === 'chart' && e.chart) t = JSON.stringify(e.chart.data || '');
    words(t).forEach(function (w) { shown[w] = 1; });
  });
  var lost = {};
  (function walk(v, path) {
    if (typeof v === 'string') { var miss = words(v).filter(function (w) { return !shown[w]; }); if (miss.length) lost[path || 'text'] = miss; return; }
    if (Array.isArray(v)) { v.forEach(function (x, i) { walk(x, path + '[' + i + ']'); }); return; }
    if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { if (!NOT_COPY[k]) walk(v[k], path ? path + '.' + k : k); });
  })(d, '');
  return Object.keys(lost).map(function (k) { return k + ' ("' + lost[k].slice(0, 6).join(' ') + (lost[k].length > 6 ? ' ...' : '') + '")'; });
}
function ranges(ns) {
  var out = [], a = ns[0], b = ns[0];
  for (var i = 1; i <= ns.length; i++) { if (ns[i] === b + 1) b = ns[i]; else { out.push(a === b ? a : a + '-' + b); a = b = ns[i]; } }
  return out.join(', ');
}

// All text on each slide, in deck order -- leaving out page numbers, dates and
// footers (slide-number fields, and a bare number in the bottom band), which
// MMW slides do not carry and the wording check should not count.
function slideTexts(zip) {
  var A = 'http://schemas.openxmlformats.org/drawingml/2006/main', P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
  return zip.file('ppt/presentation.xml').async('string').then(function (px) {
    var cy = +(/<p:sldSz[^>]*\bcy="(\d+)"/.exec(px) || [0, 6858000])[1];
    return zip.file('ppt/_rels/presentation.xml.rels').async('string').then(function (rx) {
      var rid = {}; rx.replace(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g, function (m, id, t) { rid[id] = 'ppt/' + t.replace(/^\/?ppt\//, ''); });
      var ids = []; px.replace(/<p:sldId [^>]*r:id="([^"]+)"/g, function (m, id) { ids.push(rid[id]); });
      return Promise.all(ids.map(function (p) {
        return zip.file(p).async('string').then(function (x) {
          var doc = new DOMParser().parseFromString(x, 'application/xml'), out = [];
          Array.prototype.forEach.call(doc.getElementsByTagNameNS(P, 'sp'), function (sp) {
            var ph = sp.getElementsByTagNameNS(P, 'ph')[0];
            if (ph && /^(sldNum|dt|ftr|hdr)$/.test(ph.getAttribute('type') || '')) return;
            var t = Array.prototype.map.call(sp.getElementsByTagNameNS(A, 't'), function (n) { return n.textContent; }).join(' ').trim();
            var off = sp.getElementsByTagNameNS(A, 'off')[0];
            if (/^\d{1,3}$/.test(t) && off && +off.getAttribute('y') > cy * 0.9) return;   // page number in the footer band
            if (t) out.push(t);
          });
          Array.prototype.forEach.call(doc.getElementsByTagNameNS(A, 'tbl'), function (tb) { out.push(Array.prototype.map.call(tb.getElementsByTagNameNS(A, 't'), function (n) { return n.textContent; }).join(' ')); });
          return out.join(' ');
        });
      }));
    });
  });
}
function words(t) { return String(t).toLowerCase().replace(/&amp;/g, '&').replace(/&[a-z]+;|&#\d+;/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’.%$-]*/gu) || []; }
function wordDiff(a, b) {
  var count = {}; words(a).forEach(function (w) { w = w.replace(/[.']+$/, ''); count[w] = (count[w] || 0) + 1; });
  var added = [];
  words(b).forEach(function (w) { w = w.replace(/[.']+$/, ''); if (count[w]) count[w]--; else added.push(w); });
  var removed = []; Object.keys(count).forEach(function (w) { for (var i = 0; i < count[w]; i++) removed.push(w); });
  return { removed: removed, added: added, total: words(a).length };
}

// Per original slide: what happened, before -> after, wording check.
function postReport(o) {
  var out = [], posAfter = {}, k = 0;
  o.order.forEach(function (e) {
    k++;
    var src = o.plan.mode === 'full' ? (e.gen ? e.replaces : null) : (e.orig || e.replaces);
    if (o.plan.mode === 'full' && e.orig) Object.keys(o.genOf).forEach(function (n) { if (o.genOf[n].indexOf(e.orig) >= 0) src = +n; });
    (posAfter[src] = posAfter[src] || []).push(k);
  });
  var issues = function (fs) {
    var f = fs.filter(function (x) { return x.action === 'flag'; }), x = fs.filter(function (q) { return q.action === 'fix'; });
    return (f.length ? f.length + ' for a designer' : '') + (f.length && x.length ? ', ' : '') + (x.length ? x.length + ' auto-fixable' : '') || 'no issues';
  };
  var appliedBy = {}; (o.applied ? o.applied.slides : []).forEach(function (s) { appliedBy[s.n] = s.findings; });
  o.plan.slides.forEach(function (s) {
    var b = o.before.slides[s.n - 1] || {}, now = posAfter[s.n] || [];
    var row = { n: s.n, action: s.action, why: s.why || '', now: now, before: '"' + (b.title || '') + '" · ' + (b.layout_match || b.layout || '?') + ' · ' + issues(b.findings || []) };
    if (s.action === 'drop') { row.after = 'Removed from the deck'; out.push(row); return; }
    var after = now.map(function (m) { var a = o.after.slides[m - 1] || {}; return 'slide ' + m + ' "' + (a.title || '') + '" · ' + (a.layout_match || a.layout || '?') + ' · ' + issues(a.findings || []); });
    row.after = after.join(' | ');
    if (s.action === 'fix') row.changes = (appliedBy[s.n] || []).map(function (f) { return f.msg + (f.count > 1 ? ' (x' + f.count + ')' : ''); });
    if (s.action === 'rebuild') row.changes = ['Rebuilt on ' + s.d.map(function (d) { return d.layout; }).join(' + ') + (s.d.length > 1 ? ' (split into ' + s.d.length + ' slides)' : '')];
    if (s.action !== 'keep' || o.plan.mode === 'full') {
      var before = o.textBefore[s.n - 1] || '', aft = now.map(function (m) { return o.textAfter[m - 1] || ''; }).join(' ');
      row.wording = wordDiff(before, aft);
    }
    out.push(row);
  });
  var sb = o.before.scores, sa = o.after.scores;
  return { rows: out, file: o.file, outName: o.outName, mode: o.plan.mode, deckFixes: o.applied ? o.applied.deck : [],
    slidesBefore: o.before.deck.slides, slidesAfter: o.order.length,
    score: sb && sa && !sb.rebuild && !sa.rebuild ? { before: sb.overall.before, after: sa.overall.before, cats: sb.categories.map(function (c, i) { return c.label + ' ' + c.before + '->' + (sa.categories[i] || {}).before; }) }
      : sa && !sa.rebuild ? { before: null, after: sa.overall.before, cats: sa.categories.map(function (c) { return c.label + ' ' + c.before; }) } : null };
}

function postText(p) {
  var L = ['DESIGN PASS -- POST-UPDATE REPORT', 'Deck: ' + p.file + ' -> ' + p.outName + ' | ' + (p.mode === 'full' ? 'full conversion' : 'targeted updates') + ' | slides ' + p.slidesBefore + ' -> ' + p.slidesAfter];
  if (p.score) L.push('Brand readiness: ' + (p.score.before != null ? p.score.before + ' -> ' : '') + p.score.after + ' | ' + p.score.cats.join(', '));
  if (p.deckFixes.length) L.push('Whole deck: ' + p.deckFixes.map(function (f) { return f.msg; }).join('; '));
  L.push('');
  var unchanged = [];
  p.rows.forEach(function (r) {
    if (r.action === 'keep' && (p.mode !== 'full' || keptClean(r))) { unchanged.push(r.n + (r.now[0] !== r.n ? '->' + r.now[0] : '')); return; }
    L.push('Slide ' + r.n + (r.now.length ? ' -> now ' + (r.now.length > 1 ? 'slides ' + r.now[0] + '-' + r.now[r.now.length - 1] : 'slide ' + r.now[0]) : '') + ' | ' + (ACTIONS[r.action] || r.action).toUpperCase());
    if (r.why) L.push('  Why: ' + r.why);
    L.push('  Before: ' + r.before);
    L.push('  After:  ' + r.after);
    (r.changes || []).forEach(function (c) { L.push('  Change: ' + c); });
    if (r.wording) L.push('  Wording: ' + wordingText(r.wording));
    L.push('');
  });
  if (unchanged.length) L.push((p.mode === 'full' ? 'Carried over unchanged: slide' : 'Unchanged: slide') + (unchanged.length > 1 ? 's ' : ' ') + unchanged.join(', '));
  return L.join('\n');
}
function keptClean(r) { return !r.wording || (!r.wording.removed.length && !r.wording.added.length); }
function wordingText(w) {
  if (!w.removed.length && !w.added.length) return 'unchanged (' + w.total + ' words)';
  var tally = function (ws) {
    var c = {}; ws.forEach(function (x) { c[x] = (c[x] || 0) + 1; });
    var keys = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; });
    return keys.slice(0, 14).map(function (k) { return k + (c[k] > 1 ? ' x' + c[k] : ''); }).join(', ') + (keys.length > 14 ? ', ...' : '');
  };
  return (w.removed.length ? w.removed.length + ' of ' + w.total + ' words no longer on the slide: ' + tally(w.removed) : '') +
    (w.removed.length && w.added.length ? ' | ' : '') +
    (w.added.length ? w.added.length + ' word' + (w.added.length > 1 ? 's' : '') + ' added: ' + tally(w.added) : '') + ' -- check';
}

function showPost(panel, p) {
  var text = postText(p);
  var box = el('div', { 'class': 'dpw-panel', id: 'dpw-post' });
  var head = '<h2>What changed</h2><p style="margin:0 0 6px">' + esc(p.file) + ' → <b>' + esc(p.outName) + '</b> · ' + (p.mode === 'full' ? 'full conversion' : 'targeted updates') +
    ' · slides ' + p.slidesBefore + ' → ' + p.slidesAfter + (p.score ? ' · brand readiness ' + (p.score.before != null ? p.score.before + ' → ' : '') + '<b>' + p.score.after + '</b>' : '') + '</p>' +
    (p.deckFixes.length ? '<p class="muted" style="margin:0 0 6px">Whole deck: ' + esc(p.deckFixes.map(function (f) { return f.msg; }).join('; ')) + '</p>' : '');
  var unchanged = [];
  var rows = p.rows.map(function (r) {
    if (r.action === 'keep' && (p.mode !== 'full' || keptClean(r))) { unchanged.push(r.n + (r.now[0] !== r.n ? ' → ' + r.now[0] : '')); return ''; }
    var w = r.wording ? (!r.wording.removed.length && !r.wording.added.length ? '<span class="dpw-ok">Wording unchanged (' + r.wording.total + ' words)</span>' : '<span class="dpw-warn">' + esc(wordingText(r.wording)) + '</span>') : '';
    return '<div class="dpw-chg"><h3>Slide ' + r.n + (r.now.length ? ' → ' + (r.now.length > 1 ? 'slides ' + r.now.join(', ') : 'slide ' + r.now[0]) : '') +
      ' <span class="dpw-act ' + esc(r.action) + '">' + esc(ACTIONS[r.action] || r.action) + '</span></h3>' +
      (r.why ? '<div class="muted" style="margin-bottom:4px">' + esc(r.why) + '</div>' : '') +
      '<div class="ba"><span class="lbl">Before</span><span>' + esc(r.before) + '</span><span class="lbl">After</span><span>' + esc(r.after) + '</span>' +
      (r.changes && r.changes.length ? '<span class="lbl">Changed</span><span>' + esc(r.changes.join('; ')) + '</span>' : '') +
      (w ? '<span class="lbl">Wording</span><span>' + w + '</span>' : '') + '</div></div>';
  }).join('');
  box.innerHTML = head + rows + (unchanged.length ? '<div class="dpw-chg muted">' + (p.mode === 'full' ? 'Carried over unchanged (still on their original design): slide' : 'Unchanged: slide') + (unchanged.length > 1 ? 's ' : ' ') + unchanged.join(', ') + '</div>' : '') +
    '<div class="dpw-row"><button id="dpw-pcopy">Copy report for the agent</button><button class="ghost" id="dpw-pdl">Download report (text)</button></div>';
  panel.parentNode.insertBefore(box, panel.nextSibling);
  box.querySelector('#dpw-pcopy').onclick = function () { copyText(text, this, 'Copy report for the agent'); };
  box.querySelector('#dpw-pdl').onclick = function () { save(p.outName.replace(/\.pptx$/i, '') + '_report.txt', text, 'text/plain'); };
}

root.DesignPassWorkspace = { start: start, _postText: postText, _wordDiff: wordDiff };
})(window);
