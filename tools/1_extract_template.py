#!/usr/bin/env python3
"""Resolve effective geometry + typography through slide->layout->master inheritance."""
import zipfile, re, json, collections
import xml.etree.ElementTree as ET
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


SRC=TEMPLATE
A='{http://schemas.openxmlformats.org/drawingml/2006/main}'
P='{http://schemas.openxmlformats.org/presentationml/2006/main}'
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
EMU=914400.0
z=zipfile.ZipFile(SRC)

pres=ET.fromstring(z.read('ppt/presentation.xml'))
sz=pres.find(P+'sldSz')
NW=int(sz.get('cx'))/EMU; NH=int(sz.get('cy'))/EMU
SCALE=NW/13.33
def nin(v,nd=2):   # normalized inches
    return round((int(v)/EMU)/SCALE,nd) if v is not None else None
def rin(v,nd=3):   # raw native inches
    return round(int(v)/EMU,nd) if v is not None else None

def rels(part):
    d=part.rsplit('/',1)
    rp=d[0]+'/_rels/'+d[1]+'.rels'
    out={}
    try: rx=ET.fromstring(z.read(rp))
    except KeyError: return out
    for r in rx:
        out[r.get('Id')]=(r.get('Type').rsplit('/',1)[-1], r.get('Target'))
    return out

# map layout part -> name ; slide part -> layout part
layout_name={}; layout_part_by_name={}
for i in range(1,200):
    p=f'ppt/slideLayouts/slideLayout{i}.xml'
    try: x=z.read(p)
    except KeyError: continue
    m=re.search(rb'<p:cSld[^>]*name="([^"]*)"',x)
    nm=m.group(1).decode('utf8') if m else f'layout{i}'
    # XML entities in the name attribute (e.g. "Title &amp; Bullets") were
    # never being unescaped here -- this is a regex-on-raw-bytes extraction,
    # not a real XML parse, so &amp; stayed literal instead of becoming '&'.
    # 2_build_layout_data.py's FAMS list expects the real unescaped name.
    import html as _html
    nm=_html.unescape(nm)
    layout_name[p]=nm; layout_part_by_name.setdefault(nm,p)

slide_layout={}
for i in range(1,300):
    p=f'ppt/slides/slide{i}.xml'
    try: z.read(p)
    except KeyError: continue
    for rid,(ty,tg) in rels(p).items():
        if ty=='slideLayout':
            slide_layout[p]='ppt/'+tg.replace('../','')
MASTER='ppt/slideMasters/slideMaster1.xml'

def parse_txstyles():
    mx=ET.fromstring(z.read(MASTER))
    ts=mx.find(P+'txStyles')
    out={}
    if ts is None: return out
    for tag,key in (('titleStyle','title'),('bodyStyle','body'),('otherStyle','other')):
        e=ts.find(P+tag)
        if e is None: continue
        lvl=e.find(A+'lvl1pPr')
        if lvl is None: continue
        out[key]=lvl
    return out
TXSTYLES=parse_txstyles()

def defrpr_of(lvlpPr):
    if lvlpPr is None: return {}
    d=lvlpPr.find(A+'defRPr')
    return rpr_props(d) if d is not None else {}

def solid_hex(e):
    if e is None: return None
    s=e.find(A+'solidFill')
    if s is None: return None
    c=s.find(A+'srgbClr')
    if c is not None: return '#'+c.get('val').upper()
    sc=s.find(A+'schemeClr')
    if sc is not None: return 'scheme:'+sc.get('val')
    return None

def rpr_props(rpr):
    if rpr is None: return {}
    d={}
    if rpr.get('sz'): d['sz_native']=int(rpr.get('sz'))/100.0
    if rpr.get('b'): d['b']= rpr.get('b')=='1'
    if rpr.get('i'): d['i']= rpr.get('i')=='1'
    if rpr.get('cap'): d['cap']=rpr.get('cap')
    if rpr.get('spc'): d['spc']=int(rpr.get('spc'))/100.0
    h=solid_hex(rpr)
    if h: d['color']=h
    lat=rpr.find(A+'latin')
    if lat is not None: d['font']=lat.get('typeface')
    sym=rpr.find(A+'sym')
    if sym is not None: d.setdefault('font_sym',sym.get('typeface'))
    return d

