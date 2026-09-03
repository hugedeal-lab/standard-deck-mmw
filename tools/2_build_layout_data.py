#!/usr/bin/env python3
"""mmw_layouts.json - modal-instance selection, matching MMW_Layout_Spec.md exactly."""
import json, collections
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
# --------------------------------------------------------------------

d=json.load(open(W('resolved.json')))
AMAP=json.load(open(_os.path.join(_HERE,'assetmap.json')))
SC=d['meta']['scale']; LAYS=d['layouts']; SLD=d['slides']
by=collections.defaultdict(list)
for n,S in SLD.items(): by[S['layout']].append(int(n))
for k in by: by[k].sort()
NEW={'image6.png':'mmw_logo_black.png','image10.png':'mmw_logo_black.png',
 'image2.png':'mmw_logo_white.png','image13.png':'mmw_logo_white_lg.png',
 'image5.png':'wpp_mazda_lockup_black.png','image9.png':'wpp_mazda_lockup_black.png',
 'image3.png':'wpp_mazda_lockup_white.png','image4.png':'pattern_light.png',
 'image8.png':'pattern_light.png','image1.png':'pattern_dark.png','image15.png':'pattern_dark.png',
 'image14.png':'pattern_light2.png','image16.png':'pattern_dark2.png','image7.png':'scenic_photo.png',
 'image17.png':'headline_photo.png','image11.png':'thankyou_texture.png','image12.png':'thankyou_texture.png',
 'image18.png':'headline_dark_mark.png','image19.png':'social_divider_photo.png','image20.png':'meta_logo.png',
 'image22.png':'meta_wordmark.png','image21.png':'device_frame_meta_carousel.png','image23.png':'device_frame_9x16.png',
 'image24.png':'device_frame_reddit.png','image26.png':'device_frame_reddit_1x1.png','image25.png':'reddit_ui_chrome.png',
 'image27.png':'reddit_brand_photo.png','image28.png':'tiktok_chrome.png','image29.png':'pinterest_wordmark.png',
 'image30.png':'pinterest_logo.png','image31.png':'pinterest_device_frame.png','image32.png':'youtube_chrome.png',
 'image33.png':'youtube_logo.png'}
def aname(f):
    f=(f or '').split('/')[-1]
    return NEW.get(f, AMAP.get(f,f))
# Sizes (engine pt) whose casing is expressed by typing rather than cap="all".
# Evidence: at 35pt, 21 of 21 instances across 21 layouts are typed uppercase
# and none are mixed case. 9pt shows the same pattern but only on the Blank
# canvases, where the text is one-off content rather than a design role -- so
# it is deliberately NOT included here.
TYPED_CAPS_SIZES = {35.0}

def _typed_upper(shape):
    t=next((q['text'] for q in shape.get('paras',[]) if q['text'].strip()), '')
    return bool(t) and t.isupper() and any(c.isalpha() for c in t)

def first_eff(s):
    for p in s.get('paras',[]):
        for r in p['runs']:
            if r['eff'].get('sz_native'): return r['eff'],p
    for p in s.get('paras',[]):
        for r in p['runs']: return r['eff'],p
    return {},{}
FAMS=[('cover',['Cover Light','Cover Dark','Cover Light2','Cover Photo','Cover Photo2']),
 ('divider',['Divider Dark','Divider Dark2','Divider Light','Divider Light2','Divider Asphalt','Divider Canopy','Divider Aurora','Divider Tides']),
 ('statement',['Content - Headline light','Content -headline dark','Headline Photo Divider','1_Content -headline photo copy']),
 ('agenda_closing',['Table of contents','Thank You Light','Thank You Dark']),
 ('editorial',['Content 01','Content 02','Content 03','Content 05','Content 06','Content 07','Content 08','Content 09','Content - 3 columns - Dark','Content - 3 columns - Light','Content 2 Rows - Dark','Content 2 Rows - Light','Content - 2 rows - Light']),
 ('report_blank',['Content Gray','Content Dark','Blank Dark','Blank Grey','Blank Light','Title & Bullets']),
 ('production',['Storyboard 01','Storyboard 02','Scripts 01','Video Reference','Casting','Casting_Talent','Location Overview','Location Detail','Moodboard Props','Moodboard Wardrobe','Moodboard ']),
 ('social',['Meta_Divider','Meta_Carousel 1x1','Meta_Carousel 4x5','Meta_Video&Static','Reddit_Divider','Reddit_Carousel','Reddit_Vid&Static1:1','Reddit_Vid&Static4:5','TikTok_Divider','TikTok_Carousel','TikTok_Vid&Static','Pinterest_Divider','Pinterest 2:3','Pinterest 1:1','Youtube_Divider','Youtube_VideoAd'])]
