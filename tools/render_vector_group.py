#!/usr/bin/env python3
"""Rasterise a DrawingML shape group into a transparent PNG.

Some of the template's artwork is not an embedded image: it is dozens of
custom-geometry vector shapes, usually a Keynote export that flattened a
drawing into bezier outlines. Slide 72's campaign-progress timeline is 36 such
shapes inside one group, so there is no media part to extract -- the graphic has
to be redrawn from its path data.

Curves are flattened to line segments and filled with PIL, supersampled and then
downscaled so the edges stay clean. Output keeps alpha, so the asset drops onto
any ground without a matte.
"""
import zipfile, sys, os, math
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
P = '{http://schemas.openxmlformats.org/presentationml/2006/main}'
EMU = 914400.0
SS = 4                      # supersample factor
FLATTEN = 12                # segments per bezier

def bezier3(p0, p1, p2, p3, n=FLATTEN):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]))
    return out

def bezier2(p0, p1, p2, n=FLATTEN):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*p0[0] + 2*u*t*p1[0] + t*t*p2[0],
                    u*u*p0[1] + 2*u*t*p1[1] + t*t*p2[1]))
    return out

def pt(el):
    return (float(el.get('x')), float(el.get('y')))

def paths_of(sp):
    """Every subpath of a shape, as polygons in 0..1 of the shape box."""
    spPr = sp.find(P + 'spPr')
    if spPr is None: return []
    cg = spPr.find(A + 'custGeom')
    if cg is None: return []
    pl = cg.find(A + 'pathLst')
    if pl is None: return []
    polys = []
    for path in pl.findall(A + 'path'):
        pw = float(path.get('w') or 0); ph = float(path.get('h') or 0)
        if not pw or not ph: continue
        cur = []; start = None; last = None
        for seg in path:
            t = seg.tag.split('}')[1]
            if t == 'moveTo':
                if len(cur) > 2: polys.append((cur, pw, ph))
                last = pt(seg.find(A + 'pt')); start = last; cur = [last]
            elif t == 'lnTo':
                last = pt(seg.find(A + 'pt')); cur.append(last)
            elif t == 'cubicBezTo':
                ps = [pt(p) for p in seg.findall(A + 'pt')]
                if len(ps) == 3 and last:
                    cur += bezier3(last, ps[0], ps[1], ps[2]); last = ps[2]
            elif t == 'quadBezTo':
                ps = [pt(p) for p in seg.findall(A + 'pt')]
                if len(ps) == 2 and last:
                    cur += bezier2(last, ps[0], ps[1]); last = ps[1]
            elif t == 'close':
                if start: cur.append(start)
                if len(cur) > 2: polys.append((cur, pw, ph))
                cur = [start] if start else []; last = start
        if len(cur) > 2: polys.append((cur, pw, ph))
    return polys

def _rgba(node):
    c = node.find(A + 'srgbClr')
    if c is None: return None
    rgb = c.get('val'); alpha = 255
    al = c.find(A + 'alpha')
    if al is not None: alpha = int(round(int(al.get('val')) / 100000.0 * 255))
    return (int(rgb[0:2], 16), int(rgb[2:4], 16), int(rgb[4:6], 16), alpha)

def paint(sp):
    """(fill, stroke, stroke width in EMU). This artwork is mostly STROKED --
    <a:noFill/> with a coloured <a:ln> -- so filling the paths would render a
    solid slab where the drawing is really a set of thin lines."""
    spPr = sp.find(P + 'spPr')
    if spPr is None: return None, None, 0
    fill = None
    sf = spPr.find(A + 'solidFill')
    if sf is not None: fill = _rgba(sf)
    stroke = None; wid = 0
    ln = spPr.find(A + 'ln')
    if ln is not None:
        lf = ln.find(A + 'solidFill')
        if lf is not None: stroke = _rgba(lf)
        if ln.get('w'): wid = int(ln.get('w'))
        if ln.find(A + 'noFill') is not None: stroke = None
    return fill, stroke, wid

def xf(el, prop_tag):
    pr = el.find(prop_tag)
    if pr is None: return None
    x = pr.find(A + 'xfrm')
    if x is None: return None
    o = x.find(A + 'off'); e = x.find(A + 'ext')
    if o is None or e is None: return None
    d = {'off': (int(o.get('x')), int(o.get('y'))),
         'ext': (int(e.get('cx')), int(e.get('cy')))}
    co = x.find(A + 'chOff'); ce = x.find(A + 'chExt')
    d['chOff'] = (int(co.get('x')), int(co.get('y'))) if co is not None else (0, 0)
    d['chExt'] = (int(ce.get('cx')), int(ce.get('cy'))) if ce is not None else d['ext']
    return d

def render(pptx, slide_no, out_png, dpi=200):
    z = zipfile.ZipFile(pptx)
    root = ET.fromstring(z.read(f'ppt/slides/slide{slide_no}.xml'))
    tree = root.find(P + 'cSld').find(P + 'spTree')
    grp = next((c for c in tree if c.tag == P + 'grpSp'), None)
    if grp is None:
        print('no group on that slide'); return None
    g = xf(grp, P + 'grpSpPr')
    gw, gh = g['ext']; cw, ch = g['chExt']
    sx = gw / cw if cw else 1.0
    sy = gh / ch if ch else 1.0

    # engine inches = template inches / 2 (canvas is 2.0005x the engine's)
    win = gw / EMU / 2.0; hin = gh / EMU / 2.0
    W = max(1, int(win * dpi)); H = max(1, int(hin * dpi))
    img = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    drawn = 0
    for sp in grp:
        if sp.tag != P + 'sp': continue
        s = xf(sp, P + 'spPr')
        if not s: continue
        fill, stroke, lw = paint(sp)
        if not fill and not stroke: continue
        ox = (s['off'][0] - g['chOff'][0]) * sx
        oy = (s['off'][1] - g['chOff'][1]) * sy
        ew = s['ext'][0] * sx; eh = s['ext'][1] * sy
        for poly, pw, ph in paths_of(sp):
            px = [((ox + (x / pw) * ew) / gw * W * SS,
                   (oy + (y / ph) * eh) / gh * H * SS) for x, y in poly]
            if len(px) < 3: continue
            layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            if fill: d.polygon(px, fill=fill)
            if stroke:
                wpx = max(1, int(round(lw / gw * W * SS)))
                d.line(px, fill=stroke, width=wpx, joint='curve')
            img = Image.alpha_composite(img, layer)
            drawn += 1
    img = img.resize((W, H), Image.LANCZOS)
    img.save(out_png, 'PNG', optimize=True)
    print(f'{out_png}: {W}x{H}px  {win:.3f}x{hin:.3f}in  '
          f'{drawn} filled paths  {os.path.getsize(out_png)/1024:.0f} KB')
    return {'x': round(g['off'][0] / EMU / 2, 3), 'y': round(g['off'][1] / EMU / 2, 3),
            'w': round(win, 3), 'h': round(hin, 3)}

if __name__ == '__main__':
    pptx = os.environ.get('MMW_TEMPLATE',
        '/mnt/workspace/input/MMW PPT Template_7.24.26.pptx')
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 72
    out = sys.argv[2] if len(sys.argv) > 2 else f'/tmp/slide{n}_group.png'
    box = render(pptx, n, out)
    if box: print('engine placement:', box)