def ppr_props(ppr):
    if ppr is None: return {}
    d={}
    if ppr.get('algn'): d['algn']=ppr.get('algn')
    if ppr.get('marL'): d['marL_native']=int(ppr.get('marL'))/EMU
    if ppr.get('indent'): d['indent_native']=int(ppr.get('indent'))/EMU
    ln=ppr.find(A+'lnSpc')
    if ln is not None:
        pc=ln.find(A+'spcPct'); pt=ln.find(A+'spcPts')
        if pc is not None: d['lnSpc_pct']=int(pc.get('val'))/1000.0
        if pt is not None: d['lnSpc_pt_native']=int(pt.get('val'))/100.0
    for tag,key in ((A+'spcBef','spcBef'),(A+'spcAft','spcAft')):
        e=ppr.find(tag)
        if e is not None:
            pt=e.find(A+'spcPts'); pc=e.find(A+'spcPct')
            if pt is not None: d[key+'_pt_native']=int(pt.get('val'))/100.0
            if pc is not None: d[key+'_pct']=int(pc.get('val'))/1000.0
    return d

def merge(*ds):
    o={}
    for d in ds:
        for k,v in (d or {}).items():
            if v is not None and k not in o: o[k]=v
    return o

def sp_lst_defrpr(sp):
    tb=sp.find(P+'txBody')
    if tb is None: return {},{}
    ls=tb.find(A+'lstStyle')
    if ls is None: return {},{}
    l1=ls.find(A+'lvl1pPr')
    if l1 is None: return {},{}
    return defrpr_of(l1), ppr_props(l1)

def xfrm_of(sp, xform=None):
    spPr=sp.find(P+'spPr')
    xf=None
    if spPr is not None: xf=spPr.find(A+'xfrm')
    if xf is None: xf=sp.find(P+'xfrm')          # graphicFrame (charts/tables)
    if xf is None:
        gp=sp.find(P+'grpSpPr')                   # group shapes
        if gp is not None: xf=gp.find(A+'xfrm')
    if xf is None: return None
    off=xf.find(A+'off'); ext=xf.find(A+'ext')
    if off is None or ext is None: return None
    ox,oy=int(off.get('x')),int(off.get('y'))
    cx,cy=int(ext.get('cx')),int(ext.get('cy'))
    if xform:
        ox=xform['tx']+ox*xform['sx']; oy=xform['ty']+oy*xform['sy']
        cx=cx*xform['sx']; cy=cy*xform['sy']
    off={'x':str(int(round(ox)))}; ext={'cx':str(int(round(cx)))}
    off_y=str(int(round(oy))); ext_cy=str(int(round(cy)))
    class _D(dict):
        def get(self,k,d=None): return dict.get(self,k,d)
    off=_D(x=str(int(round(ox))),y=off_y); ext=_D(cx=str(int(round(cx))),cy=ext_cy)
    return dict(x=nin(off.get('x')),y=nin(off.get('y')),w=nin(ext.get('cx')),h=nin(ext.get('cy')),
                x_native=rin(off.get('x')),y_native=rin(off.get('y')),
                w_native=rin(ext.get('cx')),h_native=rin(ext.get('cy')),
                rot=(int(xf.get('rot'))/60000.0 if xf.get('rot') else None))

def fill_of(sp):
    spPr=sp.find(P+'spPr')
    if spPr is None: return None
    if spPr.find(A+'blipFill') is not None: return {'kind':'picture'}
    if spPr.find(A+'gradFill') is not None: return {'kind':'gradient'}
    if spPr.find(A+'noFill') is not None: return {'kind':'none'}
    h=solid_hex(spPr)
    if h:
        s=spPr.find(A+'solidFill'); c=s.find(A+'srgbClr')
        al=None
        if c is not None:
            a=c.find(A+'alpha')
            if a is not None: al=int(a.get('val'))/1000.0
        return {'kind':'solid','hex':h,'alpha_pct':al}
    return None

def ph_of(sp):
    nv=sp.find(P+'nvSpPr') or sp.find(P+'nvPicPr')
    if nv is None: return None
    nvpr=nv.find(P+'nvPr')
    if nvpr is None: return None
    ph=nvpr.find(P+'ph')
    if ph is None: return None
    return {'idx':ph.get('idx'),'type':ph.get('type') or 'body','sz':ph.get('sz')}

