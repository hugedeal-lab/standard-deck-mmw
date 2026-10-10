// Score Design Pass against designer reviews. See design-pass/PILOT.md.
//
//   NODE_PATH=<deps>/node_modules node design-pass/checker/score.js design-pass/pilot/ [--json out.json]
//
// For each deck folder (one holding deck.pptx): writes report.json, writes
// verdicts.json if missing (a template for the designer), then tallies per
// check: what Design Pass found, the designer's verdicts, matches with
// designer.json, misses, and designer minutes on matched items.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const JSZip = require('jszip'), { DOMParser } = require('@xmldom/xmldom');
const DPC = require('./check.js');
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '../../rules/mmw_rules.json'), 'utf8'));
const sha256 = async (b) => crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);

async function run(file) {
  return DPC.check(await JSZip.loadAsync(fs.readFileSync(file)), rules, { DOMParser, sha256 });
}
// Flatten a report to findings keyed slide|check (slide 0 = whole deck).
function flat(rep) {
  const out = [];
  rep.deck.findings.forEach((f) => out.push({ slide: 0, ...f }));
  rep.slides.forEach((s) => s.findings.forEach((f) => out.push({ slide: s.n, ...f })));
  return out;
}

(async () => {
  const args = process.argv.slice(2), ji = args.indexOf('--json');
  const jsonOut = ji >= 0 ? args.splice(ji, 2)[1] : null;
  const root = args[0] || path.join(__dirname, '../pilot');
  const dirs = fs.readdirSync(root).map((d) => path.join(root, d)).filter((d) => fs.existsSync(path.join(d, 'deck.pptx')));
  if (!dirs.length) { console.log('No deck folders (with deck.pptx) under ' + root + ' -- see design-pass/PILOT.md'); return; }

  const T = {};   // per check tallies
  const t = (c) => (T[c] = T[c] || { found: 0, fix: 0, agree: 0, wrongfix: 0, noise: 0, harmful: 0, unrated: 0, matched: 0, designer_only: 0, minutes: 0, resolved: 0 });
  const decks = [];
  for (const d of dirs) {
    const id = path.basename(d);
    const rep = await run(path.join(d, 'deck.pptx'));
    fs.writeFileSync(path.join(d, 'report.json'), JSON.stringify(rep, null, 1));
    const F = flat(rep);

    const vp = path.join(d, 'verdicts.json');
    if (!fs.existsSync(vp)) fs.writeFileSync(vp, JSON.stringify({
      _howto: 'Set verdict to agree | agree-wrong-fix | noise | harmful (design-pass/PILOT.md). note is optional.',
      findings: F.map((f) => ({ slide: f.slide, check: f.check, action: f.action, msg: f.msg, rec: f.rec, verdict: '', note: '' }))
    }, null, 1));
    const verdicts = (readJson(vp) || { findings: [] }).findings;
    const vOf = (f) => (verdicts.find((v) => v.slide === f.slide && v.check === f.check && v.msg === f.msg) || {}).verdict || '';

    const des = readJson(path.join(d, 'designer.json'));
    const desKeys = new Set((des ? des.findings : []).map((x) => x.slide + '|' + x.check));
    const dpKeys = new Set(F.map((f) => f.slide + '|' + f.check));

    let resolvedKeys = null;
    if (fs.existsSync(path.join(d, 'reviewed.pptx'))) {
      const after = new Set(flat(await run(path.join(d, 'reviewed.pptx'))).map((f) => f.slide + '|' + f.check + '|' + f.msg));
      resolvedKeys = new Set(F.filter((f) => !after.has(f.slide + '|' + f.check + '|' + f.msg)).map((f) => f.slide + '|' + f.check));
    }

    for (const f of F) {
      const c = t(f.check);
      c.found++; if (f.action === 'fix') c.fix++;
      const v = vOf(f);
      if (v === 'agree') c.agree++; else if (v === 'agree-wrong-fix') c.wrongfix++; else if (v === 'noise') c.noise++;
      else if (v === 'harmful') c.harmful++; else c.unrated++;
    }
    for (const k of dpKeys) {
      const check = k.split('|')[1];
      if (desKeys.has(k)) t(check).matched++;
      if (resolvedKeys && resolvedKeys.has(k)) t(check).resolved++;
    }
    for (const x of des ? des.findings : []) {
      const c = t(x.check);
      if (dpKeys.has(x.slide + '|' + x.check)) c.minutes += x.minutes || 0;
      else c.designer_only++;
    }
    decks.push({ id, slides: rep.deck.slides, fix: rep.summary.fix, flag: rep.summary.flag, designer: !!des,
      designer_minutes: des ? des.minutes_total : null, reviewed: !!resolvedKeys,
      rated: verdicts.filter((v) => v.verdict).length + '/' + verdicts.length });
  }

  console.log('DECKS');
  for (const k of decks) console.log('  ' + k.id + ': ' + k.slides + ' slides, ' + k.fix + ' fix / ' + k.flag + ' flag, verdicts ' + k.rated +
    (k.designer ? ', designer.json (' + (k.designer_minutes || '?') + ' min)' : ', no designer.json') + (k.reviewed ? ', reviewed.pptx' : ''));
  const cols = ['found', 'fix', 'agree', 'wrongfix', 'noise', 'harmful', 'unrated', 'matched', 'designer_only', 'resolved', 'minutes'];
  const w = 18;
  console.log('\n' + 'check'.padEnd(w) + cols.map((c) => c.replace('designer_only', 'des.only').padStart(9)).join(''));
  for (const [c, v] of Object.entries(T).sort())
    console.log(c.padEnd(w) + cols.map((k) => String(v[k]).padStart(9)).join('') + (v.harmful && rules.policy.checks[c] && rules.policy.checks[c].action === 'fix' ? '   <- harmful auto-fix: keep as flag' : ''));
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ decks, checks: T }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