FAM={n:f for f,ns in FAMS for n in ns}

# Some template layout NAMES carry two genuinely different designs across their
# instances. '1_Content -headline photo copy' is the clear case: slide 31 is a
# 74pt title + 17.5pt accent subhead on the dark master, while slide 34 is a
# full-bleed photo well + 140pt statement + 15.5pt tag. Shipping only the modal
# instance silently loses the other design, so pin one and split out the rest.
# The MODAL instance is usually the right example, but the template opens with
# three instructional pages -- slide 2 "HOW TO USE THIS MAZDA DECK TEMPLATE",
# slide 3 "INSTALLING MAZDA FONT", slide 4 "BRAND ASSETS" -- and two of them are
# the earliest use of a two-row layout, so they win the pin and the layout
# inherits a one-off instructional composition. Both layouts are legitimate;
# slides 26 and 28 are their clean Lorem-ipsum versions. Pin those instead.
PIN_INSTANCE = {'1_Content -headline photo copy': 34,
                'Content 2 Rows - Dark': 26,
                'Content 2 Rows - Light': 28}
SPLITS = [
    # (template layout, slide to spec from, synthetic name, family)
    ('1_Content -headline photo copy', 31, 'Statement + Subhead (slide 31)', 'statement'),
]

# The charts / graphs / boxes section (source slides 71-101, headed by the
# "CHARTS / GRAPHS / BOXES" divider on 71) is 31 slides sharing 8 chassis
# layouts, so a chassis alone represents none of them. Each distinct composition
# gets its own layout, specced from its own slide. Already covered elsewhere:
# 71 (dividerDark), 72/76/77/78 and the chart slides (report* variants).
#
# CAUTION on "duplicates": 75 and 94 have identical geometry AND identical text
# to 74 and 93, so a comparison on those two axes calls them duplicates. They
# are not -- they are the opposite colourway. 75 carries its own #EEEEEE slide
# background and recolours the header and section labels; 94 sits on the dark
# ground where 93 overrides to #EEEEEE. Compare backgrounds and colours too.
REPORT_SLIDES = [
    ( 73, 'Content Gray',    'Report Split Panels (slide 73)',      'report'),
    ( 74, 'Blank Dark',      'Report Stat Row (slide 74)',          'report'),
    ( 75, 'Blank Dark',      'Report Stat Row Light (slide 75)',    'report'),
    ( 86, 'Content Gray',    'Report Spend Bars Light (slide 86)',  'report'),
    ( 87, 'Content Dark',    'Report Spend Bars Dark (slide 87)',   'report'),
    ( 89, 'Blank Dark',      'Report Model Compare (slide 89)',     'report'),
    ( 90, 'Blank Dark',      'Report Brand Pillars (slide 90)',     'report'),
    ( 91, 'Title & Bullets', 'Report Platform Matrix (slide 91)',   'report'),
    ( 92, 'Blank Grey',      'Report Ecosystem Tree (slide 92)',    'report'),
    ( 95, 'Blank Dark',      'Report Metric Table (slide 95)',      'report'),
    ( 96, 'Blank Grey',      'Report Quote Panel (slide 96)',       'report'),
    ( 97, 'Content Gray',    'Report Chapter Opener (slide 97)',    'report'),
    ( 98, 'Content Gray',    'Report Strategy Stack (slide 98)',    'report'),
    ( 99, 'Blank Light',     'Report Journey Map (slide 99)',       'report'),
    (100, 'Blank Light',     'Report Gate Status (slide 100)',      'report'),
    (101, 'Content Gray',    'Report Numbered Steps (slide 101)',   'report'),
    ( 78, 'Content Gray',    'Report Channel Matrix (slide 78)',    'report'),
]
SPLITS += [(tpl, sn, name, fam) for sn, tpl, name, fam in REPORT_SLIDES]

