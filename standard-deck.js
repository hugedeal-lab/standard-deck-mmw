/* ============================================================
 standard-deck.js -- Core Rendering Engine (standard-deck-mmw)
 Forked from standard-deck-v3's standard-deck.js v6.0.6. Fresh start,
 MMW-exclusive: PALETTE and ACCENT_FAMILIES rebuilt to MMW's 4 brand
 families only (spark/canopy/aurora/tide) - legacy MNAO 13-family
 system dropped per project decision. Everything else (rendering,
 resolveColor, font handling) inherited unchanged from v6.0.6.
 ============================================================ */

(function () {
'use strict';

var CANVAS_W = 1920;
var CANVAS_H = 1200;
var SLIDE_W  = 13.33;
var SLIDE_H  = 7.5;
var SX       = CANVAS_W / SLIDE_W;
var SY       = CANVAS_H / SLIDE_H;
var PT_PX    = SY / 72;

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

var SD_CONST = {
  SLIDE_W: 13.33, SLIDE_H: 7.50,
  SAFE_X_MIN: 0.50, SAFE_X_MAX: 12.92, SAFE_W: 12.42,
  SAFE_Y_MIN: 0.75, SAFE_Y_MAX: 7.00,
  BAR_H: 0.08, TAG_Y: 0.75, TAG_H: 0.25,
  TITLE_Y: 1.10, TITLE_H_1: 0.55, TITLE_H_2: 0.90,
  HEADER_END: 1.75,
  CONTENT_Y: 2.10, CONTENT_Y_2: 2.30, CONTENT_END: 6.80,
  FOOTER_Y: 7.00, GAP: 0.25, TEXT_RATIO: 0.80,
  GRID: {
    full: { cols: [{ x: 0.50, w: 12.42 }] },
    col1: { cols: [{ x: 0.50, w: 12.42 }] },
    col2: { cols: [{ x: 0.50, w: 6.09 }, { x: 6.84, w: 6.08 }] },
    col3: { cols: [{ x: 0.50, w: 3.97 }, { x: 4.72, w: 3.97 }, { x: 8.94, w: 3.97 }] },
    col4: { cols: [{ x: 0.50, w: 2.92 }, { x: 3.67, w: 2.92 }, { x: 6.84, w: 2.92 }, { x: 10.01, w: 2.92 }] },
    col5: { cols: [{ x: 0.50, w: 2.28 }, { x: 3.03, w: 2.28 }, { x: 5.56, w: 2.28 }, { x: 8.09, w: 2.28 }, { x: 10.62, w: 2.28 }] }
  },
  TITLE_WRAP_THRESHOLD: 36
};

var SAFE = { x: SD_CONST.SAFE_X_MIN, y: SD_CONST.SAFE_Y_MIN, x2: SD_CONST.SAFE_X_MAX, y2: SD_CONST.SAFE_Y_MAX };

// ============================================================
// MNAO PALETTE
// ============================================================

var PALETTE = {
  black: '#262626', deepBlack: '#262626',   // MMW Asphalt
  white: '#EEEEEE',                          // MMW Paper
  dkGray: '#535B69', mdGray: '#333333',
  gray: '#999999', ltGray: '#CCCCCC',
  ok: '#28A745', warn: '#E67E00', bad: '#C12638',

  // ---- MMW template-confirmed tokens (v2.0) -------------------
  // NOTE: resolveColor() checks its `semantics` map BEFORE PALETTE, and
  // semantics.white/.black are #FFFFFF/#000000. Use `paper`/`asphalt`
  // for MMW Paper and MMW Asphalt -- `white`/`black` are pure values.
  asphalt:      '#262626',  // MMW Asphalt (slide master bg, dark surfaces)
  paper:        '#EEEEEE',  // MMW Paper (light surfaces, title on dark)
  paperHi:      '#EFEFEF',  // cover title on dark
  accentDim:    '#BFA588',  // report-chassis eyebrow, Thank You Dark title
  titleGray:    '#919292',  // report-chassis title
  bodyGray:     '#808080',  // body copy on light surfaces
  captionGray:  '#5E5E5E',  // captions, form labels
  mutedGray:    '#868686',  // draft-date footer, social secondary copy
  lt2:          '#D5D5D5',  // headline-light bg, social rail fill
  dividerLight: '#F5F5F5',  // Divider Light background only
  nearBlack:    '#1A1A1A',  // dark card fills in report components
  cardSand:     '#EAE7E0',  // Storyboard 02 caption cards
  ink:          '#221F20'   // Casting_Talent labels
};

// ============================================================
// MMW ACCENT FAMILIES (4)
// ============================================================

var ACCENT_FAMILIES = {
  // MMW palette, sourced from brand.json / MMW brand kit. 4-step tint
  // ramps collapsed to light/mid/dark: dark=ramp[0], mid=ramp[1],
  // light=ramp[3]. Fresh MMW-exclusive repo - legacy MNAO families
  // (bronze/red/navy/green/plum/gold/teal/charcoal/copper/indigo/
  // slate/wine/sage) intentionally dropped; pull from standard-deck-v3
  // if a non-MMW family is ever genuinely needed here.
  // spark.mid is the TEMPLATE-CONFIRMED value (#C4A584, 19 occurrences in
  // MMW PPT Template_7.24.26.pptx). brand.json documents #C4A484, which
  // appears nowhere in the template. Pending a brand-owner ruling; revert
  // this one value if brand.json is declared canonical.
  spark:    { light: '#FFE0C0', mid: '#C4A584', dark: '#9C7C5C' },  // MMW main accent
  canopy:   { light: '#B3BCB5', mid: '#43644B', dark: '#203822' },  // MMW secondary, green
  aurora:   { light: '#AFAEC1', mid: '#585181', dark: '#2D273D' },  // MMW secondary, purple
  tide:     { light: '#7CACC1', mid: '#074169', dark: '#0B2A47' }   // MMW secondary, blue
};

// Read off the template's own 10 chart parts, ordered brand-forward. v1.0's
// values were transcribed by eye and every one was a near-miss: #C4A484 for
// #C4A485, #7CACC1 for #7CA8C1, #43644B for #4A634D, #B3BCB5 for #B3BDB6.
var CHART_SERIES = ['#BFA588', '#7CA8C1', '#4A634D', '#C4A485', '#808080'];
var CHART_SERIES_LIGHT = ['#C4A485', '#B3BDB6', '#416986', '#EEEEEE', '#999999'];

var _accentLight = '#FFE0C0';
var _accentMid   = '#C4A484';
var _accentDark  = '#9C7C5C';
var _familyName  = 'spark';

// H = display (theme majorFont, Mazda Type Bold). B = body (theme minorFont,
// Arial). v1.0 mapped BOTH to Mazda Type, so body copy previewed in the display
// face -- the template's body font is Arial, not Mazda Type.
var FONT_MAP = {
  H:  { face: '"Mazda Type Bold", "Mazda Type", Helvetica, Arial, sans-serif', weight: 500 },
  HR: { face: '"Mazda Type", Helvetica, Arial, sans-serif', weight: 400 },
  B:  { face: 'Arial, Helvetica, sans-serif', weight: 400 }
};

var LIMITS = {
  bullets: 5, tableRows: 8, tableCols: 5,
  cards: 4, stats: 6, paragraphs: 3, rows: 4,
  cardTitleChars: 30, statLabelChars: 25,
  coverTitleChars: 40, titleChars: 48
};

var MIN_SIZES = {
  coverTitle: 36, title: 33, cardTitle: 21,
  subtitle: 18, body: 15, table: 12,
  statValue: 42, tag: 10, footnote: 6   // 6, not 7: MMW grid captions are 6.5pt
};

// ============================================================
// TYPOGRAPHY
// ============================================================

var TEXT_STYLES = {
  L1: { transform: 'uppercase', spacing: '0.25em', weight: 500 },
  L2: { transform: 'uppercase', spacing: '0.05em', weight: 500 },
  L3: { transform: 'uppercase', spacing: '0.08em', weight: 500 },
  L4: { transform: 'none',      spacing: 'normal', weight: 400 },
  L5: { transform: 'uppercase', spacing: '0.10em', weight: 400 }
};

var _currentSlideLayout = null;

function getTextStyle(el) {
  if (el.textStyle && TEXT_STYLES[el.textStyle]) return el.textStyle;
  if ((_currentSlideLayout === 'cover' || _currentSlideLayout === 'closing') && el.size >= 36) return 'L1';
  if ((_currentSlideLayout === 'divider' || _currentSlideLayout === 'coverloc') && el.size >= 36) return 'L4';
  if (el.size >= 30 && el.font === 'H' && !el.textStyle) return 'L2';
  if (el.color === 'accent' && el.size <= 14 && el.font === 'H') return 'L3';
  if (el.size >= 18 && el.size <= 24 && el.font === 'H') return 'L3';
  if (el.size <= 10 || el.color === 'muted') return 'L5';
  return 'L4';
}

// ============================================================
// DATE GENERATION
// ============================================================

var MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

function getFooterDate() {
  var now = new Date();
  return MONTHS[now.getMonth()] + ' ' + now.getFullYear();
}

// ============================================================
// COLOR RESOLUTION
// ============================================================

function resolveColor(token, isDark) {
  if (!token || typeof token !== 'string') return isDark ? PALETTE.white : PALETTE.black;
  if (token.charAt(0) === '#') return token;
  var semantics = {
    title: isDark ? PALETTE.white : PALETTE.black,
    body: isDark ? PALETTE.ltGray : PALETTE.mdGray,
    sub: isDark ? _accentLight : PALETTE.mdGray,
    muted: PALETTE.gray,
    accent: _accentMid, accentLt: _accentLight, accentDk: _accentDark,
    cardBg: isDark ? PALETTE.dkGray : '#FFFFFF',
    cardBorder: isDark ? 'transparent' : PALETTE.ltGray,
    slideBg: isDark ? PALETTE.black : PALETTE.white,
    white: '#FFFFFF', black: '#000000',
    deepBlack: PALETTE.deepBlack
  };
  if (semantics[token]) return semantics[token];
  if (PALETTE[token]) return PALETTE[token];
  return isDark ? PALETTE.white : PALETTE.black;
}

function colorForPptx(token, isDark) {
  return resolveColor(token, isDark).replace('#', '');
}

// ============================================================
// BACKGROUND MODE — removed, no-ops for compat
// ============================================================

function setBgMode() {}
function getBgMode() { return 'standard'; }
function detectBgMode() { return 'standard'; }

// ============================================================
// COORDINATE CONVERSION
// ============================================================

function toX(inches) { return Math.round(inches * SX); }
function toY(inches) { return Math.round(inches * SY); }
function ptToPx(pt)  { return Math.round(pt * PT_PX); }

// ============================================================
// TITLE HEIGHT DETECTION
// ============================================================

function getTitleMetrics(title) {
  var len = (title || '').length;
  if (len > SD_CONST.TITLE_WRAP_THRESHOLD) {
    return { titleH: SD_CONST.TITLE_H_2, contentY: SD_CONST.CONTENT_Y_2 };
  }
  return { titleH: SD_CONST.TITLE_H_1, contentY: SD_CONST.CONTENT_Y };
}

// ============================================================
// SAFE AREA VALIDATION
// ============================================================

function validatePosition(el, slideIndex) {
  if (!el || typeof el.x === 'undefined' || typeof el.y === 'undefined') return;
  var C = SD_CONST;
  var right = el.x + (el.w || 0);
  var bottom = el.y + (el.h || 0);
  if (el.type === 't' && el.y < C.CONTENT_Y) {
    if (el.y >= C.TAG_Y && el.y <= C.TITLE_Y + C.TITLE_H_2) return;
  }
  if (el.y < C.CONTENT_Y && el.type !== 't') {
    console.warn('[SD] Slide ' + slideIndex + ': Element at y:' + el.y + ' above CONTENT_Y');
  }
  if (bottom > C.CONTENT_END) {
    console.warn('[SD] Slide ' + slideIndex + ': Element bottom y:' + bottom.toFixed(2) + ' exceeds CONTENT_END');
  }
  if (right > C.SAFE_X_MAX) {
    console.warn('[SD] Slide ' + slideIndex + ': Element right x:' + right.toFixed(2) + ' exceeds SAFE_X_MAX');
  }
}

// ============================================================
// SLIDE & ELEMENT VALIDATION
// ============================================================

function validateSlide(slide, index) {
  var warn = function (msg) { console.warn('[standard-deck] Slide ' + index + ': ' + msg); };
  if (slide.layout && slide.els) { warn('has both layout and els -- layout takes precedence'); delete slide.els; }
  var maxTitle = (slide.layout === 'cover' || slide.layout === 'closing') ? LIMITS.coverTitleChars : LIMITS.titleChars;
  if (slide.title && slide.title.length > maxTitle) {
    warn('title exceeds ' + maxTitle + ' chars -- truncating');
    slide.title = slide.title.substring(0, maxTitle - 3) + '...';
  }
  if (slide.els) { slide.els = slide.els.map(function (el) { return validateElement(el, slide, index); }); }
  return slide;
}

// A negative width or height is invalid in the exported XML -- PowerPoint
// rejects the file outright and offers to repair it, with no clue which shape
// caused it. Catch it at dispatch, where the layout name is still known.
function assertNonNegative(el, layout) {
  if ((el.w != null && el.w < 0) || (el.h != null && el.h < 0)) {
    if (el.type !== 'ln') {
      console.error('[standard-deck] "' + layout + '" produced a negative size (' +
        el.type + ' w=' + el.w + ' h=' + el.h + '). PowerPoint will refuse the file.');
      el.w = Math.abs(el.w || 0); el.h = Math.abs(el.h || 0);
    }
  }
  return el;
}

function validateElement(el, slide, slideIndex) {
  if (el.type === 't' && typeof el.size === 'number' && el.size < MIN_SIZES.footnote) el.size = MIN_SIZES.footnote;
  // Full-bleed is a real MMW design device: ~41% of the template's content
  // slides intentionally cross the safe area, and several photo wells sit at
  // negative coordinates. Clamping silently destroyed those compositions, so
  // it is now opt-in per element via _clampToSafe:true.
  if (el._clampToSafe) {
    if (typeof el.x === 'number' && el.x < SD_CONST.SAFE_X_MIN) el.x = SD_CONST.SAFE_X_MIN;
    if (typeof el.y === 'number' && el.y < SD_CONST.SAFE_Y_MIN) el.y = SD_CONST.SAFE_Y_MIN;
  }
  if (el.type === 't' && el._parentShape) {
    var maxW = el._parentShape.w * SD_CONST.TEXT_RATIO;
    if (el.w > maxW) { el.x = el._parentShape.x + (el._parentShape.w - maxW) / 2; el.w = maxW; }
  }
  return el;
}

function enforceWidthRule(els) {
  // Photo wells are emitted as type:'s' with _imgPlaceholder. They are picture
  // frames, not text containers -- a caption that happens to sit over one must
  // not be re-flowed to 80% of it. Excluded here.
  var shapes = els.filter(function (e) {
    return (e.type === 's' || e.type === 'o') && !e._imgPlaceholder;
  });
  els.forEach(function (el) {
    if (el.type !== 't' || el._noWidthRule) return;
    for (var i = 0; i < shapes.length; i++) {
      var s = shapes[i];
      if (el.x >= s.x && el.y >= s.y && el.x + el.w <= s.x + s.w + 0.01 && el.y + el.h <= s.y + s.h + 0.01) {
        var maxW = s.w * SD_CONST.TEXT_RATIO;
        if (el.w > maxW) { el.x = s.x + (s.w - maxW) / 2; el.w = maxW; }
        break;
      }
    }
  });
  return els;
}

// ============================================================
// ELEMENT RENDERERS
// ============================================================

function renderElement(el, isDark) {
  var renderers = { t: renderText, s: renderShape, o: renderOval, i: renderIcon, d: renderDivider, p: renderPill, b: renderBar, ln: renderLine, path: renderPath, chart: renderChart, tbl: renderTable, img: renderImage };
  var fn = renderers[el.type];
  if (!fn) { console.warn('[standard-deck] Unknown element type: ' + el.type); return document.createElement('div'); }
  return fn(el, isDark);
}

function renderText(el, isDark) {
  var div = document.createElement('div');
  div.setAttribute('contenteditable', 'true');
  div.setAttribute('spellcheck', 'false');
  var isTitle = (el.size >= 30);
  div.style.cssText = 'position:absolute;box-sizing:border-box;word-wrap:break-word;overflow:' + (isTitle ? 'visible' : 'hidden') + ';';
  div.style.left = toX(el.x) + 'px';
  div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px';
  div.style.height = toY(el.h) + 'px';
  if (el.rotation) {
    div.style.transform = 'rotate(' + el.rotation + 'deg)';
    div.style.transformOrigin = 'center';
  }
  // Text insets (PowerPoint bodyPr lIns/tIns/rIns/bIns). x/y/w/h describe the
  // FRAME; text starts inset from it. 370 of the template's 392 text elements
  // carry non-zero insets -- mostly 0.079/0.104in -- so ignoring them shifted
  // every text block up to 0.1in left and high of the source.
  if (el.insets) {
    div.style.padding = toY(el.insets.t || 0) + 'px ' + toX(el.insets.r || 0) + 'px ' +
                        toY(el.insets.b || 0) + 'px ' + toX(el.insets.l || 0) + 'px';
  }
  div.style.fontSize = ptToPx(el.size) + 'px';
  div.style.color = resolveColor(el.color || 'body', isDark);
  div.style.lineHeight = '1.35';
  var fm = FONT_MAP[el.font] || FONT_MAP['B'];
  div.style.fontFamily = fm.face;
  div.style.fontWeight = fm.weight;
  if (el.bold) div.style.fontWeight = 700;
  if (el.italic) div.style.fontStyle = 'italic';
  if (el.underline) div.style.textDecoration = 'underline';
  var isCompact = el.w <= 0.80 && el.h <= 0.80;
  div.style.textAlign = el.align || (isCompact ? 'center' : 'left');
  // EXPLICIT TYPOGRAPHY (v2.0). MMW layout elements always carry `caps`, which
  // marks the element as fully specified: casing, tracking and line-height come
  // from the template, not from getTextStyle()'s size/colour guesswork. That
  // heuristic uppercases anything <=10pt or coloured 'muted' -- which would have
  // wrongly capitalised 161 of the template's body/caption elements -- and
  // hardcodes 1.35 line-height where the template is mostly 1.0.
  // Elements WITHOUT `caps` (legacy raw compositions) keep the old behaviour.
  if (el.caps !== undefined) {
    div.style.textTransform = el.caps ? 'uppercase' : 'none';
    // charSpacing is in POINTS (PowerPoint's "Expanded by N pt"), so convert to
    // preview pixels. An earlier build emitted this as 'em', which at the
    // template's 6.97pt eyebrow tracking would have been ~7 character widths.
    div.style.letterSpacing = (el.charSpacing != null && el.charSpacing !== 0)
      ? (el.charSpacing * PT_PX).toFixed(2) + 'px' : 'normal';
    div.style.lineHeight = String(el.lineSpacing != null ? el.lineSpacing : 1.0);
    // Kerning on for all sizes down to 1pt, matching the template's setting.
    div.style.fontKerning = 'normal';
  } else {
    var textStyle = getTextStyle(el);
    var ts = TEXT_STYLES[textStyle];
    div.style.textTransform = ts.transform;
    div.style.letterSpacing = ts.spacing;
    if (textStyle === 'L1') div.style.fontWeight = 500;
  }
  if (el.valign === 'middle' || el.valign === 'bottom') {
    div.style.display = 'flex'; div.style.flexDirection = 'column';
    div.style.justifyContent = el.valign === 'middle' ? 'center' : 'flex-end';
    if (isCompact || el.align === 'center') div.style.alignItems = 'center';
  }
  // ---- RICH PARAGRAPHS ------------------------------------------------
  // Some template text boxes are not a flat string: the Table of Contents
  // heading is a grey subtitle and a black title separated by <a:br/> inside one
  // paragraph, and its list mixes a grey number run with a black topic run per
  // line, plus indented sub-bullets at a smaller size. `paras` models that:
  //   paras:[{ runs:[{text,color,size,bold}], size, marL, indent,
  //            bullet, bulletSizePct, breakBefore }]
  // Elements without `paras` keep the old flat-string behaviour untouched.
  if (el.paras && el.paras.length) {
    el.paras.forEach(function (p) {
      var pdiv = document.createElement('div');
      if (p.size) pdiv.style.fontSize = ptToPx(p.size) + 'px';
      if (p.bullet) {
        // Flexbox hanging indent, not margin-left + negative text-indent.
        // The negative-indent technique clips the bullet glyph under Chrome
        // whenever the text element also has overflow:hidden (every non-title
        // element does) -- the glyph was present in the DOM but invisible.
        // A flex row with a fixed-width bullet column sidesteps the clip
        // entirely and wraps continuation lines under the text, not the bullet.
        pdiv.style.display = 'flex';
        pdiv.style.alignItems = 'flex-start';
        var bw = toX(Math.abs(p.indent || p.marL || 0.125));
        var b = document.createElement('span');
        b.textContent = (p.bulletChar || '\u2022');
        b.style.flex = '0 0 ' + bw + 'px';
        if (p.bulletSizePct) b.style.fontSize = (p.bulletSizePct / 100) + 'em';
        pdiv.appendChild(b);
        var textWrap = document.createElement('div');
        textWrap.style.flex = '1';
        textWrap.style.minWidth = '0';
        (p.runs || []).forEach(function (r) {
          var sp = document.createElement('span');
          sp.textContent = r.text || '';
          if (r.color) sp.style.color = resolveColor(r.color, isDark);
          if (r.size) sp.style.fontSize = ptToPx(r.size) + 'px';
          if (r.bold !== undefined) sp.style.fontWeight = r.bold ? 700 : 400;
          textWrap.appendChild(sp);
        });
        pdiv.appendChild(textWrap);
        div.appendChild(pdiv);
        return;
      }
      if (p.marL) pdiv.style.marginLeft = toX(p.marL) + 'px';
      if (p.indent) pdiv.style.textIndent = toX(p.indent) + 'px';
      (p.runs || []).forEach(function (r) {
        var sp = document.createElement('span');
        sp.textContent = r.text || '';
        if (r.color) sp.style.color = resolveColor(r.color, isDark);
        if (r.size) sp.style.fontSize = ptToPx(r.size) + 'px';
        if (r.bold !== undefined) sp.style.fontWeight = r.bold ? 700 : 400;
        pdiv.appendChild(sp);
      });
      div.appendChild(pdiv);
    });
    return div;
  }

  // A layout can hand us a non-string text -- a boolean flag passed straight
  // through (cfg.hereLabel), a numeric cell value. Coerce before any string
  // method runs: one stray value must not throw out of renderAll and take the
  // whole deck (toolbar, nav, export) down with it.
  var _t = (el.text == null) ? '' : (typeof el.text === 'string' ? el.text : String(el.text));
  if (_t.indexOf('\n') > -1) {
    _t.split('\n').forEach(function (line, i) {
      if (i > 0) div.appendChild(document.createElement('br'));
      div.appendChild(document.createTextNode(line));
    });
  } else {
    var span = document.createElement('span');
    span.textContent = _t;
    div.appendChild(span);
  }
  return div;
}

function renderShape(el, isDark) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;';
  div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px'; div.style.height = toY(el.h) + 'px';
  // [v6.0.6] CSS gradient support for imageCards
  if (el._cssGradient) {
    div.style.background = el._cssGradient;
  } else if (el.fill === 'none') {
    // Outline-only box. The matrix on source slide 89 is built entirely from
    // these, so an unfilled shape has to stay unfilled rather than falling
    // back to cardBg and hiding everything behind it.
    div.style.backgroundColor = 'transparent';
  } else {
    div.style.backgroundColor = resolveColor(el.fill || 'cardBg', isDark);
  }
  if (el.border && typeof el.border === 'string') div.style.border = '1px solid ' + resolveColor(el.border, isDark);
  // Corner radius in INCHES. radius:'pill' rounds the short axis fully, which is
  // what the template's roundRect bars do (adj=50000).
  if (el.radius != null) {
    var r = (el.radius === 'pill') ? Math.min(el.w, el.h) / 2 : el.radius;
    div.style.borderRadius = toX(r) + 'px';
  }
  if (el.transparency) div.style.opacity = (100 - el.transparency) / 100;
  // Gradient fill: { from, to, angle } with angle in degrees clockwise from
  // 12 o'clock, matching DrawingML's <a:lin ang>. The template's spend-bar
  // value circles use this.
  if (el.gradient) {
    var gA = (el.gradient.angle == null) ? 45 : el.gradient.angle;
    div.style.background = 'linear-gradient(' + gA + 'deg,' +
      resolveColor(el.gradient.from, isDark) + ',' +
      resolveColor(el.gradient.to, isDark) + ')';
  }
  // Outline in points, distinct from the 1px `border` shorthand. `dash` takes
  // 'dash' or 'dot' -- the template draws its spoke rings dashed and its
  // descriptive boxes dotted, both via <a:custDash> rather than a preset.
  if (el.stroke) {
    var st = (el.dash === 'dot') ? 'dotted' : (el.dash === 'dash' ? 'dashed' : 'solid');
    div.style.border = ptToPx(el.strokeWidth || 1) + 'px ' + st + ' ' +
      resolveColor(el.stroke, isDark);
  }
  // Outer drop shadow. Angle is degrees clockwise from east, matching
  // DrawingML's <a:outerShdw dir>.
  if (el.shadow) {
    var sh = (el.shadow === true) ? {} : el.shadow;
    var ang = (sh.angle == null ? 172 : sh.angle) * Math.PI / 180;
    var dist = toX(sh.offset == null ? 0.167 : sh.offset);
    div.style.boxShadow = (Math.cos(ang) * dist).toFixed(1) + 'px ' +
      (Math.sin(ang) * dist).toFixed(1) + 'px ' +
      toX(sh.blur == null ? 0.104 : sh.blur).toFixed(1) + 'px rgba(0,0,0,' +
      (sh.opacity == null ? 0.05 : sh.opacity) + ')';
  }
  // Custom geometry: el.points are fractions of the shape box, so clip-path in
  // percent reproduces the outline at any scale. Without this the shape renders
  // as its bounding rectangle -- on the divider layouts that is a solid block
  // across half the slide instead of the angular MMW mark.
  if (el.points && el.points.length > 2) {
    div.style.clipPath = 'polygon(' + el.points.map(function (p) {
      return (p[0] * 100).toFixed(3) + '% ' + (p[1] * 100).toFixed(3) + '%';
    }).join(',') + ')';
  }
  return div;
}

function renderLine(el, isDark) {
  // A connector, not a filled rule: it can carry arrowheads, which the template
  // uses on every milestone line (headEnd + tailEnd, both triangles).
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;overflow:visible;';
  var pad = 8;
  // Negative w/h means the line runs up or left. Normalise the box and draw the
  // segment corner-to-corner, so direction is preserved without a negative size.
  var dw = el.w || 0, dh = el.h || 0;
  var x0 = el.x + Math.min(0, dw), y0 = el.y + Math.min(0, dh);
  div.style.left = (toX(x0) - pad) + 'px'; div.style.top = (toY(y0) - pad) + 'px';
  var w = Math.abs(toX(dw)), h = Math.abs(toY(dh));
  div.style.width = (w + pad * 2) + 'px'; div.style.height = (h + pad * 2) + 'px';
  var fx = dw < 0, fy = dh < 0;
  var col = resolveColor(el.color || 'ltGray', isDark);
  var wt = ptToPx(el.weight || 1.5);
  var id = 'ah' + Math.random().toString(36).slice(2, 8);
  var isDot = el.markerStyle === 'dot';
  var a1 = (el.arrows === 'both' || el.arrows === 'start') ? ' marker-start="url(#' + id + ')"' : '';
  var a2 = (el.arrows === 'both' || el.arrows === 'end') ? ' marker-end="url(#' + id + ')"' : '';
  var markerShape = isDot
    ? '<circle cx="5" cy="5" r="4" fill="' + col + '"/>'
    : '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + col + '"/>';
  var markerSize = isDot ? 3 : 4;
  div.innerHTML =
    '<svg width="100%" height="100%" style="overflow:visible">' +
    '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="5" refY="5" ' +
    'markerWidth="' + markerSize + '" markerHeight="' + markerSize + '" orient="auto-start-reverse">' +
    markerShape + '</marker></defs>' +
    '<line x1="' + (pad + (fx ? w : 0)) + '" y1="' + (pad + (fy ? h : 0)) + '" ' +
    'x2="' + (pad + (fx ? 0 : w)) + '" y2="' + (pad + (fy ? 0 : h)) + '" ' +
    'stroke="' + col + '" stroke-width="' + wt + '" stroke-linecap="square"' + a1 + a2 + '/></svg>';
  return div;
}

function renderOval(el, isDark) { var div = renderShape(el, isDark); div.style.borderRadius = '50%'; return div; }

// Curved connector: el.path is a list of segments, each either
// {cmd:'M'|'L', x, y} or {cmd:'C', x1, y1, x2, y2, x, y} -- all coordinates
// are fractions (0-1) of el.x/y/w/h, the same convention renderShape's
// el.points uses for polygons. Needed because renderLine only draws
// straight segments; the source's process connectors are genuine bezier
// S-curves (straight where they run along a row, curved at the turns).
// el.startMarker / el.endMarker: 'oval' | 'triangle' | none.
function renderPath(el, isDark) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;overflow:visible;';
  var pad = 12;
  div.style.left = (toX(el.x) - pad) + 'px'; div.style.top = (toY(el.y) - pad) + 'px';
  var w = toX(el.w), h = toY(el.h);
  div.style.width = (w + pad * 2) + 'px'; div.style.height = (h + pad * 2) + 'px';
  var col = resolveColor(el.color || 'ltGray', isDark);
  var wt = ptToPx(el.weight || 1.5);
  function px(x) { return pad + x * w; }
  function py(y) { return pad + y * h; }
  var d = '';
  (el.path || []).forEach(function (seg) {
    if (seg.cmd === 'M') d += 'M ' + px(seg.x) + ' ' + py(seg.y) + ' ';
    else if (seg.cmd === 'L') d += 'L ' + px(seg.x) + ' ' + py(seg.y) + ' ';
    else if (seg.cmd === 'C') d += 'C ' + px(seg.x1) + ' ' + py(seg.y1) + ', ' + px(seg.x2) + ' ' + py(seg.y2) + ', ' + px(seg.x) + ' ' + py(seg.y) + ' ';
  });
  var id = 'ap' + Math.random().toString(36).slice(2, 8);
  function markerDef(kind, sfx) {
    if (kind === 'oval') return '<marker id="' + id + sfx + '" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5"><circle cx="5" cy="5" r="4.5" fill="' + col + '"/></marker>';
    if (kind === 'triangle') return '<marker id="' + id + sfx + '" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="' + col + '"/></marker>';
    return '';
  }
  var defs = markerDef(el.startMarker, 's') + markerDef(el.endMarker, 'e');
  var a1 = el.startMarker ? ' marker-start="url(#' + id + 's)"' : '';
  var a2 = el.endMarker ? ' marker-end="url(#' + id + 'e)"' : '';
  div.innerHTML = '<svg width="100%" height="100%" style="overflow:visible"><defs>' + defs + '</defs>' +
    '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + wt + '" stroke-linecap="round"' + a1 + a2 + '/></svg>';
  return div;
}

