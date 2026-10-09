# Design Pass — handoff brief

Written 2026-10-09 at the end of the Presentation Builder build-out, to start
the partner agent in a fresh session. Read this first; it is the agreed
starting point, not a spec to re-litigate.

## 1. Goal

Free the MMW design team from mechanical fixes so they spend their time on
the slides that need judgment.

**Success metric: designer minutes saved per deck** — not issues caught.
Concretely, per deck: fixes applied automatically, flags raised, flags a
designer agreed with. Tune toward more safe auto-fixes and fewer noise flags.

What the design team said (2026-10):
- They want people to start from the approved template, but that won't
  always happen.
- Recreating charts and graphs from images is a big time sink; the builder
  agent already does this well.
- Decks they receive are usually not in rough shape. Splitting a slide into
  several is uncommon but happens.
- Too dense or too complex: recommend, and queue for the design team.
- They want visibility of deck status (work in progress / ready for review).

## 2. What Design Pass returns

For each deck:
1. **A corrected copy** (the original is never modified) with the common,
   fixable items handled.
2. **A change log**, per slide, skimmable in seconds:
   "Slide 7: Calibri → Arial; #333333 → asphalt; background → Content Gray".
3. **A designer queue**: slides it did not fix, each with a specific
   recommendation ("too dense — split into 2: X / Y"; "custom diagram — needs
   a designer"; "chart values read from an image — verify numbers").

## 3. Decision: where it runs — PROVEN

**A browser tool hosted in WPP Open (embedded code), like the builder.**
`design-pass/probes/pptx_probe.html` (v4) proved, inside Open's frame:
drag-and-drop and the file picker deliver the file; JSZip opens a 111 MB,
13-slide team deck; edits apply (361 font references → Arial); the corrected
copy downloads and opens cleanly in PowerPoint. Nothing leaves the browser.
cdnjs loaded fine inside the embed, so the page can also load the builder's
engine and shared rules from the pinned jsDelivr CDN.

- Open's **code-upload** option (zip + entry `index.html`) also exists;
  `design-pass/probes/design_pass_probe_bundle.zip` is a self-contained
  version. Use it if a page outgrows a single embedded file.
- **GPT / Gemini code interpreters** (Open agent tools) are a fallback for
  edits the browser can't handle; not needed for the core.
- **Unresolved:** how the Open *agent* (judgment: layout fit, density,
  splitting, brand voice) connects to the *page* (measurable checks and
  fixes). Options: the page produces a structured report the user pastes to
  the agent; the agent links to the page; the page calls a model itself (if
  Open allows). Decide early.

## 4. Fix vs flag (to confirm with the design team)

| Category | Action |
|---|---|
| Fonts → Mazda Type Bold / Mazda Type / Arial by role; sizes on the type scale | **Auto-fix** |
| Off-palette colours → nearest palette token (only when unambiguous) | **Auto-fix** |
| Slide backgrounds → the layout's template background | **Auto-fix** |
| Logo / lockup variant for light vs dark backgrounds | **Auto-fix** |
| Caps/casing where the template sets caps | **Auto-fix** |
| Leftover placeholders, "Lorem ipsum", #CB297B template annotations | **Auto-fix** (remove) |
| Snapping text boxes to template positions | **Auto-fix**, conservative tolerance |
| Text past copy-fit limits | Flag + recommendation |
| Content that wants splitting | Flag; propose the split, don't do it unless asked |
| Ambiguous layout match; custom diagrams; photography choices | Flag |
| Chart recreated from an image | Rebuild as a native chart; always flag "verify numbers" unless source data is supplied |
| Wording and data | **Never change.** May flag tone; never rewrite silently |

Principle: **if unsure, flag instead of fix.** One bad auto-fix costs more
trust than ten missed nits. Every flag carries a specific recommendation.

## 5. Per-slide approach

| Slide situation | Approach |
|---|---|
| On the MMW template, mechanical problems | Fix in place in their .pptx (small diffs, easy to trust) |
| Built on another template (VML, old Mazda, blank) | Rebuild through the builder engine: extract content, choose an MMW layout, regenerate |
| Chart as an image | Recreate as a native chart via the builder's chart layouts |
| Too dense / too complex | Don't fix — recommend and queue |

Fix-in-place is the new capability (the builder only generates). It is XML
work on the same lines as `tools/1_extract_template.py`.

## 6. Pilot order

1. **Report only** on 3–5 decks the design team already reviewed by hand.
   Compare its flags to theirs; calibrate rules and tolerances.
2. Turn on auto-fix for the safest categories: fonts, colours, backgrounds.
3. Add chart recreation (engine is ready — see §8) and per-slide rebuild of
   off-template slides.
4. Status workflow (below) and automatic runs.

Deck status: start with a zero-tooling convention — OneDrive folders per
stage (WIP → Ready for review → Reviewed). A tracker page and automatic runs
on "Ready for review" come later if the convention sticks.

## 7. What to reuse from this repo

| Asset | What it gives Design Pass | Notes |
|---|---|---|
| `mmw_layouts.json` | Every template layout's element positions, fonts, sizes, colours, backgrounds — the rulebook | Extracted from the 7.24 template (84 layouts, 115 slides) with 7.30 revisions folded in; **template-scale**: the template canvas is 26.667 × 15 in, exactly 2× the engine's 13.33 × 7.5 |
| `deck-layouts.js` | `LAYOUT_BG` (backgrounds per layout), `LAYOUT_KEYS` (fields), `TEMPLATE_NAMES` (template name → slug), the 90 layout functions | Exported on `window.DeckLayouts`; loadable from the pinned CDN |
| `standard-deck.js` | `PALETTE` (token → hex), type faces | |
| `COPY_BUDGETS.md` / `tools/copy_budgets.js` | Measured copy-fit limits per field (N = template look, M = hard limit) | Generated; the builder prompt's §6.7 comes from it |
| `mmw_presentation_builder_prompt.txt` §6.1–6.2, §7, §10 | Layout inventory, routing by the question a slide answers, palette, type scale, chart limits | The routing logic is what "wrong layout for this content" judgments need |
| `tools/1_extract_template.py` | Reads raw .pptx XML: layout names, positions, fonts, run sizes, colours, casing, fills | Point it at a team deck to get comparable data; confirm how much reuses directly |
| `design-pass/probes/` | Working in-browser read/edit/download pattern (v4) | Start the page from this |
| `design-pass/tools/pdf_pages_to_png.swift` | Slide thumbnails via LibreOffice → PDF → PNG (macOS) | For calibration reports |
| `tests/routing/` | Pattern for a regression suite (briefs + expected answers + scorer) | Reuse for "did it flag what designers flagged" |

**Single source of truth.** Brand rules must not be copied into two
prompts. Put shared rules (palette, type scale, layout geometry, copy
budgets) in `rules/` generated from the files above, and generate both
agents' rule sections from it — the builder already generates its copy
budget section this way.

## 8. Facts learned the hard way

- **The chart engine gap is closed.** Column charts (template slides 93/94),
  doughnut with caption, bar/line/area/pie, brand colours and `highlight`
  all exist and are verified. Chart recreation can start whenever.
- **Builder-made decks don't carry template layout names** — every slide
  sits on `SD_LIGHT_NOFOOTER` / `SD_DARK_NOFOOTER`. Identifying the MMW
  layout of such a slide (or of a deck started from builder output, or
  imported from Google Slides / Keynote) needs geometry matching.
- **Fonts: count and fix the `<a:latin>` slot only.** PowerPoint also keeps
  East Asian (`<a:ea>`) and complex-script (`<a:cs>`) font slots; the probe
  counted 194 "Helvetica Neue" but only 2 were visible-text fonts. Theme
  fonts live in `ppt/theme/*.xml` (`<a:majorFont>` / `<a:minorFont>`) and
  slides reference them as `+mj-lt` / `+mn-lt`.
- **Template annotations** are #CB297B text ("PLACE YOUR OWN IMAGE",
  "click here"). They are notes to the deck author, never content.
