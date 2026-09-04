# MMW Presentation Builder — Slide Template Layout Specification

**Source of truth:** `MMW PPT Template_7.24.26.pptx` — 66 slide layouts, 115 slides, 1 slide master
**Coordinate space:** engine-normalised **13.33 × 7.5 in** (see §1)
**Purpose:** Replaces the layout half of `mmw_presentation_builder_prompt.txt` (V1.0 / `standard-deck-mmw@ecb720e`), which documents 22 of the template's 66 layouts and carries a systematic typography error.

---

## 0. Read this first — three corrections to the current agent

### 0.1 The type scale in the current prompt is 2× too large — this is blocking

The template canvas is **26.667 × 15.0 in**, exactly 2× the engine's 13.33 × 7.5 in. The previous extraction correctly divided every **coordinate** by 2.0005 — `layoutCoverLight`'s title box `x:0.40 y:3.99 w:9.65 h:2.55` matches the template's `x:737820 y:7303923 cx:17649286 cy:4658122` EMU to the pixel — but carried **font sizes across unscaled**. Every value in the current prompt's §6.6 is a raw native measurement:

| Current prompt §6.6 | Native (26.67×15) | Correct engine value (13.33×7.5) |
|---|---|---|
| Cover title 109pt | `sz="10900"` | **54.5pt** |
| Divider title 109pt | `sz="10900"` | **54.5pt** |
| Divider tag 31pt | `sz="3100"` | **15.5pt** |
| Content title 70pt | `sz="7000"` | **35pt** |
| Headline 280pt | `sz="28000"` | **140pt** |
| TOC numbered list 60pt | `sz="6000"` | **30pt** |
| TOC heading 34pt | `sz="3400"` | **17pt** |
| Footer date 24pt | `sz="2400"` | **12pt** |

**Verification.** For each text box the required text height was compared against the box's inner height (box height minus `bodyPr` insets), under both models:

| Model | Mean fill ratio | Boxes overflowing |
|---|---|---|
| Native geometry + native pt (the source design) | 62% | 0 of 24 |
| Halved geometry + native pt (**current agent**) | 125% | **15 of 24** |
| Halved geometry + halved pt (**this spec**) | 62% | 0 of 24 |

Halving the type reproduces the source design's fit ratios row-for-row. Keeping native pt overflows the majority of text boxes — the Table of Contents list runs to 220% of its container, the divider title to 166%.

> **Every point size in this document is already in engine space.** Do not scale them again. To recover the native value, multiply by 2.

### 0.2 The layout inventory is 22 of 66

All 66 layouts are instantiated at least once in the 115-slide deck; none is vestigial. The current agent covers roughly a third and omits, among others: the whole 16-layout social/paid-media set, `Content 01`–`Content 09`, the 3-column and 2-row content families, the `Content Gray`/`Content Dark` reporting chassis used by 21 slides, the `Blank` canvases, and `Title & Bullets`.

### 0.3 The current agent's layout names do not match the template

The engine's names were invented during the first extraction and drifted from the template's own `slide_layout.name` values. The mapping is off by more than a rename — `content03` is built from slide 23, which uses the template layout **`Content 01`**:

| Engine name (current) | Actual template layout | Note |
|---|---|---|
| `content03` | `Content 01` | Slide 23 |
| `content04` | `Content 02` | Slide 24 |
| `content05` | `Content 03` | Slide 25 |
| `coverGeometric` | `Cover Light` + `Cover Dark` | Two layouts collapsed into one toggle |
| `coverLight` | `Cover Light2` | |
| `coverScenic` | `Cover Photo` | |
| `coverLogoCutout` | `Cover Photo2` | Not a "cutout" — it is a picture placeholder (§0.4) |
| `moodboardToneManner` | `Moodboard ` | Template name has a **trailing space** |
| `storyboardVO` / `storyboardGrid` | `Storyboard 01` / `Storyboard 02` | |
| `scriptsCompare` | `Scripts 01` | |
| `headline` | 4 separate layouts | See §8 |

This document uses the **template's own names verbatim** so the two artefacts can be reconciled. Note `Moodboard ` (trailing space), `Title & Bullets` (ampersand), and `1_Content -headline photo copy` (leading `1_`, irregular spacing) are the literal strings.

### 0.4 Corrections to specific layouts

- **`Cover Photo2` is not missing an asset.** The current prompt states no cutout graphic exists and `bgImage` is therefore required with no fallback. In fact the layout carries three **picture placeholders** (`pic` idx 21/22/23); idx 21 is a full-bleed image well at `x:1.24 y:-0.87 w:15.54 h:8.68` that deliberately bleeds off three edges. It is a user-fillable photo slot, not a missing brand asset.
- **`Cover Light` and `Cover Dark` have a subtitle** the engine drops — a 17pt placeholder at `x:0.38 y:4.82 w:7.87 h:1.24`.
- **`Location Overview`'s duplicate photos are real.** Three of the trailing photo wells carry placeholder index `4294967295` (unassigned) and two occupy the identical rectangle `x:10.78 y:3.70`. Preserved as-is, per the source.

---

## 1. Coordinate system and notation

| | |
|---|---|
| **Canvas** | 13.33 × 7.5 in (engine) — 26.667 × 15.0 in (template), scale factor **2.0005** |
| **Units** | Inches for geometry, points for type. All values engine-space. |
| **Origin** | Top-left. `x` = left edge, `y` = top edge. |
| **Negative / overflow values** | Intentional full-bleed. A shape at `x:-0.01 w:13.34` bleeds both side edges; `y:-0.87 h:8.68` bleeds top and bottom. Do not clamp these to the safe area. |
| **`x` / `y` / `w` / `h`** | Shape frame, not text extent. |
| **Insets** | `bodyPr` text insets, subtracted from the frame to give the text column. Common values: 0.025, 0.035, 0.069, 0.104 in. |
| **Anchor** | Vertical text anchor inside the frame: top / middle / bottom. Load-bearing on hero titles, which are bottom- or middle-anchored so they grow upward. |
| **~N char/line** | Advisory capacity at the stated size and column width (0.62 em advance for all-caps, 0.52 em mixed). Guidance for copy-fitting, not a hard limit. |

**Reading the tables.** Elements are listed top-to-bottom, then left-to-right — reading order, not z-order. Rows marked *fixed layout furniture* live on the slide layout, render on every slide using it, and are not per-slide editable.

---

## 2. Global canvas and grid

The template does not use one grid; it uses **four margin systems**, each tied to a family. Do not mix them.

| System | Left edge | Right edge | Column width | Used by |
|---|---|---|---|---|
| **A — Brand/hero** | 0.61 | 12.73 | 12.12 | Dividers, Thank You, report header chassis |
| **B — Cover** | 0.39–0.42 | 12.90–12.95 | 12.48–12.56 | Cover Dark / Light / Light2 / Photo |
| **C — Editorial** | 0.76–0.85 | ~13.2 | varies | Content 01–09, Video Reference, Moodboards |
| **D — Social rail** | 0.47 | 3.12 | 2.65 | All 16 social layouts (metadata rail) |

**Vertical anchors that recur across families**

| y | Meaning |
|---|---|
| 0.37 | MMW logo mark top |
| 0.54 | Eyebrow / tag baseline zone (report chassis) |
| 0.85 | Report title |
| 1.33 | Report sub-deck |
| 3.00 / 3.58 | Divider tag / divider title |
| 7.00 | Draft-date footer |
| 7.06 | WPP | Mazda lockup top |

**Full-bleed is normal.** 41% of content slides extend past the generic 6.80 in content limit. The dense grid layouts trade the footer for content room by design; `CONTENT_END` is not a ceiling in this template. It remains a real limit for hand-built raw compositions.

---

## 3. Brand system

### 3.1 Palette — as measured in the template

| Token | Hex | Role | Occurrences |
|---|---|---|---|
| `asphalt` | **#262626** | Slide master background, dark surfaces, light-bg title text | master + layouts |
| `paper` | **#EEEEEE** | Light surface, title text on dark | layouts |
| `spark` | **#C4A584** | Accent — divider and headline tags | 19 |
| `spark-dim` | **#BFA588** | Accent — report chassis eyebrow, Thank You Dark title | 22 |
| `title-gray` | **#919292** | Report chassis title | 12 |
| `gray` | **#808080** | Body copy (light surfaces) | 94 |
| `dk2` | **#5E5E5E** | Captions, labels, form text | 13 |
| `muted` | **#868686** | Draft-date footer, social secondary copy | 6 |
| `lt2` | **#D5D5D5** | Headline-light background, social rail fill | — |
| `divider-light` | **#F5F5F5** | `Divider Light` background only | — |
| `near-black` | **#1A1A1A** | Dark card fills in report components | 6 |
| `card-sand` | **#EAE7E0** | Storyboard 02 caption cards | 6 |
| `ink` | **#221F20** | Casting_Talent labels | — |

**Divider mood backgrounds** (solid fills, layout level):

| Variant | Hex |
|---|---|
| `Divider Asphalt` | #262626 (inherited from master) |
| `Divider Canopy` | #253724 |
| `Divider Aurora` | #2C283B |
| `Divider Tides` | #142A45 |
| `Divider Light` | #F5F5F5 |

> **Accent discrepancy — needs a brand-owner decision.** `brand.json` records MMW Spark as **#C4A484**. The template contains **#C4A584** in all 19 occurrences, and never #C4A484. A second, distinct accent **#BFA588** carries the report-chassis eyebrow across six layouts. That is three values in circulation for one "main accent". This spec reports what the file contains; it does not reconcile them. See §15.

### 3.2 Type

| | |
|---|---|
| **Display / headings** | **Mazda Type Bold** (theme `majorFont`, referenced as `+mj-lt`) |
| **Body / UI** | **Arial** (theme `minorFont`, `+mn-lt`) |
| **Fallback** | Helvetica, Arial, sans-serif |

`Mazda Type Regular` appears once; `Mazda Type Medium` — present in `brand.json` — is **not used anywhere in this template**.

**Engine-space type scale** (multiply by 2 for native):

| Role | Size | Font | Typical colour |
|---|---|---|---|
| Statement / headline | **140pt** | Mazda Type Bold | #FFFFFF |
| Hero title (cover, divider, thank you) | **54.5pt** | Mazda Type Bold | #EEEEEE / #262626 |
| Title & Bullets title | **42.5pt** | — | #000000 |
| Section title (content, storyboard, moodboard) | **35pt** | Mazda Type Bold | #808080 |
| Title & Bullets subtitle | **27.5pt** | — | #000000 |
| Report chassis title | **24pt** | Arial | #919292 |
| Cover subtitle | **17pt** | Arial | #EFEFEF / #262626 |
| Divider / headline tag | **15.5pt** | Arial bold | #C4A584 |
| Report chassis eyebrow | **14.5pt** | Arial | #BFA588 |
| Content subhead | **13pt** | Arial | #262626 |
| Draft-date footer | **12pt** | Arial | #868686 |
| Body copy | **10pt** | Arial | #808080 |
| Script / VO body | **9.5pt** | Arial | #000000 |
| Grid captions | **6.5–8pt** | Arial | #5E5E5E |

**Casing.** Hero titles, tags and eyebrows are set `cap="all"` — small-caps forcing at render time. Author the text in natural case and let the layout uppercase it; do not pre-uppercase strings.

**Line spacing.** 100% default. Tags and eyebrows run **90%**; the divider tag additionally carries **29.5pt space-before**. Location Overview captions run 120%.
---

## 4. Standard furniture

Five elements recur across families at fixed positions. Place them from this table, never by eye.

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| **MMW logo mark** (`gi0`) | 0.41 | 0.37 | 1.12 | 0.31 | Top-left. Aspect 3.66:1. |
| **WPP \| Mazda lockup** (`gi1`) | 0.42 | 7.06 | 1.02 | 0.19 | Bottom-left, below the safe area by design. Aspect 5.31:1. |
| **Draft-date footer** | 1.90 | 7.00 | 12.01 | 0.35 | 12pt Arial, **#868686**, left, middle-anchored. e.g. `FIRST DRAFT - MAY 29 • R2 - JUN 1` |
| **Slide number (dark chassis)** | 6.56 | 7.16 | 0.20 | 0.20 | 9pt, #000000, centred. Centre-bottom. |
| **Slide number (cover/social chassis)** | 6.54 | 7.15 | 0.25 | 0.24 | 12pt, #000000, centred. |

The lockup sits at `y:7.06` with height 0.19, ending at 7.25 — 0.25 in below the 7.00 safe-area line. This is deliberate; both marks and the footer occupy a band the content grid never enters.

### 4.1 Logo colour variants — an asset gap

The logo and lockup exist in **two colour variants**, selected by background:

| Background | Logo asset | Lockup asset | Status |
|---|---|---|---|
| Light (`Cover Light`, `Cover Light2`, `Cover Photo2`, `Thank You Light`) | `mmw_logo_black.png` 13968×3818 | `wpp_mazda_lockup_black.png` 308×58 | exported |
| Dark (`Cover Dark`, `Cover Photo`, `Thank You Dark`, all dark dividers) | `mmw_logo_white.png` 530×145 | `wpp_mazda_lockup_white.png` 308×58 | exported |

The original `MANIFEST.md` listed one asset per mark, so the white variants were missing — a black mark on `pattern_dark.png` is invisible. Both variants are now extracted and in `assets/logos/`, and the layout library selects between them automatically from `slideData.dark`. A third white master, `mmw_logo_white_lg.png` (571×157), drives the mid-slide mark on `Thank You Dark`. This reconciles with `brand.json`, which already names `MMW_Logo_Sig_WH.png` and `MMW_Logo_Sig_BL.png`.

> Note the size mismatch: the black logo is 13968×3818, the white is 530×145. Same artwork, very different masters. Confirm the white variant is high enough resolution for print.

### 4.2 Background assets

| Asset | Native | Used by |
|---|---|---|
| `pattern_light.png` | 8000×4500 | `Cover Light`, `Cover Light2` |
| `pattern_dark.png` | 8000×4500 | `Cover Dark`, `Divider Dark` |
| `pattern_light2.png` | 1920×1080 | `Divider Light2` |
| `pattern_dark2.png` | 1920×1080 | `Divider Dark2` |
| `scenic_photo.png` | 3840×2160 | `Cover Photo` |
| `headline_photo.png` | 3840×2160 | `Headline Photo Divider` |

All six are byte-identical matches against the template's embedded media. Every other background in the deck is a solid fill and needs no asset.

---

## 5. The photo placeholder convention

MMW layouts are photo-led. **123 picture placeholders**, spread across **36 of the 66 layouts**, carry `<p:ph type="pic">` — PowerPoint's native picture placeholder. (The 115 demo slides instantiate 121 of them.)

**This matters for the build.** A `type="pic"` placeholder exports as a real picture frame with native **"Change Picture…"** support — the user right-clicks and swaps their own image, keeping the frame's crop and position. A plain image or a drawn rectangle does not do this. Emit these as picture placeholders, not as shapes with a fill.

Rules:
1. Every photo well renders as a neutral, replaceable placeholder — never the template's own demo photograph.
2. Placeholders are always on. They are not counted against any per-deck image limit, and are not something to ask the user to enable.
3. Fill order follows placeholder `idx`, which is **not** visual order. `Content 03` runs idx 21 (hero) → 22 (far right) → 23 (small left) → 24 → 25. Sequence captions to the geometry, not the index.
4. Some wells carry idx `4294967295` (unassigned). Treat these as fixed decorative images, not user slots.

### 5.1 Template annotations must not ship

The template marks its own author-facing instructions in **#CB297B** (magenta). This is a systematic convention, not a one-off:

| Slide | Layout | Annotation text |
|---|---|---|
| 36 | `Storyboard 02` | "PLACE YOUR OWN IMAGES" — 12.5pt at `x:3.21 y:2.78 w:4.23 h:0.25` |
| 55 | `Meta_Divider` | "PLACE YOUR OWN IMAGE" ×2, "click here" ×2 |
| 59 | `Pinterest_Divider` | same set |
| 62 | `TikTok_Divider` | same set |
| 65 | `Reddit_Divider` | same set |
| 69 | `Youtube_Divider` | same set |

**#CB297B is not a brand colour** — it appears nowhere else in the template and in no palette. Treat any text in this colour as an authoring note and **strip it on build**. The five social dividers each carry four such notes; emitting them verbatim would ship "click here" into a client deck.
---

## 6. Covers — 5 layouts

Five openers. All share the logo/lockup/draft-date furniture from §4 and place the hero title in the **lower half**, bottom- or middle-anchored so it grows upward as the title wraps. Choose by background treatment, not by tone.

| Layout | Background | Title box | Subtitle? | Pick it for |
|---|---|---|---|---|
| `Cover Light` | `pattern_light.png` | 12.56 wide, 1 line | yes (unused in demo) | Default light brand cover |
| `Cover Dark` | `pattern_dark.png` | 12.56 wide, 1 line | yes (unused in demo) | Default dark brand cover |
| `Cover Light2` | `pattern_light.png` | **9.65 wide, 2.55 tall** | no | Long titles that must wrap to 2–3 lines |
| `Cover Photo` | `scenic_photo.png` | 12.48 wide | **yes, 17pt** | Photography-led opener |
| `Cover Photo2` | solid #EEEEEE + photo well | **6.48 wide** | no | Image-forward cover, title in a narrow left column |

