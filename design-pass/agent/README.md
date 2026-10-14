# MMW Design Pass agent

An agent for the MMW design team. It evaluates a deck (Builder output, the MMW
template, or pieced together from several templates), proposes a plan slide
by slide, asks how to proceed — **targeted updates** or a **full conversion** —
applies the approved plan, and reports exactly what changed.

| File | What |
|---|---|
| `mmw_design_pass_prompt.txt` | The agent's prompt. **Generated — paste it into WPP Open as the agent's instructions; do not edit.** |
| `../workspace/workspace.js` | The workspace page the agent emits (report, extract, apply plan, post-update report) |
| `../workspace/dist/design-pass.js` | What the artifact loads: checker + report UI + extract + merge + workspace, bundled |

## How it works (V1.1, chat-first)

1. The designer **uploads the deck to the chat**. The agent reads it and replies
   with a review: verdict, findings by group (layout fit, density/splits, copy
   fit, charts & data, structure, tone), a plan table, and the question:
   targeted updates, full conversion, change the plan, or stop.
2. **Full conversion:** the agent builds the whole deck as a Builder artifact
   (the Builder's own template and pins). The designer previews and downloads
   it; the agent writes the post-update report in chat. Photos are not
   reused (the agent cannot pass the deck's images to the artifact) -- it
   lists which slides had photos.
3. **Targeted updates:** the agent emits the workspace with its **PLAN**; the
   designer drops the same file in **once** (the only way to edit their own
   file). The workspace measures fonts/colours/backgrounds/logos/overflow
   (what the agent cannot see in an attachment), checks the file matches the
   plan (slide count + a quote per planned slide), pre-flights every rebuilt
   slide, rebuilds with the Builder engine reusing the deck's photos
   (`orig:slide4`), applies mechanical fixes to every other slide, merges in
   the original order (`../checker/merge.js`), downloads
   `<deck>_designpass.pptx` and shows **What changed** (before -> after per
   slide, wording check).

Nothing leaves the designer's browser. The original file is never changed.
(The workspace's evaluate-and-extract mode from V1.0 still works but the
agent no longer uses it.)

## Knowledge

Sections 2 and 6–15 of the prompt are copied verbatim from
`mmw_presentation_builder_prompt.txt` each time the prompt is generated —
the same layouts, copy budgets, palette, type, chart and image rules as the
Builder. The workspace loads the Builder's engine at the Builder's pin.

## Updating

```
node tools/build_workspace.js                 # after changing check/ui/extract/merge/workspace
git commit ...                                # the prompt pins a commit that has the bundle
node tools/build_design_pass_prompt.js        # pins HEAD; re-copies the Builder sections
git commit ... && git push
node tools/warm_cdn.js <pinned sha>           # wait until jsDelivr serves the new pin
```

Then paste the new prompt into the agent in Open. Re-generate after the
Builder prompt changes too (new pin, layouts or budgets), so both agents stay
on the same knowledge.

## Tested (2026-10-14)

- Targeted, Motorsports kickoff (Builder output): slide 8 rebuilt and split
  in place, slide 15 removed, slide 18 fixed, theme fonts fixed; 87 → 100.
- Full conversion, Be Moved (older engine): two slides rebuilt, one removed,
  twelve carried over on their original design; wording check flagged the
  subtitle the plan dropped.
- Both through the live CDN exactly as the prompt's DP-5 describes; output
  renders in LibreOffice. **Not yet opened in PowerPoint.**
