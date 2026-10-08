# MMW Presentation Builder v2.0 — session handoff

**If you are picking this up in a new conversation, read this file first.** It is written for an assistant with no prior context.

## What this project is

Rebuilding the MMW Presentation Builder agent against the real `MMW_PPT_Template_7_30_26.pptx` (originally built against `_7.24.26`; template revisions since have been reviewed and folded in). The previous agent (v1.0, `standard-deck-mmw@ecb720e`) knew 22 layouts and carried a systematic typography bug. v2.0 is now at **84** engine-addressable layouts (up from the original 67 template-name-derived set — growth is new report-detail compositions and 23 layouts promoted to hand-authored status, not new template masters) and is generated from the template rather than transcribed, except where hand-authoring was required (see "How to regenerate" below).

## State: what is done

| Area | Status |
|---|---|
| Layout spec, all layouts | Complete — `MMW_Layout_Spec.md` (84 layouts, includes the 24 in the reporting family) |
| `deck-layouts.js` | Complete — 88 layouts (+ 2 map layouts in `deck-maps.js` = 90); hand-maintained source of truth (see "Where the layouts live") |
| Charts | Column chart and template doughnut added (slides 93/94, 82/88); chart title/subtitle/note on every chart type |
| Maps | `mapUS` (highlighted states, labelled cities, template pins) and `mapWorld` (decorative) — `deck-maps.js` + `map-data.js`; DMAs pending the county-to-DMA list |
| Blank canvases | `canvasDark/Grey/Light`; `reportGray/Dark` now draw `cfg.els` |
| Icons | 72 `mmw-*` brand icons from the Keynote source SVGs |
| Engine patches | 9 applied to `standard-deck.js` / `deck-shell.js` |
| System prompt | Rewritten for v2.0 |
| Brand assets | 28 extracted + 6 photo defaults |
| Covers (5) | Reviewed against template, fixed |
| Dividers (8) | Reviewed against template, fixed |
| Typography | font / casing / line-spacing / tracking — 377 elements, 0 mismatches |
| **Browser + PPTX export** | **Validated** — `type:'path'` (bezier connectors) and `el.rotation` (rotated text) both confirmed present in the exported XML via real `pptxgenjs` export, not just the browser preview |
| Content, production, social layouts | Reviewed and fixed against the 7/30/26 template (all 16 social layouts, `coverPhoto2`, `headlinePhotoWell`) |

## The two things that matter most

**1. The type scale is half the template's raw values.** The template canvas is 26.667×15in, exactly 2.0005× the engine's 13.33×7.5in. v1.0 halved coordinates but not font sizes, so all type rendered 2× too large — 15 of 24 measured text boxes overflowed. Cover title is **54.5pt**, not 109. Headline is **140pt**, not 280. Everything in the spec and the JSON is already engine-space. **Never scale it again.**

**2. Layout names follow the template's own names.** v1.0's names were invented and had drifted — its `content03` was built from the template's `Content 01`. `LEGACY_ALIASES` in `deck-layouts.js` maps old to new. Two names (`content03`, `content05`) exist in both versions meaning *different* layouts and log an error.

## Where the layouts live — edit `deck-layouts.js` directly

**`deck-layouts.js` is the source of truth** (decided 2026-10-07). It is
hand-maintained: change a layout by editing its function in that file, then
re-run the tests and a real PPTX export (see "How to test").

This replaced the old model, where `deck-layouts.js` was regenerated from
`tools/overrides.py` + `mmw_layouts.json`. That model needed every hand edit
mirrored back into `overrides.py`, and twice in practice it wasn't -- by
October the generator was 39 layouts behind the shipped file, so a
regeneration would have silently undone weeks of fixes. Most layouts are
hand-authored now anyway (real platform mockups, chevrons read from source
XML, bezier connectors, chart compositions -- none of it derivable from raw
template geometry).

**What the `tools/` pipeline is still for:**

- `1_extract_template.py` → `2_build_layout_data.py` turn a template revision
  into `mmw_layouts.json`: measured geometry, type and colour for every
  layout. Use it as **reference data** when a new template revision lands --
  compare a layout's fresh numbers against its function and port the
  differences by hand.
