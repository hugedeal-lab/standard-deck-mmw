const MARKS={gi0:'assets/logos/mmw_logo_black.png',gi0w:'assets/logos/mmw_logo_white.png',
 gi1:'assets/logos/wpp_mazda_lockup_black.png',gi1w:'assets/logos/wpp_mazda_lockup_white.png'};
global.document={getElementById:id=>MARKS[id]?{tagName:'IMG',getAttribute:a=>a==='src'?MARKS[id]:null,src:MARKS[id]}:null,
 createElement:t=>({tagName:t.toUpperCase(),style:{cssText:''},setAttribute(){},appendChild(){},querySelector:()=>null}),body:{appendChild(){}}};
global.window={};
require('../standard-deck.js');
global.window.StandardDeck=global.window.StandardDeck;
require('../deck-layouts.js');
const DL=global.window.DeckLayouts;

// Simulate deckInit's one-time assignment exactly
function assign(D, defaultPhotos){
  if (defaultPhotos===false) return D;
  const pools=DL.PHOTO_DEFAULTS, seen={};
  D.forEach(sd=>{
    if(!sd||!sd.layout) return;
    const spec=pools[sd.layout]; if(!spec||!spec.pool||!spec.pool.length) return;
    const n=(seen[sd.layout]= seen[sd.layout]===undefined?0:seen[sd.layout]+1);
    const pick=spec.pool[n%spec.pool.length];
    if(spec.target==='bgImage'){ if(!sd.bgImage) sd.bgImage=pick; }
    else { const slot=spec.slot||0; if(!Array.isArray(sd.images)) sd.images=sd.images||[]; if(!sd.images[slot]) sd.images[slot]=pick; }
  });
  return D;
}
const deck=[
 {layout:'coverPhoto2', title:'Cover A'},
 {layout:'coverPhoto',  title:'Cover B'},
 {layout:'coverPhoto2', title:'Cover C'},
 {layout:'coverPhoto2', title:'Cover D'},
 {layout:'coverPhoto',  title:'Cover E'},
 {layout:'headlinePhotoWell', title:'BIG IDEA'},
 {layout:'headlinePhotoWell', title:'ANOTHER'},
 {layout:'coverPhoto2', title:'Cover F', images:['photos/MY_OWN.jpg']},  // user override
];
assign(deck);
console.log('ROTATION ACROSS ONE DECK');
console.log('-'.repeat(74));
deck.forEach((sd,i)=>{
  const got = sd.bgImage || (sd.images&&sd.images[0]) || '(none)';
  console.log(`  ${String(i+1).padStart(2)}. ${sd.layout.padEnd(19)} ${String(sd.title).padEnd(10)} ${got.replace('assets/','')}`);
});
// determinism: dispatch repeatedly (preview, prefetch, icons, export = 4 passes)
console.log('\nDETERMINISM — dispatch 4x per slide, compare photo each pass:');
let stable=true;
deck.forEach((sd,i)=>{
  const seen=new Set();
  for(let p=0;p<4;p++){
    const els=DL.dispatch(sd);
    const im=els.filter(e=>e.type==='img'&&e.fit==='cover').map(e=>e.src).join('|');
    seen.add(im+'||'+(sd.bgImage||''));
  }
  if(seen.size!==1){ stable=false; console.log(`   UNSTABLE slide ${i+1}`); }
});
console.log(stable ? '   all slides identical across 4 dispatch passes ✓' : '   FAILED');
// opt-out
const deck2=[{layout:'coverPhoto2',title:'X'},{layout:'coverPhoto',title:'Y'}];
assign(deck2,false);
console.log('\nOPT-OUT deckInit({defaultPhotos:false}):');
deck2.forEach(sd=>console.log(`   ${sd.layout.padEnd(14)} bgImage=${sd.bgImage||'none'} images=${JSON.stringify(sd.images||null)}`));