function renderIcon(el, isDark) {
var div = document.createElement('div');
div.style.cssText = 'position:absolute;display:flex;align-items:center;justify-content:center;line-height:1;';
div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
div.style.width = toX(el.w) + 'px'; div.style.height = toY(el.h) + 'px';

var color = resolveColor(el.color || 'accent', isDark);
var sizePx = Math.min(toX(el.w), toY(el.h)) * 0.55;

// Try Lucide SVG first, fall back to emoji/text
if (window.DeckIcons && window.DeckIcons.has(el.icon)) {
  div.innerHTML = window.DeckIcons.get(el.icon, color, Math.round(sizePx));
} else {
  div.style.fontSize = sizePx + 'px';
  div.style.color = color;
  div.textContent = el.icon || '';
}
return div;
}

function renderDivider(el, isDark) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;';
  div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px'; div.style.height = '0';
  div.style.borderTop = '2px solid ' + resolveColor(el.color || 'ltGray', isDark);
  return div;
}

function renderPill(el, isDark) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;display:flex;align-items:center;justify-content:center;border-radius:100px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;';
  div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px'; div.style.height = toY(el.h) + 'px';
  div.style.fontSize = ptToPx(el.size || 9) + 'px';
  div.style.backgroundColor = resolveColor(el.fill || 'accent', isDark);
  div.style.color = resolveColor(el.color || 'white', isDark);
  div.textContent = el.text || '';
  return div;
}

