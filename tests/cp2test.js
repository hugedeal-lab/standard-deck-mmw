const MARKS={gi0:'assets/logos/mmw_logo_black.png',gi0w:'assets/logos/mmw_logo_white.png',
 gi1:'assets/logos/wpp_mazda_lockup_black.png',gi1w:'assets/logos/wpp_mazda_lockup_white.png'};
global.document={getElementById:id=>MARKS[id]?{tagName:'IMG',getAttribute:a=>a==='src'?MARKS[id]:null,src:MARKS[id]}:null,
 createElement:t=>({tagName:t.toUpperCase(),style:{cssText:''},setAttribute(){},appendChild(){},querySelector:()=>null}),body:{appendChild(){}}};
global.window={};
require('../standard-deck.js');
const SD=global.window.StandardDeck; global.window.StandardDeck=SD;
require('../deck-layouts.js');
const DL=global.window.DeckLayouts;
function show(label, sd){
  console.log('\n'+label);
  DL.dispatch(sd).forEach(e=>{
    if(e._imgPlaceholder) console.log(`   PLACEHOLDER WELL @${e.x},${e.y} ${e.w}x${e.h}`);
    else if(e.type==='img') console.log(`   img ${e.ref?('ref='+e.ref):('src='+e.src)}${e.fit?' fit='+e.fit:''} @${e.x},${e.y} ${e.w}x${e.h}`);
    else if(e.type==='t') console.log(`   text "${String(e.text).slice(0,26)}" ${e.size}pt @${e.x},${e.y}`);
  });
}
show('coverPhoto2 — no image supplied (default, replaceable):',
  {layout:'coverPhoto2', dark:0, bgColor:'#EEEEEE', title:'Mazda Motion Works'});
show('coverPhoto2 — hero photo supplied (matches template slide 10):',
  {layout:'coverPhoto2', dark:0, bgColor:'#EEEEEE', title:'Mazda Motion Works',
   images:['photos/hero.jpg']});
