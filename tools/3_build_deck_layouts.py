#!/usr/bin/env python3
"""Generate deck-layouts.js (66 MMW layouts) from mmw_layouts.json."""
import json, re, collections, sys
# --- portable paths -------------------------------------------------
# Override with env vars when the layout differs:
#   MMW_TEMPLATE  full path to MMW PPT Template_7.24.26.pptx
#   MMW_WORK      scratch dir for intermediates (default: ./build)
import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
WORK  = _os.environ.get('MMW_WORK', _os.path.join(_HERE, 'build'))
_os.makedirs(WORK, exist_ok=True)
TEMPLATE = _os.environ.get('MMW_TEMPLATE',
    _os.path.join(_HERE, '..', 'MMW PPT Template_7.24.26.pptx'))
def W(name): return _os.path.join(WORK, name)
sys.path.insert(0, _HERE)
from overrides import OVERRIDES
# --------------------------------------------------------------------


D=json.load(open(W('mmw_layouts.json')))
BUNDLED=json.load(open(_os.path.join(_HERE,'bundled_assets.json')))
LAY={l['name']:l for l in D['layouts']}

SLUG={
 'Cover Light':'coverLight','Cover Dark':'coverDark','Cover Light2':'coverLight2',
 'Cover Photo':'coverPhoto','Cover Photo2':'coverPhoto2',
 'Divider Dark':'dividerDark','Divider Dark2':'dividerDark2','Divider Light':'dividerLight',
 'Divider Light2':'dividerLight2','Divider Asphalt':'dividerAsphalt','Divider Canopy':'dividerCanopy',
 'Divider Aurora':'dividerAurora','Divider Tides':'dividerTides',
 'Content - Headline light':'headlineLight','Content -headline dark':'headlineDark',
 '1_Content -headline photo copy':'headlinePhotoWell',
 # Second design carried by the same template layout -- see SPLITS in step 2.
 'Statement + Subhead (slide 31)':'statementSubhead',
 # Charts / graphs / boxes section (source slides 71-101). Each distinct
 # composition is its own layout -- see REPORT_SLIDES in step 2.
 'Report Split Panels (slide 73)':'reportSplitPanels',
 'Report Stat Row (slide 74)':'reportStatRow',
 'Report Stat Row Light (slide 75)':'reportStatRowLight',
 'Report Spend Bars Light (slide 86)':'reportSpendBarsLight',
 'Report Spend Bars Dark (slide 87)':'reportSpendBarsDark',
 'Report Model Compare (slide 89)':'reportModelCompare',
 'Report Brand Pillars (slide 90)':'reportBrandPillars',
 'Report Platform Matrix (slide 91)':'reportPlatformMatrix',
 'Report Ecosystem Tree (slide 92)':'reportEcosystemTree',
 'Report Metric Table (slide 95)':'reportMetricTable',
 'Report Quote Panel (slide 96)':'reportQuotePanel',
 'Report Chapter Opener (slide 97)':'reportChapterOpener',
 'Report Strategy Stack (slide 98)':'reportStrategyStack',
 'Report Journey Map (slide 99)':'reportJourneyMap',
 'Report Gate Status (slide 100)':'reportGateStatus',
 'Report Numbered Steps (slide 101)':'reportNumberedSteps',
 'Report Channel Matrix (slide 78)':'reportChannelMatrix',
 'Table of contents':'tableOfContents','Thank You Light':'thankYouLight','Thank You Dark':'thankYouDark',
 'Content 01':'content01','Content 02':'content02','Content 03':'content03','Content 05':'content05',
 'Content 06':'content06','Content 07':'content07','Content 08':'content08','Content 09':'content09',
 'Content - 3 columns - Dark':'threeColDark','Content - 3 columns - Light':'threeColLight',
 'Content 2 Rows - Dark':'twoRowsDark','Content 2 Rows - Light':'twoRowsLight',
 'Content - 2 rows - Light':'twoRowsLightAlt',
 'Content Gray':'reportGray','Content Dark':'reportDark',
 # 'Blank Dark' / 'Blank Grey' / 'Blank Light' / 'Title & Bullets' are real
 # template masters, but their own auto-generated compositions turned out to
 # be broken duplicates of a slide that got a proper report* name later
 # (confirmed by comparing source slide numbers, not assumed). Retired via
 # RETIRED_TEMPLATE_NAMES below instead of generating dead duplicate
 # functions here -- do not re-add these keys without re-checking that.
 'Storyboard 01':'storyboardVO','Storyboard 02':'storyboardGrid','Scripts 01':'scriptsCompare',
 'Video Reference':'videoReference','Casting':'castingGrid','Casting_Talent':'castingTalent',
 'Location Overview':'locationOverview','Location Detail':'locationDetail',
 'Moodboard Props':'moodboardProps','Moodboard Wardrobe':'moodboardWardrobe','Moodboard ':'moodboardToneManner',
 'Meta_Divider':'metaDivider','Meta_Carousel 1x1':'metaCarousel1x1','Meta_Carousel 4x5':'metaCarousel4x5',
 'Meta_Video&Static':'metaVideoStatic',
 'Reddit_Divider':'redditDivider','Reddit_Carousel':'redditCarousel',
 'Reddit_Vid&Static1:1':'redditVideoStatic1x1','Reddit_Vid&Static4:5':'redditVideoStatic4x5',
 'TikTok_Divider':'tiktokDivider','TikTok_Carousel':'tiktokCarousel','TikTok_Vid&Static':'tiktokVideoStatic',
 'Pinterest_Divider':'pinterestDivider','Pinterest 2:3':'pinterest2x3','Pinterest 1:1':'pinterest1x1',
 'Youtube_Divider':'youtubeDivider','Youtube_VideoAd':'youtubeVideoAd',
}
# legacy engine name -> new slug (back-compat aliases)
LEGACY={'coverGeometric':'coverLight','coverScenic':'coverPhoto','coverLogoCutout':'coverPhoto2',
 'dividerBrand':'dividerDark','content04':'content02','headline':'headlineDark',
 'thankYou':'thankYouDark','moodboardToneManner':'moodboardToneManner'}

