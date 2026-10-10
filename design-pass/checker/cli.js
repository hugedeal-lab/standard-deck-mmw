// Run the Design Pass checker on .pptx files from the command line -- the
// same core the page uses. For calibration runs over design-pass/pilot/.
//
//   npm install --prefix /some/dir @xmldom/xmldom@0.8.10 jszip@3.10.1
//   NODE_PATH=/some/dir/node_modules node design-pass/checker/cli.js deck.pptx [--json out.json]
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const JSZip = require('jszip'), { DOMParser } = require('@xmldom/xmldom');
const DPC = require('./check.js');
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '../../rules/mmw_rules.json'), 'utf8'));
const sha256 = async (buf) => crypto.createHash('sha256').update(Buffer.from(buf)).digest('hex');

(async () => {
  const args = process.argv.slice(2), ji = args.indexOf('--json');
  const jsonOut = ji >= 0 ? args.splice(ji, 2)[1] : null;
  const reports = {};
  for (const f of args) {
    const zip = await JSZip.loadAsync(fs.readFileSync(f));
    const rep = await DPC.check(zip, rules, { DOMParser, sha256 });
    reports[path.basename(f)] = rep;
    console.log(DPC.toText(rep, path.basename(f)) + '\n');
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(reports, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
