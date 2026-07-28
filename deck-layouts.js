/* ============================================================
deck-layouts.js -- MMW Layout Library (standard-deck-mmw)
Fresh start, MMW-exclusive. Forked from standard-deck-v3's
deck-layouts.js v6.0.18 - only the shared dispatch infrastructure
was kept; all 29 generic layouts (cards/stats/rows/timeline/etc.)
were intentionally dropped per project decision: MMW templates only,
backfill specific generic layouts from standard-deck-v3 later if a
real content gap appears.

22 MMW-specific layout functions, each built and verified against
real slide_layout.name values from MMW_PPT_Template_7_24_26.pptx.
See individual function headers for source slide numbers, confirmed
vs. unconfirmed dark/light status, and any flagged anomalies.
============================================================ */

(function () {
'use strict';

var SD = window.StandardDeck;
if (!SD || !SD.SD_CONST) { console.error('[deck-layouts] FATAL: standard-deck.js v6.0+ must load first.'); return; }
var C = SD.SD_CONST; // not currently used by any MMW layout (all use hardcoded
                      // positions, not the generic renderHeader/getGrid system) -
                      // kept available for future MMW layouts that may want it.

var _prefetchUrls = [];
function registerPrefetch(url) { if (_prefetchUrls.indexOf(url) === -1) _prefetchUrls.push(url); }

// ============================================================
// LAYOUT: COVER LIGHT
// MMW branded light cover. Lower-half title (2.55" box, accommodates
// natural 2-line wrap), diagonal geometric background (approximated —
// set bgImage on slide data for pixel-perfect output).
// Source: slide_layout.name "Cover Light2" (slide 1 exactly) — CONFIRMED
// DISTINCT from coverGeometric's "Cover Light"/"Cover Dark" (slides 6/7):
// title box is 9.65x2.55" @ y:3.99 here vs 12.56x1.12" @ y:4.40 there.
// Different design, not redundant, despite similar descriptions.
//
// Always: dark:0 | customFooter:true
// Requires image refs on slide data:
//   gi0     → MMW logo PNG (161x44 Keynote native)
//   gi1     → WPP|Mazda lockup PNG (148x27 Keynote native)
//   bgImage → Official MMW light bg PNG for pixel-perfect diagonal
// ============================================================
function layoutCoverLight(cfg) {
  var els = [];

  els.push({
    type: 's',
    x: 3.75, y: 0, w: 9.58, h: 7.50,
    fill: 'ltGray', transparency: 88
  });

  els.push({
    type: 's',
    x: 10.50, y: 6.72, w: 2.83, h: 0.78,
    fill: 'ltGray'
  });

  els.push({
    type: 'img', ref: 'gi0',
    x: 0.41, y: 0.37, w: 1.12, h: 0.31
  });

  els.push({
    type: 't', text: cfg.title || '',
    x: 0.40, y: 3.99,
    w: 9.65, h: 2.55,
    font: 'H', size: 109, color: 'title'
  });

  els.push({
    type: 'img', ref: 'gi1',
    x: 0.42, y: 7.06, w: 1.03, h: 0.19
  });

  if (cfg.date) {
    els.push({
      type: 't', text: cfg.date,
      x: 1.90, y: 7.00,
      w: 11.02, h: 0.35,
      font: 'B', size: 24, color: 'muted',
      valign: 'bottom'
    });
  }

  return els;
}

// ============================================================
// LAYOUT: COVER GEOMETRIC
// MMW cover, geometric brand-pattern background. Light/dark toggle.
// Source: slide_layout.name "Cover Light" / "Cover Dark"
// Requires: gi0 (logo), gi1 (WPP|Mazda lockup), bgImage (geometric bg)
// ============================================================
function layoutCoverGeometric(cfg) {
  var els = [];
  els.push({type:'img', ref:'gi0', x:0.41, y:0.37, w:1.12, h:0.31});
  els.push({type:'t', text:cfg.title||'', x:0.39, y:4.40, w:12.56, h:1.12,
            font:'H', size:109, color:'title'});
  els.push({type:'img', ref:'gi1', x:0.42, y:7.06, w:1.03, h:0.19});
  if (cfg.date) {
    els.push({type:'t', text:cfg.date, x:1.90, y:7.00, w:11.02, h:0.35,
              font:'B', size:24, color:'muted', valign:'bottom'});
  }
  return els;
}

// ============================================================
// LAYOUT: COVER SCENIC
// MMW cover, full-bleed photography. Dark only (source examples).
// No footer — intentional, confirmed: trades footer for photo room.
// Source: slide_layout.name "Cover Photo" (slides 8, 9 exactly)
// Requires: gi0 (logo), bgImage (scenic photo). No gi1.
// ============================================================
function layoutCoverScenic(cfg) {
  var els = [];
  els.push({type:'img', ref:'gi0', x:0.41, y:0.37, w:1.12, h:0.31});
  els.push({type:'t', text:cfg.title||'', x:0.42, y:4.70, w:12.48, h:0.98,
            font:'H', size:109, color:'title'});
  if (cfg.subtitle) {
    els.push({type:'t', text:cfg.subtitle, x:0.42, y:5.65, w:12.48, h:0.33,
              font:'B', size:34, color:'title'});
  }
  return els;
}

// ============================================================
// LAYOUT: COVER LOGO CUTOUT
// MMW cover, geometric logo cutout graphic (right side). Narrower
// title column. Cutout geometry varies per real source instance —
// bgImage only, no shape approximation.
// Source: slide_layout.name "Cover Photo2" (slides 10, 11 exactly) —
// confirmed.
// Note: slide 1 (layoutCoverLight, "Cover Light2") was checked against
// coverGeometric's "Cover Light" (slide 6) and confirmed genuinely
// distinct — different title box dimensions, not a duplicate. See
// layoutCoverLight's header comment for details.
// Requires: gi0 (logo), gi1 (WPP|Mazda lockup), bgImage (cutout graphic)
// ============================================================
function layoutCoverLogoCutout(cfg) {
  var els = [];
  els.push({type:'img', ref:'gi0', x:0.41, y:0.37, w:1.12, h:0.31});
  els.push({type:'t', text:cfg.title||'', x:0.39, y:4.37, w:6.48, h:1.12,
            font:'H', size:109, color:'title'});
  els.push({type:'img', ref:'gi1', x:0.42, y:7.06, w:1.03, h:0.19});
  if (cfg.date) {
    els.push({type:'t', text:cfg.date, x:1.90, y:7.00, w:11.02, h:0.35,
              font:'B', size:24, color:'muted', valign:'bottom'});
  }
  return els;
}

// ============================================================
// LAYOUT: DIVIDER BRAND
// MMW section divider — distinct from generic layoutDivider (that's
// a plain centered 42pt title with no tag; this is MMW's actual
// design: eyebrow tag + 109pt title, fixed lower-third position).
// Confirmed via real source slide_layout.name values (not inferred):
// 8 named masters share this exact structure, differing only in
// background. No shape approximation is drawn for backgrounds —
// bgImage is required for all variants except flat 'light'/'dark'.
//
// cfg.bgVariant (matches real master names exactly):
//   'dark' (default) | 'dark2' | 'light' | 'light2' | 'asphalt' |
//   'canopy' | 'aurora' | 'tides'
//   Any variant may optionally take a custom bgImage per instance
//   (confirmed: slide using 'tides' had a photo background swapped in
//   — background image is a per-instance choice, not a separate variant).
//   canopy/aurora/tides: for the tag color to actually read as that
//   family (not whatever accent is globally active), call
//   SD.setAccent('canopy'|'aurora'|'tide') before rendering this slide.
//   NOTE: engine's ACCENT_FAMILIES key is 'tide' (singular) — the
//   source master is named "Divider Tides" (plural). Naming mismatch
//   across brand.json/engine/master names, flagged, not yet resolved.
//
// A "Divider Light3" master exists in the broader 72-master Keynote
// catalog but is not instantiated anywhere in this 115-slide deck —
// not built here, no real instance to verify geometry against.
//
// Requires image refs on slide data:
//   bgImage → required for dark2/light2/asphalt/canopy/aurora/tides,
//             optional override for light/dark
// ============================================================
function layoutDividerBrand(cfg) {
  var els = [];
  var bgVariant = cfg.bgVariant || 'dark';

  if (cfg.tag) {
    els.push({type:'t', text:cfg.tag, x:0.61, y:3.00, w:12.12, h:0.56,
              font:'H', size:31, color:'accent'});
  }
  els.push({type:'t', text:cfg.title||'', x:0.61, y:3.58, w:12.12, h:0.98,
            font:'H', size:109, color:'title'});

  return els;
}


// ============================================================
// LAYOUT: CONTENT 03
// MMW content template — asymmetric photo + card composition.
// No standard header (no tag, title floats mid-slide at y:3.20,
// not the generic TITLE_Y) — bespoke MMW positioning, not built on
// renderHeader. No footer (confirmed).
// Source: slide_layout.name "Content03" (slide 23, single instance)
//
// Photo box uses the engine's existing _imgPlaceholder convention
// (confirmed via layoutHerosplit/others) rather than a required gi-slot
// asset — this is a generic "drop your photo here" content zone, not
// a specific required brand asset like the logo. Exports as a real
// addImage()-based picture (native PowerPoint "Change Picture..."
// support) showing a neutral placeholder, never the template's own
// original photo.
// ============================================================
function layoutContent03(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  // Photo placeholder (top-right)
  els.push({ type:'s', x:6.62, y:0.47, w:6.71, h:3.44,
    fill:phFill, border:phBorder, _imgPlaceholder:true });
  els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
    x:6.82, y:2.03, w:6.31, h:0.30,
    font:'H', size:9, color:phColor, align:'center', valign:'middle', _skipExport:true });

  // Title (mid-slide, no standard header zone)
  els.push({ type:'t', text:cfg.title||'', x:0.76, y:3.20, w:5.52, h:0.60,
    font:'H', size:70, color:'title' });

  // Card (bottom-left)
  els.push({ type:'s', x:0.81, y:4.06, w:6.73, h:3.44,
    fill:'cardBg', border:dk?null:'cardBorder' });

  // Body copy (bottom-right, beside card)
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:7.83, y:4.10, w:4.16, h:1.44,
      font:'B', size:20, color:'body' });
  }

  return els;
}


