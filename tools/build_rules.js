// Build rules/mmw_rules.json: the brand rulebook Design Pass checks decks
// against, generated from the files the builder already trusts, so the two
// agents never carry diverging copies of the brand.
//
//   mmw_layouts.json   layout geometry, fonts, sizes, colours, backgrounds
//   standard-deck.js   PALETTE, ACCENT_FAMILIES, CHART_SERIES
//   deck-layouts.js    TEMPLATE_NAMES, LAYOUT_BG, LAYOUT_KEYS
//   COPY_BUDGETS.md    copy-fit limits per layout field (tools/copy_budgets.js)
//   assets/logos/      brand marks, recognised in decks by hash
//   rules/policy.json  hand-edited: fix vs flag, tolerances
//   rules/template_snapshot.json  what the template's own slides actually
//                      use -- theme, backgrounds, colours, word counts per
//                      layout. Refreshed with --template, which runs the
//                      Design Pass checker itself over the template.
//
// Usage:  node tools/build_rules.js
//         NODE_PATH=<dir>/node_modules node tools/build_rules.js --template "/path/MMW PPT Template.pptx"
//         (--template needs jszip and @xmldom/xmldom; see design-pass/checker/cli.js)
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const R = (p) => path.join(ROOT, p);
const SNAP = R('rules/template_snapshot.json');

