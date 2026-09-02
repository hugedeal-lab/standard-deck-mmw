# -*- coding: utf-8 -*-
"""Hand-authored bodies for layouts whose auto-generated flat item array is unusable.
Geometry is taken verbatim from MMW_Layout_Spec.md / mmw_layouts.json."""

OVERRIDES = {}

OVERRIDES['storyboardGrid'] = '''
// 6-panel numbered shot grid, 2 super-columns x 3 rows.
// Reading order runs DOWN the left column (01-03) then down the right (04-06).
// Count is fixed at 6: the grid has no spare cell and no overflow rule.
// cfg.items: [{ number:'01', caption:'Wide establishing shot' }, ...] x6
function layout_storyboardGrid(cfg) {
  var els = [];
  var items = cfg.items || [];
  if (cfg.subhead) els.push({ type:'t', text:cfg.subhead, x:0.26, y:0.14, w:12.80, h:0.45,
    font:'B', size:13, color:'black', valign:'bottom' , caps:false, lineSpacing:1 , charSpacing:0.52 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || 'STORYBOARD', x:0.26, y:0.42, w:12.80, h:0.69,
    font:'HR', size:35, color:'bodyGray', bold:true, caps:true , lineSpacing:0.8 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });

  var cardX = [0.29, 6.82], numX = [0.46, 6.99], capX = [0.44, 6.97], phX = [3.10, 9.63];
  var rowY  = [1.18, 3.21, 5.24], numY = [1.32, 3.35, 5.39], capY = [1.84, 3.86, 5.90];

  for (var i = 0; i < 6; i++) {
    var col = i < 3 ? 0 : 1, row = i % 3;
    var it = items[i] || {};
    els.push({ type:'s', x:cardX[col], y:rowY[row], w:2.71, h:1.94, fill:'cardSand' });
    els.push({ type:'t', text: it.number || ('0' + (i + 1)),
      x:numX[col], y:numY[row], w:0.33, h:0.32,
      font:'B', size:17, color:'bodyGray', valign:'bottom' , caps:true, lineSpacing:0.9 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    els.push({ type:'t', text: it.caption || '',
      x:capX[col], y:capY[row], w:2.41, h:0.41,
      font:'B', size:7.5, color:'bodyGray' , caps:false, lineSpacing:1 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    ph(els, cfg, phX[col], rowY[row], 3.47, 1.94);
  }
  return els;
}'''

OVERRIDES['tableOfContents'] = '''
// Agenda. Faithful to template slide 22 -- four distinct pieces:
//
//  1. HEADING  one box, one paragraph, a <br/> between two runs:
//     grey subtitle above black title. 17pt bold ALL CAPS, 90% line spacing.
//  2. LIST     one box. Each item is a grey NUMBER run + a black TOPIC run at
//     30pt bold, 110% line spacing. Sub-bullets sit under an item at 15pt bold
//     black, hanging indent, bullet glyph at 80% of text size.
//  3. COPY BLOCK  lower left, 10pt grey -- this layout has no footer.
//  4. BACKDROP  two crops of one image at 65.6% opacity behind the list.
//
// cfg.items accepts either a plain string or {number, topic, subs:[...]}:
//   items:[ 'Introduce the concept',
//           {number:'02', topic:'Present the approach',
//            subs:['Creative territory','Production plan']} ]
// Numbers auto-generate as 01, 02, 03... unless you supply one.
//
// CAPACITY: the list box gives 4.42in of inner height (4.63 less insets). A 30pt item costs 0.46in and
// a 15pt sub-bullet 0.23in, so 9 items with no subs, or fewer as subs are added.
// Overflow is dropped with a console warning rather than silently clipped.
function layout_tableOfContents(cfg) {
  var els = [];

  // 1 -- backdrop graphic (two crops of the same asset, behind everything)
  var backdrop = (cfg.assets && cfg.assets['thankyou_texture.png']) || A + 'backgrounds/thankyou_texture.png';
  els.push({ type:'img', src:backdrop, x:6.41, y:-0.01, w:6.93, h:3.25,
    transparency:34.4, crop:{ t:0.078, r:0.5902, b:0.6815 } });
  els.push({ type:'img', src:backdrop, x:3.67, y:3.24, w:9.67, h:4.28,
    transparency:34.4, crop:{ r:0.4283, b:0.6825 } });

  // 2 -- heading: grey subtitle over black title, one box, one paragraph
  els.push({ type:'t', x:0.29, y:0.43, w:2.81, h:0.72,
    font:'B', size:17, bold:true, caps:true, lineSpacing:0.9, charSpacing:0,
    color:'bodyGray', insets:{l:0.104,t:0.104,r:0.104,b:0.104},
    // Two paragraphs rather than one run carrying a newline: the source uses
    // <a:br/> inside a single paragraph, and at 90% line spacing two paragraphs
    // are visually identical -- but a literal \\n in a run is collapsed by HTML
    // in the preview and would silently join the two lines.
    paras:[
      { runs:[{ text:(cfg.subtitle || 'Subtitle'), color:'bodyGray' }] },
      { runs:[{ text:(cfg.title || 'Table of contents'), color:'black' }] }
    ]});

  // 3 -- the list
  var items = cfg.items || [];
  // Slide 22 sets the list box to 4.63in (the layout definition says 4.37);
  // the instance wins, per the demo-slide-authoritative rule. Inner height is
  // 4.63 less the 0.104in top and bottom insets.
  var paras = [], budget = 4.42, used = 0, dropped = 0;
  items.forEach(function (raw, i) {
    var it = (typeof raw === 'string') ? { topic: raw } : (raw || {});
    var num = it.number || ('0' + (i + 1)).slice(-2);
    var cost = 0.46 + ((it.subs || []).length * 0.23);
    if (used + cost > budget) { dropped++; return; }
    used += cost;
    paras.push({ runs:[
      { text:num, color:'bodyGray' },
      { text:' ' + (it.topic || ''), color:'black' }
    ]});
    (it.subs || []).forEach(function (sub) {
      paras.push({ runs:[{ text:sub, color:'black' }],
        size:15, marL:0.82, indent:-0.42,
        bullet:true, bulletSizePct:80, indentLevel:1 });
    });
  });
  if (dropped) {
    console.warn('[deck-layouts] tableOfContents: ' + dropped +
      ' item(s) did not fit the list box and were dropped.');
  }
  els.push({ type:'t', x:5.42, y:0.40, w:7.58, h:4.63,
    font:'B', size:30, bold:true, caps:false, lineSpacing:1.1, charSpacing:0,
    color:'bodyGray', insets:{l:0.104,t:0.104,r:0.104,b:0.104}, paras:paras });

  // 4 -- copy block, lower left. Replaces the footer on this layout.
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.29, y:6.33, w:4.02, h:0.89,
      font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, charSpacing:0,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  }
  return els;
}'''

OVERRIDES['castingGrid'] = '''
// Uniform 4-up casting grid. Wells pitch 2.80in, gutter 0.22in.
// cfg.items: [{ name:'Jane Doe' }, ...] x4
function layout_castingGrid(cfg) {
  var els = [];
  var items = cfg.items || [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:6.79, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:6.79, h:0.34,
    font:'HR', size:24, color:'titleGray', caps:true , lineSpacing:1 , charSpacing:2.64 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  var colX = [1.13, 3.93, 6.72, 9.52];
  for (var i = 0; i < 4; i++) {
    ph(els, cfg, colX[i], 2.15, 2.58, 2.72);
    els.push({ type:'t', text: 'Name: ' + ((items[i] && items[i].name) || ''),
      x:colX[i], y:4.98, w:1.70, h:0.59, font:'B', size:10, color:'captionGray' , caps:false, lineSpacing:1.2 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  }
  return els;
}'''

OVERRIDES['locationOverview'] = '''
// 5-across labelled location strip + 3 stacked extras beneath column 5.
// Wells pitch 2.70in, gutter 0.15in; column 1 bleeds off the left edge.
// Labels sit ABOVE their wells and are the only centred captions in the deck.
// cfg.items: [{ label:'WEEKEND GETAWAY' }, ...] x5
function layout_locationOverview(cfg) {
  var els = [];
  var items = cfg.items || [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:6.79, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  var labX = [-0.00, 2.66, 5.41, 8.05, 10.74];
  var phXs = [-0.01, 2.69, 5.37, 8.09, 10.79];
  for (var i = 0; i < 5; i++) {
    els.push({ type:'t', text:(items[i] && items[i].label) || '',
      x:labX[i], y:1.71, w:2.56, h:0.23,
      font:'B', size:9.5, color:'captionGray', align:'center', valign:'bottom',
      caps:true, lineSpacing:1.2 , charSpacing:0.95 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    ph(els, cfg, phXs[i], 2.01, 2.55, 1.53);
  }
  // Two extra wells stacked under column 5. The source also carries a third at
  // the SAME rectangle as the first (x:10.78 y:3.70) -- a duplicate, dropped here.
  ph(els, cfg, 10.78, 3.70, 2.55, 1.53);
  ph(els, cfg, 10.78, 5.41, 2.55, 1.53);
  return els;
}'''

OVERRIDES['moodboardProps'] = '''
// Dense prop grid on a #D5D5D5 field.
// Uses the LAYOUT's regular 5 x 2 caption grid (10 slots, pitch 2.58in).
// The demo slide (49) hand-nudges 11 captions over 17 images; that is one
// art director's overrides, not a spec. See MMW_Layout_Spec.md 12.4.
// cfg.captions: 10 strings, row-major (top row left->right, then bottom row)
function layout_moodboardProps(cfg) {
  var els = [];
  var caps = cfg.captions || [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:6.79, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:6.79, h:0.34,
    font:'HR', size:24, color:'titleGray', caps:true , lineSpacing:1 , charSpacing:2.64 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.notes) els.push({ type:'t', text:cfg.notes, x:7.78, y:0.54, w:4.95, h:0.89,
    font:'B', size:10, color:'bodyGray' , caps:false, lineSpacing:1.1 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });

  var colX = [0.61, 3.19, 5.77, 8.35, 10.94];
  var rows = [{ y:2.10, h:1.80, capY:3.95, capH:0.18 },
              { y:4.90, h:1.80, capY:6.73, capH:0.34 }];
  for (var r = 0; r < 2; r++) {
    for (var c = 0; c < 5; c++) {
      ph(els, cfg, colX[c], rows[r].y, 1.62, rows[r].h);
      els.push({ type:'t', text: caps[r * 5 + c] || '',
        x:colX[c], y:rows[r].capY, w:1.62, h:rows[r].capH,
        font:'B', size:6.5, color:'captionGray', caps:true , lineSpacing:1.2 , charSpacing:0.43 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    }
  }
  return els;
}'''