// ============================================================
// LAYOUT: CONTENT 04
// MMW content template — title + asymmetric 4-photo strip + caption
// + large panel below. No footer (confirmed).
// Source: slide_layout.name "Content04" (slide 24, single instance)
//
// Strip widths (2.31/1.40/2.71/1.64") are deliberately asymmetric in
// the one real source instance, not a uniform grid formula — hardcoded
// to match exactly rather than parameterized, since there's no evidence
// yet this varies across other real instances.
//
// All 5 photo zones use the _imgPlaceholder convention (see content03) —
// generic replaceable placeholders, not the template's own photos.
// ============================================================
function layoutContent04(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  // Title (standard title-zone position)
  els.push({ type:'t', text:cfg.title||'', x:0.76, y:1.38, w:6.09, h:0.60,
    font:'H', size:70, color:'title' });

  // 4-photo strip (asymmetric widths, fixed per source)
  placeholder(0.81, 2.05, 2.31, 1.75, 8);
  placeholder(3.20, 2.05, 1.40, 1.75, 7);
  placeholder(4.67, 2.05, 2.71, 1.75, 8);
  placeholder(7.45, 2.05, 1.64, 1.75, 7);

  // Caption text (right of strip)
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:9.51, y:2.01, w:2.99, h:1.79,
      font:'B', size:20, color:'body' });
  }

  // Large panel below
  placeholder(0.81, 3.87, 8.29, 3.29, 10);

  return els;
}


