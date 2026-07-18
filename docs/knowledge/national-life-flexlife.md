# National Life Group — FlexLife IUL Knowledge Base

> **Purpose.** A durable, AI-queryable record of what Arlindo knows about National Life
> Group (NLG) / Life Insurance Company of the Southwest (LSW) indexed universal life,
> centered on **FlexLife** (the product the agent sells most). Every fact carries a
> **confidence level**, an **audit verdict**, and **source URLs** so a future AI (or human)
> can answer product questions and cite them.
>
> **Provenance.** Compiled from (1) an adversarial factual-accuracy audit run 2026-07-18
> (25 agents; each shipped claim checked by an evidence-gathering verifier **and** a skeptic
> prompted to refute it, against NLG/LSW primary sources — see
> [`flexlife-audit-2026-07-18.json`](./flexlife-audit-2026-07-18.json) for the raw output),
> and (2) the earlier deep-research pass. **Verdict legend:** CONFIRMED = matches current
> primary source · PARTIAL = core correct but a specific misstatement/omission · UNVERIFIABLE
> = not found in sources.
>
> **Golden rule for this product:** only *guaranteed minimums* and *structural facts* are
> stable. **Current caps, participation rates, bonus/Enhancer rates, and the max illustrated
> rate are rate-sheet-driven and change often — never hard-code them.** The official carrier
> illustration is always the authoritative document; anything computed in-app is an estimate.

---

## 1. Current IUL product lineup  ·  verdict: CONFIRMED (high)

National Life Group's current IUL family (per the official *Life Product Quick Reference
Chart*, Cat No 63236, 10-25 edition, effective Oct 2025):

| Product | Carrier | Focus | Min base face | Notes |
|---|---|---|---|---|
| **FlexLife** | NL **and** LSW | Accumulation + income distribution | **$50,000** | Flagship; ages 0–85; living benefits + LIBR. NL issues NY policies (LSW not authorized in NY). |
| **PeakLife** | **NL only** | Emerging/affluent, **$1M+** face | $1,000,000 | NLG's own descriptor is "emerging and affluent," not "HNW". |
| **SummitLife** | **LSW only** | **High-net-worth** ($1M+) | $1,000,000 | **Not available in NY** (LSW not authorized there). |
| **RapidProtect** | NL **and** LSW | Protection; instant-decision, **no medical exam** | $50,000–$500,000 | Ages 0–60. Launched Sept 2025. **Not eligible for foreign nationals.** |
| **SurvivorLife** | NL **and** LSW | Survivorship (**second-to-die**, two insureds) | $250,000 | Estate/succession planning. |

*Sources:* NLG Life Product Quick Reference Chart 63236 (10-25); FMI product pages; NLG
RapidProtect newsroom.
`https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Life_Product_Quick_Reference_Chart_63236_10-25.pdf`
· `https://www.nationallife.com/our-story/newsroom/rapidprotect`

---

## 2. FlexLife core facts  ·  verdict: CONFIRMED (high)

- **Carrier:** National Life Insurance Company (Montpelier, VT) and/or LSW (Addison, TX).
  NY policies are NL-issued (LSW is not an authorized insurer in New York).
- **Minimum base face amount:** **$50,000** (domestic). *(Foreign-national minimum is
  higher — see §6.)*
- **Guaranteed minimum:** cash-value growth guaranteed to be **at least 1.75% over the life
  of the contract**. ⚠️ This is a **lifetime** guaranteed minimum, **not an annual credited
  rate** — indexed strategies have a separate **0% annual floor**. Do not imply the client
  earns 1.75%/year.
- **Focus:** interest growth based in part on the S&P 500, UBS Balanced Trend, and US
  Pacesetter indices; designed for competitive income distribution.

*Source:* Quick Reference Chart 63236 (10-25); FlexLife enhancement newsroom.

---

## 3. Living-benefit riders

### 3.1 The five Accelerated Benefit Riders (ABRs)  ·  verdict: PARTIAL (high)

- **No additional premium** for the five ABRs. ✅ CONFIRMED.
- **Paid on a DISCOUNTED basis** — the client receives *less* than the accelerated amount
  (benefit paid before death, net of remaining premiums, fees, loans). ✅ CONFIRMED.