function renderBar(el, isDark) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;';
  div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px'; div.style.height = toY(el.h) + 'px';
  div.style.backgroundColor = resolveColor(el.fill || 'accent', isDark);
  // No default rounding -- confirmed against source: only horizontal bars
  // get rounded (pill) ends in this deck, vertical bars stay square. This
  // helper doesn't know its own orientation, so callers opt in explicitly
  // with el.radius:'pill' (or a number) for a horizontal bar; el.radius
  // must be omitted/falsy for vertical ones. See reportSplitPanels /
  // reportSpendBars(Light/Dark) for the horizontal convention in practice.
  if (el.radius) {
    div.style.borderRadius = (el.radius === 'pill')
      ? toX(Math.min(el.w, el.h)) / 2 + 'px'
      : toX(el.radius) + 'px';
  }
  return div;
}

// ============================================================
// CHART RENDERERS
// ============================================================

function renderChart(el, isDark) {
  var container = document.createElement('div');
  // Transparent, no border -- matches the template, whose charts are <a:noFill/>
  // so the slide ground shows through. A card background here would disagree
  // with the exported PPTX and paint a bright slab on the gray canvas.
  container.style.cssText = 'position:absolute;overflow:hidden;';
  container.style.left = toX(el.x) + 'px'; container.style.top = toY(el.y) + 'px';
  container.style.width = toX(el.w) + 'px'; container.style.height = toY(el.h) + 'px';
  var cw = toX(el.w); var ch = toY(el.h);
  var canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch; container.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var data = el.data || []; var opts = el.opts || {};
  if (opts.showTitle && opts.title) {
    ctx.font = '500 ' + ptToPx(12) + 'px Mazda Type, Arial, sans-serif';
    ctx.fillStyle = resolveColor('title', isDark); ctx.fillText(opts.title, 20, ptToPx(14) + 10);
  }
  var chartType = el.chartType || 'bar';
  if (chartType === 'bar') renderBarChart(ctx, data, opts, cw, ch, isDark);
  else if (chartType === 'line' || chartType === 'area') renderLineChart(ctx, data, opts, cw, ch, isDark, chartType === 'area');
  else if (chartType === 'pie' || chartType === 'doughnut') renderPieChart(ctx, data, opts, cw, ch, isDark, chartType === 'doughnut');
  return container;
}

