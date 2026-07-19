# Estimator Calibration — Illustration Capture List (Path B)

> **Status: PARTIAL.** A first **single-illustration** calibration was done 2026-07-19 (see
> [`calibration-2026-07-19.md`](./calibration-2026-07-19.md)) — the engine now tracks that real
> FlexLife illustration to ~3.9% mean error (was ~61%). The full ~10-illustration capture set
> below is still the goal to **generalize** across ages / faces / funding levels. Gather these
> from a licensed National Life rep; I then re-fit the engine's coefficients and log a new dated
> calibration here. The **typed** path (numbers straight off the official illustration) remains
> the authoritative flow.

## Why
Our estimate uses deliberately approximate charge assumptions (premium load, a per-$1,000
monthly expense charge, an age-graded COI curve, a declining surrender charge, a LIBR income
factor) because the real figures are rate-sheet-driven and not public. A licensed rep can
generate **real illustrations** from NLG's official Illustration System; from a handful of them
we can back out the true coefficients and calibrate the engine. The official illustration always
remains the authoritative document — the estimator stays a "conversa" tool labeled *estimativa*.

## What to capture for EVERY illustration
- The full **year-by-year ledger**: Policy Year, Age, Premium Outlay, Accumulated Value, Cash
  Surrender Value, Net Death Benefit (and Planned Lifetime Income where shown).
- Both value bases if the illustration shows them: **Guaranteed** and **Current** (and Midpoint/
  Alternative if present).
- The **"Policy Charges" / expense detail page** if the system can include it (this is the single
  most valuable page — it separates COI vs expense vs per-unit charges directly).
- The **input summary page** (issue age, sex, rating class, face amount, premium + mode, assumed
  rate, riders elected).
- **Best of all:** if the Illustration System can **export CSV/XML**, send that instead of a PDF —
  then we import exact numbers with zero decoding.

## The capture set (~10 illustrations)
Hold **premium mode = monthly**, **non-smoker/standard**, **male** unless noted (keep one variable
moving at a time so each coefficient is isolable). Use round numbers.

| # | Purpose (what it isolates) | Issue age | Premium | Face | Rate basis | Run to |
|---|---|---|---|---|---|---|
| 1 | Baseline (Current) | 45 | $500/mo | min non-MEC for that premium | **Current** | age 100 |
| 2 | Baseline (Guaranteed) — exposes charge drag | 45 | $500/mo | same as #1 | **Guaranteed/min** | age 100 |
| 3 | Baseline (mid rate) — crediting linearity | 45 | $500/mo | same as #1 | ~4% | age 100 |
| 4 | COI curve — young | 35 | $500/mo | same as #1 | Current | age 100 |
| 5 | COI curve — mid | 55 | $500/mo | same as #1 | Current | age 100 |
| 6 | COI curve — older | 65 | $500/mo | same as #1 | Current | age 100 |
| 7 | Per-$1,000 charge — bigger face, same premium | 45 | $500/mo | ~2× the #1 face | Current | age 100 |
| 8 | Load linearity — bigger premium, same age/face | 45 | $1,000/mo | same as #1 | Current | age 100 |
| 9 | LIBR income solve | 45 | $500/mo | same as #1 | Current | fund to 65, exercise LIBR (level) for life |
| 10 | Real client-style case he actually sells | (his typical) | (typical) | (typical) | Current | (typical) |

Also send, if available: the **current FlexLife rate sheet** (caps, participation rates, Enhancer/
multiplier bonus, and the per-unit/expense/COI charge schedule). That alone lets us encode current
caps behind a **dated** config (never silently hardcoded — stored with its effective date and a
"verify current" note).

## What we'll do with it
- Fit `PREMIUM_LOAD`, `UNIT_CHARGE_PER_1000_MONTH` + `UNIT_CHARGE_YEARS`, the COI curve
  (`coiRate`), the surrender-charge schedule, and the LIBR income factor so the estimate tracks the
  real illustration within a tight band for common cases.
- Store the fitted values + the source illustrations' key facts as a dated calibration note here in
  `docs/knowledge/`, and update `IulProjectionEngine.ts` with a comment pointing to it.
- Re-calibrate whenever NLG updates rate sheets (the calibration is always a dated snapshot).

## Guardrails
- The estimator is never presented as the official illustration; NLG requires the official
  illustration for solicitation.
- Foreign-national / Brazil: solicitation, illustration, signing, and delivery must occur in the US
  (see `national-life-flexlife.md` §6).
- Keep only guaranteed minimums and dated rate-sheet snapshots — no undated hardcoded current rates.
