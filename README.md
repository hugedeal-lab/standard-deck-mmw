# MMW Presentation Builder v2.0 — implementation bundle

Rebuilt from `MMW PPT Template_7.24.26.pptx`. **66 layouts** (v1.0 had 22), corrected type scale, and the full brand asset set extracted from the template's embedded media.

## What's here

| File | What it is |
|---|---|
| `deck-layouts.js` | **Rebuilt.** 66 layout functions, corrected type scale, template-correct names, legacy aliases. |
| `standard-deck.js` | **Patched** — 6 targeted edits (below). |
| `deck-shell.js` | **Patched** — 1 edit (exposes the image cache to the preview). |
| `deck-icons.js` | **Unchanged**, included so the bundle is complete. |
| `mmw_presentation_builder_prompt.txt` | **Rewritten** system prompt, v2.0. |
| `test-deck.html` | Test harness — one slide per layout, all 66. |
| `mmw_layouts.json` | Machine-readable spec (733 elements). The fixture for regression tests. |
| `MMW_Layout_Spec.md` | Full human-readable specification. |
| `assets/` | 28 brand assets extracted from the template. |

## Start here

1. Drop the four JS files, `test-deck.html` and `assets/` into one folder.
2. Open `test-deck.html` in a browser. You should get 66 slides.
3. Watch the console. `[deck-layouts]` errors mean a layout name failed to resolve — **an unresolved name renders an empty slide, and the console is the only signal.**
4. Export to PPTX from the shell UI and compare against the source template.

The harness is deliberately a smoke test, not a design review — it feeds every layout the same generic content so you can see structure, spacing and type scale at a glance.

## The two breaking changes

**1. Type scale.** The template canvas is 26.667×15in, 2.0005× the engine's 13.33×7.5in. v1.0 halved every coordinate but carried font sizes across unscaled, so all type rendered 2× too large — 15 of 24 measured text boxes overflowed their containers. Cover title is **54.5pt**, not 109pt. Headline is **140pt**, not 280pt.

**2. Layout names** now follow the template's own slide-layout names. v1.0's names were invented and had drifted.

`LEGACY_ALIASES` keeps most v1.0 deck data working with a console warning. **Two names are ambiguous** and log an error, because they exist in both versions meaning different layouts:

| v1.0 name | meant | v2.0 same name means | re-key to |
|---|---|---|---|
| `content03` | Content 01 | Content 03 | `content01` |
| `content05` | Content 03 | Content 05 | `content03` |

These render the **v2.0** meaning. Any v1.0 deck using them must be re-keyed.

## Engine patches

### `standard-deck.js`

| # | Change | Why |
|---|---|---|
| 1 | **PALETTE** gains 13 MMW tokens (`asphalt`, `paper`, `accentDim`, `titleGray`, `bodyGray`, `captionGray`, `mutedGray`, `lt2`, `dividerLight`, `paperHi`, `nearBlack`, `cardSand`, `ink`) | The template's real colours had no tokens. **Note:** `resolveColor()` checks its `semantics` map before `PALETTE`, and `semantics.white`/`.black` are `#FFFFFF`/`#000000`. Use `paper`/`asphalt` for MMW Paper and Asphalt. |
| 2 | `ACCENT_FAMILIES.spark.mid` → `#C4A584` | Template-confirmed (19 occurrences). `brand.json` says `#C4A484`, which appears nowhere in the template. One-line revert if brand declares otherwise. |
| 3 | `MIN_SIZES.footnote` 7 → **6** | MMW grid captions are 6.5pt and were being floored up. |
| 4 | Coordinate clamping is now **opt-in** (`_clampToSafe:true`) | `validateElement` forced `x<0.50→0.50` and `y<0.75→0.75`. ~41% of the template's content slides bleed past the safe area by design, and several photo wells sit at negative coordinates. Clamping silently destroyed them. Only affected the raw `els` path, so layout shortcuts were already safe — but full-bleed hand-built compositions were impossible. |
| 5 | `enforceWidthRule` skips `_imgPlaceholder` shapes and honours `_noWidthRule` | This rule **does** run on layout output. Any text inside a shape was capped to 80% of it and re-centred. Photo wells are picture frames, not text containers. |
| 6 | HTML preview honours `bgColor` and `bgImage` | `bgColor` already worked on export but the preview ignored it, so solid-background layouts previewed wrong. |
| 7 | **Explicit typography** — `caps`, `lineSpacing` and `charSpacing` are now honoured in both preview and export | The biggest one. `getTextStyle()` *guessed* casing, tracking and line-height from size and colour, then overrode whatever the layout specified. Detail below. |

### Patch 7 in detail — why it mattered

`getTextStyle()` classifies every text element into a preset (L1–L5) from its size, colour and font, and the preset then dictates casing and letter-spacing. Two consequences against this template:

- **`size <= 10 || color === 'muted'` → L5 → UPPERCASE.** The template has 191 elements at ≤10pt, of which only 30 are genuinely all-caps. **161 body and caption elements would have rendered in capitals.**
- **Line-height was hardcoded to 1.35** for every non-compact text element, in both preview and export. The template runs 1.0 almost everywhere, with deliberate 0.7–1.2 exceptions. Every multi-line block would have been 35% too tall — which is exactly what the copy-fit figures in the spec are calculated against.

v2.0 layouts now emit `caps` on **every** text element. Its presence is the signal that typography is fully specified, so the engine skips the heuristic entirely and uses the template's real values. Elements *without* `caps` — legacy raw `els` compositions — keep the old behaviour, so nothing else changes.

Verified: geometry-matched across 63 layouts, **0 casing and 0 line-spacing mismatches** against the template.

| 8 | **Font faces** — `FONT_MAP` gains `HR`, and the PPTX export selects a face from `el.font` | v1.0 passed the CSS stack `'Mazda Type, Arial, sans-serif'` as PptxGenJS `fontFace` for *every* element. PowerPoint's `fontFace` takes **one** typeface name, so that string was written verbatim and never resolved. It also meant `font:'H'` vs `'B'` was discarded on export. The template uses three faces — **Mazda Type Bold** (display), **Mazda Type** (lighter display), **Arial** (body / theme minorFont). 360 of 413 text elements are body-face; all were previewing in the display face. |

### `deck-shell.js`
Exposes `_imageCache` on `window.StandardShell` so the preview can paint `bgImage` from the same prefetched data the export uses.

