# MMW agent routing test

Run each batch in a **new chat** with the agent (current prompt). Paste the block exactly. Save each reply, then paste both replies into one text file and score it:

```
node tools/score_routing.js <replies.txt>
```

78 briefs across 8 teams. Re-run after any change to the prompt's layout guidance; compare scores to the baseline.

## Batch 1 (R01 to R39)

```
ROUTING TEST -- do not build anything, do not outline, do not ask questions.
For each numbered brief, choose the ONE layout you would use for that slide and reply with one line per brief, nothing else:
ID | layoutName | reason (max 12 words)
Use exact layout names from your layout inventory. If no layout fits well, give the layout you would actually use and start the reason with NO-FIT.

R01 [Client Engagement] Cover for our Q3 business review with Mazda. Title 'Q3 Business Review', October 2026.
R02 [Creative] Open the CX-50 Hybrid concepts deck with a big hero image of the car. Title: 'Go Further, Lighter'.
R03 [Strategy] Section break before the audience section, which is all about the drivers we're targeting.
R04 [Media] Section divider before the measurement and reporting section.
R05 [Creative] One slide that just says 'Built for the long way home.' Big, nothing else.
R06 [Strategy] Our core idea, 'Make choosing Mazda easier', with one supporting line underneath explaining it.
R07 [Delivery] Agenda for the kickoff: intros, objectives, scope, timeline, team, next steps.
R08 [Client Engagement] Closing slide. Thank you, with our team contact.
R09 [Creative] Concept 1: the idea in one paragraph next to a single strong hero shot of the CX-90.
R10 [Creative] Show the CX-90 exterior and interior side by side with a short headline across the top.
R11 [Creative] Key visual for the campaign plus four supporting detail crops underneath it.
R12 [Creative] Key visual with a strip of four detail crops above it.
R13 [Creative] Two images stacked, a wide exterior and a close-up detail, with the design rationale on the left.
R14 [Creative] Look-and-feel board: four images of mixed sizes, one tall portrait in the middle.
R15 [Creative] Two big photos offset diagonally with a title and a short line of copy. Editorial feel.
R16 [Strategy] Three brand principles: Crafted, Human, Joyful. A short paragraph on each.
R17 [Strategy] Our approach in two steps: first build awareness with always-on video, then convert with retargeting and dealer offers.
R18 [Consulting] A 420-word rationale for restructuring the agency operating model. Keep all the copy.
R19 [Delivery] Where are we on the CX-5 campaign? Explore, share ideas, refine, exec plan, approval, production. We're at 'share ideas'.
R20 [Strategy] Our 2024 to 2027 roadmap in four phases, what happens in each year, and where we are now.
R21 [Delivery] Workback plan for the launch: Define, Develop, Deliver, Measure, each with deliverables, review dates and client reviewers. We're in Develop.
R22 [Delivery] Our end-to-end process from intake through measurement, with the sign-off gates between stages.
R23 [Development] Phase gates for the website rebuild: six stages, each with exit criteria and who approves.
R24 [Consulting] A six-step framework for how we onboard a new dealer group.
R25 [Development] Release process for the configurator: plan, build, QA, UAT, launch, monitor.
R26 [Delivery] Project timeline: five stages from kickoff to launch, with dates.
R27 [Strategy] Mazda's four brand eras, from Zoom-Zoom to today, one short paragraph each.
R28 [Strategy] Customer journey across awareness, consideration, shopping and purchase: what the customer thinks, does and feels at each stage.
R29 [Delivery] Production schedule for the shoot: prep, shoot days, post, delivery, with a 'we are here' marker on shoot days.
R30 [Media] Media realities for the 161 region: five columns, each with the strategic need, the priority and the implication.
R31 [Strategy] Role of each nameplate (CX-5, CX-50, CX-90/CX-70, CX-30, MX-5) across Build Demand and Capture Demand.
R32 [Media] Our media strategy on a page: jobs to be done, objectives (salience, relevance, impact), targets, Q2 pivots and the outcomes we expect.
R33 [Strategy] Marketing ecosystem: the MABM platform at the centre with the eight campaigns that ladder up to it.
R34 [Media] Campaign ecosystem for the CX-50 Hybrid launch: the campaign and its eight channels, with the tactics in each.
R35 [Media] Measurement framework: journey stage, outcome KPI, channels, weekly KPIs and data sources, monthly KPIs.
R36 [Media] Channel plan: the role of each channel by funnel stage, base plan vs incremental budget, with subtotals and a grand total.
R37 [Strategy] Four key insights from the research, each with a short headline and one sentence.
R38 [Client Engagement] Three customer quotes from the dealer interviews.
R39 [Strategy] How our approach changes: last year's plan vs this year's, and what the new one unlocks.
```