OVERRIDES['moodboardWardrobe'] = '''
// Character wardrobe board. Outfit filmstrip pitch 2.25in, gutter 0.09in.
// cfg.items: 4 outfit photo wells (no per-photo captions in the source)
function layout_moodboardWardrobe(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9 , insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:1.93, w:3.65, h:0.69,
    font:'H', size:35, color:'bodyGray', caps:true , lineSpacing:0.8 , charSpacing:-0.7 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.subtitle) els.push({ type:'t', text:cfg.subtitle, x:0.61, y:2.82, w:3.65, h:0.69,
    font:'B', size:13, color:'black' , caps:false, lineSpacing:1 , charSpacing:0.52 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.text) els.push({ type:'t', text:cfg.text, x:0.61, y:3.51, w:3.65, h:1.76,
    font:'B', size:10, color:'bodyGray' , caps:false, lineSpacing:1.1 , insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  var outfitX = [4.50, 6.75, 9.01, 11.26];
  for (var i = 0; i < 4; i++) ph(els, cfg, outfitX[i], 1.60, 2.16, 3.67);
  // three fixed accessory wells, lower right
  ph(els, cfg, 9.35, 3.62, 1.40, 2.10);
  ph(els, cfg, 11.69, 3.80, 1.19, 1.78);
  ph(els, cfg, 11.72, 5.51, 1.15, 0.95);
  if (cfg.accessoryCaption) els.push({ type:'t', text:cfg.accessoryCaption,
    x:11.63, y:6.49, w:1.33, h:0.35, font:'B', size:8, color:'titleGray' , caps:false, lineSpacing:0.7 , charSpacing:0.08 , insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  return els;
}'''

# ---------------------------------------------------------------------------
# REPORT CANVASES
#
# "Content Gray" backs 13 slides and "Content Dark" 8, and they are NOT one
# composition each: the layout defines only a chassis (eyebrow / title / intro)
# and every slide draws its own content below it. Pinning one slide as the
# example gave reportGray slide 72's specific campaign timeline -- nine item
# slots at hardcoded coordinates that mean nothing on a chart slide.
#
# So the base layout is the chassis alone, and the recurring compositions are
# separate named variants. What actually recurs across those 21 slides:
#
#   chart well   9 slides  (83,84,85,88 / 79,80,81,82,93,94)  <- the big one
#   table well   3 slides  (76,78 / 77)
#   timeline     1 slide   (72) -- but it is the family's signature graphic
#   one-offs     8 slides  -- these are what the bare chassis is for
# ---------------------------------------------------------------------------

_CHASSIS = '''
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
'''

def _canvas(fn, extra=''):
    return "\nfunction layout_%s(cfg) {\n  var els = [];%s%s\n  return els;\n}\n" % (fn, _CHASSIS, extra)

# Bare chassis. Everything below the intro line is yours -- pass cfg.els for a
# one-off composition, exactly as the template's own one-off slides do.
OVERRIDES['reportGray'] = _canvas('reportGray')
OVERRIDES['reportDark'] = _canvas('reportDark')

# Chart well: x=0.78 y=2.22 w=11.50 h=4.36, identical on the gray and dark
# slides. cfg.chart = { type, data, opts } -- the engine renders and exports it.
_CHART = '''
  els.push({ type:'chart', x:0.78, y:2.22, w:11.5, h:4.36,
    chartType:(cfg.chart && cfg.chart.type) || 'bar',
    data:(cfg.chart && cfg.chart.data) || [],
    opts:(cfg.chart && cfg.chart.opts) || {} });
'''
OVERRIDES['reportGrayChart'] = _canvas('reportGrayChart', _CHART)
OVERRIDES['reportDarkChart'] = _canvas('reportDarkChart', _CHART)

# Table well: x=0.64 y=2.04 w=12.06 h=4.72, again identical in both colourways.
_TABLE = '''
  els.push({ type:'tbl', x:0.64, y:2.04, w:12.06, h:4.72,
    headers:cfg.headers || [], rows:cfg.rows || [], colW:cfg.colW });
'''
OVERRIDES['reportGrayTable'] = _canvas('reportGrayTable', _TABLE)
OVERRIDES['reportDarkTable'] = _canvas('reportDarkTable', _TABLE)

# Timeline. The graphic is not an embedded image -- slide 72 draws it as 36
# stroked bezier shapes inside a group, so there is no media part to extract.
# tools/render_vector_group.py redraws it from the path data into a transparent
# PNG; that asset is what this variant places. Milestone labels sit on the flow
# at the source slide's own positions, with the "we are here" marker last.
_TIMELINE = '''
  els.push({ type:'img', src:(cfg.assets && cfg.assets['report_timeline_flow.png'])
    || A + 'backgrounds/report_timeline_flow.png',
    x:-0.86, y:2.69, w:14.99, h:3.51 });
  var marks = cfg.milestones || cfg.items || [];
  var MX = [3.08, 4.58, 8.02, 11.39, 0.49, 3.08, 6.09, 10.11];
  var MY = [2.82, 5.79, 5.79, 5.79, 6.67, 6.67, 6.67, 6.67];
  for (var i = 0; i < MX.length && i < marks.length; i++) {
    els.push({ type:'t', text:marks[i], x:MX[i], y:MY[i], w:1.73, h:0.52,
      font:'B', size:10, color:'bodyGray', align:'center', caps:false, lineSpacing:1,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  }
  els.push({ type:'s', x:3.94, y:3.33, w:0.01, h:0.6,  fill:'ltGray' });
  els.push({ type:'s', x:3.94, y:5.14, w:0.01, h:1.58, fill:'ltGray' });
  els.push({ type:'s', x:6.96, y:4.91, w:0.01, h:1.79, fill:'ltGray' });
  els.push({ type:'s', x:10.98, y:4.75, w:0.01, h:1.95, fill:'ltGray' });
  els.push({ type:'s', x:1.35, y:6.41, w:0.01, h:0.29, fill:'ltGray' });
  if (cfg.hereLabel !== false) els.push({ type:'o', x:3.8, y:4.3, w:0.29, h:0.29, fill:'accent' });
'''
OVERRIDES['reportGrayTimeline'] = _canvas('reportGrayTimeline', _TIMELINE)

# ---------------------------------------------------------------------------
# REPORT SPLIT PANELS  (source slide 73)
#
# A staged progress bar: four right-aligned pills of decreasing length, each
# carrying a short stage label, with milestone callouts connected by
# double-headed arrows above and below, and a "we are here" marker pinned to
# the tan dot on the final (black) bar.
#
# Everything below is measured off slide 73:
#   pills      y=4.09 h=0.71, right edge 12.73, roundRect adj=50000 -> full pill
#   labels     31pt template = 15.5pt engine, bold, tracking 13.95 -> 6.97
#              tan bar -> paper text, light -> tan, dark grey -> paper, black -> tan
#   connectors 3pt template = 1.5pt engine, headEnd AND tailEnd triangle
#   callouts   header 20pt template = 10pt engine on #CAA380, copy 10pt bodyGray
#
# The stage labels are sized for SHORT strings -- the source uses years ("2022").
# The box is 1.73in and the template relies on spAutoFit to grow it, which the
# engine does not do, so a long label overflows rather than shrinking.
# ---------------------------------------------------------------------------

OVERRIDES['reportSplitPanels'] = '''
  // chassis
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // staged pills, right-aligned and decreasing. Label colour is fixed by the
  // bar it sits on, so a caller cannot accidentally put tan text on tan.
  var BARS = [
    { x:0.94, w:11.79, fill:'accentDim', lx:1.07, label:'paper'     },
    { x:3.37, w:9.36,  fill:'paper',     lx:3.42, label:'accentDim' },
    { x:5.77, w:6.96,  fill:'bodyGray',  lx:5.80, label:'paper'     },
    { x:8.31, w:4.42,  fill:'asphalt',   lx:8.55, label:'accentDim' }
  ];
  var stages = cfg.stages || [];
  BARS.forEach(function (b, i) {
    els.push({ type:'s', x:b.x, y:4.09, w:b.w, h:0.71, fill:b.fill, radius:'pill' });
    if (stages[i]) els.push({ type:'t', text:stages[i], x:b.lx, y:4.16, w:1.73, h:0.56,
      font:'B', size:15.5, color:b.label, bold:true, valign:'middle', caps:true,
      lineSpacing:1, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  });

  // Milestone callouts. Two sit above the bar and two below; each is a
  // double-headed connector with a header and copy beneath it. Anything past
  // the fourth is ignored rather than stacking off the slide.
  var SLOTS = [
    { lx:4.70, ly:1.91, hy:1.93, cy:2.30 },
    { lx:9.09, ly:1.91, hy:1.93, cy:2.30 },
    { lx:2.50, ly:4.92, hy:5.53, cy:5.90 },
    { lx:6.89, ly:4.92, hy:5.53, cy:5.90 }
  ];
  (cfg.milestones || []).slice(0, 4).forEach(function (m, i) {
    var s = SLOTS[i];
    els.push({ type:'ln', x:s.lx, y:s.ly, w:0, h:2.06,
      color:'bodyGray', weight:1.5, arrows:'both' });
    els.push({ type:'t', text:m.header || m.title || '', x:s.lx + 0.01, y:s.hy, w:1.73, h:0.52,
      font:'B', size:10, color:'#CAA380', bold:true, caps:false, lineSpacing:1,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
    els.push({ type:'t', text:m.copy || m.text || '', x:s.lx + 0.01, y:s.cy, w:1.73, h:1.06,
      font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  });

  // "We are here": tan dot on the black bar, its own tan connector, its label.
  // Always tied to the dot -- it is a position marker, not a milestone.
  if (cfg.hereLabel !== false) {
    els.push({ type:'o', x:10.33, y:4.25, w:0.37, h:0.37, fill:'accentDim' });
    els.push({ type:'ln', x:10.52, y:4.91, w:0, h:0.37,
      color:'accentDim', weight:1.5, arrows:'both' });
    els.push({ type:'t', text:(typeof cfg.hereLabel === 'string' ? cfg.hereLabel : 'We are here'),
      x:9.65, y:5.23, w:1.73, h:0.36, font:'B', size:10, color:'accentDim',
      align:'center', valign:'bottom', caps:false, lineSpacing:1,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  }
'''
OVERRIDES['reportSplitPanels'] = "\nfunction layout_reportSplitPanels(cfg) {\n  var els = [];" + OVERRIDES['reportSplitPanels'] + "  return els;\n}\n"