| 9 | **Image pipeline repaired** — `renderImage` resolves refs, `exportImage` rewritten, prefetch is data-driven | Backgrounds and brand marks rendered nowhere. Three linked failures, all inherited from v1.0. Detail below. |
| 10 | **Export library vendored locally** — `vendor/pptxgen.bundle.js`, inlined in the standalone build | The harness loaded PptxGenJS from jsdelivr. As a *blocking* tag ahead of the local files that produced fully blank slides on a network that blocks the CDN; moving it to `async` fixed rendering but left the export button waiting on a library that was never going to arrive. The standalone build had no copy at all. Now served from `vendor/` and inlined in the standalone — no CDN in the render *or* export path. |
| 11 | **Kerning forced on** — export repacks the .pptx and rewrites `kern="0"` to `kern="100"` | PptxGenJS hardcodes `kern="0"` on every run, switching PowerPoint kerning **off**, against the MMW spec of kerning at 1pt and above. There is no API for it. The export now writes to a blob, patches every `ppt/slides/slideN.xml`, and repacks. JSZip ships inside `pptxgen.bundle.js`, so this adds no dependency; if JSZip is absent the export falls back to the unpatched download rather than failing. |
| 12 | Export failure is reported honestly | The missing-library branch showed "Export library loading…" — implying progress where there was no loader, no timeout and no failure path. It now names the real cause and points at the standalone build. |
| 13 | **Export is environment-portable** — `arraybuffer` replaces `blob` on both hand-offs | The kerning repack passed a Blob to `JSZip.loadAsync()`. JSZip only accepts a Blob when its feature detection reports a browser, so outside one it threw *"Can't read the data of 'the loaded zip file'"* and the download silently produced nothing. ArrayBuffer is understood everywhere, costs nothing, and makes the exporter testable headlessly. |
| 14 | **Custom geometry** — `points` on a shape render as a real polygon in both preview and export | The five divider layouts carry the angular MMW motion mark as an `<a:custGeom>` polygon, not a picture. The pipeline captured only its bounding box, so it flattened to a rectangle: on `dividerLight` a solid `#EEEEEE` block over the right half of the slide, and on the four mood dividers the same block at 2.7% opacity. Stage 1 now extracts the outline as fractions of the shape box (so it survives any rescale), the preview clips with `clip-path: polygon(...)`, and the export emits `CUSTOM_GEOMETRY` — an editable PowerPoint shape, not a picture of one. Curved paths are detected and recorded as `geom_note` rather than silently emitted wrong; all five divider marks are straight-segment. |
| 15 | **Photo masks** — a well can clip its image to a custom outline | `Cover Photo2` cuts its photo into the angular MMW motif; both demo slides (10 and 11) do it, and the well was rendering square. Masks live on the *slide's* picture, not the layout placeholder, so extraction now reads `custGeom` from `<p:pic>` as well as `<p:sp>`. Preview clips with `clip-path`; export has no API for it (PptxGenJS only ever writes `prstGeom` rect/ellipse for pictures), so the picture is stamped with a build-time `objectName` and the repack step swaps in the real `<a:custGeom>` — then strips the tag, so no internal marker reaches the file. An **empty** well carries the outline too, so the slot the user right-clicks is the shape the photo will take. |
| 16 | **`headlinePhoto` retired** — the name now renders `headlinePhotoWell` | "Headline Photo Divider" (slide 41) and "1_Content -headline photo copy" (slide 34) are the same composition: identical tag box at `2.92, 2.42`, identical 140pt title box at `0.12, 2.84`. The difference is the title face. Slide 41's layout asks for `latin="Mazda Type"` with `b="1"` — **faux bold**, the app smearing the regular weight. Slide 34 uses `+mj-lt`, the theme major font, which resolves to the real **Mazda Type Bold**. Slide 34 also takes its photo as a replaceable well rather than a fixed slide background. `headlinePhotoWell` wins on both counts. The retired name is aliased, not deleted — existing decks keep rendering and get the better layout, with a console note explaining why. A new `RETIRED` map carries this (kept separate from `LEGACY_ALIASES`, which is specifically for v1.0 names, so the message stays accurate). |
| 17 | **Crop export fixed** — `srcRect` was being written with negative values | PptxGenJS's crop model is *"place the image at `w`/`h`, then keep the box at `x`/`y`/`w`/`h`"*, and it derives `r`/`b` as `imageSize - box`. We were passing the frame size for both, so `r` came out as `-x` — a negative `srcRect`, which is outside the schema's range and which PowerPoint renders as a visibly-outlined, wrongly-scaled picture. It also silently resizes the picture to the crop box, so the artwork landed too small. Fixed by passing the **full** image size as `w`/`h` (frame divided by the kept fraction) and the kept region as the box. Exported values now match the template to rounding — e.g. Thank You: `l=18380 t=9040 r=2730 b=35360` against the template's `18382 / 9040 / 2731 / 35358`, at the correct 13.34×7.50in. **7 pictures across 7 slides were affected** (13, 18, 19, 20, 51, 62, 64). The HTML preview was always correct; this was export-only. |
| 18 | **Bold was never emitted** — `bold` now carries through from the template | The spec captured `bold` correctly, but stage 3 never wrote it into the layout functions, so **182 bold elements across the template rendered at regular weight** — every 35pt section title among them. The engine already supported `el.bold` on both paths; nothing was reaching it. Emitted now for every bold run **except** where the face is already `H` (Mazda Type Bold), since asking for bold on top of a bold face double-applies — a real bold face plus a synthetic smear. |
| 19 | **Two-row layouts re-pinned off the template's instruction pages** | The spec takes each layout's *modal* slide instance as its example. But the template opens with three instructional pages — slide 2 "HOW TO USE THIS MAZDA DECK TEMPLATE", slide 3 "INSTALLING MAZDA FONT", slide 4 "BRAND ASSETS" — and two of those were the pinned example for a two-row layout, so `twoRowsDark` and `twoRowsLight` inherited a one-off instructional composition (approved-colour swatches, copy-and-paste logo boxes, a full alphabet specimen). The **layouts are legitimate**: slides 26 and 28 are their clean Lorem-ipsum versions, so both are now pinned there via `PIN_INSTANCE`. Nothing was removed. |
| 20 | **Three-column stack snapped to one grid** (`COLUMN_SNAP`) | The columns did not start on a common line, from **two different causes**. *Dark*: slide 29 carries hand-edited boxes for columns 2 and 3 (`y=3.202`, `h=0.536`, top-anchored) but leaves column 1 inheriting the layout (`y=3.049`, `h=0.689`, **bottom**-anchored) — its single line rendered 0.223in low. *Light*: all three boxes agree, but they are bottom-anchored, so the moment one column wraps to two lines its first line starts 0.181in above the single-line ones. Both now snap to one top-anchored box. Two further drifts had to go with it, or fixing the first just exposed the next: the dark subheads mixed left insets of 0.104 and 0.028 (0.076in of vertical offset on its own, and — once normalised — 0.10in of **horizontal** offset between a subhead and the copy beneath it in columns 2 and 3); and the body boxes sit ~0.024in left of the subheads even in the layout itself. The snap now covers the whole column stack, so title, subhead and body share one left edge per column (`1.004 / 5.124 / 9.184`) and one top per row. |
| 21 | **Two-row dark takes its geometry from the layout** (`GEOMETRY_FROM_LAYOUT`) | `Content 2 Rows - Dark` and `Content 2 Rows - Light` are **identical in the template** — same boxes, same anchors, same insets. But the dark one's pinned demo slide (26) hand-edits three of its boxes away from that shared design: body wells shortened to `h=0.912` from `1.064`, the second-row subhead moved to `y=3.991 h=0.293` from `y=3.838 h=0.445`, and left inset dropped to `0.028` from `0.104`. Slide 28 keeps the layout's values, so the dark variant drifted from its own light twin. Geometry for this layout now comes from the **layout**, joined on placeholder `idx`, while text still comes from the pinned slide. All three two-row layouts now export byte-identical geometry. |
| 22 | **Report canvases split into chassis + variants** | `Content Gray` backs **13** slides and `Content Dark` **8**, and neither is one composition: the layout defines only a chassis (eyebrow / title / intro) and each slide draws its own body. Pinning one slide handed `reportGray` slide 72's campaign timeline — nine item slots at hardcoded coordinates that mean nothing on a chart slide. The base layouts are now the chassis alone, with the recurring compositions as named siblings. Layout count 66 → **71**. |
| 23 | **Charts are transparent, and the series palette is the template's** | The exporter hardcoded `chartArea:{fill:{color:'FFFFFF'}}` and the preview drew a `cardBg` card with a border — a bright white slab on the gray canvas. The template's own charts are `<a:noFill/>`: the slide ground shows through, and **no chart slide overrides its background** (they all inherit `#EEEEEE` or `#262626`), so transparency is what makes them sit right. Both renderers now leave the chart area unfilled; pass `chart.opts.chartArea` to opt back into a panel. Separately, all five series colours were transcribed-by-eye near-misses of the template's real values — `#C4A484` for `#C4A485`, `#7CACC1` for `#7CA8C1`, `#43644B` for `#4A634D`, `#B3BCB5` for `#B3BDB6` — now read off the template's 10 chart parts and ordered brand-forward. |
| 24 | **Grouped shapes were being dropped entirely** | Extraction walked only the top level of `spTree`, so every shape inside a `<p:grpSp>` was lost. A group is its own coordinate space — children sit in `chOff..chExt` and the group maps that onto `off..ext` — so recovering them means composing that transform down through nesting. This was invisible until the charts/graphs/boxes slides, where most content *is* grouped: slide 101 has 12 groups, slide 100 has 11. Recovering it moved `Blank Dark` from 11 elements to 26, `Title & Bullets` 31 → 40, `Content Gray` → 53. Every layout in the bundle benefits. |
| 25 | **A layout per composition for the charts/graphs/boxes section** | Source slides 71–101 (headed by the `CHARTS / GRAPHS / BOXES` divider on 71) are **31 slides sharing 8 chassis layouts** — so a chassis represented none of them. Each distinct composition now has its own layout specced from its own slide. 74/75 and 93/94 are true duplicates (identical geometry *and* text), so neither needs a second. Layout count 71 → **86**. |
| 26 | **Rounded shapes and arrow connectors** — `radius` on a shape, new `ln` element | The template draws its progress bars as `roundRect` with `adj=50000` (a full pill) and its milestone connectors as 3pt lines with `headEnd` **and** `tailEnd` triangles. The engine had neither, so bars came out square-cornered and connectors were thin filled rectangles with no heads. `radius:'pill'` rounds the short axis fully and exports as `ROUNDED_RECTANGLE`, reproducing `adj=50000` exactly; `type:'ln'` carries `weight` and `arrows:'both'`, rendering as SVG in preview and a real `LINE` on export. |
| 27 | **`reportSplitPanels` hand-authored to the source** | Generated code gave it a flat `items` array — 13 anonymous slots, so most rendered empty and the stage labels took whatever text landed in them. Now a structured API: `stages` (the four short bar labels) and `milestones` (`{header, copy}` pairs). Label colour is **fixed by the bar it sits on** — tan→paper, light→tan, dark grey→paper, black→tan — so a caller cannot put tan text on a tan bar. "We are here" is tied to the tan dot on the final bar and is a position marker, not a milestone. |
| 28 | **`reportStatRow` hand-authored, with a capacity ceiling** | Source slide 74 is a **6-column grid**: one white section-label column plus five numbered content columns, in three bands separated by 1pt `#7F6751` rules. Generated code had flattened it to an anonymous item array, losing the white labels entirely and letting any text land in the numbered headers. Now `columns` (five short headers — numbers in the source) and `sections` (`{label, cells}`). Band colour alternates `#808080` → `#CAA380` → `#808080` **automatically**, since that alternation is what separates the sections — it is not a per-cell choice. The header is typed uppercase with no `cap` attribute, so `caps` is set explicitly. |
| 29 | **Footer suppression is declared by the layout** (`NO_FOOTER_LAYOUTS`) | `reportStatRow` carries no footer in the source — its bottom band runs to the canvas edge and a footer would collide. Previously only the *caller* could suppress a footer (`slideData.customFooter`), which puts the burden on whoever writes the deck. The layout now declares it, and both renderers honour it: the exported slide uses the `NOFOOTER` master automatically. |
| 30 | **`reportStatRowLight` added — and two "duplicates" were not duplicates** | I had dismissed source slides 75 and 94 as duplicates of 74 and 93 on the basis that their geometry **and** their text matched exactly. They do. But they are the opposite colourway: 75 carries its own `#EEEEEE` slide background and recolours the header (`#FFFFFF`→`#808080`) and section labels (`#EEEEEE`→`#262626`); 93/94 differ the same way. **A duplicate check on geometry and text alone is not sufficient** — compare backgrounds and colours too. Both colourways now build from one parameterised source, so the pair cannot drift the way the two-row layouts did. |
| 31 | **A split's background comes from its own slide** | `background` was always taken from the *layout*, with any slide-level override recorded separately as `background_on_demo_slide`. That is right for a normal layout — a demo slide swapping in photography should not redefine it — but wrong for a SPLIT, where the pinned slide *is* the layout. `reportStatRowLight` would have published as dark. Fixing it corrected **nine** other splits that were also inheriting the wrong ground, including `reportSplitPanels` (`#FFFFFF`, not `#EEEEEE`) and the three `#EFF0F3` slides. |
| 32 | **Gradient fills** — `gradient:{from,to,angle}` on a shape or oval | PptxGenJS has **no gradient support**: passing `fill:{type:'gradient'}` silently produces a solid **white** shape, so the pre-existing `_pptxGradient` branch in `exportShape` was dead code emitting white. Gradients are now injected during the repack, the same mechanism as the kerning and photo-mask fixes — tag the shape, rewrite `<a:solidFill>` to `<a:gradFill>`, strip the tag. Preview uses a CSS `linear-gradient`. Also added `stroke` / `strokeWidth` (an outline in points, distinct from the 1px `border` shorthand) and gave `exportOval` both. |
| 33 | **`reportSpendBars` hand-authored, both colourways** | Six pill bars of data-driven length, each with a subhead, exactly two bullets, and a value circle pinned to its right end — outer disc in the bar's colour with a white outline, inner disc a `#EEEEEE`→`#A3A3A3` 45° gradient holding the value. The two colourways differ in **one** colour: the sixth bar is black on the light ground and `#57517E` purple on the dark, because black disappears on asphalt. Built from one parameterised source so the pair cannot drift. |
| 34 | **Bullet gap was ~3× the template's** | Two independent causes. *Export*: PptxGenJS defaults its bullet margin to **27pt** and derives `marL`/`indent` from it, ignoring the paragraph's own hanging indent — the template hangs its spend-bar bullets at 0.125in (**9pt**), so the gap came out three times too wide. The bullet indent is now derived from `Math.abs(p.indent) * 72`. *Preview*: the bullet glyph was followed by **two hardcoded spaces**, adding a gap on top of the indent; the glyph is now an inline-block exactly as wide as the hanging indent, so text starts precisely at `marL`. Exported values now match the source exactly (`marL=9pt indent=-9pt`), and the table of contents improved as a side effect — `0.840in / -0.420in` against the source's `0.82 / -0.42`, where the library default had given `0.75 / -0.375`. Bullets render at 100% of text size unless `bulletSizePct` says otherwise. |
| 35 | **`fill:'none'`** — outline-only shapes | Every box on source slide 89 is an unfilled outline. Without this an unfilled shape fell back to `cardBg` and painted over everything behind it. On export the fill is **omitted entirely** — PptxGenJS writes `<a:noFill/>` when no fill is given, whereas `fill:{type:'none'}` yields a *solid* shape and `{transparency:100}` writes a white fill at zero alpha. |
| 36 | **`reportModelCompare` is a spanning matrix** | Source slide 89 is not a fixed composition: it is a grid where each entry spans however many rows and columns it applies to, and **the spans are the content** — they say what applies where. CX-5 covers all four funnel stages so it is a full-height column; CX-90/CX-70 and CX-50 cover the lower three; CX-30 and M3/MX-5 the lower two; Brand covers only the top stage but spans four columns, so it is wide and squat. The API is `entries:[{label, copy, col, row, colSpan, rowSpan}]` against a 5×4 grid, with out-of-range spans clamped rather than drawn off-slide. Reproduces every source box to within hand-drawing jitter (≤0.03in). |