- **Backgrounds:** white #FFFFFF and paper #EEEEEE are distinct template
  backgrounds (29 slides each in 7.30); there is no pure-black slide (dark
  neutral is asphalt #262626). A few layouts use #EFF0F3, #F2F2F2, #F5F5F5,
  #D5D5D5 — see `LAYOUT_BG`.
- **PptxGenJS quirks** (if regenerating): text margins are [l, r, b, t];
  any non-hex colour is written as #000000.
- **Browser script gotcha:** never name a global `top`, `name`, `status`,
  etc. — they collide with `window` properties (this broke probe v1–v2).
- **The Open agent has no knowledge base.** Its pasted prompt is all it
  knows; anything it needs must be in the prompt.

## 9. Guardrails

- **The Presentation Builder must not be affected.** It runs on its pasted
  prompt plus the engine at an immutable pin (`285efc8` as of this brief).
  Nothing here reaches it unless a builder prompt with a new pin is pasted.
  Any change to shared engine files must pass `tests/*.js` (14) and the
  routing test before a builder pin bump — do that in the builder session
  on `main`, not here.
- **This repo is public** (jsDelivr only serves public repos). Never commit
  client decks, reports or designer comments: use `design-pass/pilot/`
  (git-ignored) or OneDrive.
- **jsDelivr caps a GitHub package at 50 MB**; the repo is ~25 MB. Keep
  Design Pass code light; no binaries beyond small fixtures.
- Work on branch `design-pass`; merge shared pieces to `main` deliberately.

## 10. Open questions

For the design team:
1. Which issues do designers fix most often today? (Decides the first rules.)
2. Formats in: PPTX only, or Keynote / Google Slides exports too?
3. Corrected copy alongside the original (assumed), or replace it?
4. Who works the designer queue, and where should it live (doc, Slack, page)?
5. Which past decks (with their review comments) can we pilot against?
6. Tolerances: what's a hard rule vs a guideline; how much position drift
   is acceptable?

Technical:
7. How the Open agent and the page connect (§3).
8. Font mapping by role: how to tell display text (→ Mazda Type Bold) from
   body (→ Arial) on off-template slides — placeholder type, size, position.

## 11. First tasks for the new session

1. Read this brief, `design-pass/probes/pptx_probe.html`, and skim
   `tools/1_extract_template.py` and `mmw_layouts.json`.
2. Propose the `rules/` format and generate it from the existing sources.
3. Build the report-only checker page (pilot step 1) on the probe's pattern.
4. Prepare the calibration run: what a designer-reviewed deck plus comments
   should look like in `design-pass/pilot/`.
