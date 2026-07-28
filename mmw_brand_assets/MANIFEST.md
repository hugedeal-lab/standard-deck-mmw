# MMW Brand Assets — Extraction Manifest

Extracted directly from `MMW_PPT_Template_7_24_26.pptx`'s embedded media,
via slide layout / slide master background fills and real picture shapes.
Every entry below is a confirmed real asset or exact color, not a guess.

## Logo assets (real picture shapes on slide 1's layout)

| File | Native size | Confirmed position (normalized) | Used by |
|---|---|---|---|
| `mmw_logo_mark.png` | 13968×3818 | x:0.41 y:0.37 w:1.12 h:0.31 | gi0 across all cover/divider/production layouts |
| `wpp_mazda_lockup.png` | 308×58 | x:0.42 y:7.06 w:1.03 h:0.19 | gi1 in coverLight, coverGeometric, coverLogoCutout, thankYou |

## Background images (picture fills, deduped by hash)

| File | Native size | Used by (confirmed via md5 match) |
|---|---|---|
| `backgrounds/pattern_light.png` | 8000×4500 | `coverLight` AND `coverGeometric` (bgVariant:'light') — same asset |
| `backgrounds/pattern_dark.png` | 8000×4500 | `coverGeometric` (bgVariant:'dark') AND `dividerBrand` (bgVariant:'dark') — same asset |
| `backgrounds/pattern_light2.png` | 1920×1080 | `dividerBrand` (bgVariant:'light2') |
| `backgrounds/pattern_dark2.png` | 1920×1080 | `dividerBrand` (bgVariant:'dark2') |
| `backgrounds/scenic_photo.png` | 3840×2160 | `coverScenic` — both real instances (slides 8, 9) use this identical photo, see note below |
| `backgrounds/headline_photo.png` | 3840×2160 | `headline` (bgVariant:'photo') |

**Not extractable — no real asset exists in source:**
- `coverLogoCutout`'s cutout graphic — layout shapes are empty `PLACEHOLDER` type, solid fill, no embedded picture. Confirms our existing design decision (bgImage required, no fallback) was correct — there was never a real asset to extract.

## Solid-fill backgrounds (exact hex, no image needed)

| Variant | Hex | Source level | vs. brand.json |
|---|---|---|---|
| `dividerBrand` bgVariant:'light' | `#F5F5F5` | layout | not in brand.json (new value) |
| `dividerBrand` bgVariant:'asphalt' | `#262626` | slide master | **exact match** to MMW Asphalt |
| `dividerBrand` bgVariant:'canopy' | `#253724` | layout | close but not exact vs. Canopy ramp[0] `#203822` |
| `dividerBrand` bgVariant:'aurora' | `#2C283B` | layout | close but not exact vs. Aurora ramp[0] `#2D273D` |
| `dividerBrand` bgVariant:'tides' | `#142A45` | layout | close but not exact vs. Tide ramp[0] `#0B2A47` |
| `headline` bgVariant:'light' | `#D5D5D5` | layout | not in brand.json (new value) |
| `headline` bgVariant:'dark' | `#262626` | slide master | **exact match** to MMW Asphalt |

## Findings worth flagging to the creator (new, in addition to existing list)

1. **`coverScenic`'s two real instances (slides 8, 9) use the byte-identical photo.** Not two different scenic options as originally assumed — likely a redundant duplicate slide, same category as the "copy" duplicates already flagged.
2. **Canopy/Aurora/Tides divider background colors drift slightly from the documented brand.json ramp values** (small deltas, a few RGB units each). Asphalt has zero drift — exact match both places. Worth asking whether the divider backgrounds are an intentionally distinct "mood" palette or whether brand.json's ramp extraction and these production usages should reconcile to one source of truth.
