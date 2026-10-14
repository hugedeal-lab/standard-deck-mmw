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

## How it works

1. The agent emits the **workspace** artifact. The designer drops the deck in:
   Lighthouse-style report + a **deck extract** (each slide's text by box,
   pictures, native chart data, notes, findings) to paste back to the agent.
2. The agent proposes a **plan** (keep / fix / rebuild / split / drop per
   slide) and asks: targeted, full conversion, change the plan, or report only.
3. On approval it emits the workspace with the **PLAN**. The designer drops the
   same file (checked by fingerprint). The workspace pre-flights every rebuilt
   slide, rebuilds with the Builder engine (reusing the deck's own pictures),
   applies fixes, merges in the original order (`../checker/merge.js`),
   downloads `<deck>_designpass.pptx`, re-checks it, and shows **What changed**:
   per slide before → after, the change, and a wording check.
4. The designer pastes the report back; the agent explains it.

Nothing leaves the designer's browser. The original file is never changed.

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
