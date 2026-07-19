# IUL Estimator Calibration — 2026-07-19 (single illustration)

> **What this is.** The first real calibration of `IulProjectionEngine` (the app's approximate
> in-app estimate, labeled *estimativa — não garantida*), fit against **one** real LSW FlexLife
> illustration. It replaces the earlier hand-guessed coefficients. Per
> [`calibration-capture-list.md`](./calibration-capture-list.md), the full ~10-illustration
> capture set is still the goal for multi-case accuracy — this is a strong single-point fit,
> not a general solve. The **official carrier illustration remains authoritative**; the estimate
> is a conversation tool only.

## Source illustration (structural facts only — no client identity)
- Product: **FlexLife IUL** (LSW), Death Benefit Option **A (Level)**.
- Insured: **Male 63, Elite Non-Tobacco**, Utah.
- **Face amount $55,407 · premium $250/mo ($3,000/yr)** — a max-funded accumulation design.
- Riders incl. the **Accumulated Value Enhancement Rider** (annual bonus from policy year 2),
  LIBR, ABR, etc.
- Value basis fit: **Current** (non-guaranteed), weighted-average interest **6.84%**.
- Ledger captured: year-by-year Accumulated Value + Cash Surrender Value, policy years 1–15
  (the accumulation phase, before LIBR income begins ~year 16).

## Result
The estimate now tracks the real Current accumulated-value curve to a **mean absolute error of
~3.9%**, with the **projection-year headline value (year 15) within ~1.3%** (real $44,281 vs
estimate $44,865). Before this calibration the engine over-estimated by **~61%** (year-15
$66,201). Early years run slightly **conservative** (up to ~11% low in year 1, tapering to near
zero by year 8) — the safe direction for an estimate. The fit is locked by a regression guard:
[`calibration.probe.test.ts`](../../src/domain/calc/calibration.probe.test.ts).

## Coefficients fit (in `IulProjectionEngine.ts`)
| Coefficient | Value | Note |
|---|---|---|
| `PREMIUM_LOAD` | 6% | Premium expense charge. |
| `POLICY_FEE` | $90/yr | ~$7.5/mo per-policy fee. |
| `UNIT_CHARGE_PER_1000_MONTH` | $0.55 | Per-$1,000-of-face monthly expense, years 1–10. |
| `coiRate(age)` | `min(0.0006 + 0.00047·(age−30), 0.04)` | Steepened age-graded COI (the old curve was far too low for older ages). |
| `AV_ENHANCEMENT_BONUS_PCT` | 0.65% | Models the **Accumulated Value Enhancement Rider**, credited from policy year 2. |
| `MAX_ILLUSTRATED_RATE` | 7.0% | Ceiling — NLG's current weighted-average incl. the multiplier (was 6.4%). Still clamps runaway inputs. |
| `SURRENDER_CHARGE_PER_1000` | $35.5 | Dollar surrender charge per $1,000 face, linear to 0 by year 11 (replaces the old %-of-AV model). |
| Crediting convention | mid-year premium | Existing value earns a full year; this year's premium (paid monthly) earns ~half a year. |

## Known limitations (why the capture set still matters)
- **One illustration, one profile.** Fit to an older, max-funded, Option-A case. Younger ages,
  larger faces (per-$1,000 charge), Option B, and different funding levels are **not
  independently validated** — a single case can't isolate load vs per-unit vs COI vs bonus.
- **Rates are non-guaranteed and dated.** 6.84% weighted avg / the multiplier reflect *this*
  illustration's rate sheet. Re-fit when NLG updates rate sheets.
- **Accumulation phase only.** The LIBR income factor (~6% of final CSV) was not re-fit here;
  the LIBR-income solve is capture-set item #9.

## Next
Gather the ~10-illustration capture set (hold one variable per run) and re-fit to generalize;
log the result as a new dated note here. Until then, the **typed** path (numbers straight off the
official illustration) remains the accurate, authoritative flow.