- `mkharness.js` → `mkstandalone.js` build the QA decks (`test-deck.html`,
  `test-deck-standalone.html`) from the **real** `deck-layouts.js`.
- `copy_budgets.js` measures every field's character budget from the QA deck
  through the engine's own text fit, writes `COPY_BUDGETS.md` and regenerates
  the budget block in the prompt's §6.7. Re-run it after changing a layout's
  geometry or the harness samples (rebuild `test-deck.html` first).
- `3_build_deck_layouts.py` + `overrides.py` are **frozen archives** (last in
  sync 2026-09-04). The script writes only to `tools/build/`; never copy its
  output over the root `deck-layouts.js`. It can still be useful for seeing
  what a fresh, purely template-driven function would look like.

```bash
cd tools
export MMW_TEMPLATE="/path/to/MMW_PPT_Template_7_30_26.pptx"   # or whichever revision is current
python 1_extract_template.py     # PPTX  -> build/resolved.json   (needs python-pptx)
python 2_build_layout_data.py    #       -> build/mmw_layouts.json  (reference geometry)
node   mkharness.js              # real ../deck-layouts.js -> build/test-deck.html
node   mkstandalone.js           #       -> build/test-deck-standalone.html
node   copy_budgets.js           # test-deck.html -> COPY_BUDGETS.md + prompt §6.7 block
```

## How to test

```bash
cd tests
node smoke.js        # every layout in deck-layouts.js dispatches, both dark modes
node mapstest.js     # mapUS / mapWorld: projection, markers, labels, assets
node fittest.js      # text fit: QA deck clean, social copy API, overflow warnings
node bgtest.js       # template backgrounds: tokens, missing, junk, asset paths
node covertest.js    # 5 cover variants, asset resolution
node divtest.js      # 8 divider variants
node rotatetest.js   # photo rotation + determinism across 4 dispatch passes
```

Expected: smoke reports every layout dispatched (88 today), 0 failures, 0 warnings; mapstest "all map checks passed".

In a browser: **serve over http, not `file://`** (`python -m http.server 8000`) — under `file://` the canvas is tainted and images link instead of embedding. **Install `Mazda Type Bold` and `Mazda Type`** or every metric will look wrong for reasons unrelated to the code.

## Non-obvious things that will bite