# Three-column layouts: snap the column stack to one grid.
#
# Three separate drifts break the alignment, and fixing only one exposes another:
#
#   1. Vertical. Slide 29 carries hand-edited subhead boxes for columns 2 and 3
#      (y=3.202, top-anchored) but leaves column 1 inheriting the layout
#      (y=3.049, BOTTOM-anchored), so its single line renders 0.223in low.
#   2. Wrapping. The light layout's boxes agree, but they are bottom-anchored --
#      so a column that wraps to two lines starts 0.181in above its neighbours.
#   3. Horizontal. Slide 29 also overrides the body copy's left inset to 0.028
#      where the layout says 0.104, and the body boxes sit ~0.024in left of the
#      subheads even in the layout. Net effect: the subhead hangs ~0.10in right
#      of the copy beneath it in columns 2 and 3.
#
# The title, subhead and body of a column should share one left edge -- the
# layout already puts title and subhead on the same x, so that is the grid.
# Layouts whose pinned demo slide hand-edits geometry away from its own layout.
# "Content 2 Rows - Dark" and "- Light" are byte-identical in the template, but
# slide 26 nudges three of its boxes (shorter body wells at h=0.912 vs 1.064, a
# second-row subhead at y=3.991 h=0.293 instead of y=3.838 h=0.445, left inset
# 0.028 instead of 0.104) while slide 28 keeps the layout's own values. Taking
# geometry from the LAYOUT for these -- text still from the pinned slide -- makes
# the pair match, which is what the template intends.
GEOMETRY_FROM_LAYOUT = {'Content 2 Rows - Dark'}

COLUMN_SNAP = {
    'Content - 3 columns - Dark':  {'cols': [0.9, 5.02, 9.08], 'inset': 0.104,
                                    'rows': {13.0: {'y': 3.2, 'h': 0.69, 'anchor': 't'},
                                             10.0: {'y': 3.96, 'h': 1.59, 'anchor': 't'}}},
    'Content - 3 columns - Light': {'cols': [0.9, 5.02, 9.08], 'inset': 0.104,
                                    'rows': {13.0: {'y': 3.2, 'h': 0.69, 'anchor': 't'},
                                             10.0: {'y': 3.96, 'h': 1.59, 'anchor': 't'}}},
}

def canonical(nm, pin=None):
    """MODAL instance + layout furniture - identical rule to the spec doc.
    `pin` forces a specific slide instance instead of the modal one."""
    L=LAYS[nm]; ns=by.get(nm,[])
    if pin and pin in ns:
        furn=[dict(s,_layer='layout') for s in L['shapes'] if not s.get('ph')]
        own=[dict(s,_layer='slide') for s in SLD[str(pin)]['shapes']]
        if nm in GEOMETRY_FROM_LAYOUT:
            # Keep the pinned slide's TEXT, restore the layout's geometry. The
            # placeholder idx is the join: a slide box that overrides its
            # layout's position is put back where the layout puts it.
            byidx={(s.get('ph') or {}).get('idx'): s for s in L['shapes'] if s.get('ph')}
            for o in own:
                src=byidx.get((o.get('ph') or {}).get('idx'))
                if not src or src.get('x') is None: continue
                for k in ('x','y','w','h'):
                    o[k]=src.get(k)
                if src.get('body'):
                    o['body']=dict(o.get('body') or {}, **src['body'])
        seen={(s.get('x'),s.get('y'),s.get('w'),s.get('h')) for s in own}
        furn=[f for f in furn if (f.get('x'),f.get('y'),f.get('w'),f.get('h')) not in seen]
        return own+furn, pin, SLD[str(pin)]['bg'] or L.get('bg')
    furn=[s for s in L['shapes'] if not s.get('ph')]
    if not ns:
        return [dict(s,_layer='layout') for s in L['shapes']], None, L.get('bg')
    def sig(S): return tuple(sorted(f"{s['kind']}{s.get('x')}{s.get('y')}{s.get('w')}{s.get('h')}" for s in S['shapes']))
    groups=collections.Counter(sig(SLD[str(n)]) for n in ns)
    best=groups.most_common(1)[0][0]
    pick=[n for n in ns if sig(SLD[str(n)])==best][0]
    own=[dict(s,_layer='slide') for s in SLD[str(pick)]['shapes']]
    seen={(s.get('x'),s.get('y'),s.get('w'),s.get('h')) for s in own}
    furn=[dict(s,_layer='layout') for s in furn if (s.get('x'),s.get('y'),s.get('w'),s.get('h')) not in seen]
    return own+furn, pick, SLD[str(pick)]['bg'] or L.get('bg')

