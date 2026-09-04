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
const DIV=[['dividerDark','Divider Dark'],['dividerDark2','Divider Dark2'],
 ['dividerLight','Divider Light'],['dividerLight2','Divider Light2'],
 ['dividerAsphalt','Divider Asphalt'],['dividerCanopy','Divider Canopy'],
 ['dividerAurora','Divider Aurora'],['dividerTides','Divider Tides']];
console.log('slug            background source          dark  elements');
console.log('-'.repeat(78));
for(const [slug,tpl] of DIV){
  const bg=byName[tpl].background;
  const isImg = bg.kind==='image';
  const dark = ['dividerLight','dividerLight2'].includes(slug)?0:1;
  const sd={layout:slug,dark,tag:'NEXT SECTION',title:'Production Planning'};
  if(isImg) sd.bgImage='assets/backgrounds/'+bg.asset; else sd.bgColor=bg.hex;
  const els=DL.dispatch(sd);
  const src=isImg?bg.asset:bg.hex;
  console.log(`${slug.padEnd(15)} ${(isImg?'bgImage ':'bgColor ')+src.padEnd(17)} ${dark}     ${els.length}`);
  els.forEach(e=>{
    if(e.type==='t') console.log(`      text "${String(e.text).slice(0,22)}" ${e.size}pt ${e.color} @${e.x},${e.y}`);
    else if(e._imgPlaceholder) console.log(`      PHOTO WELL @${e.x},${e.y} ${e.w}x${e.h}`);
    else if(e.type==='img') console.log(`      img ref=${e.ref}`);
    else if(e.type==='s') console.log(`      shape fill=${e.fill} @${e.x},${e.y} ${e.w}x${e.h}`);
  });
}
