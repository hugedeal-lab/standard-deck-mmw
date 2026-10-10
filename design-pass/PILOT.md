# Pilot calibration runs (pilot step 1: report only)

Goal: tune `rules/policy.json` until Design Pass flags what designers flag and
little else. The metric is **designer minutes saved per deck**, so every run
records what the designer agreed with and what was noise.

`design-pass/pilot/` is git-ignored. **Never commit anything from it** — the
repo is public. Keep the canonical copies on OneDrive.

## One folder per deck

```
design-pass/pilot/
  2026-10-cx90-q4-review/          short id: date + deck
    deck.pptx                      the deck as the designer received it (required)
    reviewed.pptx                  the designer's corrected version (if there is one)
    designer.json                  what the designer did and thought (below)
    report.json                    Design Pass output -- written by score.js
    verdicts.json                  designer's verdict on each Design Pass finding -- template written by score.js
    thumbs/                        optional slide PNGs (design-pass/tools/pdf_pages_to_png.swift)
```

## designer.json — what the designer changed or would change

Fill from the designer's review comments or a short debrief. One entry per
slide per kind of issue; use the Design Pass check names so they can be
matched (`other` for anything that does not fit).

```json
{
  "deck": "2026-10-cx90-q4-review",
  "reviewer": "AB",
  "reviewed_on": "2026-10-14",
  "minutes_total": 55,
  "findings": [
    { "slide": 3,  "check": "font_face",   "did": "fixed",   "minutes": 2, "note": "Calibri body -> Arial" },
    { "slide": 7,  "check": "colour",      "did": "fixed",   "minutes": 3, "note": "#333333 text -> asphalt" },
    { "slide": 9,  "check": "density",     "did": "split",   "minutes": 15, "note": "split into 2: results / next steps" },
    { "slide": 12, "check": "chart_image", "did": "rebuilt", "minutes": 20 },
    { "slide": 14, "check": "other",       "did": "fixed",   "minutes": 5, "note": "photo crop too tight" }
  ],
  "notes": "Free text: anything systematic about this deck."
}
```

| Field | Values |
|---|---|
| `check` | `font_face` `theme_fonts` `type_scale` `colour` `background` `logo_variant` `casing` `placeholder_text` `annotation` `position` `copy_fit` `density` `off_template` `chart_image` `other` |
| `did` | `fixed` · `split` · `rebuilt` · `flagged` (told the author) · `left` (noticed, chose to leave it) |
| `minutes` | Rough time it took. This is what Design Pass would save. |

Slide numbers refer to `deck.pptx` (before any splits).

## verdicts.json — the designer's verdict on Design Pass's findings

`score.js` writes this with every finding Design Pass raised and an empty
`verdict`. The designer fills in one word each:

| `verdict` | Meaning |
|---|---|
| `agree` | Right, and the fix/recommendation is what I would do |
| `agree-wrong-fix` | Right problem, wrong fix or recommendation (say why in `note`) |
| `noise` | Not a problem; should not have been raised |
| `harmful` | Auto-fixing this would have made the deck worse |

`harmful` on any `fix`-action check blocks turning that check's auto-fix on.

## Running it

```
npm install --prefix ~/dp-deps @xmldom/xmldom@0.8.10 jszip@3.10.1
NODE_PATH=~/dp-deps/node_modules node design-pass/checker/score.js design-pass/pilot/
```

For each deck folder it writes `report.json` (and `verdicts.json` if missing),
then prints per check:

- **DP found** — findings Design Pass raised
- **agreed / noise / harmful** — from `verdicts.json`
- **designer only** — in `designer.json` but not raised by Design Pass (misses)
- **matched** — raised by both (same slide + check)
- **minutes** — designer minutes on matched items: the saving if that check is on

If `reviewed.pptx` exists, it is checked too: findings that are gone in the
reviewed copy are counted as **designer resolved**, a cheap stand-in for
`designer.json` when no debrief is available (slide-number based, so it is
unreliable for decks where slides were split or reordered).

## What to decide from a run

- A `fix` check with any `harmful` verdict: change it to `flag` in
  `rules/policy.json`, or narrow it.
- A check with mostly `noise`: tighten its tolerance or drop it.
- A frequent **designer only** check: a rule to add.
- After 3–5 decks: which checks turn on for auto-fix (pilot step 2).