// ============================================================
// LAYOUT: CONTENT 05
// MMW content template — left text column (title + body) + right
// large photo panel + bottom-right asymmetric 4-photo thumbnail strip.
// No footer (confirmed).
// Source: slide_layout.name "Content05" (slide 25, single instance)
//
// Thumbnail strip only spans the right ~9.5" (starts at x:3.52, under
// the large panel) — the left text column has no thumbnail beneath it.
// Widths (1.45/2.85/1.64/3.31") are asymmetric per source, not a
// uniform grid — hardcoded to match exactly, same rationale as content04.
//
// All 5 photo zones use the _imgPlaceholder convention (see content03).
// ============================================================
function layoutContent05(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  // Title (left column)
  els.push({ type:'t', text:cfg.title||'', x:0.63, y:2.01, w:4.23, h:0.60,
    font:'H', size:70, color:'title' });

  // Body text (left column, below title)
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.65, y:2.66, w:3.31, h:1.79,
      font:'B', size:20, color:'body' });
  }

  // Large photo panel (right side)
  placeholder(5.06, 2.03, 8.01, 3.28, 11);

  // 4-photo thumbnail strip (bottom-right, asymmetric widths)
  placeholder(3.52, 5.42, 1.45, 1.75, 7);
  placeholder(5.02, 5.42, 2.85, 1.74, 8);
  placeholder(7.98, 5.42, 1.64, 1.75, 7);
  placeholder(9.75, 5.42, 3.31, 1.75, 8);

  return els;
}


// ============================================================
// LAYOUT: TABLE OF CONTENTS
// MMW table of contents. NOT built on renderHeader — bespoke small
// top-left heading (34pt, not standard TITLE_Y), one large 60pt text
// block for the numbered list (manual line breaks, not individual
// row elements like generic layoutRows/agenda), body copy bottom-left.
// No footer (confirmed).
// Source: slide_layout.name "Table of contents" (slide 22, single
// instance in pptx). Body text box position (x:0.29 y:6.33 w:4.02
// h:0.89) verified exactly against Keynote's native Arrange panel
// (579x128pt @ 42,912pt, /72/2x-scale) - confirmed correct, not a
// stray/misplaced element.
//
// Keynote has TWO versions of this master: "Table of contents" (white
// bg) and "Table of contents 2" (light gray bg, close to MMW Paper
// #EEEEEE) - identical layout, background shade only. Only the white
// variant has a real pptx instance; gray variant built from visual
// confirmation only, no pptx geometry to verify against.
//
// cfg.bg: 'white' (default) | 'gray'
// Background diagonal pattern is an inherited picture fill (same as
// covers/dividers) - no shape approximation, bgImage required for
// production fidelity.
//
// Confirmed via raw XML: "Subtitle" and "Table of contents" share
// identical paragraph-level formatting (34pt, same run) - genuinely
// one uniformly-styled 2-line block, not a distinct label+heading pair.
// "Table of contents" is the master's fixed identity; "Subtitle" line
// is the only variable part.
// ============================================================
function layoutTableOfContents(cfg) {
  var els = [];
  var items = cfg.items || [
    '01 Introduce the problem', '02 Present your solution',
    '03 Highlight your product', '04 Business',
    '05 Target your market', '06 Outline the next steps'
  ];

  var headingLines = [];
  if (cfg.subtitle) headingLines.push(cfg.subtitle);
  headingLines.push('Table of contents');

  els.push({ type:'t', text:headingLines.join('\n'), x:0.29, y:0.43, w:2.81, h:0.72,
    font:'H', size:34, color:'body' });

  els.push({ type:'t', text:items.join('\n'), x:5.42, y:0.40, w:7.58, h:4.63,
    font:'H', size:60, color:'title', textStyle:'L4' });

  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.29, y:6.33, w:4.02, h:0.89,
      font:'B', size:20, color:'body' });
  }

  return els;
}