global.window = {};
require(R('standard-deck.js'));
require(R('deck-layouts.js'));
const SD = window.StandardDeck, DL = window.DeckLayouts;
const spec = JSON.parse(fs.readFileSync(R('mmw_layouts.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(R('rules/policy.json'), 'utf8'));

const SOURCES = ['mmw_layouts.json', 'standard-deck.js', 'deck-layouts.js', 'COPY_BUDGETS.md',
  'rules/policy.json', 'rules/template_snapshot.json', 'rules/font_metrics.json', 'rules/fingerprints.json'];
const blob = (p) => (fs.existsSync(R(p)) ? cp.execFileSync('git', ['hash-object', R(p)]).toString().trim().slice(0, 12) : null);
const up = (h) => (typeof h === 'string' && /^#[0-9A-Fa-f]{6}$/.test(h) ? h.toUpperCase() : null);

// ---- copy budgets (parsed from the generated table) -------------------
const budgets = {};
for (const m of fs.readFileSync(R('COPY_BUDGETS.md'), 'utf8').matchAll(/^\| `([^`]+)` \| `([^`]+)` \| ([0-9+/]+) \|$/gm)) {
  const [fits, max] = m[3].includes('/') ? m[3].split('/') : [m[3], m[3]];
  const n = (s) => (s.endsWith('+') ? null : Number(s));   // null = no practical limit
  (budgets[m[1]] = budgets[m[1]] || {})[m[2]] = { fits: n(fits), max: n(max) };
}

// ---- brand marks ------------------------------------------------------
// assets/logos/ are byte-identical to the template's media (and the builder
// embeds them as-is), so a deck's logo pictures are recognised by hash.
const brandMarks = {};
for (const f of fs.readdirSync(R('assets/logos')).filter((f) => f.endsWith('.png')).sort()) {
  const h = crypto.createHash('sha256').update(fs.readFileSync(R('assets/logos/' + f))).digest('hex');
  brandMarks[h] = { asset: f, mark: f.includes('lockup') ? 'lockup' : 'logo', variant: f.includes('white') ? 'white' : 'black',
    for_bg: f.includes('white') ? 'dark' : 'light', swap: f.includes('white') ? f.replace(/white(_lg)?/, 'black') : f.replace('black', 'white') };
}

// Background images, by hash: builder slides embed assets/ as-is, which lets
// the layout matcher tell geometric twins (Dark vs Dark2 dividers) apart.
const bgMarks = {};
for (const [dir, prefix] of [['assets/backgrounds', ''], ['assets/social', 'social/']])
  for (const f of fs.readdirSync(R(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort())
    bgMarks[crypto.createHash('sha256').update(fs.readFileSync(R(dir + '/' + f))).digest('hex')] = prefix + f;

function build(snap) {
  // ---- palette --------------------------------------------------------
  const tokens = {};
  for (const [k, v] of Object.entries(SD.PALETTE)) if (up(v)) tokens[k] = up(v);
  for (const [fam, ramp] of Object.entries(SD.ACCENT_FAMILIES))
    for (const [step, v] of Object.entries(ramp)) tokens[step === 'mid' ? fam : fam + '-' + step] = up(v);
  for (const [k, v] of Object.entries(spec.palette)) if (!k.endsWith('_STRIP') && up(v) && !Object.values(tokens).includes(up(v))) tokens[k] = up(v);
  const annotation = up(spec.palette.annotation_STRIP);
  const annotations = [...new Set([annotation].concat((policy.annotation || {}).colours || []).map(up))];
  // Engine UI colours are not brand; black/white/deepBlack are engine aliases of
  // asphalt/paper and would make the change log say "-> white" for #EEEEEE.
  for (const k of ['ok', 'warn', 'bad', 'black', 'white', 'deepBlack']) delete tokens[k];
  const byHex = {};
  for (const [k, v] of Object.entries(tokens)) (byHex[v] = byHex[v] || []).push(k);

  // Every colour the template itself uses: a deck using one of these is on
  // brand even if no token names it.
  const observed = {};
  const see = (h, n) => { h = up(h); if (h && !annotations.includes(h)) observed[h] = (observed[h] || 0) + (n || 1); };
  for (const L of spec.layouts) {
    see(L.background && L.background.hex);
    see(L.background_on_demo_slide && L.background_on_demo_slide.hex);
    for (const e of L.elements) { see(e.color); see(e.fill); }
  }
  SD.CHART_SERIES.concat(SD.CHART_SERIES_LIGHT).forEach((h) => see(h));
  for (const [h, n] of Object.entries(snap.colours)) see(h, n);

  // ---- type scale (engine pt, per face, from the template's text) -----
  const scale = {};
  for (const L of spec.layouts) for (const e of L.elements) {
    if (e.role !== 'text' || e.pt == null) continue;
    const face = e.font || snap.theme.fonts.minor;
    const s = (scale[face] = scale[face] || {});
    s[e.pt] = (s[e.pt] || 0) + 1;
  }
  const typeScale = {};
  for (const [face, s] of Object.entries(scale))
    typeScale[face] = Object.keys(s).map(Number).sort((a, b) => a - b).map((pt) => ({ pt, uses: s[pt] }));

  // ---- layouts --------------------------------------------------------
  const bgOf = (b) => !b ? null : b.kind === 'solid' ? { kind: 'solid', hex: up(b.hex) } : { kind: b.kind, asset: b.asset };
  const lbg = (slug) => {
    const b = DL.LAYOUT_BG[slug];
    if (!b) return null;
    return b.bgColor ? { kind: 'solid', hex: up(b.bgColor), dark: !!b.dark } : { kind: 'image', asset: b.bgImage, dark: !!b.dark };
  };
  const KEEP = ['kind', 'role', 'x', 'y', 'w', 'h', 'ph_idx', 'font', 'pt', 'bold', 'color', 'fill', 'all_caps', 'align', 'asset', 'sample'];
  const layouts = {}, byTemplate = {};
  const addBg = (T, b) => {
    if (!b) return;
    const key = b.hex || b.asset || b.kind;
    if (!T.backgrounds.some((x) => (x.hex || x.asset || x.kind) === key)) T.backgrounds.push(b.hex ? { kind: 'solid', hex: b.hex } : b.asset ? { kind: b.kind, asset: b.asset } : { kind: b.kind });
  };
  for (const L of spec.layouts) {
    const slug = DL.TEMPLATE_NAMES[L.name];
    const tpl = L.split_from || L.name;
    const bg = lbg(slug) || bgOf(L.background);
    layouts[L.name] = {
      slug, template_layout: tpl, family: L.family, template_slides: L.slides,
      background: bg,
      background_demo: bgOf(L.background_on_demo_slide),
      fields: DL.LAYOUT_KEYS[slug] || [],
      copy_budgets: budgets[slug] || {},
      elements: L.elements.filter((e) => e.role !== 'shape').map((e) => {
        const o = {};
        for (const k of KEEP) if (e[k] !== undefined && e[k] !== null) o[k] = e[k];
        if (o.sample) o.sample = String(o.sample).slice(0, 40);
        return o;
      })
    };
    // What may appear on a slide that sits on this PowerPoint layout. Split
    // specs share their template layout, so one layout name can allow several
    // backgrounds -- the background fix only applies when exactly one is allowed.
    const T = (byTemplate[tpl] = byTemplate[tpl] || { specs: [], backgrounds: [] });
    T.specs.push(L.name);
    [bg, bgOf(L.background), bgOf(L.background_on_demo_slide)].forEach((b) => addBg(T, b));
  }
  // What the template's own slides on each layout carry: their backgrounds are
  // allowed, and their word counts set the density baseline for the layout.
  for (const [tpl, s] of Object.entries(snap.layouts)) {
    const T = byTemplate[tpl];
    if (!T) continue;
    s.backgrounds.forEach((b) => addBg(T, b));
    T.template_words = s.words;
    T.template_paras = s.paras;
    if (s.ph_positions) T.ph_positions = s.ph_positions;
  }

  // Logo variants for the logo fix come from the builder's pinned CDN commit.
  const pin = (fs.readFileSync(R('mmw_presentation_builder_prompt.txt'), 'utf8').match(/standard-deck-mmw@([0-9a-f]{40})/) || [])[1];
  return {
    schema: 'mmw-rules/1',
    assets_base: pin ? 'https://cdn.jsdelivr.net/gh/hugedeal-lab/standard-deck-mmw@' + pin + '/assets/logos/' : null,
    _about: 'GENERATED by tools/build_rules.js -- do not edit. Edit rules/policy.json or the source files, then rerun.',
    sources: Object.fromEntries(SOURCES.map((p) => [p, blob(p)])),
    engine_version: DL.VERSION,
    template: snap.source,
    canvas: {
      engine_in: [spec.source.engine_in[0], spec.source.engine_in[1]],
      template_in: spec.source.native_in,
      _units: 'Geometry is engine inches and sizes engine pt. Scale by (deck slide width in inches / 13.33): 2.0005 for a template-made deck, 1 for a builder-made deck.'
    },
    policy,
    theme: snap.theme,
    fonts: {
      allowed: policy.fonts.allowed,
      symbol: policy.fonts.symbol,
      by_role: policy.fonts.by_role,
      theme_refs: { '+mj-lt': snap.theme.fonts.major, '+mn-lt': snap.theme.fonts.minor }
    },
    type_scale: typeScale,
    palette: {
      tokens,
      by_hex: byHex,
      accents: SD.ACCENT_FAMILIES,
      chart_series: SD.CHART_SERIES,
      chart_series_light: SD.CHART_SERIES_LIGHT,
      template_observed: Object.fromEntries(Object.entries(observed).sort((a, b) => b[1] - a[1])),
      annotation,
      annotations
    },
    fingerprints: fs.existsSync(R('rules/fingerprints.json')) ? JSON.parse(fs.readFileSync(R('rules/fingerprints.json'), 'utf8')).prints : null,
    slug_budgets: budgets,
    slug_bg: Object.fromEntries(Object.keys(DL.LAYOUT_BG).map((k) => [k, lbg(k)])),
    metrics: fs.existsSync(R('rules/font_metrics.json')) ? JSON.parse(fs.readFileSync(R('rules/font_metrics.json'), 'utf8')).faces : null,
    furniture: spec.furniture,
    brand_marks: brandMarks,
    bg_marks: bgMarks,
    template_layouts: byTemplate,
    layouts
  };
}

// Run the checker over the template and keep what its own slides use.
async function snapshot(pptx, rules) {
  const JSZip = require('jszip'), { DOMParser } = require('@xmldom/xmldom');
  const DPC = require(R('design-pass/checker/check.js'));
  const zip = await JSZip.loadAsync(fs.readFileSync(pptx));
  const rep = await DPC.check(zip, rules, { DOMParser, collect: true,
    sha256: async (b) => crypto.createHash('sha256').update(Buffer.from(b)).digest('hex') });
  const skip = new Set(policy.template_reference.exclude_slides);
  const snap = { _about: 'GENERATED by tools/build_rules.js --template. What the template\'s own slides use; slides ' +
      [...skip].join(', ') + ' (instructions and resource sheets) excluded.',
    source: path.basename(pptx), theme: rep.deck.theme, layouts: {}, colours: {} };
  for (const s of rep.slides) {
    if (skip.has(s.n) || !s.layout) continue;
    const L = (snap.layouts[s.layout] = snap.layouts[s.layout] || { slides: [], backgrounds: [], words: 0, paras: 0 });
    L.slides.push(s.n);
    if (s.background && !L.backgrounds.some((b) => JSON.stringify(b) === JSON.stringify(s.background))) L.backgrounds.push(s.background);
    L.words = Math.max(L.words, s.words); L.paras = Math.max(L.paras, s.max_paras);
    for (const [k, pos] of Object.entries(s.ph_pos || {})) {
      const P = ((L.ph_positions = L.ph_positions || {})[k] = (L.ph_positions[k] || []));
      if (!P.some((q) => q.join() === pos.join())) P.push(pos);
    }
    for (const [h, n] of Object.entries(s.colours || {})) snap.colours[h] = (snap.colours[h] || 0) + n;
  }
  fs.writeFileSync(SNAP, JSON.stringify(snap, null, 1) + '\n');
  console.log('wrote rules/template_snapshot.json from ' + snap.source + ': ' + Object.keys(snap.layouts).length + ' layouts, ' +
    Object.keys(snap.colours).length + ' colours');
  return snap;
}

(async () => {
  const EMPTY = { source: null, theme: { fonts: {}, colors: {} }, layouts: {}, colours: {} };
  let snap = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, 'utf8')) : null;
  const ti = process.argv.indexOf('--template');
  if (ti > 0) snap = await snapshot(process.argv[ti + 1], build(snap || EMPTY));
  if (!snap) throw new Error('rules/template_snapshot.json is missing: run once with --template "<MMW template .pptx>"');
  const out = build(snap);
  fs.writeFileSync(R('rules/mmw_rules.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote rules/mmw_rules.json: ' + Object.keys(out.layouts).length + ' layouts on ' +
    Object.keys(out.template_layouts).length + ' template layouts, ' + Object.keys(out.palette.tokens).length + ' tokens, ' +
    Object.keys(out.palette.template_observed).length + ' template colours, ' +
    Object.values(budgets).reduce((n, b) => n + Object.keys(b).length, 0) + ' copy budgets');
})().catch((e) => { console.error(e.message || e); process.exit(1); });
