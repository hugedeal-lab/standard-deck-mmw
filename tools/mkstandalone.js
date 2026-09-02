// Build a single self-contained test deck: all four JS files inlined.
// Removes every environmental failure mode at once -- no local script loads
// (some browsers block those over file://), no CDN, no OneDrive placeholders,
// no relative-path resolution for code. Images stay relative; if they are
// missing you still see correct geometry and type, just with empty frames.
const fs=require('fs'), path=require('path');
const B='/mnt/workspace/output/mmw-v2/';
const read=f=>fs.readFileSync(path.join(B,f),'utf8');
const harness=fs.readFileSync('build/test-deck.html','utf8');
const D=harness.split('var D=[')[1].split('\n];')[0];

const html=`<!DOCTYPE html>
<html data-type="html" data-title="MMW Layout Test Harness (standalone)" width="1920" height="1200">
<head><meta charset="utf-8"><title>MMW Layout Test Harness — standalone</title></head>
<!--
  SELF-CONTAINED BUILD. All engine code is inlined below, so this file renders
  with no network access and no sibling .js files. Use it when test-deck.html
  shows blank slides.

  Images are still referenced relatively (assets/...). Keep this file in the
  mmw-v2 folder so they resolve. If assets are missing you will still see
  correct layout geometry and typography, just with empty image frames.

  INSTALL "Mazda Type Bold" and "Mazda Type" before judging fidelity.
-->
<body>
<img id="gi0"  src="assets/logos/mmw_logo_black.png"         style="display:none">
<img id="gi0w" src="assets/logos/mmw_logo_white.png"         style="display:none">
<img id="gi1"  src="assets/logos/wpp_mazda_lockup_black.png" style="display:none">
<img id="gi1w" src="assets/logos/wpp_mazda_lockup_white.png" style="display:none">

<script>/* ---- deck-icons.js ---- */
${read('deck-icons.js')}
</script>
<script>var AH='#C4A584';var AL='#FFE0C0';var AD='#9C7C5C';</script>
<script>/* ---- standard-deck.js ---- */
${read('standard-deck.js')}
</script>
<script>/* ---- deck-layouts.js ---- */
${read('deck-layouts.js')}
</script>
<script>/* ---- deck-shell.js ---- */
${read('deck-shell.js')}
</script>
<script>
var D=[
${D}
];
deckInit({title:'MMW Layout Test Harness', contentFooter:'Internal — Layout QA'});
console.log('[standalone] rendered with deck-layouts ' + window.DeckLayouts.VERSION);
</script>
</body></html>
`;
fs.writeFileSync('build/test-deck-standalone.html', html);
console.log('standalone:', (html.length/1024/1024).toFixed(2), 'MB');