// ============================================================
// LAYOUT: THANK YOU
// MMW closing slide. Light/dark toggle via cfg.dark.
// Source: slide_layout.name "Thank You Light" (slide 52) / "Thank You
// Dark" (slide 53).
//
// Confirmed asymmetry between real instances: Light shows draft-date
// text in the footer; Dark shows a logo-shaped element instead (same
// position/size as the WPP|Mazda lockup used in cover functions - gi1).
// Both made optional via cfg rather than hardcoding the asymmetry, but
// defaults match what's actually observed per variant.
//
// Dark variant's title uses color:'accent' (not 'title'/'white') per
// source - same brand-fidelity-vs-contrast-rule question flagged for
// dividerBrand, not re-resolved here, kept faithful to source.
// ============================================================
function layoutThankYou(cfg) {
  var els = [];
  var dk = cfg.dark === 1;

  els.push({ type:'t', text:cfg.title||'THANK YOU', x:0.61, y: dk ? 3.29 : 3.31,
    w:12.12, h:0.98, font:'H', size:109, color: dk ? 'accent' : 'title' });

  // Footer: date text (default for light) or logo lockup (default for dark)
  var showLogo = cfg.showLogo !== undefined ? cfg.showLogo : dk;
  var showDate = cfg.date !== undefined ? !!cfg.date : !dk;

  if (showLogo) {
    els.push({ type:'img', ref:'gi1', x:0.42, y:7.06, w:1.02, h:0.19 });
  }
  if (showDate && cfg.date) {
    els.push({ type:'t', text:cfg.date, x:1.90, y:7.00, w:12.01, h:0.35,
      font:'B', size:24, color:'muted', valign:'bottom' });
  }

  return els;
}


// ============================================================
// LAYOUT: HEADLINE
// MMW oversized headline/pull-quote slide. Single giant 280pt word/
// phrase + small accent-colored eyebrow tag above it.
// Source: slide_layout.name "Content - Headline light" (slide 32) /
// "Content -headline dark" (slide 33) / "Headline Photo Divider"
// (slide 41). All 3 real instances are pixel-identical in structure
// and text color (white title, accent tag) despite the "light" naming
// on one of them — the light/dark/photo distinction appears to be
// about which background image loads, not a text-color toggle like
// dividerBrand/covers. Built accordingly: text treatment is constant,
// cfg.bgVariant only selects the background asset.
//
// Slide 34 ("1_Content -headline photo copy") was NOT built separately
// - the literal "copy" in its name strongly suggests an accidental
// duplicate of this master (likely of the photo variant, given the
// name overlap), consistent with the duplicate-naming pattern already
// flagged to the creator for review.
//
// cfg.bgVariant: 'light' | 'dark' (default) | 'photo'
// No footer visible in any of the 3 confirmed instances.
// ============================================================
function layoutHeadline(cfg) {
  var els = [];

  els.push({ type:'t', text:cfg.tag||'', x:2.92, y:2.42, w:7.49, h:0.42,
    font:'H', size:31, color:'accent' });

  els.push({ type:'t', text:cfg.title||'', x:0.12, y:2.84, w:13.09, h:4.66,
    font:'H', size:280, color:'title', textStyle:'L4' });

  return els;
}


// ============================================================
// LAYOUT: STORYBOARD VO
// MMW production-planning template — spot title/duration + VO script
// (left column) + 3-panel reference image stack (right column, 1 large
// top + 2 medium below). No footer.
// Source: slide_layout.name "Storyboard 01" (slide 35, single instance)
//
// All 3 image panels use the _imgPlaceholder convention (see content03).
// ============================================================
function layoutStoryboardVO(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  if (cfg.subhead) {
    els.push({ type:'t', text:cfg.subhead, x:0.78, y:0.54, w:5.36, h:0.45,
      font:'H', size:26, color:'body' });
  }
  els.push({ type:'t', text:cfg.title||'', x:0.78, y:0.94, w:5.36, h:0.69,
    font:'H', size:70, color:'muted' });
  if (cfg.script) {
    els.push({ type:'t', text:cfg.script, x:0.78, y:1.75, w:5.36, h:5.20,
      font:'B', size:20, color:'body' });
  }

  placeholder(7.06, -0.00, 6.27, 2.60, 11);
  placeholder(7.06, 2.69, 6.27, 2.28, 10);
  placeholder(7.06, 5.07, 6.27, 2.44, 10);

  return els;
}