function renderBarChart(ctx, data, opts, cw, ch, isDark) {
  if (!data.length || !data[0].values) return;
  var series = data; var labels = series[0].labels || [];
  var nGroups = labels.length; var nSeries = series.length; var maxVal = 0;
  series.forEach(function (s) { s.values.forEach(function (v) { if (v > maxVal) maxVal = v; }); });
  if (maxVal === 0) maxVal = 1;
  var padding = { top: 60, right: 40, bottom: 50, left: 60 };
  var plotW = cw - padding.left - padding.right; var plotH = ch - padding.top - padding.bottom;
  var groupW = plotW / nGroups; var barW = (groupW * 0.7) / nSeries; var gap = groupW * 0.3;
  var colors = resolveChartColors(opts.chartColors || null, nSeries, isDark);
  series.forEach(function (s, si) {
    s.values.forEach(function (val, vi) {
      var bx = padding.left + vi * groupW + gap / 2 + si * barW;
      var bh = (val / maxVal) * plotH; var by = padding.top + plotH - bh;
      // Square corners -- confirmed against source: vertical (column) bars
      // do not get rounded ends in this deck. Only horizontal bars do (see
      // reportSplitPanels / reportSpendBars(Light/Dark), radius:'pill').
      ctx.fillStyle = colors[si]; ctx.fillRect(bx, by, barW - 2, bh);
      if (opts.showValue) {
        ctx.font = '500 ' + ptToPx(8) + 'px Mazda Type, Arial, sans-serif';
        ctx.fillStyle = resolveColor('title', isDark); ctx.textAlign = 'center';
        ctx.fillText(formatVal(val), bx + barW / 2, by - 6);
      }
    });
  });
  ctx.font = ptToPx(8) + 'px Mazda Type, Arial, sans-serif';
  ctx.fillStyle = resolveColor('muted', isDark); ctx.textAlign = 'center';
  labels.forEach(function (lbl, i) { ctx.fillText(lbl, padding.left + i * groupW + groupW / 2, ch - padding.bottom + 20); });
}