- The five: **Terminal, Chronic, Critical Illness, Critical Injury, Alzheimer's** (Alzheimer's
  added 2023, also covers Lewy Body Dementia). ✅ CONFIRMED.
- ⚠️ **"Up to 100% of the death benefit" is MISLEADING.** The client never receives 100%
  (discounted). Full single-event acceleration is realistic **only for Terminal Illness**;
  Chronic and Critical are throttled (see below). The "access your FULL death benefit up to
  $3M" headline belongs to the **separate, paid Premium Chronic Care Rider** — do not conflate
  it with the no-cost suite.

### 3.2 ABR lifetime dollar caps  ·  verdict: PARTIAL (high)

The four dollar figures are correct, **but the caps are SHARED aggregate pools, not
independent per-rider caps** (independent wording overstates the ceiling ~3×):

- **Pool A — Terminal + Chronic + Alzheimer's share ONE $1,500,000 lifetime maximum** across
  all ABRs and all contracts per insured. (NY: **$2,000,000**; IL/NJ: **$500,000**.)
- **Pool B — Critical Illness + Critical Injury share ONE $1,000,000 lifetime maximum.**
  (IL/NJ: **$500,000**.)
- No annual limit on the pool itself; a single lifetime limit applies per insured.
- **The app currently implies three independent $1.5M caps + one shared $1M cap — this is a
  known error to fix** (an agent could wrongly promise ~$4.5M instead of $1.5M combined).

### 3.3 Per-rider triggers & mechanics

| Rider | Trigger | Acceleration | Verdict |
|---|---|---|---|
| **Terminal Illness** | Life expectancy **24 months or less** (**12 months in CT, PA, VT for LSW; CT, NY, PA for NL**) | May accelerate full death benefit (still discounted); no waiting period | PARTIAL — app omits the 12-month state list |
| **Chronic Illness (LSW)** | Unable to perform **2 of 6 ADLs** (bathing, continence, dressing, eating, toileting, transferring) for 90 days, **or** severe cognitive impairment | **2%/month = 24%/yr, up to $360,000/yr** | CONFIRMED |
| **Critical Illness** | Cancer, heart attack, stroke, ALS, major organ transplant, etc. | Severity-based | shares Pool B |
| **Critical Injury** | Coma, paralysis, severe burns, traumatic brain injury | Severity-based | shares Pool B |
| **Alzheimer's** | Diagnosis of Alzheimer's / eligible dementia | see Pool A | CONFIRMED existence |

> NL's *other* carrier version of Chronic accelerates as a lump sum under the IRS per-diem
> limit; Arlindo's IUL products are **LSW**, so the 2%/month/$360k figures apply.

### 3.4 Premium Chronic Care Rider (PCC)  ·  verdict: CONFIRMED (high)

- **PAID / additional-cost** rider (launched 05/31/2025; expanded Oct 2025). Underwritten by LSW.
- Accelerates up to the **full, non-discounted death benefit** (**up to ~$3,000,000**).
- Rate: **2% OR 4% per month, elected at issue** (binary choice — no intermediate rate like
  3%; app should not imply a 2–4% range). Subject to IRS per-diem; reducible not increasable.
- **Not available in CA or NY.** Lifetime limit independent of the ABR pools.

### 3.5 Value-Added Services + Fertility  ·  verdict: CONFIRMED (high)

- **Value-Added Services Rider (Homethrive caregiver support):** no cost; auto-attached to new
  eligible 2025 FlexLife IUL policies. **Not available in NY.** In CA/FL/ND the services are
  provided *without* the rider on the policy.
- **Fertility Journey Rider:** no cost; auto-attached (state approval permitting); pays a
  **one-time lump-sum Accumulation Value Credit** after eligible fertility treatment. Never
  render this as a fixed dollar amount.

### 3.6 Optional paid riders — Waiver & Children's Term  ·  verdict: PARTIAL (high)

- **Waiver of Monthly Deductions Rider:** paid; waives monthly deductions on total disability.
  Not available in NY.
- **Children's Term Rider:** paid; **$5,000–$25,000 per child** (sold in $1,000 increments),
  single rate regardless of number of children, **coverage to age 25** (convertible for 6×
  face at age 25). **⚠️ App currently says "age 23" — that matches only the discontinued 2014
  guide; current guide (Jan 2026, Cat 104727) says age 25.** Not available in NY.