// ============================================================
// LAYOUT: STORYBOARD GRID
// MMW production-planning template — 6-panel numbered shot grid
// (2 columns x 3 rows). Each panel: number + caption + image
// placeholder. No footer.
// Source: slide_layout.name "Storyboard 02" (slide 36, single instance)
//
// cfg.items expects exactly 6 {number, caption} objects - single source
// instance only supports this fixed count, not verified to vary.
// All 6 image panels use the _imgPlaceholder convention.
// ============================================================
function layoutStoryboardGrid(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';
  var items = cfg.items || [
    {number:'01', caption:'Lorem ipsum dolor sit amet, consectetur'},
    {number:'02', caption:'Lorem ipsum dolor sit amet, consectetur'},
    {number:'03', caption:'Lorem ipsum dolor sit amet, consectetur'},
    {number:'04', caption:'Lorem ipsum dolor sit amet, consectetur'},
    {number:'05', caption:'Lorem ipsum dolor sit amet, consectetur'},
    {number:'06', caption:'Lorem ipsum dolor sit amet, consectetur'}
  ];

  if (cfg.subhead) {
    els.push({ type:'t', text:cfg.subhead, x:0.26, y:0.14, w:12.80, h:0.45,
      font:'H', size:26, color:'body' });
  }
  els.push({ type:'t', text:cfg.title||'STORYBOARD', x:0.26, y:0.42, w:12.80, h:0.69,
    font:'H', size:70, color:'muted' });

  var labelX = [0.46, 6.99]; var capX = [0.44, 6.97]; var shapeX = [3.10, 9.63];
  var rowY = [1.18, 3.22, 5.25]; var labelY = [1.32, 3.35, 5.39]; var capY = [1.84, 3.86, 5.90];

  items.slice(0, 6).forEach(function(item, i) {
    var col = i < 3 ? 0 : 1; var row = i % 3;
    els.push({ type:'t', text:item.number, x:labelX[col], y:labelY[row], w:0.33, h:0.32,
      font:'H', size:34, color:'muted' });
    els.push({ type:'t', text:item.caption, x:capX[col], y:capY[row], w:2.41, h:0.41,
      font:'B', size:15, color:'muted' });
    els.push({ type:'s', x:shapeX[col], y:rowY[row], w:3.47, h:1.94,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:shapeX[col]+0.10, y:rowY[row]+0.82, w:3.27, h:0.30,
      font:'H', size:9, color:phColor, align:'center', valign:'middle', _skipExport:true });
  });

  return els;
}


// ============================================================
// LAYOUT: SCRIPTS COMPARE
// MMW production-planning template — spot title/duration + two
// side-by-side VO script columns (no images). No footer.
// Source: slide_layout.name "Scripts 01" (slide 37, single instance)
// ============================================================
function layoutScriptsCompare(cfg) {
  var els = [];

  if (cfg.subhead) {
    els.push({ type:'t', text:cfg.subhead, x:0.64, y:0.48, w:12.06, h:0.45,
      font:'H', size:26, color:'body' });
  }
  els.push({ type:'t', text:cfg.title||'', x:0.64, y:0.82, w:12.06, h:0.69,
    font:'H', size:70, color:'muted' });

  if (cfg.scriptA) {
    els.push({ type:'t', text:cfg.scriptA, x:0.64, y:1.60, w:4.93, h:5.20,
      font:'B', size:19, color:'body' });
  }
  if (cfg.scriptB) {
    els.push({ type:'t', text:cfg.scriptB, x:6.66, y:1.60, w:4.93, h:5.20,
      font:'B', size:19, color:'body' });
  }

  return els;
}


// ============================================================
// LAYOUT: VIDEO REFERENCE
// MMW production-planning template — title + subhead + caption text
// (left) + 4-panel staggered mosaic (right, heights swap between
// columns for visual variety - classic masonry pattern). No footer.
// Source: slide_layout.name "Video Reference" (slide 44, single instance)
//
// All 4 image panels use the _imgPlaceholder convention.
// ============================================================
function layoutVideoReference(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  els.push({ type:'t', text:cfg.title||'VIDEO REFERENCES', x:0.81, y:0.49, w:11.72, h:1.06,
    font:'H', size:70, color:'muted' });
  if (cfg.subhead) {
    els.push({ type:'t', text:cfg.subhead, x:0.80, y:1.58, w:11.73, h:0.45,
      font:'H', size:26, color:'body' });
  }
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.85, y:5.06, w:2.74, h:1.76,
      font:'B', size:20, color:'body' });
  }

  placeholder(5.33, 2.50, 3.20, 2.49, 8);
  placeholder(8.59, 2.50, 4.47, 1.77, 9);
  placeholder(8.59, 4.34, 4.48, 2.49, 8);
  placeholder(5.34, 5.05, 3.19, 1.77, 8);

  return els;
}