# Retired v2.0 names -- NOT v1.0 legacy. "Headline Photo Divider" (slide 41) is
# the same composition as headlinePhotoWell: identical tag box, identical 140pt
# title box. But its title is faux-bold -- the layout asks for "Mazda Type" with
# b="1" instead of the real "Mazda Type Bold" the theme's major font resolves to
# -- and it takes its photo as a slide background rather than a replaceable
# well. headlinePhotoWell wins on both counts, so these render that instead.
RETIRED={'headlinePhoto':'headlinePhotoWell',
         # slide 92 is a campaign ecosystem TREE, not a funnel -- renamed once
         # its structure was understood.
         'reportGoalFunnel':'reportEcosystemTree',
         # These four share a source slide with a report* composition and are
         # true duplicates, not a chassis/variant pair -- the report* name in
         # each pair is the one that's hand-authored and fixed (structured
         # content API, correct z-order, real strokes/bullets/underline).
         'blankLight':'reportJourneyMap',
         'blankDark':'reportStatRow',
         'blankGrey':'reportEcosystemTree',
         'titleBullets':'reportPlatformMatrix'}

# Variants that have no template layout of their own: "Content Gray" and
# "Content Dark" each back many differently-composed slides, so the base layout
# is a bare chassis and the recurring compositions ship as named siblings.
# derived slug -> (base template layout, human note)
DERIVED = {
 'reportGrayChart':    ('Content Gray', 'chart well (template slides 83, 84, 85, 88)'),
 'reportDarkChart':    ('Content Dark', 'chart well (template slides 79, 80, 81, 82, 93, 94)'),
 'reportGrayTable':    ('Content Gray', 'table well (template slides 76, 78)'),
 'reportDarkTable':    ('Content Dark', 'table well (template slide 77)'),
 'reportGrayTimeline': ('Content Gray', 'campaign progress timeline (template slide 72)'),
}

# Template names that no longer generate their own layout, mapped to the one
# that supersedes them. Keeps the spec doc and the engine in agreement.
RETIRED_TEMPLATE_NAMES={'Headline Photo Divider':'headlinePhotoWell',
 'Blank Dark':'reportStatRow','Blank Grey':'reportEcosystemTree',
 'Blank Light':'reportJourneyMap','Title & Bullets':'reportPlatformMatrix',
 # 7/30/26 template renamed a second "Divider Tides" instance (slide 20,
 # previously just another "Divider Tides") to "1_Divider Tides" after its
 # background photo was removed -- its remaining content (tag + title) is
 # now identical to dividerTides' own slide 19, confirmed geometry match,
 # so it resolves to the existing function rather than a new one.
 '1_Divider Tides':'dividerTides'}