---

## 4. Lifetime Income Benefit Rider (LIBR)  ·  verdict: PARTIAL (high)

- **Auto-added** to all eligible new-issue policies; **no charge until exercised** (a monthly
  charge is deducted from accumulated value only during the income-payment period). ✅
- Once exercised, guarantees **income for the life of the insured — "money that cannot be
  outlived."** ✅ (guarantee subject to the carrier's claims-paying ability).
- Exercise conditions: insured **age 60–85**, policy in force ~**10 years**.
- ⚠️ **"Pays to approximately age 120" is NOT supported** — "120" appears zero times in the
  product guide. LIBR pays *for life* (mortality-based). Age 120 is only the standard IUL
  **illustration/policy-maturity horizon**, not a LIBR term. App should drop the age-120
  figure or label it strictly as the illustration horizon, and add the "once exercised"
  qualifier.

*Sources:* FlexLife Product Guide (66346); LSW Lifetime Income Rider (20266); FlexLife
enhancement newsroom.

---

## 5. Index mechanics, floor & illustrated rate  ·  verdict: PARTIAL (high)

- **0% floor** on standard index strategies (no *index* loss in down years). One strategy
  (S&P 500 "1% Floor", ~6.50% cap) uses a **1% floor**. ⚠️ "No loss" overstates it —
  **monthly policy charges (cost of insurance, etc.) continue in flat years**, so account
  value can still decline.
- **Illustrations governed by Actuarial Guideline 49-B (AG 49-B), effective May 1, 2023** —
  which **superseded AG 49-A**. ⚠️ **The app currently cites "AG 49-A" — this is an outdated
  factual error; use AG 49-B.**
- **Max illustrated rate ~6.4%** on the highest-participation uncapped strategies (lower on
  capped strategies). Non-guaranteed, reset by LSW, per-strategy, priced differently in NY.
  The app's ~6.5% ceiling is a defensible approximation — always frame as approximate/current.
- Illustration value bases typically shown: **Guaranteed (~2%) / Alternative (~3%) / Current
  (~6.4%, AG49-B-capped)**.

*Sources:* FIG Marketing AG 49-B explainer; InsuranceNewsNet; a real AG-49-B-era FlexLife
sample illustration (seniormarketsales.com resource 20557).

---

## 6. Foreign nationals / Brazil (USD policy)  ·  verdict: CONFIRMED (high) — COMPLIANCE-SENSITIVE

Per the current **NLG Foreign National Guidelines** (Cat No 69798, rev 11-25):

- NLG issues **USD permanent-life (incl. IUL) policies to foreign nationals**, priced for the
  US population. **Brazil is explicitly a "B" country** (Guidelines p.7).
- **Minimum face amount for foreign-national cases: $500,000** (vs. the $50,000 domestic
  FlexLife minimum). **← Key gap: for a Brazilian client the effective minimum is $500k.**
- **US nexus required** (one of): own US real property/business; married to a US-citizen US
  resident; F-visa student; **≥$100,000 documented US assets held ≥3 months**; or EB-5. "NLG
  will not accept foreign nationals that do not have a nexus to the U.S."
  *(Note: $100k is the nexus threshold; $500k is the face minimum — different line items.)*
- **All premium from a US bank account** in the owner's/insured's name (no cash equivalents).
- **Application/underwriting completed, signed, and dated in the US.**
- **Policy must be delivered and accepted in the US.**
- **All solicitation and sales activity must take place in the US**; no marketing or policy
  materials may be transmitted or delivered outside the US. *(The specific word "illustration"
  is not verbatim in the doc — "all sales activities in the US" is the accurate framing.)*
- **B countries are capped at the "Preferred" rate class** (Elite is A-country only).
- To use **living benefits (ABRs)**, the client must generally be **in the US obtaining
  US-based health care** to accelerate.
- **RapidProtect is not foreign-national eligible.** OFAC/PEP and occupation exclusions apply.
- Max face: $30M (autobind ages 18–70), $20M (71–75). Premium financing is a separate track
  (global net worth >$10M, ≥$1M US liquid assets).

*Source:* `https://www.fmiagent.com/wp-content/uploads/2025-11-12_National_Life_Group_Foreign_National_Guidelines_69798_11-25.pdf`

