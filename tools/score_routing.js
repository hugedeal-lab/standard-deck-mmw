// Scores the agent's replies to tests/routing/RUN.md against tests/routing/briefs.json.
//   node tools/score_routing.js replies.txt [--json]
// A reply line is "R07 | layoutName | reason". PASS = an expected layout,
// OK = a defensible alternate, FLAG = a known wrong answer, MISS = anything
// else (including a missing or unknown name).
const fs = require('fs'), path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tests', 'routing', 'briefs.json'), 'utf8')).briefs;
const txt = fs.readFileSync(process.argv[2], 'utf8');
const got = {};
txt.split('\n').forEach((l) => {
  const m = /\b(R\d{2})\b\s*[|:\-–]\s*`?([A-Za-z0-9]+)`?\s*(?:[|:\-–]\s*(.*))?/.exec(l);
  if (m && !got[m[1]]) got[m[1]] = { layout: m[2], reason: (m[3] || '').trim() };
});
const rows = D.map((b) => {
  const g = got[b.id], L = g && g.layout;
  const v = !g ? 'MISS' : b.expect.includes(L) ? 'PASS' : b.accept.includes(L) ? 'OK' : b.reject.includes(L) ? 'FLAG' : 'MISS';
  return Object.assign({}, b, { got: L || '(none)', reason: g ? g.reason : '', verdict: v, noFit: !!(g && /^NO-FIT/i.test(g.reason)) });
});
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
const pct = (a, n) => n ? Math.round(100 * a / n) + '%' : '-';
function summary(key) {
  const g = {};
  rows.forEach((r) => [].concat(r[key]).forEach((k) => { (g[k] = g[k] || []).push(r); }));
  console.log('\nBy ' + key + ':');
  Object.entries(g).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, rs]) => {
    const p = rs.filter((r) => r.verdict === 'PASS').length, o = rs.filter((r) => r.verdict === 'OK').length;
    console.log('  ' + k.padEnd(20) + ' ' + String(rs.length).padStart(3) + ' briefs   pass ' + pct(p, rs.length).padStart(4) + '   pass+ok ' + pct(p + o, rs.length).padStart(4));
  });
}
const n = (v) => rows.filter((r) => r.verdict === v).length;
console.log('Routing test: ' + rows.length + ' briefs, ' + Object.keys(got).length + ' answered');
console.log('PASS ' + n('PASS') + '   OK ' + n('OK') + '   FLAG ' + n('FLAG') + '   MISS ' + n('MISS') +
  '   ->  strict ' + pct(n('PASS'), rows.length) + ', acceptable ' + pct(n('PASS') + n('OK'), rows.length));
summary('team'); summary('tags');
const bad = rows.filter((r) => r.verdict === 'FLAG' || r.verdict === 'MISS');
if (bad.length) {
  console.log('\nMisrouted:');
  bad.forEach((r) => console.log('  ' + r.id + ' ' + r.verdict.padEnd(4) + ' got ' + r.got + '  (expected ' + r.expect.slice(0, 3).join('/') +
    (r.expect.length > 3 ? '/...' : '') + ')\n        ' + r.brief + (r.reason ? '\n        agent: ' + r.reason : '')));
}