### Outline colours on the matrix

| Element | Outline | Weight |
|---|---|---|
| Section label (left column) | `#BFA588` tan | 0.5pt |
| Funnel stage chip | **none** — solid fill only, darkening `#A6A6A6` → `#404045` down the funnel | — |
| Entry box | `#808080` | 0.25pt |

The entry outlines *read* as white against the dark ground but are `#808080` in
the source — the source value is what is used.
| 37 | **Lines running up or left corrupted the file** | `exportLine` passed the element's `w`/`h` straight through, so a connector drawn up or to the left emitted a **negative `<a:ext>`**. That is invalid OOXML: PowerPoint refuses the file outright and offers to repair it, naming no shape. The hub-and-spoke diagram was the first layout to draw in all four directions, which is why it surfaced there. Now normalised to a positive box with `flipH` / `flipV`, which is how OOXML encodes direction. The preview had the same flaw and drew those segments the wrong way round; it now draws corner-to-corner. |
| 38 | **Guard against negative sizes** (`assertNonNegative`) | A negative width or height produces a file PowerPoint rejects with no indication of the cause. Every element now passes this check on the export path, where the **layout name is still known** — it logs which layout produced the bad size and clamps it, so the deck still opens. `validateElement` could not do this job: it only runs on the raw `els` path, never on layout output. |
| 39 | **Dashed and dotted outlines** (`dash`) | The template defines its dashes with `<a:custDash>`, not the `<a:prstDash>` preset element. Extraction only looked for the preset, so every dashed rule in the deck was reported as solid and drawn solid. Shapes and lines now carry a `dash` property mapped to the nearest preset on export and a CSS `border-style` in preview. Source measurements: spoke rings `d=200000 sp=200000` (dash), boxes `d=100000 sp=200000` with a round cap (dot). |
| 40 | **Drop shadows** (`shadow`) | An outer shadow, offset and blurred in points at a given angle, emitted as `<a:outerShdw>` inside `spPr` and as a CSS `box-shadow` in preview. Used by the hub-and-spoke centre disc and by every disc on the ecosystem tree. |
| 41 | **Ecosystem tree rebuilt as a rail hierarchy** (slide 26 / source 92) | The source flattens each corner ornament into a single 446-point curved path with no separable circle, and has no horizontal distribution rail — its branch nodes sit on free-standing stems. This layout therefore implements the requested structure rather than the source's: shadowed gradient discs with an icon slot at both top corners, a gradient primary disc for the campaign title, a trunk dropping from it to a wide horizontal rail, and branch drops from that rail into their own smaller discs. Column bodies accept sub-bullets (`children`), rendered one indent level in; column headers are bold. |
| 42a | **Primary node carries a label, not an icon** | The ecosystem tree's root disc preferred `root.icon` and fell back to `root.label`, so a config supplying both showed the icon and dropped the campaign name. The root now always renders its text label and takes no icon at all — icon slots belong to the branch discs and the two corner blocks, where they stay optional. The label is fitted to the disc's **inscribed square** (`r × 1.414`) rather than its bounding box, since text set to the full width runs out past the curve, and its size steps 8 → 7 → 6 → 5.5pt by character count so a longer campaign name shrinks instead of overflowing. |
| 42 | **Icons export without a canvas** | `exportIcon` read from a cache filled by rasterising each icon on a canvas, and silently emitted nothing when there was no canvas — so icons rendered correctly in the browser but were missing from every headless reference deck. It now falls back to the icon's SVG data URI, which needs no rendering surface; PowerPoint reads SVG images natively. |