function renderLineChart(ctx, data, opts, cw, ch, isDark, isArea) {
  if (!data.length || !data[0].values) return;
  var series = data; var labels = series[0].labels || [];
  var nPoints = labels.length; var maxVal = 0;
  series.forEach(function (s) { s.values.forEach(function (v) { if (v > maxVal) maxVal = v; }); });
  if (maxVal === 0) maxVal = 1;
  var padding = { top: 60, right: 40, bottom: 50, left: 60 };
  var plotW = cw - padding.left - padding.right; var plotH = ch - padding.top - padding.bottom;
  var colors = resolveChartColors(opts.chartColors || null, series.length, isDark);
  series.forEach(function (s, si) {
    ctx.beginPath(); ctx.strokeStyle = colors[si]; ctx.lineWidth = 3;
    s.values.forEach(function (val, vi) {
      var px = padding.left + (vi / (nPoints - 1 || 1)) * plotW;
      var py = padding.top + plotH - (val / maxVal) * plotH;
      if (vi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    if (isArea) {
      ctx.lineTo(padding.left + plotW, padding.top + plotH);
      ctx.lineTo(padding.left, padding.top + plotH); ctx.closePath();
      ctx.globalAlpha = 0.15; ctx.fillStyle = colors[si]; ctx.fill(); ctx.globalAlpha = 1.0;
    }
    ctx.stroke();
    s.values.forEach(function (val, vi) {
      var px = padding.left + (vi / (nPoints - 1 || 1)) * plotW;
      var py = padding.top + plotH - (val / maxVal) * plotH;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = colors[si]; ctx.fill();
    });
  });
  ctx.font = ptToPx(8) + 'px Mazda Type, Arial, sans-serif';
  ctx.fillStyle = resolveColor('muted', isDark); ctx.textAlign = 'center';
  labels.forEach(function (lbl, i) { ctx.fillText(lbl, padding.left + (i / (nPoints - 1 || 1)) * plotW, ch - padding.bottom + 20); });
}

function renderPieChart(ctx, data, opts, cw, ch, isDark, isDoughnut) {
  if (!data.length || !data[0].values) return;
  var values = data[0].values; var labels = data[0].labels || [];
  var total = values.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) return;
  var cx = cw / 2; var cy = ch / 2; var radius = Math.min(cw, ch) * 0.35;
  var hole = isDoughnut ? radius * ((opts.holeSize || 70) / 100) : 0;
  var colors = resolveChartColors(opts.chartColors || null, values.length, isDark);
  var startAngle = -Math.PI / 2;
  values.forEach(function (val, i) {
    var sliceAngle = (val / total) * Math.PI * 2; var endAngle = startAngle + sliceAngle;
    ctx.beginPath(); ctx.arc(cx, cy, radius, startAngle, endAngle);
    if (isDoughnut) ctx.arc(cx, cy, hole, endAngle, startAngle, true); else ctx.lineTo(cx, cy);
    ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
    if (opts.showPercent !== false) {
      var midAngle = startAngle + sliceAngle / 2;
      var labelR = isDoughnut ? (radius + hole) / 2 : radius * 0.65;
      var lx = cx + Math.cos(midAngle) * labelR; var ly = cy + Math.sin(midAngle) * labelR;
      ctx.font = '500 ' + ptToPx(9) + 'px Mazda Type, Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((val / total) * 100) + '%', lx, ly);
    }
    startAngle = endAngle;
  });
  if (opts.showLegend !== false) {
    var legendY = cy + radius + 30;
    ctx.font = ptToPx(8) + 'px Mazda Type, Arial, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    labels.forEach(function (lbl, i) {
      var lx = 40 + i * (cw / labels.length);
      ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(lx, legendY, 12, 12);
      ctx.fillStyle = resolveColor('body', isDark); ctx.fillText(lbl, lx + 18, legendY);
    });
  }
}

