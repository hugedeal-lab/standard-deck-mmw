// Stub the engine surface deck-layouts.js depends on
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 } } };
global.console = console;
require('../deck-layouts.js');
const DL = global.window.DeckLayouts;
const names = Object.keys(DL.LAYOUT_MAP);
let fail=0, totalEls=0, warn=[];
const spec = require('../mmw_layouts.json');
const byName = {}; spec.layouts.forEach(l=>byName[l.name]=l);
const slugOf = DL.TEMPLATE_NAMES;
for (const n of names) {
  for (const dark of [0,1]) {
    let els;
    try { els = DL.dispatch({layout:n, dark:dark, title:'TEST TITLE', tag:'TAG', subhead:'Sub',
      text:'Body copy.', date:'JULY 2026', items:[{number:'01',caption:'c'},{label:'L'},{name:'N'}],
      captions:['a','b'], copy:{postCopy:'p',headline:'h'} }); }
    catch(e){ console.log('THREW  '+n+' dark='+dark+': '+e.message); fail++; continue; }
    if (!Array.isArray(els)) { console.log('NOT ARRAY '+n); fail++; continue; }
    if (els.length===0) { console.log('EMPTY  '+n+' dark='+dark); fail++; continue; }
    if (dark===0) totalEls += els.length;
    for (const e of els) {
      if (e.type==='t' && typeof e.size==='number' && e.size>200) warn.push(n+' oversized '+e.size+'pt');
      if (typeof e.x!=='number'||typeof e.y!=='number'||typeof e.w!=='number'||typeof e.h!=='number')
        warn.push(n+' non-numeric geometry on '+e.type);
      if (e.type==='t' && e.size===undefined) warn.push(n+' text with no size');
    }
  }
}
console.log('\nlayouts dispatched : '+names.length);
console.log('failures           : '+fail);
console.log('elements (dark=0)  : '+totalEls);
console.log('warnings           : '+warn.length);
warn.slice(0,10).forEach(w=>console.log('   '+w));
// alias check
console.log('\nlegacy alias resolution:');
['coverGeometric','coverScenic','content03','headline','thankYou','dividerBrand'].forEach(a=>{
  const f=DL.resolve(a); console.log('   '+a+' -> '+(f?'OK':'FAIL'));
});
console.log('\ntemplate-name resolution:');
['Cover Dark','Moodboard ','Title & Bullets','Meta_Video&Static','Pinterest 2:3'].forEach(a=>{
  const f=DL.resolve(a); console.log('   '+JSON.stringify(a)+' -> '+(f?'OK':'FAIL'));
});
