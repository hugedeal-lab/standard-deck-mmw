// Run the Design Pass checker on .pptx files from the command line -- the
// same core the page uses. For calibration runs over design-pass/pilot/.
//
//   npm install --prefix /some/dir @xmldom/xmldom@0.8.10 jszip@3.10.1
//   NODE_PATH=/some/dir/node_modules node design-pass/checker/cli.js deck.pptx [--json out.json] [--fix out.pptx]
//
// --fix writes a corrected copy (one input deck only); logo variants are read
// from assets/logos/ in this repo instead of the CDN.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const JSZip = require('jszip'), { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const DPC = require('./check.js');
const ROOT = path.join(__dirname, '../..');
const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'rules/mmw_rules.json'), 'utf8'));
const opts = { DOMParser, XMLSerializer,
  sha256: async (buf) => crypto.createHash('sha256').update(Buffer.from(buf)).digest('hex'),
  fetchAsset: async (name) => fs.readFileSync(path.join(ROOT, 'assets/logos', name)) };

(async () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const jsonOut = opt('--json'), fixOut = opt('--fix');
  const reports = {};
  for (const f of args) {
    const zip = await JSZip.loadAsync(fs.readFileSync(f));
    const rep = await DPC.check(zip, rules, opts);
    reports[path.basename(f)] = rep;
    console.log(DPC.toText(rep, path.basename(f)) + '\n');
    if (fixOut) {
      const zip2 = await JSZip.loadAsync(fs.readFileSync(f));
      const fixed = await DPC.fix(zip2, rules, rep, opts).catch((e) => { console.error('No fixes: ' + e.message); return null; });
      if (!fixed) continue;
      fs.writeFileSync(fixOut, await zip2.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
      reports[path.basename(f)].applied = fixed.applied;
      console.log('APPLIED: ' + fixed.applied.slides.reduce((n, s) => n + s.findings.length, fixed.applied.deck.length) + ' fixes, ' +
        fixed.changed_parts + ' parts changed' + (fixed.failed.length ? ', FAILED: ' + JSON.stringify(fixed.failed) : ''));
    }
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(reports, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