// ============================================================
// LAYOUT: CASTING GRID
// MMW production-planning template — uniform 4-column talent casting
// grid. Each column: headshot photo + Name/Height/Weight stat block.
// Source: slide_layout.name "Casting" (slide 45, single instance)
//
// ** dark/light UNCONFIRMED ** - no title text present on this slide
// for the engine's dark/light inference to work from (flagged
// [bg:unknown] by extraction). Defaulting to light (engine fallback);
// override via cfg.dark if this turns out wrong - not verified visually.
//
// All 4 photo zones use the _imgPlaceholder convention.
// ============================================================
function layoutCastingGrid(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';
  var items = cfg.items || [
    {name:'', height:'', weight:''}, {name:'', height:'', weight:''},
    {name:'', height:'', weight:''}, {name:'', height:'', weight:''}
  ];

  var photoX = [1.15, 3.96, 6.77, 9.59];
  var labelX = [1.13, 3.93, 6.72, 9.52];
  var labelW = [1.70, 1.54, 1.54, 1.54];

  items.slice(0, 4).forEach(function(item, i) {
    els.push({ type:'s', x:photoX[i], y:2.06, w:2.69, h:2.81,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:photoX[i]+0.15, y:3.31, w:2.39, h:0.30,
      font:'H', size:9, color:phColor, align:'center', valign:'middle', _skipExport:true });
    var label = 'Name: ' + (item.name||'') + '\nHeight: ' + (item.height||'') +
      '\nWeight: ' + (item.weight||'');
    els.push({ type:'t', text:label, x:labelX[i], y:4.98, w:labelW[i], h:0.59,
      font:'B', size:20, color:'body' });
  });

  return els;
}


// ============================================================
// LAYOUT: CASTING TALENT
// MMW production-planning template — 4-column staggered-height photo
// row (short/tall/short/tall). Only the 2 short columns (1 and 3) get
// a Name/Height/Weight stat block; the 2 tall columns (2 and 4) are
// unlabeled supporting/reference photos, not profiled talent.
// Source: slide_layout.name "Casting_Talent" (slide 46, single instance)
//
// ** dark/light UNCONFIRMED ** - same inference gap as castingGrid,
// defaulting to light, not verified visually.
//
// Distinct composition from castingGrid, not a variant of it - kept
// as a separate function per established convention.
// ============================================================
function layoutCastingTalent(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';
  var talents = cfg.talents || [
    {name:'', height:'', weight:''}, {name:'', height:'', weight:''}
  ];

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  // Short columns (profiled talent)
  placeholder(0.81, 2.08, 2.69, 2.81, 9);
  placeholder(7.07, 2.08, 2.69, 2.81, 9);
  // Tall columns (unlabeled supporting photos)
  placeholder(3.61, 2.08, 2.69, 4.20, 9);
  placeholder(9.87, 2.08, 2.69, 4.20, 9);

  var t = talents.slice(0, 2);
  var labelX = [0.81, 7.06];
  t.forEach(function(item, i) {
    var label = 'Name: ' + (item.name||'') + '\nHeight: ' + (item.height||'') +
      '\nWeight: ' + (item.weight||'');
    els.push({ type:'t', text:label, x:labelX[i], y: i===0?4.94:5.01, w:2.69, h:0.59,
      font:'B', size:20, color:'body' });
  });

  return els;
}


// ============================================================
// LAYOUT: LOCATION OVERVIEW
// MMW production-planning template — tag + 5-column labeled location
// thumbnail row + 3 extra stacked photos under the 5th column only.
// Source: slide_layout.name "Location Overview" (slide 47, single instance)
//
// ANOMALY, preserved not fixed: 2 of the 3 extra stacked photos under
// column 5 share the exact same x/y/w/h in the source (10.78, 3.70,
// 2.55, 1.53) - looks like an accidental duplicate shape, not
// intentional layering. Kept as-is per "match source exactly"
// convention; worth flagging to the creator if this comes up again.
//
// dark/light unconfirmed (same inference gap as casting functions),
// defaults light.
// ============================================================
function layoutLocationOverview(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';
  var items = cfg.items || [
    {label:'WORK SCENARIO'}, {label:'BOUTIQUE SPORTS CLUB'},
    {label:'WEEKEND GETAWAY'}, {label:'RUNNING FOOTAGE'}, {label:'VINTAGE CAR SHOW'}
  ];

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  els.push({ type:'t', text:cfg.tag||'LOCATION: OVERVIEW', x:0.61, y:0.54, w:6.79, h:0.29,
    font:'H', size:29, color:'accent' });

  var colX = [-0.01, 2.69, 5.37, 8.09, 10.79];
  items.slice(0, 5).forEach(function(item, i) {
    els.push({ type:'t', text:item.label||'', x:colX[i], y:1.71, w:2.56, h:0.23,
      font:'B', size:19, color:'muted' });
    placeholder(colX[i], 2.01, 2.55, 1.53, 8);
  });

  // 3 extra photos under column 5 only (2 share identical position - see note above)
  placeholder(10.78, 3.70, 2.55, 1.53, 8);
  placeholder(10.78, 3.70, 2.55, 1.53, 8);
  placeholder(10.78, 5.41, 2.55, 1.53, 8);

  return els;
}


