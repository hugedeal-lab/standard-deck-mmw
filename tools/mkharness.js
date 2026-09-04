global.window={StandardDeck:{SD_CONST:{SLIDE_W:13.33,SLIDE_H:7.5,SAFE_X_MIN:.5,SAFE_Y_MIN:.75}}};
require('./build/deck-layouts.js');
const DL=global.window.DeckLayouts, fs=require('fs');
const spec=JSON.parse(fs.readFileSync('build/mmw_layouts.json','utf8'));
const byName={}; spec.layouts.forEach(l=>byName[l.name]=l);
const DARK=new Set(['#262626','#253724','#2C283B','#142A45','#000000','#1A1A1A']);
const SAMPLE={tag:'NEXT SECTION',subhead:'Supporting subhead',subtitle:'Supporting subhead',
 text:'Supporting body copy for layout verification.',text2:'Secondary body copy.',text3:'Tertiary body copy.',
 date:'FIRST DRAFT \u2014 JULY 2026',script:'VO: Opening line of the spot.',scriptA:'VO: Version A.',
 scriptB:'VO: Version B.',accessoryCaption:'Silver wedding ring',headline:'Long Beach House',trackSunLabel:'Track sun'};
const TITLE={cover:'Mazda Motion Works',divider:'Production Planning',statement:'MOVEMENT',
 agenda_closing:'Thank You',production:'Concept: Weekend Getaway'};
const rows=[];
const seen=new Set();
for(const [tpl,slug] of Object.entries(DL.TEMPLATE_NAMES)){
  const L=byName[tpl]; if(!L) continue;
  // A retired template name resolves to the layout that superseded it; showing
  // both would put the same design on the sheet twice.
  if(seen.has(slug)) continue;
  seen.add(slug);
  const bg=L.background, d={layout:slug};
  if(bg.kind==='image'){
    const sub=/pattern|photo|texture|mark/.test(bg.asset)?'backgrounds':'social';
    d.bgImage='assets/'+sub+'/'+bg.asset; d.dark=/dark|scenic|headline_photo/.test(bg.asset)?1:0;
  } else { const h=(bg.hex||'#EEEEEE').toUpperCase(); d.bgColor=h; d.dark=DARK.has(h)?1:0; }
  let keys=(DL.LAYOUT_KEYS[slug]||[]).slice();
  if(keys.includes('subhead')&&keys.includes('subtitle')) keys=keys.filter(k=>k!=='subtitle');
  for(const k of keys){
    if(k==='title') d.title = slug==='tableOfContents' ? 'Table of contents'
                            : (TITLE[L.family]||'Section Heading');
    else if(k==='subtitle'&&slug==='tableOfContents') d.subtitle='Agenda';
    else if(k==='items') d.items = slug==='storyboardGrid'?[1,2,3,4,5,6].map(i=>({number:'0'+i,caption:'Shot '+i+' description'}))
      : slug==='castingGrid'?[1,2,3,4].map(i=>({name:'Talent '+i}))
      : slug==='locationOverview'?[1,2,3,4,5].map(i=>({label:'Location '+i}))
      : slug==='tableOfContents'?['Introduce the concept',
          {topic:'Present the approach',subs:['Creative territory','Production plan']},
          'Production timeline','Budget','Next steps']
      : ['Item one','Item two','Item three'];
    else if(k==='captions') d.captions=Array.from({length:10},(_,i)=>'Prop '+(i+1));
    else if(k==='copy') d.copy={postCopy:'Post copy sample.',headline:'Crafted with Care',
      alts:'The Mazda CX-5',cta:'CTA: Learn More',destination:'Destination: VLP',size:'Size: 4:5'};
    else if(k==='text'&&slug==='tableOfContents') d.text='Prepared for the MMW brand team, July 2026.';
    else if(SAMPLE[k]!==undefined) d[k]=SAMPLE[k];
  }
  d.notes=slug+' \u2014 template layout "'+tpl+'", source slide '+(L.spec_from_slide||'n/a')+'.';
  rows.push(d);
}
// Derived variants have no template layout, so the loop above cannot find them.
// Each needs real sample content or the well renders empty and tells you nothing.
// Layouts with a structured API need real sample content -- a flat item array
// leaves their slots empty and the slide looks broken rather than unfilled.
const STAT_ROW_SAMPLE = {
  title:'Media realities for 161',
  columns:['1','2','3','4','5'],
  sections:[
    {label:'Strategic Need', cells:['Capitalize on CX-5 momentum','Defend share in compact SUV',
      'Convert late cross-shoppers','Activate tier-two dealers','Sustain always-on presence']},
    {label:'Consumer Truth', cells:['Shoppers decide late','Price frames the set',
      'Reviews carry the room','Test drives close it','Loyalty is fragile']},
    {label:'Brand Role', cells:['Show the craft','Show the motion','Show the people',
      'Show the place','Show the proof']}]
};