# ---------------------------------------------------------------------------
# REPORT STAT ROW  (source slide 74; slide 75 is identical)
#
# A 6-column grid: one white section-label column on the left, then five
# numbered content columns. Three horizontal bands, separated by 1pt rules,
# each band being [label | five cells].
#
# Measured off slide 74:
#   header    23.8pt engine, #FFFFFF, tracking -0.475, TYPED in caps
#   numbers   28pt engine, #CAA380, at x 1.66 / 4.01 / 6.36 / 8.72 / 11.07
#   labels    12pt engine, #EEEEEE, x=0.24 w=1.78  (the white left column)
#   copy      10pt engine, alternating #808080 -> #CAA380 -> #808080 by band
#   rules     y=2.99 and y=4.50, x=0.18 w=12.97, 1pt template = 0.5pt engine,
#             colour #7F6751
#
# CAPACITY IS FIXED. Five content columns and three bands, no overflow rule and
# no spare space -- the grid is the design. Column headers are NUMBERS in the
# source ("1".."5"); a long heading wraps, grows the row and shears the grid,
# so anything past a few characters is refused rather than allowed to break the
# slide. Extra columns or bands are dropped, not stacked.
#
# This layout carries NO FOOTER -- see NO_FOOTER_LAYOUTS in standard-deck.js.
# ---------------------------------------------------------------------------

def _stat_row(fn, header_col, label_col):
    """Both colourways of source slides 74 (dark) and 75 (light).

    Only two colours differ, so they share one builder -- keeping them apart
    invites the two halves of a pair drifting, which is exactly what happened to
    the two-row layouts. Everything else is identical: the numbers stay #CAA380,
    the copy still alternates #808080 / #CAA380, the rules stay #7F6751."""
    return ("\nfunction layout_%s(cfg) {\n  var els = [];" % fn) + \
        _STAT_ROW_BODY.replace('__HEADER__', header_col).replace('__LABEL__', label_col) + \
        "  return els;\n}\n"

_STAT_ROW_BODY = '''
  var COLX  = [1.66, 4.01, 6.36, 8.72, 11.07];
  var BANDS = [
    { label:1.92, copy:2.28, h:0.65, color:'bodyGray' },
    { label:3.23, copy:3.59, h:0.85, color:'#CAA380' },
    { label:4.89, copy:5.21, h:1.94, color:'bodyGray' }
  ];

  // Header. Typed uppercase in the source with no cap attribute, so the engine
  // is told explicitly rather than left to guess.
  els.push({ type:'t', text:cfg.title || cfg.subhead || '', x:0.46, y:0.38, w:12.4, h:0.5,
    font:'H', size:23.8, color:'__HEADER__', caps:true, lineSpacing:1, charSpacing:-0.475,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });

  // Column headers. Numbers in the source; keep them short or the grid shears.
  var cols = (cfg.columns || []).slice(0, COLX.length);
  cols.forEach(function (c, i) {
    els.push({ type:'t', text:String(c), x:COLX[i], y:1.21, w:0.86, h:0.65,
      font:'H', size:28, color:'#CAA380', caps:true, lineSpacing:1,
      insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  });

  // Bands: section label on the left, then one cell per column. Cell colour is
  // set by the band so the horizontal reading alternates, which is what
  // separates the sections visually -- it is not a per-cell choice.
  (cfg.sections || []).slice(0, BANDS.length).forEach(function (sec, r) {
    var band = BANDS[r];
    els.push({ type:'t', text:sec.label || '', x:0.24, y:band.label, w:1.78, h:0.29,
      font:'B', size:12, color:'__LABEL__', caps:false, lineSpacing:1,
      insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
    (sec.cells || []).slice(0, COLX.length).forEach(function (cell, i) {
      els.push({ type:'t', text:cell, x:COLX[i], y:band.copy, w:1.73, h:band.h,
        font:'B', size:10, color:band.color, caps:false, lineSpacing:1.1,
        insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    });
    // rule under every band except the last
    if (r < BANDS.length - 1) {
      els.push({ type:'s', x:0.18, y:(r === 0 ? 2.99 : 4.5), w:12.97, h:0.007,
        fill:'#7F6751' });
    }
  });
'''

# slide 74: white header on the dark ground, paper section labels
OVERRIDES['reportStatRow']      = _stat_row('reportStatRow', 'white', 'paper')
# slide 75: same grid on #EEEEEE -- header drops to bodyGray, labels to asphalt
OVERRIDES['reportStatRowLight'] = _stat_row('reportStatRowLight', 'bodyGray', 'asphalt')

# ---------------------------------------------------------------------------
# REPORT SPEND BARS  (source slides 86 light / 87 dark)
#
# Six pill bars of data-driven length, each carrying a subhead, two bullet
# points, and a value circle pinned to its right end.
#
# Measured off slide 86:
#   rows      y = 2.02 2.83 3.65 4.46 5.28 6.09, bar h=0.76, roundRect adj=50000
#   track     x=0.52, longest bar 12.28 -> right edge 12.80
#   subhead   x=0.82, +0.09 from bar top, 14pt engine (28pt source), #FFFFFF.
#             The source sets cap="none" EXPLICITLY -- it is a brand name typed
#             in caps, not a cased role -- so casing is left to the caller.
#   bullets   x=0.84, +0.29, 8pt engine (16pt source), buChar bullet,
#             marL 0.125in / indent -0.125in, exactly TWO paragraphs
#   circle    outer 0.75 solid in the bar's colour with a white outline;
#             inner 0.61 centred inside it, gradient #EEEEEE -> #A3A3A3 at 45
#             degrees with an #EEEEEE outline, holding the value at 10pt
#
# The two colourways differ ONLY in the sixth bar: black on the light ground,
# purple #57517E on the dark one (black would disappear on asphalt).
# ---------------------------------------------------------------------------

_SPEND_BODY = '''
  var ROWY  = [2.02, 2.83, 3.65, 4.46, 5.28, 6.09];
  var TRACK_X = 0.52, TRACK_W = 12.28, MIN_W = 4.22;
  var PALETTE = [__PALETTE__];

  // chassis
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // Six rows, no more: the track is a fixed grid with no overflow rule.
  (cfg.bars || []).slice(0, ROWY.length).forEach(function (bar, i) {
    var y = ROWY[i];
    var pct = (typeof bar.pct === 'number') ? Math.max(0, Math.min(1, bar.pct)) : 1;
    var w = Math.max(MIN_W, TRACK_W * pct);
    var fill = bar.color || PALETTE[i % PALETTE.length];

    els.push({ type:'s', x:TRACK_X, y:y, w:w, h:0.76, fill:fill, radius:'pill' });

    if (bar.label) els.push({ type:'t', text:bar.label, x:0.82, y:y + 0.09, w:1.47, h:0.24,
      font:'B', size:14, color:'white', caps:false, lineSpacing:1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

    // Exactly two supporting points -- the bar is 0.76in tall and the copy well
    // is 0.38in, which is two lines at 8pt. A third would overrun the pill.
    var pts = (bar.points || []).slice(0, 2);
    if (pts.length) els.push({ type:'t', x:0.84, y:y + 0.29, w:3.16, h:0.38,
      font:'B', size:8, color:'white', caps:false, lineSpacing:1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028},
      paras: pts.map(function (t) {
        return { runs:[{ text:t }], bullet:true, marL:0.125, indent:-0.125 };
      }) });

    // Value circle, right-aligned inside the bar.
    var cx = TRACK_X + w - 0.75;
    // No outline on the outer disc: the source sets <a:noFill/> on its line.
    // The white ring the design reads as is the inner circle's own #EEEEEE
    // stroke -- adding one here doubles it.
    els.push({ type:'o', x:cx, y:y + 0.005, w:0.75, h:0.75, fill:fill });
    els.push({ type:'o', x:cx + 0.07, y:y + 0.075, w:0.61, h:0.61,
      gradient:{ from:'#EEEEEE', to:'#A3A3A3', angle:45 },
      stroke:'#EEEEEE', strokeWidth:2.5 });
    if (bar.value) els.push({ type:'t', text:bar.value, x:cx + 0.07, y:y + 0.075, w:0.61, h:0.61,
      font:'B', size:10, color:'asphalt', align:'center', valign:'middle',
      caps:false, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
  });
'''

def _spend(fn, palette):
    return ("\nfunction layout_%s(cfg) {\n  var els = [];" % fn) + \
        _SPEND_BODY.replace('__PALETTE__', ', '.join("'%s'" % c for c in palette)) + \
        "  return els;\n}\n"

# Light: the sixth bar is black. Dark: purple, because black vanishes on asphalt.
OVERRIDES['reportSpendBarsLight'] = _spend('reportSpendBarsLight',
    ['#416986', '#86ABBF', '#4A634D', '#BFA588', '#808080', '#262626'])
OVERRIDES['reportSpendBarsDark'] = _spend('reportSpendBarsDark',
    ['#416986', '#86ABBF', '#4A634D', '#BFA588', '#808080', '#57517E'])

# ---------------------------------------------------------------------------
# REPORT MODEL COMPARE  (source slide 89)
#
# A spanning matrix, not a fixed composition. Four funnel-stage rows down the
# left; each entry is an outlined box that spans however many rows and columns
# it applies to. On slide 89: CX-5 covers all four stages so it is a full-height
# column; CX-90/CX-70 and CX-50 cover the lower three; CX-30 and M3/MX-5 the
# lower two; Brand covers only the top stage but spans four columns, so it is
# wide and squat. The spans ARE the content -- they say what applies where.
#
# Measured off slide 89:
#   row bands  top 1.13 / 2.61 / 4.02 / 5.41, bottom 2.46 / 3.89 / 5.28 / 6.80
#   stage chip x=1.53 w=0.60, fills A6A6A6 7F7F7F 595959 404045 (darkening down
#              the funnel), label 10pt #FFFFFF centred, NO outline
#   section    x=0.25 w=1.34 h=1.00 centred in its band, outline #BFA588 0.5pt,
#              label 11pt #BFA588 left-aligned
#   columns    x 2.27 / 4.59 / 6.91 / 9.26 / 11.24, w 2.21 / 2.21 / 2.23 / 1.86
#              / 1.68 -- right edge 12.92
#   entry box  outline #808080 0.25pt, no fill; title 16pt bold #FFFFFF,
#              body 10pt #808080, inset +0.05 x / +0.19 y from the box
#
# NOTE: the entry outlines read as white on the dark ground but are #808080 in
# the source. Using the source value.
# ---------------------------------------------------------------------------