**The Light/Dark pair are one design in two colourways.** Identical geometry; only background asset and text colour change (#262626 → #EEEEEE). Build them as a single layout with a `dark` toggle.

**`Cover Light2` is genuinely distinct** — a taller, narrower title well (9.65 × 2.55 at y:3.99) sized for a natural two-line wrap, against `Cover Light`'s single 1.12-tall line at y:4.40. It is not a duplicate.

**Demo-slide deviation.** Slides 6 and 7 override their layout: the layout defines the title at `y:2.40 h:2.42` plus a 17pt subtitle at `y:4.82 w:7.87`, but both demo slides discard that and drop a free 12.56-wide text box at `y:4.40`. The tables below follow the demo slides (per project decision), so **the subtitle slot is available but not shown** — reinstate it at `x:0.38 y:4.82 w:7.87 h:1.24`, 17pt, if a cover needs a standfirst.

### Cover Light

Default light cover. Title middle-anchored in a full-width box; the lockup and draft date pin the bottom-left.

**Template name:** `Cover Light`  |  **Slides:** 6  |  **Spec'd from:** slide 6
**Background:** full-bleed image — asset `pattern_light.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 0.41 | 0.37 | 1.12 | 0.31 | — | — | — | — / top | asset `mmw_logo_black.png` |
| hero title | 0.39 | 4.4 | 12.56 | 1.12 | **54.5pt** | Mazda Type Bold | #262626 asphalt | left / middle | ALL CAPS; e.g. "Lorem ipsum"; ~26 char/line |
| subhead | 1.9 | 7.0 | 12.01 | 0.35 | **12.0pt** | Arial | #868686 muted | left / middle | e.g. "FIRST DRAFT - MAY 29 • R2 - JUN 1" |
| image (fixed asset) | 0.42 | 7.06 | 1.02 | 0.19 | — | — | — | — / top | asset `wpp_mazda_lockup_black.png` |

### Cover Dark

Colourway twin of `Cover Light` — same geometry, `pattern_dark.png` background, #EEEEEE title. Requires the **white** logo and lockup (§4.1).

**Template name:** `Cover Dark`  |  **Slides:** 7  |  **Spec'd from:** slide 7
**Background:** full-bleed image — asset `pattern_dark.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 0.41 | 0.37 | 1.12 | 0.31 | — | — | — | — / top | asset `mmw_logo_white.png` |
| hero title | 0.39 | 4.4 | 12.56 | 1.12 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / middle | ALL CAPS; e.g. "Lorem ipsum"; ~26 char/line |
| subhead | 1.9 | 7.0 | 12.01 | 0.35 | **12.0pt** | Arial | #868686 muted | left / middle | e.g. "FIRST DRAFT - MAY 29 • R2 - JUN 1" |
| image (fixed asset) | 0.42 | 7.06 | 1.02 | 0.19 | — | — | — | — / top | asset `wpp_mazda_lockup_white.png` |

### Cover Light2

Wrapping cover. The 2.55-tall well holds two 54.5pt lines comfortably (2 × 54.5pt = 1.51 in against a 2.34 in inner height). Top-anchored, so a one-line title sits high and leaves a deliberate gap beneath — that is the design, not an error.

**Template name:** `Cover Light2`  |  **Slides:** 1  |  **Spec'd from:** slide 1
**Background:** full-bleed image — asset `pattern_light.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 0.41 | 0.37 | 1.12 | 0.31 | — | — | — | — / top | asset `mmw_logo_black.png` |
| hero title | 0.4 | 3.99 | 9.65 | 2.55 | **54.5pt** | Mazda Type Bold | #262626 asphalt | left / top | ALL CAPS; e.g. "Mazda motion works"; ~20 char/line |
| subhead | 1.9 | 7.0 | 12.01 | 0.35 | **12.0pt** | Arial | #868686 muted | left / middle | e.g. "FIRST DRAFT - MAY 29 • R2 - JUN 1" |
| image (fixed asset) | 0.42 | 7.06 | 1.02 | 0.19 | — | — | — | — / top | asset `wpp_mazda_lockup_black.png` |

**Spacing:** title left edge 0.40 with a 0.104 inset → text starts at 0.50. Right edge 10.05, leaving 3.28 in of open pattern to the right. Do not widen the box to fill it.

### Cover Photo

Full-bleed photographic cover. The only cover with an active subtitle, and the only one with **no draft-date footer** — it trades the footer for photo room.

**Template name:** `Cover Photo`  |  **Slides:** 8, 9  |  **Spec'd from:** slide 8
**Background:** full-bleed image — asset `image40.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 0.41 | 0.37 | 1.12 | 0.31 | — | — | — | — / top | asset `mmw_logo_white.png` |
| hero title | 0.42 | 4.7 | 12.48 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / middle | ALL CAPS; e.g. "Lorem ipsum"; ~26 char/line |
| eyebrow / tag | 0.42 | 5.65 | 12.48 | 0.33 | **17.0pt** | Arial | #FFFFFF white | left / top | ALL CAPS; line 90%; e.g. "Lorem ipsum sit met"; ~84 char/line |
| image (fixed asset) | 0.42 | 7.06 | 1.02 | 0.19 | — | — | — | — / top | asset `wpp_mazda_lockup_white.png` |

**Spacing:** title bottom 5.68, subtitle top 5.65 — they overlap by 0.03 in. The title is middle-anchored in a 0.98 box and the subtitle is `spAutoFit`, so at the demo's one-line title they do not collide. If the title wraps to two lines it **will** overlap the subtitle. Use a one-line title here, or drop the subtitle.

### Cover Photo2

Image-forward cover. Three picture placeholders: idx 21 is the image well, idx 22/23 are the logo and lockup as *replaceable* slots rather than fixed furniture — unusual, and the reason this layout can be re-skinned.

**Template name:** `Cover Photo2`  |  **Slides:** 10, 11  |  **Spec'd from:** slide 10
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 1.99 | -0.02 | 11.43 | 7.57 | — | Arial | — | right / top | asset `image41.tif`; ph idx 21 |
| photo placeholder | 0.41 | 0.37 | 1.12 | 0.31 | — | Arial | — | right / top | asset `mmw_logo_black.png`; ph idx 22 |
| hero title | 0.39 | 4.37 | 6.48 | 1.12 | **54.5pt** | Mazda Type Bold | #262626 asphalt | left / bottom | ALL CAPS; e.g. "Lorem ipsum"; ~13 char/line |
| photo placeholder | 0.42 | 7.06 | 1.02 | 0.19 | — | Arial | — | right / top | asset `wpp_mazda_lockup_black.png`; ph idx 23 |

**Spacing:** the image well is `x:1.24 y:-0.87 w:15.54 h:8.68` at layout level — it bleeds off the top, right and bottom deliberately. Demo slide 10 tames it to `x:1.99 y:-0.02 w:11.43 h:7.57`. Either is valid; the layout value is the designed intent. The title column is only 6.48 wide (~15 characters per line at 54.5pt all-caps), so this layout needs a **short** title.
---

## 7. Dividers — 8 layouts, one design

The eight divider layouts are **one composition in eight backgrounds**. Tag and title geometry are byte-identical across all eight; only the background and the title colour change. Build one layout with a `bgVariant` switch.

**The shared chassis — identical in all 8:**

| Element | x | y | w | h | Size | Font | Colour | Anchor |
|---|---|---|---|---|---|---|---|---|
| Eyebrow tag | 0.61 | 3.00 | 12.12 | 0.56 | **15.5pt** | Arial **bold** | **#C4A584** | bottom |
| Section title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE or #262626 | top |

Both `cap="all"`. The tag runs **90% line spacing with 29.5pt space-before**; the title runs 100%. The 0.02 in gap between tag bottom (3.56) and title top (3.58) is intentional — the tag is bottom-anchored and the title top-anchored, so they close on each other and read as a locked pair regardless of tag length.

**The tag colour is #C4A584 in all eight variants — it does not follow the background mood.** A Canopy divider still carries a Spark tag. Do not recolour the tag to match the family; the source design keeps the accent constant.

**Variant table**

| Layout | Background | Title colour | Slide-number position |
|---|---|---|---|
| `Divider Dark` | image `pattern_dark.png` | #EEEEEE | centre-bottom 6.56 / 7.16 |
| `Divider Dark2` | image `pattern_dark2.png` | #EEEEEE | centre-bottom |
| `Divider Light` | solid **#F5F5F5** | #262626 | **top-right 12.49 / 0.22** |
| `Divider Light2` | image `pattern_light2.png` | #262626 | **top-right 12.49 / 0.22** |
| `Divider Asphalt` | inherits master **#262626** | #EEEEEE | centre-bottom |
| `Divider Canopy` | solid **#253724** | #EEEEEE | centre-bottom |
| `Divider Aurora` | solid **#2C283B** | #EEEEEE | centre-bottom |
| `Divider Tides` | solid **#142A45** | #EEEEEE | centre-bottom |

> The two light variants move the slide number to the **top right** (`x:12.49 y:0.22 w:0.58 h:0.20`, colour #191919). The six dark variants keep it centre-bottom. Carry this through — it is a consistent, deliberate difference, not noise.

**Colour-family overlay.** `Divider Canopy`, `Aurora` and `Tides` carry a near-invisible tint shape at `x:4.03 y:-1.68 w:15.50 h:12.77` — #EEEEEE at **2.7% alpha**, rotated off-canvas. It lifts the right side of the field very slightly. Reproduce it or omit it; at 2.7% it is close to imperceptible, but it is in the source.

**Background drift from `brand.json`.** Canopy `#253724` vs ramp `#203822`; Aurora `#2C283B` vs `#2D273D`; Tides `#142A45` vs `#0B2A47`. Asphalt is an exact match. Use the divider values above for dividers. See §15.

### Divider Dark

**Template name:** `Divider Dark`  |  **Slides:** 5, 12, 21, 54, 71, 102  |  **Spec'd from:** slide 12
**Background:** full-bleed image — asset `pattern_dark.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "NAVIGATION"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "DIVIDERS"; ~25 char/line |

### Divider Dark2

**Template name:** `Divider Dark2`  |  **Slides:** 15  |  **Spec'd from:** slide 15
**Background:** full-bleed image — asset `pattern_dark2.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Light

**Template name:** `Divider Light`  |  **Slides:** 14  |  **Spec'd from:** slide 14
**Background:** solid **#F5F5F5** (divider-light)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 4.03 | -1.68 | 15.5 | 12.77 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #EEEEEE; ~133 char/line |
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #262626 asphalt | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Light2

**Template name:** `Divider Light2`  |  **Slides:** 13  |  **Spec'd from:** slide 13
**Background:** full-bleed image — asset `pattern_light2.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #262626 asphalt | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Asphalt

**Template name:** `Divider Asphalt`  |  **Slides:** 16  |  **Spec'd from:** slide 16
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 4.03 | -1.68 | 15.5 | 12.77 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EEEEEE @3% α; ~133 char/line |
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Canopy

**Template name:** `Divider Canopy`  |  **Slides:** 17, 103  |  **Spec'd from:** slide 17
**Background:** solid **#253724**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 4.03 | -1.68 | 15.5 | 12.77 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EEEEEE @3% α; ~133 char/line |
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Aurora

**Template name:** `Divider Aurora`  |  **Slides:** 18, 109  |  **Spec'd from:** slide 18
**Background:** solid **#2C283B**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 4.03 | -1.68 | 15.5 | 12.77 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EEEEEE @3% α; ~133 char/line |
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

### Divider Tides

**Template name:** `Divider Tides`  |  **Slides:** 19, 20, 107, 113  |  **Spec'd from:** slide 19
**Background:** solid **#142A45**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 4.03 | -1.68 | 15.5 | 12.77 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EEEEEE @3% α; ~133 char/line |
| image (fixed asset) | 4.07 | -0.01 | 9.28 | 7.5 | — | — | — | — / top | asset `mmw_logo_black.png` |
| eyebrow / tag | 0.61 | 3.0 | 12.12 | 0.56 | **15.5pt** | Arial | #C4A584 spark | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsuM"; ~89 char/line |
| hero title | 0.61 | 3.58 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #EEEEEE paper | left / top | ALL CAPS; e.g. "Lorem ipsum"; ~25 char/line |

---

## 8. Statement / headline — 4 layouts, one design

Four layouts share a single oversized-statement composition and differ **only** in background. Like the dividers, build one layout with a variant switch.

**The shared chassis — identical in all 4:**

| Element | x | y | w | h | Size | Font | Colour | Anchor |
|---|---|---|---|---|---|---|---|---|
| Annotation tag | 2.92 | 2.42 | 7.49 | 0.42 | **15.5pt** | Arial bold | **#C4A584** | bottom |
| Statement | 0.12 | 2.84 | 13.09 | 4.66 | **140pt** | Mazda Type Bold | **#FFFFFF** | top |

**The statement is #FFFFFF on every variant — including the light one.** White on `Content - Headline light`'s #D5D5D5 background is roughly 1.5:1 contrast and fails WCAG AA badly. This is the source design, confirmed in all four layouts. Match it, and flag it in speaker notes — do not silently substitute a darker colour the real design does not use. The name "light"/"dark" refers to the **background**, not to a text toggle.

**Sizing.** At 140pt the statement is 1.94 in per line in a 4.66 in box — **two lines maximum**, and the box runs from 2.84 to 7.50, hard to the bottom edge. The tag is indented to `x:2.92`, not aligned to the statement's 0.12 — a deliberate offset. Keep it.

| Layout | Background |
|---|---|
| `Content - Headline light` | solid **#D5D5D5** |
| `Content -headline dark` | inherits master **#262626** |
| `Headline Photo Divider` | image `headline_photo.png` |
| `1_Content -headline photo copy` | **picture placeholder**, full-bleed `x:0 y:0 w:13.33 h:8.89` |

The last is the useful one: it is the photo variant with a **user-replaceable** image well rather than a baked-in background. Prefer it over `Headline Photo Divider` when the image should change per deck. Note the irregular template name — leading `1_`, and a space before `headline`.

### Content - Headline light

**Template name:** `Content - Headline light`  |  **Slides:** 32  |  **Spec'd from:** slide 32
**Background:** solid **#D5D5D5** (lt2)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 2.92 | 2.42 | 7.49 | 0.42 | **15.5pt** | Arial | #C4A584 spark | center / bottom | ALL CAPS; line 90%; e.g. "LOREM IPSUM"; ~55 char/line |
| statement title | 0.12 | 2.84 | 13.09 | 4.66 | **140.0pt** | Mazda Type Bold | #FFFFFF white | center / top | ALL CAPS; line 90%; e.g. "lorem"; ~10 char/line |

### Content -headline dark

**Template name:** `Content -headline dark`  |  **Slides:** 33  |  **Spec'd from:** slide 33
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 6.29 | -0.44 | 0.69 | 0.3 | — | — | — | — / top | asset `image18.png` |
| eyebrow / tag | 2.92 | 2.42 | 7.49 | 0.42 | **15.5pt** | Arial | #C4A584 spark | center / bottom | ALL CAPS; line 90%; e.g. "LOREM IPSUM"; ~55 char/line |
| statement title | 0.12 | 2.84 | 13.09 | 4.66 | **140.0pt** | Mazda Type Bold | #FFFFFF white | center / top | ALL CAPS; line 90%; e.g. "lorem"; ~10 char/line |

### Headline Photo Divider

**Template name:** `Headline Photo Divider`  |  **Slides:** 41  |  **Spec'd from:** slide 41
**Background:** full-bleed image — asset `headline_photo.png`

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 2.92 | 2.42 | 7.49 | 0.42 | **15.5pt** | Arial | #C4A584 spark | center / bottom | ALL CAPS; line 90%; e.g. "LOREM IPSUM"; ~55 char/line |
| statement title | 0.12 | 2.84 | 13.09 | 4.66 | **140.0pt** | Mazda Type | #FFFFFF white | center / top | ALL CAPS; line 90%; e.g. "lorem"; ~10 char/line |

### 1_Content -headline photo copy

**Template name:** `1_Content -headline photo copy`  |  **Slides:** 31, 34  |  **Spec'd from:** slide 31
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| hero title | 0.52 | 2.66 | 12.29 | 1.44 | **74.0pt** | Mazda Type Bold | #FFFFFF white | center / bottom | ALL CAPS; e.g. "LOREM"; ~18 char/line |
| subhead | 0.52 | 4.05 | 12.29 | 1.57 | **17.5pt** | Arial | #C4A584 spark | center / top | e.g. "Lorem ipsum dolor sit amet, consectetur "; ~95 char/line |
---

## 9. Agenda and closing — 3 layouts

### Table of contents

A bespoke composition, unlike anything else in the deck: a small heading parked top-left, a single large numbered list occupying the right two-thirds, and two decorative photographs bleeding off the right edge.

**Do not build the list as separate text boxes.** It is **one** text frame at `x:5.42 y:0.40 w:7.58 h:4.37`, 30pt at **110% line spacing**, holding all ten entries as paragraphs.

**Capacity:** each line occupies 0.46 in (30pt × 110%). The inner height is 4.16 in (4.37 less 0.104 insets top and bottom), so **9 entries fit**. The source ships **10**, which fills 110% of the frame and oversets by one line. Cap agendas at **9 entries**; at 10 the last item is clipped.

### Table of contents

**Template name:** `Table of contents`  |  **Slides:** 22  |  **Spec'd from:** slide 22
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 6.41 | -0.01 | 6.93 | 3.25 | — | — | — | — / top | asset `image11.png` |
| section title | 5.42 | 0.4 | 7.58 | 4.63 | **30.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "01 Introduce the problem"; ~34 char/line |
| eyebrow / tag | 0.29 | 0.43 | 2.81 | 0.72 | **17.0pt** | Arial | #808080 gray | left / top | ALL CAPS; line 90%; e.g. "SubtitleTable of contents"; ~17 char/line |
| image (fixed asset) | 3.67 | 3.24 | 9.67 | 4.28 | — | — | — | — / top | asset `image11.png` |
| body / caption | 0.29 | 6.33 | 4.02 | 0.89 | **10.0pt** | Arial | #808080 gray | left / bottom | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

**Spacing:** heading column is 0.29 → 3.10; list column 5.42 → 13.00. The 2.3 in gutter between them is the layout's defining move. Number prefixes (`01`, `02`) are part of the paragraph text, not an auto-list — write them into the string.

### Thank You — 2 layouts

A matched pair, but **not symmetrical** — the two differ in more than colour, and the asymmetry is intentional.

| | `Thank You Light` | `Thank You Dark` |
|---|---|---|
| Background | solid #FFFFFF + full-bleed image | inherits master #262626 + full-bleed image |
| Title | **#262626**, y:3.31 | **#BFA588** (accent), y:3.29 |
| Draft-date footer | **present** | present |
| Lockup | fixed image | **picture placeholder** (idx 22) |

Both carry a full-bleed image at `x:-0.01 y:0.02 w:13.34 h:7.50` and a second mark at `x:0.49 y:3.51 w:1.90 h:0.52` sitting directly on the title line. The dark variant's accent-coloured title is the distinguishing feature — #BFA588 on #262626, the only place a title takes the accent.

### Thank You Light

**Template name:** `Thank You Light`  |  **Slides:** 52  |  **Spec'd from:** slide 52
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | -0.01 | 0.02 | 13.34 | 7.5 | — | — | — | — / top | asset `image11.png` |
| hero title | 0.61 | 3.31 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #262626 asphalt | right / top | ALL CAPS; e.g. "THANK YOU"; ~25 char/line |
| image (fixed asset) | 0.49 | 3.51 | 1.9 | 0.52 | — | — | — | — / top | asset `mmw_logo_black.png` |
| subhead | 1.9 | 7.0 | 12.01 | 0.35 | **12.0pt** | Arial | #868686 muted | left / middle | e.g. "FIRST DRAFT - MAY 29 • R2 - JUN 1" |
| image (fixed asset) | 0.42 | 7.06 | 1.02 | 0.19 | — | — | — | — / top | asset `wpp_mazda_lockup_black.png` |

### Thank You Dark

**Template name:** `Thank You Dark`  |  **Slides:** 53, 115  |  **Spec'd from:** slide 53
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | -0.01 | 0.02 | 13.34 | 7.5 | — | — | — | — / top | asset `image12.png` |
| hero title | 0.61 | 3.29 | 12.12 | 0.98 | **54.5pt** | Mazda Type Bold | #BFA588 spark-dim | right / top | ALL CAPS; e.g. "THANK YOU"; ~25 char/line |
| image (fixed asset) | 0.49 | 3.51 | 1.9 | 0.52 | — | — | — | — / top | asset `image13.png` |
| subhead | 1.9 | 7.0 | 12.01 | 0.35 | **12.0pt** | — | #868686 muted | — / middle | e.g. "FIRST DRAFT - MAY 29 • R2 - JUN 1" |
| photo placeholder | 0.42 | 7.06 | 1.02 | 0.19 | — | Arial | — | right / top | asset `image101.png`; ph idx 22 |
---

## 10. Editorial content — 13 layouts

The workhorse family: a title block plus an asymmetric photo arrangement. There is **no `Content 04`** in the template — the numbering runs 01, 02, 03, 05, 06, 07, 08, 09.

**The shared editorial title stack.** Most of this family stacks three elements in a left column, in this order top-to-bottom:

| Role | Size | Colour | Note |
|---|---|---|---|
| Section title | **35pt** | #808080 (light bg) / #FFFFFF (dark) | `cap="all"`, Mazda Type Bold |
| Subhead | **13pt** | #262626 | optional |
| Body copy | **10pt** | #808080 | optional |

In `Content 05`–`Content 09` the stack sits at `x:0.80–0.85` and reads title (y:1.99) → subhead (y:2.82) → body (y:3.51), giving **0.83 in** title-to-subhead and **0.69 in** subhead-to-body. Hold those gaps; they are consistent across five layouts.

**Choosing between them**

| Layout | Photo wells | Arrangement | Pick it for |
|---|---|---|---|
| `Content 01` | 2 | Two large panels, offset diagonally | A simple before/after or two-beat comparison |
| `Content 02` | 5 | One wide panel + 4-up strip above | Gallery with a hero |
| `Content 03` | 5 | One wide panel + 4-up strip below | Gallery, hero on top |
| `Content 05` | 1 | Single large panel, text left | One strong image |
| `Content 06` | 2 | Two stacked panels, text left | Two images, vertical pair |
| `Content 07` | 2 | Two panels side by side, title top | Wide pair, header across the top |
| `Content 08` | 4 | Tall left + mixed right | Dense mixed-ratio board |
| `Content 09` | 4 | Tall right + 3-up bottom row | Dense mixed-ratio board, mirrored |
| `Content - 3 columns - Light/Dark` | 0 | Three text columns | Three parallel points, no imagery |
| `Content 2 Rows - Light/Dark` | 1 | Two labelled rows beside one panel | Two-step process with a supporting image |
| `Content - 2 rows - Light` | 1 | as above, light-only variant | — |

**`Content 08` and `Content 09` are mirrors, not duplicates.** Both are 4-well mixed-ratio boards with the same 35pt/13pt/10pt stack; 08 puts its tall well at `x:7.06` (centre) with two stacked right wells, 09 puts its tall well at `x:9.85` (far right) with a 3-up bottom row. Both ship the placeholder title "MOODBOARD" — they are moodboard variants despite the `Content` naming.

### Content 01

**Template name:** `Content 01`  |  **Slides:** 23  |  **Spec'd from:** slide 23
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 6.62 | 0.47 | 6.71 | 3.44 | — | Arial | — | right / top | asset `image41.tif`; ph idx 22 |
| section title | 0.76 | 3.2 | 5.52 | 0.6 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "LOREM IPSUM"; ~21 char/line |
| photo placeholder | 0.81 | 4.06 | 6.73 | 3.44 | — | Arial | — | right / top | asset `image44.png`; ph idx 21 |
| body / caption | 7.83 | 4.1 | 4.16 | 1.44 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

### Content 02

**Template name:** `Content 02`  |  **Slides:** 24  |  **Spec'd from:** slide 24
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.76 | 1.38 | 6.09 | 0.6 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "LOREM IPSUM"; ~23 char/line |
| body / caption | 9.51 | 2.01 | 2.99 | 1.79 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 0.81 | 2.05 | 2.31 | 1.75 | — | Arial | — | right / top | asset `image45.tif`; ph idx 23 |
| photo placeholder | 3.2 | 2.05 | 1.4 | 1.75 | — | Arial | — | right / top | asset `image46.png`; ph idx 24 |
| photo placeholder | 4.67 | 2.05 | 2.71 | 1.75 | — | Arial | — | right / top | asset `image44.png`; ph idx 25 |
| photo placeholder | 7.45 | 2.05 | 1.64 | 1.75 | — | Arial | — | right / top | asset `image47.png`; ph idx 26 |
| photo placeholder | 0.81 | 3.87 | 8.29 | 3.29 | — | Arial | — | right / top | asset `image41.tif`; ph idx 22 |

### Content 03

**Template name:** `Content 03`  |  **Slides:** 25  |  **Spec'd from:** slide 25
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.63 | 2.01 | 4.23 | 0.6 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "LOREM IPSUM"; ~16 char/line |
| photo placeholder | 5.06 | 2.03 | 8.01 | 3.28 | — | Arial | — | right / top | asset `image41.tif`; ph idx 21 |
| body / caption | 0.65 | 2.66 | 3.31 | 1.79 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 3.52 | 5.42 | 1.45 | 1.75 | — | Arial | — | right / top | asset `image46.png`; ph idx 23 |
| photo placeholder | 5.02 | 5.42 | 2.85 | 1.74 | — | Arial | — | right / top | asset `image44.png`; ph idx 24 |
| photo placeholder | 7.98 | 5.42 | 1.64 | 1.75 | — | Arial | — | right / top | asset `image47.png`; ph idx 25 |
| photo placeholder | 9.75 | 5.42 | 3.31 | 1.75 | — | Arial | — | right / top | asset `image45.tif`; ph idx 22 |

### Content 05

**Template name:** `Content 05`  |  **Slides:** 38  |  **Spec'd from:** slide 38
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 5.04 | 1.59 | 8.22 | 5.01 | — | Arial | — | right / top | asset `image58.png`; ph idx 21 |
| section title | 0.8 | 1.99 | 3.65 | 0.68 | **35.0pt** | Mazda Type | #808080 gray | left / bottom | line 80%; e.g. "CX-00"; ~13 char/line |
| subhead | 0.8 | 2.82 | 3.65 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~36 char/line |
| body / caption | 0.8 | 3.51 | 3.65 | 1.76 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

### Content 06

**Template name:** `Content 06`  |  **Slides:** 39  |  **Spec'd from:** slide 39
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 5.95 | 0.13 | 7.4 | 3.62 | — | Arial | — | right / top | asset `image58.png`; ph idx 21 |
| section title | 0.8 | 1.99 | 3.65 | 0.68 | **35.0pt** | Mazda Type | #808080 gray | left / bottom | line 80%; e.g. "CX-00"; ~13 char/line |
| subhead | 0.8 | 2.82 | 3.65 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~36 char/line |
| subhead | 0.8 | 2.82 | 3.65 | 0.36 | **13.0pt** | — | #262626 asphalt | — / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~36 char/line |
| body / caption | 0.8 | 3.51 | 3.65 | 1.76 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| shape | 0.8 | 3.51 | 3.65 | 1.76 | — | — | — | — / top | — |
| photo placeholder | 5.95 | 4.01 | 7.39 | 3.5 | — | Arial | — | right / top | asset `image58.png`; ph idx 22 |

### Content 07

**Template name:** `Content 07`  |  **Slides:** 40  |  **Spec'd from:** slide 40
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 1.53 | 0.79 | 3.65 | 0.69 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "CX-00"; ~13 char/line |
| subhead | 5.44 | 0.79 | 6.37 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~65 char/line |
| body / caption | 5.44 | 1.21 | 6.37 | 1.24 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 0.08 | 2.91 | 6.55 | 4.11 | — | Arial | — | right / top | asset `image58.png`; ph idx 26 |
| photo placeholder | 6.67 | 2.91 | 6.55 | 4.11 | — | Arial | — | right / top | asset `image58.png`; ph idx 22 |

### Content 08

**Template name:** `Content 08`  |  **Slides:** 42  |  **Spec'd from:** slide 42
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.85 | 1.03 | 6.84 | 0.69 | **35.0pt** | Mazda Type Bold | #808080 gray | left / bottom | line 80%; e.g. "MOODBOARD"; ~26 char/line |
| photo placeholder | 7.06 | 1.11 | 2.92 | 5.95 | — | Arial | — | right / top | asset `image59.png`; ph idx 21 |
| photo placeholder | 10.12 | 1.11 | 2.86 | 2.47 | — | Arial | — | right / top | asset `image47.png`; ph idx 25 |
| subhead | 0.85 | 1.78 | 2.84 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~28 char/line |
| body / caption | 0.85 | 2.53 | 2.74 | 2.47 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 10.12 | 3.71 | 2.86 | 2.79 | — | Arial | — | right / top | asset `image41.tif`; ph idx 27 |
| photo placeholder | 4.42 | 4.68 | 2.51 | 2.38 | — | Arial | — | right / top | asset `image60.jpeg`; ph idx 22 |
| shape | 11.3 | 5.36 | 0.46 | 2.94 | — | — | — | — / top | — |

### Content 09

**Template name:** `Content 09`  |  **Slides:** 43  |  **Spec'd from:** slide 43
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.85 | 1.03 | 6.84 | 0.69 | **35.0pt** | Mazda Type Bold | #808080 gray | left / bottom | line 80%; e.g. "MOODBOARD"; ~26 char/line |
| photo placeholder | 9.85 | 1.12 | 3.16 | 5.99 | — | Arial | — | right / top | asset `image59.png`; ph idx 21 |
| subhead | 0.85 | 1.75 | 6.84 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~70 char/line |
| body / caption | 0.85 | 2.22 | 5.58 | 2.12 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 1.01 | 4.69 | 3.13 | 2.42 | — | Arial | — | right / top | asset `image47.png`; ph idx 24 |
| photo placeholder | 4.24 | 4.69 | 2.96 | 2.41 | — | Arial | — | right / top | asset `image60.jpeg`; ph idx 22 |
| photo placeholder | 7.3 | 4.69 | 2.46 | 2.41 | — | Arial | — | right / top | asset `image41.tif`; ph idx 27 |
| shape | 0.85 | 4.71 | 0.1 | 2.4 | — | — | — | — / top | — |

### The 3-column pair

Two colourways of one text-only layout. Three columns, each a subhead + body pair. Subhead left edges **0.90 / 5.02 / 9.08** at width 2.97 — pitch 4.12 then 4.06, so gutters are **1.15 and 1.09**, very slightly irregular. Body boxes are wider (3.40) and start 0.03 to the left (0.87 / 5.00 / 9.05), an optical offset rather than an error. If you regularise the grid, use pitch 4.09 and keep the 0.03 body offset.

Title spans the full width at `x:0.90 y:1.91 w:11.53`, 35pt. Subheads at y:3.05 (13pt), bodies at y:3.96 (10pt).

| Variant | Background | Title | Subhead | Body |
|---|---|---|---|---|
| `Content - 3 columns - Dark` | master #262626 | #FFFFFF | #D5D5D5 | #808080 |
| `Content - 3 columns - Light` | #EEEEEE | #262626 | #262626 | #808080 |

### Content - 3 columns - Dark

**Template name:** `Content - 3 columns - Dark`  |  **Slides:** 29  |  **Spec'd from:** slide 29
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.9 | 1.91 | 11.53 | 0.79 | **35.0pt** | Mazda Type Regular | #FFFFFF white | left / bottom | line 80%; e.g. "LOREM IPSUM"; ~44 char/line |
| subhead | 0.9 | 3.05 | 2.97 | 0.69 | **13.0pt** | Arial | #D5D5D5 lt2 | left / bottom | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~29 char/line |
| subhead | 5.02 | 3.2 | 2.97 | 0.54 | **13.0pt** | Arial | #D5D5D5 lt2 | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~31 char/line |
| subhead | 9.08 | 3.2 | 2.97 | 0.54 | **13.0pt** | Arial | #D5D5D5 lt2 | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~31 char/line |
| body / caption | 0.87 | 3.96 | 3.4 | 1.59 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 5.0 | 3.96 | 3.4 | 1.44 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 9.05 | 3.96 | 3.4 | 1.44 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

### Content - 3 columns - Light

**Template name:** `Content - 3 columns - Light`  |  **Slides:** 30  |  **Spec'd from:** slide 30
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.9 | 1.91 | 11.53 | 0.79 | **35.0pt** | Mazda Type Bold | #808080 gray | left / bottom | line 80%; e.g. "LOREM IPSUM"; ~44 char/line |
| subhead | 0.9 | 3.05 | 2.97 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~29 char/line |
| subhead | 5.02 | 3.05 | 2.97 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~29 char/line |
| subhead | 9.08 | 3.05 | 2.97 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~29 char/line |
| body / caption | 0.87 | 3.96 | 3.4 | 1.59 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 5.0 | 3.96 | 3.4 | 1.59 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 9.05 | 3.96 | 3.4 | 1.59 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

### The 2-row family — 3 layouts

A left title block, a vertical rule, and two stacked label+body rows beside a large photo panel. The vertical rule at `x:5.13 y:1.96 h:4.01` (zero width — a line, not a box) separates the title column from the rows.

Row 1 label y:2.11, body y:2.60. Row 2 label y:3.84, body y:4.32. **Row pitch is 1.73 in.**

`Content 2 Rows - Light` is the most-used content layout in the deck (6 slides: 2, 3, 28, 104, 105, 106), and every instance composes its body differently — treat the header and rule as the fixed chassis and the panel area as free.

### Content 2 Rows - Dark

**Template name:** `Content 2 Rows - Dark`  |  **Slides:** 4, 26  |  **Spec'd from:** slide 4
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 6.03 | 0.28 | 4.64 | 0.32 | **17.0pt** | Arial | #BFA588 spark-dim | left / middle | ALL CAPS; line 90%; e.g. "these are your approved colors"; ~31 char/line |
| eyebrow / tag | 6.03 | 0.67 | 5.06 | 2.16 | **16.0pt** | Arial | #FFFFFF white | center / middle | ~43 char/line |
| image (fixed asset) | 6.25 | 0.81 | 4.63 | 1.9 | — | — | — | — / top | asset `image34.png` |
| shape | 5.13 | 1.96 | 0.0 | 4.01 | — | — | — | — / middle | — |
| section title | 0.73 | 2.64 | 4.08 | 1.26 | **35.0pt** | Mazda Type Bold | #EEEEEE paper | right / bottom | line 80%; e.g. "BRAND"; ~15 char/line |
| eyebrow / tag | 6.03 | 2.91 | 5.06 | 0.32 | **17.0pt** | Arial | #BFA588 spark-dim | left / top | ALL CAPS; line 90%; e.g. "LOGOS YOU CAN COPY & PASTE"; ~34 char/line |
| eyebrow / tag | 6.03 | 3.31 | 5.06 | 0.89 | **16.0pt** | Arial | #FFFFFF white | center / middle | ~43 char/line |
| image (fixed asset) | 8.21 | 3.5 | 0.61 | 0.5 | — | — | — | — / top | asset `image35.png` |
| image (fixed asset) | 9.32 | 3.57 | 1.33 | 0.36 | — | — | — | — / top | asset `image39.png` |
| image (fixed asset) | 6.47 | 3.59 | 1.24 | 0.37 | — | — | — | — / top | asset `image37.png` |
| body / caption | 0.73 | 3.79 | 4.08 | 0.38 | **10.0pt** | Arial | #EEEEEE paper | right / top | line 110%; e.g. "For reference & use as needed throughout" |
| eyebrow / tag | 6.03 | 4.46 | 5.06 | 0.89 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #808080; ~43 char/line |
| image (fixed asset) | 8.21 | 4.65 | 0.61 | 0.5 | — | — | — | — / top | asset `image38.png` |
| image (fixed asset) | 6.47 | 4.71 | 1.24 | 0.37 | — | — | — | — / top | asset `image36.png` |
| image (fixed asset) | 9.32 | 4.71 | 1.33 | 0.36 | — | — | — | — / top | asset `mmw_logo_black.png` |
| eyebrow / tag | 6.03 | 5.44 | 5.06 | 0.32 | **17.0pt** | Arial | #BFA588 spark-dim | left / top | ALL CAPS; line 90%; e.g. "FONT USED"; ~34 char/line |
| eyebrow / tag | 6.03 | 5.81 | 5.06 | 1.08 | **16.0pt** | Arial | #FFFFFF white | center / middle | ~43 char/line |
| body / caption | 8.35 | 5.88 | 3.03 | 0.97 | **7.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "A B C D E F G H I J K L M N O P Q R S T " |
| eyebrow / tag | 6.71 | 5.92 | 1.67 | 0.32 | **17.0pt** | Arial | #FFFFFF white | right / top | ALL CAPS; line 90%; e.g. "ARIAL BODY"; ~11 char/line |
| eyebrow / tag | 5.94 | 6.48 | 2.45 | 0.31 | **17.0pt** | Mazda Type Bold | #FFFFFF white | right / top | ALL CAPS; line 90%; e.g. "MAZDA HEADLINES"; ~16 char/line |
| body / caption | 5.98 | 6.91 | 5.16 | 0.18 | **7.0pt** | Arial | #808080 gray | center / top | line 110%; e.g. "To paste text without bringing over its " |

### Content 2 Rows - Light

**Template name:** `Content 2 Rows - Light`  |  **Slides:** 2, 3, 28, 104, 105, 106  |  **Spec'd from:** slide 2
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| shape | 5.13 | 1.96 | 0.0 | 4.01 | — | — | — | — / middle | — |
| body / caption | 6.12 | 2.14 | 5.21 | 0.38 | **10.0pt** | Arial | #FF2600 | — / bottom | line 110%; e.g. "PLEASE READ THIS PAGE FOR INSTRUCTION" |
| body / caption | 6.12 | 2.52 | 5.21 | 3.34 | **10.0pt** | Arial | #000000 black | left / top | line 110%; e.g. "This template exists in Keynote, PowerPo" |
| section title | 0.73 | 3.07 | 4.08 | 1.72 | **35.0pt** | Mazda Type Bold | #808080 gray | right / bottom | line 80%; e.g. "HOW TO USE THIS MAZDA DECK TEMPLATE"; ~15 char/line |
| image (fixed asset) | 3.67 | 3.24 | 9.67 | 4.28 | — | — | — | — / top | asset `image11.png` |

### Content - 2 rows - Light

**Template name:** `Content - 2 rows - Light`  |  **Slides:** 27  |  **Spec'd from:** slide 27
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| shape | 5.13 | 1.96 | 0.0 | 4.01 | — | — | — | — / middle | — |
| subhead | 6.21 | 2.11 | 2.97 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem"; ~29 char/line |
| body / caption | 6.21 | 2.6 | 5.06 | 1.06 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| section title | 0.73 | 3.11 | 4.08 | 0.79 | **35.0pt** | Mazda Type Bold | #808080 gray | right / bottom | line 80%; e.g. "HEADER"; ~15 char/line |
| body / caption | 0.73 | 3.79 | 4.08 | 0.36 | **10.0pt** | Arial | #808080 gray | right / top | line 110%; e.g. "Lorem ipso dilir sit lorem ipsom" |
| subhead | 6.21 | 3.84 | 2.97 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Lorem ipso dilir sit lorem"; ~29 char/line |
| body / caption | 6.21 | 4.32 | 5.06 | 1.06 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
---

## 11. Reporting chassis and blank canvases — 6 template masters, 24 named engine layouts

**Read this before picking a layout in this section.** Only 6 real PowerPoint
layout masters back slides 71-101 -- `Content Gray`, `Content Dark`,
`Blank Dark`, `Blank Grey`, `Blank Light`, `Title & Bullets` (confirmed
directly against each slide's `slide_layout.name` in the source .pptx, not
inferred). Every `report*` name in §11.5 (`reportSplitPanels`, `reportStatRow`,
`reportMetricTable`, `reportJourneyMap`, etc.) is a **synthetic engine-level
name for one specific slide's composition on top of one of those 6 masters**
-- none of them are separate masters in the file itself. That's deliberate:
§11.1 explains why a bare master with "no fixed body grid" is error-prone to
freehand, so each distinct composition observed on a real slide got its own
addressable name instead. Appendix A indexes the 6 real masters and is
unchanged by this; use §11.4's table to pick the right *composition* once
you know which master-level slide type you're building.

`Blank Dark`, `Blank Grey` and `Blank Light` are real master names for
genuinely blank canvas work (a slide that doesn't match any composition in
§11.5) -- but the *engine names* that used to render them empty
(`blankDark`, `blankGrey`, `blankLight`, plus `titleBullets` for
`Title & Bullets`) turned out to be broken duplicates of a slide composition
that was later given its own proper `report*` name, and have been retired to
point at that composition instead (§11.4). There is currently no engine name
that renders these masters genuinely empty -- for real blank-canvas work use
`reportGray`/`reportDark` (§11.1) and hand-place content.

### 11.1 The report header chassis

`Content Gray` and `Content Dark` account for **21 of the 115 slides** — the largest block in the deck (the charts/graphs/boxes section, slides 71–101). They are not compositions; they are a **header chassis over an open canvas**.

**The chassis — identical in both, and reused by four production layouts:**

| Element | x | y | w | h | Size | Font | Colour |
|---|---|---|---|---|---|---|---|
| Eyebrow | 0.61 | 0.54 | 12.12 | 0.29 | **14.5pt** | Arial | **#BFA588** |
| Title | 0.61 | 0.85 | 12.12 | 0.50 | **24pt** | Arial | **#919292** |
| Sub-deck | 0.61 | 1.33 | 12.12 | 0.39 | **10pt** | Arial | #808080 |

Gaps: eyebrow → title **0.31**, title → sub-deck **0.48**. The same chassis appears at `w:6.79` (half width) on `Casting`, `Casting_Talent`, `Location Detail` and `Moodboard Props`. **Treat it as a shared component**, not as four coincidences.

**Below y:1.80 the slide is free canvas.** The 13 `Content Gray` slides use 9 distinct body compositions and the 8 `Content Dark` slides use 4 — there is no fixed body grid. Working area: **y 1.80 → 7.10, x 0.61 → 12.73**.

| | `Content Gray` | `Content Dark` |
|---|---|---|
| Background | **#EEEEEE** | **#262626** |
| Slides | 72, 73, 76, 78, 83, 84, 85, 86, 88, 97, 98, 101, 108 | 77, 79, 80, 81, 82, 87, 93, 94 |

**Observed body components** (patterns to reuse, not fixed positions):

- **Two-panel comparison** (slide 97): panels `x:0.86` and `x:7.22`, both `y:2.46 w:5.45 h:4.19`, gutter 0.91; a 0.08-wide accent rule in #BFA588 on the dark panel's left edge; a 60pt `→` glyph at `x:6.37 y:4.11` between them. Inside each panel: 7.5pt label, 33pt heading, 20pt body, 10pt status.
- **Process/timeline** (slide 72): captions at `y:6.67`, `w:1.73`, with zero-width connector lines rising from the baseline.
- **Full-width rule** (slide 101): a single line at `x:0.64 y:2.12 w:12.05`.
- **Native charts:** 10 chart parts are embedded in the deck; chart slides carry only the chassis plus a chart frame.

### Content Gray

**Template name:** `Content Gray`  |  **Slides:** 72, 73, 76, 78, 83, 84, 85, 86, 88, 97, 98, 101, 108  |  **Spec'd from:** slide 72
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 12.12 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsum sit met"; ~96 char/line |
| header title | 0.61 | 0.85 | 12.12 | 0.5 | **24.0pt** | Mazda Type Bold | #919292 title-gray | left / top | ALL CAPS; e.g. "CAMPAIGN PROGRESS"; ~58 char/line |
| body / caption | 0.61 | 1.33 | 12.12 | 0.39 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| shape | -0.86 | 2.69 | 14.99 | 3.51 | — | — | — | — / top | — |
| body / caption | 3.08 | 2.82 | 1.73 | 0.36 | **10.0pt** | Arial | #808080 gray | center / bottom | e.g. "We are here" |
| body / caption | 3.94 | 3.33 | 0.0 | 0.6 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| eyebrow / tag | 3.8 | 4.3 | 0.29 | 0.29 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #808080; ~2 char/line |
| body / caption | 10.98 | 4.75 | 0.0 | 1.95 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| body / caption | 6.96 | 4.91 | 0.0 | 1.79 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| body / caption | 3.94 | 5.14 | 0.0 | 1.58 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| body / caption | 4.58 | 5.79 | 1.73 | 0.52 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Refine and go deep" |
| body / caption | 8.02 | 5.79 | 1.73 | 0.68 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Clarify and build executional plan" |
| body / caption | 11.39 | 5.79 | 1.73 | 0.52 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Production" |
| body / caption | 1.35 | 6.41 | 0.0 | 0.29 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| body / caption | 0.49 | 6.67 | 1.73 | 0.68 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Get Smart and explore" |
| body / caption | 3.08 | 6.67 | 1.73 | 0.52 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Share ideas" |
| body / caption | 6.09 | 6.67 | 1.73 | 0.52 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Share revision" |
| body / caption | 10.11 | 6.67 | 1.73 | 0.52 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Approval" |

### Content Dark

**Template name:** `Content Dark`  |  **Slides:** 77, 79, 80, 81, 82, 87, 93, 94  |  **Spec'd from:** slide 93
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 12.12 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsum sit met"; ~96 char/line |
| header title | 0.61 | 0.85 | 12.12 | 0.5 | **24.0pt** | Mazda Type Bold | #919292 title-gray | left / top | ALL CAPS; e.g. "Lorem ipsum sit met"; ~58 char/line |
| body / caption | 0.61 | 1.33 | 12.12 | 0.39 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| subhead | 5.26 | 2.22 | 2.82 | 0.45 | **13.0pt** | Arial | #808080 gray | center / bottom | e.g. "QoQ GVS by Model(m953)"; ~30 char/line |
| chart/table frame | 1.11 | 2.37 | 11.0 | 3.88 | — | — | — | — / top | — |
| body / caption | 3.95 | 6.49 | 5.44 | 0.41 | **10.0pt** | Arial | #808080 gray | center / top | e.g. "Q1 GVS:  98,144" |

### 11.2 Blank canvases — 3 layouts

Three empty layouts carrying **nothing but a slide number**. They exist so a deck can hold fully bespoke content on-brand.

| Layout | Background | Slides |
|---|---|---|
| `Blank Dark` | inherits master **#262626** | 74, 75, 89, 90, 95, 110, 114 |
| `Blank Grey` | **#EEEEEE** | 92, 96, 111 |
| `Blank Light` | **#FFFFFF** | 99, 100, 112 |

Note `Blank Grey` (#EEEEEE) and `Blank Light` (#FFFFFF) are genuinely different surfaces — grey is MMW Paper, light is pure white. Every instance composes its own body; there is no shared structure to inherit. For agent purposes, treat these as an escape hatch: use them only when no other layout fits, and hand-place against the §2 grid.

**Engine note:** the `blankDark`/`blankGrey`/`blankLight` *engine* names no longer render empty — each retired to the specific `report*` composition that shares its source slide (§11.4), since those were broken duplicates of that composition rather than a true blank canvas. There is currently no engine name that renders these masters genuinely empty; for real blank-canvas work, use `reportGray`/`reportDark` (§11.1) instead and hand-place content.

### Blank Dark

**Template name:** `Blank Dark`  |  **Slides:** 74, 75, 89, 90, 95, 110, 114  |  **Spec'd from:** slide 74
**Background:** inherits slide master — solid **#262626** (MMW Asphalt)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| header title | 0.46 | 0.38 | 12.4 | 0.5 | **23.8pt** | Mazda Type Regular | #FFFFFF white | left / middle | line 80%; e.g. "MEDIA REALITIES FOR 161"; ~72 char/line |
| shape | 1.66 | 1.21 | 1.73 | 5.94 | — | — | — | — / top | — |
| shape | 4.01 | 1.21 | 1.73 | 5.94 | — | — | — | — / top | — |
| shape | 6.36 | 1.21 | 1.73 | 5.94 | — | — | — | — / top | — |
| shape | 8.72 | 1.21 | 1.73 | 5.94 | — | — | — | — / top | — |
| shape | 11.07 | 1.21 | 1.73 | 5.94 | — | — | — | — / top | — |
| subhead | 0.24 | 1.92 | 1.78 | 0.29 | **12.0pt** | Arial | #EEEEEE paper | left / top | e.g. "Strategic Need" |
| subhead | 0.18 | 2.99 | 12.97 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~99 char/line |
| subhead | 0.24 | 3.23 | 1.78 | 0.29 | **12.0pt** | Arial | #EEEEEE paper | left / top | e.g. "Strategic Need" |
| subhead | 0.18 | 4.5 | 12.97 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~99 char/line |
| subhead | 0.24 | 4.89 | 1.78 | 0.29 | **12.0pt** | Arial | #EEEEEE paper | left / top | e.g. "Strategic Need" |

### Blank Grey

**Template name:** `Blank Grey`  |  **Slides:** 92, 96, 111  |  **Spec'd from:** slide 92
**Background:** solid **#EFF0F3**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 3.9 | 0.15 | 5.53 | 0.64 | **35.0pt** | Mazda Type Bold | — | center / middle | line 80%; e.g. "CAMPAIGN ECOSYSTEM"; ~21 char/line |
| image (fixed asset) | 1.58 | 0.28 | 0.72 | 0.72 | — | — | — | — / top | asset `image123.png` |
| shape | 11.01 | 0.3 | 0.83 | 0.81 | — | — | — | — / top | — |
| shape | 0.36 | 0.37 | 1.14 | 0.69 | — | — | — | — / top | — |
| body / caption | 11.76 | 0.37 | 1.14 | 0.19 | **8.5pt** | — | #060E19 | — / middle | e.g. "STRATEGY" |
| subhead | 1.74 | 0.45 | 0.4 | 0.37 | **16.0pt** | Mazda Type Regular | #545B67 | center / middle | fill #7F7F7F; ~2 char/line |
| subhead | 11.18 | 0.45 | 0.34 | 0.36 | **16.0pt** | Mazda Type Regular | #545B67 | center / middle | fill #7F7F7F; ~2 char/line |
| shape | 11.76 | 0.62 | 1.09 | 0.0 | — | — | — | — / middle | — |
| body / caption | 11.76 | 0.68 | 1.09 | 0.39 | **7.0pt** | — | #7F7F7F | — / middle | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| image (fixed asset) | 5.81 | 0.88 | 1.71 | 1.71 | — | — | — | — / top | asset `image123.png` |
| body / caption | 7.18 | 1.04 | 2.7 | 1.39 | **7.0pt** | — | #7F7F7F | — / middle | line 120%; e.g. "Car Models: CX-X, CX-X" |
| body / caption | 6.25 | 1.54 | 0.85 | 0.38 | **10.5pt** | — | #5E5E5E dk2 | center / middle | ALL CAPS; e.g. "CAMPAIGN" |
| shape | 6.67 | 1.73 | 0.51 | 0.01 | — | — | — | — / top | — |
| shape | 6.66 | 2.58 | 0.0 | 0.48 | — | — | — | — / top | — |
| subhead | 6.61 | 3.06 | 0.11 | 0.11 | **16.0pt** | Mazda Type Regular | #545B67 | center / middle | fill #AFAEBF |
| shape | 1.66 | 3.11 | 4.95 | 0.48 | — | — | — | — / top | — |
| shape | 3.09 | 3.11 | 3.52 | 0.47 | — | — | — | — / top | — |
| shape | 4.52 | 3.11 | 2.09 | 0.48 | — | — | — | — / top | — |
| shape | 5.95 | 3.11 | 0.66 | 0.48 | — | — | — | — / top | — |
| shape | 6.72 | 3.11 | 0.66 | 0.48 | — | — | — | — / top | — |
| shape | 6.72 | 3.11 | 2.09 | 0.48 | — | — | — | — / top | — |
| shape | 6.72 | 3.11 | 3.52 | 0.48 | — | — | — | — / top | — |
| shape | 6.72 | 3.11 | 4.95 | 0.48 | — | — | — | — / top | — |
| image (fixed asset) | 1.39 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 2.82 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 4.25 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 5.68 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 7.11 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 8.54 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 9.97 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| image (fixed asset) | 11.39 | 3.59 | 0.54 | 0.54 | — | — | — | — / top | asset `image123.png` |
| body / caption | 1.23 | 4.38 | 0.86 | 0.2 | **9.0pt** | — | #A3B3A5 | center / middle | line 80%; e.g. "BROADCAST" |
| body / caption | 2.93 | 4.38 | 0.33 | 0.2 | **9.0pt** | — | #7B799D | center / middle | line 80%; e.g. "OLA" |
| body / caption | 4.21 | 4.38 | 0.53 | 0.2 | **9.0pt** | — | #86ACC0 | center / middle | line 80%; e.g. "SOCIAL" |
| body / caption | 5.78 | 4.38 | 0.35 | 0.2 | **9.0pt** | — | #8D7057 | center / middle | line 80%; e.g. "CRM" |
| body / caption | 7.08 | 4.38 | 0.59 | 0.2 | **9.0pt** | — | #4A634D | center / middle | line 80%; e.g. "SEARCH" |
| body / caption | 8.69 | 4.38 | 0.24 | 0.2 | **9.0pt** | — | #56507E | center / middle | line 80%; e.g. "PR" |
| body / caption | 9.95 | 4.38 | 0.58 | 0.2 | **9.0pt** | — | #416986 | center / middle | line 80%; e.g. "DEALER" |
| body / caption | 11.15 | 4.38 | 1.03 | 0.2 | **9.0pt** | — | #1C4066 | center / middle | line 80%; e.g. "PARTNERSHIPS" |
| shape | 1.25 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 2.68 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 5.53 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 6.96 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 8.39 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 9.82 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 11.25 | 4.67 | 0.83 | 0.0 | — | — | — | — / middle | — |
| shape | 4.06 | 4.7 | 0.83 | 0.0 | — | — | — | — / middle | — |
| body / caption | 0.94 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 2.37 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 3.8 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 5.23 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 6.66 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 8.09 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 9.52 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |
| body / caption | 10.94 | 4.82 | 1.44 | 1.87 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Instagram:" |

### Blank Light

**Template name:** `Blank Light`  |  **Slides:** 99, 100, 112  |  **Spec'd from:** slide 99
**Background:** solid **#F2F2F2**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 12.12 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "Lorem ipsum sit met"; ~96 char/line |
| header title | 0.61 | 0.85 | 12.12 | 0.5 | **24.0pt** | Mazda Type Bold | #919292 title-gray | left / top | ALL CAPS; e.g. "Lorem ipsum sit met"; ~58 char/line |
| body / caption | 4.41 | 1.43 | 1.24 | 0.16 | **10.0pt** | Arial | #8D7057 | center / middle | e.g. "WE ARE HERE" |
| body / caption | 5.03 | 1.69 | 0.0 | 0.29 | **10.0pt** | Arial | #808080 gray | left / middle | line 110% |
| eyebrow / tag | 3.39 | 2.01 | 3.28 | 5.02 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #BFA588; ~27 char/line |
| eyebrow / tag | 0.19 | 2.09 | 3.12 | 0.77 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #262626; ~26 char/line |
| eyebrow / tag | 3.47 | 2.09 | 3.12 | 0.77 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #BFA588; ~26 char/line |
| eyebrow / tag | 6.74 | 2.09 | 3.12 | 0.77 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #262626; ~26 char/line |
| eyebrow / tag | 10.02 | 2.09 | 3.12 | 0.77 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #262626; ~26 char/line |
| eyebrow / tag | 0.19 | 2.17 | 3.12 | 4.78 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #FFFFFF; ~26 char/line |
| eyebrow / tag | 3.47 | 2.17 | 3.12 | 4.78 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #FFFFFF; ~26 char/line |
| eyebrow / tag | 6.74 | 2.17 | 3.12 | 4.78 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #FFFFFF; ~26 char/line |
| eyebrow / tag | 10.02 | 2.17 | 3.12 | 4.78 | **16.0pt** | Arial | #FFFFFF white | center / middle | fill #FFFFFF; ~26 char/line |
| shape | 0.56 | 2.32 | 0.32 | 0.31 | — | — | — | — / top | — |
| shape | 3.84 | 2.32 | 0.32 | 0.31 | — | — | — | — / top | — |
| shape | 7.11 | 2.32 | 0.32 | 0.31 | — | — | — | — / top | — |
| shape | 10.38 | 2.32 | 0.32 | 0.31 | — | — | — | — / top | — |
| subhead | 1.05 | 2.37 | 1.12 | 0.21 | **13.0pt** | Arial | #FFFFFF white | left / middle | e.g. "DEFINE"; ~11 char/line |
| subhead | 4.32 | 2.37 | 1.27 | 0.22 | **13.0pt** | Arial | #FFFFFF white | left / middle | e.g. "DEVELOP"; ~13 char/line |
| subhead | 7.59 | 2.37 | 1.12 | 0.21 | **13.0pt** | Arial | #FFFFFF white | left / middle | e.g. "DEFINE"; ~11 char/line |
| subhead | 10.87 | 2.37 | 1.12 | 0.21 | **13.0pt** | Arial | #FFFFFF white | left / middle | e.g. "DEFINE"; ~11 char/line |
| body / caption | 2.17 | 2.4 | 0.8 | 0.12 | **8.0pt** | Arial | #ECBE96 | right / top | e.g. "APR 3 -15" |
| body / caption | 5.45 | 2.4 | 0.8 | 0.12 | **8.0pt** | Arial | #262626 asphalt | right / top | e.g. "APR 3 -15" |
| body / caption | 8.72 | 2.4 | 0.8 | 0.12 | **8.0pt** | Arial | #ECBE96 | right / top | e.g. "APR 3 -15" |
| body / caption | 12.0 | 2.4 | 0.8 | 0.12 | **8.0pt** | Arial | #ECBE96 | right / top | e.g. "APR 3 -15" |
| body / caption | 0.56 | 3.09 | 2.39 | 0.94 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DELIVERABLES:" |
| body / caption | 3.84 | 3.09 | 2.39 | 0.94 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DELIVERABLES:" |
| body / caption | 7.11 | 3.09 | 2.39 | 0.94 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DELIVERABLES:" |
| body / caption | 10.38 | 3.09 | 2.39 | 0.94 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DELIVERABLES:" |
| subhead | 0.32 | 3.96 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 3.59 | 3.96 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 6.87 | 3.96 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 10.14 | 3.96 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| body / caption | 0.56 | 4.24 | 2.39 | 1.26 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DEFINE REVIEW TIMELINE:" |
| body / caption | 3.84 | 4.24 | 2.39 | 1.26 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DEFINE REVIEW TIMELINE:" |
| body / caption | 7.11 | 4.24 | 2.39 | 1.26 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DEFINE REVIEW TIMELINE:" |
| body / caption | 10.38 | 4.24 | 2.39 | 1.26 | **9.0pt** | Arial | #000000 black | left / top | e.g. "DEFINE REVIEW TIMELINE:" |
| subhead | 0.32 | 5.62 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 3.59 | 5.62 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 6.87 | 5.62 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| subhead | 10.14 | 5.62 | 2.89 | 0.0 | **18.0pt** | Arial | #000000 black | left / top | ~22 char/line |
| body / caption | 0.56 | 5.88 | 2.39 | 0.93 | **9.0pt** | Arial | #000000 black | left / top | e.g. "CLIENT REVIEWERS" |
| body / caption | 3.84 | 5.88 | 2.39 | 0.93 | **9.0pt** | Arial | #000000 black | left / top | e.g. "CLIENT REVIEWERS" |
| body / caption | 7.11 | 5.88 | 2.39 | 0.93 | **9.0pt** | Arial | #000000 black | left / top | e.g. "CLIENT REVIEWERS" |
| body / caption | 10.38 | 5.88 | 2.39 | 0.93 | **9.0pt** | Arial | #000000 black | left / top | e.g. "CLIENT REVIEWERS" |

### 11.3 Title & Bullets

The one **generic PowerPoint** layout in the deck — a real `type="title"` placeholder plus a body list. Its type scale (42.5 / 27.5 / 24pt) and pure-black #000000 text belong to no MMW family, and its background is #FFFFFF rather than Paper.

This is almost certainly a stock layout that survived the Keynote export, not a designed MMW template. It is used **once**, on slide 91. **Do not select it for MMW output** — slide 91's real composition is `reportPlatformMatrix` (§11.5.8); use that directly rather than routing to a bare chassis. Documented for completeness.

### Title & Bullets

**Template name:** `Title & Bullets`  |  **Slides:** 91  |  **Spec'd from:** slide 91
**Background:** solid **#EFF0F3**

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 3.81 | 0.23 | 5.71 | 0.64 | **35.0pt** | Mazda Type Bold | — | center / middle | line 80%; e.g. "MARKETING ECOSYSTEM"; ~22 char/line |
| body / caption | -0.01 | 1.03 | 1.49 | 0.56 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Goal: Own our human-centric approach to " |
| body / caption | 1.41 | 1.04 | 0.54 | 0.54 | **7.0pt** | — | #262626 asphalt | center / middle | ALL CAPS; e.g. "cx-90" |
| shape | 4.1 | 1.13 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 7.93 | 1.13 | 1.21 | 1.21 | — | — | — | — / top | — |
| body / caption | 2.24 | 1.23 | 2.22 | 1.09 | **6.0pt** | — | #7F7F7F | — / top | e.g. "STRATEGY" |
| body / caption | 8.75 | 1.23 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | right / top | e.g. "STRATEGY" |
| body / caption | -0.01 | 1.82 | 1.49 | 0.56 | **6.0pt** | — | #7F7F7F | — / top | e.g. "Goal: Own our human-centric approach to " |
| body / caption | 1.41 | 1.83 | 0.54 | 0.54 | **7.0pt** | — | #262626 asphalt | center / middle | ALL CAPS; e.g. "cx-90" |
| shape | 5.13 | 2.16 | 1.17 | 0.81 | — | — | — | — / top | — |
| shape | 6.96 | 2.16 | 1.15 | 0.78 | — | — | — | — / top | — |
| shape | 3.06 | 2.66 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 9.04 | 2.66 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 5.8 | 2.89 | 1.73 | 1.72 | — | — | — | — / top | — |
| body / caption | 1.19 | 3.03 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | — / top | e.g. "STRATEGY" |
| body / caption | 9.93 | 3.03 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | right / top | e.g. "STRATEGY" |
| shape | 4.27 | 3.26 | 1.58 | 0.2 | — | — | — | — / top | — |
| shape | 7.45 | 3.26 | 1.59 | 0.12 | — | — | — | — / top | — |
| shape | 7.48 | 4.04 | 1.16 | 0.74 | — | — | — | — / top | — |
| shape | 4.68 | 4.11 | 1.2 | 0.67 | — | — | — | — / top | — |
| shape | 3.47 | 4.18 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 8.63 | 4.18 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 7.03 | 4.53 | 0.21 | 1.08 | — | — | — | — / top | — |
| body / caption | 1.59 | 4.55 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | — / top | e.g. "STRATEGY" |
| body / caption | 9.52 | 4.55 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | right / top | e.g. "STRATEGY" |
| shape | 6.16 | 4.56 | 0.21 | 1.05 | — | — | — | — / top | — |
| shape | 5.12 | 5.43 | 1.21 | 1.21 | — | — | — | — / top | — |
| shape | 7.07 | 5.43 | 1.21 | 1.21 | — | — | — | — / top | — |
| body / caption | 3.25 | 5.8 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | — / top | e.g. "STRATEGY" |
| body / caption | 7.86 | 5.8 | 2.22 | 1.0 | **6.0pt** | — | #7F7F7F | right / top | e.g. "STRATEGY" |
| image (fixed asset) | 12.19 | 6.87 | 0.97 | 0.54 | — | — | — | — / top | asset `image122.png` |
---

### 11.4 Choosing a report-detail layout

Slides 73-101 share the `Content Gray` / `Content Dark` chassis but the body
below `y:1.80` is 17 distinct, purpose-built compositions plus 5 generic
"well" variants (chart / table / timeline dropped onto the bare chassis).
Picking by silhouette rather than by name avoids the two most common
mistakes: reaching for a generic well when a named layout already fits, and
guessing at a `report*` layout's fields from the flat `items[]` pattern used
elsewhere in the deck (16 of these 17 take structured objects instead;
`reportQuotePanel` is the one still flat).

| If the slide needs to... | Use | Content shape |
|---|---|---|
| Show progress along a timeline/roadmap, "we are here" marker | `reportJourneyMap` (4-column) or `reportSplitPanels` (staged bars) | structured |
| Compare exactly two things side by side | `reportChapterOpener` (headline pair) or `reportModelCompare` (stat grid) | structured |
| Lay out 3+ competing options around a hub | `reportPlatformMatrix` | structured |
| Show a hierarchy / org chart / breakdown from one root | `reportEcosystemTree` | structured |
| State a strategy with supporting proof points and next steps | `reportStrategyStack` | structured |
| Introduce a new chapter/section with a clear before/after or old/new framing | `reportChapterOpener` | structured |
| Show a funnel or matrix table with uneven row/column density | `reportMetricTable` | structured |
| Show 2-4 pull quotes or testimonials | `reportQuotePanel` | flat items -- fragile, see 11.5.11 |
| Show a numbered sequence of 6 steps in a 3x2 grid, with a curved connector | `reportNumberedSteps` | structured |
| Show gate/status checks (pass/fail/at-risk style) with chevron ribbons | `reportGateStatus` | structured |
| Show 3 brand pillars with supporting metrics/pivot | `reportBrandPillars` | structured |
| Show spend or budget allocation as horizontal bars | `reportSpendBarsLight` / `reportSpendBarsDark` | structured |
| Show a labelled stat row across 3-5 columns with 3 bands of detail | `reportStatRow` / `reportStatRowLight` | structured |
| Show a simple 2-column table (one heading + bullets per side) | `reportGrayTable` / `reportDarkTable` | structured |
| Show a funnel/channel matrix with grouped rows, a subtotal and a grand total | `reportChannelMatrix` | structured |
| Drop in a native chart with no other custom composition | `reportGrayChart` / `reportDarkChart` | generic well |
| Show the campaign-progress flow art from slide 72 specifically | `reportGrayTimeline` | generic well |

If nothing above fits, use the bare `Content Gray` / `Content Dark` chassis
(§11.1) and keep the composition to chassis + one clearly-labelled block --
do not invent a multi-part composition freehand.

**`Blank Dark`, `Blank Grey`, `Blank Light` and `Title & Bullets` are
retired** -- each was an auto-generated duplicate of a `report*` layout above
that shares its source slide (74, 92, 99, 91 respectively) and has since been
hand-authored properly under the `report*` name. The retired names still
resolve (to `reportStatRow`, `reportEcosystemTree`, `reportJourneyMap`,
`reportPlatformMatrix`) but should not be selected for new decks.

### 11.5 Report detail layouts -- 17 layouts, hand-authored structured content

Unlike the raw-geometry tables elsewhere in this doc, these layouts manage
their own internal positioning -- supply the structured content below and
the layout places it. Font sizes are already the halved engine-space value;
do not re-apply the 2.0005 ratio to anything quoted here.

**11.5.1 `reportSplitPanels`** (slide 73, bg `#FFFFFF`, template `Report Split Panels (slide 73)`)
Four decreasing pill-shaped bars (tan/paper/gray/asphalt) with up to 4
milestone callouts on double-headed connectors, 2 above the bars and 2 below.
`cfg.stages` (array, ≤4 strings, one per bar) · `cfg.milestones` (array, ≤4,
each `{header, copy}`) · `cfg.hereLabel` (string or `false` to hide the tan
"We are here" marker, defaults to shown).

**11.5.2 `reportStatRow`** / **11.5.3 `reportStatRowLight`** (slides 74/75, bg `#262626`/`#EEEEEE`)
5-column stat grid with 3 horizontal bands, band color alternates. `cfg.title`
· `cfg.columns` (array, ≤5, column headers) · `cfg.sections` (array, ≤3, each
`{label, cells}` where `cells` is ≤5 strings aligned to `columns`).

**11.5.4 `reportSpendBarsLight`** / **11.5.5 `reportSpendBarsDark`** (slides 86/87, bg `#EEEEEE`/`#262626`)
Up to 6 horizontal pill bars, width proportional to `pct`. `cfg.bars` (array,
≤6, each `{label, pct (0-1), color}` -- color optional, cycles a fixed
palette if omitted).

**11.5.6 `reportModelCompare`** (slide 89, bg `#262626`, template `Report Model Compare (slide 89)`)
Column/row grid with spans. `cfg.entries` (array, each
`{col, row, colSpan, rowSpan, ...}` -- out-of-range spans are clamped, not
drawn off-slide) · `cfg.stages`.

**11.5.7 `reportBrandPillars`** (slide 90, bg `#262626`, template `Report Brand Pillars (slide 90)`)
Two numbered intro sections, then 3 outlined pillar boxes, then a 3-column
stat block with an optional highlighted pivot row. `cfg.sections` (array,
≤2, each `{header, ...}`) · `cfg.pillars` (array, ≤3, each `{header, copy}`)
· `cfg.rowLabels` (array, ≤4 -- the 4th renders tan, the rest white) ·
`cfg.channels` (array, ≤3, small pills top-right) · `cfg.targets` / `cfg.outcomes`
(arrays, ≤3, one per column) · `cfg.pivot` (`{label, copy}`, the highlighted
band).

**11.5.8 `reportPlatformMatrix`** (slide 91, bg `#EFF0F3`, template `Report Platform Matrix (slide 91)`)
Central hub disc with up to 8 spoke boxes arranged in a ring, plus up to 6
category chips down the left edge. `cfg.hub` (`{label, name}`) · `cfg.spokes`
(array, ≤8 -- extras dropped with a console warning, not overlapped) ·
`cfg.categories` (array, ≤6, each `{code, text}`).

**11.5.9 `reportEcosystemTree`** (slide 92, bg `#EFF0F3`, template `Report Ecosystem Tree (slide 92)`)
Root node with a dotted fact panel and up to 8 branch cards, plus optional
corner ID blocks top-left/top-right. `cfg.title` · `cfg.root` (`{facts}`,
`facts` ≤6, each `{key, value}`) · `cfg.branches` (array, ≤8 -- extras
dropped, cards are a fixed 1.44in wide) · `cfg.cornerLeft` / `cfg.cornerRight`
(`{icon, label, text}`, optional).

**11.5.10 `reportMetricTable`** (slide 95, bg `#262626`) -- see the override in
`deck-layouts.js`/`overrides.py` directly: `cfg.columns`, 7 fixed columns,
each `{header, tone, stroke, noStroke, groups}`; a group is one of the
matrix's 3 funnel bands and can hold one cell or many. Full docs live as code
comments on the function; this entry exists so the layout is at least
indexed here.

**11.5.11 `reportQuotePanel`** (slide 96, bg `#EFF0F3`, template `Report Quote Panel (slide 96)`)
Four quote cards in a 2x2 grid, each with a tan eyebrow, a bold headline and
grey body copy. **Fragile mapping, not yet restructured**: card 1's eyebrow
is `cfg.tag` and headline is `cfg.subhead`/`cfg.subtitle` (the chassis
fields, reused); every other field for all 4 cards is a flat `cfg.items[]`
slot in this exact order -- `[0]` card2 eyebrow, `[1]` card2 headline, `[2]`
card1 body, `[3]` card2 body, `[4]` card3 eyebrow, `[5]` card4 eyebrow, `[6]`
card3 headline, `[7]` card4 headline, `[8]` card3 body, `[9]` card4 body.
Get this order wrong and content silently lands on the wrong card. Treat as
a candidate for the same structured-object treatment as the rest of this
section.

**11.5.12 `reportChapterOpener`** (slide 97, bg `#EEEEEE`) -- see 11.5.10; the
full field reference is `deck-layouts.js`/`overrides.py`'s code comments:
`cfg.text2/text3` (eyebrows), `cfg.text4`/`cfg.subhead` (headline pair, NOT
`cfg.title` -- that slot is the fixed decorative arrow), `cfg.text5/text6`
(40pt-raw/20pt-engine body copy), `cfg.items[1]/items[2]` (STATUS / WHAT
THIS UNLOCKS blocks).

**11.5.13 `reportStrategyStack`** (slide 98, bg `#EEEEEE`) -- see 11.5.10:
`cfg.badges[2]` (`{sub, body}`), `cfg.pointOne/pointTwo/pointBody`,
`cfg.insightHead/insightBody`, `cfg.panels[3]` (`{next, subhead, sections}`
or `{next, subhead, bullets}` -- mutually exclusive per panel),
`cfg.activationLabel/activationBody`, `cfg.footers[3]` (`{head, body}`).

**11.5.14 `reportJourneyMap`** (slide 99, bg `#F2F2F2`) -- see 11.5.10:
`cfg.hereLabel`, `cfg.panels[4]` (`{tone: 'dark'|'tan', icon, header, date,
sections[3]}`, each section `{label, items}` where an item is a plain string
or `{text, bold, color}` for a bullet that needs to stand out).

**11.5.15 `reportGateStatus`** (slide 100, bg `#FFFFFF`, template `Report Gate Status (slide 100)`)
Rebuilt with a structured API, replacing the old flat `cfg.items[]` version.
Ribbons are PowerPoint's real "chevron" preset shape (`adj=0.2004`, read
directly from the source XML): an inward notch on the left, an outward
point on the right, both corners square where the notch/point doesn't
touch them. `cfg.gates` (array of 6, `{number, title, subhead, bullets}` --
`number` defaults to position 1-6; ribbon reads `N. TITLE`; `subhead` is
the optional black caps box; `bullets` is an array of strings under it,
centered in the column beneath the ribbon). `cfg.dividers` (array of up to
5, `{label}`, one per gap between ribbons -- tan vertical markers, text
rotated 90deg via `el.rotation`; pass fewer to show only some, omit
entirely to hide all). `cfg.showConnector` (default true) -- a dotted-end
line from the last ribbon of row 1 to the first ribbon of row 2, offset
clear of both the ribbons and the tan dividers, drawn with `type:'ln'` and
`markerStyle:'dot'`.

**11.5.16 `reportNumberedSteps`** (slide 101, bg `#FFFFFF`, template `Report Numbered Steps (slide 101)`)
Rebuilt with a structured API, replacing the old flat `cfg.items[]` version.
Six fixed steps in a 3-column x 2-row serpentine (row 2 is shifted right of
row 1 by design -- matches the source, not a bug). `cfg.steps` (array of 6,
`{number, label, subhead, intro, bullets}` -- `label` appears on both the
tan pill above and the black pill below, matching the source; `intro` is an
optional non-bulleted first line before `bullets`). `cfg.showConnector`
(default true) -- a real bezier S-curve (`type:'path'`, straight along each
row, curved at the row break), large dot start, arrow end pointing off-
slide, drawn behind the pills so it passes seamlessly under them. The
subhead/body block is anchored to each step's tan pill position plus a
fixed diagonal offset, not to the black pill beneath it -- confirmed
against the source that individual black-pill placements drift slightly
off a clean diagonal in a few instances, and anchoring to the tan pill
keeps all 6 steps' stairstep spacing uniform regardless.

**11.5.17 `reportChannelMatrix`** (slide 78, bg `#EEEEEE`, template `Report Channel Matrix (slide 78)`)
Previously conflated with `reportGrayTable` in this doc, since both cite
"Content Gray" as their master -- confirmed via the real table objects in
the source that slide 78 is a genuinely different, larger table (`Table 4`,
14 rows x 6 cols with a 2-row header, merged group-label cells, a subtotal
row, and a grand-total row), not a variant of slide 76's simple 2-column
table. Every merge, fill and font size below is read from the real table's
cell XML directly. `cfg.headerTotals` (`{basePlanOnly, basePlanIncremental}`,
the two $ values shown in the header band's second row). `cfg.groups`
(array, e.g. 2 for "Upper Funnel"/"Lower Funnel" -- `{label, rows: [{channel,
base, incremental, baseValue, incValue}], subtotal}`; `subtotal` is
`{baseValue, incValue}` and optional per group; the group's row count is
read from `rows.length`, not fixed to the source's 8-and-2). `cfg.grandTotal`
(`{baseValue, incValue}`, the dark bar spanning the first four columns at
the bottom).

### 11.6 Report chart/timeline wells -- 3 layouts

Generic capability wells dropped onto the bare `Content Gray` / `Content
Dark` chassis (eyebrow/title/intro unchanged from §11.1). Use these only
when nothing in §11.5 already fits the content. (`reportGrayTable` /
`reportDarkTable` used to be documented here as a generic `cfg.headers`/
`cfg.rows`/`cfg.colW` table well -- they no longer are; both were rebuilt as
bespoke structured layouts, see §11.5, and their old template attribution
here of "slides 76/78" was itself wrong -- slide 78 is `reportChannelMatrix`,
a different table object entirely, confirmed against the source directly.)

- **`reportGrayChart`** / **`reportDarkChart`** (bg `#EEEEEE`/`#262626`,
  template slides 83/84/85/88 and 79/80/81/82/93/94): `cfg.chart` =
  `{type, data, opts}`, a native chart in a fixed well.
- **`reportGrayTimeline`** (bg `#EEEEEE`, template slide 72 specifically):
  `cfg.milestones` (array, ≤8, plain strings placed at fixed marks along the
  campaign-progress flow art) · `cfg.hereLabel` (`false` to hide the gray
  dot-with-white-outline marker).


## 12. Production planning — 11 layouts

Internal shoot-planning documents: storyboards, scripts, casting, locations, moodboards. These are **not customer-facing brand communications** — do not force brand voice onto a prop list or a call sheet. Four of them reuse the half-width report chassis from §11.1.

### 12.1 Storyboards and scripts

### Storyboard 01

**VO script + 3-panel image stack.** Left column carries subhead (13pt, y:0.54) → title (35pt, y:0.94) → script (10pt, y:1.75, 5.20 tall). Right column is three stacked photo wells at a constant `x:7.06 w:6.27`, full-bleed to the right edge.

**Template name:** `Storyboard 01`  |  **Slides:** 35  |  **Spec'd from:** slide 35
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 7.06 | -0.0 | 6.27 | 2.6 | — | Arial | — | right / top | asset `image49.png`; ph idx 21 |
| subhead | 0.78 | 0.54 | 5.36 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Some subhead"; ~54 char/line |
| section title | 0.78 | 0.94 | 5.36 | 0.69 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "NAME :30"; ~20 char/line |
| body / caption | 0.78 | 1.75 | 5.36 | 5.2 | **10.0pt** | Arial | #000000 black | left / middle | line 90%; e.g. "VO: Lorem ipsum dolor sit" |
| photo placeholder | 7.06 | 2.69 | 6.27 | 2.28 | — | Arial | — | right / top | asset `image50.png`; ph idx 22 |
| photo placeholder | 7.06 | 5.07 | 6.27 | 2.44 | — | Arial | — | right / top | asset `image51.png`; ph idx 23 |

**Spacing:** panel heights vary — 2.59 / 2.28 / 2.44 — with a **0.10 in gap** between them (tops 0.00, 2.69, 5.07). The first panel bleeds off the top edge. Script column is 5.36 wide at 10pt ≈ 74 characters per line, ~26 lines in the 5.20 box.

### Storyboard 02

**6-panel numbered shot grid.** The densest layout in the deck. Two super-columns × three rows; each cell is a caption card paired with a photo well.

**Template name:** `Storyboard 02`  |  **Slides:** 36  |  **Spec'd from:** slide 36
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| subhead | 0.26 | 0.14 | 12.8 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Some subhead"; ~134 char/line |
| section title | 0.26 | 0.42 | 12.8 | 0.69 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "STORYBOARD"; ~49 char/line |
| eyebrow / tag | 0.29 | 1.18 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| photo placeholder | 3.1 | 1.18 | 3.47 | 1.94 | — | Arial | — | right / top | asset `image52.png`; ph idx 21 |
| eyebrow / tag | 6.82 | 1.18 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| photo placeholder | 9.63 | 1.18 | 3.47 | 1.94 | — | Arial | — | right / top | asset `image55.png`; ph idx 43 |
| eyebrow / tag | 0.46 | 1.32 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "01"; ~1 char/line |
| eyebrow / tag | 6.99 | 1.32 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "04"; ~1 char/line |
| body / caption | 0.44 | 1.84 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 6.97 | 1.84 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| subhead | 3.21 | 2.78 | 4.23 | 0.25 | **12.5pt** | — | #CB297B TEMPLATE-NOTE | — / middle | e.g. "PLACE YOUR OWN IMAGES" |
| eyebrow / tag | 0.29 | 3.21 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| eyebrow / tag | 6.82 | 3.21 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| photo placeholder | 3.1 | 3.22 | 3.47 | 1.93 | — | Arial | — | right / top | asset `image53.png`; ph idx 41 |
| photo placeholder | 9.63 | 3.22 | 3.47 | 1.93 | — | Arial | — | right / top | asset `image56.png`; ph idx 44 |
| eyebrow / tag | 0.46 | 3.35 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "02"; ~1 char/line |
| eyebrow / tag | 6.99 | 3.35 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "05"; ~1 char/line |
| body / caption | 0.44 | 3.86 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 6.97 | 3.86 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| eyebrow / tag | 0.29 | 5.24 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| eyebrow / tag | 6.82 | 5.24 | 2.71 | 1.94 | **16.0pt** | — | #FFFFFF white | center / middle | fill #EAE7E0 @52% α; ~22 char/line |
| photo placeholder | 3.1 | 5.25 | 3.47 | 1.94 | — | Arial | — | right / top | asset `image54.png`; ph idx 42 |
| photo placeholder | 9.63 | 5.25 | 3.47 | 1.94 | — | Arial | — | right / top | asset `image57.png`; ph idx 45 |
| eyebrow / tag | 0.46 | 5.39 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "03"; ~1 char/line |
| eyebrow / tag | 6.99 | 5.39 | 0.33 | 0.32 | **17.0pt** | Arial | #808080 gray | left / bottom | ALL CAPS; line 90%; e.g. "06"; ~1 char/line |
| body / caption | 0.44 | 5.9 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 6.97 | 5.9 | 2.41 | 0.41 | **7.5pt** | Arial | #808080 gray | left / top | e.g. "Lorem ipsum dolor sit amet, consectetur " |

**The grid, exactly:**

| | Caption card x | Photo well x | Card/well w |
|---|---|---|---|
| Left super-column | 0.29 | 3.07 | 2.71 / 3.51 |
| Right super-column | 6.82 | 9.63 | 2.71 / 3.51 |

Row tops **1.18 / 3.21 / 5.24** — pitch **2.03**, cell height 1.94, so a **0.09 in** row gap. Super-column pitch is 6.53.

Inside each caption card (fill **#EAE7E0**): a 17pt number at `+0.17 / +0.14` from the card origin, and a 7.5pt caption at `+0.15 / +0.66`. Numbers run `01`–`06` **down the left column first**, then down the right.

**Count is fixed at 6.** The grid has no spare cell and no generalisable overflow rule. **Strip the magenta "PLACE YOUR OWN IMAGES" annotation** (§5.1) on build.

### Scripts 01

**Two VO scripts side by side, no imagery.** Same header as `Storyboard 01` (subhead 13pt y:0.48, title 35pt y:0.69) spanning the full 12.06 width.

**Template name:** `Scripts 01`  |  **Slides:** 37  |  **Spec'd from:** slide 37
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| subhead | 0.64 | 0.48 | 12.06 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / bottom | e.g. "Some subhead"; ~126 char/line |
| section title | 0.64 | 0.82 | 12.06 | 0.69 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "NAME :30"; ~46 char/line |
| body / caption | 0.64 | 1.6 | 4.93 | 5.2 | **9.5pt** | Arial | #000000 black | left / top | line 90%; e.g. "VO: Lorem ipsum dolor sit" |
| body / caption | 6.66 | 1.6 | 4.93 | 5.2 | **9.5pt** | Arial | #000000 black | left / top | line 90%; e.g. "VO: Lorem ipsum dolor sit" |

**Spacing:** the two script columns are `x:0.64` and `x:6.66`, both `w:4.93 h:5.20` at **9.5pt** — the smallest body size in the deck. Gutter **1.09 in**. Column pitch 6.02. At 9.5pt in a 4.93 column, roughly 78 characters per line and ~40 lines per column.

### Video Reference

**Reference collage.** Left text column (35pt title y:0.47, 13pt subhead y:1.57, 10pt caption y:5.06) beside a 4-panel staggered mosaic.

**Template name:** `Video Reference`  |  **Slides:** 44  |  **Spec'd from:** slide 44
**Background:** solid **#EEEEEE** (paper)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.81 | 0.49 | 11.72 | 1.06 | **35.0pt** | Mazda Type | #808080 gray | left / bottom | line 80%; e.g. "VIDEO REFERENCES"; ~45 char/line |
| subhead | 0.8 | 1.58 | 11.73 | 0.45 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Lorem ipso dilir sit lorem ipsom ipsom d"; ~122 char/line |
| photo placeholder | 5.33 | 2.5 | 3.2 | 2.49 | — | Arial | — | right / top | asset `image44.png`; ph idx 23 |
| photo placeholder | 8.59 | 2.5 | 4.47 | 1.77 | — | Arial | — | right / top | asset `image44.png`; ph idx 24 |
| photo placeholder | 8.59 | 4.34 | 4.48 | 2.49 | — | Arial | — | right / top | asset `image44.png`; ph idx 25 |
| photo placeholder | 5.34 | 5.05 | 3.19 | 1.77 | — | Arial | — | right / top | asset `image44.png`; ph idx 26 |
| body / caption | 0.85 | 5.06 | 2.74 | 1.76 | **10.0pt** | Arial | #808080 gray | left / bottom | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |

**The mosaic is deliberately staggered:** wells at `x:5.33` are 3.20 wide, wells at `x:8.59` are 4.48 wide; the left pair splits 2.49/1.77 tall and the right pair 1.77/2.49 — the tall/short ratio inverts across the columns. That inversion is the composition. Column gutter 0.06; row gap 0.07.

### 12.2 Casting — 2 layouts, genuinely different

`Casting` and `Casting_Talent` are not variants of each other.

### Casting

**Uniform 4-up grid.** Four equal photo wells, each with a `Name:` field beneath. Uses the half-width report chassis (eyebrow #BFA588 y:0.54, title #919292 y:0.85).

**Template name:** `Casting`  |  **Slides:** 45  |  **Spec'd from:** slide 45
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 6.79 | 0.29 | **14.5pt** | — | #BFA588 spark-dim | — / bottom | ALL CAPS; line 90%; e.g. "TALENT SELECTS"; ~53 char/line |
| header title | 0.61 | 0.85 | 6.79 | 0.34 | **24.0pt** | Mazda Type | #919292 title-gray | — / top | ALL CAPS; e.g. "GROUPINGs"; ~32 char/line |
| photo placeholder | 1.15 | 2.06 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 25 |
| photo placeholder | 3.96 | 2.06 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 26 |
| photo placeholder | 6.77 | 2.06 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 27 |
| photo placeholder | 9.59 | 2.06 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 28 |
| body / caption | 1.13 | 4.98 | 1.7 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / top | line 120%; e.g. "Name:" |
| body / caption | 3.93 | 4.98 | 1.54 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / top | line 120%; e.g. "Name:" |
| body / caption | 6.72 | 4.98 | 1.54 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / top | line 120%; e.g. "Name:" |
| body / caption | 9.52 | 4.98 | 1.54 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / top | line 120%; e.g. "Name:" |

**Spacing:** wells at `x:1.13 / 3.93 / 6.72 / 9.52`, all `y:2.15 w:2.58 h:2.72`. Pitch **2.80**, gutter **0.22**. `Name:` labels sit at `y:4.98`, 0.11 below the wells, 10pt #5E5E5E. The grid is centred: 1.13 left margin against 1.23 right.

### Casting_Talent

**Staggered headshot/full-body pairs.** Four photo wells with extreme overhang — `w:13.09 h:11.48` frames at negative `y` (−5.21 and −6.60), cropped by the slide edge. These are heavily-cropped picture placeholders, not layout errors.

**Template name:** `Casting_Talent`  |  **Slides:** 46  |  **Spec'd from:** slide 46
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 6.79 | 0.29 | **14.5pt** | — | #BFA588 spark-dim | — / bottom | ALL CAPS; line 90%; e.g. "TALENT SELECTS"; ~53 char/line |
| header title | 0.61 | 0.85 | 6.79 | 0.5 | **24.0pt** | Mazda Type Bold | #919292 title-gray | — / top | ALL CAPS; e.g. "MALE"; ~32 char/line |
| photo placeholder | 0.81 | 2.08 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 24 |
| photo placeholder | 3.61 | 2.08 | 2.69 | 4.2 | — | Arial | — | right / top | asset `image58.png`; ph idx 23 |
| photo placeholder | 7.07 | 2.08 | 2.69 | 2.81 | — | Arial | — | right / top | asset `image58.png`; ph idx 22 |
| photo placeholder | 9.87 | 2.08 | 2.69 | 4.2 | — | Arial | — | right / top | asset `image58.png`; ph idx 21 |
| eyebrow / tag | 4.18 | 3.18 | 1.52 | 0.27 | **14.0pt** | — | #221F20 ink | center / top | line 120%; e.g. "Full body shot"; ~14 char/line |
| eyebrow / tag | 10.44 | 3.18 | 1.52 | 0.27 | **14.0pt** | — | #221F20 ink | center / top | line 120%; e.g. "Full body shot"; ~14 char/line |
| eyebrow / tag | 1.65 | 3.19 | 1.02 | 0.54 | **14.0pt** | — | #221F20 ink | center / top | line 120%; e.g. "Headshot"; ~9 char/line |
| eyebrow / tag | 7.91 | 3.19 | 1.02 | 0.54 | **14.0pt** | — | #221F20 ink | center / top | line 120%; e.g. "Headshot"; ~9 char/line |
| body / caption | 0.81 | 4.94 | 2.69 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / middle | line 120%; e.g. "Name:" |
| body / caption | 7.06 | 5.01 | 2.69 | 0.59 | **10.0pt** | Arial | #5E5E5E dk2 | left / top | line 120%; e.g. "Name:" |

**Read the pattern, not the raw numbers.** The four wells alternate `y:-5.21` (headshot) and `y:-6.60` (full body), at `x:0.81 / 3.61 / 7.07 / 9.87` — pitch **2.80**, matching `Casting`. Labels sit mid-slide: "Headshot" at `x:1.65 / 7.91`, "Full body shot" at `x:4.18 / 10.44`, all `y≈3.18`, 14pt #221F20. Two `Name:` fields (10pt, y:4.94 / 5.01) serve the two talent, not four.

The deck ships this as **MALE**; a matching female board would be a second instance, not a second layout.

### 12.3 Locations — 2 layouts

### Location Overview

**5-across labelled location strip**, plus extra photos stacked under column 5. Uses the half-width chassis.

**Template name:** `Location Overview`  |  **Slides:** 47  |  **Spec'd from:** slide 47
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 6.79 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "LOCATION: OVERVIEW"; ~53 char/line |
| body / caption | -0.0 | 1.7 | 2.56 | 0.23 | **9.5pt** | Arial | #5E5E5E dk2 | center / bottom | ALL CAPS; line 120%; e.g. "WORK SCENARIO" |
| body / caption | 2.66 | 1.71 | 2.56 | 0.23 | **9.5pt** | Arial | #5E5E5E dk2 | center / bottom | ALL CAPS; line 120%; e.g. "BOUTIQUE SPORTS CLUB" |
| body / caption | 5.41 | 1.71 | 2.51 | 0.23 | **9.5pt** | Arial | #5E5E5E dk2 | center / bottom | ALL CAPS; line 120%; e.g. "WEEKEND GETAWAY" |
| body / caption | 8.05 | 1.71 | 2.56 | 0.23 | **9.5pt** | Arial | #5E5E5E dk2 | center / bottom | ALL CAPS; line 120%; e.g. "RUNNING FOOTAGe" |
| body / caption | 10.74 | 1.72 | 2.77 | 0.23 | **9.5pt** | Arial | #5E5E5E dk2 | center / bottom | ALL CAPS; line 120%; e.g. "VINTAGE CAR SHOW" |
| photo placeholder | -0.01 | 2.01 | 2.56 | 1.53 | — | Arial | — | right / top | asset `image61.png`; ph idx 21 |
| photo placeholder | 2.69 | 2.01 | 2.55 | 1.53 | — | Arial | — | right / top | asset `image62.png`; ph idx 35 |
| photo placeholder | 5.37 | 2.01 | 2.55 | 1.53 | — | Arial | — | right / top | asset `image63.png`; ph idx 36 |
| photo placeholder | 8.09 | 2.01 | 2.55 | 1.53 | — | Arial | — | right / top | asset `image58.png`; ph idx 37 |
| photo placeholder | 10.79 | 2.01 | 2.55 | 1.53 | — | Arial | — | right / top | asset `image64.png`; ph idx 38 |
| photo placeholder | 10.78 | 3.7 | 2.55 | 1.53 | — | — | — | — / top | asset `image58.png`; ph idx 4294967295 |
| photo placeholder | 10.78 | 3.7 | 2.55 | 1.53 | — | — | — | — / top | asset `image65.png`; ph idx 4294967295 |
| photo placeholder | 10.78 | 5.41 | 2.55 | 1.53 | — | — | — | — / top | asset `image58.png`; ph idx 4294967295 |

**Spacing:** five wells at `x:-0.01 / 2.69 / 5.37 / 8.09 / 10.79`, all `y:2.01 w:2.55 h:1.53`. Pitch **2.70**, gutter **0.15**. The first well bleeds off the left edge. Labels sit **above** their wells at `y:1.70`, 9.5pt #5E5E5E, **centred**, 120% line spacing — the only centred captions in the deck.

**Documented anomaly, preserved:** three trailing wells carry placeholder index `4294967295` (unassigned), and **two occupy the identical rectangle** `x:10.78 y:3.70 w:2.55 h:1.53`. One is therefore invisible beneath the other. This is in the source; reproduce or drop the duplicate, but do not treat it as a fifth column.

### Location Detail

**Single-location deep dive.** Half-width chassis, a 10pt body block at y:1.96, three equal photo wells, and a small sun-tracking diagram top-right.

**Template name:** `Location Detail`  |  **Slides:** 48  |  **Spec'd from:** slide 48
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| photo placeholder | 11.24 | -0.24 | 1.38 | 3.01 | — | Arial | — | right / top | asset `image67.png`; ph idx 24 |
| eyebrow / tag | 0.61 | 0.54 | 6.79 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "DAY ONE LOCATION: LONG BEACH HOME"; ~53 char/line |
| header title | 0.61 | 0.85 | 6.79 | 0.34 | **24.0pt** | Mazda Type | #919292 title-gray | left / top | ALL CAPS; e.g. "Travel Inspired eclectic beach home"; ~32 char/line |
| body / caption | 0.61 | 1.96 | 4.95 | 1.15 | **10.0pt** | Arial | #929292 | left / top | line 90%; e.g. "large driveway" |
| subhead | 10.93 | 2.82 | 2.0 | 0.24 | **12.0pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "Track sun" |
| photo placeholder | 0.01 | 3.35 | 2.69 | 3.43 | — | Arial | — | right / top | asset `image66.png`; ph idx 21 |
| photo placeholder | 2.84 | 3.35 | 6.06 | 3.43 | — | Arial | — | right / top | asset `image69.png`; ph idx 30 |
| photo placeholder | 9.04 | 3.35 | 4.33 | 3.43 | — | Arial | — | right / top | asset `image68.png`; ph idx 29 |

**Spacing:** three wells at `x:0.11 / 4.63 / 9.16`, all `y:3.35 w:4.06 h:3.43`. Pitch **4.52**, gutter **0.46**. Outer wells bleed both side edges (0.11 left, 13.22 right). The sun diagram is a photo well at `x:11.24 y:-0.24 w:1.38 h:3.01` bleeding off the top, with a 12pt "Track sun" label at `y:2.82`.

### 12.4 Moodboards — 3 layouts

### Moodboard Props

**Dense prop grid.** Half-width chassis plus a 10pt bulleted notes block top-right at `x:7.78 y:0.54 w:4.95`. Background is **#D5D5D5**, not Paper.

**Template name:** `Moodboard Props`  |  **Slides:** 49  |  **Spec'd from:** slide 49
**Background:** solid **#D5D5D5** (lt2)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 6.79 | 0.29 | **14.5pt** | — | #BFA588 spark-dim | — / bottom | ALL CAPS; line 90%; e.g. "Props MOOD BOARD"; ~53 char/line |
| body / caption | 7.78 | 0.54 | 4.95 | 0.89 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "• Clean minimal design• Avoid busy patte" |
| header title | 0.61 | 0.85 | 6.79 | 0.34 | **24.0pt** | Mazda Type | #919292 title-gray | — / top | ALL CAPS; e.g. "CaR SHOW SCENARIO"; ~32 char/line |
| image (fixed asset) | 0.46 | 1.85 | 2.0 | 2.03 | — | — | — | — / top | asset `image71.png` |
| image (fixed asset) | 10.91 | 2.34 | 1.81 | 1.57 | — | — | — | — / top | asset `image70.png` |
| image (fixed asset) | 3.99 | 2.35 | 2.35 | 1.5 | — | — | — | — / top | asset `image73.png` |
| image (fixed asset) | 9.0 | 2.73 | 1.29 | 1.09 | — | — | — | — / top | asset `image78.jpeg` |
| image (fixed asset) | 2.35 | 2.77 | 1.38 | 1.1 | — | — | — | — / top | asset `image72.png` |
| image (fixed asset) | 7.35 | 2.8 | 1.3 | 0.8 | — | — | — | — / top | asset `image79.png` |
| image (fixed asset) | 6.34 | 2.9 | 0.62 | 0.59 | — | — | — | — / top | asset `image74.png` |
| image (fixed asset) | 6.8 | 2.9 | 0.62 | 0.59 | — | — | — | — / top | asset `image74.png` |
| image (fixed asset) | 6.77 | 3.38 | 1.75 | 0.47 | — | — | — | — / top | asset `image75.png` |
| body / caption | 3.19 | 3.95 | 1.62 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / middle | ALL CAPS; line 120%; e.g. "FOLDING TABLE" |
| body / caption | 0.76 | 4.02 | 1.62 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "FOLDING CHAIRS / 2 SETS" |
| body / caption | 5.51 | 4.02 | 2.12 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "STOVE TOP COOKER and coffee pot" |
| body / caption | 8.33 | 4.04 | 2.12 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "TUMBLERS" |
| body / caption | 10.9 | 4.04 | 2.12 | 0.58 | **6.5pt** | Arial | #5E5E5E dk2 | center / middle | ALL CAPS; e.g. "DomeStic cooler w/ ice" |
| body / caption | 5.51 | 4.22 | 2.12 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "STONE COFFEE MUGS" |
| image (fixed asset) | 0.94 | 4.58 | 1.13 | 0.66 | — | — | — | — / top | asset `image77.png` |
| image (fixed asset) | 5.91 | 4.82 | 1.0 | 0.74 | — | — | — | — / top | asset `image84.png` |
| image (fixed asset) | 3.24 | 5.16 | 1.57 | 1.59 | — | — | — | — / top | asset `image81.jpeg` |
| image (fixed asset) | 5.93 | 5.39 | 1.03 | 0.8 | — | — | — | — / top | asset `image83.png` |
| image (fixed asset) | 10.13 | 5.44 | 2.65 | 1.26 | — | — | — | — / top | asset `image76.jpeg` |
| image (fixed asset) | 7.62 | 5.51 | 2.04 | 1.18 | — | — | — | — / top | asset `image85.jpeg` |
| image (fixed asset) | 0.65 | 5.7 | 1.75 | 0.99 | — | — | — | — / top | asset `image80.png` |
| image (fixed asset) | 5.93 | 5.92 | 1.07 | 0.74 | — | — | — | — / top | asset `image82.png` |
| body / caption | 3.19 | 6.73 | 1.62 | 0.34 | **6.5pt** | Arial | #5E5E5E dk2 | center / middle | ALL CAPS; line 120%; e.g. "Box of pastries and napkins" |
| body / caption | 11.21 | 6.87 | 1.5 | 0.34 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "ADDITIONAL VINTAGE MAZDA COMING FROM CLI" |
| body / caption | 0.76 | 6.88 | 1.62 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "Small wool throw" |
| body / caption | 5.76 | 6.88 | 1.62 | 0.18 | **6.5pt** | Arial | #5E5E5E dk2 | center / top | ALL CAPS; line 120%; e.g. "Baseball caps for talent" |
| header title | 11.71 | 6.89 | 1.62 | 0.18 | **21.0pt** | Arial | #404040 | left / top | line 90%; e.g. "Variety of sunglasses"; ~10 char/line |

**Two different truths here — the layout and the demo slide disagree, and this one matters.**

The **layout** defines a strictly regular 5 x 2 caption grid: columns at `x:0.61 / 3.19 / 5.77 / 8.35 / 10.94` (pitch **2.58**, width 1.62), rows at `y:3.95` (h 0.18) and `y:6.73` (h 0.34) — **10 slots**, all 6.5pt #5E5E5E, the smallest type in the deck.

The **demo slide (49)** overrides that grid and ships **11 captions at irregular positions** (x values 0.76 / 3.19 / 5.51 / 5.76 / 8.33 / 10.90 / 11.21 / 11.71, y values drifting 3.95-4.22 and 6.73-6.89) over **17 images**. The current agent's "exactly 11 captions, 17 fixed-position images" is therefore **correct as a description of slide 49** — it is not an error.

**Recommendation:** build against the layout's regular 10-slot grid. It is the designed system, it is derivable, and it degrades predictably. Slide 49's 11th caption and its hand-nudged offsets are one art director's overrides on a single slide, not a spec. If you must match slide 49 exactly, note that its caption at `x:11.71 y:6.89` is set at **21pt** against 6.5pt everywhere else — almost certainly a source error, not an accent.

### Moodboard Wardrobe

**Character wardrobe board.** Full-width eyebrow (`w:12.12`), then the editorial title stack (35pt y:1.93 → 13pt y:2.82 → 10pt y:3.51) in a 3.65 left column.

**Template name:** `Moodboard Wardrobe`  |  **Slides:** 50  |  **Spec'd from:** slide 50
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.61 | 0.54 | 12.12 | 0.29 | **14.5pt** | Arial | #BFA588 spark-dim | left / bottom | ALL CAPS; line 90%; e.g. "MOM | WARDROBE MOOD BOARD"; ~96 char/line |
| photo placeholder | 4.51 | 1.48 | 2.15 | 3.67 | — | Arial | — | right / top | asset `image92.png`; ph idx 35 |
| photo placeholder | 6.74 | 1.48 | 2.15 | 3.67 | — | Arial | — | right / top | asset `image90.png`; ph idx 33 |
| photo placeholder | 9.0 | 1.48 | 2.11 | 3.67 | — | Arial | — | right / top | asset `image88.png`; ph idx 27 |
| photo placeholder | 11.24 | 1.49 | 2.1 | 3.67 | — | Arial | — | right / top | asset `image89.png`; ph idx 28 |
| section title | 0.61 | 1.75 | 3.9 | 1.16 | **35.0pt** | Mazda Type | #808080 gray | left / top | line 80%; e.g. "WEEKEND WEAR"; ~14 char/line |
| subhead | 0.61 | 2.82 | 3.65 | 0.69 | **13.0pt** | Arial | #262626 asphalt | left / top | e.g. "Female"; ~36 char/line |
| body / caption | 0.61 | 3.51 | 3.65 | 1.76 | **10.0pt** | Arial | #808080 gray | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 9.35 | 3.62 | 1.4 | 2.1 | — | Arial | — | right / top | asset `image87.png`; ph idx 26 |
| photo placeholder | 11.69 | 4.83 | 1.19 | 0.63 | — | Arial | — | right / top | asset `image91.jpeg`; ph idx 34 |
| photo placeholder | 11.72 | 5.51 | 1.14 | 0.93 | — | Arial | — | right / top | asset `image86.png`; ph idx 21 |
| body / caption | 11.63 | 6.49 | 1.33 | 0.35 | **8.0pt** | Arial | #929292 | left / middle | line 70%; e.g. "Silver modern wedding ring" |

**Spacing:** four outfit wells at `x:4.50 / 6.75 / 9.01 / 11.26`, all `y:1.60 w:2.16 h:3.67`. Pitch **2.25**, gutter **0.09** — a tight filmstrip. Three accessory elements sit lower right (`x:9.35 y:3.62`, `x:11.69 y:3.80`, `x:11.72 y:5.51`) with an 8pt caption at `y:6.49`.

### Moodboard  *(trailing space in the template name)*

**Tone-and-manner mosaic.** Eight photo wells, no per-photo captions. A 35pt title at `x:0.36 y:0.27` and a 14.5pt annotation at `x:6.73 y:0.40` (#BFA588).

**Template name:** `Moodboard `  |  **Slides:** 51  |  **Spec'd from:** slide 51
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| section title | 0.36 | 0.27 | 6.32 | 0.68 | **35.0pt** | Mazda Type | — | — / middle | line 80%; e.g. "TONE & MANNER"; ~24 char/line |
| eyebrow / tag | 6.73 | 0.4 | 6.24 | 0.43 | **14.5pt** | Arial | #BFA588 spark-dim | right / top | ALL CAPS; line 90%; e.g. "EXT: RHODIUM WHITE  INT: BLACK LEATHER"; ~48 char/line |
| image (fixed asset) | -0.01 | 1.17 | 4.43 | 4.5 | — | — | — | — / top | asset `image98.png` |
| image (fixed asset) | 4.41 | 1.17 | 2.55 | 2.89 | — | — | — | — / top | asset `image93.jpeg` |
| image (fixed asset) | 6.47 | 1.17 | 3.01 | 2.72 | — | — | — | — / top | asset `image94.jpeg` |
| image (fixed asset) | 9.48 | 1.17 | 3.85 | 2.71 | — | — | — | — / top | asset `image97.jpeg` |
| image (fixed asset) | 7.28 | 3.87 | 6.08 | 3.67 | — | — | — | — / top | asset `image96.jpeg` |
| image (fixed asset) | 4.41 | 3.88 | 2.92 | 1.79 | — | — | — | — / top | asset `image95.jpeg` |
| image (fixed asset) | 3.92 | 5.67 | 3.36 | 1.85 | — | — | — | — / top | asset `image100.jpeg` |
| image (fixed asset) | 0.0 | 5.7 | 3.95 | 1.79 | — | — | — | — / top | asset `image99.png` |

**The mosaic is a two-band asymmetric packing, not a grid.**

*Upper band, y:1.17, height 2.70:* `x:-0.03 w:4.45` (also 4.50 tall, spanning both bands) · `x:4.46 w:2.01` · `x:6.46 w:3.02` · `x:9.49 w:3.84`
*Lower band, y:3.86–5.71:* `x:7.28 y:3.86 w:6.04 h:3.63` · `x:4.46 y:3.87 w:2.77 h:1.81` · `x:-0.03 y:5.71 w:3.91 h:1.79` · `x:3.92 y:5.71 w:3.36 h:1.79`

Widths vary from 2.01 to 6.04 deliberately. Wells bleed off the left edge (−0.03) and the bottom (5.71 + 1.79 = 7.50). **Reproduce these positions verbatim** — there is no derivable rule, and re-deriving a "tidy" grid destroys the composition. Note the layout name ends in a space.
---

## 13. Social / paid media — 16 layouts

Sixteen layouts across five platforms. **These are not presentation slides — they are paid-media spec sheets.** Each pairs a copy-deck rail with device mockups showing creative at a named aspect ratio. The current agent has none of them.

### 13.1 The shared social chassis

Every non-divider social layout is built from the same two parts.

**Part 1 — the copy rail.** A tinted panel down the left edge, `x:0 y:0 w:3.52 h:7.50`, fill **#E2E2E2**, carrying a fixed field stack:

| Field | y | Size | Colour | Content |
|---|---|---|---|---|
| Format name | 0.98 | **11.5pt** | #5E5E5E | e.g. "SINGLE VIDEO & STATIC" |
| Campaign | 1.47 | **11pt** | #919292 | `cap="all"` |
| Size | 1.92 | **7pt** | #5E5E5E | e.g. "Size: 4:5" |
| `Post copy (500 ch):` | 2.27 | **11.5pt** | #5E5E5E | label |
| — post copy body | 2.71 | **11.5pt** | #868686 | 1.17 tall |
| `Headline (100 ch):` | 3.90 | **11.5pt** | #5E5E5E | label |
| — headline body | 4.34 | **11.5pt** | #868686 | |
| `Alts:` | 5.01 | **11.5pt** | #5E5E5E | label |
| — alts body | 5.42 | **10pt** | #868686 | |
| `Super:` | 6.03 | **10pt** | #868686 | |
| `CTA:` | 6.44 | **10pt** | #868686 | e.g. "CTA: Learn More" |
| `Destination:` | 6.85 | **10pt** | #868686 | e.g. "Destination: VLP" |

All fields sit at `x:0.47 w:2.65`. **The character limits in the labels are contractual** — "Post copy (500 ch)" and "Headline (100 ch)" are platform limits. Enforce them when generating copy; do not treat them as decorative.

> The carousel layouts move this rail to a **horizontal** band across the top (`w:13.35 h:2.73`) and shift the field `x` to 0.58 / 4.74 / 8.90 in three groups. Same fields, same sizes, re-flowed.

**Part 2 — device mockups.** A fixed phone-chrome image (typically `w:3.97 h:6.40`) with a **picture placeholder inset** for the creative. The inset, not the chrome, is the user slot. Aspect labels ("9:16 STATIC", "1:1 Carousel") are 7.5pt #5E5E5E and describe the required asset ratio.

### 13.2 Platform dividers — 5 layouts

`Meta_Divider`, `Reddit_Divider`, `TikTok_Divider`, `Pinterest_Divider`, `Youtube_Divider` share one structure: solid **#000000** background, a full-bleed image well (`x:-0.03 y:-2.33 w:15.11 h:10.08`), a platform logo, and a large right-hand image.

**All five carry four magenta #CB297B annotations** — "PLACE YOUR OWN IMAGE" ×2 and "click here" ×2. **Strip these on build** (§5.1).

### 13.3 Format coverage

| Platform | Layouts | Ratios specified |
|---|---|---|
| Meta | `Meta_Divider`, `Meta_Carousel 1x1`, `Meta_Carousel 4x5`, `Meta_Video&Static` | 1:1, 4:5, 9:16 |
| Reddit | `Reddit_Divider`, `Reddit_Carousel`, `Reddit_Vid&Static1:1`, `Reddit_Vid&Static4:5` | 1:1, 4:5 |
| TikTok | `TikTok_Divider`, `TikTok_Carousel`, `TikTok_Vid&Static` | 9:16 |
| Pinterest | `Pinterest_Divider`, `Pinterest 2:3`, `Pinterest 1:1` | 2:3, 1:1 |
| YouTube | `Youtube_Divider`, `Youtube_VideoAd` | 16:9 |

Pick the layout by the **asset ratio being delivered**, not by taste. A 4:5 asset in a 1:1 frame will be cropped by the mockup inset.

### Meta_Divider

**Template name:** `Meta_Divider`  |  **Slides:** 55  |  **Spec'd from:** slide 55
**Background:** solid **#000000** (black)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 5.48 | -0.02 | 7.89 | 7.53 | — | — | — | — / top | asset `image19.png` |
| photo placeholder | -0.01 | 0.0 | 13.35 | 7.5 | — | Arial | — | right / top | asset `image102.jpeg`; ph idx 21 |
| image (fixed asset) | 0.52 | 3.0 | 3.52 | 0.71 | — | — | — | — / top | asset `image103.png` |
| shape | 9.88 | 6.96 | 4.23 | 0.19 | — | — | — | — / top | — |

### Meta_Carousel 1x1

**Template name:** `Meta_Carousel 1x1`  |  **Slides:** 57  |  **Spec'd from:** slide 57
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 13.35 | 2.73 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~115 char/line |
| body / caption | 4.74 | 0.11 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 8.9 | 0.11 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 8.9 | 0.52 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 4.74 | 0.55 | 2.67 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| image (fixed asset) | 0.56 | 0.7 | 0.97 | 0.2 | — | — | — | — / top | asset `image22.png` |
| body / caption | 0.6 | 1.07 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "CAROUSEL" |
| body / caption | 8.9 | 1.13 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 8.9 | 1.54 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.6 | 1.56 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 4.74 | 1.74 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 8.9 | 1.96 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |
| body / caption | 0.58 | 2.01 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| image (fixed asset) | 0.0 | 2.02 | 3.49 | 5.63 | — | — | — | — / top | asset `image21.png` |
| body / caption | 4.74 | 2.18 | 2.67 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| photo placeholder | 0.68 | 3.15 | 2.14 | 3.27 | — | Arial | — | right / top | asset `image105.png`; ph idx 21 |
| body / caption | 0.77 | 3.5 | 1.97 | 0.51 | **6.5pt** | Arial | #000000 black | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| body / caption | 10.68 | 3.64 | 1.23 | 0.23 | **11.0pt** | — | #5E5E5E dk2 | — / middle | ALL CAPS; e.g. "1:1 Carousel" |
| photo placeholder | 2.97 | 4.04 | 2.14 | 2.13 | — | Arial | — | right / top | asset `image106.png`; ph idx 22 |
| photo placeholder | 5.21 | 4.04 | 2.14 | 2.13 | — | Arial | — | right / top | asset `image106.png`; ph idx 24 |
| photo placeholder | 7.44 | 4.04 | 2.14 | 2.13 | — | Arial | — | right / top | asset `image106.png`; ph idx 25 |
| photo placeholder | 9.68 | 4.04 | 2.14 | 2.13 | — | Arial | — | right / top | asset `image106.png`; ph idx 26 |

### Meta_Carousel 4x5

**Template name:** `Meta_Carousel 4x5`  |  **Slides:** 58  |  **Spec'd from:** slide 58
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 13.35 | 2.73 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~115 char/line |
| body / caption | 4.74 | 0.11 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 8.9 | 0.11 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 8.9 | 0.52 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 4.74 | 0.55 | 2.67 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| image (fixed asset) | 0.56 | 0.7 | 0.97 | 0.2 | — | — | — | — / top | asset `image22.png` |
| body / caption | 0.6 | 1.07 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "CAROUSEL" |
| body / caption | 8.9 | 1.13 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 8.9 | 1.54 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.6 | 1.56 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 4.74 | 1.74 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 8.9 | 1.96 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |
| body / caption | 0.58 | 2.01 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| image (fixed asset) | -0.02 | 2.02 | 3.49 | 5.63 | — | — | — | — / top | asset `image21.png` |
| body / caption | 4.74 | 2.18 | 2.67 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| photo placeholder | 0.68 | 2.99 | 2.14 | 0.32 | — | Arial | — | right / top | asset `image105.png`; ph idx 21 |
| body / caption | 10.78 | 3.21 | 1.23 | 0.23 | **11.0pt** | — | #5E5E5E dk2 | — / middle | ALL CAPS; e.g. "4:5 Carousel" |
| body / caption | 0.77 | 3.34 | 1.97 | 0.51 | **6.5pt** | Arial | #000000 black | left / top | line 110%; e.g. "Lorem ipsum dolor sit amet, consectetur " |
| photo placeholder | 2.97 | 3.6 | 2.14 | 2.67 | — | Arial | — | right / top | asset `image106.png`; ph idx 22 |
| photo placeholder | 5.24 | 3.6 | 2.14 | 2.67 | — | Arial | — | right / top | asset `image106.png`; ph idx 26 |
| photo placeholder | 7.5 | 3.6 | 2.14 | 2.67 | — | Arial | — | right / top | asset `image106.png`; ph idx 27 |
| photo placeholder | 9.77 | 3.6 | 2.14 | 2.67 | — | Arial | — | right / top | asset `image106.png`; ph idx 28 |
| photo placeholder | 0.71 | 3.74 | 2.04 | 2.55 | — | Arial | — | right / top | asset `image106.png`; ph idx 25 |
| photo placeholder | 0.68 | 6.37 | 2.1 | 0.2 | — | Arial | — | right / top | asset `image105.png`; ph idx 24 |

### Meta_Video&Static

**Template name:** `Meta_Video&Static`  |  **Slides:** 56  |  **Spec'd from:** slide 56
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.0 | -0.0 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 0.56 | 0.7 | 0.97 | 0.2 | — | — | — | — / top | asset `image22.png` |
| image (fixed asset) | 4.34 | 0.88 | 3.97 | 6.4 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 7.94 | 0.88 | 3.97 | 6.4 | — | — | — | — / top | asset `image23.png` |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| body / caption | 5.63 | 1.02 | 1.38 | 0.26 | **7.5pt** | — | #5E5E5E dk2 | center / middle | e.g. "9:16 STATIC REEL" |
| body / caption | 9.44 | 1.02 | 0.97 | 0.26 | **7.5pt** | — | #5E5E5E dk2 | center / middle | e.g. "9:16 STORY" |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| photo placeholder | 5.13 | 1.48 | 2.46 | 5.23 | — | Arial | — | right / top | asset `image104.png`; ph idx 24 |
| photo placeholder | 8.73 | 1.48 | 2.46 | 5.23 | — | Arial | — | right / top | asset `image104.png`; ph idx 26 |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### Reddit_Divider

**Template name:** `Reddit_Divider`  |  **Slides:** 65  |  **Spec'd from:** slide 65
**Background:** solid **#000000** (black)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 5.48 | -0.02 | 7.89 | 7.53 | — | — | — | — / top | asset `image112.png` |
| photo placeholder | 0.0 | 0.0 | 13.33 | 7.5 | — | Arial | — | right / top | asset `image107.tif`; ph idx 21 |
| image (fixed asset) | 0.0 | 0.3 | 13.33 | 7.21 | — | — | — | — / top | asset `image107.tif` |
| photo placeholder | 1.01 | 3.28 | 3.28 | 1.85 | — | Arial | — | right / top | asset `image114.png`; ph idx 22 |
| image (fixed asset) | 1.01 | 3.28 | 3.28 | 1.85 | — | — | — | — / top | asset `image114.png` |
| shape | 9.88 | 6.96 | 4.23 | 0.19 | — | — | — | — / top | — |

### Reddit_Carousel

**Template name:** `Reddit_Carousel`  |  **Slides:** 68  |  **Spec'd from:** slide 68
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 13.35 | 2.73 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~115 char/line |
| body / caption | 4.74 | 0.11 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 8.9 | 0.11 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| photo placeholder | 0.61 | 0.44 | 1.22 | 0.68 | — | Arial | — | right / top | asset `image114.png`; ph idx 27 |
| body / caption | 8.9 | 0.52 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 4.74 | 0.55 | 2.67 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| body / caption | 0.6 | 1.07 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; line 115%; e.g. "CAROUSEL" |
| body / caption | 8.9 | 1.13 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 8.9 | 1.54 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.6 | 1.56 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 4.74 | 1.74 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 8.9 | 1.96 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |
| body / caption | 0.58 | 2.01 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| image (fixed asset) | 0.55 | 2.05 | 3.48 | 5.62 | — | — | — | — / top | asset `image24.png` |
| body / caption | 4.74 | 2.18 | 2.67 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| image (fixed asset) | 1.25 | 3.26 | 2.08 | 3.19 | — | — | — | — / top | asset `image25.png` |
| body / caption | 11.45 | 3.3 | 0.83 | 0.16 | **7.0pt** | Arial | #5E5E5E dk2 | left / middle | ALL CAPS; e.g. "4:5 Carousel" |
| photo placeholder | 3.53 | 3.56 | 2.1 | 2.62 | — | Arial | — | right / top | asset `image118.png`; ph idx 22 |
| photo placeholder | 1.26 | 3.57 | 2.08 | 2.6 | — | Arial | — | right / top | asset `image118.png`; ph idx 26 |
| photo placeholder | 5.72 | 3.57 | 2.1 | 2.62 | — | Arial | — | right / top | asset `image118.png`; ph idx 23 |
| photo placeholder | 7.9 | 3.57 | 2.1 | 2.62 | — | Arial | — | right / top | asset `image118.png`; ph idx 24 |
| photo placeholder | 10.08 | 3.57 | 2.1 | 2.62 | — | Arial | — | right / top | asset `image118.png`; ph idx 25 |

### Reddit_Vid&Static1:1

**Template name:** `Reddit_Vid&Static1:1`  |  **Slides:** 67  |  **Spec'd from:** slide 67
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 0.44 | 0.23 | 1.75 | 0.98 | — | — | — | — / top | asset `image27.png` |
| image (fixed asset) | 4.16 | 0.26 | 4.65 | 7.5 | — | — | — | — / top | asset `image26.png` |
| image (fixed asset) | 7.57 | 0.26 | 4.65 | 7.5 | — | — | — | — / top | asset `image26.png` |
| image (fixed asset) | 0.61 | 0.44 | 1.22 | 0.62 | — | — | — | — / top | asset `image114.png` |
| body / caption | 5.75 | 0.51 | 1.38 | 0.26 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "1:1 STATIC" |
| body / caption | 9.37 | 0.56 | 0.63 | 0.17 | **7.5pt** | Arial | #5E5E5E dk2 | left / middle | e.g. "1:1 VIDEO" |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| shape | 5.1 | 2.69 | 2.75 | 3.64 | — | — | — | — / top | — |
| shape | 8.5 | 2.69 | 2.75 | 3.64 | — | — | — | — / top | — |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| photo placeholder | 5.1 | 2.75 | 2.75 | 4.21 | — | Arial | — | right / top | asset `image116.png`; ph idx 23 |
| photo placeholder | 8.5 | 2.75 | 2.75 | 4.21 | — | Arial | — | right / top | asset `image116.png`; ph idx 24 |
| photo placeholder | 8.5 | 3.16 | 2.75 | 2.75 | — | Arial | — | right / top | asset `image117.png`; ph idx 25 |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### Reddit_Vid&Static4:5

**Template name:** `Reddit_Vid&Static4:5`  |  **Slides:** 66  |  **Spec'd from:** slide 66
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| body / caption | 0.0 | 0.0 | 3.52 | 7.5 | **9.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2 |
| image (fixed asset) | 4.16 | 0.26 | 4.65 | 7.5 | — | — | — | — / top | asset `image24.png` |
| image (fixed asset) | 7.71 | 0.26 | 4.65 | 7.5 | — | — | — | — / top | asset `image24.png` |
| photo placeholder | 0.61 | 0.44 | 1.22 | 0.62 | — | Arial | — | right / top | asset `image114.png`; ph idx 21 |
| body / caption | 5.75 | 0.51 | 1.38 | 0.26 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "1:1 STATIC" |
| body / caption | 9.55 | 0.51 | 0.97 | 0.26 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "9:16 VIDEO" |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| image (fixed asset) | 5.09 | 1.9 | 2.8 | 4.28 | — | — | — | — / top | asset `image25.png` |
| image (fixed asset) | 8.67 | 1.9 | 2.8 | 4.28 | — | — | — | — / top | asset `image25.png` |
| photo placeholder | 5.1 | 1.91 | 2.78 | 4.26 | — | Arial | — | right / top | asset `image116.png`; ph idx 23 |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| photo placeholder | 8.67 | 2.34 | 2.8 | 3.51 | — | Arial | — | right / top | asset `image115.png`; ph idx 22 |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### TikTok_Divider

**Template name:** `TikTok_Divider`  |  **Slides:** 62  |  **Spec'd from:** slide 62
**Background:** solid **#000000** (black)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 5.48 | -0.02 | 7.89 | 7.53 | — | — | — | — / top | asset `image112.png` |
| photo placeholder | -0.01 | 0.0 | 13.35 | 7.5 | — | Arial | — | right / top | asset `image102.jpeg`; ph idx 21 |
| photo placeholder | 0.72 | 2.99 | 3.35 | 0.99 | — | Arial | — | right / top | asset `image111.png`; ph idx 22 |
| image (fixed asset) | 0.72 | 2.99 | 3.35 | 0.99 | — | — | — | — / top | asset `image111.png` |
| shape | 9.88 | 6.96 | 4.23 | 0.19 | — | — | — | — / top | — |

### TikTok_Carousel

**Template name:** `TikTok_Carousel`  |  **Slides:** 64  |  **Spec'd from:** slide 64
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 13.35 | 2.73 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~115 char/line |
| body / caption | 4.74 | 0.11 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 8.9 | 0.11 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 8.9 | 0.52 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 4.74 | 0.55 | 2.67 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| image (fixed asset) | 0.54 | 0.6 | 1.23 | 0.36 | — | — | — | — / top | asset `image28.png` |
| body / caption | 0.6 | 1.07 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "CAROUSEL" |
| body / caption | 8.9 | 1.13 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 8.9 | 1.54 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.6 | 1.56 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 4.74 | 1.74 | 2.67 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 8.9 | 1.96 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |
| body / caption | 0.58 | 2.01 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 4.74 | 2.18 | 2.67 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| image (fixed asset) | 6.3 | 2.9 | 2.88 | 4.64 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 8.4 | 2.9 | 2.88 | 4.64 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | -0.03 | 2.91 | 2.88 | 4.64 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 2.08 | 2.91 | 2.88 | 4.64 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 4.14 | 2.91 | 2.88 | 4.64 | — | — | — | — / top | asset `image23.png` |
| photo placeholder | 6.87 | 3.35 | 1.75 | 3.73 | — | Arial | — | right / top | asset `image113.png`; ph idx 25 |
| photo placeholder | 8.97 | 3.35 | 1.75 | 3.73 | — | Arial | — | right / top | asset `image113.png`; ph idx 26 |
| photo placeholder | 0.54 | 3.36 | 1.75 | 3.73 | — | Arial | — | right / top | asset `image113.png`; ph idx 22 |
| photo placeholder | 2.65 | 3.36 | 1.75 | 3.73 | — | Arial | — | right / top | asset `image113.png`; ph idx 23 |
| photo placeholder | 4.71 | 3.36 | 1.75 | 3.73 | — | Arial | — | right / top | asset `image113.png`; ph idx 24 |
| body / caption | 10.99 | 3.55 | 0.94 | 0.17 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | ALL CAPS; e.g. "9:16 Carousel" |

### TikTok_Vid&Static

**Template name:** `TikTok_Vid&Static`  |  **Slides:** 63  |  **Spec'd from:** slide 63
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | -0.01 | -0.01 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 0.54 | 0.6 | 1.23 | 0.36 | — | — | — | — / top | asset `image28.png` |
| image (fixed asset) | 4.15 | 0.79 | 3.97 | 6.4 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 8.05 | 0.79 | 3.97 | 6.4 | — | — | — | — / top | asset `image23.png` |
| body / caption | 5.44 | 0.86 | 1.38 | 0.26 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "9:16 STATIC" |
| body / caption | 9.35 | 0.86 | 1.38 | 0.26 | **7.5pt** | Arial | #5E5E5E dk2 | center / middle | e.g. "9:16 VIDEO" |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| photo placeholder | 4.92 | 1.42 | 2.43 | 5.13 | — | Arial | — | right / top | asset `image113.png`; ph idx 22 |
| photo placeholder | 8.83 | 1.42 | 2.43 | 5.13 | — | Arial | — | right / top | asset `image113.png`; ph idx 23 |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### Pinterest_Divider

**Template name:** `Pinterest_Divider`  |  **Slides:** 59  |  **Spec'd from:** slide 59
**Background:** solid **#000000** (black)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 5.48 | -0.02 | 7.89 | 7.53 | — | — | — | — / top | asset `image19.png` |
| photo placeholder | 0.0 | 0.0 | 13.33 | 7.5 | — | Arial | — | right / top | asset `image107.tif`; ph idx 21 |
| photo placeholder | 0.98 | 3.71 | 3.23 | 0.78 | — | Arial | — | right / top | asset `image108.png`; ph idx 22 |
| image (fixed asset) | 0.98 | 3.71 | 3.23 | 0.78 | — | — | — | — / top | asset `image108.png` |
| shape | 9.88 | 6.96 | 4.23 | 0.19 | — | — | — | — / top | — |

### Pinterest 2:3

**Template name:** `Pinterest 2:3`  |  **Slides:** 60  |  **Spec'd from:** slide 60
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.0 | -0.0 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 0.51 | 0.64 | 1.27 | 0.31 | — | — | — | — / top | asset `image30.png` |
| image (fixed asset) | 3.92 | 0.77 | 3.97 | 6.4 | — | — | — | — / top | asset `image23.png` |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| photo placeholder | 4.71 | 1.36 | 2.4 | 5.2 | — | Arial | — | right / top | asset `image110.png`; ph idx 23 |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| photo placeholder | 8.76 | 1.88 | 2.44 | 4.18 | — | Arial | — | right / top | asset `image109.png`; ph idx 21 |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| photo placeholder | 5.92 | 2.97 | 1.17 | 2.0 | — | Arial | — | right / top | asset `image109.png`; ph idx 24 |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| image (fixed asset) | 8.77 | 5.54 | 2.42 | 0.51 | — | — | — | — / top | asset `image29.png` |
| body / caption | 8.89 | 5.68 | 0.91 | 0.23 | **11.0pt** | Arial | #FFFFFF white | left / middle | e.g. "Learn more" |
| eyebrow / tag | 8.77 | 5.69 | 1.37 | 0.31 | **16.0pt** | — | #FFFFFF white | center / middle | fill #000000; ~11 char/line |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### Pinterest 1:1

**Template name:** `Pinterest 1:1`  |  **Slides:** 61  |  **Spec'd from:** slide 61
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.0 | -0.0 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 5.67 | 0.14 | 4.72 | 7.62 | — | — | — | — / top | asset `image23.png` |
| image (fixed asset) | 0.51 | 0.64 | 1.27 | 0.31 | — | — | — | — / top | asset `image30.png` |
| image (fixed asset) | 6.6 | 0.89 | 2.85 | 6.08 | — | — | — | — / top | asset `image31.png` |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| photo placeholder | 6.61 | 2.74 | 2.77 | 2.84 | — | Arial | — | right / top | ph idx 21 |
| image (fixed asset) | 6.65 | 2.8 | 2.73 | 2.77 | — | — | — | — / top | asset `image109.png` |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |

### Youtube_Divider

**Template name:** `Youtube_Divider`  |  **Slides:** 69  |  **Spec'd from:** slide 69
**Background:** solid **#000000** (black)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| image (fixed asset) | 5.48 | -0.02 | 7.89 | 7.53 | — | — | — | — / top | asset `image112.png` |
| photo placeholder | -0.01 | 0.0 | 13.35 | 7.5 | — | Arial | — | right / top | asset `image102.jpeg`; ph idx 21 |
| image (fixed asset) | -0.01 | 0.0 | 13.35 | 7.5 | — | — | — | — / top | asset `image102.jpeg` |
| photo placeholder | 0.92 | 3.14 | 3.14 | 0.73 | — | Arial | — | right / top | asset `image119.png`; ph idx 22 |
| image (fixed asset) | 0.92 | 3.14 | 3.14 | 0.73 | — | — | — | — / top | asset `image119.png` |
| shape | 10.82 | 6.96 | 4.23 | 0.19 | — | — | — | — / top | — |

### Youtube_VideoAd

**Template name:** `Youtube_VideoAd`  |  **Slides:** 70  |  **Spec'd from:** slide 70
**Background:** solid **#FFFFFF** (white)

| Element | x | y | w | h | Size | Font | Colour | Align / Anchor | Notes |
|---|---|---|---|---|---|---|---|---|---|
| eyebrow / tag | 0.0 | -0.01 | 3.52 | 7.5 | **16.0pt** | — | #D5D5D5 lt2 | center / middle | fill #E2E2E2; ~30 char/line |
| image (fixed asset) | 0.52 | 0.66 | 1.27 | 0.3 | — | — | — | — / top | asset `image33.png` |
| photo placeholder | 4.33 | 0.96 | 7.69 | 4.33 | — | Arial | — | right / top | asset `image120.png`; ph idx 21 |
| image (fixed asset) | 4.33 | 0.96 | 7.69 | 4.33 | — | — | — | — / top | asset `image120.png` |
| body / caption | 0.47 | 0.98 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "SINGLE VIDEO & STATIC" |
| image (fixed asset) | 4.35 | 0.99 | 7.65 | 5.98 | — | — | — | — / top | asset `image121.png` |
| body / caption | 0.47 | 1.47 | 2.65 | 0.42 | **11.0pt** | Arial | #919292 title-gray | left / top | ALL CAPS; line 90%; e.g. "CX-5 Crafted With Care" |
| body / caption | 0.47 | 1.92 | 2.65 | 0.33 | **7.0pt** | Arial | #5E5E5E dk2 | left / top | ALL CAPS; e.g. "Size: 4:5" |
| body / caption | 0.47 | 2.27 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Post copy (500 ch):" |
| body / caption | 0.47 | 2.71 | 2.65 | 1.17 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "You don’t just see the Mazda CX-5—you fe" |
| body / caption | 0.47 | 3.9 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Headline (100 ch):" |
| body / caption | 0.47 | 4.34 | 2.65 | 0.38 | **11.5pt** | Arial | #868686 muted | left / top | line 90%; e.g. "Crafted with Care" |
| body / caption | 0.47 | 5.01 | 2.65 | 0.41 | **11.5pt** | Arial | #5E5E5E dk2 | left / top | line 115%; e.g. "Alts:" |
| body / caption | 0.47 | 5.42 | 2.65 | 0.58 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "The Mazda CX-5" |
| header title | 5.49 | 5.56 | 4.45 | 0.7 | **20.5pt** | Arial | #FFFFFF white | left / top | e.g. "Lorem ipsum dolor sit amet con"; ~29 char/line |
| header title | 5.49 | 5.56 | 4.45 | 0.7 | **20.5pt** | Arial | #FFFFFF white | left / top | e.g. "Lorem ipsum dolor sit amet con"; ~29 char/line |
| body / caption | 0.47 | 6.03 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Super:" |
| body / caption | 0.47 | 6.44 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "CTA: Learn More" |
| body / caption | 0.47 | 6.85 | 2.65 | 0.39 | **10.0pt** | Arial | #868686 muted | left / top | line 115%; e.g. "Destination: VLP" |
---

## 14. Build rules and pre-flight checklist

### 14.1 Copy-fitting

Capacity is set by column width and point size, and it is tight in this template because the type is large. Working figures at the sizes that matter:

| Context | Column | Size | Chars/line | Max lines |
|---|---|---|---|---|
| Cover title (`Cover Light`/`Dark`) | 12.56 | 54.5pt | ~26 | 1 |
| Cover title (`Cover Light2`) | 9.65 | 54.5pt | ~20 | 2 |
| Cover title (`Cover Photo2`) | 6.48 | 54.5pt | ~15 | 1 |
| Divider title | 12.12 | 54.5pt | ~25 | 1 |
| Statement | 13.09 | 140pt | ~10 | 2 |
| Editorial title | 3.65–6.84 | 35pt | ~13–24 | 1–2 |
| Report title | 12.12 | 24pt | ~65 | 1 |
| TOC entry | 7.58 | 30pt | ~31 | 9 entries |
| Body copy | 2.65–5.36 | 10pt | ~37–74 | fills box |
| VO script | 4.93 | 9.5pt | ~78 | ~40 |

**The hero titles are the constraint.** At 54.5pt all-caps a cover title gets ~26 characters — "MAZDA MOTION WORKS" is 18. Titles longer than ~26 characters need `Cover Light2` (2-line box) or they overset. Check the title against the box **before** choosing the layout, not after.

### 14.2 Rules that come from the source, not from taste

1. **Never re-scale the point sizes in this document.** They are engine-space. §0.1.
2. **Author text in natural case.** Hero titles, tags and eyebrows carry `cap="all"`; the layout uppercases. Pre-uppercasing breaks nothing visually but corrupts the string for search and accessibility.
3. **Select the logo colourway by background.** White marks on dark, black on light. §4.1.
4. **Emit photo wells as `type="pic"` placeholders**, never as filled shapes — that is what makes "Change Picture…" work. §5.
5. **Strip every #CB297B element.** §5.1.
6. **Do not clamp negative or overflowing coordinates.** Full bleed is the design. §1.
7. **Keep the divider tag Spark** on all eight variants, including the colour-mood ones. §7.
8. **Keep the statement white** on all four headline variants, including `light`. Flag the contrast in speaker notes rather than "fixing" it. §8.
9. **Don't select `Title & Bullets`, or the retired `blankDark`/`blankGrey`/`blankLight` engine names.** Use `reportPlatformMatrix`, `reportStatRow`, `reportEcosystemTree`, `reportJourneyMap` respectively — the retired names still resolve but log a warning. §11.4.
10. **Fixed counts:** `Storyboard 02` = 6 panels, `Casting` = 4 talent, `Location Overview` = 5 locations, `Moodboard Wardrobe` = 4 outfits, `Moodboard ` = 8 wells, `Moodboard Props` = 10 caption slots, `reportMetricTable` = 7 columns, `reportStrategyStack` = 2 badges / 3 panels / 3 footers, `reportJourneyMap` = 4 panels x 3 sections, `reportPlatformMatrix` = 8 spokes max, `reportEcosystemTree` = 8 branches max, `reportSplitPanels` = 4 milestones max, `reportGateStatus` = 6 gates / 5 dividers max, `reportNumberedSteps` = 6 steps (fixed, not a max -- the serpentine layout is hardcoded to 3x2). `reportChannelMatrix`'s group/row counts are the one exception in this family: read from `cfg.groups[].rows.length`, not fixed. None of the others has a spare cell or an overflow rule.
11. **Horizontal bars get rounded (pill) ends; vertical bars stay square.** Confirmed against the source design (slides 86/87 — `Rounded Rectangle`, `adj=[0.5]`, full pill, on variable-width/fixed-height horizontal bars) and by explicit correction after an early draft of this rule wrongly rounded vertical bar tops. Applies to `reportSplitPanels` and `reportSpendBars(Light/Dark)` (`radius:'pill'` on `type:'s'`) and the native `type:'chart'` bar renderer (`renderBarChart` in `standard-deck.js`, canvas `fillRect`, intentionally square). Note as of the 7/30/26 template: the PPTX source itself doesn't yet show this rounding on every slide it should (e.g. slide 89's bars are plain `Rectangle`, no rounding at all) — that's a known gap for the template's owner to fix upstream, not something to chase per-slide in this engine. The rule above is the target state regardless of which individual source slides currently reflect it.

### 14.3 Pre-flight

- [ ] Every layout name matches a template name in §6–§13 **exactly**, including `Moodboard ` (trailing space), `Title & Bullets`, `1_Content -headline photo copy`
- [ ] All point sizes engine-space (cover 54.5, divider 54.5, statement 140, content 35, report 24, body 10)
- [ ] Logo colourway matches background on every cover, divider and closing slide
- [ ] Both white marks sourced (`mmw_logo_mark_WHITE`, `wpp_mazda_lockup_WHITE`) — **not currently in the asset bundle**
- [ ] Photo wells emitted as picture placeholders
- [ ] No #CB297B text anywhere in the output
- [ ] Titles copy-fitted against §14.1 before layout selection
- [ ] Social copy within the stated character limits (post 500, headline 100)
- [ ] Fixed-count grids not exceeded

---

## 15. Open items for the brand owner

These are unresolved contradictions **in the source material**. Each needs a decision from whoever owns the MMW brand system; none should be silently resolved by the agent.

**1. Three accent values are in circulation.**

| Value | Where | Uses |
|---|---|---|
| **#C4A584** | Template — divider and headline tags | 19 |
| **#BFA588** | Template — report chassis eyebrow, Thank You Dark title | 22 |
| **#C4A484** | `brand.json` as "MMW Spark, main accent" | 0 in template |

The documented brand value appears **nowhere** in the template. The two template values are close but distinct and are used in consistent, separable contexts — which suggests two intentional tints rather than drift. Confirm whether Spark is one colour or two, and which is canonical.

**2. Divider mood backgrounds drift from the `brand.json` ramps.**

| Family | Divider background | `brand.json` ramp[0] | Δ |
|---|---|---|---|
| Canopy | #253724 | #203822 | 5, 15, 2 |
| Aurora | #2C283B | #2D273D | 1, 1, 2 |
| Tides | #142A45 | #0B2A47 | 9, 0, 2 |
| Asphalt | #262626 | #262626 | exact |

Asphalt matching exactly while the three colour families all drift suggests the ramps were sampled from a different artefact than the dividers. Reconcile to one source.

**3. The white logo and lockup are missing from the asset bundle.** §4.1. Every dark cover and divider needs them. Also confirm the white mark's resolution — 530×145 against the black mark's 13968×3818.

**4. `Mazda Type Medium` is specified in `brand.json` but never used** in the template. Confirm whether it is live in the system.

**5. The theme colour scheme is Keynote's default, not MMW's.** `theme1.xml` carries `#00A2FF`, `#16E7CF`, `#61D836`, `#FFD932`, `#FF644E`, `#FF42A1` as accent1–6, and maps `dk1` to #FFFFFF. No MMW colour appears in the theme. Every real brand colour is hard-coded at layout or shape level. **Consequence:** theme-colour references are meaningless in this file, and any tooling that resolves `schemeClr` will produce wrong colours. Treat only literal `srgbClr` values as real. Worth fixing at source if the template is ever rebuilt natively in PowerPoint.

**6. `Cover Photo`'s title and subtitle overlap by 0.03 in.** Safe at a one-line title, collides at two. §6.

**7. `Table of contents` ships 10 entries in a 9-entry box.** §9.

**8. Duplicate content in the demo deck.** `Cover Photo`'s two instances (slides 8, 9) use the byte-identical scenic photograph, and `Location Overview` carries two photo wells at the same rectangle. Both look like redundant duplicates rather than design intent.

---

## Appendix A — Template layout index

All 66 layouts, with the slides that instantiate them.

| # | Template layout | Family | Slides | Count |
|---|---|---|---|---|
| 1 | `Cover Light` | Covers §6 | 6 | 1 |
| 2 | `Cover Dark` | Covers §6 | 7 | 1 |
| 3 | `Cover Light2` | Covers §6 | 1 | 1 |
| 4 | `Cover Photo` | Covers §6 | 8, 9 | 2 |
| 5 | `Cover Photo2` | Covers §6 | 10, 11 | 2 |
| 6 | `Divider Dark` | Dividers §7 | 5, 12, 21, 54, 71, 102 | 6 |
| 7 | `Divider Dark2` | Dividers §7 | 15 | 1 |
| 8 | `Divider Light` | Dividers §7 | 14 | 1 |
| 9 | `Divider Light2` | Dividers §7 | 13 | 1 |
| 10 | `Divider Asphalt` | Dividers §7 | 16 | 1 |
| 11 | `Divider Canopy` | Dividers §7 | 17, 103 | 2 |
| 12 | `Divider Aurora` | Dividers §7 | 18, 109 | 2 |
| 13 | `Divider Tides` | Dividers §7 | 19, 20, 107, 113 | 4 |
| 14 | `Content - Headline light` | Statement §8 | 32 | 1 |
| 15 | `Content -headline dark` | Statement §8 | 33 | 1 |
| 16 | `Headline Photo Divider` | Statement §8 | 41 | 1 |
| 17 | `1_Content -headline photo copy` | Statement §8 | 31, 34 | 2 |
| 18 | `Table of contents` | Agenda / closing §9 | 22 | 1 |
| 19 | `Thank You Light` | Agenda / closing §9 | 52 | 1 |
| 20 | `Thank You Dark` | Agenda / closing §9 | 53, 115 | 2 |
| 21 | `Content 01` | Editorial content §10 | 23 | 1 |
| 22 | `Content 02` | Editorial content §10 | 24 | 1 |
| 23 | `Content 03` | Editorial content §10 | 25 | 1 |
| 24 | `Content 05` | Editorial content §10 | 38 | 1 |
| 25 | `Content 06` | Editorial content §10 | 39 | 1 |
| 26 | `Content 07` | Editorial content §10 | 40 | 1 |
| 27 | `Content 08` | Editorial content §10 | 42 | 1 |
| 28 | `Content 09` | Editorial content §10 | 43 | 1 |
| 29 | `Content - 3 columns - Dark` | Editorial content §10 | 29 | 1 |
| 30 | `Content - 3 columns - Light` | Editorial content §10 | 30 | 1 |
| 31 | `Content 2 Rows - Dark` | Editorial content §10 | 4, 26 | 2 |
| 32 | `Content 2 Rows - Light` | Editorial content §10 | 2, 3, 28, 104, 105, 106 | 6 |
| 33 | `Content - 2 rows - Light` | Editorial content §10 | 27 | 1 |
| 34 | `Content Gray` | Reporting / blank §11 | 72, 73, 76, 78, 83, 84, 85, 86, 88, 97, 98, 101, 108 | 13 |
| 35 | `Content Dark` | Reporting / blank §11 | 77, 79, 80, 81, 82, 87, 93, 94 | 8 |
| 36 | `Blank Dark` | Reporting / blank §11 | 74, 75, 89, 90, 95, 110, 114 | 7 |
| 37 | `Blank Grey` | Reporting / blank §11 | 92, 96, 111 | 3 |
| 38 | `Blank Light` | Reporting / blank §11 | 99, 100, 112 | 3 |
| 39 | `Title & Bullets` | Reporting / blank §11 | 91 | 1 |
| 40 | `Storyboard 01` | Production planning §12 | 35 | 1 |
| 41 | `Storyboard 02` | Production planning §12 | 36 | 1 |
| 42 | `Scripts 01` | Production planning §12 | 37 | 1 |
| 43 | `Video Reference` | Production planning §12 | 44 | 1 |
| 44 | `Casting` | Production planning §12 | 45 | 1 |
| 45 | `Casting_Talent` | Production planning §12 | 46 | 1 |
| 46 | `Location Overview` | Production planning §12 | 47 | 1 |
| 47 | `Location Detail` | Production planning §12 | 48 | 1 |
| 48 | `Moodboard Props` | Production planning §12 | 49 | 1 |
| 49 | `Moodboard Wardrobe` | Production planning §12 | 50 | 1 |
| 50 | `Moodboard ·(trailing space)` | Production planning §12 | 51 | 1 |
| 51 | `Meta_Divider` | Social / paid media §13 | 55 | 1 |
| 52 | `Meta_Carousel 1x1` | Social / paid media §13 | 57 | 1 |
| 53 | `Meta_Carousel 4x5` | Social / paid media §13 | 58 | 1 |
| 54 | `Meta_Video&Static` | Social / paid media §13 | 56 | 1 |
| 55 | `Reddit_Divider` | Social / paid media §13 | 65 | 1 |
| 56 | `Reddit_Carousel` | Social / paid media §13 | 68 | 1 |
| 57 | `Reddit_Vid&Static1:1` | Social / paid media §13 | 67 | 1 |
| 58 | `Reddit_Vid&Static4:5` | Social / paid media §13 | 66 | 1 |
| 59 | `TikTok_Divider` | Social / paid media §13 | 62 | 1 |
| 60 | `TikTok_Carousel` | Social / paid media §13 | 64 | 1 |
| 61 | `TikTok_Vid&Static` | Social / paid media §13 | 63 | 1 |
| 62 | `Pinterest_Divider` | Social / paid media §13 | 59 | 1 |
| 63 | `Pinterest 2:3` | Social / paid media §13 | 60 | 1 |
| 64 | `Pinterest 1:1` | Social / paid media §13 | 61 | 1 |
| 65 | `Youtube_Divider` | Social / paid media §13 | 69 | 1 |
| 66 | `Youtube_VideoAd` | Social / paid media §13 | 70 | 1 |

**66 layouts · 115 slides.**