### Validating an exported deck

A repair prompt means malformed XML, and PowerPoint will not say which shape.
Check these before anything else — all four are silent in `python-pptx`, which
parses happily:

```python
# negative extents  -- invalid, the usual cause
re.finditer(r'<a:ext cx="(-?\d+)" cy="(-?\d+)"', xml)
# font size zero or negative
re.search(r'sz="(-\d+|0)"', xml)
# malformed colours
re.findall(r'srgbClr val="([^"]*)"', xml)   # each must be 6 hex digits
# offsets far outside the canvas
```

### `paras` requires `runs`

Both renderers iterate `p.runs`, so a paragraph written as `{text:'...'}` renders
**nothing** — silently, with no warning. Always:

```js
paras: [{ runs:[{ text:'Goal: brand consideration' }], bullet:true, marL:0.125, indent:-0.125 }]
```

### Fixed-capacity layouts

Some layouts are a grid, not a list, and cannot absorb more content:

| Layout | Ceiling |
|---|---|
| `reportStatRow` | 5 content columns × 3 bands, plus the label column = **6 columns** |
| `reportSplitPanels` | 4 stages, 4 milestones |
| `storyboardGrid` | 6 panels |
| `castingGrid` | 4 |
| `locationOverview` | 5 |
| `tableOfContents` | 9 entries |