OVERRIDES['reportModelCompare'] = '''
  var ROW_T = [1.13, 2.61, 4.02, 5.41];
  var ROW_B = [2.46, 3.89, 5.28, 6.80];
  var COL_X = [2.27, 4.59, 6.91, 9.26, 11.24];
  var COL_W = [2.21, 2.21, 2.23, 1.86, 1.68];
  var CHIP  = ['#A6A6A6', '#7F7F7F', '#595959', '#404045'];

  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.title) els.push({ type:'t', text:cfg.title, x:0.25, y:0.38, w:12.4, h:0.5,
    font:'H', size:23.8, color:'white', caps:true, lineSpacing:1, charSpacing:-0.475,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });

  // Four funnel stages: a darkening chip and a tan-outlined section label.
  (cfg.stages || []).slice(0, 4).forEach(function (st, r) {
    var top = ROW_T[r], bot = ROW_B[r], mid = (top + bot) / 2;
    els.push({ type:'s', x:1.53, y:top, w:0.6, h:bot - top, fill:CHIP[r] });
    if (st.code) els.push({ type:'t', text:st.code, x:1.58, y:mid - 0.13, w:0.5, h:0.26,
      font:'B', size:10, color:'white', align:'center', valign:'middle',
      caps:false, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
    els.push({ type:'s', x:0.25, y:mid - 0.5, w:1.34, h:1, fill:'none',
      stroke:'#BFA588', strokeWidth:0.5 });
    if (st.label) els.push({ type:'t', text:st.label, x:0.43, y:mid - 0.42, w:1.12, h:0.84,
      font:'B', size:11, color:'#BFA588', caps:false, lineSpacing:1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  });

  // Entries span whatever they apply to. col/row are 0-based indices into the
  // grids above; colSpan/rowSpan default to 1. Out-of-range spans are clamped
  // rather than drawn off the slide.
  (cfg.entries || []).forEach(function (e) {
    var c0 = Math.max(0, Math.min(COL_X.length - 1, e.col || 0));
    var c1 = Math.max(c0, Math.min(COL_X.length - 1, c0 + (e.colSpan || 1) - 1));
    var r0 = Math.max(0, Math.min(ROW_T.length - 1, e.row || 0));
    var r1 = Math.max(r0, Math.min(ROW_T.length - 1, r0 + (e.rowSpan || 1) - 1));
    var x = COL_X[c0], w = COL_X[c1] + COL_W[c1] - COL_X[c0];
    var y = ROW_T[r0], h = ROW_B[r1] - ROW_T[r0];

    els.push({ type:'s', x:x, y:y, w:w, h:h, fill:'none',
      stroke:'#808080', strokeWidth:0.25 });

    var paras = [];
    if (e.label) paras.push({ runs:[{ text:e.label, size:16, bold:true, color:'white' }] });
    if (e.copy)  paras.push({ runs:[{ text:e.copy,  size:10, color:'bodyGray' }] });
    if (paras.length) els.push({ type:'t', x:x + 0.05, y:y + 0.19, w:w - 0.10, h:h - 0.28,
      font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:paras });
  });
'''
OVERRIDES['reportModelCompare'] = "\nfunction layout_reportModelCompare(cfg) {\n  var els = [];" + OVERRIDES['reportModelCompare'] + "  return els;\n}\n"

# ---------------------------------------------------------------------------
# REPORT BRAND PILLARS  (source slide 90)
#
# A strategy-on-a-page: four labelled rows down the left, two numbered sections
# across the top, three outlined pillar boxes, a target band, a filled pivot
# bar, and a pair of outcomes under a rule.
#
# Measured off slide 90:
#   channel pills  x=11.92 w=0.98, y 0.43 / 0.84 / 1.26, roundRect adj=16667
#                  (radius = 16.667% of the short side), fills CAA380 / BFBFBF /
#                  DDDBC5, label 11pt #FFFFFF centred, no outline
#   row labels     x=0.72 w=1.84, 11pt -- white for the first three, #CAA380 for
#                  STRATEGIC OUTCOMES
#   top sections   number 60pt bold #D9D9D9; header 14pt #FFFFFF with a 10pt
#                  parenthetical beneath; a 0.91in tan rule divides the two
#   pillars        3 boxes y=3.07 h=1.36, outline #CAA380 0.5pt, no fill;
#                  header 20pt #CFB496 over body 10pt #808080
#   targets        12pt #FFFFFF centred -- the MIDDLE one is italic, the outer
#                  two are not
#   pivot bar      x=2.88 y=5.39 w=8.34 h=0.48, fill #D6B781, outline #CAA380
#                  1pt; label 12pt bold #FFFFFF then body 12pt #000000
#   rule           x=2.88 y=5.94 w=8.34, #CAA380
#   outcomes       13pt #CAA380, mixed case, at the outer columns
#
# Columns for the pillar / target / outcome rows: x 2.73 / 5.48 / 8.38,
# w 2.68 / 2.83 / 2.83.
# ---------------------------------------------------------------------------

OVERRIDES['reportBrandPillars'] = '''
  var COL_X = [2.73, 5.48, 8.38];
  var COL_W = [2.68, 2.83, 2.83];
  var PILL_FILL = ['#CAA380', '#BFBFBF', '#DDDBC5'];
  var PILL_Y = [0.43, 0.84, 1.26];

  if (cfg.title) els.push({ type:'t', text:cfg.title, x:0.72, y:0.38, w:10.9, h:0.5,
    font:'H', size:23.8, color:'white', caps:true, lineSpacing:1, charSpacing:-0.475,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });

  // Channel chips, top right. Rounded corners: adj=16667 is 16.667% of the
  // short side, which on a 0.32in chip is a 0.053in radius -- not a full pill.
  (cfg.channels || []).slice(0, 3).forEach(function (ch, i) {
    els.push({ type:'s', x:11.92, y:PILL_Y[i], w:0.98, h:0.32,
      fill:PILL_FILL[i], radius:0.32 * 0.16667 });
    els.push({ type:'t', text:ch, x:11.92, y:PILL_Y[i] + 0.02, w:0.98, h:0.28,
      font:'B', size:11, color:'white', align:'center', valign:'middle',
      caps:false, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
  });

  // Left row labels. Typed in caps in the source, so caps is set explicitly.
  var LBL_Y = [2.02, 3.38, 4.80, 5.87];
  (cfg.rowLabels || []).slice(0, 4).forEach(function (t, i) {
    els.push({ type:'t', text:t, x:0.72, y:LBL_Y[i], w:1.84, h:0.46,
      font:'B', size:11, color:(i === 3 ? '#CAA380' : 'white'), caps:true,
      lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  });

  // Two numbered sections across the top, split by a tan rule.
  var SEC = [{ n:2.74, h:3.33, hw:3.64 }, { n:7.54, h:8.22, hw:2.94 }];
  (cfg.sections || []).slice(0, 2).forEach(function (s, i) {
    var g = SEC[i];
    els.push({ type:'t', text:String(i + 1), x:g.n, y:1.83, w:1.35, h:0.93,
      font:'H', size:60, color:'#D9D9D9', bold:true, caps:false, lineSpacing:1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
    var paras = [];
    if (s.header) paras.push({ runs:[{ text:s.header, size:14, color:'white' }] });
    if (s.sub)    paras.push({ runs:[{ text:s.sub,    size:10, color:'white' }] });
    if (paras.length) els.push({ type:'t', x:g.h, y:2.0, w:g.hw, h:0.7,
      font:'B', size:14, color:'white', caps:true, lineSpacing:1.1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:paras });
  });
  if ((cfg.sections || []).length > 1)
    els.push({ type:'s', x:6.82, y:1.9, w:0.008, h:0.91, fill:'#CAA380' });

  // Three outlined pillars.
  (cfg.pillars || []).slice(0, 3).forEach(function (p, i) {
    els.push({ type:'s', x:COL_X[i], y:3.07, w:COL_W[i], h:1.36, fill:'none',
      stroke:'#CAA380', strokeWidth:0.5 });
    var paras = [];
    if (p.header) paras.push({ runs:[{ text:p.header, size:20, color:'#CFB496' }] });
    if (p.copy)   paras.push({ runs:[{ text:p.copy,   size:10, color:'bodyGray' }] });
    if (paras.length) els.push({ type:'t', x:COL_X[i] + 0.03, y:3.19, w:COL_W[i] - 0.08, h:1.12,
      font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:paras });
  });

  // Target row -- no outline. The middle entry is italic in the source; the
  // outer two are not, so the emphasis is positional, not per-entry.
  (cfg.targets || []).slice(0, 3).forEach(function (t, i) {
    if (!t) return;
    els.push({ type:'t', text:t, x:COL_X[i], y:4.7, w:COL_W[i], h:0.68,
      font:'B', size:12, color:'white', align:'center', valign:'middle',
      italic:(i === 1), caps:false, lineSpacing:1.1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  });

  // Filled pivot bar, then the rule beneath it.
  if (cfg.pivot) {
    els.push({ type:'s', x:2.88, y:5.39, w:8.34, h:0.48, fill:'#D6B781',
      stroke:'#CAA380', strokeWidth:1 });
    var pv = [];
    if (cfg.pivot.label) pv.push({ runs:[{ text:cfg.pivot.label + ': ', size:12, bold:true, color:'white' }] });
    if (cfg.pivot.copy)  pv.push({ runs:[{ text:cfg.pivot.copy, size:12, color:'black' }] });
    if (pv.length && pv.length === 2) {
      pv = [{ runs:[{ text:cfg.pivot.label + ': ', size:12, bold:true, color:'white' },
                    { text:cfg.pivot.copy, size:12, color:'black' }] }];
    }
    els.push({ type:'t', x:2.93, y:5.39, w:8.23, h:0.48,
      font:'B', size:12, color:'white', align:'center', valign:'middle',
      caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:pv });
    els.push({ type:'s', x:2.88, y:5.94, w:8.34, h:0.008, fill:'#CAA380' });
  }

  // Outcomes, one per column; pass a falsy entry to leave a column empty.
  // The source fills the outer two and leaves the middle open.
  (cfg.outcomes || []).slice(0, 3).forEach(function (t, i) {
    if (!t) return;
    els.push({ type:'t', text:t, x:COL_X[i] + 0.06, y:6.03, w:COL_W[i] - 0.12, h:0.52,
      font:'B', size:13, color:'#CAA380', caps:false, lineSpacing:1.1,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  });
'''
OVERRIDES['reportBrandPillars'] = "\nfunction layout_reportBrandPillars(cfg) {\n  var els = [];" + OVERRIDES['reportBrandPillars'] + "  return els;\n}\n"

