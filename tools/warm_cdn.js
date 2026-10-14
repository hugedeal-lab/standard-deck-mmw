// After a pin bump, fetch every file the Design Pass workspace loads from
// jsDelivr until each one serves (jsDelivr answers "Failed to fetch the
// requested commit" for a while after a new commit). Run before pasting the
// prompt into WPP Open.  Usage: node tools/warm_cdn.js [pin]  (default HEAD)
const cp = require('child_process'), path = require('path');
const ROOT = path.join(__dirname, '..');
const pin = process.argv[2] || cp.execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const files = ['design-pass/workspace/dist/design-pass.js', 'rules/mmw_rules.json'];
const url = (f) => 'https://cdn.jsdelivr.net/gh/hugedeal-lab/standard-deck-mmw@' + pin + '/' + f;
(async () => {
  const left = new Set(files), t0 = Date.now();
  while (left.size && Date.now() - t0 < 15 * 60000) {
    for (const f of [...left]) {
      try { const r = await fetch(url(f)); const ok = r.ok && !/^text\/plain/.test(r.headers.get('content-type') || ''); if (ok) { left.delete(f); console.log('ok   ' + f); } }
      catch (e) { /* retry */ }
    }
    if (left.size) await new Promise((r) => setTimeout(r, 20000));
  }
  if (left.size) { console.log('still not served after 15 min: ' + [...left].join(', ')); process.exit(1); }
  console.log('CDN ready for ' + pin.slice(0, 7));
})();