These **drop** anything past the ceiling rather than stacking it. That is
deliberate: the failure mode being prevented is a long column header wrapping to
two lines, growing its row and shearing the whole grid. Column headers in
`reportStatRow` are numbers in the source — keep them to a few characters.

### Stage labels are sized for short strings

The pill labels are 15.5pt with 6.97pt tracking in a 1.73in box — the source uses
years (`2022`). The template relies on `spAutoFit` to grow the box around longer
text; the engine does not implement that, so a long stage label **overflows**
rather than shrinking. Keep them to roughly six characters.

This is also why the size looks wrong when it is not: `spAutoFit` is *resize the
shape to fit the text*, not *shrink the text to fit the shape*. Both the 24pt
title and the 15.5pt stage labels are exactly half their source values (48pt and
31pt), which is correct — the engine canvas is half the template's.

### The report canvas family

What actually recurs across those 21 slides, and what each variant covers:

| Variant | Well | Template slides |
|---|---|---|
| `reportGrayChart` / `reportDarkChart` | chart, `0.78, 2.22, 11.50 × 4.36` | 83, 84, 85, 88 / 79, 80, 81, 82, 93, 94 |
| `reportGrayTable` / `reportDarkTable` | table, `0.64, 2.04, 12.06 × 4.72` | 76, 78 / 77 |
| `reportGrayTimeline` | flow graphic + 8 milestone labels | 72 |
| `reportGray` / `reportDark` | bare chassis — use `els` | the 8 one-offs |

Both wells are **identical in the gray and dark colourways**, so each pair differs
only by ground. `chart` and `tbl` were already wired in both renderers; chart data
uses the series form `[{name, labels, values}]` in preview *and* export — a
`[{label, value}]` array crashes the exporter.

### Vector artwork that has no media part

Slide 72's timeline is **not an embedded image**: it is 36 stroked bezier shapes
inside a group, a Keynote export that flattened a drawing into outlines. There is
nothing to pull out of `ppt/media`. `tools/render_vector_group.py` redraws it from
the path data — flattening curves, honouring `<a:ln>` strokes on `<a:noFill/>`
shapes, supersampled 4× — into `assets/backgrounds/report_timeline_flow.png`
(1600×373, 88 KB, alpha preserved, stroke colour verified `#BFA588`).

```
python3 tools/render_vector_group.py 72 out.png
```

Two traps if this is pointed at other slides: `spPr` is in the **presentationml**
namespace, not drawingml (an `A + 'spPr'` lookup silently finds nothing and
renders an empty canvas); and this artwork is stroked, not filled, so filling the
paths produces a solid slab instead of a line drawing.

### The three two-row layouts are genuinely distinct

Worth recording, since re-pinning made them look near-identical in text geometry:

| Layout | Ground | Backdrop graphic |
|---|---|---|
| `twoRowsDark` | `#262626` | none |
| `twoRowsLight` | `#FFFFFF` | yes — the geometric wash |
| `twoRowsLight2` (`Content - 2 rows - Light`) | `#EEEEEE` | none |

The two light ones differ by background *and* by that backdrop image, so both are
real options rather than a duplicate pair. Since patch 21 all three share exactly
the same text geometry — they are colourways of one design, which is what the
template's own layouts specify.

### Section titles — the template says "bold" two different ways

The 21 section titles at 35pt are visually one style but expressed two ways, and
both have to be handled or half of them come out light:

| Expression | Count | Engine |
|---|---|---|
| `latin="Mazda Type"` + `b="1"` (synthetic bold) | 11 | `font:'HR', bold:true` |
| `latin="Mazda Type Bold"`, no `b` (real bold face) | 9 | `font:'H'` — already bold |
| `latin="Mazda Type Regular"`, no `b` | 1 | `font:'HR'`, no bold |

That last one is **`Content - 3 columns - Dark`**, and it is not an extraction
miss: the layout really does specify Mazda Type *Regular* with no bold, while its
own light counterpart uses Mazda Type Bold. Left as the template has it — flagged
for the brand owner rather than silently normalised.

### Custom geometry — scope

The template has 1,728 `custGeom` shapes, but 1,723 of them sit on *slides* (Keynote
conversion artefacts inside demo artwork) and only **5 are on layouts** — one per
divider, all the same 11-point polygon at the same position. Those 5 are what the
engine reproduces. Points are stored as fractions of the shape box, never inches,
so rescaling the layout cannot distort the mark.

`points` is shape-relative on export: PptxGenJS wants the outline in inches
*within* the shape box, because `<a:xfrm>` already carries x/y. Adding the shape
position to each point translates the outline by its own offset.

### Reference decks — do not flatten transparent assets

`tools/export_node.js` can be pointed at a re-encoded asset set (via `MMW_ASSETS`
plus a `_map.json`) to keep a generated reference deck small. **Alpha must be
preserved when re-encoding.** Two backgrounds are transparent overlays rather
than pictures:

| Asset | Non-opaque |
|---|---|
| `backgrounds/thankyou_texture.png` | 71.5% |
| `backgrounds/headline_dark_mark.png` | 25.3% |

Flattening either to JPEG fills that transparency with the matte colour, which
turns the subtle geometric wash on Table of Contents and both Thank You slides
into a solid dark block. Re-encode with a rule of *"keep PNG whenever more than
1% of pixels are non-opaque"* — a bare `mode in ('RGBA','LA')` test is not enough,
since several genuinely opaque photos carry a stray alpha channel. Quantising the
kept PNGs to 128 colours holds the whole asset set near 1 MB.

### Exporting without a browser

`tools/export_node.js` runs the **real** export path under Node with a small DOM
shim — `standard-deck.js`, `deck-layouts.js` and `deck-shell.js` execute verbatim
in a shared `vm` context, so a bug found there is a bug the browser has too. It
was written to diagnose a dead download button and now doubles as a way to
produce a reference deck on demand:

```
MMW_SRC=/path/to/mmw-v2/ node tools/export_node.js out.pptx
```

