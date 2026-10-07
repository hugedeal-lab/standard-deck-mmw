"""Extract one top-level shape group from a template slide as a standalone SVG.

Used to build assets/maps/ from the template's map slide (7/30/26 slide 114,
ppt/slides/slide114.xml in the unzipped .pptx). Groups on that slide:
  0 globe (Atlantic)   1 globe (Americas)   4 globe (Europe/Africa)
  2 globe (Asia-Pacific)   5 dotted world map   6 solid world map
DrawingML custom geometry (moveTo/lnTo/cubicBezTo/quadBezTo/close), ellipse
and rect presets are drawn; colours can be remapped for light-slide variants.

  python3 tools/extract_map_group.py slide114.xml <group-index> out.svg '{"808080":"CCCCCC"}'

assets/maps/*.png were rasterised from these SVGs with headless Chrome on a
transparent background (--default-background-color=00000000): world maps at
2400px wide, globes at 800px. Dark = template colours; light = solid land
#CCCCCC, globe ocean #FFFFFF; the dot map (Spark tan) serves both.
"""
import sys, json, xml.etree.ElementTree as ET
P='{http://schemas.openxmlformats.org/presentationml/2006/main}'; A='{http://schemas.openxmlformats.org/drawingml/2006/main}'
src, idx, out, remap = sys.argv[1], int(sys.argv[2]), sys.argv[3], json.loads(sys.argv[4])
t=ET.parse(src).getroot().find(P+'cSld/'+P+'spTree')
groups=[c for c in t if c.tag==P+'grpSp']
g=groups[idx]
x=g.find(P+'grpSpPr/'+A+'xfrm'); o=x.find(A+'off'); e=x.find(A+'ext')
GX,GY,GW,GH=int(o.get('x')),int(o.get('y')),int(e.get('cx')),int(e.get('cy'))
svg=[]
def col(v): v=v.upper(); return '#'+remap.get(v,v)
def fillOf(sp):
    pr=sp.find(P+'spPr')
    if pr is None or pr.find(A+'noFill') is not None: return 'none'
    c=pr.find(A+'solidFill/'+A+'srgbClr'); return col(c.get('val')) if c is not None else 'none'
def strokeOf(sp):
    ln=sp.find(P+'spPr/'+A+'ln')
    if ln is None or ln.find(A+'noFill') is not None: return 'none',0
    c=ln.find(A+'solidFill/'+A+'srgbClr'); return (col(c.get('val')) if c is not None else 'none'), int(ln.get('w') or 12700)
def walk(node, tf):
    for c in node:
        tag=c.tag.split('}')[1]
        if tag=='grpSp':
            xx=c.find(P+'grpSpPr/'+A+'xfrm'); oo,ee,co,ce=[xx.find(A+k) for k in ('off','ext','chOff','chExt')]
            sx=int(ee.get('cx'))/max(1,int(ce.get('cx'))); sy=int(ee.get('cy'))/max(1,int(ce.get('cy')))
            ox=int(oo.get('x'))-int(co.get('x'))*sx; oy=int(oo.get('y'))-int(co.get('y'))*sy
            a,b,cc,d=tf; walk(c,(a*sx,b*sy,a*ox+cc,b*oy+d))
        elif tag=='sp':
            xx=c.find(P+'spPr/'+A+'xfrm')
            if xx is None: continue
            oo=xx.find(A+'off'); ee=xx.find(A+'ext'); X,Y,CW,CH=int(oo.get('x')),int(oo.get('y')),int(ee.get('cx')),int(ee.get('cy'))
            a,b,cc,d=tf; fill=fillOf(c); st,sw=strokeOf(c)
            cg=c.find('.//'+A+'custGeom'); pg=c.find('.//'+A+'prstGeom')
            if cg is None:
                if pg is not None and pg.get('prst')=='ellipse':
                    svg.append(f'<ellipse cx="{a*(X+CW/2)+cc}" cy="{b*(Y+CH/2)+d}" rx="{a*CW/2}" ry="{b*CH/2}" fill="{fill}" stroke="{st}" stroke-width="{sw*a}"/>')
                else:
                    svg.append(f'<rect x="{a*X+cc}" y="{b*Y+d}" width="{a*CW}" height="{b*CH}" fill="{fill}" stroke="{st}" stroke-width="{sw*a}"/>')
                continue
            dd=''
            for pth in cg.iter(A+'path'):
                pw=int(pth.get('w') or CW) or 1; ph=int(pth.get('h') or CH) or 1
                def pt(p): return f"{a*(X+int(p.get('x'))*CW/pw)+cc:.0f},{b*(Y+int(p.get('y'))*CH/ph)+d:.0f}"
                for s in pth:
                    k=s.tag.split('}')[1]; ps=s.findall(A+'pt')
                    if k=='moveTo': dd+='M'+pt(ps[0])
                    elif k=='lnTo': dd+='L'+pt(ps[0])
                    elif k=='cubicBezTo': dd+='C'+' '.join(pt(q) for q in ps)
                    elif k=='quadBezTo': dd+='Q'+' '.join(pt(q) for q in ps)
                    elif k=='close': dd+='Z'
            svg.append(f'<path d="{dd}" fill="{fill}" fill-rule="evenodd" stroke="{st}" stroke-width="{sw*a}"/>')
walk([g],(1,1,0,0))   # include g itself so its own chOff/chExt transform applies
pad=int(max(GW,GH)*0.01)
open(out,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{GX-pad} {GY-pad} {GW+2*pad} {GH+2*pad}">'+''.join(svg)+'</svg>')
print(idx, 'elements', len(svg), 'size_in %.2fx%.2f'%(GW/914400/2.0005, GH/914400/2.0005), 'colors', sorted(set(__import__('re').findall(r'#[0-9A-F]{6}',''.join(svg)))))