TOKEN={'#262626':'asphalt','#EEEEEE':'paper','#FFFFFF':'white','#000000':'black',
 '#C4A584':'accent','#BFA588':'accentDim','#919292':'titleGray','#808080':'bodyGray',
 '#5E5E5E':'captionGray','#868686':'mutedGray','#D5D5D5':'lt2','#F5F5F5':'dividerLight',
 '#EFEFEF':'paperHi','#1A1A1A':'nearBlack','#EAE7E0':'cardSand','#221F20':'ink',
 '#929292':'titleGray','#B9BDC4':'ltGray','#CCCCCC':'ltGray','#999999':'gray'}
def tok(h):
    if not h: return None
    return TOKEN.get(h.upper(), h)

STRUCTURAL_TITLES={'STORYBOARD','VIDEO REFERENCES','THANK YOU','TONE & MANNER','MOODBOARD'}
LOGO_BOX=(0.41,0.37,1.12,0.31); LOCKUP_BOX=(0.42,7.06,1.02,0.19)
def _near(e, box, tol=0.05):
    return all(abs((e.get(k) or 0)-v) < tol for k,v in zip(('x','y','w','h'), box))

LOREM=re.compile(r'lorem|ipsum|dolor|dilir|ipso|consec|amet',re.I)
def clean(t):
    if not t: return ''
    return '' if LOREM.search(t) else t.strip()

def is_static(t):
    if not t: return False
    s=t.strip()
    if s.endswith(':'): return True
    if re.match(r'^\d+:\d+',s): return True
    return s in ('Headshot','Full body shot','Track sun','Name:','STORYBOARD','VIDEO REFERENCES',
                 'THANK YOU','TONE & MANNER','1:1 Carousel')

SOCIAL_FIELD=[('post copy','postCopy'),('headline (','headline'),('alts','alts'),
 ('super','super_'),('cta','cta'),('destination','destination'),('size:','size')]
def social_key(sample):
    t=(sample or '').strip().lower()
    for pat,key in SOCIAL_FIELD:
        if t.startswith(pat): return key
    return None

def classify(els):
    """assign a cfg role to each text element"""
    txt=[e for e in els if e['role']=='text']
    if not txt: return {}
    roles={}
    # tag: accent-coloured small caps
    for e in txt:
        c=(e.get('color') or '').upper()
        if c in ('#C4A584','#BFA588') and (e.get('pt') or 0)<=17:
            roles[id(e)]='tag'; break
    # date footer
    for e in txt:
        if e['y']>=6.9 and (e.get('pt') or 0)<=13 and id(e) not in roles:
            roles[id(e)]='date'; break
    rest=[e for e in txt if id(e) not in roles]
    rest.sort(key=lambda e:-(e.get('pt') or 0))
    if rest:
        roles[id(rest[0])]='title'
        big=rest[0].get('pt')
        subs=[e for e in rest[1:] if (e.get('pt') or 0)>=12 and (e.get('pt') or 0)<big]
        if subs: roles[id(subs[0])]='subhead'
    bodies=[e for e in txt if id(e) not in roles]
    # group equal-size bodies as repeated items
    bysz=collections.Counter((e.get('pt') for e in bodies))
    for e in bodies:
        if is_static(e.get('sample','')): roles[id(e)]='static'
        elif bysz[e.get('pt')]>=3: roles[id(e)]='item'
        else: roles[id(e)]='body'
    return roles

def jsnum(v):
    if v is None: return '0'
    return ('%g'%round(v,2))

def _mask(e):
    """A photo well may be clipped to a custom outline (Cover Photo2 masks its
    photo into the angular MMW motif). Points are fractions of the well box."""
    pts=e.get('mask')
    if not pts: return ''
    return ', [%s]'%','.join('[%g,%g]'%(p[0],p[1]) for p in pts)