Two knobs: `MMW_SRC` points at the bundle, `MMW_ASSETS` at the asset root (they
differ only when serving re-encoded artwork). If the asset root contains a
`_map.json`, it maps the logical asset name the layouts use to the file actually
on disk — that is how a smaller deck gets built without touching any layout.

Two caveats, both harness-only and neither affecting the browser: icons rasterize
via canvas and come out blank, and photo wells fall back to a flat placeholder
tile instead of the drawn one.

### Patch 9 in detail — why nothing rendered

Symptom: covers showed the title only. No background pattern, no MMW logo top-left, no WPP|Mazda lockup at bottom-left. Three separate bugs, all present in v1.0:

1. **`registerPrefetch()` was defined but never called** — by any layout, in either version. `_prefetchUrls` was always empty, so `_imageCache` stayed empty. The export guard `if (slideData.bgImage && _imageCache[slideData.bgImage])` was therefore never true and **backgrounds were silently skipped**.
2. **`renderImage()` drew nothing for ref'd images.** Given `{type:'img', ref:'gi0'}` with no `src`, it painted a grey `#E8E8E8` box, copied the ref onto the div as `id`, and appended no `<img>`. So brand marks were invisible in the preview *and* the duplicate DOM id made `getElementById()` ambiguous.
3. **`exportImage()` looked in the wrong place.** It did `getElementById(el.ref).querySelector('img')` — but the artifact declares refs as `<img id="gi0">` **directly**, and an `<img>` has no child `<img>`. That returned `null`, so **every brand mark was dropped from the PPTX too**. It also required a `data:` URI, which a plain file path never satisfies.

Fixes: a shared `SD.resolveImgSrc(el)` resolves `src` or `ref` (handling both a bare `<img>` and a wrapper); `renderImage` renders the resolved source and no longer clones the id; `exportImage` embeds the cached data URI when available and otherwise falls back to `{path}`; and prefetch now walks the deck data itself for every `bgImage` and every emitted image, so no layout has to register anything.

**Three follow-on fixes in the same pass**, found by checking the other cover variants rather than assuming the engine fix covered them:

- **Brand marks implemented as picture placeholders.** `Cover Photo2` (idx 22/23) and `Thank You Dark` (idx 22) declare the logo and lockup as *picture placeholders*, not fixed images — the demo slides fill them with the real marks. Emitting a generic "change picture" well there put a grey box exactly where the MMW logo belongs. Those three slots now resolve to the real mark, chosen light/dark like any other.
- **77 image elements across 31 layouts referenced an undocumented `cfg.assets` map.** They resolved to `undefined` and drew nothing. Now: the **38** that are real brand furniture (device chrome, platform marks, textures) resolve to their shipped path under `assets/`, overridable per deck via `cfg.assets`; the **39** that were demo photography from the source deck — deliberately not shipped — became replaceable photo wells, which is what they should have been.
- **`subtitle` is accepted as an alias for `subhead`.** `Cover Photo` is documented as taking `subtitle` but the generated code read `cfg.subhead`, so the subtitle was silently dropped. Both keys now work.

Asset base path is configurable: `window.MMW_ASSET_BASE = '/static/mmw/';` before `deckInit()`.

**Serve the folder over http** (`python -m http.server`). Under `file://` the canvas is tainted, images can't be cached as data URIs, and the PPTX links them instead of embedding.

## Brand marks — four ids required

The template ships **black and white masters of both marks** and selects on background. The layouts do this automatically via `logoRef(cfg)`/`lockupRef(cfg)`, but the artifact must supply all four:

```html
<img id="gi0"  src="assets/logos/mmw_logo_black.png"         style="display:none">
<img id="gi0w" src="assets/logos/mmw_logo_white.png"         style="display:none">
<img id="gi1"  src="assets/logos/wpp_mazda_lockup_black.png" style="display:none">
<img id="gi1w" src="assets/logos/wpp_mazda_lockup_white.png" style="display:none">
```

A black mark on `pattern_dark.png` is invisible. The white variants were absent from the previous asset bundle entirely.

> **Check before print:** the black logo master is 13968×3818; the white is 530×145. Same artwork, very different resolutions.

## Divider pass — what the image dividers turned up

The engine image fixes are shared by all layouts, so the three image-backed dividers (`dividerDark`, `dividerDark2`, `dividerLight2`) pick them up for free. Checking them properly turned up four more issues, none of which the engine fix alone would have solved.

**1. 56 decorative shapes were being emitted as text elements.** Empty shapes inherit a default run style from the slide master, so they carry a font size with no content. The generator read "has a size, therefore text" and bound them to `cfg.subhead` / `cfg.text` — swallowing user copy into invisible boxes and dropping their fills. Classification now requires actual text content. 37 became filled shapes, 16 became rules, 3 unfilled containers are skipped.

**2. `Divider Tides` carries a decorative logo watermark** — `mmw_logo_black.png` at `x4.07 y-0.01 9.28x7.5`, bleeding off top and bottom, at **3.55% opacity** and cropped to roughly the left fifth of the source. Painting it solid put a black slab across the slide.

**3. Light/dark mark swapping was applied too broadly.** It is only correct at the two standard corner footprints, where the template demonstrably ships both colourways. Four marks sit elsewhere — the Tides watermark, the Thank You mid-slide mark, and a mark on `Content 2 Rows - Dark` — and there the template's specific choice is deliberate. Those now use the literal asset.

**4. Image opacity and cropping were being ignored entirely.** Across the template's 343 pictures, **152 are cropped** (`srcRect`) and 16 carry an `alphaModFix` opacity. Both are now extracted and honoured in preview (CSS scale/offset + opacity) and export (PptxGenJS `sizing:{type:'crop'}` + `transparency`).

The overlay tint on the mood dividers is also now correct: `Asphalt`/`Canopy`/`Aurora`/`Tides` carry a 97%-transparent Paper wash, while `Divider Light`'s is fully opaque per the source.

**Full-bleed photo dividers** (template slide 20 puts a photograph over `Divider Tides`) work through `bgImage` on any divider — that is a per-instance choice, not a separate layout.

## Supplying real photography

Every photo well renders as a right-click-replaceable placeholder by default. To place real imagery at build time, pass `images` — an array indexed by well order (top-to-bottom, left-to-right within the layout):

```js
{ layout:'coverPhoto2', dark:0, bgColor:'#EEEEEE',
  title:'Mazda Motion Works',
  images:['photos/hero.jpg'] }        // well 0 = the hero frame
```

Wells you leave unspecified stay replaceable, so you can fill only the ones you have. Supplied photos use `fit:'cover'` — they fill the frame and crop, matching how the template crops its own photography into these frames; brand marks stay `contain` so they are never distorted. There are **161 wells** across the layout set.

