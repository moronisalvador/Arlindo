# National Life Group — Term Life Knowledge Base

> **Purpose.** A durable, AI-queryable record of what Arlindo knows about National Life
> Group (NLG) / Life Insurance Company of the Southwest (LSW) **term life insurance** (the
> "Guaranteed Series"), so a future AI (or human) can build and maintain Arlindo's **Term**
> product accurately and cite primary sources. Every fact carries a **confidence level**, a
> **verdict**, and **source URLs**.
>
> **Provenance.** Compiled from a **deep-research pass run 2026-07-18** — an ultracode workflow
> of **102 agents**: fan-out web search → primary-source fetch → **per-claim adversarial
> voting** (each claim independently checked by multiple verifiers; only claims that survived a
> 3-0 vote were kept) → cited synthesis. The raw report is
> [`term-research-2026-07-18.json`](./term-research-2026-07-18.json) (verbatim: summary,
> 11 findings with votes, caveats, open questions). Cross-checked against a real, current
> **LSW Term 30-G** sample illustration (form series **ICC18-20522**). **Verdict legend:**
> CONFIRMED = matches current primary source (3-0 vote) · PARTIAL = core correct, a specific
> element is state/product-variable · UNVERIFIABLE = not found in primary sources.
>
> **Note on the separate audit.** A second, redundant adversarial audit (`term-audit.wf.js`)
> was launched but hit the account usage limit at launch and did **not** produce verdicts. It
> is not needed for accuracy: the deep-research harness above already did per-claim adversarial
> 3-0 voting. Re-running `scripts/term-audit.wf.js` later is optional (a second verification
> layer), not a blocker.
>
> **Golden rule for this product:** only *structural / guaranteed* facts are stable —
> product names, issue ages, structure, rate-class labels, conversion terms, rider triggers and
> lifetime limits. **Actual premium dollar amounts are rate-sheet-driven and change often —
> never hard-code them.** The official carrier illustration is always the authoritative document.

---

## 1. Current term lineup — the "Guaranteed Series"  ·  verdict: CONFIRMED (high, 3-0)

NLG/LSW markets term as the **Guaranteed Series** — four fully-guaranteed level-premium
contracts plus an Annual Renewable Term:

| Product | Level-premium guarantee | Notes |
|---|---|---|
| **G10** (10-G) | 10 years | Current marketing form series **ICC18-20522** ("Level Term xx-G"). |
| **G15** (15-G) | 15 years | |
| **G20** (20-G) | 20 years | |
| **G30** (30-G) | 30 years | The sample illustration's product. |
| **ART** (Annual Renewable Term) | none — premiums **increase annually** | Separate product; issue ages 18–85. |

- **Carrier:** Life Insurance Company of the Southwest (LSW) and National Life (NL). Appears
  under the underwriting-document framing "**Term LSW and Term NL Life**."
- **Legacy variants:** older LSW guides also expose **15-NG / 20-NG / 30-NG** (current-level
  premiums with only a **10-year** guarantee). Treat as legacy; the current lineup is the four
  G-products + ART.

*Sources:* NLG Life Product Quick Reference Chart (Cat 63236, 10-25); LSW Level Term Product
Guide; 2023 NLG Underwriting Guide; LSW Underwriting Guide (totalfinancial).
`https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Life_Product_Quick_Reference_Chart_63236_10-25.pdf`

---

## 2. Term structure & core facts  ·  verdict: CONFIRMED (high, 3-0)

- **Level death benefit** for the term period, with **NO cash value accumulation and no
  dividends.** (This is *the* structural difference from IUL — see §9.)
- **Lowest initial cost** of all NLG products (highest immediate death benefit per premium
  dollar).
- After the level-premium period the policy is **annually renewable**, with premiums that
  **increase annually**, and coverage extends to the **policy anniversary following the
  insured's 95th birthday** (age 95).