def name_of(sp):
    for tag in (P+'nvSpPr',P+'nvPicPr',P+'nvGrpSpPr',P+'nvCxnSpPr'):
        nv=sp.find(tag)
        if nv is not None:
            c=nv.find(P+'cNvPr')
            if c is not None: return c.get('name')
    return None

def bodypr(sp):
    tb=sp.find(P+'txBody')
    if tb is None: return {}
    bp=tb.find(A+'bodyPr')
    if bp is None: return {}
    d={}
    for k,kk in (('lIns','mL'),('rIns','mR'),('tIns','mT'),('bIns','mB')):
        if bp.get(k) is not None: d[kk]=round((int(bp.get(k))/EMU)/SCALE,3)
    if bp.get('anchor'): d['anchor']=bp.get('anchor')
    if bp.get('wrap'): d['wrap']=bp.get('wrap')
    if bp.find(A+'normAutofit') is not None: d['autofit']='norm'
    if bp.find(A+'spAutoFit') is not None: d['autofit']='shape'
    if bp.find(A+'noAutofit') is not None: d['autofit']='none'
    return d

def paras_of(sp, inh_rpr, inh_ppr):
    tb=sp.find(P+'txBody')
    if tb is None: return []
    sh_rpr, sh_ppr = sp_lst_defrpr(sp)
    out=[]
    for p in tb.findall(A+'p'):
        ppr=p.find(A+'pPr')
        pp=ppr_props(ppr)
        pdef=defrpr_of(ppr) if ppr is not None else {}
        runs=[]
        for r in p.findall(A+'r'):
            t=r.find(A+'t')
            rp=r.find(A+'rPr')
            eff=merge(rpr_props(rp), pdef, sh_rpr, inh_rpr)
            runs.append({'text':t.text if t is not None else '','eff':eff})
        for fl in p.findall(A+'fld'):
            t=fl.find(A+'t')
            rp=fl.find(A+'rPr')
            eff=merge(rpr_props(rp), pdef, sh_rpr, inh_rpr)
            runs.append({'text':(t.text if t is not None else ''),'eff':eff,'field':fl.get('type')})
        if not runs:
            ep=p.find(A+'endParaRPr')
            if ep is None: continue
            eff=merge(rpr_props(ep), pdef, sh_rpr, inh_rpr)
            runs=[{'text':'','eff':eff}]
        out.append({'ppr':merge(pp, sh_ppr, inh_ppr), 'runs':runs,
                    'text':''.join(r['text'] or '' for r in runs)})
    return out

def _grp_xfrm(g):
    """A group's own box plus its child coordinate space."""
    pr=g.find(P+'grpSpPr')
    if pr is None: return None
    xf=pr.find(A+'xfrm')
    if xf is None: return None
    o=xf.find(A+'off'); e=xf.find(A+'ext')
    co=xf.find(A+'chOff'); ce=xf.find(A+'chExt')
    if o is None or e is None: return None
    ext=(int(e.get('cx')), int(e.get('cy')))
    chExt=(int(ce.get('cx')), int(ce.get('cy'))) if ce is not None else ext
    return {'off':(int(o.get('x')), int(o.get('y'))), 'ext':ext,
            'chOff':(int(co.get('x')), int(co.get('y'))) if co is not None else (0,0),
            'chExt':chExt}

def flatten(el, xform=None):
    """Yield leaf shapes with slide-absolute geometry.

    Groups are a coordinate space of their own: a child sits at chOff..chExt and
    the group maps that onto off..ext. Walking only the top level of spTree -- as
    this did originally -- silently dropped every grouped shape, which on the
    charts/graphs/boxes slides is most of the content (slide 101 has 12 groups).
    Nested groups compose, so the transform is carried down."""
    tag=el.tag
    if tag==P+'grpSp':
        g=_grp_xfrm(el)
        if g:
            gw,gh=g['ext']; cw,ch=g['chExt']
            sx=(gw/cw) if cw else 1.0
            sy=(gh/ch) if ch else 1.0
            inner={'sx':sx,'sy':sy,
                   'tx':g['off'][0]-g['chOff'][0]*sx,
                   'ty':g['off'][1]-g['chOff'][1]*sy}
            if xform:
                inner={'sx':inner['sx']*xform['sx'], 'sy':inner['sy']*xform['sy'],
                       'tx':xform['tx']+inner['tx']*xform['sx'],
                       'ty':xform['ty']+inner['ty']*xform['sy']}
        else:
            inner=xform
        for c in el:
            if c.tag in (P+'sp',P+'pic',P+'graphicFrame',P+'grpSp',P+'cxnSp'):
                for leaf in flatten(c, inner): yield leaf
        return
    yield (el, xform)

