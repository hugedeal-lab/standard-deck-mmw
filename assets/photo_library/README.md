# Photo Library Reference — Recommendation

## What this is

`assets/photo_library/manifest.json` catalogs the 70 images in
`Deck_Photography_Library.zip` — real CX-5 / CX-50 / CX-90 product and
lifestyle photography, distinct from `assets/photos/` (the deck engine's own
small set of generic cover/statement stock images).

Each entry: `{file, model, subjects, variant, px, kb}`. Tags are parsed from
the original filenames (which carry real signal — `MY26_CX-50_Front Badging
Detail 1.png`, `MY23_CX90_Access_016_Splash-Guard_def2.png` — just
inconsistently formatted), not from looking at pixel content. 66 of 70 filed
cleanly; **4 need a human pass**: `image 1.png`, `image 2.png`, and
`Property 1=Rhodium-White.png` (looks like a paint swatch, not a vehicle
shot) have no usable filename signal, and one 2019 CX-5 exterior shot didn't
match a subject keyword.

## Recommendation: reference only, not wired into layouts

Don't have layouts pull from this automatically, and don't route content
generation through it. Two reasons:

1. **It's incomplete as a decision surface.** 70 images across 3 models with
   inconsistent framing/cropping isn't enough to safely auto-fill "the CX-90
   photo well" without a human checking it's the right shot for the slide's
   actual point — wrong badge year, wrong market spec, or a lifestyle shot
   where the slide wants a studio shot would ship wrong quietly.
2. **It doesn't need to be.** Every layout with a photo well already renders
   a real, visible "right-click → change picture" placeholder. That's
   already the correct point for a human to make the call — adding a second,
   automatic decision path (agent guesses from 70 loosely-tagged files)
   competes with it rather than helping.

Instead: make it **searchable reference**, surfaced only on request. When
someone asks *"do we have a CX-90 badging shot"* or *"anything for the
cargo-space slide"*, grep the manifest by model/subject and suggest 2-3
filenames — the person still picks and places the actual image. This keeps
the agent workflow exactly as complex as it is today; it only adds a lookup
you can choose to use.

## If you want it more active later

Two ways to level this up without forcing it into every slide, if it proves
useful:
- A **per-layout `suggestedSubjects` hint** (e.g. `reportModelCompare` notes
  it usually wants a "front 3/4" or "detail shot") that only fires when
  someone explicitly asks "suggest a photo for this slide" — still human-
  gated, just saves a manual grep.
- **Human review of the 4 uncategorized files and the 3 "unknown model"
  files**, and spot-checking a sample of the auto-tagged ones against actual
  content, since tags are filename-derived and unverified.

Neither is needed to ship what's here now.