---

## 7. State-availability quick reference

| State | Restriction |
|---|---|
| **NY** | LSW not authorized → SummitLife (LSW-only) unavailable; FlexLife issued by NL only. PCC rider, Children's Term, Waiver not available. Chronic ABR pool is $2,000,000. Terminal trigger 12 months (NL). |
| **CA** | PCC rider not available. Critical Illness/Injury & Alzheimer's ABRs require the client to hold health insurance. |
| **IL, NJ** | ABR pools reduced to **$500,000**. |
| **MA** | Chronic-illness ABR proceeds restricted to qualified LTC expenses. |
| **CT, PA, VT** (LSW) / **CT, NY, PA** (NL) | Terminal Illness trigger is **12 months** (not 24). |
| **CA, FL, ND** | Homethrive caregiver services provided without the rider on the policy. |

---

## 8. Corrections the audit flagged in Arlindo's shipped data

These are the concrete fixes to `products.ts` / `riders.ts` / `IulProjectionEngine.ts` and the
pt-BR copy (see the audit JSON for exact recommendations):

1. **ABR caps → shared pools** (not independent): Pool A (Terminal+Chronic+Alzheimer's) $1.5M
   shared; Pool B (Critical Illness+Injury) $1.0M shared; add NY/IL/NJ variants. *(riders.ts)*
2. **"Up to 100%" ABR language** → clarify discounted basis; only Terminal accelerates full DB;
   Chronic/Critical are limited. *(riders.ts notes + slides)*
3. **LIBR** → remove "até ~120 anos"; say "por toda a vida, uma vez acionado (60–85, ~10 anos
   em vigor)". *(riders/products copy + IulProjectionEngine `incomeToAge` default of 120)*
4. **AG 49-A → AG 49-B** everywhere (disclaimer + code comment `MAX_ILLUSTRATED_RATE`). *(riders.ts disclaimers, IulProjectionEngine.ts)*
5. **Children's Term "age 23" → "age 25"**. *(riders.ts note)*
6. **Terminal Illness** → add 12-month state footnote. *(riders.ts note)*
7. **Premium Chronic Care** → "2% ou 4% por mês (escolhido na emissão)", not "2%–4%". *(riders.ts note)*
8. **Foreign-national minimum face ($500k)** → surface for Brazilian clients (product shows
   $50k domestic; the FN reality is $500k). *(products.ts / data-entry guidance)*
9. Minor: FlexLife 1.75% = lifetime minimum (not annual); PeakLife = "emerging/affluent" not
   "HNW"; label Chronic ABR as the LSW version.

---

## 9. Projection-engine assumptions (Arlindo `IulProjectionEngine`)

These are **deliberate approximations** for the in-app estimate (labeled "estimativa — não
garantida"), NOT NLG-published figures — treat as tunable, not authoritative:

- Premium load 6%; annual policy fee $72; surrender haircut 8% (first 10 yrs); age-graded COI
  approximation; crediting rate clamped to a 6.5% (AG-49-B-style) ceiling with a 0% floor;
  LIBR level income ≈ 6% of final cash-surrender value. The official carrier illustration
  remains the source of truth.

---

## 10. Primary sources (most authoritative first)

- **Life Product Quick Reference Chart** (Cat 63236, 10-25) — lineup, min face, guaranteed min.
- **Foreign National Guidelines** (Cat 69798, 11-25) — Brazil/B-country, $500k min, US nexus/solicitation.
- **FlexLife Product Guide** (Cat 104727 Jan-2026; older 66346) — riders, LIBR, Children's Term age.
- **ABR Agent Guide** (form 68928) + **LSW Living Benefits Rider** brochure — ABR caps, triggers, discount basis.
- **FlexLife enhancement / Homethrive / Fertility / RapidProtect newsrooms** (nationallife.com) — 2025 additions, PCC rider.
- **AG 49-B** industry explainers (FIG Marketing, InsuranceNewsNet) + a real AG-49-B FlexLife sample illustration.

> ⚠️ Some ABR cap figures and the Terminal 12-month state list were verified partly against a
> 2014-era ABR guide plus current NLG web summaries — **re-verify against the live NLG
> Illustration System before client-facing use.** Current caps/participation/illustrated rates
> change with rate sheets; confirm the live numbers each time.