> **Sample cross-check (real Term 30-G, form ICC18-20522).** The illustration states verbatim:
> *"annually renewable to age 95. Premiums are level for the first 30 years and increase
> annually thereafter to attained age 95. This policy has no cash value and no dividends are
> payable."* The ledger has only four columns — **Policy Year · Age · Guaranteed Contract
> Premium · Guaranteed Death Benefit** — no cash-value / CSV / accumulation / income column.

*Sources:* Quick Reference Chart 63236 (10-25); LSW Level Term Product Guide.

---

## 3. Issue ages  ·  verdict: CONFIRMED (high, 3-0)

Issue ages start at **18**; the maximum issue age **shortens as the term lengthens**:

| Product | Non-tobacco | Tobacco |
|---|---|---|
| **10-G** | 18–75 | 18–75 |
| **15-G / NG** | 18–75 | 18–70 |
| **20-G / NG** | 18–70 | 18–65 |
| **30-G / NG** | 18–55 | 18–50 |
| **ART** | 18–85 | 18–85 |

Coverage on all plans extends to **age 95**. Two independent primary sources (LSW UW Guide,
2023 NLG UW Guide) agree on these load-bearing figures.

*Sources:* LSW Underwriting Guide (totalfinancial); 2023 NLG Underwriting Guide.

---

## 4. Rate classes  ·  verdict: CONFIRMED (high, 3-0)

Term is offered across this rate-class structure (split by tobacco use). **Actual class is
determined at underwriting.**

| Rate class | Issue ages | Face-amount limit |
|---|---|---|
| **Elite** | 18–**75** | all face amounts |
| **Preferred Non-Tobacco** | 18–85 | — |
| **Select Non-Tobacco** | 18–85 | — |
| **Standard Non-Tobacco** | 18–85 | — |
| **Express Standard Non-Tobacco** | 18–85 | **total face ≤ $2,000,000** |
| **Preferred Tobacco** | 18–85 | — |
| **Standard Tobacco** | 18–85 | — |
| **Express Standard Tobacco** | 18–85 | **total face ≤ $2,000,000** |

Elite's max issue age is **75** (vs 85 for all others); Express Standard classes are capped at
**$2M** total face. Structural underwriting facts, not rate-sheet figures.

*Source:* 2023 NLG Underwriting Guide.

---

## 5. Conversion privilege  ·  verdict: CONFIRMED (high, 3-0) — window is PARTIAL

- Term converts to a **single-life permanent plan then offered by the company**, with **NO
  evidence of insurability / no new underwriting** — *provided the coverage amount is not
  increased and no additional riders are added.* (NLG Term2Perm: "No underwriting required*",
  *"Additional underwriting will be required if coverage amount is being increased or additional
  riders are being added."*)
- The new permanent policy is issued at an **equivalent rate class regardless of health
  changes**.
- ⚠️ **Conversion window varies by product/state.** The current Term 30-G sample states **first
  20 years from issue, or to age 70 if earlier**; older LSW specimens show **15 years**. Do not
  hard-code a single window — this is an **open question** (see §11).

*Sources:* NLG Term2Perm ekit; LSW Level Term Product Guide.

---

## 6. Living-benefit riders — the ABR suite  ·  verdict: CONFIRMED (high, 3-0)

All term plans include the **Accelerated Benefit Rider (ABR) suite at NO additional premium.**
As of **Jan 28, 2023** the suite covers **five** conditions:

1. **Terminal Illness**
2. **Chronic Illness**
3. **Critical Illness**
4. **Critical Injury** — NLG markets itself as the **only major carrier including Critical
   Injury as a standard no-cost rider**.
5. **Alzheimer's Disease / Lewy Body Dementia** (added effective Jan 28, 2023, expanding the
   prior four-condition set).

Also available on term: a **Children's Term rider** and a **Waiver of Premium rider** (which
waives premium on the *converted* policy).

