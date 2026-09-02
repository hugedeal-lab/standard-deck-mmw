// Minimal DOM stub: the four hidden brand-mark <img> tags the artifact declares.
const MARKS = {
  gi0:'assets/logos/mmw_logo_black.png',   gi0w:'assets/logos/mmw_logo_white.png',
  gi1:'assets/logos/wpp_mazda_lockup_black.png', gi1w:'assets/logos/wpp_mazda_lockup_white.png'
};
const made=[];
global.document = {
  getElementById: id => MARKS[id] ? { tagName:'IMG', getAttribute:a=>a==='src'?MARKS[id]:null, src:MARKS[id] } : null,
  createElement: t => { const e={tagName:t.toUpperCase(),style:{cssText:''},children:[],
    setAttribute(){}, appendChild(c){this.children.push(c);}, querySelector:()=>null};
    if(t==='img') made.push(e); return e; },
  body:{appendChild(){}}
};
global.window = {};
require('../standard-deck.js');
const SD = global.window.StandardDeck;
global.window.StandardDeck = SD;
require('../deck-layouts.js');
const DL = global.window.DeckLayouts;

console.log('--- resolveImgSrc via ref ---');
for (const r of ['gi0','gi0w','gi1','gi1w'])
  console.log('  ', r, '->', SD.resolveImgSrc({type:'img', ref:r}));
console.log('   missing ref ->', SD.resolveImgSrc({type:'img', ref:'nope'}));

console.log('\n--- coverLight (dark:0) elements ---');
for (const dark of [0,1]) {
  const els = DL.dispatch({layout: dark? 'coverDark':'coverLight', dark,
    bgImage: dark?'assets/backgrounds/pattern_dark.png':'assets/backgrounds/pattern_light.png',
    title:'Mazda Motion Works', date:'FIRST DRAFT — JULY 2026'});
  console.log(' ', dark?'coverDark ':'coverLight', '=>', els.length, 'elements');
  els.forEach(e=>{
    if(e.type==='img') console.log('     img ref='+e.ref, '->', SD.resolveImgSrc(e),
      ` @ ${e.x},${e.y} ${e.w}x${e.h}`);
    else console.log(`     ${e.type}   "${String(e.text).slice(0,30)}" ${e.size}pt @ ${e.x},${e.y}`);
  });
}
// simulate export decision
console.log('\n--- export opts (uncached, e.g. file://) ---');
const cache={};
const el={type:'img',ref:'gi0',x:0.41,y:0.37,w:1.12,h:0.31};
const src=SD.resolveImgSrc(el);
const data=(src.indexOf('data:')===0)?src:cache[src];
console.log('  ', data?{data:'<uri>'}:{path:src});