def emit_layout(name):
    L=LAY[name]; slug=SLUG[name]
    if slug in OVERRIDES:
        bg=L['background']
        bgs=('image `%s`'%bg.get('asset')) if bg.get('kind')=='image' else ('solid %s'%bg.get('hex'))
        hdr=['// '+'='*58,
             '// LAYOUT: %s  ->  cfg.layout = "%s"'%(name.strip().upper(), slug),
             '// Template: "%s"'%name,
             '// Source slide: %s   Background: %s'%(L.get('spec_from_slide') or 'layout def', bgs),
             ('// Set slideData.bgColor = "%s".'%bg['hex']) if bg.get('kind')!='image' else '// Set slideData.bgImage to the asset above.',
             '// HAND-AUTHORED: structured item API (auto-generation flattens this grid).',
             '// '+'='*58]
        return '\n'.join(hdr)+OVERRIDES[slug]
    els=L['elements']
    roles=classify(els)
    body_i=[0]; item_i=[0]; well_i=[0]
    lines=[]
    lines.append('// '+'='*58)
    lines.append('// LAYOUT: %s  ->  cfg.layout = "%s"'%(name.strip().upper(), slug))
    bg=L['background']
    bgs = ('image `%s`'%bg.get('asset')) if bg.get('kind')=='image' else ('solid %s'%bg.get('hex'))
    lines.append('// Template: "%s"%s'%(name, '  (NOTE: trailing space in template name)' if name!=name.strip() else ''))
    lines.append('// Source slide: %s   Background: %s'%(L.get('spec_from_slide') or 'layout def', bgs))
    if bg.get('kind')!='image' and bg.get('hex'):
        lines.append('// Set slideData.bgColor = "%s" (engine honours bgColor on export + preview).'%bg['hex'])
    else:
        lines.append('// Set slideData.bgImage to the asset above.')
    lines.append('// '+'='*58)
    lines.append('function layout_%s(cfg) {'%slug)
    lines.append('  var els = [];')
    used=[]
    for e in els:
        # Template authoring annotations (#CB297B "PLACE YOUR OWN IMAGE" / "click here")
        # are notes to the deck author, never slide content. Never emit them.
        if (e.get('color') or '').upper()=='#CB297B': continue
        x,y,w,h=[jsnum(e[k]) for k in ('x','y','w','h')]
        if e['role']=='photo_placeholder':
            # Some layouts implement the brand marks AS picture placeholders
            # (Cover Photo2 idx 22/23, Thank You Dark idx 22). Geometrically they
            # are the logo/lockup slots and the demo slides fill them with the
            # real marks -- a generic "change picture" well would put a grey box
            # where the MMW logo belongs.
            if _near(e, LOGO_BOX):
                lines.append("  els.push({ type:'img', ref:logoRef(cfg), x:%s, y:%s, w:%s, h:%s }); // brand mark (placeholder slot in template)"%(x,y,w,h))
            elif _near(e, LOCKUP_BOX):
                lines.append("  els.push({ type:'img', ref:lockupRef(cfg), x:%s, y:%s, w:%s, h:%s }); // brand mark (placeholder slot in template)"%(x,y,w,h))
            else:
                lines.append('  ph(els, cfg, %s, %s, %s, %s, %d%s);'%(x,y,w,h,well_i[0],_mask(e))); well_i[0]+=1
        elif e['role']=='fixed_image':
            a=e.get('asset','')
            ref = 'gi0' if 'mmw_logo' in a else ('gi1' if 'lockup' in a else None)
            # Light/dark ref-swapping is ONLY correct at the two standard corner
            # footprints, where the template demonstrably ships both colourways
            # (Cover Light black vs Cover Dark white). Elsewhere the template's
            # specific choice is a deliberate design decision -- Divider Tides
            # uses a 9.28x7.5in BLACK logo as a subtle watermark on dark navy,
            # and swapping it to white would blow it out. Use the literal asset.
            if ref and (_near(e, LOGO_BOX) or _near(e, LOCKUP_BOX)):
                fn='logoRef' if ref=='gi0' else 'lockupRef'
                lines.append("  els.push({ type:'img', ref:%s(cfg), x:%s, y:%s, w:%s, h:%s });"%(fn,x,y,w,h))
            elif a in BUNDLED:
                # Real brand furniture (device chrome, platform marks, textures).
                # Resolve to the shipped bundle; cfg.assets can override per deck.
                extra=''
                op=e.get('opacity_pct')
                if op is not None and op < 99:
                    # alphaModFix. Divider Tides' watermark is 3.55% opacity --
                    # painting it solid puts a black slab across the slide.
                    extra += ", transparency:%g"%round(100-op,1)
                cr=e.get('crop_pct')
                if cr:
                    extra += ", crop:%s"%json.dumps({k:round(v/100.0,4) for k,v in cr.items()})
                lines.append("  els.push({ type:'img', src:(cfg.assets && cfg.assets['%s']) || A+'%s', x:%s, y:%s, w:%s, h:%s%s });"
                             %(a, BUNDLED[a].split('assets/',1)[1], x,y,w,h, extra))
            else:
                # Demo photography from the source deck -- intentionally NOT
                # shipped. Render a replaceable well so the user drops their own
                # image in, rather than a dead reference to a missing file.
                lines.append('  ph(els, cfg, %s, %s, %s, %s, %d%s); // was demo photo %s'%(x,y,w,h,well_i[0],_mask(e),a)); well_i[0]+=1
        elif e['role']=='shape':
            f=tok(e.get('fill'))
            if f:
                extra=''
                if e.get('fill_alpha_pct'): extra=", transparency:%d"%round(100-e['fill_alpha_pct'])
                # A custom-geometry outline travels as fractions of the shape box,
                # so it survives any later rescale of x/y/w/h untouched.
                if e.get('points'):
                    pts=','.join('[%g,%g]'%(p[0],p[1]) for p in e['points'])
                    extra += ", points:[%s]"%pts
                lines.append("  els.push({ type:'s', x:%s, y:%s, w:%s, h:%s, fill:'%s'%s });"%(x,y,w,h,f,extra))
            elif (e['w'] or 0)==0 or (e['h'] or 0)==0:
                # zero-dimension shape = a rule. Give it 0.01in so it renders.
                ww='0.01' if (e['w'] or 0)==0 else w
                hh='0.01' if (e['h'] or 0)==0 else h
                lines.append("  els.push({ type:'s', x:%s, y:%s, w:%s, h:%s, fill:'ltGray' }); // rule"%(x,y,ww,hh))
            else:
                lines.append("  // unfilled container at x:%s y:%s w:%s h:%s -- invisible in source, not emitted"%(x,y,w,h))
        elif e['role']=='text':
            r=roles.get(id(e),'body')
            samp=clean(e.get('sample',''))
            _f=(e.get('font') or '')
            # Template uses three faces: Mazda Type Bold (display), Mazda Type /
            # Mazda Type Regular (lighter display), Arial (body, and the theme
            # minorFont that unstyled runs inherit).
            font = 'H' if _f=='Mazda Type Bold' else ('HR' if _f.startswith('Mazda') else 'B')
            col = tok(e.get('color')) or 'title'
            opts=["type:'t'"]
            # Demo copy from the source deck is NEVER used as a default -- only
            # structural chrome (fixed titles, grid numbers, form labels) persists.
            raw=(e.get('sample') or '').strip()
            sk = social_key(raw) if L['family']=='social' else None
            if sk:
                src="(cfg.copy && cfg.copy.%s) || %s"%(sk, json.dumps(raw)); guard=None
            elif r=='tag': src="cfg.tag || ''"; guard='cfg.tag'
            elif r=='title':
                dflt = raw if raw.upper() in STRUCTURAL_TITLES else ''
                src="cfg.title || %s"%json.dumps(dflt); guard=None
            elif r=='subhead':
                # Covers read naturally as `subtitle`; accept both so a deck
                # written from the prompt's examples cannot silently lose it.
                src="cfg.subhead || cfg.subtitle || ''"; guard='(cfg.subhead || cfg.subtitle)'
            elif r=='date': src="cfg.date || ''"; guard='cfg.date'
            elif r=='static': src=json.dumps(raw); guard=None
            elif r=='item':
                dflt = raw if re.match(r'^[0-9]{1,2}$', raw) else ''
                src="(cfg.items && cfg.items[%d]) || %s"%(item_i[0], json.dumps(dflt)); guard=None; item_i[0]+=1
            else:
                key='text' if body_i[0]==0 else 'text%d'%(body_i[0]+1)
                src="cfg.%s || ''"%key; guard=None; body_i[0]+=1
            opts.append('text:%s'%src)
            opts.append('x:%s, y:%s, w:%s, h:%s'%(x,y,w,h))
            opts.append("font:'%s', size:%s, color:'%s'"%(font, jsnum(e.get('pt')), col))
            # Weight. 'H' IS Mazda Type Bold, so asking for bold on top of it
            # would double-apply -- a real bold face plus a synthetic smear.
            # Everywhere else the template's b="1" has to be carried through:
            # 182 elements set it, including every 35pt section title, which
            # the template renders as Mazda Type with synthetic bold.
            if e.get('bold') and font != 'H': opts.append('bold:true')
            al=e.get('align')
            if al and al!='l': opts.append("align:'%s'"%{'ctr':'center','r':'right','just':'justify'}.get(al,al))
            an=e.get('anchor')
            if an in ('ctr','b'): opts.append("valign:'%s'"%{'ctr':'middle','b':'bottom'}[an])
            # caps is ALWAYS emitted -- its presence tells the engine this element's
            # typography is fully specified, so it must not fall back to guessing
            # casing/tracking/line-height from size and colour (see getTextStyle).
            opts.append('caps:%s'%('true' if e.get('all_caps') else 'false'))
            opts.append('lineSpacing:%g'%((e.get('line_pct') or 100)/100.0))
            cs=e.get('char_spacing_pt')
            if cs: opts.append('charSpacing:%g'%cs)
            ins=e.get('insets') or {}
            if any(ins.get(k) for k in 'ltrb'):
                opts.append('insets:{l:%g,t:%g,r:%g,b:%g}'%(ins.get('l') or 0, ins.get('t') or 0,
                                                            ins.get('r') or 0, ins.get('b') or 0))
            body='  els.push({ '+', '.join(opts)+' });'
            if guard:
                lines.append('  if (%s) %s'%(guard, body.strip()))
            else:
                lines.append(body)
    lines.append('  return els;')
    lines.append('}')
    return '\n'.join(lines)