def emit(nm, pin=None, as_name=None, family=None):
    shapes,pick,bg = canonical(nm, pin or PIN_INSTANCE.get(nm))
    els=[]
    for s in shapes:
        if s.get('x') is None: continue
        phh=s.get('ph') or {}
        if phh.get('type')=='sldNum': continue
        e,p=first_eff(s)
        rec={'kind':s['kind'],'x':s['x'],'y':s['y'],'w':s['w'],'h':s['h'],'layer':s.get('_layer')}
        if phh.get('type')=='pic': rec['role']='photo_placeholder'; rec['ph_idx']=phh.get('idx')
        elif s['kind']=='pic': rec['role']='fixed_image'
        elif s['kind']=='graphicFrame': rec['role']='chart_or_table'
        elif e.get('sz_native'):
            # A run size alone does not make something a text element. Decorative
            # shapes inherit a default run style from the master, so an empty
            # shape carries sz_native with no content. Emitting those as text
            # binds them to cfg.subhead/cfg.text -- swallowing user copy into an
            # invisible box -- and drops their fill. Real text requires content.
            _t=next((q['text'] for q in s.get('paras',[]) if q['text'].strip()),'')
            rec['role'] = 'text' if _t.strip() else 'shape'
        else: rec['role']='shape'
        if s.get('image'): rec['asset']=aname(s['image'])
        if s.get('opacity_pct') is not None: rec['opacity_pct']=s['opacity_pct']
        if s.get('crop_pct'): rec['crop_pct']=s['crop_pct']
        if e.get('sz_native'):
            rec['pt']=round(e['sz_native']/SC,1); rec['pt_native']=e['sz_native']
            rec['color']=e.get('color'); rec['bold']=e.get('b')
            f=e.get('font') or e.get('font_sym')
            rec['font']={'+mj-lt':'Mazda Type Bold','+mn-lt':'Arial'}.get(f,f)
            if e.get('cap')=='all':
                rec['all_caps']=True
            elif round(e['sz_native']/SC,1) in TYPED_CAPS_SIZES and _typed_upper(s):
                # The template sets casing two ways. Most roles use cap="all",
                # but the 35pt section title never does -- all 21 instances are
                # simply TYPED in uppercase. Rendering caps:false there means a
                # title passed as "Concept overview" renders mixed case, against
                # the design. Confirmed with the brand owner: intent is caps.
                # Recorded with caps_source so the deviation stays auditable.
                rec['all_caps']=True; rec['caps_source']='typed-uppercase'
            # Character spacing (PowerPoint "Expanded/Condensed by N pt"). Scales
            # with the canvas like every other measurement: the template's 13.95pt
            # tracking on the 31pt eyebrow is 6.97pt in engine space.
            if e.get('spc'): rec['char_spacing_pt']=round(e['spc']/SC, 2)
            pp=(p or {}).get('ppr',{})
            if pp.get('algn'): rec['align']=pp['algn']
            if pp.get('lnSpc_pct'): rec['line_pct']=pp['lnSpc_pct']
            if pp.get('spcBef_pt_native'): rec['space_before_pt']=round(pp['spcBef_pt_native']/SC,1)
            t=next((q['text'] for q in s.get('paras',[]) if q['text'].strip()),'')
            if t: rec['sample']=t[:80]
        b=s.get('body') or {}
        if b.get('anchor'): rec['anchor']=b['anchor']
        if b.get('mL') is not None: rec['insets']={'l':b.get('mL'),'t':b.get('mT'),'r':b.get('mR'),'b':b.get('mB')}
        fl=s.get('fill')
        if fl and fl.get('hex'):
            rec['fill']=fl['hex']
            if fl.get('alpha_pct'): rec['fill_alpha_pct']=round(fl['alpha_pct'],1)
        cg=s.get('custgeom')
        if cg:
            key='mask' if rec.get('role') in ('photo_placeholder','fixed_image') else 'points'
            if cg.get('points'): rec[key]=cg['points']
            elif cg.get('unsupported'): rec['geom_note']=cg['unsupported']
        els.append(rec)
    snap = COLUMN_SNAP.get(nm)
    if snap:
        i = snap['inset']
        for r in els:
            row = snap['rows'].get(r.get('pt')) if r['role']=='text' else None
            if not row: continue
            r['x'] = min(snap['cols'], key=lambda c: abs(c - r['x']))
            r['y'], r['h'], r['anchor'] = row['y'], row['h'], row['anchor']
            r['insets'] = {'l': i, 't': i, 'r': i, 'b': i}
    # Deduplicate text boxes stacked at the same position. Demo slides sometimes
    # carry an unattached copy of a placeholder's text box (slide 39 duplicates
    # both its subhead and body; slide 70 duplicates a caption). Emitting both
    # double-renders the same copy on top of itself, which reads as smeared or
    # falsely-bold text. Document order puts the real placeholder first, so keep
    # the first occurrence at each position.
    seen_pos=set(); deduped=[]
    for r in els:
        if r['role']=='text':
            key=(round(r['x'],2), round(r['y'],2))
            if key in seen_pos: continue
            seen_pos.add(key)
        deduped.append(r)
    els=deduped
    els.sort(key=lambda r:(r['y'],r['x']))
    def mk(b):
        if not b: return {'kind':'solid','hex':'#262626','note':'inherited from slide master'}
        return {'kind':'image','asset':aname(b.get('image'))} if b['kind']=='picture' else b
    # The LAYOUT background is the brand default. The modal slide may have swapped
    # in demo photography (e.g. Cover Photo slide 8 replaces scenic_photo.png).
    lay_bg = mk(LAYS[nm].get('bg'))
    slide_bg = mk(bg)
    # For a SPLIT the pinned slide IS the layout, so its own background wins.
    # Slide 75 is the light colourway of 74 and carries its own #EEEEEE; taking
    # the shared "Blank Dark" background would have published it as dark.
    eff_bg = slide_bg if (as_name and slide_bg) else lay_bg
    rec={'name':as_name or nm,'family':family or FAM.get(nm),
         'slides':[pick] if as_name else by.get(nm,[]),'spec_from_slide':pick,
         'background':eff_bg,'elements':els}
    if slide_bg != lay_bg: rec['background_on_demo_slide']=slide_bg
    if as_name: rec['split_from']=nm
    return rec