`Cover Photo2` (template slides 10 and 11) is the clearest case: one hero frame plus the two corner marks. The template art-directs the frame per instance — slide 10 uses `x1.99 y-0.02 11.43x7.57`, slide 11 `x3.35 y0.0 10.07x7.54` — and the layout ships slide 10's geometry.

## Default photography and rotation

Image-led layouts pre-populate with real photography lifted from the template deck, so a new deck never opens on empty grey boxes. Six photos ship in `assets/photos/` (1.4 MB total, re-encoded to 1920px JPEG):

| Pool | Photos | From template slide |
|---|---|---|
| `coverPhoto` (background) | `cover_scenic_01/02.jpg` | 9, 8 |
| `coverPhoto2` (hero well) | `cover_hero_01/02.jpg` | 10, 11 |
| `headlinePhotoWell` | `statement_01/02.jpg` | 41, 34 |
| `headlinePhoto` | `headline_photo.png` | 41 |

**Rotation** cycles the pool per layout, so consecutive image covers in one deck do not repeat:

```
 1. coverPhoto2        cover_hero_01.jpg
 2. coverPhoto         cover_scenic_01.jpg
 3. coverPhoto2        cover_hero_02.jpg
 4. coverPhoto2        cover_hero_01.jpg     <- wraps
 5. coverPhoto         cover_scenic_02.jpg
```

Each pool counts independently, so mixing cover types does not disturb either sequence.

**Anything you specify wins.** A slide with its own `bgImage` or `images[n]` is left alone. Disable the whole mechanism with `deckInit({ defaultPhotos:false })`. Defaults export as ordinary pictures, so right-click → *Change Picture* still works.

### Why assignment happens in `deckInit`, not in the layout functions

`dispatch()` runs **four times per slide** — preview render, asset prefetch, icon pre-render, and PPTX export. A rotation counter inside a layout function would advance on every one of those passes, so slide 3 might show one photo in the preview and a different one in the exported file. Assigning into the deck data once at init keeps `dispatch()` a pure function of slide data.

Verified: identical output across 4 consecutive dispatch passes for every slide.

## Character spacing (tracking)

The template tracks type heavily and v2.0 was emitting **none** of it — the most visible case being the navigation-divider eyebrow, which the template expands by **14pt** at its native scale.

Tracking scales with the canvas like every other measurement, so the template's `spc="1395"` (13.95pt on a 31pt eyebrow) becomes **6.97pt on a 15.5pt eyebrow** in engine space.

| Role | Engine pt | Template native |
|---|---|---|
| Eyebrow / tag (15.5pt) | **+6.97** | +13.95 |
| Statement (140pt) | +14 | +28 |
| Report chassis title (24pt) | +2.64 | +5.28 |
| Location labels (9.5pt) | +0.95 | +1.90 |
| Content subhead (13pt) | +0.52 | +1.04 |
| Grid captions (6.5pt) | +0.43 | +0.87 |
| Section title (35pt) | **−0.70** | −1.40 |

Note the 35pt section title is *tightened*, not expanded — 91 elements across the deck carry tracking, and it runs both directions.

Cover and divider titles (54.5pt) and the TOC list (30pt) carry none, which is also faithful.

**A units bug went with it.** The explicit-typography patch set `letterSpacing` in `em`. At the eyebrow's 6.97pt that would have rendered ~7 character widths of space per gap. It is now converted points → preview pixels (6.97pt × 2 = 13.94px).

**Kerning** is enabled for all sizes from 1pt up. Applied in the preview via `font-kerning`. PptxGenJS 3.12 does not expose PowerPoint's `kern` attribute, so the exported file falls back to PowerPoint's own default kerning — the tracking values above do export correctly via `charSpacing`.

Typography now matches the template on all four dimensions — **font face, casing, line spacing and tracking — 377 elements, zero mismatches**.

## Slot discipline, and a layout that was hiding a second design

Each layout now declares exactly the content slots the template gives it, exported as `DeckLayouts.LAYOUT_KEYS`. `dispatch()` warns when a deck supplies anything else:

```
[deck-layouts] "dividerDark" has no slot for "subhead" -- that content will not
appear. Slots: tag, title
```

This came out of chasing a "Supporting subhead" that appeared on divider slides in the test harness. It was **my harness placeholder**, fed to all 66 slides indiscriminately — the string appears nowhere in the template, and all 8 dividers have exactly two text slots. The harness now feeds each layout only its declared slots, so it can no longer imply a slot the template lacks.

### `1_Content -headline photo copy` carries two different designs

Chasing the same thread turned up something real. That one template layout name is instantiated two incompatible ways:

| | Slide 31 | Slide 34 |
|---|---|---|
| Title | **74pt** centred, white | **140pt** centred, white, +14pt tracking |
| Second line | **17.5pt accent subhead** at y4.05 | 15.5pt tag at y2.42, +6.97pt tracking |
| Photo | none — dark master background | **full-bleed replaceable well** |

v2.0 was shipping only the modal instance (slide 31) under the name `headlinePhotoWell` — which had **no photo well at all**, despite the name, and lost slide 34's design entirely.

Now split into two layouts, taking the count to **67**:

- **`statementSubhead`** — slide 31. 74pt centred title + 17.5pt accent subhead on the dark master. This is the real "title with supporting subhead" model in the template.
- **`headlinePhotoWell`** — slide 34. Full-bleed replaceable photo well + 140pt statement + tag. Now actually has the well.

The generator gained `PIN_INSTANCE` and `SPLITS` (see `tools/2_build_layout_data.py`) so any other layout found carrying two designs can be split the same way.

## Table of contents — rebuilt to the template

The v2.0 implementation collapsed this layout into three flat text boxes. Template slide 22 is considerably more structured, and all of it is now reproduced:

| Piece | Detail |
|---|---|
| **Heading** | One box: **grey** subtitle above **black** title, `<a:br/>` between them. 17pt bold ALL CAPS, 90% line spacing. |
| **List** | Per item, a **grey number** run + a **black topic** run at 30pt bold, 110% line spacing. Numbers auto-generate `01, 02, 03…`. |
| **Sub-bullets** | 15pt bold black under an item, hanging indent (marL 0.82in, indent −0.42in), bullet glyph `•` at **80%** of text size. |
| **Copy block** | Lower left, `x0.29 y6.33 w4.02`, 10pt grey, normal tracking — this layout has **no footer**. |
| **Backdrop** | Two different crops of one asset at **65.6% opacity**, behind the list. |

```js
{ layout:'tableOfContents', bgColor:'#FFFFFF',
  subtitle:'Agenda', title:'Table of contents',
  items:[ 'Introduce the concept',
          { topic:'Present the approach',
            subs:['Creative territory','Production plan'] },
          'Production timeline' ],
  text:'Prepared for the MMW brand team, July 2026.' }
```