HEAD = '''/* ============================================================
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
  els.push({ type:'t', text:'RIGHT-CLICK \\u2192 CHANGE PICTURE',
    x:x+0.10, y:y+(h/2)-0.15, w:w-0.20, h:0.30,
    font:'H', size:9, color: dk ? 'mutedGray' : 'bodyGray',
    align:'center', valign:'middle', _skipExport:true });
}

'''

parts=[HEAD]
order=list(SLUG.keys())
LAYOUT_KEYS={}
DERIVED_BG={}
for nm in order:
    body=emit_layout(nm)
    # Record which cfg.<key> the emitted function actually reads, so dispatch can
    # warn when a deck supplies content the layout has no slot for.
    # Scan the CODE only -- the header comment contains 'cfg.layout = "..."'.
    code='\n'.join(l for l in body.split('\n') if not l.lstrip().startswith('//'))
    keys=sorted(set(re.findall(r'cfg\.([A-Za-z_][A-Za-z0-9_]*)', code)))
    keys=[k for k in keys if k not in ('layout','dark','assets','images')]
    LAYOUT_KEYS[SLUG[nm]]=keys
    parts.append(body+'\n')

for slug,(base,note) in DERIVED.items():
    L=LAY[base]; bg=L['background']
    bgs=('image `%s`'%bg.get('asset')) if bg.get('kind')=='image' else ('solid %s'%bg.get('hex'))
    hdr=['// '+'='*58,
         '// LAYOUT: %s  ->  cfg.layout = "%s"'%(slug.upper(), slug),
         '// Variant of "%s" -- %s'%(base, note),
         '// Background: %s'%bgs,
         ('// Set slideData.bgColor = "%s".'%bg['hex']) if bg.get('kind')!='image' else '// Set slideData.bgImage to the asset above.',
         '// HAND-AUTHORED: the base layout is a bare chassis; this adds the well.',
         '// '+'='*58]
    body='\n'.join(hdr)+OVERRIDES[slug]
    code='\n'.join(l for l in body.split('\n') if not l.lstrip().startswith('//'))
    keys=sorted(set(re.findall(r'cfg\.([A-Za-z_][A-Za-z0-9_]*)', code)))
    LAYOUT_KEYS[slug]=[k for k in keys if k not in ('layout','dark','assets','images')]
    parts.append(body+'\n')
    DERIVED_BG[slug]=bg

