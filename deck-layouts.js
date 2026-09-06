/* ============================================================
deck-layouts.js -- MMW Layout Library v2.0 (standard-deck-mmw)

REBUILT from MMW PPT Template_7.24.26.pptx. 66 layouts, one per
slide layout in the source template (v1.0 shipped 22).

TWO BREAKING CHANGES vs v1.0 -- read before upgrading:

1. TYPE SCALE CORRECTED. The template canvas is 26.667x15in, 2.0005x
   the engine's 13.33x7.5in. v1.0 halved every coordinate but carried
   font sizes across at native value, so all type rendered 2x too
   large (cover title 109pt where it should be 54.5pt; 15 of 24
   measured text boxes overflowed). Every size in this file is
   engine-space. Do not scale again.

2. LAYOUT NAMES now follow the template's own slide-layout names.
   v1.0's names were invented and had drifted (its "content03" was
   built from the template's "Content 01"). LEGACY_ALIASES below
   keeps v1.0 deck data working; new decks should use the new keys.

Geometry, type and colour are machine-generated from the template.
See MMW_Layout_Spec.md for the full per-layout specification.
============================================================ */

(function () {
'use strict';

var SD = window.StandardDeck;
if (!SD || !SD.SD_CONST) { console.error('[deck-layouts] FATAL: standard-deck.js must load first.'); return; }

var _prefetchUrls = [];
function registerPrefetch(url) { if (_prefetchUrls.indexOf(url) === -1) _prefetchUrls.push(url); }

// ------------------------------------------------------------
// Photo well helper.
// Emits a replaceable picture. Exports via addImage() so PowerPoint's
// "Change Picture..." works. The template uses 123 native picture
// placeholders (<p:ph type="pic">); reproducing those natively needs
// pptx.defineSlideMaster() with placeholder objects -- see the v2.1
// note in MMW_Layout_Spec.md section 5.
// ------------------------------------------------------------
// ------------------------------------------------------------
// Brand mark refs. The template ships BLACK and WHITE masters of both
// marks and selects on background -- a black mark on pattern_dark.png is
// invisible. The artifact must provide all four <img> ids:
//   gi0  = mmw_logo_black.png          gi0w = mmw_logo_white.png
//   gi1  = wpp_mazda_lockup_black.png  gi1w = wpp_mazda_lockup_white.png
// ------------------------------------------------------------
// Base path for bundled brand assets. Override before deckInit() if the
// assets/ folder lives elsewhere:  window.MMW_ASSET_BASE = '/static/mmw/';
var A = (typeof window !== 'undefined' && window.MMW_ASSET_BASE) || 'assets/';

function logoRef(cfg)   { return cfg.dark === 1 ? 'gi0w' : 'gi0'; }
function lockupRef(cfg) { return cfg.dark === 1 ? 'gi1w' : 'gi1'; }

// Photo well. Renders a replaceable placeholder by default; supply real
// photography per well with cfg.images -- an array indexed by well order
// (top-to-bottom, left-to-right within the layout), or an object keyed by index:
//   { layout:'coverPhoto2', images:['photos/hero.jpg'] }
// Wells left unspecified stay replaceable, so you can fill only the ones you have.
function ph(els, cfg, x, y, w, h, slot, mask) {
  var supplied = cfg.images && (Array.isArray(cfg.images) ? cfg.images[slot] : cfg.images[slot]);
  if (supplied) {
    els.push({ type:'img', src: supplied, x:x, y:y, w:w, h:h, fit:'cover', mask: mask || null });
    return;
  }
  var dk = cfg.dark === 1;
  // The well carries the mask too, so an unfilled slot previews the real
  // silhouette rather than a rectangle that changes shape once a photo lands.
  els.push({ type:'s', x:x, y:y, w:w, h:h,
    fill: dk ? 'asphalt' : 'white',
    border: dk ? null : 'ltGray',
    points: mask || null,
    _imgPlaceholder: true });
  // label size is engine chrome, NOT template type -- do not scale
  els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
    x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
    font:'H', size:9, color: dk ? 'mutedGray' : 'bodyGray',
    align:'center', valign:'middle', _skipExport:true });
}