# ---------------------------------------------------------------------------
# REPORT PLATFORM MATRIX  (source slide 91)  -- hub-and-spoke ecosystem
#
# A central platform hub ringed by campaign spokes, each spoke paired with a
# descriptive box tucked PARTLY BEHIND its circle so the two read as linked.
# Optional category chips down the left say what the diagram applies to.
#
# Measured off slide 91:
#   header   35pt, centred, gray, caps, Mazda Type Bold, 80% line spacing
#   hub      outer 1.73 circle #EEEEEE / #7F7F7F 1pt; inner 1.41 #EEEEEE /
#            #BFA588 0.5pt; label 10.5pt over a 20.5pt name, #262626
#   spoke    outer 1.21 #EFF0F3 / #BFA588 0.5pt; inner 0.88 #EEEEEE / #90A291
#            2.5pt; label 7pt #262626 centred
#   box      2.22 x 1.00 roundRect adj=11779 (0.118in radius), outline #9B9B9B
#            1pt, no fill; heading 6pt bold over 6pt body, #7F7F7F
#   spokes   ring the hub on an ELLIPSE, rx 3.0 / ry 2.35 -- wider than tall
#   connect  0.38pt #7F7F7F, hub edge to spoke edge
#   category circle 0.54 outlined #FFFFFF 1pt, 7pt caps label, bullet text beside
#
# The source's eight spokes are hand-placed at uneven angles; here they are
# distributed evenly so any count rings the hub cleanly. Boxes sit on the OUTER
# side of their spoke (left half -> box left, right half -> box right) and are
# pushed BEFORE the circle so the circle overlaps them, which is what makes the
# pairing read.
# ---------------------------------------------------------------------------

OVERRIDES['reportPlatformMatrix'] = '''
  var HX = 6.665, HY = 3.75, RX = 3.0, RY = 2.35;
  var SPOKE_R = 0.605, BOX_W = 2.22, BOX_H = 1.0, OVERLAP = 0.35;
  var MAX_SPOKES = 8;

  if (cfg.title) els.push({ type:'t', text:cfg.title, x:3.81, y:0.23, w:5.71, h:0.64,
    font:'H', size:35, color:'bodyGray', align:'center', caps:true, lineSpacing:0.8,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });

  // Capacity. Boxes are 2.22 x 1.00 and stack on the outer side of their spoke;
  // the ring spans 4.7in vertically, so about four boxes fit per side before
  // they collide. Eight is therefore the ceiling -- which is exactly what the
  // source uses. Extras are dropped rather than allowed to overlap.
  var spokes = cfg.spokes || [];
  if (spokes.length > MAX_SPOKES) {
    console.warn('[deck-layouts] reportPlatformMatrix takes at most ' + MAX_SPOKES +
      ' spokes; ' + (spokes.length - MAX_SPOKES) + ' dropped. More would overlap.');
    spokes = spokes.slice(0, MAX_SPOKES);
  }
  var n = spokes.length;

  // Connectors first, so every disc paints over them.
  var pos = spokes.map(function (s, i) {
    var a = -Math.PI / 2 + (2 * Math.PI * i) / (n || 1);
    return { a:a, x:HX + RX * Math.cos(a), y:HY + RY * Math.sin(a), left:Math.cos(a) < 0 };
  });
  pos.forEach(function (p) {
    els.push({ type:'ln', x:HX, y:HY, w:p.x - HX, h:p.y - HY,
      color:'#7F7F7F', weight:0.38 });
  });

  // Box slots, de-collided per side. Two spokes on the same side can land
  // closer together than a box is tall, so each side is walked top-down and any
  // box that would touch its predecessor is pushed clear.
  var used = { left:[], right:[] };
  pos.forEach(function (p, i) {
    var side = p.left ? 'left' : 'right';
    var by = p.y - SPOKE_R + 0.47;
    used[side].forEach(function (prev) {
      if (Math.abs(by - prev) < BOX_H + 0.06) by = prev + BOX_H + 0.06;
    });
    by = Math.max(0.95, Math.min(7.5 - BOX_H - 0.1, by));
    used[side].push(by);
    p.by = by;
  });

  pos.forEach(function (p, i) {
    var s = spokes[i];
    if (s.header || s.copy) {
      var bx = p.left ? (p.x - SPOKE_R + OVERLAP - BOX_W) : (p.x + SPOKE_R - OVERLAP);
      bx = Math.max(0.1, Math.min(13.33 - BOX_W - 0.1, bx));
      els.push({ type:'s', x:bx, y:p.by, w:BOX_W, h:BOX_H, fill:'none',
        stroke:'#9B9B9B', strokeWidth:1, dash:'dot', radius:0.118 });
      var paras = [];
      if (s.header) paras.push({ runs:[{ text:s.header, size:6, bold:true }] });
      if (s.copy)   paras.push({ runs:[{ text:s.copy,   size:6 }] });
      els.push({ type:'t', x:bx + (p.left ? 0.08 : 0.42), y:p.by + 0.1,
        w:BOX_W - 0.5, h:BOX_H - 0.2,
        font:'B', size:6, color:'#7F7F7F', caps:false, lineSpacing:1.15,
        insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:paras });
    }

    // Outer ring is DASHED; the inner disc is solid and carries the shadow.
    els.push({ type:'o', x:p.x - 0.605, y:p.y - 0.605, w:1.21, h:1.21,
      fill:'#EFF0F3', stroke:'#BFA588', strokeWidth:0.5, dash:'dash' });
    els.push({ type:'o', x:p.x - 0.44, y:p.y - 0.44, w:0.88, h:0.88,
      fill:'#EEEEEE', stroke:'#90A291', strokeWidth:2.5, shadow:true });
    if (s.label) els.push({ type:'t', text:s.label, x:p.x - 0.44, y:p.y - 0.44, w:0.88, h:0.88,
      font:'B', size:7, color:'asphalt', align:'center', valign:'middle',
      caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
  });

  // Hub, last, so it wins every overlap. Both discs are solid and shadowed.
  els.push({ type:'o', x:HX - 0.865, y:HY - 0.86, w:1.73, h:1.72,
    fill:'#EEEEEE', stroke:'#7F7F7F', strokeWidth:1, shadow:true });
  els.push({ type:'o', x:HX - 0.705, y:HY - 0.7, w:1.41, h:1.4,
    fill:'#EEEEEE', stroke:'#BFA588', strokeWidth:0.5, shadow:true });
  if (cfg.hub) els.push({ type:'t', x:HX - 0.705, y:HY - 0.7, w:1.41, h:1.4,
    font:'B', size:10.5, color:'asphalt', align:'center', valign:'middle',
    caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02},
    paras:[{ runs:[{ text:cfg.hub.label || '', size:10.5 }] },
           { runs:[{ text:cfg.hub.name || '', size:20.5 }] }] });

  // Category chips: light-grey gradient disc, white outline, black label, with
  // #7F7F7F bullet text beside it.
  (cfg.categories || []).slice(0, 6).forEach(function (c, i) {
    var cy = 1.04 + i * 0.79;
    els.push({ type:'o', x:0.18, y:cy, w:0.54, h:0.54,
      gradient:{ from:'#EEEEEE', to:'#E8E8E8', angle:90 },
      stroke:'white', strokeWidth:1, shadow:{ offset:0.125 } });
    if (c.code) els.push({ type:'t', text:c.code, x:0.18, y:cy, w:0.54, h:0.54,
      font:'B', size:7, color:'asphalt', align:'center', valign:'middle',
      caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
    if (c.text) els.push({ type:'t', x:0.82, y:cy - 0.01, w:1.6, h:0.56,
      font:'B', size:7, color:'#7F7F7F', caps:false, lineSpacing:1.15,
      insets:{l:0.028,t:0.028,r:0.028,b:0.028},
      paras:[{ runs:[{ text:c.text }], bullet:true, marL:0.1, indent:-0.1 }] });
  });
'''
OVERRIDES['reportPlatformMatrix'] = ("\nfunction layout_reportPlatformMatrix(cfg) {\n  var els = [];"
    + OVERRIDES['reportPlatformMatrix'] + "  return els;\n}\n")

# ---------------------------------------------------------------------------
# REPORT ECOSYSTEM TREE  (source slide 92)
#
# A hierarchy: one root node with a dotted fact panel beside it, a trunk down to
# a junction dot, then straight connectors fanning out to N channel branches,
# each with a label, an underline and a bulleted leaf card.
#
# Shares its vocabulary with the hub-and-spoke on slide 91 -- same dotted
# #9B9B9B panel, same #7F7F7F body copy, same corner treatment -- but the
# arrangement is a tree, not a ring.
#
# Measured off slide 92:
#   header    x=3.90 y=0.15 w=5.53, 35pt gray caps centred (same as slide 91)
#   corners   label 8.5pt #060E19, rule 0.38pt #5E5E5E, body 7pt #7F7F7F;
#             left block right-aligned, right block mirrored
#   root      label 10.5pt #5E5E5E at x=6.25; fact panel x=7.18 y=1.04
#             w=2.70 h=1.39, dotted #9B9B9B 1pt, bullets 7pt with bold keys
#   junction  dot 0.11 #AFAEBF at (6.665, 3.115)
#   connect   straight #9B9B9B 0.5pt from the dot to each column top (y=3.59)
#   channel   label 9pt #A3B3A5 centred at y=4.38, underline 0.83in at y=4.67
#   leaf      roundRect adj=8170 (0.118in radius) y=4.82 w=1.44 h=1.87,
#             borderless, bullets 6pt #7F7F7F
#
# Columns span 1.66 to 11.665 -- eight at 1.43in spacing, which is exactly the
# 1.44in card width, so eight is the ceiling. More would overlap.
# ---------------------------------------------------------------------------