m=["\n// ------------------------------------------------------------\n// DEFAULT PHOTOGRAPHY POOLS\n// Image-led layouts pre-populate with real photography from the template deck\n// so a fresh deck never opens on empty grey boxes. Every one is still a normal\n// picture in the exported PPTX, so right-click -> Change Picture works as usual.\n//\n// Rotation is applied ONCE by deckInit (see assignDefaultPhotos in\n// deck-shell.js), never inside these layout functions: dispatch() runs several\n// times per slide -- preview render, asset prefetch, icon pre-render, PPTX\n// export -- so a counter in here would advance on every pass and the exported\n// file would not match the preview.\n//\n// Opt out per deck with deckInit({ defaultPhotos:false }), or per slide by\n// setting your own bgImage / images entry.\n// ------------------------------------------------------------\nvar PHOTO_DEFAULTS = {\n  coverPhoto:        { target:'bgImage',            pool:[A+'photos/cover_scenic_01.jpg', A+'photos/cover_scenic_02.jpg'] },\n  coverPhoto2:       { target:'images', slot:0,     pool:[A+'photos/cover_hero_01.jpg',   A+'photos/cover_hero_02.jpg'] },\n  headlinePhotoWell: { target:'images', slot:0,     pool:[A+'photos/statement_01.jpg',    A+'photos/statement_02.jpg'] }\n};\n\n",'// '+'='*58,'// DISPATCH','// '+'='*58,'var LAYOUT_MAP = {']
for nm in order:
    m.append('  %s: layout_%s,'%(SLUG[nm], SLUG[nm]))