function resolveChartColors(tokens, count, isDark) {
  var colors = [];
  for (var i = 0; i < count; i++) {
    if (tokens && tokens[i % tokens.length]) colors.push(resolveColor(tokens[i % tokens.length], isDark));
    else colors.push(CHART_SERIES[i % CHART_SERIES.length]);
  }
  return colors;
}

function formatVal(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  if (v % 1 !== 0) return v.toFixed(1);
  return v.toString();
}

// ============================================================
// TABLE RENDERER
// ============================================================

function renderTable(el, isDark) {
  var container = document.createElement('div');
  container.style.cssText = 'position:absolute;overflow:hidden;';
  container.style.left = toX(el.x) + 'px'; container.style.top = toY(el.y) + 'px';
  container.style.width = toX(el.w) + 'px'; container.style.height = toY(el.h) + 'px';
  var table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;font-family:Mazda Type,Arial,sans-serif;font-size:' + ptToPx(10) + 'px;';
  var headers = el.headers || []; var rows = el.rows || []; var colW = el.colW;
  if (headers.length) {
    var thead = document.createElement('thead'); var tr = document.createElement('tr');
    headers.forEach(function (h, i) {
      var th = document.createElement('th'); th.textContent = h;
      th.style.cssText = 'padding:12px 16px;text-align:left;background:' + resolveColor('accent', isDark) + ';color:#FFFFFF;font-weight:500;border-bottom:2px solid ' + resolveColor('ltGray', isDark) + ';';
      if (colW && colW[i]) th.style.width = toX(colW[i]) + 'px';
      tr.appendChild(th);
    });
    thead.appendChild(tr); table.appendChild(thead);
  }
  var tbody = document.createElement('tbody');
  rows.forEach(function (row, ri) {
    var tr = document.createElement('tr');
    tr.style.background = ri % 2 === 0 ? 'transparent' : resolveColor(isDark ? 'dkGray' : 'ltGray', isDark) + '33';
    (Array.isArray(row) ? row : [row]).forEach(function (cell) {
      var td = document.createElement('td'); td.textContent = cell;
      td.style.cssText = 'padding:10px 16px;border-bottom:1px solid ' + resolveColor('ltGray', isDark) + '44;color:' + resolveColor('body', isDark) + ';';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); container.appendChild(table);
  return container;
}

// ============================================================
// IMAGE RENDERER
// ============================================================

// Resolve an image element to its source URL. Brand marks are referenced by id
// (gi0/gi0w/gi1/gi1w); the artifact declares them as hidden <img id="..."> tags.
// getAttribute('src') -- not .src -- so the value matches the key used by the
// prefetch cache, which stores the path exactly as authored.
function resolveImgSrc(el) {
  if (!el) return null;
  if (el.src) return el.src;
  if (!el.ref) return null;
  var host = document.getElementById(el.ref);
  if (!host) return null;
  if (host.tagName === 'IMG') return host.getAttribute('src') || host.src || null;
  var inner = host.querySelector('img');
  return inner ? (inner.getAttribute('src') || inner.src || null) : null;
}

function renderImage(el) {
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;overflow:hidden;';
  div.style.left = toX(el.x) + 'px'; div.style.top = toY(el.y) + 'px';
  div.style.width = toX(el.w) + 'px'; div.style.height = toY(el.h) + 'px';
  // Do NOT mirror el.ref onto this div. The artifact's hidden <img> already owns
  // that id, and a duplicate makes getElementById() ambiguous for the exporter.
  if (el.ref) div.setAttribute('data-ref', el.ref);
  // A masked well clips the photo to a custom outline (Cover Photo2 cuts its
  // image into the angular MMW motif). Points are fractions of the frame, so
  // percentages reproduce it at any size.
  if (el.mask && el.mask.length > 2) {
    div.style.clipPath = 'polygon(' + el.mask.map(function (p) {
      return (p[0] * 100).toFixed(3) + '% ' + (p[1] * 100).toFixed(3) + '%';
    }).join(',') + ')';
  }
  var src = resolveImgSrc(el);
  if (src) {
    var img = document.createElement('img');
    img.src = src;
    // Cropped source (srcRect): scale the image up so the kept region fills the
    // frame, then offset it. 44% of the template's pictures are cropped, and
    // without this they show the wrong part of the artwork.
    if (el.crop) {
      var cl = el.crop.l || 0, ct = el.crop.t || 0,
          cr = el.crop.r || 0, cb = el.crop.b || 0;
      var kw = Math.max(1 - cl - cr, 0.001), kh = Math.max(1 - ct - cb, 0.001);
      img.style.cssText = 'position:absolute;width:' + (100 / kw) + '%;height:' +
        (100 / kh) + '%;left:' + (-cl * 100 / kw) + '%;top:' + (-ct * 100 / kh) +
        '%;object-fit:fill;';
    } else {
      // Brand marks must letterbox (contain) so they are never distorted.
      // Photography supplied into a photo well should fill it (cover), matching
      // how the template crops its own images into these frames.
      img.style.cssText = 'width:100%;height:100%;object-fit:' + (el.fit || 'contain') + ';';
    }
    if (typeof el.transparency === 'number') img.style.opacity = (100 - el.transparency) / 100;
    div.style.position = 'absolute';
    div.appendChild(img);
  } else {
    div.style.background = '#E8E8E8';
    if (el.ref) console.warn('[standard-deck] image ref "' + el.ref +
      '" not found. Add <img id="' + el.ref + '" src="..."> to the artifact.');
  }
  return div;
}

// ============================================================
// STRUCTURAL SLIDE DETECTION
// ============================================================

var STRUCTURAL_LAYOUTS = ['cover', 'closing', 'divider', 'coverloc'];

// Layouts that carry no footer in the source. The LAYOUT decides this, not the
// caller: reportStatRow fills the full canvas edge to edge, and a footer would
// collide with its bottom row.
var NO_FOOTER_LAYOUTS = ['reportStatRow', 'reportStatRowLight'];

function isStructuralSlide(layout) {
  return STRUCTURAL_LAYOUTS.indexOf(layout) > -1;
}

function suppressesFooter(layout) {
  return NO_FOOTER_LAYOUTS.indexOf(layout) > -1;
}

// ============================================================
// SLIDE RENDERING
// ============================================================

function renderSlide(slideData, index) {
  var isDark = !!slideData.dark;
  var slide = document.createElement('div');
  slide.className = 'slide' + (index === 0 ? ' active' : '');
  slide.style.cssText = 'position:absolute;top:0;left:0;width:1920px;height:1200px;overflow:hidden;background:' + resolveColor('slideBg', isDark) + ';';

  _currentSlideLayout = slideData.layout || null;
  var els;
  if (slideData.layout) {
    if (!window.DeckLayouts) {
      // Every layout-driven slide renders empty when deck-layouts.js is absent
      // or bailed at its load guard. Silently that looks like 67 blank slides
      // with only a footer, which is very hard to diagnose -- so say it.
      console.error('[standard-deck] window.DeckLayouts is undefined. ' +
        'deck-layouts.js did not load (404?) or bailed because standard-deck.js ' +
        'was not loaded first. Script order must be: standard-deck.js, ' +
        'deck-layouts.js, deck-shell.js.');
      els = [
        { type:'s', x:0.5, y:2.6, w:12.33, h:2.0, fill:'#FFF4F4' },
        { type:'t', text:'deck-layouts.js did not load', x:0.9, y:2.9, w:11.5, h:0.5,
          font:'B', size:18, bold:true, color:'#C12638', caps:false, lineSpacing:1 },
        { type:'t', text:'Check the browser console and the script order in this file.',
          x:0.9, y:3.5, w:11.5, h:0.6, font:'B', size:12, color:'#262626',
          caps:false, lineSpacing:1.2 }
      ];
    } else {
      els = window.DeckLayouts.dispatch(slideData);
    }
  } else {
    els = slideData.els || [];
  }

  if (slideData.bgColor) {
    slide.style.background = slideData.bgColor;
  }
  if (slideData.bgImage) {
    var _cache = (window.StandardShell && window.StandardShell._imageCache) || {};
    var _bgSrc = _cache[slideData.bgImage] || slideData.bgImage;
    slide.style.backgroundImage = 'url(' + _bgSrc + ')';
    slide.style.backgroundSize = 'cover';
    slide.style.backgroundPosition = 'center';
  }
  if (slideData.bgGradient) {
    slide.style.background = slideData.bgGradient;
  }

  els = enforceWidthRule(els);
  els.forEach(function (el) {
    validatePosition(el, index);
    slide.appendChild(renderElement(el, isDark));
  });

  // FOOTER: 3-way logic
  if (slideData.customFooter) {
    // Layout handles its own footer
  } else if (isStructuralSlide(slideData.layout)) {
    var mutedColor = resolveColor('muted', isDark);
    var dateDiv = document.createElement('div');
    dateDiv.style.cssText = 'position:absolute;bottom:24px;left:40px;'
      + 'font-size:' + ptToPx(7) + 'px;'
      + 'font-weight:400;'
      + 'letter-spacing:0.15em;'
      + 'text-transform:uppercase;'
      + 'color:' + mutedColor + ';'
      + 'font-family:Mazda Type,Arial,sans-serif;';
    dateDiv.textContent = _footerText || getFooterDate();
    slide.appendChild(dateDiv);
  } else if (_contentFooter) {
    var cfColor = '#767676';
    var cfDiv = document.createElement('div');
    cfDiv.style.cssText = 'position:absolute;bottom:24px;left:40px;'
      + 'font-size:' + ptToPx(7) + 'px;'
      + 'font-weight:400;'
      + 'letter-spacing:0.15em;'
      + 'text-transform:uppercase;'
      + 'color:' + cfColor + ';'
      + 'font-family:Mazda Type,Arial,sans-serif;';
    cfDiv.textContent = _contentFooter;
    slide.appendChild(cfDiv);

    if (slideData.num) {
      var numDiv = document.createElement('div');
      numDiv.style.cssText = 'position:absolute;bottom:24px;right:40px;'
        + 'font-size:' + ptToPx(7) + 'px;'
        + 'font-weight:400;'
        + 'color:' + cfColor + ';'
        + 'font-family:Mazda Type,Arial,sans-serif;';
      numDiv.textContent = slideData.num;
      slide.appendChild(numDiv);
    }
  }

  return slide;
}

function renderAll(D, container) {
  container.innerHTML = '';
  D.forEach(function (slideData, i) {
    container.appendChild(renderSlide(validateSlide(slideData, i), i));
  });
}

// ============================================================
// ACCENT / COLOR MANAGEMENT
// ============================================================

function setAccent(nameOrHex, light, dark) {
  if (ACCENT_FAMILIES[nameOrHex]) {
    var fam = ACCENT_FAMILIES[nameOrHex];
    _accentLight = fam.light; _accentMid = fam.mid; _accentDark = fam.dark; _familyName = nameOrHex;
  } else if (nameOrHex && nameOrHex.charAt(0) === '#') {
    _accentMid = nameOrHex;
    _accentLight = light || adjustBrightness(nameOrHex, 60);
    _accentDark = dark || adjustBrightness(nameOrHex, -40);
    _familyName = 'custom';
  }
}

function adjustBrightness(hex, amount) {
  hex = hex.replace('#', '');
  var r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) + amount));
  var g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) + amount));
  var b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) + amount));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// ============================================================
