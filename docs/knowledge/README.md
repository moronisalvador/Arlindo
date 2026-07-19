# Arlindo — Product Knowledge Base

An **AI-queryable, version-controlled** record of what we know about the insurance products
Arlindo presents — National Life Group / LSW **FlexLife IUL** and **Term** ("Guaranteed
Series"). A future AI (or human) can read these files to answer product questions and cite
primary sources, and to keep the app's shipped data factually accurate.

## Files

### IUL — FlexLife
- **`national-life-flexlife.md`** — the curated knowledge: product lineup, FlexLife facts,
  the full rider suite (with exact lifetime caps, triggers, no-cost vs paid), LIBR, index
  mechanics / AG 49-B / floor, and the foreign-national (Brazil) compliance rules. Each fact
  carries a **confidence level**, an **audit verdict** (CONFIRMED / PARTIAL / UNVERIFIABLE),
  and **source URLs**. §8 lists concrete corrections to apply to the shipped code.
- **`flexlife-audit-2026-07-18.json`** — the **raw** output of the adversarial accuracy audit:
  all 12 per-claim verdicts (app-says → sources-say → evidence → recommendation → sourceUrls)
  plus the synthesis report, verbatim. Nothing summarized away.
- **`calibration-2026-07-19.md`** — first real calibration of the in-app estimate
  (`IulProjectionEngine`) against a real FlexLife illustration (~61% → ~3.9% mean error). Locked
  by a regression guard (`src/domain/calc/calibration.probe.test.ts`).
- **`calibration-capture-list.md`** — the plan to gather ~10 illustrations and re-fit the engine
  so it generalizes across ages/faces/funding (status: PARTIAL after the single-point fit).

### Term — Guaranteed Series
- **`national-life-term.md`** — the curated Term knowledge: the Guaranteed Series lineup
  (G10/G15/G20/G30 + ART), term structure (level DB, **no cash value**), issue ages, rate
  classes, the conversion privilege, the no-cost ABR living-benefit suite (discounted /
  per-condition — **not** a flat %), ABR lifetime limits, and the **compliance-critical fact
  that term is NOT available to foreign nationals** (Brazil clients are permanent-only). Each
  fact carries confidence + verdict + source URLs. §13 lists what to build in the code.
- **`term-research-2026-07-18.json`** — the **raw** deep-research output (102-agent run):
  summary, 11 findings each with a 3-0 vote + evidence + sources, caveats, and open questions,
  verbatim. *(The separate `scripts/term-audit.wf.js` adversarial audit hit the account usage
  limit at launch and produced no verdicts; it is redundant — the deep-research pass already did
  per-claim 3-0 adversarial voting. Re-running it is an optional second layer, not a blocker.)*

## How this maps to the code

The facts here are the source of truth behind:
- `src/domain/model/products.ts` — the NLG product registry.
- `src/domain/model/riders.ts` — the rider suite + disclaimers.
- `src/domain/calc/IulProjectionEngine.ts` — the approximate in-app estimate.

When a fact here changes (rate sheets, new riders, guideline updates), update the code **and**
this knowledge base together.

## Method (how the knowledge was produced)

- **IUL audit** — an ultracode workflow ran 25 agents: for each shipped claim, one agent
  gathered evidence from NLG/LSW primary sources and a second, independent agent was prompted to
  **refute** it; a synthesis pass ranked confirmed vs. wrong vs. unverifiable and wrote the
  correction list.
- **Term deep research** — a 102-agent ultracode deep-research workflow: fan-out web search →
  primary-source fetch → **per-claim adversarial voting** (multiple independent verifiers per
  claim; only claims surviving a 3-0 vote were kept) → cited synthesis. Cross-checked against a
  real LSW Term 30-G illustration. The raw report is `term-research-2026-07-18.json`.

## Important caveat

Current caps, participation rates, bonus/Enhancer rates, and the maximum illustrated rate are
**rate-sheet-driven and change often** — they are deliberately NOT hard-coded. Only guaranteed
minimums and structural facts are stable. **The official carrier illustration is always the
authoritative document.** Re-verify against the live NLG Illustration System before any
client-facing use.