for slug in DERIVED:
    m.append('  %s: layout_%s,'%(slug, slug))
m[-1]=m[-1].rstrip(',')
m.append('};\n')
m.append('''// ------------------------------------------------------------
// AMBIGUOUS v1.0 NAMES -- these exist in BOTH versions with DIFFERENT meanings.
// v1.0's content03 was built from the template's "Content 01"; v2.0's
// content03 IS "Content 03". A v1.0 deck reusing the key silently renders a
// different layout, so these log loudly and render the v2.0 (template-correct)
// meaning. Re-key old decks: v1 content03 -> content01, v1 content05 -> content03.
// ------------------------------------------------------------
var AMBIGUOUS = { content03: 'content01', content05: 'content03' };
''')
m.append('''// Retired v2.0 layouts. Superseded by a better version of the same design;
// old decks keep rendering, and the replacement is what they get.
var RETIRED = %s;
'''%json.dumps(RETIRED, indent=2))
m.append('// v1.0 deck data keeps working; these resolve to the closest real template layout.')
m.append('var LEGACY_ALIASES = {')
for k,v in LEGACY.items():
    if k!=v: m.append("  %s: '%s',"%(k,v))
m[-1]=m[-1].rstrip(',')
m.append('};\n')
m.append('''// Exact template names also accepted, so the spec doc and the engine agree.
var TEMPLATE_NAMES = %s;

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
var VERSION = '__BUILD_STAMP__';
var LAYOUT_KEYS = __LAYOUT_KEYS__;
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
'''%json.dumps(dict(list(SLUG.items())+list(RETIRED_TEMPLATE_NAMES.items())), indent=2))
parts.append('\n'.join(m))
import datetime as _dt
_stamp = 'v2.0-' + _dt.datetime.now().strftime('%Y%m%d-%H%M') + ' (' + str(len(order) + len(DERIVED)) + ' layouts)'
out='\n'.join(parts).replace('__LAYOUT_KEYS__', json.dumps(LAYOUT_KEYS, indent=2)).replace('__BUILD_STAMP__', _stamp)
open(W('deck-layouts.js'),'w').write(out)
print("wrote deck-layouts.js: %d bytes, %d lines"%(len(out), out.count('\n')))
print("layout functions:", out.count('function layout_'))
