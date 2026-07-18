# Arlindo — Product Knowledge Base

An **AI-queryable, version-controlled** record of what we know about the insurance products
Arlindo presents — starting with National Life Group / LSW **FlexLife IUL**. A future AI (or
human) can read these files to answer product questions and cite primary sources, and to keep
the app's shipped data factually accurate.

## Files

- **`national-life-flexlife.md`** — the curated knowledge: product lineup, FlexLife facts,
  the full rider suite (with exact lifetime caps, triggers, no-cost vs paid), LIBR, index
  mechanics / AG 49-B / floor, and the foreign-national (Brazil) compliance rules. Each fact
  carries a **confidence level**, an **audit verdict** (CONFIRMED / PARTIAL / UNVERIFIABLE),
  and **source URLs**. §8 lists concrete corrections to apply to the shipped code.
- **`flexlife-audit-2026-07-18.json`** — the **raw** output of the adversarial accuracy audit:
  all 12 per-claim verdicts (app-says → sources-say → evidence → recommendation → sourceUrls)
  plus the synthesis report, verbatim. Nothing summarized away.

## How this maps to the code

The facts here are the source of truth behind:
- `src/domain/model/products.ts` — the NLG product registry.
- `src/domain/model/riders.ts` — the rider suite + disclaimers.
- `src/domain/calc/IulProjectionEngine.ts` — the approximate in-app estimate.

When a fact here changes (rate sheets, new riders, guideline updates), update the code **and**
this knowledge base together.

## Method (how the audit was produced)

An ultracode workflow ran 25 agents: for each shipped claim, one agent gathered evidence from
NLG/LSW primary sources and a second, independent agent was prompted to **refute** it; a
synthesis pass then ranked confirmed vs. wrong vs. unverifiable and wrote the correction list.

## Important caveat

Current caps, participation rates, bonus/Enhancer rates, and the maximum illustrated rate are
**rate-sheet-driven and change often** — they are deliberately NOT hard-coded. Only guaranteed
minimums and structural facts are stable. **The official carrier illustration is always the
authoritative document.** Re-verify against the live NLG Illustration System before any
client-facing use.