def index_shapes(part):
    """return {(type,idx): sp_element} plus ordered list"""
    x=ET.fromstring(z.read(part))
    tree=x.find(P+'cSld').find(P+'spTree')
    idx={}; order=[]
    for sp in tree:
        tag=sp.tag
        if tag not in (P+'sp',P+'pic',P+'graphicFrame',P+'grpSp',P+'cxnSp'): continue
        for leaf,xform in flatten(sp):
            order.append((leaf,xform))
            ph=ph_of(leaf)
            if ph and ph.get('idx') is not None: idx[ph['idx']]=leaf
            elif ph: idx['__'+ph['type']]=leaf
    bg=x.find(P+'cSld').find(P+'bg')
    return idx, order, bg

def bg_info(bg, part):
    if bg is None: return None
    xml=ET.tostring(bg).decode('utf8')
    if 'blipFill' in xml:
        m=re.search(r'embed="([^"]+)"',xml)
        tgt=None
        if m:
            rr=rels(part).get(m.group(1))
            if rr: tgt=rr[1].replace('../','ppt/')
        return {'kind':'picture','image':tgt}
    m=re.search(r'srgbClr val="([0-9A-Fa-f]{6})"',xml)
    if m: return {'kind':'solid','hex':'#'+m.group(1).upper()}
    if 'schemeClr' in xml:
        m2=re.search(r'schemeClr val="(\w+)"',xml)
        return {'kind':'scheme','val':m2.group(1) if m2 else '?'}
    return {'kind':'other'}

def pic_target(sp, part):
    bf=sp.find(P+'blipFill')
    if bf is None: return None
    b=bf.find(A+'blip')
    if b is None: return None
    rid=b.get(R+'embed')
    rr=rels(part).get(rid)
    return rr[1].replace('../','ppt/') if rr else None

def pic_effects(sp):
    """alphaModFix opacity and srcRect crop. 44% of the template's pictures are
    cropped and several are near-transparent watermarks -- ignoring either
    renders the wrong artwork at the wrong strength."""
    out={}
    bf=sp.find(P+'blipFill')
    if bf is None: return out
    b=bf.find(A+'blip')
    if b is not None:
        am=b.find(A+'alphaModFix')
        if am is not None and am.get('amt'):
            out['opacity_pct']=round(int(am.get('amt'))/1000.0,2)
    sr=bf.find(A+'srcRect')
    if sr is not None:
        c={k: round(int(sr.get(k,'0'))/1000.0,2) for k in ('l','t','r','b') if sr.get(k)}
        if c: out['crop_pct']=c
    return out

def custgeom_of(sp):
    """Custom-geometry outline as fractions of the shape box.

    The five divider layouts carry the angular MMW motion mark as a <a:custGeom>
    polygon, not a picture. Flattening it to its bounding rectangle (which is
    what happens if this is ignored) fills half the slide with a solid block.
    Only straight-segment paths are captured; a curved path is reported so the
    caller can fall back rather than silently emitting a wrong outline."""
    spPr=sp.find(P+'spPr')
    if spPr is None: return None
    cg=spPr.find(A+'custGeom')
    if cg is None: return None
    pl=cg.find(A+'pathLst')
    if pl is None: return None
    paths=pl.findall(A+'path')
    if len(paths)!=1: return {'unsupported':'multi-path'}
    path=paths[0]
    for seg in path:
        if seg.tag.split('}')[1] in ('cubicBezTo','quadBezTo','arcTo'):
            return {'unsupported':'curved'}
    pw=float(path.get('w') or 0); ph_=float(path.get('h') or 0)
    if not pw or not ph_: return {'unsupported':'no-path-extent'}
    pts=[]
    for seg in path:
        t=seg.tag.split('}')[1]
        if t in ('moveTo','lnTo'):
            p=seg.find(A+'pt')
            if p is None: continue
            pts.append([round(int(p.get('x'))/pw,5), round(int(p.get('y'))/ph_,5)])
    if len(pts)<3: return {'unsupported':'degenerate'}
    # A trailing vertex identical to the first is implied by the close.
    if len(pts)>3 and pts[0]==pts[-1]: pts.pop()
    return {'points':pts}