// ============================================================
// LAYOUT: LOCATION DETAIL
// MMW production-planning template — single-location deep-dive. Tag
// (day/location name) + headline (mood/style descriptor) + body copy
// + 3 asymmetric photo panels + small "sun tracking" diagram graphic.
// Source: slide_layout.name "Location Detail" (slide 48, single instance)
//
// The small graphic near "Track sun" is likely a sun-path/compass
// diagram specific to location scouting - not recreatable, built as a
// generic placeholder like the photos rather than omitted.
//
// dark:1 confirmed (title text color resolved from real background,
// unlike castingGrid/castingTalent/locationOverview).
// ============================================================
function layoutLocationDetail(cfg) {
  var els = [];
  var dk = cfg.dark !== 0; // defaults true - confirmed dark in source
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  els.push({ type:'t', text:cfg.tag||'', x:0.61, y:0.54, w:6.79, h:0.29,
    font:'H', size:29, color:'accent' });
  if (cfg.headline) {
    els.push({ type:'t', text:cfg.headline, x:0.61, y:0.85, w:6.79, h:0.34,
      font:'H', size:48, color:'muted' });
  }
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.61, y:1.96, w:4.95, h:1.15,
      font:'B', size:20, color:'muted' });
  }

  placeholder(0.01, 3.35, 2.69, 3.43, 9);
  placeholder(2.84, 3.35, 6.06, 3.43, 11);
  placeholder(9.04, 3.35, 4.33, 3.43, 10);

  // Sun tracking / compass diagram graphic
  placeholder(11.24, -0.24, 1.38, 3.01, 7);
  els.push({ type:'t', text:cfg.trackSunLabel||'Track sun', x:10.93, y:2.82, w:2.00, h:0.24,
    font:'B', size:24, color:'muted' });

  return els;
}


// ============================================================
// LAYOUT: MOODBOARD PROPS
// MMW production-planning template — dense prop-list moodboard: 17
// non-formulaic image placements + 11 position-matched captions + a
// notes/instructions tag. Positions are fixed to match the single real
// source instance exactly (no grid formula exists to generalize from);
// captions are parameterized as text, not position.
// Source: slide_layout.name "Moodboard Props" (slide 49, single instance)
// dark/light unconfirmed, defaults light.
// ============================================================
function layoutMoodboardProps(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';

  var photoPositions = [
    [10.91,2.34,1.81,1.57], [0.46,1.85,2.00,2.03], [2.35,2.77,1.38,1.10],
    [3.99,2.35,2.35,1.50], [6.34,2.90,0.62,0.59], [6.77,3.38,1.75,0.47],
    [10.13,5.44,2.65,1.26], [0.94,4.58,1.13,0.66], [6.80,2.90,0.62,0.59],
    [9.00,2.73,1.29,1.09], [7.35,2.80,1.30,0.80], [0.65,5.70,1.75,0.99],
    [3.24,5.16,1.57,1.59], [5.93,5.92,1.07,0.74], [5.93,5.39,1.03,0.80],
    [5.91,4.82,1.00,0.74], [7.62,5.51,2.04,1.18]
  ];
  photoPositions.forEach(function(p) {
    els.push({ type:'s', x:p[0], y:p[1], w:p[2], h:p[3],
      fill:phFill, border:phBorder, _imgPlaceholder:true });
  });

  els.push({ type:'t', text:cfg.notes||'\u2022 Clean minimal design\n\u2022 Avoid clutter', x:7.78, y:0.54, w:4.95, h:0.89,
    font:'B', size:20, color:'muted' });

  var captions = cfg.captions || [
    'FOLDING TABLE', 'Box of pastries and napkins', 'DomeStic cooler w/ ice\nPLUG IN',
    'ADDITIONAL VINTAGE MAZDA COMING', 'FOLDING CHAIRS / 2 SETS',
    'STOVE TOP COOKER and coffee pot', 'STONE COFFEE MUGS', 'TUMBLERS',
    'Small wool throw', 'Baseball caps for talent', 'Variety of sunglasses'
  ];
  var capPositions = [
    [3.19,3.95,1.62,0.18], [3.19,6.73,1.62,0.34], [10.90,4.04,2.12,0.58],
    [11.21,6.87,1.50,0.34], [0.76,4.02,1.62,0.18], [5.51,4.02,2.12,0.18],
    [5.51,4.22,2.12,0.18], [8.33,4.04,2.12,0.18], [0.76,6.88,1.62,0.18],
    [5.76,6.88,1.62,0.18], [11.71,6.89,1.62,0.18]
  ];
  captions.slice(0, 11).forEach(function(text, i) {
    var p = capPositions[i];
    els.push({ type:'t', text:text, x:p[0], y:p[1], w:p[2], h:p[3],
      font:'B', size:13, color:'muted' });
  });

  return els;
}


