#!/usr/bin/env python3
"""Regenerate SLIDE_INDEX.md: every slide of the template -> its layout master ->
the engine name that reproduces it.

Template layout names resolve through the engine's own tables
(DeckLayouts.TEMPLATE_NAMES / RETIRED_TEMPLATE_NAMES, read from
deck-layouts.js via node), so the index can't drift from the code. Slides that
are a specific composition on a shared master (the report family, the chart
and table wells, the Resources section) are mapped in SLIDE_OVERRIDES below --
update that table when a new composition is added.

Usage:  python3 tools/build_slide_index.py "<path to template>.pptx" [display name]
"""
import html, json, os, re, subprocess, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# slide -> (engine name, note). Overrides the master-name lookup.
SLIDE_OVERRIDES = {
    31: ('statementSubhead', 'second design carried by "1_Content -headline photo copy" (split)'),
    72: ('reportGrayTimeline', 'campaign-progress flow art'),
    73: ('reportSplitPanels', 'composition on Content Gray'),
    74: ('reportStatRow', 'composition on Blank Dark'),
    75: ('reportStatRowLight', 'composition on Blank Dark (own #EEEEEE background)'),
    76: ('reportGrayTable', '2-column table'),
    77: ('reportDarkTable', '2-column table'),
    78: ('reportChannelMatrix', 'composition on Content Gray'),
    79: ('reportDarkChart', "chart type 'line'"),
    80: ('reportDarkChart', "chart type 'bar'"),
    81: ('reportDarkChart', "chart type 'bar' (6 series, legend)"),
    82: ('reportDarkChart', "chart type 'doughnut'"),
    83: ('reportGrayChart', "chart type 'line'"),
    84: ('reportGrayChart', "chart type 'bar'"),
    85: ('reportGrayChart', "chart type 'bar' (6 series, legend)"),
    86: ('reportSpendBarsLight', 'composition on Content Gray'),
    87: ('reportSpendBarsDark', 'composition on Content Dark'),
    88: ('reportGrayChart', "chart type 'doughnut'"),
    89: ('reportModelCompare', 'composition on Blank Dark'),
    90: ('reportBrandPillars', 'composition on Blank Dark'),
    91: ('reportPlatformMatrix', 'composition on Title & Bullets'),
    92: ('reportEcosystemTree', 'composition on Blank Grey'),
    93: ('reportGrayChart', "chart type 'column' (Content Dark master, slide overrides background to #EEEEEE)"),
    94: ('reportDarkChart', "chart type 'column' (5 series)"),
    95: ('reportMetricTable', 'composition on Blank Dark'),
    96: ('reportQuotePanel', 'composition on Blank Grey'),
    97: ('reportChapterOpener', 'composition on Content Gray'),
    98: ('reportStrategyStack', 'composition on Content Gray'),
    99: ('reportJourneyMap', 'composition on Blank Light'),
    100: ('reportGateStatus', 'composition on Blank Light'),
    101: ('reportNumberedSteps', 'composition on Content Gray'),
    104: ('—', 'Resources: social platform icon sheet (not a layout)'),
    105: ('—', "Resources: market-analysis icon sheet -- ships as mmw-* icons (type:'i')"),
    106: ('—', "Resources: chart icon sheet -- ships as mmw-* icons (type:'i')"),
    108: ('—', 'Resources: ecosystem-diagram cheat sheet -- use reportEcosystemTree / reportPlatformMatrix'),
    110: ('canvasDark', 'blank canvas'),
    111: ('canvasGrey', 'blank canvas'),
    112: ('canvasLight', 'blank canvas'),
    114: ('mapWorld', 'Resources: map graphics -- decorative maps/globes as mapWorld; place-level maps as mapUS'),
}

def engine_tables():
    js = ("global.window={StandardDeck:{SD_CONST:{}}};require(%s);require(%s);require(%s);"
          "const D=window.DeckLayouts;process.stdout.write(JSON.stringify("
          "{t:D.TEMPLATE_NAMES,r:D.RETIRED_TEMPLATE_NAMES||{},m:Object.keys(D.LAYOUT_MAP)}))"
          % tuple(json.dumps(os.path.join(ROOT, f)) for f in ('deck-layouts.js', 'map-data.js', 'deck-maps.js')))
    return json.loads(subprocess.check_output(['node', '-e', js]))

def main(pptx, display=None):
    z = zipfile.ZipFile(pptx)
    rels = z.read('ppt/_rels/presentation.xml.rels').decode()
    rid2file = {}
    for t in re.findall(r'<Relationship [^>]*>', rels):
        i = re.search(r'Id="(rId\d+)"', t); g = re.search(r'Target="slides/(slide\d+\.xml)"', t)
        if i and g: rid2file[i.group(1)] = g.group(1)
    order = re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', z.read('ppt/presentation.xml').decode())
    E = engine_tables()
    rows, unmapped = [], []
    for n, rid in enumerate(order, 1):
        f = rid2file[rid]
        srel = z.read('ppt/slides/_rels/%s.rels' % f).decode()
        lay = re.search(r'Target="\.\./slideLayouts/(slideLayout\d+\.xml)"', srel).group(1)
        name = html.unescape(re.search(r'<p:cSld name="([^"]*)"', z.read('ppt/slideLayouts/' + lay).decode()).group(1))
        if n in SLIDE_OVERRIDES:
            eng, note = SLIDE_OVERRIDES[n]
        elif name in E['t']:
            eng, note = E['t'][name], ''
        elif name in E['r']:
            eng, note = E['r'][name], 'template name retired -> resolves here'
        else:
            eng, note = '?', 'NO MAPPING'; unmapped.append((n, name))
        if eng not in ('—', '?') and eng not in E['m']:
            sys.exit('slide %d maps to %r, which is not a registered layout' % (n, eng))
        rows.append((n, name, eng, note))
    if unmapped: sys.exit('unmapped slides: %s' % unmapped)

    out = ['# MMW template — slide → layout cross-reference', '',
           'Every slide of `%s`, the layout master it uses, and the engine name that' % (display or os.path.basename(pptx)),
           'reproduces it. Generated by `tools/build_slide_index.py` -- master names resolve',
           "through deck-layouts.js's own `TEMPLATE_NAMES` / `RETIRED_TEMPLATE_NAMES`; slides that",
           'are a specific composition on a shared master are mapped in the script.', '',
           'Slides 102–115 are the template\'s **Resources** section (navigation, icons, graph',
           'builder, blank slides, maps): reference material for deck builders, mapped here to',
           'the engine equivalent where one exists.', '',
           '| Slide | Template layout | Engine name | Note |', '|---|---|---|---|']
    for n, name, eng, note in rows:
        disp = name.replace('|', '\\|') + (' *(trailing space)*' if name != name.strip() else '')
        out.append('| %d | %s | %s | %s |' % (n, disp, ('`%s`' % eng) if eng != '—' else '—', note))
    used = sorted({r[2] for r in rows if r[2] != '—'})
    never = sorted(set(E['m']) - set(used))
    out += ['', '**Engine layouts with no slide of their own** (capabilities rather than template slides): ' +
            ', '.join('`%s`' % x for x in never) + '.', '']
    open(os.path.join(ROOT, 'SLIDE_INDEX.md'), 'w').write('\n'.join(out))
    print('wrote SLIDE_INDEX.md: %d slides, %d engine layouts referenced' % (len(rows), len(used)))

if __name__ == '__main__':
    if len(sys.argv) not in (2, 3): sys.exit(__doc__)
    main(*sys.argv[1:])