*Sources:* NLG newsroom (Alzheimer's/Lewy Body addition, Jan 2023); Quick Reference Chart
63236 (10-25); LSW Living Benefits Rider guide.

### 6.1 ABR discount mechanics  ·  verdict: CONFIRMED (high, 3-0)

- The ABR pays the **actuarially discounted value of the death benefit being accelerated, less
  a pro-rata portion of any policy debt** — **NOT dollar-for-dollar.** The client receives
  **less** than the amount accelerated.
- Discount reflects the insured's **age / life expectancy** and, for **Critical Illness (ABR3)**,
  the **severity** of the condition. A per-election administrative fee (historically up to $500)
  may apply. (LSW: *"the actual ABR payment you receive will be less than the death benefit you
  accelerate."*)

> **Sample cross-check.** In the real Term 30-G illustration, if fully accelerated the projected
> **discounted** values were roughly **86% of the $600,000 DB for Terminal, ~62% for
> Alzheimer's, and $0–79% for Critical Illness/Injury**, while **Chronic pays a monthly
> benefit** — i.e. per-condition, discounted amounts, **not a flat percentage.** Never present
> living benefits as a flat % of the death benefit.

*Sources:* NLG ABR help (Chronic ABR2 / Critical ABR3); LSW Living Benefits brochure.

### 6.2 ABR lifetime dollar limits  ·  verdict: CONFIRMED (high, 3-0)

Per-insured **maximum lifetime** accelerated-benefit limits, across **all contracts** on the
insured:

- **Terminal Illness — $1,500,000**
- **Chronic Illness — $1,500,000** (**NY: $2,000,000**)
- **Critical Illness / Critical Injury — $1,000,000** (combined)
- **Alzheimer's — $1,500,000**
- **State variation:** reduced to **$500,000 in Illinois and New Jersey** (terminal/chronic/
  critical). The carrier reserves the right to change limits but **never below $500,000**.
- Chronic is also subject to a **monthly maximum**.

*Source:* LSW Accelerated Benefits Riders Agent Guide.

---

## 7. Foreign nationals / Brazil — TERM IS NOT AVAILABLE  ·  verdict: CONFIRMED (high, 3-0) — COMPLIANCE-CRITICAL

⚠️ **The single most important compliance fact for this agent's book of business.**

- **NLG/LSW does NOT offer TERM insurance to foreign nationals / non-US-residents.** Only
  **PERMANENT** products are eligible (up to **Class 4 / 200%** table rating). **RapidProtect /
  RapidProtect NL is also excluded.** (Foreign National Guidelines Cat 69798, 11-25, p.4:
  *"Permanent Products Only — up to Class 4 (200%)"*, *"RapidProtect/RapidProtect NL not
  available for Foreign Nationals."*)
- Eligibility is limited to citizens/residents of **"A" or "B" classified countries**;
  **Brazil is a "B" country** (Guidelines p.7). C countries = individual facultative; **D & E
  countries cannot be covered.** For a B country, riders are **ABRs only**.
- **Therefore, for the agent's Brazil-based foreign-national clients, TERM is not an available
  product.** Term applies to **US-resident clients** (the sample insured is a Virginia
  resident). In Arlindo, the Term product should be understood as the **US-resident** path;
  Brazil/foreign-national clients route to **permanent** (IUL).

*Source:* `https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Foreign_National_Guidelines_69798_11-25.pdf`

---

## 8. Foreign-national PERMANENT rules (for contrast)  ·  verdict: CONFIRMED (high, 3-0)

Since term is off the table for foreign nationals, their path is permanent life, which carries:

- **Minimum face $500,000; maximum $15,000,000** ($2,000,000 for students).
- Documented **US nexus** and significant documented US assets; **US delivery** to a valid
  address in the state of issue.
- **All solicitation and sales activity conducted within the US** — no marketing or policy
  materials transmitted/delivered outside the US.
- **English-language** application and policy forms.
- NLG defines a **foreign national** as anyone (incl. US citizens living abroad) spending
  **more than 4 months in a consecutive 12-month period outside the US.**

*(This mirrors §6 of the FlexLife KB — see [`national-life-flexlife.md`](./national-life-flexlife.md).)*

*Source:* NLG Foreign National Guidelines (Cat 69798, 11-25).

---

## 9. Term vs. permanent (for the comparison slide)

| | **Term** | **Permanent (IUL)** |
|---|---|---|
| Initial cost | **Lowest** | Higher |
| Death benefit per premium $ | **Highest immediate** | Lower |
| Cash value | **None** | Builds cash value |
| Premium | Level for term, then **rises sharply** (ART) to age 95 | Flexible / permanent |
| Duration | **Temporary** (finite level period) | Lifetime |
| Bridge | **Conversion privilege** → permanent, no new underwriting | — |

Term's advantages: lowest initial cost, highest immediate death benefit per dollar. Trade-offs:
builds no cash value, level-premium period is finite (premiums then rise on the annually-
renewable schedule to age 95), temporary protection. The **conversion privilege** lets the
client move to a permanent policy (which does build cash value) with no new underwriting.

---

## 10. Compliance disclaimers a term presentation must carry

Guarantees depend on the **claims-paying ability of the issuing company**; not FDIC/NCUA
insured, no bank/credit-union guarantee, may lose value; death benefit generally income-tax-free
under **IRC §101(a)(1)**; **accelerated benefits are paid at a discount, may be taxable, and may
affect eligibility for public-assistance programs**; use of one benefit may reduce or eliminate
other policy/rider benefits; riders are optional, may require additional premium, are subject to
underwriting/exclusions and may not be available in all states; the official **Statement of
Policy Cost and Benefit Information** is the authoritative document.

*(Arlindo auto-renders required disclaimers — mirror the IUL disclaimer plumbing in `riders.ts`
/ `presentationCopy.ts`, dropping cash-value/AG-49-B language that does not apply to term.)*

---

## 11. Caveats & open questions (from the deep research — resolve before shipping)

**Caveats.** Document currency varies: strongest structural sources span the 2013 LSW Level
Term Product Guide and 2014 LSW Living Benefits guide (which **predate** the Critical Injury and
Alzheimer's additions) through the 2023 NLG UW Guide to the current Oct/Nov 2025 Quick Reference
Chart and Foreign National Guidelines. Where a fact is scoped to an older doc (e.g. a three-
rider ABR set), that reflects the doc's vintage — the **current suite is the five-condition
set**. Several PDFs are hosted on independent agent/brokerage mirrors, but form numbers and
content match NLG's own materials. **State-availability of individual riders could not be
confirmed** — the legacy state-exclusion lists were **refuted** and must not be relied upon.

**Open questions (unverified — do NOT invent answers):**
1. Current (2025-26) **state-availability exclusion lists** for each individual ABR on term.
2. Whether the **conversion window** differs by product (10-G vs 30-G) and state — uniformly
   "first 20 years or to age 70," or does the 15-year specimen apply to shorter terms?
3. Exact current **marketing form series** per G-product and ART (ICC18-20522 referenced for
   "Level Term xx-G"; per-product form numbers / state variants not individually verified).
4. **US-resident term minimum face** and band/policy-fee structure (distinct from the $500k
   foreign-national minimum); how Express-class face caps interact with ART.

---

## 12. ⚠️ Source to EXCLUDE  ·  verdict: CONFIRMED (high, 3-0)

The document circulated as "NLG guide IM10743" (`cpasy.com/files/82918/im_10743.pdf`) is
actually an **American National Insurance Company** document (Galveston, TX; rider forms
ABR14-TM/CH/CT), **NOT an NLG/LSW source** — zero occurrences of "National Life Group", "LSW",
or "Life Insurance Company of the Southwest." **Exclude it from any NLG/LSW term reference.**

---

## 13. What to build (Term product — implications for the code)

Derived from the facts above; mirrors how §8 of the FlexLife KB drives the IUL code.

- **Model** (`src/domain/model/presentation.ts`): add `productType: 'term'`; a `term` fields
  object — face/death benefit, premium + mode, **term length** (10/15/20/30/ART), **conversion
  window**, ABR riders, and a **level-premium schedule** (Policy Year · Age · Premium · Death
  Benefit). Additive; keep `schemaVersion`/migrations sane.
- **Registry** (`products.ts`): add Term (carrier LSW/NL) with **structural facts only** — never
  hard-code current rates.
- **Slides** (branch `buildSlides` on `productType`): keep Cover, Protection/Living-benefits
  headline, a Coverage slide (premium + death benefit + living benefit + conversion), a
  **Premium Schedule** table (4 columns, §2), the ABR detail (§6, discounted/per-condition —
  not flat %), a **Term-vs-Permanent** comparison (§9), and Disclaimers (§10). **DROP** the IUL
  Projection, the accumulated-value year table, the Withdraw-vs-Income "Duas Opções" slides, and
  the accumulation card — **term has no cash value.**
- **No estimator** for term (no cash value) — the data-entry "Estimar no app" toggle should not
  appear for term.
- **Foreign-national gate** (§7): term is the **US-resident** path; surface that Brazil/foreign-
  national clients are permanent-only.
- Localize all new Term copy **PT / EN / ES** via `presentationCopy.ts`.

---

## 14. Primary sources (most authoritative first)

- **NLG Life Product Quick Reference Chart** (Cat 63236, 10-25) — lineup (Guaranteed Series,
  ART), structure, no-cash-value, ABR row.
  `https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Life_Product_Quick_Reference_Chart_63236_10-25.pdf`
- **NLG Foreign National Guidelines** (Cat 69798, 11-25) — **term excluded**, permanent-only,
  Brazil = "B", $500k min.
  `https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Foreign_National_Guidelines_69798_11-25.pdf`
- **2023 NLG/LSW Underwriting Guide** — issue ages, rate classes, "Term LSW and Term NL Life."
  `http://www.cassaniinsurance.com/wp-content/uploads/2023/12/National-Life-Group-Underwriting-Guide-2023.pdf`
- **LSW Level Term Product Guide** — seven products, to-age-95, conversion window.
  `http://theinsgroup.net/images/stories/LSW/Life/LSW_Level_Term_Product_Guide.pdf`
- **LSW Living Benefits (ABR) Rider guide** — no-cost ABRs, discount basis, lifetime limits.
  `https://theinsgroup.net/images/stories/LSW/Life/LSW_Living_Benefits_Rider.pdf`
- **NLG Term2Perm conversion ekit** — "no underwriting required" + the increase/rider asterisk.
  `https://www.nationallife.com/docs/digital/ekit/Term2Perm/index.html`
- **NLG newsroom** — Alzheimer's/Lewy Body ABR addition (Jan 2023).
  `https://www.nationallife.com/Our-Story/newsroom/NLG-expand-suite-of-living-benefits-adds-Alzheimers-and-Fertility-Riders`
- **NLG ABR help** (Chronic ABR2 / Critical ABR3 discount mechanics).
  `https://www.nationallife.com/NWI/Help/en-US/Peach/Riders_ChronicABR2_CriticalABR3.htm`
- Cross-check: a real, current **LSW Term 30-G** illustration (form ICC18-20522) — kept local
  (client PII); **git-ignored**, never committed.

> ⚠️ Some ABR/state and conversion-window specifics were verified partly against older guides
> plus current NLG web summaries — **re-verify against the live NLG Illustration System before
> client-facing use.** Premium dollar amounts change with rate sheets; confirm live numbers each
> time. The official carrier illustration is always authoritative.