OVERRIDES['reportEcosystemTree'] = '''
  var CX = 6.665;
  var NODE_R = 0.44, SMALL_R = 0.28;
  var NODE_CY = 1.73, RAIL_Y = 3.11, SMALL_CY = 3.66;
  var CARD_W = 1.44, MAX_BRANCH = 8;
  var SPAN_L = 1.66, SPAN_R = 11.665;
  var DISC = { from:'#EEEEEE', to:'#E8E8E8', angle:90 };

  if (cfg.title) els.push({ type:'t', text:cfg.title, x:3.9, y:0.15, w:5.53, h:0.64,
    font:'H', size:35, color:'bodyGray', align:'center', caps:true, lineSpacing:0.8,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });

  // Corner blocks. The source flattens circle and icon into one 446-point path;
  // rebuilt here as a real gradient disc with a shadow plus an optional icon,
  // so the icon is swappable instead of baked into vector artwork.
  [[cfg.cornerLeft, 0.36, 0.42, 'right', 1.74],
   [cfg.cornerRight, 11.77, 11.77, 'left', 11.18]].forEach(function (c) {
    var blk = c[0]; if (!blk) return;
    els.push({ type:'o', x:c[4], y:0.36, w:0.55, h:0.55, gradient:DISC,
      stroke:'white', strokeWidth:1, shadow:{ offset:0.125 } });
    if (blk.icon) els.push({ type:'i', icon:blk.icon, x:c[4] + 0.11, y:0.47,
      w:0.33, h:0.33, color:'#5E5E5E' });
    if (blk.label) els.push({ type:'t', text:blk.label, x:c[1], y:0.37, w:1.14, h:0.19,
      font:'B', size:8.5, color:'#060E19', align:c[3], caps:true, lineSpacing:1,
      insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
    els.push({ type:'s', x:c[2], y:0.62, w:1.09, h:0.006, fill:'#5E5E5E' });
    if (blk.text) els.push({ type:'t', text:blk.text, x:c[2], y:0.68, w:1.09, h:0.39,
      font:'B', size:7, color:'#7F7F7F', align:c[3], caps:false, lineSpacing:1.15,
      insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
  });

  var branches = cfg.branches || [];
  if (branches.length > MAX_BRANCH) {
    console.warn('[deck-layouts] reportEcosystemTree takes at most ' + MAX_BRANCH +
      ' branches; ' + (branches.length - MAX_BRANCH) + ' dropped. Cards are ' +
      CARD_W + 'in wide and would overlap.');
    branches = branches.slice(0, MAX_BRANCH);
  }
  var n = branches.length;

  // Dotted fact panel beside the primary node.
  if (cfg.root) {
    var facts = (cfg.root.facts || []).slice(0, 6);
    if (facts.length) {
      els.push({ type:'s', x:CX + NODE_R, y:NODE_CY - 0.003, w:0.29, h:0.006, fill:'#7F7F7F' });
      els.push({ type:'s', x:7.18, y:1.04, w:2.7, h:1.39, fill:'none',
        stroke:'#9B9B9B', strokeWidth:1, dash:'dot', radius:0.118 });
      els.push({ type:'t', x:7.28, y:1.14, w:2.5, h:1.19,
        font:'B', size:7, color:'#7F7F7F', caps:false, lineSpacing:1.2,
        insets:{l:0.028,t:0.028,r:0.028,b:0.028},
        paras:facts.map(function (f) {
          return { runs:[{ text:(f.key || '') + ' ', bold:true }, { text:f.value || '' }],
                   bullet:true, marL:0.1, indent:-0.1 };
        }) });
    }
  }

  if (n) {
    var step = (SPAN_R - SPAN_L) / (MAX_BRANCH - 1);
    var half = (n - 1) / 2;
    var colX = branches.map(function (b, i) { return CX + (i - half) * step; });

    // Trunk down from the primary node to the rail, the rail itself, then a
    // drop from the rail to each branch disc. Rails and drops go first so every
    // disc paints over them.
    els.push({ type:'s', x:CX - 0.008, y:NODE_CY + NODE_R, w:0.016,
      h:RAIL_Y - (NODE_CY + NODE_R), fill:'#9B9B9B' });
    if (n > 1) els.push({ type:'s', x:colX[0], y:RAIL_Y - 0.006,
      w:colX[n - 1] - colX[0], h:0.012, fill:'#9B9B9B' });
    colX.forEach(function (x) {
      els.push({ type:'s', x:x - 0.006, y:RAIL_Y, w:0.012,
        h:(SMALL_CY - SMALL_R) - RAIL_Y, fill:'#9B9B9B' });
    });

    branches.forEach(function (b, i) {
      var x = colX[i];
      els.push({ type:'o', x:x - SMALL_R, y:SMALL_CY - SMALL_R, w:SMALL_R * 2, h:SMALL_R * 2,
        gradient:DISC, stroke:'white', strokeWidth:1, shadow:{ offset:0.1 } });
      if (b.icon) els.push({ type:'i', icon:b.icon, x:x - 0.16, y:SMALL_CY - 0.16,
        w:0.32, h:0.32, color:'#5E5E5E' });

      if (b.label) els.push({ type:'t', text:b.label, x:x - 0.72, y:4.38, w:1.44, h:0.2,
        font:'B', size:9, color:'#A3B3A5', align:'center', valign:'middle',
        bold:true, caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
      els.push({ type:'s', x:x - 0.415, y:4.67, w:0.83, h:0.006, fill:'#5E5E5E' });

      // Items accept a plain string or { text, subs:[...] }. Sub-bullets sit a
      // level in at a smaller glyph, matching the table of contents treatment.
      var paras = [];
      (b.items || []).forEach(function (it) {
        if (paras.length >= 10) return;
        var t = (typeof it === 'string') ? it : (it.text || '');
        paras.push({ runs:[{ text:t }], bullet:true, marL:0.09, indent:-0.09 });
        if (typeof it !== 'string') (it.subs || []).forEach(function (sub) {
          if (paras.length >= 10) return;
          paras.push({ runs:[{ text:sub }], bullet:true, bulletSizePct:80,
                       indentLevel:1, marL:0.2, indent:-0.09 });
        });
      });
      if (paras.length) els.push({ type:'t', x:x - 0.62, y:4.9, w:1.24, h:1.71,
        font:'B', size:6, color:'#7F7F7F', caps:false, lineSpacing:1.25,
        insets:{l:0.028,t:0.028,r:0.028,b:0.028}, paras:paras });
    });
  }

  // Primary node last, so it wins every overlap. It carries a text label, never
  // an icon -- an icon slot belongs to the branch discs and the corners only.
  if (cfg.root) {
    els.push({ type:'o', x:CX - NODE_R, y:NODE_CY - NODE_R, w:NODE_R * 2, h:NODE_R * 2,
      gradient:DISC, stroke:'white', strokeWidth:1, shadow:true });
    if (cfg.root.label) {
      // Text has to sit inside the disc's inscribed square, not its bounding
      // box, or long labels run out past the curve. Step the size down rather
      // than let a longer campaign name overflow.
      var rw = NODE_R * 1.414;
      var rn = String(cfg.root.label).length;
      var rs = rn <= 12 ? 8 : rn <= 20 ? 7 : rn <= 30 ? 6 : 5.5;
      els.push({ type:'t', text:cfg.root.label,
        x:CX - rw / 2, y:NODE_CY - rw / 2, w:rw, h:rw,
        font:'B', size:rs, color:'#5E5E5E', align:'center', valign:'middle',
        caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
    }
  }
'''
OVERRIDES['reportEcosystemTree'] = ("\nfunction layout_reportEcosystemTree(cfg) {\n  var els = [];"
    + OVERRIDES['reportEcosystemTree'] + "  return els;\n}\n")

# ---------------------------------------------------------------------------
# REPORT CHAPTER OPENER (slide 97)
#
# Moved from auto-generated to hand-authored. Three real bugs in the auto
# version:
#  1. cfg.title sat in the arrow's exact bounding box (0.78in wide) instead
#     of the arrow itself -- real title text wrapped into vertical stacked
#     text between the two boxes.
#  2. The primary-body-copy field (text5/text6) carried the halved 20pt
#     instead of the source's actual 40pt -- this one field is not halved
#     like the rest of the layout's type scale, confirmed against the
#     source shape directly.
#  3. The headline pair (text4/subhead) was vertically centered in a box
#     sized for exactly one line, so any two-line wrap grew upward into the
#     eyebrow line above it as much as downward.
#
# Fixes: the arrow is now fixed decoration, not a content slot. Primary
# body copy is 40pt. Headlines are top-anchored so overflow only grows
# down, into the gap before the primary body copy. Eyebrows and the two
# STATUS/WHAT THIS UNLOCKS blocks are caps per brand review.
# ---------------------------------------------------------------------------
OVERRIDES['reportChapterOpener'] = '''
function layout_reportChapterOpener(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:12.12, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.text || '', x:0.61, y:0.85, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.61, y:1.33, w:12.12, h:0.39, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'s', x:0.86, y:2.46, w:5.45, h:4.19, fill:'white' });
  els.push({ type:'s', x:7.22, y:2.46, w:5.45, h:4.19, fill:'nearBlack' });
  els.push({ type:'s', x:7.21, y:2.46, w:0.08, h:4.19, fill:'accentDim' });
  els.push({ type:'t', text:cfg.text2 || 'CHAPTER 1', x:1.16, y:2.78, w:4.84, h:0.17, font:'B', size:7.5, color:'bodyGray', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.87, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.text3 || 'CHAPTER 2 \u00b7 TODAY', x:7.52, y:2.81, w:4.84, h:0.11, font:'B', size:7.5, color:'accentDim', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.87 });
  els.push({ type:'t', text:cfg.text4 || 'Lorem Ipsum', x:1.17, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'nearBlack', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:7.53, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'white', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  else els.push({ type:'t', text:'Lorem Ipsum', x:7.53, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'white', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:'\u2192', x:6.37, y:4.11, w:0.78, h:0.89, font:'B', size:60, color:'accentDim', bold:true, align:'center', valign:'middle', caps:false, lineSpacing:1 });
  els.push({ type:'t', text:cfg.text5 || 'Lorem ipsum dolor sit amet', x:1.17, y:4.43, w:4.82, h:0.37, font:'B', size:20, color:'nearBlack', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.text6 || 'Lorem ipsum dolor sit amet', x:7.53, y:4.43, w:4.82, h:0.37, font:'B', size:20, color:'white', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || 'STATUS \u00b7 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', x:1.22, y:5.59, w:4.73, h:0.7, font:'B', size:10, color:'bodyGray', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.66, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || 'WHAT THIS UNLOCKS \u00b7 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', x:7.57, y:5.59, w:4.73, h:0.7, font:'B', size:10, color:'accentDim', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.66, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}'''

