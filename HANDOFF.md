# MMW Presentation Builder v2.0 — session handoff

**If you are picking this up in a new conversation, read this file first.** It is written for an assistant with no prior context.

## What this project is

Rebuilding the MMW Presentation Builder agent against the real `MMW_PPT_Template_7_30_26.pptx` (originally built against `_7.24.26`; template revisions since have been reviewed and folded in). The previous agent (v1.0, `standard-deck-mmw@ecb720e`) knew 22 layouts and carried a systematic typography bug. v2.0 is now at **84** engine-addressable layouts (up from the original 67 template-name-derived set — growth is new report-detail compositions and 23 layouts promoted to hand-authored status, not new template masters) and is generated from the template rather than transcribed, except where hand-authoring was required (see "How to regenerate" below).

## State: what is done

| Area | Status |
|---|---|
| Layout spec, all layouts | Complete — `MMW_Layout_Spec.md` (84 layouts, includes the 24 in the reporting family) |
| `deck-layouts.js` rebuilt | Complete — 84 functions; 23 hand-authored in `overrides.py`, rest generated |
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

## How to regenerate the layouts

**This is no longer a blanket "don't hand-edit" situation.** 23 layouts are
now deliberately hand-authored in `tools/overrides.py` and will be silently
regressed by a regeneration if their `OVERRIDES` entry isn't kept in sync
with `deck-layouts.js` — most because their correct content (real platform
mockup chrome, chevron shapes read from the source XML, a bezier connector,
etc.) doesn't exist anywhere in the raw template geometry, extractable or
not, so the generator can never reproduce them from template data alone. If
you add or change a hand-authored layout, mirror it into `overrides.py` in
the same session, not later. Before trusting any regeneration, actually run
it and diff against committed — don't assume `overrides.py` is in sync.

```bash
cd tools
export MMW_TEMPLATE="/path/to/MMW_PPT_Template_7_30_26.pptx"   # or whichever revision is current
python 1_extract_template.py     # PPTX  -> build/resolved.json   (needs python-pptx)
python 2_build_layout_data.py    #       -> build/mmw_layouts.json
python 3_build_deck_layouts.py   #       -> build/deck-layouts.js
node   mkharness.js              #       -> build/test-deck.html
```

Last verified: 80 of 84 layouts regenerate byte-identical to committed; the
other 4 are confirmed cosmetic-only (two are a unicode-escape display
difference with identical runtime values, two are an intentional inlining
of a shared helper the generator has no mechanism to inject) — not a
behavioral difference. Checked via real dispatch comparison, not assumed.

**32 layouts are machine-generated. 52 are hand-authored** in `tools/overrides.py` (the full list is `OVERRIDES`'s keys in that file) — some because auto-generation flattens their grids into an unusable flat array (`storyboardGrid`, `tableOfContents`, `castingGrid`, `locationOverview`, `moodboardProps`, `moodboardWardrobe`), the rest because their correct content doesn't exist in the raw template geometry at all (real platform mockup chrome, chevron shapes, a bezier connector, etc. — see "This is no longer a blanket..." above). Edit those by hand, in that file.

## How to test

```bash
cd tests
node smoke.js        # all 66 dispatch, both dark modes
node covertest.js    # 5 cover variants, asset resolution
node divtest.js      # 8 divider variants
node rotatetest.js   # photo rotation + determinism across 4 dispatch passes
```

Expected: 67 dispatched, 0 failures, 0 warnings.

In a browser: **serve over http, not `file://`** (`python -m http.server 8000`) — under `file://` the canvas is tainted and images link instead of embedding. **Install `Mazda Type Bold` and `Mazda Type`** or every metric will look wrong for reasons unrelated to the code.

## Non-obvious things that will bite

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