## Batch 2 (R40 to R78)

```
ROUTING TEST -- do not build anything, do not outline, do not ask questions.
For each numbered brief, choose the ONE layout you would use for that slide and reply with one line per brief, nothing else:
ID | layoutName | reason (max 12 words)
Use exact layout names from your layout inventory. If no layout fits well, give the layout you would actually use and start the reason with NO-FIT.

R40 [Strategy] Strategy slide: the core strategy, the insight behind it, two proof points (IIHS Top Safety Pick+, Consumer Reports), three activation pillars and next steps.
R41 [Client Engagement] Compare two agency options, A vs B, across four criteria with a few bullets each.
R42 [Delivery] RACI for the project: six workstreams by agency lead, client lead, approver and informed.
R43 [Consulting] Capability maturity: six capabilities scored across four maturity levels.
R44 [Media] Flighting calendar: each channel's on/off weeks across Q1.
R45 [Media] Monthly reach by channel for Q1 to Q4 as a column chart.
R46 [Media] Share of spend by channel: CTV 40%, Social 25%, Search 20%, Display 15%.
R47 [Media] Q2 spend allocation as horizontal bars, six channels with dollar amounts.
R48 [Strategy] Brand consideration trend over 12 months, Mazda vs segment average.
R49 [Media] KPI scorecard: five headline numbers (reach, CTR, VCR, leads, CPL) with this quarter vs last.
R50 [Development] Architecture diagram of the data pipeline: sources, CDP, activation channels.
R51 [Client Engagement] Team slide: eight people with names and roles.
R52 [Consulting] Show our offices in the UK, Germany and Japan.
R53 [Production] Shot list for the :30 spot, six shots with captions.
R54 [Production] VO script for the :30 with three key frames.
R55 [Creative] Compare the two VO script options side by side.
R56 [Production] Casting picks: four talent options for the dad role.
R57 [Production] Final two talent, headshot and full-body for each, heights listed.
R58 [Production] Location scout: five options for the coastal drive.
R59 [Production] Deep dive on the Malibu location, with the sun path for the morning shoot.
R60 [Production] Props for the picnic scene, ten items.
R61 [Production] Wardrobe for the lead: four outfits plus accessories.
R62 [Creative] Tone and manner board: the mood we're going for.
R63 [Creative] Reference ads and films we like for the edit style.
R64 [Media] Spec sheet for a Meta 4:5 carousel, five cards.
R65 [Media] Facebook square carousel spec.
R66 [Media] Instagram Reels and Stories 9:16 static and video spec.
R67 [Media] TikTok in-feed 9:16 video spec.
R68 [Media] Reddit promoted post, 1:1 image and video spec.
R69 [Media] Pinterest standard 2:3 pin spec.
R70 [Media] YouTube 16:9 in-stream ad spec.
R71 [Media] Divider introducing the TikTok section of the paid social plan.
R72 [Media] Launch markets: highlight California, Texas and Florida and mark LA, Dallas and Miami.
R73 [Client Engagement] We're a global network: show worldwide reach, no specific countries.
R74 [Development] Sprint plan for the next three sprints: goal, scope and owner for each.
R75 [Development] Our martech stack: CMS, CDP, analytics, ad server, and how they connect.
R76 [Development] Weekly status: on track, at risk or blocked for five workstreams, with a note on each.
R77 [Consulting] Current state vs future state of the marketing operating model.
R78 [Consulting] Three recommendations, each with the rationale and the expected impact.
```
