# rules/ — the MMW brand rulebook, generated

One machine-readable copy of the brand rules, generated from the files the
Presentation Builder already uses, so Design Pass and the builder can never
drift apart. Agent prompt sections should be generated from here too (the
builder's copy-budget block already works this way).

| File | Edited by | What |
|---|---|---|
| `policy.json` | **hand** | What each check does (`fix` / `flag` / `never`) and its tolerances. The only file to tune during calibration (`design-pass/PILOT.md`). |
| `template_snapshot.json` | generated (`--template`) | What the template's own slides actually use: theme fonts and colours, backgrounds and placeholder positions per layout, word counts, every colour. Built by running the Design Pass checker over the template. |
| `mmw_rules.json` | generated | Everything the checker reads. **Do not edit.** |

## Regenerate

```
node tools/build_rules.js                      # after editing policy.json or any source
node design-pass/checker/build_page.js         # then rebuild the checker page
```

When the template itself changes (a new MMW PPT Template revision):

```
npm install --prefix ~/dp-deps @xmldom/xmldom@0.8.10 jszip@3.10.1
NODE_PATH=~/dp-deps/node_modules node tools/build_rules.js --template "/path/MMW PPT Template_x.xx.xx.pptx"
```

`mmw_rules.json.sources` records the git blob hash of every source it was
built from, so a report says exactly which rules it used.

## mmw_rules.json (schema `mmw-rules/1`)

**Units.** Geometry is engine inches (13.33 × 7.5) and type is engine pt,
the same as `mmw_layouts.json`. A deck made from the template is 26.667 × 15 in,
so multiply by deck width / 13.33 (2.0005 for a template deck, 1 for a builder
deck) before comparing.

| Key | From | Contents |
|---|---|---|
| `policy` | `policy.json` | Copied in as-is |
| `theme` | snapshot | Template theme: `fonts.major` / `fonts.minor`, colour scheme slots |
| `fonts` | policy + theme | `allowed`, `symbol` (always left alone), `by_role` (display → Mazda Type Bold, body → Arial), `theme_refs` (`+mj-lt` / `+mn-lt`) |
| `type_scale` | `mmw_layouts.json` | Per face, every size the template uses, with use counts |
| `palette.tokens` | `standard-deck.js` PALETTE + ACCENT_FAMILIES, `mmw_layouts.json` palette | Brand token → hex. Snap targets. Engine aliases (`black`, `white`) and UI status colours left out. |
| `palette.by_hex` | | hex → token names |
| `palette.template_observed` | layouts, chart series, snapshot | Every colour the template uses. On-brand even if no token names it; never a snap target. |
| `palette.annotation` | | `#CB297B`: template notes to the author, never content |
| `brand_marks` | `assets/logos/*.png` | sha256 → logo/lockup, black/white, which background it is for, and its swap. Byte-identical to the template's media. |
| `template_layouts` | layouts + snapshot | Per **PowerPoint layout name** (what a template deck's slide carries): the specs that sit on it, every background allowed on it, `template_words` / `template_paras` (density baseline), `ph_positions` (placeholder boxes on its demo slides) |
| `layouts` | `mmw_layouts.json`, `deck-layouts.js`, `COPY_BUDGETS.md` | Per **spec** (84): engine `slug`, `template_layout`, family, background (+ `dark`), fields, `copy_budgets` (`fits` = template look, `max` = hard limit, `null` = no practical limit), elements |
| `furniture` | `mmw_layouts.json` | Logo, lockup and draft-date positions |

**Why two layout tables.** Several specs share one PowerPoint layout (seven
report compositions sit on "Content Gray"), so a template deck's layout name
alone cannot say which spec a slide is. Checks that need one answer (the
background fix, the title budget) only act when the layout allows exactly one;
otherwise they flag.

## Known gaps

- Copy budgets are parsed from `COPY_BUDGETS.md`. Cleaner: have
  `tools/copy_budgets.js` also write JSON (a change on `main`).
- Image backgrounds are not identified (the template's background images are
  re-encoded in `assets/`, so they do not hash-match): a picture background on
  a layout that allows one passes without checking which picture.
- Builder-made slides carry no template layout name (`SD_LIGHT_NOFOOTER` /
  `SD_DARK_NOFOOTER`); identifying their spec needs geometry matching against
  `layouts[].elements`. Not yet built.