const SPEND_BARS_SAMPLE = {
  title:'Media spend by campaign', tag:'INVESTMENT',
  intro:'Working media by campaign, full year.',
  bars:[
    {label:'MYCO',  value:'$9M',  pct:0.55, points:['Goal: brand consideration','Launch: Q3 2026']},
    {label:'ACME',  value:'$14M', pct:0.81, points:['Goal: retail volume','Launch: Q1 2026']},
    {label:'ORBIT', value:'$11M', pct:0.61, points:['Goal: conquest','Launch: Q2 2026']},
    {label:'NOVA',  value:'$12M', pct:0.71, points:['Goal: loyalty','Launch: Q4 2026']},
    {label:'ATLAS', value:'$16M', pct:0.91, points:['Goal: always-on','Launch: Jan 2026']},
    {label:'VERTEX',value:'$18M', pct:1.00, points:['Goal: full funnel','Launch: Jan 2026']}]
};

const SAMPLE_OVERRIDE = {
  reportEcosystemTree: {
    title:'Campaign ecosystem',
    cornerLeft:{label:'BUSINESS GOAL', icon:'target',
                text:'Grow consideration among in-market shoppers.'},
    cornerRight:{label:'STRATEGY', icon:'compass',
                 text:'Lead with craft, convert with proof.'},
    root:{label:'CAMPAIGN TITLE', facts:[
      {key:'Car Models:', value:'CX-70, CX-90'},
      {key:'Measurement:', value:'Brand lift, VDP visits'},
      {key:'Media Budget:', value:'$14M'},
      {key:'Production Budget:', value:'$3M'}]},
    branches:[
      {label:'Broadcast',    icon:'video',     items:[{text:'CTV:', subs:['15s and 30s','Live sport']}]},
      {label:'OLA',          icon:'monitor',   items:[{text:'Display:', subs:['Standard IAB','High impact']}]},
      {label:'Social',       icon:'share',     items:[{text:'Instagram:', subs:['Post 1','Post 2']},'Videos and carousels']},
      {label:'CRM',          icon:'mail',      items:[{text:'Email:', subs:['Owner nurture','Win-back']}]},
      {label:'Search',       icon:'search',    items:[{text:'SEM:', subs:['Brand terms','Conquest terms']}]},
      {label:'PR',           icon:'file-text', items:[{text:'Earned:', subs:['Press drives','Reviews']}]},
      {label:'Dealer',       icon:'store',     items:[{text:'Local:', subs:['Co-op assets','Radio']}]},
      {label:'Partnerships', icon:'handshake', items:[{text:'Creators:', subs:['Long form','Shorts']}]}]
  },
  reportPlatformMatrix: {
    title:'Marketing ecosystem',
    hub:{label:'PLATFORM', name:'MABM'},
    spokes:[
      {label:'Brand film',   header:'STRATEGY', copy:'Show how Mazda does not just move you.'},
      {label:'Always-on',    header:'STRATEGY', copy:'Sustain presence across the funnel.'},
      {label:'Retail',       header:'STRATEGY', copy:'Convert local demand into visits.'},
      {label:'Social',       header:'STRATEGY', copy:'Build community around the carline.'},
      {label:'Sponsorship',  header:'STRATEGY', copy:'Borrow relevance from culture.'},
      {label:'Search',       header:'STRATEGY', copy:'Capture intent at the decision point.'},
      {label:'CRM',          header:'STRATEGY', copy:'Keep owners close after purchase.'},
      {label:'Partnerships', header:'STRATEGY', copy:'Extend reach through trusted names.'}],
    categories:[
      {code:'CX-90', text:'Goal: own our human-centric approach to safety.'},
      {code:'CX-30', text:'Launch date: May 2026.'}]
  },
  reportBrandPillars: {
    title:'Make Mazda',
    channels:['Paid','Owned','Earned'],
    rowLabels:['Media JTBD','Media objectives','Target','Strategic outcomes'],
    sections:[
      {header:'Make Mazda distinct & relevant', sub:'(Build new associations)'},
      {header:'Fuel path towards purchase',     sub:'(Capture demand)'}],
    pillars:[
      {header:'Salience',  copy:'Media must be meaningful and unmistakably Mazda.'},
      {header:'Relevance', copy:'Media must form deeper associations with the brand.'},
      {header:'Impact',    copy:'Media must convince the movable middle to act.'}],
    targets:['Growth Target','Movable Middle & Communities','In-Market Buyers'],
    pivot:{label:'Q2 STRATEGIC PIVOTS',
           copy:'UPLIFT IN MEDIA | DIVERSIFIED SPORTS STRATEGY'},
    outcomes:['New audience conquest growth', null, 'Make choosing Mazda easier']
  },
  reportModelCompare: {
    tag:'PORTFOLIO', title:'Model priorities by funnel stage',
    stages:[
      {code:'BDD', label:'CREATE DISTINCTIVE BRAND EQUITY'},
      {code:'DGU', label:'ESTABLISH CARLINE RELEVANCE'},
      {code:'DGM', label:'BUILD IN-MARKET DEMAND'},
      {code:'DCP', label:'VALIDATE CHOICE'}],
    entries:[
      {label:'CX-5', col:0, row:0, rowSpan:4,
       copy:'Evaluate current performance and apply optimisations. Drive conversion through impactful creative.'},
      {label:'Brand', col:1, row:0, colSpan:4,
       copy:'Focus on uplift with a spotlight on craft and design.'},
      {label:'CX-90 / CX-70', col:1, row:1, rowSpan:3,
       copy:'Drive further awareness across the three-row segment.'},
      {label:'CX-50', col:2, row:1, rowSpan:3,
       copy:'Drive consideration among one-to-three row intenders.'},
      {label:'CX-30', col:3, row:2, rowSpan:2,
       copy:'Scale back investment to align with volume.'},
      {label:'M3 / MX-5', col:4, row:2, rowSpan:2,
       copy:'Minimal investment to support enthusiast demand.'}]
  },
  reportSpendBarsLight: SPEND_BARS_SAMPLE,
  reportSpendBarsDark:  SPEND_BARS_SAMPLE,
  reportStatRowLight: STAT_ROW_SAMPLE,
  reportStatRow: STAT_ROW_SAMPLE,
  reportSplitPanels: {
    tag:'CAMPAIGN', title:'Campaign progress', intro:'Where the work stands today.',
    stages:['2022','2023','2024','2025'],
    milestones:[
      {header:'Automotive headwinds', copy:'CX-5 advocacy to maintain share.'},
      {header:'Launch window',        copy:'CX-70 reveal and first drives.'},
      {header:'Retail push',          copy:'Dealer activation across tier two.'},
      {header:'Sustain',              copy:'Always-on social and search.'}]
  }
};