out={'schema':'mmw-layout-spec/1.1',
 'source':{'file':'MMW PPT Template_7.24.26.pptx','layouts':66,'slides':115,
  'native_in':[26.667,15.0],'engine_in':[13.33,7.5],'scale':round(SC,4),
  'note':'x/y/w/h in engine inches; pt in engine points (native pt / 2.0005). Modal slide instance + layout furniture.'},
 'palette':{'asphalt':'#262626','paper':'#EEEEEE','spark':'#C4A584','spark_dim':'#BFA588',
  'title_gray':'#919292','gray':'#808080','dk2':'#5E5E5E','muted':'#868686','lt2':'#D5D5D5',
  'divider_light':'#F5F5F5','annotation_STRIP':'#CB297B'},
 'fonts':{'display':'Mazda Type Bold','body':'Arial','fallback':'Helvetica, Arial, sans-serif'},
 'furniture':{'logo':{'x':0.41,'y':0.37,'w':1.12,'h':0.31},
  'lockup':{'x':0.42,'y':7.06,'w':1.02,'h':0.19},
  'draft_date':{'x':1.90,'y':7.00,'w':12.01,'h':0.35,'pt':12,'color':'#868686'}},
 'layouts':[emit(n) for f,ns in FAMS for n in ns]
            + [emit(src, pin=sl, as_name=an, family=fam) for src,sl,an,fam in SPLITS]}
json.dump(out,open(W('mmw_layouts.json'),'w'),indent=1)
print("layouts:",len(out['layouts']),"elements:",sum(len(l['elements']) for l in out['layouts']))
dd=[l for l in out['layouts'] if l['name']=='Divider Dark'][0]
print("Divider Dark spec_from_slide:",dd['spec_from_slide'])
for e in dd['elements']:
    if e['role']=='text': print("   ",e['pt'],"pt",e.get('color'),repr(e.get('sample',''))[:30])