def describe(sp, part, layout_idx=None, layout_part=None, xform=None):
    tag=sp.tag.split('}')[1]
    ph=ph_of(sp)
    g=xfrm_of(sp, xform)
    inh_rpr={}; inh_ppr={}
    lsp=None
    if ph and layout_idx is not None:
        lsp=layout_idx.get(ph.get('idx')) or layout_idx.get('__'+ph.get('type',''))
        if lsp is not None:
            if g is None: g=xfrm_of(lsp)
            lr,lp=sp_lst_defrpr(lsp)
            inh_rpr=merge(inh_rpr,lr); inh_ppr=merge(inh_ppr,lp)
    if ph:
        key='title' if ph.get('type') in ('title','ctrTitle') else ('body' if ph.get('type') in ('body','subTitle') else 'other')
        inh_rpr=merge(inh_rpr, defrpr_of(TXSTYLES.get(key)))
        inh_ppr=merge(inh_ppr, ppr_props(TXSTYLES.get(key)))
    d={'kind':tag,'name':name_of(sp)}
    if ph: d['ph']=ph
    if g: d.update(g)
    f=fill_of(sp)
    if f: d['fill']=f
    elif lsp is not None:
        lf=fill_of(lsp)
        if lf: d['fill']=dict(lf, inherited=True)
    if tag in ('sp','pic'):
        cg=custgeom_of(sp)
        # On a picture the custom geometry is a MASK: the photo is clipped to the
        # angular MMW motif rather than sitting in a rectangle. Cover Photo2's two
        # demo slides both do this, and without it the well renders square.
        if cg: d['custgeom']=cg
    if tag=='pic':
        d['image']=pic_target(sp,part)
        d.update(pic_effects(sp))
    elif lsp is not None and lsp.tag.split('}')[1]=='pic':
        d.update(pic_effects(lsp))
    bp=bodypr(sp)
    if not bp and lsp is not None: bp=bodypr(lsp)
    if bp: d['body']=bp
    ps=paras_of(sp, inh_rpr, inh_ppr)
    if not ps and lsp is not None:
        ps=paras_of(lsp, inh_rpr, inh_ppr); 
        if ps: d['text_from_layout']=True
    if ps: d['paras']=ps
    if tag=='grpSp':
        d['children']=[describe(c,part,layout_idx,layout_part) for c in sp
                       if c.tag in (P+'sp',P+'pic',P+'graphicFrame',P+'grpSp',P+'cxnSp')]
    return d

out={'meta':{'native_w':NW,'native_h':NH,'scale':round(SCALE,4)},'layouts':{},'slides':{}}
usage=collections.defaultdict(list)
for sp_part, lp in slide_layout.items():
    usage[layout_name[lp]].append(int(re.search(r'slide(\d+)\.xml',sp_part).group(1)))

for lp,nm in layout_name.items():
    lidx,lorder,lbg=index_shapes(lp)
    out['layouts'][nm]={'part':lp,'bg':bg_info(lbg,lp),
        'used_by':sorted(usage.get(nm,[])),
        'shapes':[describe(e,lp,None,None,xf) for e,xf in lorder]}
for sp_part,lp in slide_layout.items():
    n=int(re.search(r'slide(\d+)\.xml',sp_part).group(1))
    lidx,lorder,lbg=index_shapes(lp)
    sidx,sorder,sbg=index_shapes(sp_part)
    out['slides'][n]={'layout':layout_name[lp],
        'bg':bg_info(sbg,sp_part) or bg_info(lbg,lp),
        'shapes':[describe(e,sp_part,lidx,lp,xf) for e,xf in sorder]}
json.dump(out,open(W('resolved.json'),'w'),indent=1)
print("scale",round(SCALE,4),"layouts",len(out['layouts']),"slides",len(out['slides']))