// ==========================================================
// LAYOUT: COVER LIGHT  ->  cfg.layout = "coverLight"
// Template: "Cover Light"
// Source slide: 6   Background: image `pattern_light.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_coverLight(cfg) {
  var els = [];
  els.push({ type:'img', ref:logoRef(cfg), x:0.41, y:0.37, w:1.12, h:0.31 });
  els.push({ type:'t', text:cfg.title || "", x:0.39, y:4.4, w:12.56, h:1.12, font:'H', size:54.5, color:'asphalt', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.date) els.push({ type:'t', text:cfg.date || '', x:1.9, y:7, w:12.01, h:0.35, font:'B', size:12, color:'mutedGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.025,t:0.025,r:0.025,b:0.025} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 });
  return els;
}

// ==========================================================
// LAYOUT: COVER DARK  ->  cfg.layout = "coverDark"
// Template: "Cover Dark"
// Source slide: 7   Background: image `pattern_dark.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_coverDark(cfg) {
  var els = [];
  els.push({ type:'img', ref:logoRef(cfg), x:0.41, y:0.37, w:1.12, h:0.31 });
  els.push({ type:'t', text:cfg.title || "", x:0.39, y:4.4, w:12.56, h:1.12, font:'H', size:54.5, color:'paper', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.date) els.push({ type:'t', text:cfg.date || '', x:1.9, y:7, w:12.01, h:0.35, font:'B', size:12, color:'mutedGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.025,t:0.025,r:0.025,b:0.025} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 });
  return els;
}

// ==========================================================
// LAYOUT: COVER LIGHT2  ->  cfg.layout = "coverLight2"
// Template: "Cover Light2"
// Source slide: 1   Background: image `pattern_light.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_coverLight2(cfg) {
  var els = [];
  els.push({ type:'img', ref:logoRef(cfg), x:0.41, y:0.37, w:1.12, h:0.31 });
  els.push({ type:'t', text:cfg.title || "", x:0.4, y:3.99, w:9.65, h:2.55, font:'H', size:54.5, color:'asphalt', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.date) els.push({ type:'t', text:cfg.date || '', x:1.9, y:7, w:12.01, h:0.35, font:'B', size:12, color:'mutedGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.025,t:0.025,r:0.025,b:0.025} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 });
  return els;
}

// ==========================================================
// LAYOUT: COVER PHOTO  ->  cfg.layout = "coverPhoto"
// Template: "Cover Photo"
// Source slide: 8   Background: image `scenic_photo.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_coverPhoto(cfg) {
  var els = [];
  els.push({ type:'img', ref:logoRef(cfg), x:0.41, y:0.37, w:1.12, h:0.31 });
  els.push({ type:'t', text:cfg.title || "", x:0.42, y:4.7, w:12.48, h:0.98, font:'H', size:54.5, color:'paper', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.42, y:5.65, w:12.48, h:0.33, font:'B', size:17, color:'white', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 });
  return els;
}

// ==========================================================
// LAYOUT: COVER PHOTO2  ->  cfg.layout = "coverPhoto2"
// Template: "Cover Photo2"
// Source slide: 10 (variant 1, default) / 11 (variant 2)   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// Both slides share the "Cover Photo2" master but use genuinely different
// diagonal crop shapes on the photo well, not the same shape with a
// different photo -- confirmed by comparing the raw custGeom point lists.
// cfg.variant: 1 (default, slide 10's cut) or 2 (slide 11's cut).
// ==========================================================
function layout_coverPhoto2(cfg) {
  var els = [];
  var VARIANTS = {
    1: { x:1.99, y:-0.02, w:11.43, h:7.57,
      points:[[0.99713,0],[1,1],[0.60968,1],[0.35847,0.62088],[0.35847,0.99653],[0,0.99653],[0,0.5681],[0.32366,0.5681],[0.1788,0.3488],[0.1788,0.00292],[0.66745,0.00523],[0.89463,0.34806],[0.89463,0]] },
    2: { x:3.349, y:0, w:10.074, h:7.538,
      points:[[1,0.50565],[0.99579,0.99866],[0.88431,1],[0.55148,1],[0.40519,0.80509],[0.40588,1],[0.00069,1],[0,0.75639],[0.36912,0.75639],[0.20389,0.53491],[0.20458,0.00056],[0.25773,0],[0.61806,0]] }
  };
  var v = VARIANTS[cfg.variant] || VARIANTS[1];
  ph(els, cfg, v.x, v.y, v.w, v.h, 0, v.points);
  els.push({ type:'img', ref:logoRef(cfg), x:0.41, y:0.37, w:1.12, h:0.31 }); // brand mark (placeholder slot in template)
  els.push({ type:'t', text:cfg.title || "", x:0.39, y:4.37, w:6.48, h:1.12, font:'H', size:54.5, color:'asphalt', valign:'bottom', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 }); // brand mark (placeholder slot in template)
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER DARK  ->  cfg.layout = "dividerDark"
// Template: "Divider Dark"
// Source slide: 12   Background: image `pattern_dark.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_dividerDark(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER DARK2  ->  cfg.layout = "dividerDark2"
// Template: "Divider Dark2"
// Source slide: 15   Background: image `pattern_dark2.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_dividerDark2(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER LIGHT  ->  cfg.layout = "dividerLight"
// Template: "Divider Light"
// Source slide: 14   Background: solid #F5F5F5
// Set slideData.bgColor = "#F5F5F5" (engine honours bgColor on export + preview).
// ==========================================================
function layout_dividerLight(cfg) {
  var els = [];
  els.push({ type:'s', x:4.03, y:-1.68, w:15.5, h:12.77, fill:'paper', points:[[0.1763,0],[0.1763,0.42824],[0.29463,0.57176],[0,0.57176],[0,1],[0.35273,1],[0.35273,0.64231],[0.64736,1],[1,1],[1,0.57176],[0.52907,0]] });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'asphalt', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER LIGHT2  ->  cfg.layout = "dividerLight2"
// Template: "Divider Light2"
// Source slide: 13   Background: image `pattern_light2.png`
// Set slideData.bgImage to the asset above.
// ==========================================================
function layout_dividerLight2(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'asphalt', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER ASPHALT  ->  cfg.layout = "dividerAsphalt"
// Template: "Divider Asphalt"
// Source slide: 16   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_dividerAsphalt(cfg) {
  var els = [];
  els.push({ type:'s', x:4.03, y:-1.68, w:15.5, h:12.77, fill:'paper', transparency:97, points:[[0.1763,0],[0.1763,0.42824],[0.29463,0.57176],[0,0.57176],[0,1],[0.35273,1],[0.35273,0.64231],[0.64736,1],[1,1],[1,0.57176],[0.52907,0]] });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER CANOPY  ->  cfg.layout = "dividerCanopy"
// Template: "Divider Canopy"
// Source slide: 17   Background: solid #253724
// Set slideData.bgColor = "#253724" (engine honours bgColor on export + preview).
// ==========================================================
function layout_dividerCanopy(cfg) {
  var els = [];
  els.push({ type:'s', x:4.03, y:-1.68, w:15.5, h:12.77, fill:'paper', transparency:97, points:[[0.1763,0],[0.1763,0.42824],[0.29463,0.57176],[0,0.57176],[0,1],[0.35273,1],[0.35273,0.64231],[0.64736,1],[1,1],[1,0.57176],[0.52907,0]] });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER AURORA  ->  cfg.layout = "dividerAurora"
// Template: "Divider Aurora"
// Source slide: 18   Background: solid #2C283B
// Set slideData.bgColor = "#2C283B" (engine honours bgColor on export + preview).
// ==========================================================
function layout_dividerAurora(cfg) {
  var els = [];
  els.push({ type:'s', x:4.03, y:-1.68, w:15.5, h:12.77, fill:'paper', transparency:97, points:[[0.1763,0],[0.1763,0.42824],[0.29463,0.57176],[0,0.57176],[0,1],[0.35273,1],[0.35273,0.64231],[0.64736,1],[1,1],[1,0.57176],[0.52907,0]] });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: DIVIDER TIDES  ->  cfg.layout = "dividerTides"
// Template: "Divider Tides"
// Source slide: 19   Background: solid #142A45
// Set slideData.bgColor = "#142A45" (engine honours bgColor on export + preview).
// ==========================================================
function layout_dividerTides(cfg) {
  var els = [];
  els.push({ type:'s', x:4.03, y:-1.68, w:15.5, h:12.77, fill:'paper', transparency:97, points:[[0.1763,0],[0.1763,0.42824],[0.29463,0.57176],[0,0.57176],[0,1],[0.35273,1],[0.35273,0.64231],[0.64736,1],[1,1],[1,0.57176],[0.52907,0]] });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['mmw_logo_black.png']) || A+'logos/mmw_logo_black.png', x:4.07, y:-0.01, w:9.28, h:7.5, transparency:96.5, crop:{"t": 0.1203, "r": 0.8006, "b": 0.2903} });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:3, w:12.12, h:0.56, font:'B', size:15.5, color:'accent', bold:true, valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:3.58, w:12.12, h:0.98, font:'H', size:54.5, color:'paper', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT - HEADLINE LIGHT  ->  cfg.layout = "headlineLight"
// Template: "Content - Headline light"
// Source slide: 32   Background: solid #D5D5D5
// Set slideData.bgColor = "#D5D5D5" (engine honours bgColor on export + preview).
// ==========================================================
function layout_headlineLight(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:2.92, y:2.42, w:7.49, h:0.42, font:'B', size:15.5, color:'accent', bold:true, align:'center', valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || "", x:0.12, y:2.84, w:13.09, h:4.66, font:'H', size:140, color:'white', align:'center', caps:true, lineSpacing:0.9, charSpacing:14, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT -HEADLINE DARK  ->  cfg.layout = "headlineDark"
// Template: "Content -headline dark"
// Source slide: 33   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_headlineDark(cfg) {
  var els = [];
  els.push({ type:'img', src:(cfg.assets && cfg.assets['headline_dark_mark.png']) || A+'backgrounds/headline_dark_mark.png', x:6.29, y:-0.44, w:0.69, h:0.3 });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:2.92, y:2.42, w:7.49, h:0.42, font:'B', size:15.5, color:'accent', bold:true, align:'center', valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || "", x:0.12, y:2.84, w:13.09, h:4.66, font:'H', size:140, color:'white', align:'center', caps:true, lineSpacing:0.9, charSpacing:14, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: 1_CONTENT -HEADLINE PHOTO COPY  ->  cfg.layout = "headlinePhotoWell"
// Template: "1_Content -headline photo copy" / "Headline Photo Divider" (renamed 7/30/26)
// Source slide: 34   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: the full-bleed photo well is gone from the
// source -- confirmed no picture, no placeholder, and no "place your own
// image" callout remain (unlike the 5 social dividers). Solid-color text-only
// slide now.
// ==========================================================
function layout_headlinePhotoWell(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:2.92, y:2.42, w:7.49, h:0.42, font:'B', size:15.5, color:'accent', bold:true, align:'center', valign:'bottom', caps:true, lineSpacing:0.9, charSpacing:6.97, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || "", x:0.12, y:2.84, w:13.09, h:4.66, font:'H', size:140, color:'white', align:'center', caps:true, lineSpacing:0.9, charSpacing:14, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: STATEMENT + SUBHEAD (SLIDE 31)  ->  cfg.layout = "statementSubhead"
// Template: "Statement + Subhead (slide 31)"
// Source slide: 31   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_statementSubhead(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.52, y:2.66, w:12.29, h:1.44, font:'H', size:74, color:'white', align:'center', valign:'bottom', caps:true, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.52, y:4.05, w:12.29, h:1.57, font:'B', size:17.5, color:'accent', align:'center', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: REPORT SPLIT PANELS (SLIDE 73)  ->  cfg.layout = "reportSplitPanels"
// Template: "Report Split Panels (slide 73)"
// Source slide: 73   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportSplitPanels(cfg) {
  var els = [];
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT STAT ROW (SLIDE 74)  ->  cfg.layout = "reportStatRow"
// Template: "Report Stat Row (slide 74)"
// Source slide: 74   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportStatRow(cfg) {
  var els = [];
  var COLX  = [1.66, 4.01, 6.36, 8.72, 11.07];
  var BANDS = [
    { label:1.92, copy:2.28, h:0.65, color:'bodyGray' },
    { label:3.23, copy:3.59, h:0.85, color:'#CAA380' },
    { label:4.89, copy:5.21, h:1.94, color:'bodyGray' }
  ];

  // Header. Typed uppercase in the source with no cap attribute, so the engine
  // is told explicitly rather than left to guess.
  els.push({ type:'t', text:cfg.title || cfg.subhead || '', x:0.46, y:0.38, w:12.4, h:0.5,
    font:'H', size:23.8, color:'white', caps:true, lineSpacing:1, charSpacing:-0.475,
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
      font:'B', size:12, color:'paper', caps:false, lineSpacing:1,
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT STAT ROW LIGHT (SLIDE 75)  ->  cfg.layout = "reportStatRowLight"
// Template: "Report Stat Row Light (slide 75)"
// Source slide: 75   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportStatRowLight(cfg) {
  var els = [];
  var COLX  = [1.66, 4.01, 6.36, 8.72, 11.07];
  var BANDS = [
    { label:1.92, copy:2.28, h:0.65, color:'bodyGray' },
    { label:3.23, copy:3.59, h:0.85, color:'#CAA380' },
    { label:4.89, copy:5.21, h:1.94, color:'bodyGray' }
  ];

  // Header. Typed uppercase in the source with no cap attribute, so the engine
  // is told explicitly rather than left to guess.
  els.push({ type:'t', text:cfg.title || cfg.subhead || '', x:0.46, y:0.38, w:12.4, h:0.5,
    font:'H', size:23.8, color:'bodyGray', caps:true, lineSpacing:1, charSpacing:-0.475,
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
      font:'B', size:12, color:'asphalt', caps:false, lineSpacing:1,
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT SPEND BARS LIGHT (SLIDE 86)  ->  cfg.layout = "reportSpendBarsLight"
// Template: "Report Spend Bars Light (slide 86)"
// Source slide: 86   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportSpendBarsLight(cfg) {
  var els = [];
  var ROWY  = [2.02, 2.83, 3.65, 4.46, 5.28, 6.09];
  var TRACK_X = 0.52, TRACK_W = 12.28, MIN_W = 4.22;
  var PALETTE = ['#416986', '#86ABBF', '#4A634D', '#BFA588', '#808080', '#262626'];

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
  return els;
}


// ==========================================================
// LAYOUT: REPORT SPEND BARS DARK (SLIDE 87)  ->  cfg.layout = "reportSpendBarsDark"
// Template: "Report Spend Bars Dark (slide 87)"
// Source slide: 87   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportSpendBarsDark(cfg) {
  var els = [];
  var ROWY  = [2.02, 2.83, 3.65, 4.46, 5.28, 6.09];
  var TRACK_X = 0.52, TRACK_W = 12.28, MIN_W = 4.22;
  var PALETTE = ['#416986', '#86ABBF', '#4A634D', '#BFA588', '#808080', '#57517E'];

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
  return els;
}


// ==========================================================
// LAYOUT: REPORT MODEL COMPARE (SLIDE 89)  ->  cfg.layout = "reportModelCompare"
// Template: "Report Model Compare (slide 89)"
// Source slide: 89   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportModelCompare(cfg) {
  var els = [];
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT BRAND PILLARS (SLIDE 90)  ->  cfg.layout = "reportBrandPillars"
// Template: "Report Brand Pillars (slide 90)"
// Source slide: 90   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportBrandPillars(cfg) {
  var els = [];
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT PLATFORM MATRIX (SLIDE 91)  ->  cfg.layout = "reportPlatformMatrix"
// Template: "Report Platform Matrix (slide 91)"
// Source slide: 91   Background: solid #EFF0F3
// Set slideData.bgColor = "#EFF0F3".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportPlatformMatrix(cfg) {
  var els = [];
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
  return els;
}


// ==========================================================
// LAYOUT: REPORT ECOSYSTEM TREE (SLIDE 92)  ->  cfg.layout = "reportEcosystemTree"
// Template: "Report Ecosystem Tree (slide 92)"
// Source slide: 92   Background: solid #EFF0F3
// Set slideData.bgColor = "#EFF0F3".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportEcosystemTree(cfg) {
  var els = [];
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

  // Primary node last, so it wins every overlap.
  if (cfg.root) {
    els.push({ type:'o', x:CX - NODE_R, y:NODE_CY - NODE_R, w:NODE_R * 2, h:NODE_R * 2,
      gradient:DISC, stroke:'white', strokeWidth:1, shadow:true });
    if (cfg.root.icon) els.push({ type:'i', icon:cfg.root.icon, x:CX - 0.2, y:NODE_CY - 0.2,
      w:0.4, h:0.4, color:'#5E5E5E' });
    else if (cfg.root.label) els.push({ type:'t', text:cfg.root.label,
      x:CX - NODE_R, y:NODE_CY - NODE_R, w:NODE_R * 2, h:NODE_R * 2,
      font:'B', size:7, color:'#5E5E5E', align:'center', valign:'middle',
      caps:true, lineSpacing:1, insets:{l:0.02,t:0.02,r:0.02,b:0.02} });
  }
  return els;
}


// ==========================================================
// LAYOUT: REPORT METRIC TABLE (SLIDE 95)  ->  cfg.layout = "reportMetricTable"
// Template: "Report Metric Table (slide 95)"
// Source slide: 95   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: REPORT QUOTE PANEL (SLIDE 96)  ->  cfg.layout = "reportQuotePanel"
// Template: "Report Quote Panel (slide 96)"
// Source slide: 96   Background: solid #EFF0F3
// Set slideData.bgColor = "#EFF0F3" (engine honours bgColor on export + preview).
// ==========================================================
function layout_reportQuotePanel(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.78, y:2.45, w:10.61, h:1.14, font:'H', size:35, color:'bodyGray', valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'s', x:0.82, y:3.8, w:5.38, h:1.52, fill:'white' });
  els.push({ type:'s', x:0.82, y:3.8, w:0.06, h:1.52, fill:'accentDim' });
  els.push({ type:'s', x:6.41, y:3.8, w:5.38, h:1.52, fill:'white' });
  els.push({ type:'s', x:6.41, y:3.8, w:0.06, h:1.52, fill:'accentDim' });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:1, y:3.87, w:5.11, h:0.34, font:'B', size:8.5, color:'accentDim', bold:true, valign:'middle', caps:false, lineSpacing:1, charSpacing:1.41, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:6.6, y:3.87, w:5.11, h:0.34, font:'B', size:8.5, color:'accentDim', bold:true, valign:'middle', caps:false, lineSpacing:1, charSpacing:1.41, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:1, y:4.16, w:5.11, h:0.42, font:'B', size:13.5, color:'nearBlack', bold:true, valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:6.6, y:4.16, w:5.11, h:0.42, font:'B', size:13.5, color:'nearBlack', bold:true, valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:1, y:4.57, w:5.11, h:0.52, font:'B', size:10, color:'#4D4D4D', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:6.6, y:4.57, w:5.11, h:0.52, font:'B', size:10, color:'#4D4D4D', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'s', x:0.82, y:5.45, w:5.38, h:1.52, fill:'white' });
  els.push({ type:'s', x:0.82, y:5.45, w:0.06, h:1.52, fill:'accentDim' });
  els.push({ type:'s', x:6.41, y:5.45, w:5.38, h:1.52, fill:'white' });
  els.push({ type:'s', x:6.41, y:5.45, w:0.06, h:1.52, fill:'accentDim' });
  els.push({ type:'t', text:(cfg.items && cfg.items[4]) || "", x:1, y:5.51, w:5.11, h:0.34, font:'B', size:8.5, color:'accentDim', bold:true, valign:'middle', caps:false, lineSpacing:1, charSpacing:1.41, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[5]) || "", x:6.6, y:5.51, w:5.11, h:0.34, font:'B', size:8.5, color:'accentDim', bold:true, valign:'middle', caps:false, lineSpacing:1, charSpacing:1.41, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[6]) || "", x:1, y:5.81, w:5.11, h:0.42, font:'B', size:13.5, color:'nearBlack', bold:true, valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[7]) || "", x:6.6, y:5.81, w:5.11, h:0.42, font:'B', size:13.5, color:'nearBlack', bold:true, valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[8]) || "", x:1, y:6.21, w:5.11, h:0.52, font:'B', size:10, color:'#4D4D4D', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[9]) || "", x:6.6, y:6.21, w:5.11, h:0.52, font:'B', size:10, color:'#4D4D4D', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: REPORT CHAPTER OPENER (SLIDE 97)  ->  cfg.layout = "reportChapterOpener"
// Template: "Report Chapter Opener (slide 97)"
// Source slide: 97   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: the auto-generated version put cfg.title (a free-text slot)
// where the source has a fixed decorative arrow -- with real content that
// slot wrapped into vertical text between the two boxes. It also centered
// the headline vertically in a box sized for one line, so a two-line wrap
// grew upward into the eyebrow above it instead of down. And the tan left
// edge on the black box was drawn UNDER the box instead of over it, so the
// box's own fill covered all but a ~0.005in sliver of it.
//
// Font sizes below are all raw-template-pt / RATIO, RATIO being the
// template canvas's own scale factor over the engine canvas (26.667in /
// 13.33in = 2.0005, confirmed against the source .pptx's actual slide
// dimensions -- same factor HANDOFF.md documents for the whole deck).
// Every size in this layout follows that one ratio, including the primary
// body copy -- there is no field-specific exception.
// ==========================================================
function layout_reportChapterOpener(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:12.12, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.text || '', x:0.61, y:0.85, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.61, y:1.33, w:12.12, h:0.39, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'s', x:0.86, y:2.46, w:5.45, h:4.19, fill:'white' });
  // Black box drawn BEFORE the tan bar so the bar sits on top of it, fully
  // visible as a 0.08in accent stripe on its inner-left edge -- matches the
  // source's own shape order (tan bar is the LAST shape in that group, i.e.
  // topmost). Drawing it first (underneath) let the box's own fill cover
  // all but a hairline of it.
  els.push({ type:'s', x:7.22, y:2.46, w:5.45, h:4.19, fill:'nearBlack' });
  els.push({ type:'s', x:7.21, y:2.46, w:0.08, h:4.19, fill:'accentDim' });
  els.push({ type:'t', text:cfg.text2 || 'CHAPTER 1', x:1.16, y:2.78, w:4.84, h:0.17, font:'B', size:7.5, color:'bodyGray', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.87, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.text3 || 'CHAPTER 2 \u00b7 TODAY', x:7.52, y:2.81, w:4.84, h:0.11, font:'B', size:7.5, color:'accentDim', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.87 });
  // Headline pair, top-anchored so a wrap to a second line grows down into
  // the empty space above the primary body copy rather than up into the
  // eyebrow directly above it.
  els.push({ type:'t', text:cfg.text4 || 'Lorem Ipsum', x:1.17, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'nearBlack', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:7.53, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'white', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  else els.push({ type:'t', text:'Lorem Ipsum', x:7.53, y:3.06, w:4.82, h:1.1, font:'B', size:33, color:'white', bold:true, valign:'top', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  // Fixed decorative arrow between the two boxes -- not a content slot.
  els.push({ type:'t', text:'\u2192', x:6.37, y:4.11, w:0.78, h:0.89, font:'B', size:60, color:'accentDim', bold:true, align:'center', valign:'middle', caps:false, lineSpacing:1 });
  // Primary body copy: source declares 40pt raw -> 40 / 2.0005 = 20pt engine.
  els.push({ type:'t', text:cfg.text5 || 'Lorem ipsum dolor sit amet', x:1.17, y:4.43, w:4.82, h:0.37, font:'B', size:20, color:'nearBlack', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.text6 || 'Lorem ipsum dolor sit amet', x:7.53, y:4.43, w:4.82, h:0.37, font:'B', size:20, color:'white', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || 'STATUS \u00b7 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', x:1.22, y:5.59, w:4.73, h:0.7, font:'B', size:10, color:'bodyGray', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.66, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || 'WHAT THIS UNLOCKS \u00b7 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', x:7.57, y:5.59, w:4.73, h:0.7, font:'B', size:10, color:'accentDim', bold:true, valign:'middle', caps:true, lineSpacing:1, charSpacing:1.66, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  return els;
}

// ==========================================================
// LAYOUT: REPORT STRATEGY STACK (SLIDE 98)  ->  cfg.layout = "reportStrategyStack"
// Template: "Report Strategy Stack (slide 98)"
// Source slide: 98   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: replaces a flat cfg.items[] version whose single-string
// slots couldn't hold the source's two-tone / two-weight text pairs (badge
// header+body, point/point headline, insight header+body, panel subhead+
// sections, activation label+body, footer header+body) -- collapsing each
// pair into one flat string dropped the second half of every pair. The two
// chevrons were also wired to cfg.subhead/cfg.text5 (free-text slots) where
// the source has a fixed "\u203a" glyph, the same bug pattern already fixed
// on reportChapterOpener's arrow.
//
// All boxes: rounded corners + drop shadow (Format Shape > Shadow: black,
// 65% transparency / 0.35 opacity, 8pt blur, 90deg angle, 3pt distance).
// Corner radius is approximated at a uniform 0.07in -- the source's actual
// per-box adj values range 0.06-0.08in, visually indistinguishable at this
// scale.
// ==========================================================
function layout_reportStrategyStack(cfg) {
  var els = [];
  var SHADOW = { angle: 90, offset: 3 / 72, blur: 8 / 72, opacity: 0.35 };
  var R = 0.07;
  var STROKE = '#3A3A3A';

  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.72, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.intro || '', x:0.61, y:1.33, w:4.95, h:0.39, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // Top-right badges: tan caps sub-header + white body, one line each.
  // Content should be kept to one line per field -- these boxes are fixed
  // at 2-line capacity and do not grow with longer input. Font is sized
  // down from the source's literal 10.5pt-equivalent because at the box's
  // actual 2.18in width that size wrapped "CONSUMER REPORTS" to two lines,
  // which the fixed-height box doesn't clip (text divs aren't nested inside
  // their background shape, so an overflow just paints over the row below).
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

// ==========================================================
// ==========================================================
// LAYOUT: REPORT JOURNEY MAP (SLIDE 99)  ->  cfg.layout = "reportJourneyMap"
// Template: "Report Journey Map (slide 99)"
// Source slide: 99   Background: solid #F2F2F2
// Set slideData.bgColor = "#F2F2F2".
// HAND-AUTHORED: replaces a flat cfg.items[] version that was missing most
// of its own content -- two of each column's three body sections (under
// DELIVERABLES and DEFINE REVIEW TIMELINE) had a header and no bullets, and
// the third had bullets and no header. None of the three section headers
// were underlined (the engine had no underline support at all -- added in
// standard-deck.js alongside caps/charSpacing/shadow). The icon "circles"
// were plain rectangles. The connector line under "WE ARE HERE" was a
// 0.01in-wide filled rectangle standing in for a line, so it couldn't carry
// arrowheads.
//
// cfg.panels: array of 4 { tone:'dark'|'tan', icon, header, date, sections }
//   sections: array of 3 { label, items } -- items is a list where each
//   entry is a plain string (grey bullet) or { text, bold, color } for a
//   bullet that needs to stand out, e.g. an approval-deadline date.
// tone controls which of the two source treatments a column gets: 'dark'
// (asphalt header/icon, tan date text) or 'tan' (accentDim header/icon,
// asphalt date text) -- matches the source's one-tan-of-four column.
// ==========================================================
function layout_reportJourneyMap(cfg) {
  var els = [];
  var COL_X = [0.19, 3.47, 6.74, 10.02];
  var COL_W = 3.12;
  var SECTIONS_Y = [3.09, 4.24, 5.88];
  var SECTIONS_H = [0.94, 1.26, 0.93];
  var DEFAULT_LABELS = ['DELIVERABLES:', 'DEFINE REVIEW TIMELINE:', 'CLIENT REVIEWERS'];

  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:12.12, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:(typeof cfg.hereLabel === 'string' ? cfg.hereLabel : 'WE ARE HERE'), x:4.13, y:1.43, w:1.8, h:0.16, font:'B', size:10, color:'#8D7057', bold:true, align:'center', valign:'middle', caps:true, lineSpacing:1, charSpacing:1.7 });
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

// ==========================================================
// LAYOUT: REPORT GATE STATUS (SLIDE 100)  ->  cfg.layout = "reportGateStatus"
// Template: "Report Gate Status (slide 100)"
// Source slide: 100   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// HAND-AUTHORED: replaces a flat 32-slot cfg.items[] version. Fully rebuilt
// from the real source: the ribbon headers are PowerPoint's native
// "chevron" preset shape (adj=0.2004), not a generic rectangle -- verified
// by reading the shape XML directly, not guessed from appearance.
//
// cfg.gates: array of 6 { number, title, subhead, bullets }. number is a
// plain string ("1", "2", ...) rendered as "N. TITLE" on the ribbon.
// subhead is optional (the black caps box); bullets is an array of strings.
// cfg.dividers: array of up to 5 { label } "gate cleared" markers, one per
// gap between ribbons (2 gaps per row + return gap = 5 max). Pass fewer to
// only show some; omit cfg.dividers entirely to hide all of them.
// cfg.showConnector: false to hide the row1->row2 connector line (shown by
// default).
// ==========================================================
function layout_reportGateStatus(cfg) {
  var els = [];
  var COL_W = 3.954, ROW_H = 0.539, GAP = 0.07;
  var COL_X = [0.654, 0.654 + COL_W + GAP, 0.654 + (COL_W + GAP) * 2];
  var ROW_Y = [0.412, 3.693];
  var SUB_GAP = 0.233, SUB_H = 0.22, SUB_W = 3.149;
  var BULLET_GAP = 0.08;
  // Chevron polygon: PowerPoint's "chevron" preset, adj=0.2004 -- notch/point
  // depth = min(w,h) * adj. Left corners stay at x=0 (clean 90deg corners,
  // not cut on a diagonal); the notch tip is pulled inward from there. Right
  // corners stay at x=1-nd with the point tip at x=1. An earlier version of
  // this shape started the top/bottom edges at x=nd instead of x=0, which
  // both angled the corners AND put the "notch" outside the shape as a
  // leftward bulge instead of cutting into it -- fixed here.
  var ADJ = 0.2004;
  var depthFrac = (Math.min(COL_W, ROW_H) * ADJ);
  var nd = depthFrac / COL_W;
  var CHEVRON_PTS = [[0,0],[1-nd,0],[1,0.5],[1-nd,1],[0,1],[nd,0.5]];

  // Gate dividers pushed BEFORE the chevrons/gates below. Confirmed against
  // the source's actual per-instance Y positions: dividers sit just below
  // each row's ribbon (a ~0.12-0.2in gap), not centered on/overlapping it --
  // an earlier version of this wrongly centered the divider vertically on
  // the ribbon row, which pushed row 1's dividers above the canvas top.
  var DIV_W = 0.236, DIV_H = 1.771, DIV_TOP_GAP = 0.16;
  var GAP_CENTERS = [
    { x: COL_X[0] + COL_W + GAP / 2, y: ROW_Y[0] },
    { x: COL_X[1] + COL_W + GAP / 2, y: ROW_Y[0] },
    { x: COL_X[0] + COL_W + GAP / 2, y: ROW_Y[1] },
    { x: COL_X[1] + COL_W + GAP / 2, y: ROW_Y[1] },
    { x: COL_X[2] + COL_W + GAP / 2, y: ROW_Y[1] }
  ];
  var dividers = cfg.dividers || [];
  dividers.slice(0, 5).forEach(function (d, i) {
    var c = GAP_CENTERS[i]; if (!c) return;
    var dx0 = c.x - DIV_W / 2, dy0 = c.y + ROW_H + DIV_TOP_GAP;
    els.push({ type:'s', x:dx0, y:dy0, w:DIV_W, h:DIV_H, fill:'accentDim' });
    var cx = dx0 + DIV_W / 2, cy = dy0 + DIV_H / 2;
    els.push({ type:'t', text:d.label || d, x:cx - DIV_H / 2, y:cy - DIV_W / 2, w:DIV_H, h:DIV_W, font:'B', size:7, color:'white', bold:true, align:'center', valign:'middle', caps:true, lineSpacing:1, rotation:90 });
  });

  var gates = cfg.gates || [];
  var gateBottom = []; // per-column bottom Y of each row's content, for reference
  COL_X.forEach(function (colX, ci) {
    ROW_Y.forEach(function (rowY, ri) {
      var g = gates[ri * 3 + ci] || {};
      els.push({ type:'s', x:colX, y:rowY, w:COL_W, h:ROW_H, fill:'gray', points:CHEVRON_PTS });
      els.push({ type:'t', text:((g.number || (ri*3+ci+1)) + '. ' + (g.title || '')), x:colX + 0.27, y:rowY + 0.127, w:COL_W - 0.54, h:0.285, font:'B', size:13.5, color:'white', bold:true, valign:'middle', caps:true, lineSpacing:1 });
      var y = rowY + ROW_H + SUB_GAP;
      // Centered in the column's width beneath the chevron above it -- both
      // the subhead box and the bullets under it share this offset, so the
      // whole content block stays aligned as one unit. Previously only
      // colX (the column/chevron's own left edge) was used, which put all
      // the box's margin-from-column on the right side only.
      var subX = colX + (COL_W - SUB_W) / 2;
      if (g.subhead) {
        els.push({ type:'s', x:subX, y:y, w:SUB_W, h:SUB_H, fill:'#3A3A3A' });
        // Insets trimmed from the source's 0.104in to 0.05in to reclaim
        // width for the text without changing the box itself (box size is
        // correct per the source; this sandbox's Arial fallback for Mazda
        // Type is what's actually causing the wrap -- see note below).
        els.push({ type:'t', text:g.subhead, x:subX, y:y, w:SUB_W, h:SUB_H, font:'B', size:9, color:'white', bold:true, valign:'middle', caps:true, lineSpacing:1, insets:{l:0.05,t:0.035,r:0.05,b:0.035} });
        y += SUB_H + BULLET_GAP;
      }
      if (g.bullets && g.bullets.length) {
        els.push({ type:'t', x:subX, y:y, w:SUB_W, h:(ROW_Y[1] - ROW_Y[0]) - (y - rowY) - 0.1, font:'B', size:10, color:'black', valign:'top', caps:false, lineSpacing:1.15,
          insets:{l:0.104,t:0.035,r:0.104,b:0.035},
          paras:g.bullets.map(function (b) { return { runs:[{ text:b }], bullet:true, marL:0.12, indent:-0.12 }; }) });
      }
    });
  });

  // Gate dividers: comment kept with the code above where they're actually
  // pushed now (before the chevrons). Text is built as a normal horizontal
  // box (matches the source's own pre-rotation text properties -- middle
  // valign, horizontal direction) sized to the divider's visible HEIGHT,
  // then rotated 90deg in place so it reads vertically.

  // Connector: dotted-end line from the last ribbon of row 1 (its outward
  // point) down to the first ribbon of row 2 (its inward notch), held off
  // the ribbons by CONNECTOR_GAP rather than touching them. The horizontal
  // run sits just above row 2's chevrons (not halfway between the rows) so
  // it clears row 1's tan gate dividers, which extend down to ~2.88in --
  // the previous halfway placement cut straight through them.
  if (cfg.showConnector !== false) {
    var CONNECTOR_GAP = 0.12, ROW2_CLEARANCE = 0.1;
    var r1x = COL_X[2] + COL_W + CONNECTOR_GAP, r1y = ROW_Y[0] + ROW_H / 2;
    var r2x = COL_X[0] - CONNECTOR_GAP, r2y = ROW_Y[1] + ROW_H / 2;
    var midY = ROW_Y[1] - ROW2_CLEARANCE;
    els.push({ type:'ln', x:r1x, y:r1y, w:0.3, h:0, color:'black', weight:2, markerStyle:'dot', arrows:'start' });
    els.push({ type:'ln', x:r1x + 0.3, y:r1y, w:0, h:midY - r1y, color:'black', weight:2 });
    els.push({ type:'ln', x:r1x + 0.3, y:midY, w:r2x - 0.3 - (r1x + 0.3), h:0, color:'black', weight:2 });
    els.push({ type:'ln', x:r2x - 0.3, y:midY, w:0, h:r2y - midY, color:'black', weight:2 });
    els.push({ type:'ln', x:r2x - 0.3, y:r2y, w:0.3, h:0, color:'black', weight:2, markerStyle:'dot', arrows:'end' });
  }

  return els;
}

// ==========================================================
// ==========================================================
// LAYOUT: REPORT NUMBERED STEPS (SLIDE 101)  ->  cfg.layout = "reportNumberedSteps"
// Template: "Report Numbered Steps (slide 101)"
// Source slide: 101   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// HAND-AUTHORED: replaces a flat 24-slot cfg.items[] version. Rebuilt from
// the real source, including its connector line's exact bezier path (read
// from the custGeom XML directly, not approximated) -- required the engine
// to gain a new element type (type:'path') since the connector is a real
// S-curve, not straight segments; renderLine only ever drew straight lines.
//
// 6 fixed steps in a 3-col x 2-row serpentine (row 2 is offset right of
// row 1 by design, not misaligned -- matches the source). cfg.steps: array
// of 6 { number, label, subhead, intro, bullets }. label is shown on BOTH
// the tan pill above and the black pill below, matching the source (both
// pills carry identical text per step, just different fill/text color).
// number defaults to the step's position (1-6) if omitted. intro is an
// optional non-bulleted first line before bullets, matching the source's
// own body-copy pattern.
// ==========================================================
function layout_reportNumberedSteps(cfg) {
  var els = [];
  // Column/row positions, taken directly from the source (row 2 is shifted
  // ~1.04in right of row 1 -- part of the serpentine layout, not a mistake).
  var TAN_X = [[0.934, 4.808, 8.583], [1.977, 5.851, 9.626]];
  var TAN_Y = [1.978, 4.289];
  var TAN_W = 1.6, TAN_H = 0.292;
  var GRP_X = [[1.379, 5.222, 9.065], [2.422, 6.265, 10.108]];
  var GRP_Y = [2.338, 4.649];

  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.606, y:0.536, w:12.118, h:0.292, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.606, y:0.847, w:12.118, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro) els.push({ type:'t', text:cfg.intro, x:0.606, y:1.333, w:12.118, h:0.386, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // Connector: real bezier S-curve, decoded from the source's own custGeom
  // path (straight along each row, curved at the turns) -- large tan dot
  // at the start, arrow off-slide at the end.
  if (cfg.showConnector !== false) {
    els.push({ type:'path', x:0.641, y:2.121, w:12.049, h:4.639, color:'accentDim', weight:5,
      startMarker:'oval', endMarker:'triangle',
      path:[
        { cmd:'M', x:0, y:0 },
        { cmd:'L', x:0.9037, y:0 },
        { cmd:'C', x1:0.9569, y1:0, x2:1, y2:0.1119, x:1, y:0.25 },
        { cmd:'C', x1:1, y1:0.3881, x2:0.9569, y2:0.5, x:0.9037, y:0.5 },
        { cmd:'L', x:0.0963, y:0.5 },
        { cmd:'C', x1:0.0431, y1:0.5, x2:0, y2:0.6119, x:0, y:0.75 },
        { cmd:'C', x1:0, y1:0.888, x2:0.0431, y2:1, x:0.0963, y:1 },
        { cmd:'L', x:1, y:1 }
      ] });
  }

  var steps = cfg.steps || [];
  for (var row = 0; row < 2; row++) {
    for (var col = 0; col < 3; col++) {
      var i = row * 3 + col;
      var st = steps[i] || {};
      var label = (st.number || (i + 1)) + '. ' + (st.label || '');
      var tx = TAN_X[row][col], ty = TAN_Y[row];
      var gx = GRP_X[row][col], gy = GRP_Y[row];

      // Tan pill (drawn on top of the connector, which passes behind it).
      els.push({ type:'s', x:tx, y:ty, w:TAN_W, h:TAN_H, fill:'accentDim', radius:'pill' });
      els.push({ type:'t', text:label, x:tx + 0.04, y:ty + 0.02, w:TAN_W + 0.13, h:TAN_H - 0.03, font:'B', size:12, color:'#EEEEEE', valign:'middle', caps:true, lineSpacing:1 });

      // Black pill.
      els.push({ type:'s', x:gx, y:gy, w:TAN_W, h:TAN_H, fill:'asphalt', radius:'pill' });
      els.push({ type:'t', text:label, x:gx + 0.04, y:gy + 0.02, w:TAN_W + 0.13, h:TAN_H - 0.03, font:'B', size:12, color:'#868686', valign:'middle', caps:true, lineSpacing:1 });

      // Tan pill -> black pill -> subhead is a 3-level stairstep in the
      // source, each level offset ~0.70in (raw) / 0.35in (engine) right and
      // down from the one above. The source's actual black-pill placement
      // drifts off that clean diagonal by ~0.19in raw -- confirmed by
      // reading its real coordinates, not assumed -- so anchoring the
      // subhead/body/line to the black pill (gx/gy) inherited that drift.
      // Anchoring them to the tan pill instead, two clean steps down,
      // keeps them uniform across all 6 steps regardless of how far off
      // any individual black pill happens to sit.
      var STEP = 0.35;
      var stairX = tx + 2 * STEP, stairY = ty + 2 * STEP;

      // Vertical dark-gray double-arrow line beneath the black pill.
      els.push({ type:'ln', x:stairX, y:stairY + 0.035, w:0, h:1.407, color:'#808080', weight:1.5, arrows:'both' });

      // Subhead + body, stair-stepped to align with the vertical line (not
      // flush with the pill's own left edge).
      if (st.subhead) {
        els.push({ type:'t', text:st.subhead, x:stairX, y:stairY, w:2.36, h:0.363, font:'B', size:10, color:'#CAA380', bold:true, caps:false, lineSpacing:1.1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
      }
      var bodyParas = [];
      if (st.intro) bodyParas.push({ runs:[{ text:st.intro }] });
      (st.bullets || []).forEach(function (b) { bodyParas.push({ runs:[{ text:b }], bullet:true, marL:0.12, indent:-0.12 }); });
      if (bodyParas.length) {
        els.push({ type:'t', x:stairX, y:stairY + 0.372, w:2.96, h:1.064, font:'B', size:10, color:'#808080', valign:'top', caps:false, lineSpacing:1.15, insets:{l:0.035,t:0.035,r:0.035,b:0.035}, paras:bodyParas });
      }
    }
  }

  return els;
}

// ==========================================================
// LAYOUT: TABLE OF CONTENTS  ->  cfg.layout = "tableOfContents"
// Template: "Table of contents"
// Source slide: 22   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
    // are visually identical -- but a literal \n in a run is collapsed by HTML
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
}

// ==========================================================
// LAYOUT: THANK YOU LIGHT  ->  cfg.layout = "thankYouLight"
// Template: "Thank You Light"
// Source slide: 52   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_thankYouLight(cfg) {
  var els = [];
  els.push({ type:'img', src:(cfg.assets && cfg.assets['thankyou_texture.png']) || A+'backgrounds/thankyou_texture.png', x:-0.01, y:0.02, w:13.34, h:7.5, transparency:34.4, crop:{"l": 0.1838, "t": 0.0904, "r": 0.0273, "b": 0.3536} });
  els.push({ type:'t', text:cfg.title || "THANK YOU", x:0.61, y:3.31, w:12.12, h:0.98, font:'H', size:54.5, color:'asphalt', align:'right', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['mmw_logo_black.png']) || A+'logos/mmw_logo_black.png', x:0.49, y:3.51, w:1.9, h:0.52 });
  if (cfg.date) els.push({ type:'t', text:cfg.date || '', x:1.9, y:7, w:12.01, h:0.35, font:'B', size:12, color:'mutedGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.025,t:0.025,r:0.025,b:0.025} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 });
  return els;
}

// ==========================================================
// LAYOUT: THANK YOU DARK  ->  cfg.layout = "thankYouDark"
// Template: "Thank You Dark"
// Source slide: 53   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_thankYouDark(cfg) {
  var els = [];
  els.push({ type:'img', src:(cfg.assets && cfg.assets['thankyou_texture.png']) || A+'backgrounds/thankyou_texture.png', x:-0.01, y:0.02, w:13.34, h:7.5, transparency:90.2, crop:{"l": 0.1838, "t": 0.0904, "r": 0.0273, "b": 0.3536} });
  els.push({ type:'t', text:cfg.title || "THANK YOU", x:0.61, y:3.29, w:12.12, h:0.98, font:'H', size:54.5, color:'accentDim', align:'right', caps:true, lineSpacing:1, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['mmw_logo_white_lg.png']) || A+'logos/mmw_logo_white_lg.png', x:0.49, y:3.51, w:1.9, h:0.52 });
  if (cfg.date) els.push({ type:'t', text:cfg.date || '', x:1.9, y:7, w:12.01, h:0.35, font:'B', size:12, color:'mutedGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.025,t:0,r:0.025,b:0} });
  els.push({ type:'img', ref:lockupRef(cfg), x:0.42, y:7.06, w:1.02, h:0.19 }); // brand mark (placeholder slot in template)
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 01  ->  cfg.layout = "content01"
// Template: "Content 01"
// Source slide: 23   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content01(cfg) {
  var els = [];
  ph(els, cfg, 6.62, 0.47, 6.71, 3.44, 0);
  els.push({ type:'t', text:cfg.title || "", x:0.76, y:3.2, w:5.52, h:0.6, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 0.81, 4.06, 6.73, 3.44, 1);
  els.push({ type:'t', text:cfg.text || '', x:7.83, y:4.1, w:4.16, h:1.44, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 02  ->  cfg.layout = "content02"
// Template: "Content 02"
// Source slide: 24   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content02(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.76, y:1.38, w:6.09, h:0.6, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.text || '', x:9.51, y:2.01, w:2.99, h:1.79, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 0.81, 2.05, 2.31, 1.75, 0);
  ph(els, cfg, 3.2, 2.05, 1.4, 1.75, 1);
  ph(els, cfg, 4.67, 2.05, 2.71, 1.75, 2);
  ph(els, cfg, 7.45, 2.05, 1.64, 1.75, 3);
  ph(els, cfg, 0.81, 3.87, 8.29, 3.29, 4);
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 03  ->  cfg.layout = "content03"
// Template: "Content 03"
// Source slide: 25   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content03(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.63, y:2.01, w:4.23, h:0.6, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 5.06, 2.03, 8.01, 3.28, 0);
  els.push({ type:'t', text:cfg.text || '', x:0.65, y:2.66, w:3.31, h:1.79, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 3.52, 5.42, 1.45, 1.75, 1);
  ph(els, cfg, 5.02, 5.42, 2.85, 1.74, 2);
  ph(els, cfg, 7.98, 5.42, 1.64, 1.75, 3);
  ph(els, cfg, 9.75, 5.42, 3.31, 1.75, 4);
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 05  ->  cfg.layout = "content05"
// Template: "Content 05"
// Source slide: 38   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content05(cfg) {
  var els = [];
  ph(els, cfg, 5.04, 1.59, 8.22, 5.01, 0);
  els.push({ type:'t', text:cfg.title || "", x:0.8, y:1.99, w:3.65, h:0.68, font:'HR', size:35, color:'bodyGray', bold:true, valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.8, y:2.82, w:3.65, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.8, y:3.51, w:3.65, h:1.76, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 06  ->  cfg.layout = "content06"
// Template: "Content 06"
// Source slide: 39   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content06(cfg) {
  var els = [];
  ph(els, cfg, 5.95, 0.13, 7.4, 3.62, 0);
  els.push({ type:'t', text:cfg.title || "", x:0.8, y:1.99, w:3.65, h:0.68, font:'HR', size:35, color:'bodyGray', bold:true, valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.8, y:2.82, w:3.65, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.8, y:3.51, w:3.65, h:1.76, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  // unfilled container at x:0.8 y:3.51 w:3.65 h:1.76 -- invisible in source, not emitted
  ph(els, cfg, 5.95, 4.01, 7.39, 3.5, 1);
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 07  ->  cfg.layout = "content07"
// Template: "Content 07"
// Source slide: 40   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content07(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:1.53, y:0.79, w:3.65, h:0.69, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:5.44, y:0.79, w:6.37, h:0.45, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:5.44, y:1.21, w:6.37, h:1.24, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 0.08, 2.91, 6.55, 4.11, 0);
  ph(els, cfg, 6.67, 2.91, 6.55, 4.11, 1);
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 08  ->  cfg.layout = "content08"
// Template: "Content 08"
// Source slide: 42   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content08(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "MOODBOARD", x:0.85, y:1.03, w:6.84, h:0.69, font:'H', size:35, color:'bodyGray', valign:'bottom', caps:true, lineSpacing:0.8, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 7.06, 1.11, 2.92, 5.95, 0);
  ph(els, cfg, 10.12, 1.11, 2.86, 2.47, 1);
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.85, y:1.78, w:2.84, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.85, y:2.53, w:2.74, h:2.47, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 10.12, 3.71, 2.86, 2.79, 2);
  ph(els, cfg, 4.42, 4.68, 2.51, 2.38, 3);
  els.push({ type:'s', x:11.3, y:5.36, w:0.46, h:0.99, fill:'#040B13' });
  els.push({ type:'s', x:11.3, y:6.43, w:0.46, h:0.9, fill:'#535B69' });
  els.push({ type:'s', x:11.3, y:7.4, w:0.46, h:0.9, fill:'#8D7057' });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 09  ->  cfg.layout = "content09"
// Template: "Content 09"
// Source slide: 43   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_content09(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "MOODBOARD", x:0.85, y:1.03, w:6.84, h:0.69, font:'H', size:35, color:'bodyGray', valign:'bottom', caps:true, lineSpacing:0.8, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 9.85, 1.12, 3.16, 5.99, 0);
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.85, y:1.75, w:6.84, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.85, y:2.22, w:5.58, h:2.12, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 1.01, 4.69, 3.13, 2.42, 1);
  ph(els, cfg, 4.24, 4.69, 2.96, 2.41, 2);
  ph(els, cfg, 7.3, 4.69, 2.46, 2.41, 3);
  els.push({ type:'s', x:0.85, y:4.71, w:0.1, h:0.81, fill:'#040B13' });
  els.push({ type:'s', x:0.85, y:5.58, w:0.1, h:0.73, fill:'#535B69' });
  els.push({ type:'s', x:0.85, y:6.37, w:0.1, h:0.73, fill:'#8D7057' });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT - 3 COLUMNS - DARK  ->  cfg.layout = "threeColDark"
// Template: "Content - 3 columns - Dark"
// Source slide: 29   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_threeColDark(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.9, y:1.91, w:11.53, h:0.79, font:'HR', size:35, color:'white', valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.9, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'lt2', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:5.02, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'lt2', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text2 || '', x:9.08, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'lt2', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.9, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:5.02, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:9.08, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT - 3 COLUMNS - LIGHT  ->  cfg.layout = "threeColLight"
// Template: "Content - 3 columns - Light"
// Source slide: 30   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_threeColLight(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "", x:0.9, y:1.91, w:11.53, h:0.79, font:'H', size:35, color:'bodyGray', valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.9, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:5.02, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text2 || '', x:9.08, y:3.2, w:2.97, h:0.69, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.9, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:5.02, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:9.08, y:3.96, w:3.4, h:1.59, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 2 ROWS - DARK  ->  cfg.layout = "twoRowsDark"
// Template: "Content 2 Rows - Dark"
// Source slide: 26   Background: solid #262626
// Set slideData.bgColor = "#262626" (engine honours bgColor on export + preview).
// ==========================================================
function layout_twoRowsDark(cfg) {
  var els = [];
  els.push({ type:'s', x:5.13, y:1.96, w:0.01, h:4.01, fill:'ltGray' }); // rule
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:6.21, y:2.11, w:2.97, h:0.45, font:'B', size:13, color:'lt2', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:6.21, y:2.6, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.73, y:3.11, w:4.08, h:0.79, font:'H', size:35, color:'paper', align:'right', valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.73, y:3.79, w:4.08, h:0.36, font:'B', size:10, color:'paper', align:'right', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:6.21, y:3.84, w:2.97, h:0.45, font:'B', size:13, color:'lt2', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:6.21, y:4.32, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT 2 ROWS - LIGHT  ->  cfg.layout = "twoRowsLight"
// Template: "Content 2 Rows - Light"
// Source slide: 28   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_twoRowsLight(cfg) {
  var els = [];
  els.push({ type:'s', x:5.13, y:1.96, w:0.01, h:4.01, fill:'ltGray' }); // rule
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:6.21, y:2.11, w:2.97, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:6.21, y:2.6, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.73, y:3.11, w:4.08, h:0.79, font:'H', size:35, color:'bodyGray', align:'right', valign:'bottom', caps:true, lineSpacing:0.8, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['thankyou_texture.png']) || A+'backgrounds/thankyou_texture.png', x:3.67, y:3.24, w:9.67, h:4.28, transparency:34.4, crop:{"r": 0.4283, "b": 0.6825} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.73, y:3.79, w:4.08, h:0.36, font:'B', size:10, color:'bodyGray', align:'right', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:6.21, y:3.84, w:2.97, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:6.21, y:4.32, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT - 2 ROWS - LIGHT  ->  cfg.layout = "twoRowsLightAlt"
// Template: "Content - 2 rows - Light"
// Source slide: 27   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_twoRowsLightAlt(cfg) {
  var els = [];
  els.push({ type:'s', x:5.13, y:1.96, w:0.01, h:4.01, fill:'ltGray' }); // rule
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:6.21, y:2.11, w:2.97, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:6.21, y:2.6, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.73, y:3.11, w:4.08, h:0.79, font:'H', size:35, color:'bodyGray', align:'right', valign:'bottom', caps:true, lineSpacing:0.8, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.73, y:3.79, w:4.08, h:0.36, font:'B', size:10, color:'bodyGray', align:'right', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:6.21, y:3.84, w:2.97, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:6.21, y:4.32, w:5.06, h:1.06, font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CONTENT GRAY  ->  cfg.layout = "reportGray"
// Template: "Content Gray"
// Source slide: 72   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportGray(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  return els;
}


// ==========================================================
// LAYOUT: CONTENT DARK  ->  cfg.layout = "reportDark"
// Template: "Content Dark"
// Source slide: 93   Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
function layout_reportDark(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  return els;
}


// ==========================================================
// LAYOUT: STORYBOARD 01  ->  cfg.layout = "storyboardVO"
// Template: "Storyboard 01"
// Source slide: 35   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_storyboardVO(cfg) {
  var els = [];
  ph(els, cfg, 7.06, -0, 6.27, 2.6, 0);
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.78, y:0.54, w:5.36, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.78, y:0.94, w:5.36, h:0.69, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.78, y:1.75, w:5.36, h:5.2, font:'B', size:10, color:'black', bold:true, valign:'middle', caps:false, lineSpacing:0.9, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 7.06, 2.69, 6.27, 2.28, 1);
  ph(els, cfg, 7.06, 5.07, 6.27, 2.44, 2);
  return els;
}

// ==========================================================
// LAYOUT: STORYBOARD 02  ->  cfg.layout = "storyboardGrid"
// Template: "Storyboard 02"
// Source slide: 36   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: SCRIPTS 01  ->  cfg.layout = "scriptsCompare"
// Template: "Scripts 01"
// Source slide: 37   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_scriptsCompare(cfg) {
  var els = [];
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.64, y:0.48, w:12.06, h:0.45, font:'B', size:13, color:'asphalt', valign:'bottom', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:0.64, y:0.82, w:12.06, h:0.69, font:'HR', size:35, color:'bodyGray', bold:true, caps:true, lineSpacing:0.8, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.64, y:1.6, w:4.93, h:5.2, font:'B', size:9.5, color:'black', bold:true, caps:false, lineSpacing:0.9, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  els.push({ type:'t', text:cfg.text2 || '', x:6.66, y:1.6, w:4.93, h:5.2, font:'B', size:9.5, color:'black', bold:true, caps:false, lineSpacing:0.9, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: VIDEO REFERENCE  ->  cfg.layout = "videoReference"
// Template: "Video Reference"
// Source slide: 44   Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE" (engine honours bgColor on export + preview).
// ==========================================================
function layout_videoReference(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "VIDEO REFERENCES", x:0.81, y:0.49, w:11.72, h:1.06, font:'HR', size:35, color:'bodyGray', bold:true, valign:'bottom', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:0.8, y:1.58, w:11.73, h:0.45, font:'B', size:13, color:'asphalt', caps:false, lineSpacing:1, charSpacing:0.52, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, 5.33, 2.5, 3.2, 2.49, 0);
  ph(els, cfg, 8.59, 2.5, 4.47, 1.77, 1);
  ph(els, cfg, 8.59, 4.34, 4.48, 2.49, 2);
  ph(els, cfg, 5.34, 5.05, 3.19, 1.77, 3);
  els.push({ type:'t', text:cfg.text || '', x:0.85, y:5.06, w:2.74, h:1.76, font:'B', size:10, color:'bodyGray', valign:'bottom', caps:false, lineSpacing:1.1, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: CASTING  ->  cfg.layout = "castingGrid"
// Template: "Casting"
// Source slide: 45   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: CASTING_TALENT  ->  cfg.layout = "castingTalent"
// Template: "Casting_Talent"
// Source slide: 46   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_castingTalent(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:6.79, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:0.85, w:6.79, h:0.5, font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  ph(els, cfg, 0.81, 2.08, 2.69, 2.81, 0);
  ph(els, cfg, 3.61, 2.08, 2.69, 4.2, 1);
  ph(els, cfg, 7.07, 2.08, 2.69, 2.81, 2);
  ph(els, cfg, 9.87, 2.08, 2.69, 4.2, 3);
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:4.18, y:3.18, w:1.52, h:0.27, font:'B', size:14, color:'ink', bold:true, align:'center', caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"Full body shot", x:10.44, y:3.18, w:1.52, h:0.27, font:'B', size:14, color:'ink', bold:true, align:'center', caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"Headshot", x:1.65, y:3.19, w:1.02, h:0.54, font:'B', size:14, color:'ink', bold:true, align:'center', caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"Headshot", x:7.91, y:3.19, w:1.02, h:0.54, font:'B', size:14, color:'ink', bold:true, align:'center', caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"Name:", x:0.81, y:4.94, w:2.69, h:0.59, font:'B', size:10, color:'captionGray', bold:true, valign:'middle', caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"Name:", x:7.06, y:5.01, w:2.69, h:0.59, font:'B', size:10, color:'captionGray', bold:true, caps:false, lineSpacing:1.2, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  return els;
}

// ==========================================================
// LAYOUT: LOCATION OVERVIEW  ->  cfg.layout = "locationOverview"
// Template: "Location Overview"
// Source slide: 47   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: LOCATION DETAIL  ->  cfg.layout = "locationDetail"
// Template: "Location Detail"
// Source slide: 48   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_locationDetail(cfg) {
  var els = [];
  ph(els, cfg, 11.24, -0.24, 1.38, 3.01, 0);
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:0.61, y:0.54, w:6.79, h:0.29, font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || "", x:0.61, y:0.85, w:6.79, h:0.34, font:'HR', size:24, color:'titleGray', bold:true, caps:true, lineSpacing:1, charSpacing:2.64, insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.text || '', x:0.61, y:1.96, w:4.95, h:1.15, font:'B', size:10, color:'titleGray', caps:false, lineSpacing:0.9, charSpacing:-0.09, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if ((cfg.subhead || cfg.subtitle)) els.push({ type:'t', text:cfg.subhead || cfg.subtitle || '', x:10.93, y:2.82, w:2, h:0.24, font:'B', size:12, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 0.01, 3.35, 2.69, 3.43, 1);
  ph(els, cfg, 2.84, 3.35, 6.06, 3.43, 2);
  ph(els, cfg, 9.04, 3.35, 4.33, 3.43, 3);
  return els;
}

// ==========================================================
// LAYOUT: MOODBOARD PROPS  ->  cfg.layout = "moodboardProps"
// Template: "Moodboard Props"
// Source slide: 49   Background: solid #D5D5D5
// Set slideData.bgColor = "#D5D5D5".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: MOODBOARD WARDROBE  ->  cfg.layout = "moodboardWardrobe"
// Template: "Moodboard Wardrobe"
// Source slide: 50   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF".
// HAND-AUTHORED: structured item API (auto-generation flattens this grid).
// ==========================================================
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
}

// ==========================================================
// LAYOUT: MOODBOARD  ->  cfg.layout = "moodboardToneManner"
// Template: "Moodboard "  (NOTE: trailing space in template name)
// Source slide: 51   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_moodboardToneManner(cfg) {
  var els = [];
  els.push({ type:'t', text:cfg.title || "TONE & MANNER", x:0.36, y:0.27, w:6.32, h:0.68, font:'HR', size:35, color:'title', bold:true, valign:'middle', caps:true, lineSpacing:0.8, charSpacing:-0.7, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  if (cfg.tag) els.push({ type:'t', text:cfg.tag || '', x:6.73, y:0.4, w:6.24, h:0.43, font:'B', size:14.5, color:'accentDim', align:'right', caps:true, lineSpacing:0.9, insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  ph(els, cfg, -0.01, 1.17, 4.43, 4.5, 0); // was demo photo image98.png
  ph(els, cfg, 4.41, 1.17, 2.55, 2.89, 1); // was demo photo image93.jpeg
  ph(els, cfg, 6.47, 1.17, 3.01, 2.72, 2); // was demo photo image94.jpeg
  ph(els, cfg, 9.48, 1.17, 3.85, 2.71, 3); // was demo photo image97.jpeg
  ph(els, cfg, 7.28, 3.87, 6.08, 3.67, 4); // was demo photo image96.jpeg
  ph(els, cfg, 4.41, 3.88, 2.92, 1.79, 5); // was demo photo image95.jpeg
  ph(els, cfg, 3.92, 5.67, 3.36, 1.85, 6); // was demo photo image100.jpeg
  ph(els, cfg, 0, 5.7, 3.95, 1.79, 7); // was demo photo image99.png
  return els;
}

// ==========================================================
// LAYOUT: META_DIVIDER  ->  cfg.layout = "metaDivider"
// Template: "Meta_Divider"
// Source slide: 55   Background: solid #000000
// Set slideData.bgColor = "#000000" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: the full-bleed background photo (fixed image
// + placeholder) is gone from the source -- background is solid black now.
// In its place, the source has a "PLACE YOUR OWN IMAGE... click here" pink
// instructional callout in the lower-right corner (not real content, never
// rendered) marking where a real logo placeholder belongs -- added as ph()
// slot 1 below, matching how the rest of the deck treats an author-fillable
// image well.
// ==========================================================
function layout_metaDivider(cfg) {
  var els = [];
  ph(els, cfg, 0.52, 3, 3.52, 0.71, 0); // Meta logo well, unchanged
  ph(els, cfg, 11.13, 6.65, 1.85, 0.55, 1); // "place your own image" corner well, new in 7/30/26
  els.push({ type:'s', x:10.83, y:7.15, w:0.9, h:0.01, fill:'ltGray' }); // rule
  return els;
}

// ==========================================================
// LAYOUT: META_CAROUSEL 1X1  ->  cfg.layout = "metaCarousel1x1"
// Template: "Meta_Carousel 1x1"
// Source slide: 57   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_metaCarousel1x1(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:13.35, h:2.73, fill:'#E2E2E2' });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:4.74, y:0.11, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:8.9, y:0.11, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:8.9, y:0.52, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:4.74, y:0.55, w:2.67, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_wordmark.png']) || A+'social/meta_wordmark.png', x:0.56, y:0.7, w:0.97, h:0.2 });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.6, y:1.07, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:8.9, y:1.13, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:8.9, y:1.54, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.6, y:1.56, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:4.74, y:1.74, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:8.9, y:1.96, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.58, y:2.01, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  // Fixed device chrome: the real "Facebook & Instagram Carousel MockUp"
  // asset (mazdausa header, dots, "Start customizing now" / "Shop now"
  // footer all baked in), positioned by matching its transparent
  // content-hole fraction against the source's own placeholder geometry --
  // not the old bezel-only overlay.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_carousel_frame.png']) || A+'social/meta_carousel_frame.png', x:0.68, y:1.781, w:2.142, h:4.977 });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:4.74, y:2.18, w:2.67, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 0.68, 3.15, 2.14, 3.27, 0);
  els.push({ type:'t', text:cfg.text2 || '', x:0.77, y:3.5, w:1.97, h:0.51, font:'B', size:6.5, color:'black', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"1:1 Carousel", x:10.68, y:3.64, w:1.23, h:0.23, font:'B', size:11, color:'captionGray', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 2.97, 4.04, 2.14, 2.13, 1);
  ph(els, cfg, 5.21, 4.04, 2.14, 2.13, 2);
  ph(els, cfg, 7.44, 4.04, 2.14, 2.13, 3);
  ph(els, cfg, 9.68, 4.04, 2.14, 2.13, 4);
  return els;
}

// ==========================================================
// LAYOUT: META_CAROUSEL 4X5  ->  cfg.layout = "metaCarousel4x5"
// Template: "Meta_Carousel 4x5"
// Source slide: 58   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_metaCarousel4x5(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:13.35, h:2.73, fill:'#E2E2E2' });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:4.74, y:0.11, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:8.9, y:0.11, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:8.9, y:0.52, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:4.74, y:0.55, w:2.67, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_wordmark.png']) || A+'social/meta_wordmark.png', x:0.56, y:0.7, w:0.97, h:0.2 });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.6, y:1.07, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:8.9, y:1.13, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:8.9, y:1.54, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.6, y:1.56, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:4.74, y:1.74, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:8.9, y:1.96, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.58, y:2.01, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  // Fixed device chrome: same real Meta Carousel MockUp asset as the 1x1
  // variant, repositioned for this format's own "main" content-well
  // geometry (index5 below, not the filmstrip cards).
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_carousel_frame.png']) || A+'social/meta_carousel_frame.png', x:0.71, y:2.673, w:2.042, h:3.881 });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:4.74, y:2.18, w:2.67, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 0.68, 2.99, 2.14, 0.32, 0);
  els.push({ type:'t', text:"4:5 Carousel", x:10.78, y:3.21, w:1.23, h:0.23, font:'B', size:11, color:'captionGray', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.text2 || '', x:0.77, y:3.34, w:1.97, h:0.51, font:'B', size:6.5, color:'black', caps:false, lineSpacing:1.1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 2.97, 3.6, 2.14, 2.67, 1);
  ph(els, cfg, 5.24, 3.6, 2.14, 2.67, 2);
  ph(els, cfg, 7.5, 3.6, 2.14, 2.67, 3);
  ph(els, cfg, 9.77, 3.6, 2.14, 2.67, 4);
  ph(els, cfg, 0.71, 3.74, 2.04, 2.55, 5);
  ph(els, cfg, 0.68, 6.37, 2.1, 0.2, 6);
  return els;
}

// ==========================================================
// LAYOUT: META_VIDEO&STATIC  ->  cfg.layout = "metaVideoStatic"
// Template: "Meta_Video&Static"
// Source slide: 56   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_metaVideoStatic(cfg) {
  var els = [];
  els.push({ type:'s', x:0, y:-0, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_wordmark.png']) || A+'social/meta_wordmark.png', x:0.56, y:0.7, w:0.97, h:0.2 });
  // Fixed device chrome: the real "Facebook & Instagram Reel MockUp" asset
  // (status bar, "Learn more" card, mazdausa caption, bottom nav all baked
  // in), positioned by matching its transparent content-hole fraction
  // against the source's own placeholder geometry -- not the generic
  // bezel-only overlay used before.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_reel_frame.png']) || A+'social/meta_reel_frame.png', x:5.13, y:1.154, w:2.465, h:6.279 });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['meta_reel_frame.png']) || A+'social/meta_reel_frame.png', x:8.73, y:1.154, w:2.465, h:6.279 });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:"9:16 STATIC REEL", x:5.63, y:1.02, w:1.38, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"9:16 STORY", x:9.44, y:1.02, w:0.97, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 5.13, 1.48, 2.46, 5.23, 0);
  ph(els, cfg, 8.73, 1.48, 2.46, 5.23, 1);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: REDDIT_DIVIDER  ->  cfg.layout = "redditDivider"
// Template: "Reddit_Divider"
// Source slide: 65   Background: solid #000000
// Set slideData.bgColor = "#000000" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: two overlapping full-bleed wells removed
// (background is solid black now); the side photo and the Reddit logo well
// are unchanged. Added the new "place your own image" corner well -- see
// metaDivider's comment for why.
// ==========================================================
function layout_redditDivider(cfg) {
  var els = [];
  ph(els, cfg, 5.48, -0.02, 7.89, 7.53, 0); // side photo, unchanged
  ph(els, cfg, 1.01, 3.28, 3.28, 1.85, 1); // Reddit logo well, unchanged
  ph(els, cfg, 11.13, 6.65, 1.85, 0.55, 2); // "place your own image" corner well, new in 7/30/26
  els.push({ type:'s', x:10.83, y:7.15, w:0.9, h:0.01, fill:'ltGray' }); // rule
  return els;
}

// ==========================================================
// LAYOUT: REDDIT_CAROUSEL  ->  cfg.layout = "redditCarousel"
// Template: "Reddit_Carousel"
// Source slide: 68   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_redditCarousel(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:13.35, h:2.73, fill:'#E2E2E2' });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:4.74, y:0.11, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:8.9, y:0.11, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 0.61, 0.44, 1.22, 0.68, 0);
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:8.9, y:0.52, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:4.74, y:0.55, w:2.67, h:1.17, font:'B', size:11.5, color:'mutedGray', bold:true, caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.6, y:1.07, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:true, lineSpacing:1.15, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:8.9, y:1.13, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:8.9, y:1.54, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.6, y:1.56, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:4.74, y:1.74, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:8.9, y:1.96, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.58, y:2.01, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', bold:true, caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  // Fixed device chrome around the first carousel card only (matches how
  // Reddit's real carousel ads render -- first card carries full post
  // context, the rest are plain swipeable thumbnails). Repositioned to the
  // real Reddit UI mockup's content-hole fraction; the previous overlay
  // pair didn't match this card's actual bounds.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_video_frame.png']) || A+'social/reddit_video_frame.png', x:0.74, y:3.304, w:3.123, h:3.164 });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:4.74, y:2.18, w:2.67, h:0.38, font:'B', size:11.5, color:'mutedGray', bold:true, caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:"4:5 Carousel", x:11.45, y:3.3, w:0.83, h:0.16, font:'B', size:7, color:'captionGray', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  ph(els, cfg, 3.53, 3.56, 2.1, 2.62, 1);
  ph(els, cfg, 1.26, 3.57, 2.08, 2.6, 2);
  ph(els, cfg, 5.72, 3.57, 2.1, 2.62, 3);
  ph(els, cfg, 7.9, 3.57, 2.1, 2.62, 4);
  ph(els, cfg, 10.08, 3.57, 2.1, 2.62, 5);
  return els;
}

// ==========================================================
// LAYOUT: REDDIT_VID&STATIC1:1  ->  cfg.layout = "redditVideoStatic1x1"
// Template: "Reddit_Vid&Static1:1"
// Source slide: 67   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_redditVideoStatic1x1(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_brand_photo.png']) || A+'social/reddit_brand_photo.png', x:0.44, y:0.23, w:1.75, h:0.98 });
  // Fixed device chrome: the real Reddit UI mockup (status bar, upvote/
  // comment/share/award row, u/username caption, Home/Inbox/You nav all
  // baked in), positioned by matching its checkerboard content-hole
  // fraction against the source's own placeholder geometry.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_video_frame.png']) || A+'social/reddit_video_frame.png', x:4.413, y:2.32, w:4.129, h:5.124 });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_video_frame.png']) || A+'social/reddit_video_frame.png', x:7.813, y:2.32, w:4.129, h:5.124 });
  ph(els, cfg, 0.61, 0.44, 1.22, 0.62, 0); // was demo photo image114.png
  els.push({ type:'t', text:"1:1 STATIC", x:5.75, y:0.51, w:1.38, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"1:1 VIDEO", x:9.37, y:0.56, w:0.63, h:0.17, font:'B', size:7.5, color:'captionGray', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 5.1, 2.75, 2.75, 4.21, 1);
  ph(els, cfg, 8.5, 2.75, 2.75, 4.21, 2);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', bold:true, caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: REDDIT_VID&STATIC4:5  ->  cfg.layout = "redditVideoStatic4x5"
// Template: "Reddit_Vid&Static4:5"
// Source slide: 66   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_redditVideoStatic4x5(cfg) {
  var els = [];
  els.push({ type:'s', x:0, y:0, w:3.52, h:7.5, fill:'#E2E2E2' });
  ph(els, cfg, 0.61, 0.44, 1.22, 0.62, 0);
  els.push({ type:'t', text:"1:1 STATIC", x:5.75, y:0.51, w:1.38, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"9:16 VIDEO", x:9.55, y:0.51, w:0.97, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  // Fixed device chrome: the real Reddit UI mockup, positioned per column by
  // matching its checkerboard content-hole fraction against each column's
  // own placeholder geometry (the two columns aren't the same height).
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_video_frame.png']) || A+'social/reddit_video_frame.png', x:4.405, y:1.475, w:4.174, h:5.184 });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['reddit_video_frame.png']) || A+'social/reddit_video_frame.png', x:7.97, y:1.981, w:4.204, h:4.272 });
  ph(els, cfg, 5.1, 1.91, 2.78, 4.26, 1);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 8.67, 2.34, 2.8, 3.51, 2);
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: TIKTOK_DIVIDER  ->  cfg.layout = "tiktokDivider"
// Template: "TikTok_Divider"
// Source slide: 62   Background: solid #000000
// Set slideData.bgColor = "#000000" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: full-bleed well removed (background is solid
// black now); the side photo and the TikTok logo well are unchanged. Added
// the new "place your own image" corner well -- see metaDivider's comment.
// ==========================================================
function layout_tiktokDivider(cfg) {
  var els = [];
  ph(els, cfg, 5.48, -0.02, 7.89, 7.53, 0); // side photo, unchanged
  ph(els, cfg, 0.72, 2.99, 3.35, 0.99, 1); // TikTok logo well, unchanged
  ph(els, cfg, 11.13, 6.65, 1.85, 0.55, 2); // "place your own image" corner well, new in 7/30/26
  els.push({ type:'s', x:10.83, y:7.15, w:0.9, h:0.01, fill:'ltGray' }); // rule
  return els;
}

// ==========================================================
// LAYOUT: TIKTOK_CAROUSEL  ->  cfg.layout = "tiktokCarousel"
// Template: "TikTok_Carousel"
// Source slide: 64   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_tiktokCarousel(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:13.35, h:2.73, fill:'#E2E2E2' });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:4.74, y:0.11, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:8.9, y:0.11, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:8.9, y:0.52, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:4.74, y:0.55, w:2.67, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['tiktok_chrome.png']) || A+'social/tiktok_chrome.png', x:0.54, y:0.6, w:1.23, h:0.36 });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.6, y:1.07, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:8.9, y:1.13, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:8.9, y:1.54, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.6, y:1.56, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:4.74, y:1.74, w:2.67, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:8.9, y:1.96, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.58, y:2.01, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:4.74, y:2.18, w:2.67, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  // The 5 filmstrip cards are plain, unframed image wells in the source --
  // confirmed directly, no device chrome around any of them (matching the
  // same pattern Meta's carousel filmstrip uses). Removed 5 oversized
  // generic device_frame_9x16.png overlays that didn't match the source.
  ph(els, cfg, 6.87, 3.35, 1.75, 3.73, 0);
  ph(els, cfg, 8.97, 3.35, 1.75, 3.73, 1);
  ph(els, cfg, 0.54, 3.36, 1.75, 3.73, 2);
  ph(els, cfg, 2.65, 3.36, 1.75, 3.73, 3);
  ph(els, cfg, 4.71, 3.36, 1.75, 3.73, 4);
  els.push({ type:'t', text:"9:16 Carousel", x:10.99, y:3.55, w:0.94, h:0.17, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:true, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  return els;
}

// ==========================================================
// LAYOUT: TIKTOK_VID&STATIC  ->  cfg.layout = "tiktokVideoStatic"
// Template: "TikTok_Vid&Static"
// Source slide: 63   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_tiktokVideoStatic(cfg) {
  var els = [];
  els.push({ type:'s', x:-0.01, y:-0.01, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['tiktok_chrome.png']) || A+'social/tiktok_chrome.png', x:0.54, y:0.6, w:1.23, h:0.36 });
  // Fixed device chrome: the real "TikTok MockUp" asset (status bar,
  // Following/For You tabs, right-side icon rail, @Mazda USA caption, red
  // "Learn more" CTA, bottom nav all baked in), positioned by matching its
  // checkerboard content-hole fraction against the source's own placeholder
  // geometry -- not the generic bezel-only overlay used before.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['tiktok_video_frame.png']) || A+'social/tiktok_video_frame.png', x:4.92, y:1.036, w:2.432, h:6.1 });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['tiktok_video_frame.png']) || A+'social/tiktok_video_frame.png', x:8.83, y:1.036, w:2.432, h:6.1 });
  els.push({ type:'t', text:"9:16 STATIC", x:5.44, y:0.86, w:1.38, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:"9:16 VIDEO", x:9.35, y:0.86, w:1.38, h:0.26, font:'B', size:7.5, color:'captionGray', align:'center', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 4.92, 1.42, 2.43, 5.13, 0);
  ph(els, cfg, 8.83, 1.42, 2.43, 5.13, 1);
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: PINTEREST_DIVIDER  ->  cfg.layout = "pinterestDivider"
// Template: "Pinterest_Divider"
// Source slide: 59   Background: solid #000000
// Set slideData.bgColor = "#000000" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: the full-bleed background photo (fixed image
// + placeholder) is gone from the source -- background is solid black now.
// Pinterest logo well is unchanged. Added the new "place your own image"
// corner well -- see metaDivider's comment.
// ==========================================================
function layout_pinterestDivider(cfg) {
  var els = [];
  ph(els, cfg, 0.98, 3.71, 3.23, 0.78, 0); // Pinterest logo well, unchanged
  ph(els, cfg, 11.13, 6.65, 1.85, 0.55, 1); // "place your own image" corner well, new in 7/30/26
  els.push({ type:'s', x:10.83, y:7.15, w:0.9, h:0.01, fill:'ltGray' }); // rule
  return els;
}

// ==========================================================
// LAYOUT: PINTEREST 2:3  ->  cfg.layout = "pinterest2x3"
// Template: "Pinterest 2:3"
// Source slide: 60   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_pinterest2x3(cfg) {
  var els = [];
  els.push({ type:'s', x:0, y:-0, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['pinterest_logo.png']) || A+'social/pinterest_logo.png', x:0.51, y:0.64, w:1.27, h:0.31 });
  // Fixed device chrome: the real Pinterest in-feed mockup (other pins for
  // authentic context, our ad in the right column with "Craft your perfect
  // ride / Mazda CX-90" caption baked in). Unlike the other platforms, this
  // asset's own aspect ratio (0.4614) matches the source's right-column
  // placeholder (index0 below, 2.40 x 5.20 = 0.4615) almost exactly, so it
  // places directly at that placeholder's bounds -- no hole-fraction scaling
  // needed. That also confirms index2 (the actual swappable ad card, 5.92,
  // 2.97, 1.17, 2.00) already lines up with the mockup's real content hole.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['pinterest_2x3_frame.jpg']) || A+'social/pinterest_2x3_frame.jpg', x:4.71, y:1.36, w:2.4, h:5.2 });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 8.76, 1.88, 2.44, 4.18, 1);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 5.92, 2.97, 1.17, 2, 2);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['pinterest_wordmark.png']) || A+'social/pinterest_wordmark.png', x:8.77, y:5.54, w:2.42, h:0.51 });
  // Button background drawn BEFORE its label -- was pushed after, so the
  // black button covered the white "Follow"-style text completely.
  els.push({ type:'s', x:8.77, y:5.69, w:1.37, h:0.31, fill:'black' });
  els.push({ type:'t', text:cfg.text2 || '', x:8.89, y:5.68, w:0.91, h:0.23, font:'B', size:11, color:'white', valign:'middle', caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: PINTEREST 1:1  ->  cfg.layout = "pinterest1x1"
// Template: "Pinterest 1:1"
// Source slide: 61   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// ==========================================================
function layout_pinterest1x1(cfg) {
  var els = [];
  els.push({ type:'s', x:0, y:-0, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['pinterest_logo.png']) || A+'social/pinterest_logo.png', x:0.51, y:0.64, w:1.27, h:0.31 });
  // Fixed device chrome: the real Pinterest video-pin mockup (status bar,
  // scrubber, "Learn more" arrow all baked in), positioned by matching its
  // checkerboard content-hole fraction against the source's own placeholder.
  // Replaces two overlapping overlays (a generic bezel + a partial Pinterest
  // asset) with one correctly-positioned frame.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['pinterest_1x1_frame.png']) || A+'social/pinterest_1x1_frame.png', x:6.566, y:0.752, w:2.902, h:6.198 });
  els.push({ type:'t', text:cfg.title || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  ph(els, cfg, 6.61, 2.74, 2.77, 2.84, 0);
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: YOUTUBE_DIVIDER  ->  cfg.layout = "youtubeDivider"
// Template: "Youtube_Divider"
// Source slide: 69   Background: solid #000000
// Set slideData.bgColor = "#000000" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE: two overlapping full-bleed wells removed
// (background is solid black now); the side photo and the Youtube logo well
// are unchanged. Added the new "place your own image" corner well -- see
// metaDivider's comment.
// ==========================================================
function layout_youtubeDivider(cfg) {
  var els = [];
  ph(els, cfg, 5.48, -0.02, 7.89, 7.53, 0); // side photo, unchanged
  ph(els, cfg, 0.92, 3.14, 3.14, 0.73, 1); // Youtube logo well, unchanged
  ph(els, cfg, 11.13, 6.65, 1.85, 0.55, 2); // "place your own image" corner well, new in 7/30/26
  els.push({ type:'s', x:11.78, y:7.15, w:0.9, h:0.01, fill:'ltGray' }); // rule
  return els;
}

// ==========================================================
// LAYOUT: YOUTUBE_VIDEOAD  ->  cfg.layout = "youtubeVideoAd"
// Template: "Youtube_VideoAd"
// Source slide: 70   Background: solid #FFFFFF
// Set slideData.bgColor = "#FFFFFF" (engine honours bgColor on export + preview).
// UPDATED FOR 7/30/26 TEMPLATE REVIEW: the source bakes the whole YouTube
// player chrome (title bar, timestamp badge, Mazda avatar, "Sponsored" bar)
// into one fixed image with a flat gray rectangle standing in for the video
// -- confirmed directly against the source's own picture ("YT01.png"),
// whose bounds match the old ph() call below exactly. The auto-generated
// version treated that whole region as ANOTHER swappable placeholder, so a
// deck author could overwrite the entire chrome, not just the video. Now
// the chrome is fixed and only the actual video/thumbnail area is a well.
// There was also a duplicate ph() at the same position as the video well
// (index1 below) -- removed, not a second, distinct well.
// ==========================================================
function layout_youtubeVideoAd(cfg) {
  var els = [];
  els.push({ type:'s', x:0, y:-0.01, w:3.52, h:7.5, fill:'#E2E2E2' });
  els.push({ type:'img', src:(cfg.assets && cfg.assets['youtube_logo.png']) || A+'social/youtube_logo.png', x:0.52, y:0.66, w:1.27, h:0.3 });
  // Fixed player chrome, drawn first so the video well sits on top of it.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['youtube_video_frame.png']) || A+'social/youtube_video_frame.png', x:4.35, y:0.99, w:7.65, h:5.98 });
  ph(els, cfg, 4.33, 0.96, 7.69, 4.33, 0);
  els.push({ type:'t', text:(cfg.items && cfg.items[0]) || "", x:0.47, y:0.98, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.text || '', x:0.47, y:1.47, w:2.65, h:0.42, font:'B', size:11, color:'titleGray', bold:true, caps:true, lineSpacing:0.9, charSpacing:-0.44, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.size) || "Size: 4:5", x:0.47, y:1.92, w:2.65, h:0.33, font:'B', size:7, color:'captionGray', caps:true, lineSpacing:1, charSpacing:-0.5, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.postCopy) || "Post copy (500 ch):", x:0.47, y:2.27, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[1]) || "", x:0.47, y:2.71, w:2.65, h:1.17, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.headline) || "Headline (100 ch):", x:0.47, y:3.9, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[2]) || "", x:0.47, y:4.34, w:2.65, h:0.38, font:'B', size:11.5, color:'mutedGray', caps:false, lineSpacing:0.9, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.alts) || "Alts:", x:0.47, y:5.01, w:2.65, h:0.41, font:'B', size:11.5, color:'captionGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.items && cfg.items[3]) || "", x:0.47, y:5.42, w:2.65, h:0.58, font:'B', size:10, color:'mutedGray', caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:cfg.title || "", x:5.49, y:5.56, w:4.45, h:0.7, font:'B', size:20.5, color:'white', bold:true, caps:false, lineSpacing:1, insets:{l:0.028,t:0.028,r:0.028,b:0.028} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.super_) || "Super:", x:0.47, y:6.03, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.cta) || "CTA: Learn More", x:0.47, y:6.44, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  els.push({ type:'t', text:(cfg.copy && cfg.copy.destination) || "Destination: VLP", x:0.47, y:6.85, w:2.65, h:0.39, font:'B', size:10, color:'mutedGray', bold:true, caps:false, lineSpacing:1.15, insets:{l:0.079,t:0.104,r:0.079,b:0.104} });
  return els;
}

// ==========================================================
// LAYOUT: REPORTGRAYCHART  ->  cfg.layout = "reportGrayChart"
// Variant of "Content Gray" -- chart well (template slides 83, 84, 85, 88)
// Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: the base layout is a bare chassis; this adds the well.
// ==========================================================
function layout_reportGrayChart(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  els.push({ type:'chart', x:0.78, y:2.22, w:11.5, h:4.36,
    chartType:(cfg.chart && cfg.chart.type) || 'bar',
    data:(cfg.chart && cfg.chart.data) || [],
    opts:(cfg.chart && cfg.chart.opts) || {} });

  return els;
}


// ==========================================================
// LAYOUT: REPORTDARKCHART  ->  cfg.layout = "reportDarkChart"
// Variant of "Content Dark" -- chart well (template slides 79, 80, 81, 82, 93, 94)
// Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: the base layout is a bare chassis; this adds the well.
// ==========================================================
function layout_reportDarkChart(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  els.push({ type:'chart', x:0.78, y:2.22, w:11.5, h:4.36,
    chartType:(cfg.chart && cfg.chart.type) || 'bar',
    data:(cfg.chart && cfg.chart.data) || [],
    opts:(cfg.chart && cfg.chart.opts) || {} });

  return els;
}


// ==========================================================
// LAYOUT: REPORTGRAYTABLE  ->  cfg.layout = "reportGrayTable"
// Variant of "Content Gray" -- 2-column report table (template slide 76)
// Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: replaces a generic type:'tbl' well. The source is a real
// PPTX table, but with per-cell formatting (a bold-caps header band, mixed
// heading+bullet body cells, a colored divider) the generic table renderer
// doesn't reproduce -- rebuilt as fixed positioned elements instead, with
// every size/color read from the real table's cell XML, not estimated.
// cfg.headers: [leftText, rightText] for the header band.
// cfg.rows: array of up to 4 { left:{heading,bullets}, right:{heading,bullets} }.
// bullets is optional on either side.
// ==========================================================
function layout_reportGrayTable(cfg) {
  var els = tableBody(cfg, {
    headerFill: '#262626', headerText: 'white', bg: '#EEEEEE'
  });
  return els;
}

// ==========================================================
// LAYOUT: REPORTDARKTABLE  ->  cfg.layout = "reportDarkTable"
// Variant of "Content Dark" -- 2-column report table (template slide 77)
// Background: solid #262626
// Set slideData.bgColor = "#262626".
// HAND-AUTHORED: same rebuild as reportGrayTable -- only the header band's
// fill/text colors invert (light band, dark text) to sit on a dark slide;
// everything else (column widths, row heights, type sizes, divider/rule
// colors) is identical, confirmed against both tables' real cell XML.
// cfg.headers / cfg.rows: same shape as reportGrayTable.
// ==========================================================
function layout_reportDarkTable(cfg) {
  var els = tableBody(cfg, {
    headerFill: '#EFEFEF', headerText: '#262626', bg: '#262626'
  });
  return els;
}

// Shared body for both table variants -- the only real differences between
// them are the header band's fill/text color, confirmed against the source.
function tableBody(cfg, theme) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  var TBL_X = 0.64, TBL_Y = 2.04, COL1_W = 8.557, COL2_W = 3.498;
  var HEADER_H = 0.904, ROW_H = 0.955;
  var COL2_X = TBL_X + COL1_W;
  var DIVIDER = '#5E5E5E';

  var headers = cfg.headers || [];
  els.push({ type:'s', x:TBL_X, y:TBL_Y, w:COL1_W + COL2_W, h:HEADER_H, fill:theme.headerFill });
  els.push({ type:'t', text:headers[0] || '', x:TBL_X + 0.13, y:TBL_Y, w:COL1_W - 0.26, h:HEADER_H,
    font:'B', size:17, color:theme.headerText, bold:true, valign:'middle', caps:true, lineSpacing:0.9 });
  els.push({ type:'t', text:headers[1] || '', x:COL2_X + 0.13, y:TBL_Y, w:COL2_W - 0.26, h:HEADER_H,
    font:'B', size:17, color:theme.headerText, bold:true, valign:'middle', caps:true, lineSpacing:0.9 });

  var rows = cfg.rows || [];
  function cell(x, w, y, h, content) {
    if (!content) return;
    var ty = y + 0.2;
    if (content.heading) {
      // Box tall enough for two lines so a wrap (narrower right column,
      // or this sandbox's Arial fallback running wider than Mazda Type)
      // doesn't get clipped -- but the bullets below only shift down a
      // little, not a full second line's worth, or they end up cramped
      // against the row boundary instead. In the normal single-line case
      // this leaves a small gap; in the wrap case the bullets sit close
      // under the wrapped second line rather than fully clear of it --
      // the lesser of the two failure modes.
      els.push({ type:'t', text:content.heading, x:x + 0.13, y:ty, w:w - 0.26, h:0.48,
        font:'B', size:20, color:'#CFB496', caps:true, charSpacing:2.2, lineSpacing:1 });
      ty += 0.44;
    }
    if (content.bullets && content.bullets.length) {
      els.push({ type:'t', x:x + 0.13, y:ty, w:w - 0.26, h:(y + h) - ty - 0.1,
        font:'B', size:8, color:'#919292', valign:'top', caps:true, lineSpacing:1.2,
        insets:{l:0,t:0,r:0,b:0},
        paras:content.bullets.map(function (b) { return { runs:[{ text:b }], bullet:true, marL:0.21, indent:-0.14 }; }) });
    }
  }

  var y = TBL_Y + HEADER_H;
  for (var i = 0; i < 4; i++) {
    var r = rows[i] || {};
    cell(TBL_X, COL1_W, y, ROW_H, r.left);
    cell(COL2_X, COL2_W, y, ROW_H, r.right);
    if (i < 3) els.push({ type:'s', x:TBL_X, y:y + ROW_H, w:COL1_W + COL2_W, h:0.0125, fill:DIVIDER });
    y += ROW_H;
  }
  // Vertical divider between the two columns, full table height.
  els.push({ type:'s', x:COL2_X, y:TBL_Y, w:0.0125, h:HEADER_H + ROW_H * 4, fill:DIVIDER });

  return els;
}


// ==========================================================
// LAYOUT: REPORT CHANNEL MATRIX (SLIDE 78)  ->  cfg.layout = "reportChannelMatrix"
// Variant of "Content Gray" -- funnel/channel role & budget matrix
// Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED, NEW: previously conflated with reportGrayTable (both cite
// "Content Gray"), but this is a genuinely different table object in the
// source (14 rows x 6 cols with a 2-row header, merged group-label cells,
// a subtotal row, and a grand-total row) -- confirmed by reading the real
// table's cell grid, merges and fills directly, not assumed from a visual
// resemblance to the simpler 2-column report table.
//
// cfg.headerTotals: { basePlanOnly, basePlanIncremental } -- the two $
// values shown in the header band itself (row 2 of the header).
// cfg.groups: array of { label, rows: [ { channel, base, incremental,
//   baseValue, incValue } ], subtotal: { baseValue, incValue } }.
//   subtotal is optional per group; omit for a group with no subtotal bar.
// cfg.grandTotal: { baseValue, incValue }.
// ==========================================================
function layout_reportChannelMatrix(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  var TBL_X = 0.59, TBL_Y = 1.842;
  var COL_W = [1.385, 1.361, 3.397, 3.654, 1.082, 1.272];
  var COL_X = [TBL_X];
  for (var c = 0; c < COL_W.length - 1; c++) COL_X.push(COL_X[c] + COL_W[c]);
  var HEAD_H = [0.385, 0.375];
  var ROW_H = 0.38, SUBTOTAL_H = 0.385, GRAND_H = 0.375;
  var DARK = '#262626';

  function txt(x, w, y, h, text, opts) {
    var _t = (text == null || text === '') ? '' : String(text); // baseValue/incValue arrive numeric
    var o = Object.assign({ type:'t', text:_t, x:x + 0.09, y:y, w:w - 0.18, h:h,
      font:'B', size:6, valign:'middle', lineSpacing:1, caps:true }, opts || {});
    els.push(o);
  }

  // Header, 2 rows: FUNNEL & MESSAGING / CHANNEL each span both rows;
  // ROLE OF CHANNEL spans row 0 across BASE PLAN + INCREMENTAL's width,
  // then splits into those two labels on row 1; the last two columns show
  // a header-level total on row 1 under their row-0 labels.
  var headerBottom = TBL_Y + HEAD_H[0] + HEAD_H[1];
  els.push({ type:'s', x:TBL_X, y:TBL_Y, w:COL_W.reduce(function(a,b){return a+b;},0), h:HEAD_H[0]+HEAD_H[1], fill:DARK });
  txt(COL_X[0], COL_W[0], TBL_Y, HEAD_H[0]+HEAD_H[1], 'FUNNEL & MESSAGING', { color:'white', bold:true, valign:'bottom' });
  txt(COL_X[1], COL_W[1], TBL_Y, HEAD_H[0]+HEAD_H[1], 'CHANNEL', { color:'white', bold:true, valign:'bottom' });
  txt(COL_X[2], COL_W[2]+COL_W[3], TBL_Y, HEAD_H[0], 'ROLE OF CHANNEL', { color:'white', bold:true, valign:'bottom' });
  txt(COL_X[2], COL_W[2], TBL_Y + HEAD_H[0], HEAD_H[1], 'BASE PLAN', { color:'white', bold:true, valign:'bottom' });
  txt(COL_X[3], COL_W[3], TBL_Y + HEAD_H[0], HEAD_H[1], 'INCREMENTAL', { color:'white', bold:true, valign:'bottom' });
  var ht = cfg.headerTotals || {};
  txt(COL_X[4], COL_W[4], TBL_Y, HEAD_H[0], 'Base Plan Only', { color:'white', bold:true, valign:'bottom', size:6 });
  txt(COL_X[4], COL_W[4], TBL_Y + HEAD_H[0], HEAD_H[1], ht.basePlanOnly || '$0M', { color:'white', bold:true });
  txt(COL_X[5], COL_W[5], TBL_Y, HEAD_H[0], 'Base Plan + $18MM Incremental*', { color:'white', bold:true, valign:'bottom', size:6, lineSpacing:0.95 });
  txt(COL_X[5], COL_W[5], TBL_Y + HEAD_H[0], HEAD_H[1], ht.basePlanIncremental || '$0M', { color:'white', bold:true });
  // Column dividers across the whole header band.
  [1,2,3,4,5].forEach(function (ci) {
    els.push({ type:'s', x:COL_X[ci], y:TBL_Y, w:0.0125, h:HEAD_H[0]+HEAD_H[1], fill:'#5E5E5E' });
  });

  // Body groups.
  var groups = cfg.groups || [];
  var y = headerBottom;
  var tableRight = TBL_X + COL_W.reduce(function(a,b){return a+b;},0);
  groups.forEach(function (g) {
    var rows = g.rows || [];
    var groupTop = y;
    rows.forEach(function (r) {
      txt(COL_X[1], COL_W[1], y, ROW_H, r.channel, { color:'#CFB496', charSpacing:0.9 });
      txt(COL_X[2], COL_W[2], y, ROW_H, r.base, { color:'#808080', bold:false, caps:false, lineSpacing:1.1 });
      txt(COL_X[3], COL_W[3], y, ROW_H, r.incremental, { color:'#808080', bold:false, caps:false, lineSpacing:1.1 });
      txt(COL_X[4], COL_W[4], y, ROW_H, r.baseValue, { color:'#CFB496' });
      txt(COL_X[5], COL_W[5], y, ROW_H, r.incValue, { color:'#CFB496' });
      els.push({ type:'s', x:TBL_X, y:y + ROW_H, w:tableRight - TBL_X, h:0.0125, fill:'#D9D9D9' });
      y += ROW_H;
    });
    var groupH = y - groupTop;
    txt(COL_X[0], COL_W[0], groupTop, groupH, g.label, { color:'#262626', bold:true, valign:'middle' });
    [2,3,4,5].forEach(function (ci) {
      els.push({ type:'s', x:COL_X[ci], y:groupTop, w:0.0125, h:groupH, fill:'#D9D9D9' });
    });
    if (g.subtotal) {
      els.push({ type:'s', x:TBL_X, y:y, w:tableRight - TBL_X, h:SUBTOTAL_H, fill:DARK });
      txt(COL_X[4], COL_W[4], y, SUBTOTAL_H, g.subtotal.baseValue, { color:'white', bold:true });
      txt(COL_X[5], COL_W[5], y, SUBTOTAL_H, g.subtotal.incValue, { color:'white', bold:true });
      y += SUBTOTAL_H;
    }
  });

  // Grand total: label spans the first four columns.
  els.push({ type:'s', x:TBL_X, y:y, w:tableRight - TBL_X, h:GRAND_H, fill:DARK });
  txt(TBL_X, COL_W[0]+COL_W[1]+COL_W[2]+COL_W[3], y, GRAND_H, 'GRAND TOTALS', { color:'white', bold:true });
  var gt = cfg.grandTotal || {};
  txt(COL_X[4], COL_W[4], y, GRAND_H, gt.baseValue || '$0M', { color:'white', bold:true });
  txt(COL_X[5], COL_W[5], y, GRAND_H, gt.incValue || '$0M', { color:'white', bold:true });

  return els;
}


// ==========================================================
// LAYOUT: REPORTGRAYTIMELINE  ->  cfg.layout = "reportGrayTimeline"
// Variant of "Content Gray" -- campaign progress timeline (template slide 72)
// Background: solid #EEEEEE
// Set slideData.bgColor = "#EEEEEE".
// HAND-AUTHORED: the base layout is a bare chassis; this adds the well.
// ==========================================================
function layout_reportGrayTimeline(cfg) {
  var els = [];
  if (cfg.tag) els.push({ type:'t', text:cfg.tag, x:0.61, y:0.54, w:12.12, h:0.29,
    font:'B', size:14.5, color:'accentDim', valign:'bottom', caps:true, lineSpacing:0.9,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  els.push({ type:'t', text:cfg.title || '', x:0.61, y:0.85, w:12.12, h:0.5,
    font:'H', size:24, color:'titleGray', caps:true, lineSpacing:1, charSpacing:2.64,
    insets:{l:0.035,t:0.035,r:0.035,b:0.035} });
  if (cfg.intro || cfg.text) els.push({ type:'t', text:cfg.intro || cfg.text, x:0.61, y:1.33, w:12.12, h:0.39,
    font:'B', size:10, color:'bodyGray', caps:false, lineSpacing:1.1,
    insets:{l:0.028,t:0.028,r:0.028,b:0.028} });

  // Background flow art: replaced with a direct Keynote export (many
  // individual lines grouped, not a single low-res raster) after the
  // original report_timeline_flow.png rendered pixelated at this size.
  // White background keyed to transparent so it sits cleanly on the
  // chassis's #EEEEEE, not a visible white rectangle.
  els.push({ type:'img', src:(cfg.assets && cfg.assets['campaign_progress.png'])
    || A + 'backgrounds/campaign_progress.png',
    x:-0.86, y:2.69, w:14.99, h:3.51 });
  var marks = cfg.milestones || cfg.items || [];
  var MX = [3.08, 4.58, 8.02, 11.39, 0.49, 3.08, 6.09, 10.11];
  var MY = [2.82, 5.79, 5.79, 5.79, 6.67, 6.67, 6.67, 6.67];
  for (var i = 0; i < MX.length && i < marks.length; i++) {
    els.push({ type:'t', text:marks[i], x:MX[i], y:MY[i], w:1.73, h:0.52,
      font:'B', size:10, color:'bodyGray', align:'center', caps:false, lineSpacing:1,
      insets:{l:0.104,t:0.104,r:0.104,b:0.104} });
  }
  // Connector lines between the flow art and each label: gray, 1.5pt
  // (3pt raw), arrows on both ends -- were plain unarrowed fill rectangles.
  els.push({ type:'ln', x:3.94, y:3.33, w:0, h:0.6,  color:'#767676', weight:1.5, arrows:'both' });
  els.push({ type:'ln', x:3.94, y:5.14, w:0, h:1.58, color:'#767676', weight:1.5, arrows:'both' });
  els.push({ type:'ln', x:6.96, y:4.91, w:0, h:1.79, color:'#767676', weight:1.5, arrows:'both' });
  els.push({ type:'ln', x:10.98, y:4.75, w:0, h:1.95, color:'#767676', weight:1.5, arrows:'both' });
  els.push({ type:'ln', x:1.35, y:6.41, w:0, h:0.29, color:'#767676', weight:1.5, arrows:'both' });
  // "We are here" marker: gray fill with a white outline -- was solid tan.
  if (cfg.hereLabel !== false) els.push({ type:'o', x:3.8, y:4.3, w:0.29, h:0.29, fill:'#767676', border:'white' });

  return els;
}



// ------------------------------------------------------------
// DEFAULT PHOTOGRAPHY POOLS
// Image-led layouts pre-populate with real photography from the template deck
// so a fresh deck never opens on empty grey boxes. Every one is still a normal
// picture in the exported PPTX, so right-click -> Change Picture works as usual.
//
// Rotation is applied ONCE by deckInit (see assignDefaultPhotos in
// deck-shell.js), never inside these layout functions: dispatch() runs several
// times per slide -- preview render, asset prefetch, icon pre-render, PPTX
// export -- so a counter in here would advance on every pass and the exported
// file would not match the preview.
//
// Opt out per deck with deckInit({ defaultPhotos:false }), or per slide by
// setting your own bgImage / images entry.
// ------------------------------------------------------------
var PHOTO_DEFAULTS = {
  coverPhoto:        { target:'bgImage',            pool:[A+'photos/cover_scenic_01.jpg', A+'photos/cover_scenic_02.jpg'] },
  coverPhoto2:       { target:'images', slot:0,     pool:[A+'photos/cover_hero_01.jpg',   A+'photos/cover_hero_02.jpg'] },
  headlinePhotoWell: { target:'images', slot:0,     pool:[A+'photos/statement_01.jpg',    A+'photos/statement_02.jpg'] }
};


// ==========================================================
// DISPATCH
// ==========================================================
var LAYOUT_MAP = {
  coverLight: layout_coverLight,
  coverDark: layout_coverDark,
  coverLight2: layout_coverLight2,
  coverPhoto: layout_coverPhoto,
  coverPhoto2: layout_coverPhoto2,
  dividerDark: layout_dividerDark,
  dividerDark2: layout_dividerDark2,
  dividerLight: layout_dividerLight,
  dividerLight2: layout_dividerLight2,
  dividerAsphalt: layout_dividerAsphalt,
  dividerCanopy: layout_dividerCanopy,
  dividerAurora: layout_dividerAurora,
  dividerTides: layout_dividerTides,
  headlineLight: layout_headlineLight,
  headlineDark: layout_headlineDark,
  headlinePhotoWell: layout_headlinePhotoWell,
  statementSubhead: layout_statementSubhead,
  reportSplitPanels: layout_reportSplitPanels,
  reportStatRow: layout_reportStatRow,
  reportStatRowLight: layout_reportStatRowLight,
  reportSpendBarsLight: layout_reportSpendBarsLight,
  reportSpendBarsDark: layout_reportSpendBarsDark,
  reportModelCompare: layout_reportModelCompare,
  reportBrandPillars: layout_reportBrandPillars,
  reportPlatformMatrix: layout_reportPlatformMatrix,
  reportEcosystemTree: layout_reportEcosystemTree,
  reportMetricTable: layout_reportMetricTable,
  reportQuotePanel: layout_reportQuotePanel,
  reportChapterOpener: layout_reportChapterOpener,
  reportStrategyStack: layout_reportStrategyStack,
  reportJourneyMap: layout_reportJourneyMap,
  reportGateStatus: layout_reportGateStatus,
  reportNumberedSteps: layout_reportNumberedSteps,
  tableOfContents: layout_tableOfContents,
  thankYouLight: layout_thankYouLight,
  thankYouDark: layout_thankYouDark,
  content01: layout_content01,
  content02: layout_content02,
  content03: layout_content03,
  content05: layout_content05,
  content06: layout_content06,
  content07: layout_content07,
  content08: layout_content08,
  content09: layout_content09,
  threeColDark: layout_threeColDark,
  threeColLight: layout_threeColLight,
  twoRowsDark: layout_twoRowsDark,
  twoRowsLight: layout_twoRowsLight,
  twoRowsLightAlt: layout_twoRowsLightAlt,
  reportGray: layout_reportGray,
  reportDark: layout_reportDark,
  storyboardVO: layout_storyboardVO,
  storyboardGrid: layout_storyboardGrid,
  scriptsCompare: layout_scriptsCompare,
  videoReference: layout_videoReference,
  castingGrid: layout_castingGrid,
  castingTalent: layout_castingTalent,
  locationOverview: layout_locationOverview,
  locationDetail: layout_locationDetail,
  moodboardProps: layout_moodboardProps,
  moodboardWardrobe: layout_moodboardWardrobe,
  moodboardToneManner: layout_moodboardToneManner,
  metaDivider: layout_metaDivider,
  metaCarousel1x1: layout_metaCarousel1x1,
  metaCarousel4x5: layout_metaCarousel4x5,
  metaVideoStatic: layout_metaVideoStatic,
  redditDivider: layout_redditDivider,
  redditCarousel: layout_redditCarousel,
  redditVideoStatic1x1: layout_redditVideoStatic1x1,
  redditVideoStatic4x5: layout_redditVideoStatic4x5,
  tiktokDivider: layout_tiktokDivider,
  tiktokCarousel: layout_tiktokCarousel,
  tiktokVideoStatic: layout_tiktokVideoStatic,
  pinterestDivider: layout_pinterestDivider,
  pinterest2x3: layout_pinterest2x3,
  pinterest1x1: layout_pinterest1x1,
  youtubeDivider: layout_youtubeDivider,
  youtubeVideoAd: layout_youtubeVideoAd,
  reportGrayChart: layout_reportGrayChart,
  reportDarkChart: layout_reportDarkChart,
  reportGrayTable: layout_reportGrayTable,
  reportDarkTable: layout_reportDarkTable,
  reportChannelMatrix: layout_reportChannelMatrix,
  reportGrayTimeline: layout_reportGrayTimeline
};

// ------------------------------------------------------------
// AMBIGUOUS v1.0 NAMES -- these exist in BOTH versions with DIFFERENT meanings.
// v1.0's content03 was built from the template's "Content 01"; v2.0's
// content03 IS "Content 03". A v1.0 deck reusing the key silently renders a
// different layout, so these log loudly and render the v2.0 (template-correct)
// meaning. Re-key old decks: v1 content03 -> content01, v1 content05 -> content03.
// ------------------------------------------------------------
var AMBIGUOUS = { content03: 'content01', content05: 'content03' };

// Retired v2.0 layouts. Superseded by a better version of the same design;
// old decks keep rendering, and the replacement is what they get.
var RETIRED = {
  "headlinePhoto": "headlinePhotoWell",
  "reportGoalFunnel": "reportEcosystemTree",
  // These four pairs share a source slide and are true duplicates, not a
  // chassis/variant pair -- the report* name in each is the one that's been
  // hand-authored and fixed (structured content API, correct z-order, real
  // strokes/bullets/underline). The blank*/generic-name function bodies are
  // gone, not just aliased around.
  "blankLight": "reportJourneyMap",
  "blankDark": "reportStatRow",
  "blankGrey": "reportEcosystemTree",
  "titleBullets": "reportPlatformMatrix"
};

// v1.0 deck data keeps working; these resolve to the closest real template layout.
var LEGACY_ALIASES = {
  coverGeometric: 'coverLight',
  coverScenic: 'coverPhoto',
  coverLogoCutout: 'coverPhoto2',
  dividerBrand: 'dividerDark',
  content04: 'content02',
  headline: 'headlineDark',
  thankYou: 'thankYouDark'
};

// Exact template names also accepted, so the spec doc and the engine agree.
var TEMPLATE_NAMES = {
  "Cover Light": "coverLight",
  "Cover Dark": "coverDark",
  "Cover Light2": "coverLight2",
  "Cover Photo": "coverPhoto",
  "Cover Photo2": "coverPhoto2",
  "Divider Dark": "dividerDark",
  "Divider Dark2": "dividerDark2",
  "Divider Light": "dividerLight",
  "Divider Light2": "dividerLight2",
  "Divider Asphalt": "dividerAsphalt",
  "Divider Canopy": "dividerCanopy",
  "Divider Aurora": "dividerAurora",
  "Divider Tides": "dividerTides",
  "1_Divider Tides": "dividerTides",
  "Content - Headline light": "headlineLight",
  "Content -headline dark": "headlineDark",
  "1_Content -headline photo copy": "headlinePhotoWell",
  "Statement + Subhead (slide 31)": "statementSubhead",
  "Report Split Panels (slide 73)": "reportSplitPanels",
  "Report Stat Row (slide 74)": "reportStatRow",
  "Report Stat Row Light (slide 75)": "reportStatRowLight",
  "Report Spend Bars Light (slide 86)": "reportSpendBarsLight",
  "Report Spend Bars Dark (slide 87)": "reportSpendBarsDark",
  "Report Model Compare (slide 89)": "reportModelCompare",
  "Report Brand Pillars (slide 90)": "reportBrandPillars",
  "Report Platform Matrix (slide 91)": "reportPlatformMatrix",
  "Report Ecosystem Tree (slide 92)": "reportEcosystemTree",
  "Report Metric Table (slide 95)": "reportMetricTable",
  "Report Channel Matrix (slide 78)": "reportChannelMatrix",
  "Report Quote Panel (slide 96)": "reportQuotePanel",
  "Report Chapter Opener (slide 97)": "reportChapterOpener",
  "Report Strategy Stack (slide 98)": "reportStrategyStack",
  "Report Journey Map (slide 99)": "reportJourneyMap",
  "Report Gate Status (slide 100)": "reportGateStatus",
  "Report Numbered Steps (slide 101)": "reportNumberedSteps",
  "Table of contents": "tableOfContents",
  "Thank You Light": "thankYouLight",
  "Thank You Dark": "thankYouDark",
  "Content 01": "content01",
  "Content 02": "content02",
  "Content 03": "content03",
  "Content 05": "content05",
  "Content 06": "content06",
  "Content 07": "content07",
  "Content 08": "content08",
  "Content 09": "content09",
  "Content - 3 columns - Dark": "threeColDark",
  "Content - 3 columns - Light": "threeColLight",
  "Content 2 Rows - Dark": "twoRowsDark",
  "Content 2 Rows - Light": "twoRowsLight",
  "Content - 2 rows - Light": "twoRowsLightAlt",
  "Content Gray": "reportGray",
  "Content Dark": "reportDark",
  "Blank Dark": "reportStatRow",
  "Blank Grey": "reportEcosystemTree",
  "Blank Light": "reportJourneyMap",
  "Title & Bullets": "reportPlatformMatrix",
  "Storyboard 01": "storyboardVO",
  "Storyboard 02": "storyboardGrid",
  "Scripts 01": "scriptsCompare",
  "Video Reference": "videoReference",
  "Casting": "castingGrid",
  "Casting_Talent": "castingTalent",
  "Location Overview": "locationOverview",
  "Location Detail": "locationDetail",
  "Moodboard Props": "moodboardProps",
  "Moodboard Wardrobe": "moodboardWardrobe",
  "Moodboard ": "moodboardToneManner",
  "Meta_Divider": "metaDivider",
  "Meta_Carousel 1x1": "metaCarousel1x1",
  "Meta_Carousel 4x5": "metaCarousel4x5",
  "Meta_Video&Static": "metaVideoStatic",
  "Reddit_Divider": "redditDivider",
  "Reddit_Carousel": "redditCarousel",
  "Reddit_Vid&Static1:1": "redditVideoStatic1x1",
  "Reddit_Vid&Static4:5": "redditVideoStatic4x5",
  "TikTok_Divider": "tiktokDivider",
  "TikTok_Carousel": "tiktokCarousel",
  "TikTok_Vid&Static": "tiktokVideoStatic",
  "Pinterest_Divider": "pinterestDivider",
  "Pinterest 2:3": "pinterest2x3",
  "Pinterest 1:1": "pinterest1x1",
  "Youtube_Divider": "youtubeDivider",
  "Youtube_VideoAd": "youtubeVideoAd",
  "Headline Photo Divider": "headlinePhotoWell"
};

function resolve(name) {
  if (!name) return null;
  if (AMBIGUOUS[name]) {
    console.error('[deck-layouts] "' + name + '" meant "' + AMBIGUOUS[name] +
      '" in v1.0 but is a DIFFERENT layout in v2.0. Rendering the v2.0 meaning. ' +
      'If this deck was authored against v1.0, change it to "' + AMBIGUOUS[name] + '".');
  }
  if (LAYOUT_MAP[name]) return LAYOUT_MAP[name];
  if (RETIRED[name]) {
    console.warn('[deck-layouts] "' + name + '" was retired; rendering "' +
      RETIRED[name] + '" instead.');
    return LAYOUT_MAP[RETIRED[name]];
  }
  if (LEGACY_ALIASES[name]) {
    console.warn('[deck-layouts] "' + name + '" is a v1.0 name; use "' + LEGACY_ALIASES[name] + '".');
    return LAYOUT_MAP[LEGACY_ALIASES[name]];
  }
  if (TEMPLATE_NAMES[name]) return LAYOUT_MAP[TEMPLATE_NAMES[name]];
  return null;
}

// Keys each layout actually reads. Anything else a deck supplies is content
// that would vanish without trace -- e.g. `subhead` on a divider, which has only
// an eyebrow and a title. Warn rather than fail: the slide is still valid.
var VERSION = 'v2.0-20260902-0137 (87 layouts)';
var LAYOUT_KEYS = {
  "coverLight": [
    "date",
    "title"
  ],
  "coverDark": [
    "date",
    "title"
  ],
  "coverLight2": [
    "date",
    "title"
  ],
  "coverPhoto": [
    "subhead",
    "subtitle",
    "title"
  ],
  "coverPhoto2": [
    "title",
    "variant"
  ],
  "dividerDark": [
    "tag",
    "title"
  ],
  "dividerDark2": [
    "tag",
    "title"
  ],
  "dividerLight": [
    "tag",
    "title"
  ],
  "dividerLight2": [
    "tag",
    "title"
  ],
  "dividerAsphalt": [
    "tag",
    "title"
  ],
  "dividerCanopy": [
    "tag",
    "title"
  ],
  "dividerAurora": [
    "tag",
    "title"
  ],
  "dividerTides": [
    "tag",
    "title"
  ],
  "headlineLight": [
    "tag",
    "title"
  ],
  "headlineDark": [
    "tag",
    "title"
  ],
  "headlinePhotoWell": [
    "tag",
    "title"
  ],
  "statementSubhead": [
    "subhead",
    "subtitle",
    "title"
  ],
  "reportSplitPanels": [
    "hereLabel",
    "intro",
    "milestones",
    "stages",
    "tag",
    "text",
    "title"
  ],
  "reportStatRow": [
    "columns",
    "sections",
    "subhead",
    "title"
  ],
  "reportStatRowLight": [
    "columns",
    "sections",
    "subhead",
    "title"
  ],
  "reportSpendBarsLight": [
    "bars",
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportSpendBarsDark": [
    "bars",
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportModelCompare": [
    "entries",
    "stages",
    "tag",
    "title"
  ],
  "reportBrandPillars": [
    "channels",
    "outcomes",
    "pillars",
    "pivot",
    "rowLabels",
    "sections",
    "targets",
    "title"
  ],
  "reportPlatformMatrix": [
    "categories",
    "hub",
    "spokes",
    "title"
  ],
  "reportEcosystemTree": [
    "branches",
    "cornerLeft",
    "cornerRight",
    "root",
    "title"
  ],
  "reportMetricTable": [
    "columns",
    "date",
    "tag"
  ],
  "reportQuotePanel": [
    "items",
    "subhead",
    "subtitle",
    "tag",
    "title"
  ],
  "reportChapterOpener": [
    "items",
    "subhead",
    "subtitle",
    "tag",
    "text",
    "text2",
    "text3",
    "text4",
    "text5",
    "text6"
  ],
  "reportStrategyStack": [
    "activationBody",
    "activationLabel",
    "badges",
    "footers",
    "insightBody",
    "insightHead",
    "intro",
    "panels",
    "pointBody",
    "pointOne",
    "pointTwo",
    "tag",
    "title"
  ],
  "reportJourneyMap": [
    "hereLabel",
    "panels",
    "tag",
    "title"
  ],
  "reportGateStatus": [
    "dividers",
    "gates",
    "showConnector"
  ],
  "reportNumberedSteps": [
    "intro",
    "showConnector",
    "steps",
    "tag",
    "title"
  ],
  "tableOfContents": [
    "items",
    "subtitle",
    "text",
    "title"
  ],
  "thankYouLight": [
    "date",
    "title"
  ],
  "thankYouDark": [
    "date",
    "title"
  ],
  "content01": [
    "text",
    "title"
  ],
  "content02": [
    "text",
    "title"
  ],
  "content03": [
    "text",
    "title"
  ],
  "content05": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "content06": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "content07": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "content08": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "content09": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "threeColDark": [
    "items",
    "subhead",
    "subtitle",
    "text",
    "text2",
    "title"
  ],
  "threeColLight": [
    "items",
    "subhead",
    "subtitle",
    "text",
    "text2",
    "title"
  ],
  "twoRowsDark": [
    "items",
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "twoRowsLight": [
    "items",
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "twoRowsLightAlt": [
    "items",
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "reportGray": [
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportDark": [
    "intro",
    "tag",
    "text",
    "title"
  ],
  "storyboardVO": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "storyboardGrid": [
    "items",
    "subhead",
    "title"
  ],
  "scriptsCompare": [
    "subhead",
    "subtitle",
    "text",
    "text2",
    "title"
  ],
  "videoReference": [
    "subhead",
    "subtitle",
    "text",
    "title"
  ],
  "castingGrid": [
    "items",
    "tag",
    "title"
  ],
  "castingTalent": [
    "subhead",
    "subtitle",
    "tag",
    "title"
  ],
  "locationOverview": [
    "items",
    "tag"
  ],
  "locationDetail": [
    "subhead",
    "subtitle",
    "tag",
    "text",
    "title"
  ],
  "moodboardProps": [
    "captions",
    "notes",
    "tag",
    "title"
  ],
  "moodboardWardrobe": [
    "accessoryCaption",
    "subtitle",
    "tag",
    "text",
    "title"
  ],
  "moodboardToneManner": [
    "tag",
    "title"
  ],
  "metaDivider": [],
  "metaCarousel1x1": [
    "copy",
    "items",
    "text",
    "text2"
  ],
  "metaCarousel4x5": [
    "copy",
    "items",
    "text",
    "text2"
  ],
  "metaVideoStatic": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "redditDivider": [],
  "redditCarousel": [
    "copy",
    "items",
    "text"
  ],
  "redditVideoStatic1x1": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "redditVideoStatic4x5": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "tiktokDivider": [],
  "tiktokCarousel": [
    "copy",
    "items",
    "text"
  ],
  "tiktokVideoStatic": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "pinterestDivider": [],
  "pinterest2x3": [
    "copy",
    "items",
    "text",
    "text2",
    "title"
  ],
  "pinterest1x1": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "youtubeDivider": [],
  "youtubeVideoAd": [
    "copy",
    "items",
    "text",
    "title"
  ],
  "reportGrayChart": [
    "chart",
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportDarkChart": [
    "chart",
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportGrayTable": [
    "headers",
    "intro",
    "rows",
    "tag",
    "text",
    "title"
  ],
  "reportDarkTable": [
    "headers",
    "intro",
    "rows",
    "tag",
    "text",
    "title"
  ],
  "reportChannelMatrix": [
    "grandTotal",
    "groups",
    "headerTotals",
    "intro",
    "tag",
    "text",
    "title"
  ],
  "reportGrayTimeline": [
    "hereLabel",
    "intro",
    "items",
    "milestones",
    "tag",
    "text",
    "title"
  ]
};
var ENGINE_KEYS = ['layout','dark','bgImage','bgColor','bgGradient','notes',
                   'images','assets','els'];

function warnUnusedKeys(slideData, slug) {
  var known = LAYOUT_KEYS[slug];
  if (!known) return;
  Object.keys(slideData).forEach(function (k) {
    if (ENGINE_KEYS.indexOf(k) > -1 || known.indexOf(k) > -1) return;
    var v = slideData[k];
    if (v === undefined || v === null || v === '') return;
    console.warn('[deck-layouts] "' + slug + '" has no slot for "' + k +
      '" -- that content will not appear. Slots: ' + (known.join(', ') || 'none'));
  });
}

// A slide that renders nothing looks identical to a slide that rendered
// correctly-but-empty. Make the failure self-describing on the slide itself.
function errorSlide(msg, detail) {
  return [
    { type:'s', x:0.5, y:2.6, w:12.33, h:2.3, fill:'#FFF4F4' },
    { type:'t', text:'LAYOUT DID NOT RENDER', x:0.9, y:2.9, w:11.5, h:0.5,
      font:'B', size:18, bold:true, color:'#C12638', caps:true, lineSpacing:1 },
    { type:'t', text:msg, x:0.9, y:3.5, w:11.5, h:0.5,
      font:'B', size:13, color:'#262626', caps:false, lineSpacing:1.2 },
    { type:'t', text:detail || '', x:0.9, y:4.0, w:11.5, h:0.7,
      font:'B', size:10, color:'#5E5E5E', caps:false, lineSpacing:1.2 }
  ];
}

function dispatch(slideData) {
  // Agents sometimes nest a layout's parameters under `cfg:` -- a misreading of
  // this system's "cfg.foo" shorthand, which means "the slide object's foo",
  // not a literal nested key. Every layout fn reads slideData.foo directly, so
  // an un-hoisted cfg wrapper renders the slide almost empty (title only).
  // Hoist cfg's keys onto the slide; a key already on the slide wins; then drop
  // the wrapper so warnUnusedKeys doesn't flag it. Idempotent across the
  // several dispatch() passes per slide.
  if (slideData && slideData.cfg && typeof slideData.cfg === 'object' && !Array.isArray(slideData.cfg)) {
    for (var _k in slideData.cfg) {
      if (Object.prototype.hasOwnProperty.call(slideData.cfg, _k) && slideData[_k] === undefined) {
        slideData[_k] = slideData.cfg[_k];
      }
    }
    delete slideData.cfg;
  }
  var fn = resolve(slideData.layout);
  if (fn) {
    var slug = slideData.layout;
    if (!LAYOUT_KEYS[slug]) {
      slug = RETIRED[slideData.layout] || LEGACY_ALIASES[slideData.layout] || TEMPLATE_NAMES[slideData.layout] || slug;
    }
    warnUnusedKeys(slideData, slug);
    return fn(slideData);
  }
  if (slideData.els) return slideData.els;
  console.error('[deck-layouts] Unknown layout: "' + slideData.layout + '". ' +
    'This build (' + VERSION + ') knows ' + Object.keys(LAYOUT_MAP).length +
    ' layouts. If this name looks correct, your deck-layouts.js is out of date.');
  return errorSlide('Unknown layout: "' + slideData.layout + '"',
    'This build is ' + VERSION + '. If the name looks right, deck-layouts.js is stale -- ' +
    'hard-refresh, or check DeckLayouts.VERSION in the console.');
}

window.DeckLayouts = {
  VERSION: VERSION,
  dispatch: dispatch,
  LAYOUT_KEYS: LAYOUT_KEYS,
  PHOTO_DEFAULTS: PHOTO_DEFAULTS,
  resolve: resolve,
  LAYOUT_MAP: LAYOUT_MAP,
  LEGACY_ALIASES: LEGACY_ALIASES, RETIRED: RETIRED,
  TEMPLATE_NAMES: TEMPLATE_NAMES,
  getPrefetchUrls: function () { return _prefetchUrls; }
};
})();