- **`dispatch()` ends in `fitTexts()`**, which can lower a small text element's `size` (and scale its `charSpacing`) when its copy would collide in PowerPoint. Compare a layout function's raw output with `dispatch()` output when chasing a font size. The browser preview is *not* the reference for fit -- it lays text out shorter than PowerPoint, which is why the check models PowerPoint's 1.2x line box. After moving or resizing a text box, rebuild the QA deck and re-run `tools/copy_budgets.js`.
- **Export embeds images from verified bytes only.** `prefetchImage()` fetches each image, checks its magic bytes, retries, then tries the same commit on raw.githubusercontent.com; an image that still fails is left out of the PPTX and named in the export toast. Never reintroduce PptxGenJS's `path:` fallback outside `file://` -- in a 2026-10 test run jsDelivr briefly answered `thankyou_texture.png` with an error string, PptxGenJS embedded it as a .png, and PowerPoint's broken-picture box blanked four slides (TOC, both Thank Yous, Two Rows Light).
- **PptxGenJS text margins are `[left, right, bottom, top]`**, not CSS order (`insetMargin()` in deck-shell.js). Until 2026-10 the exporter sent `[t, r, b, l]`, so every asymmetric inset was swapped in the PPTX while the preview was right.
- **`enforceWidthRule()` (standard-deck.js) skips MMW layout text** (anything carrying `caps`). It narrows text inside a card to 80% of the card -- a v1 heuristic that silently re-wrapped template copy in 10 report layouts. It still applies to legacy raw elements.
- **Slide backgrounds come from `LAYOUT_BG`** (deck-layouts.js), applied by `applyLayoutBg()` in dispatch and by `normalizeBackground()` in deckInit's pre-pass. A valid hex `bgColor` / `bgImage` wins; a palette token is translated; anything else (missing, junk) gets the layout's template background and dark flag. PptxGenJS writes any non-hex colour as #000000 -- that is how a 2026-10 test deck's grey slides came out black. When a layout's background changes, update its header comment and `LAYOUT_BG` together (bgtest.js checks every image exists).
- **`dispatch()` runs 4× per slide** (preview, prefetch, icon pre-render, export). Never put stateful logic in a layout function — the photo rotation lives in `deckInit` for exactly this reason.
- **`white`/`black` tokens are pure #FFFFFF/#000000.** For MMW Paper and Asphalt use `paper` / `asphalt`. `resolveColor()` checks its semantics map before PALETTE.
- **`caps` present on a text element = "typography fully specified"** — the engine then skips `getTextStyle()`'s guesswork. That heuristic uppercases anything ≤10pt, which would wrongly capitalise 161 elements.
- **`charSpacing` is in points**, converted to px for preview. An earlier build used `em` — catastrophic at the eyebrow's 6.97pt.
- **Only swap light/dark brand marks at the two corner footprints** (`0.41,0.37` and `0.42,7.06`). Elsewhere the template's specific choice is deliberate — e.g. Divider Tides uses a *black* logo at 3.55% opacity as a watermark on dark navy.
- **#CB297B is an annotation colour** ("PLACE YOUR OWN IMAGE", "click here") on 6 slides. Never emit it.
- **152 of the template's 343 pictures are cropped** (`srcRect`) and 16 carry opacity. Both are extracted and honoured.
- **One template layout carries two designs.** `1_Content -headline photo copy` is slide 31 (74pt title + 17.5pt accent subhead, no photo) *and* slide 34 (full-bleed photo well + 140pt statement + tag). Split via `PIN_INSTANCE` / `SPLITS` in `tools/2_build_layout_data.py` into `statementSubhead` and `headlinePhotoWell`. Other layouts may hide the same thing — the mechanism is there to reuse.
- **`LAYOUT_KEYS` declares each layout's real content slots** and `dispatch()` warns on anything else. Dividers take `tag` + `title` only — no subhead.
- **`Moodboard `** has a trailing space in its template name. `Title & Bullets` has an ampersand. `1_Content -headline photo copy` has a leading `1_`.

## Open decisions for the brand owner

1. **Spark accent** — template uses `#C4A584` (19×) and `#BFA588` (22×, separable context); `brand.json` says `#C4A484`, which appears nowhere. Currently set to the template value.
2. **Divider mood backgrounds** drift from the brand.json ramps (Canopy `#253724` vs `#203822`, etc). Asphalt matches exactly.
3. **Theme colour scheme is Keynote's default** — `#00A2FF` etc, `dk1` mapped to white. No MMW colour is in the theme; everything is hard-coded at shape level. Any tooling resolving `schemeClr` gets wrong colours.
4. **CDN pin** — the prompt has `<PIN>` placeholders to fill once committed.

## Known limitation

Photo wells export via `addImage()`, so right-click → *Change Picture* works, but they are plain pictures rather than native `<p:ph type="pic">` placeholders — no crop preservation or selection-pane naming. The template is built on 123 real picture placeholders. Matching that needs `pptx.defineSlideMaster({objects:[{placeholder:...}]})`; PptxGenJS 3.12 cannot create them on slides directly. That is the v2.1 upgrade.

Also: PptxGenJS 3.12 does not expose PowerPoint's `kern` attribute, so exported kerning falls back to PowerPoint's default. Tracking (`charSpacing`) does export correctly.

## Name-unescape (fixed in the script, no longer a manual step)

`1_extract_template.py` used to pull layout names via a regex on raw XML
bytes, not a real parse, so `&amp;` never became `&` and the pipeline threw
`KeyError: 'Title & Bullets'` downstream. Fixed directly in the script
(`html.unescape()` on the extracted name) — the manual snippet this section
used to document is no longer needed.