// FOOTER CONFIGURATION
// ============================================================

var _footerText = null;
var _contentFooter = 'Company Confidential';

function setFooter(text) {
  if (text === 'confidential') _footerText = 'S T R I C T L Y   C O N F I D E N T I A L';
  else if (text === 'date' || text === null) _footerText = null;
  else _footerText = text;
}

function getFooterText() { return _footerText || getFooterDate(); }

function setContentFooter(text) {
  if (text === false || text === 'none' || text === null) _contentFooter = null;
  else if (text === 'strict') _contentFooter = 'Strictly Confidential';
  else if (typeof text === 'string') _contentFooter = text;
}

function getContentFooter() { return _contentFooter; }

// ============================================================
// PPTX SAFE AREA
// ============================================================

var pptxSafeArea = {
  x: SD_CONST.SAFE_X_MIN, y: SD_CONST.SAFE_Y_MIN,
  w: SD_CONST.SAFE_W, h: SD_CONST.CONTENT_END - SD_CONST.SAFE_Y_MIN
};

// ============================================================
// PUBLIC API
// ============================================================

window.StandardDeck = {
  renderAll: renderAll, renderSlide: renderSlide, renderElement: renderElement,
  resolveColor: resolveColor, colorForPptx: colorForPptx,
  setAccent: setAccent, setBgMode: setBgMode, getBgMode: getBgMode, detectBgMode: detectBgMode,
  setFooter: setFooter, getFooterText: getFooterText,
  setContentFooter: setContentFooter, getContentFooter: getContentFooter,
  isStructuralSlide: isStructuralSlide, suppressesFooter: suppressesFooter,
  assertNonNegative: assertNonNegative,
  resolveImgSrc: resolveImgSrc,
  validateSlide: validateSlide, validatePosition: validatePosition, enforceWidthRule: enforceWidthRule,
  getTitleMetrics: getTitleMetrics, getFooterDate: getFooterDate,
  toX: toX, toY: toY, ptToPx: ptToPx,
  TEXT_STYLES: TEXT_STYLES, getTextStyle: getTextStyle,
  PALETTE: PALETTE, ACCENT_FAMILIES: ACCENT_FAMILIES,
  CHART_SERIES: CHART_SERIES, CHART_SERIES_LIGHT: CHART_SERIES_LIGHT,
  FONT_MAP: FONT_MAP, LIMITS: LIMITS, MIN_SIZES: MIN_SIZES,
  SAFE: SAFE, SD_CONST: SD_CONST, SLIDE_W: SLIDE_W, SLIDE_H: SLIDE_H,
  pptxSafeArea: pptxSafeArea,
  getAccent: function () { return { light: _accentLight, mid: _accentMid, dark: _accentDark, name: _familyName }; }
};

})();