**Capacity is enforced.** The list box has 4.16in of inner height; an item costs 0.46in and a sub-bullet 0.23in. Overflow is dropped with a console warning rather than silently clipped — the source ships 10 items in a 9-item box.

### Rich paragraphs in the engine

None of this was expressible before: text elements were a single flat string with one colour. Both renderers now accept a `paras` array — per-paragraph size, indent, bullet and bullet-size, with per-run colour inside each. Preview builds nested block elements; export maps to PptxGenJS text-object arrays with `breakLine`, `bullet` and `indentLevel`. Elements without `paras` are untouched, so nothing else changed.

## Text insets — a systematic offset, now fixed

Auditing the Table of Contents surfaced something affecting the whole deck. `x/y/w/h` describe a text **frame**; PowerPoint then insets the text inside it (`bodyPr lIns/tIns/rIns/bIns`). The engine exported every text box with `margin:[0,0,0,0]` and applied no padding in the preview.

**370 of the template's 392 text elements carry non-zero insets** — most commonly 0.079 / 0.104in, with 0.028 and 0.035 also common. Every text block was therefore sitting up to 0.1in left and high of where the template puts it. Small individually, visible in aggregate, and exactly the kind of drift that reads as "close but not right".

Insets are now extracted, emitted on 319 elements, and honoured in preview (padding) and export (PptxGenJS `margin`, converted inches → points).

Typography now matches the template on **five** dimensions — font face, casing, line spacing, tracking and insets — across 376 elements, zero mismatches.

### Two smaller findings from the same audit

- **The list box is 4.63in on slide 22, not the 4.37in the layout defines.** The instance wins, per the demo-slide-authoritative rule, so capacity is computed against 4.42in of inner height.
- **The slide-number placeholder on this layout is an outlier** — `x13.15 y7.32`, 5pt, `#DFDFDF`, where every other layout puts it centre-bottom at 9pt or 12pt. Nothing renders slide numbers yet, so it is documented rather than implemented.

## Casing: the template expresses it two ways

The 35pt section title renders caps in the template, but **not** via `cap="all"` — all **21 instances across 21 layouts are simply typed in uppercase**, and none is mixed case. Reproducing the XML literally meant a title passed as "Concept overview" rendered mixed case, against the design.

Confirmed as caps intent with the brand owner. The generator now treats 35pt as a typed-caps size (`TYPED_CAPS_SIZES` in `tools/2_build_layout_data.py`) and records `caps_source: 'typed-uppercase'` on those elements so the deviation from the literal XML stays auditable.

**9pt shows the same pattern but is deliberately excluded.** All 20 instances are typed uppercase — but they sit only on `Blank Grey` and `Blank Light`, where the text is one-off diagram content (`BROADCAST`, `SOCIAL`, `DELIVERABLES:`) rather than a design role. A user replaces that text entirely, so inferring a rule from it would be over-reading.

Every other size expresses casing through `cap="all"` and needs no inference.

## Stacked duplicate text boxes

Two demo slides carry an unattached copy of a placeholder's text box on top of the original — slide 39 (`Content 06`) duplicates both its subhead and body, slide 70 (`Youtube_VideoAd`) duplicates a caption. Emitting both double-rendered the same copy onto itself, which reads as smeared or falsely bold rather than as an obvious fault.

Text elements sharing a position are now deduplicated, keeping the placeholder-backed box (document order puts it first).

## Assets

`assets/logos/` (5) · `assets/backgrounds/` (8) · `assets/social/` (15) — with `manifest.json` recording each file's source media name, byte size, md5 and role.

Only **34 of the template's 227 embedded media** are brand furniture; the other 193 are demo photography and were deliberately not exported. Backgrounds are the **layout's** asset, not whatever the demo slide swapped in — `Cover Photo`'s demo slides replace `scenic_photo.png` with a one-off photo, and three other layouts do the same.

## Known limitation — picture placeholders

The template is built on **123 native picture placeholders** (`<p:ph type="pic">`). The engine emits photo wells via `addImage()`, so PowerPoint's right-click *Change Picture* works, but they are plain pictures rather than real placeholders — no crop preservation, no selection-pane naming.

PptxGenJS 3.12 cannot create picture placeholders on slides directly; they must come from `pptx.defineSlideMaster({ objects: [{ placeholder: … }] })`. That's the v2.1 upgrade that would make exports behave like the source template. Not a blocker for v1 of this rebuild.

## Still needs a brand-owner decision

1. **Spark accent.** `#C4A584` (template, 19×) vs `#BFA588` (template, 22×, separable context) vs `#C4A484` (brand.json, 0×). Currently set to the template value.
2. **Divider mood backgrounds** drift from the `brand.json` ramps — Canopy `#253724` vs `#203822`, Aurora `#2C283B` vs `#2D273D`, Tides `#142A45` vs `#0B2A47`. Asphalt matches exactly.
3. **Theme colour scheme is Keynote's default** — `theme1.xml` carries `#00A2FF`, `#16E7CF` etc. and maps `dk1` to white. No MMW colour is in the theme; everything is hard-coded at shape level. Any tooling that resolves `schemeClr` will produce wrong colours.

Full detail in `MMW_Layout_Spec.md` §15.

## Regression testing

`mmw_layouts.json` is the fixture. Re-extract a built deck and diff geometry against it; anything that drifts is either an engine guard rail firing or a transcription error.

Validated in this bundle:
- All 66 layouts dispatch without error at `dark:0` and `dark:1` — 794 elements, no non-numeric geometry, no oversized type, no `#CB297B` annotation content.
- Casing, line-spacing **and font face** match the template exactly on all **426** geometry-matched text elements — 0 mismatches on all three.
- Prompt / engine / spec inventories agree exactly at 66 names, no drift, no duplicates.
- All four JS files pass `node --check`.

**Measured against the real template.** The cover screenshots were compared pixel-to-spec (template render, 82.3 px/in):

| Element | Spec | Measured | Delta |
|---|---|---|---|
| MMW logo `gi0` | x0.41 y0.37 1.12x0.31 | x0.44 y0.39 1.09x0.29 | +0.03 / +0.02 |
| WPP\|Mazda lockup `gi1` | x0.42 y7.06 1.02x0.19 | x0.44 y7.06 1.01x0.17 | +0.02 / 0.00 |
| Cover title | 54.5pt | cap-height 0.53in, ink top y4.69 | exact |

The title's measured cap-height and vertical position match the corrected 54.5pt value exactly — **independent confirmation of the type-scale fix** against the source design.

**Still not validated: PPTX export in a browser.** The modules have not been run together with PptxGenJS and no .pptx has been produced. That is step 1 for you.

**Install `Mazda Type Bold` and `Mazda Type` first.** The PPTX now names those faces. Without them PowerPoint substitutes and every metric will look wrong for reasons unrelated to the code.
