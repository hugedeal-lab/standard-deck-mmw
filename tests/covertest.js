const MARKS={gi0:'assets/logos/mmw_logo_black.png',gi0w:'assets/logos/mmw_logo_white.png',
 gi1:'assets/logos/wpp_mazda_lockup_black.png',gi1w:'assets/logos/wpp_mazda_lockup_white.png'};
global.document={getElementById:id=>MARKS[id]?{tagName:'IMG',getAttribute:a=>a==='src'?MARKS[id]:null,src:MARKS[id]}:null,
 createElement:t=>({tagName:t.toUpperCase(),style:{cssText:''},setAttribute(){},appendChild(){},querySelector:()=>null}),body:{appendChild(){}}};
global.window={};
require('../standard-deck.js');
const SD=global.window.StandardDeck; global.window.StandardDeck=SD;
require('../deck-layouts.js');
const DL=global.window.DeckLayouts;
const spec=require('../mmw_layouts.json');
const byName={}; spec.layouts.forEach(l=>byName[l.name]=l);
const COVERS=[['coverLight','Cover Light',0],['coverDark','Cover Dark',1],
  ['coverLight2','Cover Light2',0],['coverPhoto','Cover Photo',1],['coverPhoto2','Cover Photo2',0]];
for(const [slug,tpl,dark] of COVERS){
  const L=byName[tpl], bg=L.background;
  const sd={layout:slug,dark,title:'Mazda Motion Works',date:'FIRST DRAFT — JULY 2026',subtitle:'Sub'};
  if(bg.kind==='image') sd.bgImage='assets/backgrounds/'+bg.asset; else sd.bgColor=bg.hex;
  const els=DL.dispatch(sd);
  console.log('\n'+slug+'   ('+tpl+')   bg: '+(bg.kind==='image'?bg.asset:bg.hex));
  els.forEach(e=>{
    if(e.type==='img') console.log('   LOGO/MARK  ref='+e.ref+' -> '+SD.resolveImgSrc(e)+`  @${e.x},${e.y}`);
    else if(e._imgPlaceholder) console.log(`   PHOTO WELL  @${e.x},${e.y} ${e.w}x${e.h}`);
    else if(e.type==='t'&&!e._skipExport) console.log(`   text  "${String(e.text).slice(0,26)}" ${e.size}pt @${e.x},${e.y}`);
  });
}