const DERIVED_ROWS = {
  reportGray:        {bgColor:'#EEEEEE', dark:0, tag:'SECTION', title:'Bare canvas',
                      intro:'Chassis only \u2014 compose the body yourself via els.'},
  reportGrayChart:   {bgColor:'#EEEEEE', dark:0, tag:'PERFORMANCE', title:'Media spend by quarter',
                      intro:'Chart well, template slides 83/84/85/88.',
                      chart:{type:'bar', data:[{name:'Spend ($k)',
                             labels:['Q1','Q2','Q3','Q4'], values:[42,58,35,64]}]}},
  reportDarkChart:   {bgColor:'#262626', dark:1, tag:'PERFORMANCE', title:'Media spend by quarter',
                      intro:'Chart well, template slides 79/80/81/82/93/94.',
                      chart:{type:'line', data:[{name:'Spend ($k)',
                             labels:['Q1','Q2','Q3','Q4'], values:[42,58,35,64]}]}},
  reportGrayTable:   {bgColor:'#EEEEEE', dark:0, tag:'PLANNING', title:'Channel plan',
                      intro:'Table well, template slides 76/78.',
                      headers:['Channel','Format','Flight','Spend'],
                      rows:[['Meta','Video + static','Jul \u2013 Sep','$120k'],
                            ['TikTok','Carousel','Aug \u2013 Sep','$80k'],
                            ['Pinterest','2:3 static','Jul \u2013 Oct','$45k'],
                            ['YouTube','Bumper','Sep','$60k']]},
  reportDarkTable:   {bgColor:'#262626', dark:1, tag:'PLANNING', title:'Channel plan',
                      intro:'Table well, template slide 77.',
                      headers:['Channel','Format','Flight','Spend'],
                      rows:[['Meta','Video + static','Jul \u2013 Sep','$120k'],
                            ['TikTok','Carousel','Aug \u2013 Sep','$80k'],
                            ['Pinterest','2:3 static','Jul \u2013 Oct','$45k']]},
  reportGrayTimeline:{bgColor:'#EEEEEE', dark:0, tag:'STATUS', title:'Campaign progress',
                      intro:'Timeline variant, template slide 72.',
                      milestones:['Share ideas','Get smart and explore','Approval','Share revision',
                                  'Clarify and build','Refine and go deep','Production','We are here']}
};
for (const [slug,row] of Object.entries(DERIVED_ROWS)) {
  if (!DL.LAYOUT_MAP[slug]) continue;
  rows.push(Object.assign({layout:slug}, row,
    {notes:slug+' \u2014 derived variant of the report canvas chassis.'}));
}