# ---------------------------------------------------------------------------
# REPORT STRATEGY STACK (slide 98)
#
# Moved from auto-generated to hand-authored. The flat cfg.items[] version
# had one string slot per box, so every two-tone / two-weight text pair in
# the source (badge header+body, point/point headline, insight header+body,
# panel subhead+sections, activation label+body, footer header+body)
# collapsed to a single color/weight and silently dropped its second half.
# The two chevrons were wired to cfg.subhead/cfg.text5 -- free-text slots
# sitting where the source has a fixed glyph, the same bug already fixed on
# reportChapterOpener's arrow.
#
# All boxes: rounded corners + drop shadow (Format Shape > Shadow: black,
# 65% transparency / 0.35 opacity, 8pt blur, 90deg angle, 3pt distance).
# Middle panels take either cfg.panels[i].sections (repeatable caps-header +
# body pairs) or cfg.panels[i].bullets (a plain list) -- the two are
# mutually exclusive per panel.
# ---------------------------------------------------------------------------
OVERRIDES['reportStrategyStack'] = '''
function layout_reportStrategyStack(cfg) {
  var els = [];
  var SHADOW = { angle: 90, offset: 3 / 72, blur: 8 / 72, opacity: 0.35 };
  var R = 0.07;
  var STROKE = '#3A3A3A';

  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.72, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.intro || '', x:0.61, y:1.33, w:4.95, h:0.39, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // Top-right badges: tan caps sub-header + white body, one line each.
  // Content should be kept to one line per field -- these boxes are fixed
  // at 2-line capacity and do not grow with longer input.
  var badges = cfg.badges || [];
  var badgeX = [7.82, 10.22];
  badgeX.forEach(function (x, i) {
    var b = badges[i] || {};
    els.push({ type:'s', x:x, y:1.26, w:2.22, h:0.6, fill:'#242424', stroke:STROKE, strokeWidth:0.75, radius:R, shadow:SHADOW });
    els.push({ type:'t', text:b.sub || '', x:x+0.02, y:1.34, w:2.18, h:0.2, font:'B', size:9, color:'#D2B08D', bold:true, align:'center', valign:'middle', caps:true, lineSpacing:1, charSpacing:0.6 });
    els.push({ type:'t', text:b.body || '', x:x+0.02, y:1.56, w:2.18, h:0.24, font:'B', size:9, color:'white', bold:true, align:'center', valign:'middle', caps:false, lineSpacing:1 });
  });

  // Wide divider box: point/point headline (white, tan) + gray body on the
  // left; caps tan insight header + gray body on the right.
  els.push({ type:'s', x:0.54, y:2.01, w:11.89, h:1.14, fill:'#1F1F1F', stroke:STROKE, strokeWidth:0.75, radius:R+0.01, shadow:SHADOW });
  els.push({ type:'t', x:0.8, y:2.18, w:6.02, h:0.44, font:'B', size:24, bold:true, valign:'bottom', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035},
    paras:[{ runs:[
      { text:(cfg.pointOne || '') + ' ', color:'white' },
      { text:cfg.pointTwo || '', color:'#D2B08D' }
    ] }] });
  els.push({ type:'s', x:7.05, y:2.22, w:0.01, h:0.71, fill:'ltGray' }); // divider rule
  els.push({ type:'t', text:cfg.pointBody || '', x:0.8, y:2.59, w:6.02, h:0.43, font:'B', size:11, color:'ltGray', caps:false, lineSpacing:1.05, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.insightHead || '', x:7.23, y:2.18, w:4.95, h:0.24, font:'B', size:11, color:'#D2B08D', bold:true, valign:'top', caps:true, lineSpacing:1.05, charSpacing:2.44, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.insightBody || '', x:7.23, y:2.44, w:4.95, h:0.53, font:'B', size:11, color:'ltGray', caps:false, lineSpacing:1.05, insets:{l:0.104,t:0.035,r:0.104,b:0.104} });

  // Three-across panels. Each: tan "NEXT SECTION"-style tag, white caps
  // subhead, then either repeatable {head,body} sections or a bullet list
  // -- the two are mutually exclusive per panel.
  var panels = cfg.panels || [];
  var panelX = [0.82, 4.85, 8.87];
  var boxX = [0.54, 4.57, 8.59];
  boxX.forEach(function (bx, i) {
    els.push({ type:'s', x:bx, y:3.28, w:3.84, h:2.41, fill:'#242424', stroke:STROKE, strokeWidth:0.75, radius:R, shadow:SHADOW });
  });
  panelX.forEach(function (x, i) {
    var p = panels[i] || {};
    els.push({ type:'t', text:p.next || cfg.tag || '', x:x, y:3.49, w:3.29, h:0.36, font:'B', size:10, color:'accentDim', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
    els.push({ type:'t', text:p.subhead || '', x:x, y:3.88, w:3.29, h:0.38, font:'B', size:11, color:'white', bold:true, valign:'middle', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });

    if (p.bullets && p.bullets.length) {
      els.push({ type:'t', x:x, y:4.34, w:3.29, h:1.04, font:'B', size:9, color:'ltGray', valign:'top', caps:false, lineSpacing:1.25,
        insets:{l:0.104,t:0.104,r:0.104,b:0.104},
        paras:p.bullets.map(function (b) { return { runs:[{ text:b }], bullet:true, marL:0.12, indent:-0.12 }; }) });
    } else {
      var sections = p.sections || [];
      var sy = 4.34, availH = 1.04, rowH = availH / Math.max(sections.length, 1);
      sections.forEach(function (s, si) {
        els.push({ type:'t', text:s.head || '', x:x, y:sy, w:3.29, h:Math.min(0.22, rowH * 0.4), font:'B', size:9, color:'#8A8E96', bold:true, valign:'top', caps:true, lineSpacing:1.05, charSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
        els.push({ type:'t', text:s.body || '', x:x, y:sy + Math.min(0.22, rowH * 0.4), w:3.29, h:rowH - Math.min(0.22, rowH * 0.4), font:'B', size:9, color:'ltGray', bold:false, valign:'top', caps:false, lineSpacing:1.05, insets:{l:0.104,t:0.028,r:0.104,b:0.104} });
        sy += rowH;
      });
    }
  });

  // Supporting subhead + body, constrained to one full-width line. Per-run
  // caps/letter-spacing aren't supported by the engine's paras renderer (only
  // color/size/bold are), so the label's caps is forced in JS and the whole
  // line shares one letter-spacing value -- the source's extra tracking on
  // just the label vs. the body is too subtle a difference to be worth a
  // second text element and manual width math to keep them flush.
  els.push({ type:'t', x:0.56, y:5.74, w:11.85, h:0.39, font:'B', size:11.5, bold:false, valign:'middle', caps:false, lineSpacing:1, charSpacing:2.09, insets:{l:0.104,t:0.104,r:0.104,b:0.104},
    paras:[{ runs:[
      { text:(cfg.activationLabel || '').toUpperCase() + '   ', color:'accent', bold:true },
      { text:cfg.activationBody || '', color:'nearBlack', bold:false }
    ] }] });

  // Bottom three boxes: white bold header, gray 2-line body. Fixed tan
  // chevrons between each -- not content slots, matches the source's own
  // fixed "\u203a" glyph between every pair.
  var footers = cfg.footers || [];
  var footerBoxX = [0.54, 4.57, 8.59];
  var footerTxtX = [0.78, 4.81, 8.83];
  footerBoxX.forEach(function (bx, i) {
    els.push({ type:'s', x:bx, y:6.16, w:3.84, h:0.86, fill:'#242424', stroke:STROKE, strokeWidth:0.75, radius:R-0.01, shadow:SHADOW });
  });
  footerTxtX.forEach(function (x, i) {
    var f = footers[i] || {};
    els.push({ type:'t', text:f.head || '', x:x, y:6.28, w:3.37, h:0.24, font:'B', size:9, color:'white', bold:true, valign:'top', caps:false, lineSpacing:1.05, charSpacing:0.4 });
    els.push({ type:'t', text:f.body || '', x:x, y:6.5, w:3.37, h:0.46, font:'B', size:9, color:'#8A8E96', bold:false, valign:'top', caps:false, lineSpacing:1.1 });
  });
  els.push({ type:'t', text:'\u203a', x:4.37, y:6.45, w:0.22, h:0.28, font:'B', size:17, color:'accent', bold:true, align:'center', valign:'middle', caps:false, lineSpacing:1 });
  els.push({ type:'t', text:'\u203a', x:8.39, y:6.45, w:0.22, h:0.28, font:'B', size:17, color:'accent', bold:true, align:'center', valign:'middle', caps:false, lineSpacing:1 });

  return els;
}
'''

# ---------------------------------------------------------------------------
# REPORT JOURNEY MAP (slide 99)
#
# Moved from auto-generated to hand-authored. The flat cfg.items[] version
# was missing most of its own content: two of each column's three body
# sections (under DELIVERABLES and DEFINE REVIEW TIMELINE) had a header and
# no bullets, and the third had bullets and no header. No section header
# was underlined -- underline wasn't a supported element property at all
# until this pass (added to standard-deck.js's renderText alongside
# caps/charSpacing/shadow). The icon "circles" were plain rectangles. The
# connector line under "WE ARE HERE" was a 0.01in filled rectangle standing
# in for a line, so it couldn't carry arrowheads.
#
# cfg.panels[i].sections[j].items: each entry is a plain string (grey
# bullet) or {text, bold, color} for a bullet that needs to stand out.
# cfg.panels[i].tone: 'dark' or 'tan' -- matches the source's one-tan-of-
# four column, inverting header/icon fill and date-text color together.
# ---------------------------------------------------------------------------
OVERRIDES['reportJourneyMap'] = '''
function layout_reportJourneyMap(cfg) {
  var els = [];
  var COL_X = [0.19, 3.47, 6.74, 10.02];
  var COL_W = 3.12;
  var SECTIONS_Y = [3.09, 4.24, 5.88];
  var SECTIONS_H = [0.94, 1.26, 0.93];
  var DEFAULT_LABELS = ['DELIVERABLES:', 'DEFINE REVIEW TIMELINE:', 'CLIENT REVIEWERS'];

  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:12.12, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.hereLabel || 'WE ARE HERE', x:4.13, y:1.43, w:1.8, h:0.16, font:'B', size:10, color:'#8D7057', bold:true, align:'center', valign:'middle', caps:true, lineSpacing:1, charSpacing:1.7 });
  // Connector: a real line (was a 0.01in filled rectangle, which can't carry
  // arrowheads), 3pt raw / 2.0005 = 1.5pt, both ends arrowed per source.
  els.push({ type:'ln', x:5.03, y:1.69, w:0, h:0.29, color:'ltGray', weight:1.5, arrows:'both' });

  var panels = cfg.panels || [];
  COL_X.forEach(function (x, i) {
    var p = panels[i] || {};
    var isTan = p.tone === 'tan';
    var headerFill = isTan ? 'accentDim' : 'asphalt';
    var dateColor = isTan ? 'asphalt' : '#ECBE96';

    // Tan outline: a slightly larger tan panel sitting behind the current
    // column's header+white boxes, showing as a frame around them (10.04 x
    // 6.57in raw -> 5.02 x 3.28in engine). It's what makes the tan column
    // read taller than the others -- the header and white boxes underneath
    // are unchanged size, this just peeks out from behind on all four sides.
    if (isTan) els.push({ type:'s', x:x-0.09, y:2.01, w:3.3, h:5.02, fill:'accentDim' });

    // White body drawn BEFORE the header bar so the bar sits on top of it,
    // fully visible -- matches the source's own z-order (the header shape
    // is later in the group than the white box, i.e. topmost). Drawing the
    // header first let the white box cover nearly all of it, hiding the
    // icon/header/date row entirely.
    els.push({ type:'s', x:x, y:2.17, w:COL_W, h:4.78, fill:'white' });
    // Header shape: 6.24 x 1.54 raw -> 3.12 x 0.77 engine (verified against
    // source -- already correct).
    els.push({ type:'s', x:x, y:2.09, w:COL_W, h:0.77, fill:headerFill });

    // Icon: a real circle (was a filled rectangle) with room for one white
    // character.
    els.push({ type:'o', x:x+0.37, y:2.32, w:0.32, h:0.32, fill:'gray' });
    els.push({ type:'t', text:p.icon || String(i+1), x:x+0.37, y:2.32, w:0.32, h:0.32, font:'B', size:12, color:'white', align:'center', valign:'middle', caps:false, lineSpacing:1 });

    // Width widened from the source's literal 1.27in -- at 13pt with 3pt
    // tracking that fit "DEFINE" but wrapped "DEVELOP" into the icon above it.
    els.push({ type:'t', text:p.header || '', x:x+0.86, y:2.37, w:1.75, h:0.22, font:'B', size:13, color:'white', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:3 });
    els.push({ type:'t', text:p.date || '', x:x+1.98, y:2.4, w:0.8, h:0.12, font:'B', size:8, color:dateColor, bold:true, align:'right', caps:true, lineSpacing:1 });

    // Three sections: caps underlined header + bulleted body. A bullet item
    // can be a plain string (grey, standard weight) or { text, bold, color }
    // to call out something like an approval date in black/bold.
    var sections = p.sections || [];
    SECTIONS_Y.forEach(function (sy, si) {
      var sec = sections[si] || {};
      var label = sec.label || DEFAULT_LABELS[si];
      var items = sec.items || [];
      els.push({ type:'t', text:label, x:x+0.37, y:sy, w:2.39, h:0.16, font:'B', size:9, color:'black', bold:true, underline:true, caps:true, lineSpacing:1, charSpacing:1.1 });
      els.push({ type:'t', x:x+0.37, y:sy+0.2, w:2.39, h:SECTIONS_H[si]-0.2, font:'B', size:10, color:'gray', valign:'top', caps:false, lineSpacing:1.15,
        paras:items.map(function (it) {
          var plain = typeof it === 'string';
          return { runs:[{ text: plain ? it : (it.text || ''), bold: plain ? false : !!it.bold, color: plain ? 'gray' : (it.color || 'gray') }], bullet:true, marL:0.12, indent:-0.12 };
        }) });
    });
  });
  els.push({ type:'s', x:0.32, y:3.96, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:3.59, y:3.96, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:6.87, y:3.96, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:10.14, y:3.96, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:0.32, y:5.62, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:3.59, y:5.62, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:6.87, y:5.62, w:2.89, h:0.01, fill:'ltGray' }); // rule
  els.push({ type:'s', x:10.14, y:5.62, w:2.89, h:0.01, fill:'ltGray' }); // rule
  return els;
}
'''