// ============================================================
// LAYOUT: MOODBOARD WARDROBE
// MMW production-planning template — character wardrobe board. Tag
// (character|board name) + title (look name) + subtitle (gender/role)
// + body text + 4 evenly-spaced outfit photos (parameterized as
// cfg.items) + 3 fixed small accessory elements + 1 caption.
// Source: slide_layout.name "Moodboard Wardrobe" (slide 50, single instance)
// dark/light unconfirmed, defaults light.
// ============================================================
function layoutMoodboardWardrobe(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';
  var items = cfg.items || [{}, {}, {}, {}];

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  els.push({ type:'t', text:cfg.tag||'', x:0.61, y:0.54, w:12.12, h:0.29,
    font:'H', size:29, color:'accent' });
  if (cfg.title) {
    els.push({ type:'t', text:cfg.title, x:0.61, y:1.75, w:3.90, h:1.16,
      font:'H', size:70, color:'muted' });
  }
  if (cfg.subtitle) {
    els.push({ type:'t', text:cfg.subtitle, x:0.61, y:2.82, w:3.65, h:0.69,
      font:'B', size:26, color:'body' });
  }
  if (cfg.text) {
    els.push({ type:'t', text:cfg.text, x:0.61, y:3.51, w:3.65, h:1.76,
      font:'B', size:20, color:'body' });
  }

  // 4 outfit photos, evenly spaced
  var outfitX = [4.51, 6.74, 9.00, 11.24];
  items.slice(0, 4).forEach(function(item, i) {
    placeholder(outfitX[i], 1.48, i===2?2.11:2.15, 3.67, 9);
  });

  // Fixed small accessory elements
  placeholder(9.35, 3.62, 1.40, 2.10, 7);
  els.push({ type:'s', x:11.69, y:4.83, w:1.19, h:0.63, fill:phFill, border:phBorder, _imgPlaceholder:true });
  placeholder(11.72, 5.51, 1.14, 0.93, 6);
  if (cfg.accessoryCaption) {
    els.push({ type:'t', text:cfg.accessoryCaption, x:11.63, y:6.49, w:1.33, h:0.35,
      font:'B', size:16, color:'muted' });
  }

  return els;
}


// ============================================================
// LAYOUT: MOODBOARD TONE AND MANNER
// MMW production-planning template — aesthetic direction moodboard.
// Top annotation tag (e.g. vehicle color spec, shown as context within
// the mood imagery) + 8-photo asymmetric mosaic, no per-photo captions.
// Source: slide_layout.name "Moodboard " (slide 51, single instance) -
// renamed "Tone and Manner" per creator context; the color-spec text
// in the real instance is contextual annotation, not the master's
// defining purpose.
// dark/light unconfirmed, defaults light.
// ============================================================
function layoutMoodboardToneManner(cfg) {
  var els = [];
  var dk = cfg.dark === 1;
  var phFill = dk ? 'black' : 'white';
  var phBorder = dk ? null : 'ltGray';
  var phColor = dk ? 'muted' : 'gray';

  function placeholder(x, y, w, h, labelSize) {
    els.push({ type:'s', x:x, y:y, w:w, h:h,
      fill:phFill, border:phBorder, _imgPlaceholder:true });
    els.push({ type:'t', text:'RIGHT-CLICK \u2192 CHANGE PICTURE',
      x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
      font:'H', size:labelSize, color:phColor, align:'center', valign:'middle',
      _skipExport:true });
  }

  if (cfg.tag) {
    els.push({ type:'t', text:cfg.tag, x:6.73, y:0.40, w:6.24, h:0.43,
      font:'H', size:29, color:'accent' });
  }

  placeholder(-0.01, 1.17, 4.43, 4.50, 11);
  placeholder(4.41, 1.17, 2.55, 2.89, 8);
  placeholder(6.47, 1.17, 3.01, 2.72, 8);
  placeholder(9.48, 1.17, 3.85, 2.71, 9);
  placeholder(0.00, 5.70, 3.95, 1.79, 9);
  placeholder(3.92, 5.67, 3.36, 1.85, 9);
  placeholder(4.41, 3.88, 2.92, 1.79, 9);
  placeholder(7.28, 3.87, 6.08, 3.67, 11);

  return els;
}


var LAYOUT_MAP = {
 coverLight:layoutCoverLight, coverGeometric:layoutCoverGeometric,
 coverScenic:layoutCoverScenic, coverLogoCutout:layoutCoverLogoCutout,
 dividerBrand:layoutDividerBrand, content03:layoutContent03,
 content04:layoutContent04, content05:layoutContent05,
 tableOfContents:layoutTableOfContents, thankYou:layoutThankYou,
 headline:layoutHeadline, storyboardVO:layoutStoryboardVO,
 storyboardGrid:layoutStoryboardGrid, scriptsCompare:layoutScriptsCompare,
 videoReference:layoutVideoReference, castingGrid:layoutCastingGrid,
 castingTalent:layoutCastingTalent, locationOverview:layoutLocationOverview,
 locationDetail:layoutLocationDetail, moodboardProps:layoutMoodboardProps,
 moodboardWardrobe:layoutMoodboardWardrobe, moodboardToneManner:layoutMoodboardToneManner
};

function dispatch(slideData) {
 var fn = LAYOUT_MAP[slideData.layout];
 if (fn) return fn(slideData);
 if (slideData.els) return slideData.els;
 console.warn('[deck-layouts] Unknown layout: "' + slideData.layout + '"');
 return [];
}

window.DeckLayouts = { dispatch:dispatch, getPrefetchUrls:function(){ return _prefetchUrls; } };
})();