for (const r of rows) {
  if (SAMPLE_OVERRIDE[r.layout]) Object.assign(r, SAMPLE_OVERRIDE[r.layout]);
}

const H=['<!DOCTYPE html>',
'<html data-type="html" data-title="MMW Layout Test Harness" width="1920" height="1200">',
'<head><meta charset="utf-8"><title>MMW Layout Test Harness \u2014 all 84 layouts</title></head>',
'<!--',
'  SERVE OVER http, NOT file://',
'      python -m http.server 8000   ->   http://localhost:8000/test-deck.html',
'  Under file:// the canvas is tainted, so images cannot be cached as data URIs;',
'  the PPTX links them instead of embedding.',
'',
'  INSTALL "Mazda Type Bold" AND "Mazda Type" before judging fidelity.',
'',
'  Each slide is fed ONLY the content slots its layout declares',
'  (DeckLayouts.LAYOUT_KEYS), so nothing here implies a slot the template does',
'  not have. Console warnings flag any mismatch.',
'-->',
'<body>',
'<img id="gi0"  src="assets/logos/mmw_logo_black.png"         style="display:none">',
'<img id="gi0w" src="assets/logos/mmw_logo_white.png"         style="display:none">',
'<img id="gi1"  src="assets/logos/wpp_mazda_lockup_black.png" style="display:none">',
'<img id="gi1w" src="assets/logos/wpp_mazda_lockup_white.png" style="display:none">',
'',
'<div id="sd-diag" style="display:none;position:fixed;z-index:99999;top:0;left:0;right:0;' +
'  padding:14px 18px;background:#FFF4F4;border-bottom:3px solid #C12638;' +
'  font:13px/1.6 Arial,sans-serif;color:#262626"></div>',
'',
'<!-- LOCAL FILES FIRST: nothing on the render path touches the network. -->',
'<script src="deck-icons.js"></script>',
"<script>var AH='#C4A584';var AL='#FFE0C0';var AD='#9C7C5C';</script>",
'<script src="standard-deck.js"></script>',
'<script src="deck-layouts.js"></script>',
'<script src="deck-shell.js"></script>',
'<script>','var D=[',
rows.map(r=>JSON.stringify(r)).join(',\n'),
'];',
'',
'// Report what actually loaded, on the page rather than only in the console.',
'(function () {',
'  var miss = [];',
"  if (!window.StandardDeck) miss.push('standard-deck.js');",
"  if (!window.DeckLayouts)  miss.push('deck-layouts.js');",
"  if (!window.deckInit)     miss.push('deck-shell.js');",
'  if (miss.length) {',
"    var d = document.getElementById('sd-diag');",
"    d.style.display = 'block';",
"    d.innerHTML = '<b>These files did not load: ' + miss.join(', ') + '</b><br>' +",
"      'Serve the folder over http and open http://localhost:8000/test-deck.html ' +",
"      '(run <code>python -m http.server 8000</code> in this folder). Some browsers ' +",
"      'block local scripts over file://. Also confirm every .js sits beside this ' +",
"      '.html: OneDrive Files-On-Demand can leave them as online-only placeholders, ' +",
"      'so right-click the folder and choose Always keep on this device.';",
'    return;',
'  }',
"  deckInit({title:'MMW Layout Test Harness', contentFooter:'Internal \u2014 Layout QA'});",
"  console.log('[harness] rendered with deck-layouts ' + window.DeckLayouts.VERSION);",
'})();',
'</script>',
'',
'<!-- PptxGenJS is used ONLY by the PPTX export button, never to render, so it',
'     loads last and async. It is served from vendor/ rather than a CDN: this',
'     harness has to work on a corporate network that blocks jsdelivr, which is',
'     what produced blank slides (blocking tag) and then a dead export button',
'     (async tag that never arrived). vendor/ also pins the exact version. -->',
'<script async src="vendor/pptxgen.bundle.js"',
'        onerror="console.error(\'[harness] vendor/pptxgen.bundle.js missing - preview works, PPTX export will not.\')"></script>',
'</body></html>',''].join('\n');
fs.writeFileSync('build/test-deck.html',H);
console.log('harness:',rows.length,'slides');
const i=rows.findIndex(r=>r.layout==='statementSubhead');
console.log('statementSubhead is harness slide',i+1,':',JSON.stringify(rows[i]));