# ---------------------------------------------------------------------------
# REPORT METRIC TABLE (slide 95)
#
# Moved from auto-generated to hand-authored. The auto version pushed 50
# `cfg.items[N]` text elements addressed only by array index, with no link
# back to the box each one was supposed to sit in -- so a reordered or
# incomplete items array silently dropped both the text AND its box's
# identity, and none of the 50 box pushes ever set `stroke`, so no box in
# the layout could ever show a border even though the source strokes most
# of them (#5B5B61, or #EEEEEE on the two rightmost columns).
#
# Re-modeled as 7 independent column stacks (fixed x/w, source-accurate)
# running top to bottom from y:1.56. Each column is a list of "groups" --
# a group is a source funnel-band (2.11in / 1.79in / 1.55in high) that can
# hold one cell (e.g. Monthly Data Source, one tall box per band) or many
# (Channel, up to 7 short boxes per band). A cell's height is explicit or
# auto-split evenly across its group, so column width never changes but
# cell height flexes with however many cells a group is given.
# cfg.columns overrides the whole matrix; omit it to reproduce slide 95.
# ---------------------------------------------------------------------------
OVERRIDES['reportMetricTable'] = '''
function layout_reportMetricTable(cfg) {
  var els = [];
  var COL_TOP = 1.56, COL_W = 1.295;
  var HEADER_Y = 1.03, HEADER_H = 0.4;
  var TONE = { lt: '#7F7F7F', mid: '#595959', dark: 'asphalt' };
  var STROKE_DEFAULT = '#5B5B61', STROKE_LIGHT = '#EEEEEE';
  var COL_X = [1.47, 2.94, 4.41, 5.88, 7.35, 8.82, 10.28];
  // Format Shape > Shadow, as specified for the Consumer Journey / Outcomes
  // columns: Color black, Transparency 60% (-> opacity 0.4), Blur 10pt,
  // Angle 0 deg, Distance 0pt. Zero distance + symmetric blur reads as a
  // soft halo around the box rather than a directional drop shadow.
  var SHADOW_DEFAULT = { angle: 0, offset: 0, blur: 10 / 72, opacity: 0.4 };
  // Every column gets a real gap between stacked boxes so they read as
  // separate cells instead of one solid fill -- including the two shadowed
  // columns, where the gap also lets each box's shadow show on all sides.
  var GAP = 0.045;

  function seg(text) { return { text: text }; }

  var DEFAULT_COLUMNS = [
    { header: 'Consumer Journey', shadow: SHADOW_DEFAULT, gap: GAP,
      groups: [
        { h: 2.11, cells: [{ text: 'DGU', tone: 'lt' }] },
        { h: 1.79, cells: [{ text: 'DGM', tone: 'mid' }] },
        { h: 1.55, cells: [{ text: 'DCP', tone: 'dark' }] } ] },
    { header: 'Outcomes & KPI', shadow: SHADOW_DEFAULT, gap: GAP, size: 6,
      groups: [
        { h: 2.11, cells: [{ text: 'Build New Demand Consideration amongst non-owners', tone: 'lt' }] },
        { h: 1.79, cells: [{ text: 'Capture Existing Demand', tone: 'mid' }] },
        { h: 1.55, cells: [{ text: 'Convert Intent to Sales', tone: 'dark' }] } ] },
    { header: 'Channel', stroke: STROKE_DEFAULT, gap: GAP,
      groups: [
        { h: 2.11, cells: ['Linear', 'CTV/Video', 'Paid Social', 'YouTube', 'Content Amp', 'Rich Media', 'Audio'].map(seg) },
        { h: 1.79, cells: ['Social', 'Display/Vid', 'YouTube', 'Content Amp', 'Audio', 'SEM'].map(seg) },
        { h: 1.55, cells: ['Social', 'Display', 'YouTube', 'Endemic', 'SEM'].map(seg) } ] },
    { header: 'Weekly Media KPI', stroke: STROKE_DEFAULT, gap: GAP,
      groups: [
        { h: 2.11, cells: ['Reach', 'Reach', 'Engagements, VCR', 'Reach, VCR', 'CTR', 'Reach', 'ACR'].map(seg) },
        { h: 1.79, cells: [{ text: 'Build Price & Completes (CPA)' }] },
        { h: 1.55, cells: [{ text: 'MUSA Lead Submission (CPA) / Attributed Sales (CPS)' }] } ] },
    { header: 'Weekly Data Source', stroke: STROKE_DEFAULT, gap: GAP,
      groups: [
        { h: 2.11, cells: ['iSpot', 'iSpot', 'Platforms', 'iSpot, DCM', 'DCM', 'DCM', 'DCM'].map(seg) },
        { h: 3.34, cells: [{ text: 'Adobe & Urban Science' }] } ] },
    { header: 'Monthly Media KPI', stroke: STROKE_LIGHT, gap: GAP,
      groups: [
        { h: 2.11, cells: [{ text: 'Consideration' }] },
        { h: 3.34, cells: [{ text: 'Shopping & Intent to Buy / MUSA HVAs (volume of site visits) / Favorability / Consideration' }] } ] },
    { header: 'Monthly Data Source', stroke: STROKE_LIGHT, gap: GAP,
      groups: [
        { h: 2.11, cells: [{ text: 'Dynata, Added Value 3P BLS' }] },
        { h: 3.34, cells: [{ text: 'B2D, Adobe' }] } ] }
  ];

  var columns = cfg.columns || DEFAULT_COLUMNS;

  if (cfg.tag) els.push({ type: 't', text: cfg.tag, x: 0.61, y: 0.54, w: 12.12, h: 0.29,
    font: 'B', size: 14.5, color: 'accentDim', valign: 'bottom', caps: true, lineSpacing: 0.9,
    insets: { l: 0.035, t: 0.035, r: 0.035, b: 0.035 } });

  columns.slice(0, 7).forEach(function (col, ci) {
    var x = COL_X[ci], w = COL_W, gap = col.gap || 0;

    // Header cell -- every column gets one, dark grey fill. Headings never
    // take an outline or a shadow, regardless of the column's own treatment.
    els.push({ type: 's', x: x, y: HEADER_Y, w: w, h: HEADER_H, fill: '#55555C' });
    els.push({ type: 't', text: col.header || '', x: x, y: HEADER_Y, w: w, h: HEADER_H,
      font: 'B', size: 11, color: 'white', bold: true, align: 'center', valign: 'middle',
      caps: false, lineSpacing: 1, insets: { l: 0.035, t: 0.035, r: 0.035, b: 0.035 } });

    // Body: independent stack of groups, each group's cells sharing its height.
    var y = COL_TOP;
    (col.groups || []).forEach(function (group) {
      var cells = group.cells || [];
      var specified = cells.reduce(function (s, c) { return s + (c.h || 0); }, 0);
      var unspecified = cells.filter(function (c) { return !c.h; }).length;
      var autoH = unspecified ? Math.max(0, (group.h - specified) / unspecified) : 0;

      cells.forEach(function (cell) {
        var h = (cell.h || autoH) - gap;
        els.push({ type: 's', x: x, y: y, w: w, h: h,
          fill: TONE[cell.tone || col.tone || 'dark'],
          stroke: col.shadow ? undefined : (col.stroke || STROKE_DEFAULT),
          strokeWidth: col.shadow ? undefined : 0.75,
          shadow: col.shadow || undefined });
        if (cell.text) els.push({ type: 't', text: cell.text, x: x + 0.05, y: y, w: w - 0.1, h: h,
          font: 'B', size: cell.size || col.size || 6.5, color: 'white', bold: true,
          align: 'center', valign: 'middle', caps: false, lineSpacing: 1,
          insets: { l: 0.028, t: 0.028, r: 0.028, b: 0.028 } });
        y += h + gap;
      });
    });
  });

  if (cfg.date) els.push({ type: 't', text: cfg.date, x: 4.46, y: 7.13, w: 1.2, h: 0.22,
    font: 'B', size: 10, color: 'white', bold: true, align: 'center', valign: 'middle',
    caps: false, lineSpacing: 1, insets: { l: 0.035, t: 0.035, r: 0.035, b: 0.035 } });

  return els;
}'''
