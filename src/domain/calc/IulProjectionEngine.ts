import type { PresentationInputs, YearlyRow } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import { getProduct } from '@domain/model/products'
import { estimateNoteFor } from '@domain/presentationCopy'
import type { CalculationEngine } from './CalculationEngine'
import { PassthroughEngine } from './PassthroughEngine'

/**
 * APPROXIMATE IUL projection — an ESTIMATE only, never a substitute for the
 * official NLG illustration. It sketches year-by-year values from a few inputs
 * using a deliberately simple, transparent model:
 *   netPremium = annualPremium*(1 − premiumLoad) − costOfInsurance − policyFee − perUnitCharge
 *   accumulatedValue = max(0, (prev + netPremium) * (1 + creditingRate))   [index floor 0%]
 * The crediting rate is clamped to an AG 49-B-style ceiling so we never illustrate
 * an unrealistic return. Cost-of-insurance and the per-$1,000 expense charge are
 * bounded age/face approximations (real charges come from carrier rate sheets we
 * don't have). Note the 0% index floor is NOT "no loss": monthly charges still
 * apply in flat years, so account value can decline. Results are labeled
 * "estimativa — não garantida" in the UI.
 */

// Coefficients fit to a real FlexLife illustration — see
// docs/knowledge/calibration-2026-07-19.md. Single-illustration fit; re-fit with
// the full capture set (docs/knowledge/calibration-capture-list.md) for other cases.
const PREMIUM_LOAD = 0.06 // NLG premium expense charge (approx)
const POLICY_FEE = 90 // approx annual per-policy fee (~$7.5/mo)
const UNIT_CHARGE_PER_1000_MONTH = 0.55 // approx monthly expense charge per $1,000 of face
const UNIT_CHARGE_YEARS = 10 // per-unit charge applies in the early policy years
const MAX_ILLUSTRATED_RATE = 7.0 // ceiling (%) — NLG current weighted-avg incl. multiplier
// Accumulated Value Enhancement Rider: an annual bonus credited from policy year 2.
const AV_ENHANCEMENT_BONUS_PCT = 0.65
const AV_ENHANCEMENT_START_YEAR = 2
// Surrender charge: a per-$1,000-of-face dollar amount that declines to 0 by year 11.
const SURRENDER_CHARGE_PER_1000 = 35.5
const SURRENDER_CHARGE_YEARS = 10

function clampRatePct(pct: number): number {
  if (Number.isNaN(pct)) return 0
  return Math.min(Math.max(pct, 0), MAX_ILLUSTRATED_RATE)
}

/** Bounded, age-graded annual cost-of-insurance rate per $ of net amount at risk. */
function coiRate(age: number): number {
  return Math.min(0.0006 + 0.00047 * Math.max(age - 30, 0), 0.04)
}

export class IulProjectionEngine implements CalculationEngine {
  readonly id = 'iul-engine' as const
  readonly version = '0.1.0-estimate'

  private projectRows(inputs: PresentationInputs, ratePct: number): YearlyRow[] {
    const iul = inputs.iul
    const startAge = inputs.client.age ?? 40
    const years = iul.projectionYears ?? 20
    const annualPremium = (iul.premium ?? 0) * (iul.premiumMode === 'annual' ? 1 : 12)
    const db = iul.deathBenefit ?? 0
    const rate = clampRatePct(ratePct) / 100

    const rows: YearlyRow[] = []
    let av = 0
    for (let i = 1; i <= years; i++) {
      const age = startAge + i - 1
      const nar = Math.max(db - av, 0)
      const coi = nar * coiRate(age)
      // Monthly per-$1,000-of-face expense charge, early policy years only.
      const unitCharge =
        i <= UNIT_CHARGE_YEARS ? (db / 1000) * UNIT_CHARGE_PER_1000_MONTH * 12 : 0
      const net = annualPremium * (1 - PREMIUM_LOAD) - coi - POLICY_FEE - unitCharge
      // Accumulated Value Enhancement Rider adds an annual bonus from year 2.
      const yearRate =
        rate + (i >= AV_ENHANCEMENT_START_YEAR ? AV_ENHANCEMENT_BONUS_PCT / 100 : 0)
      // Existing value earns the full year; this year's premium is paid monthly, so
      // it earns roughly half a year of interest on average.
      av = Math.max(0, av * (1 + yearRate) + net * (1 + yearRate / 2))
      // Surrender charge: a per-$1,000-of-face dollar amount, linear to 0 by year 11.
      const surrenderCharge =
        i <= SURRENDER_CHARGE_YEARS
          ? (db / 1000) * SURRENDER_CHARGE_PER_1000 * ((SURRENDER_CHARGE_YEARS + 1 - i) / SURRENDER_CHARGE_YEARS)
          : 0
      const csv = av - surrenderCharge
      rows.push({
        policyYear: i,
        age,
        premiumPaid: Math.round(annualPremium),
        accumulatedValue: Math.round(av),
        cashSurrenderValue: Math.round(Math.max(csv, 0)),
        deathBenefit: db,
      })
    }
    return rows
  }

  compute(inputs: PresentationInputs): DerivedPresentation {
    const product = getProduct(inputs.productId)
    const ratePct = inputs.iul.assumedRatePct ?? 6
    const rows = this.projectRows(inputs, ratePct)

    const last = rows[rows.length - 1]
    const projectedAccumulatedValue = last?.accumulatedValue
    const projectedCashSurrenderValue = last?.cashSurrenderValue

    // LIBR is realistic only when the policy is in force ~10 years AND the
    // insured's attained age at the projection end is within the 60–85 exercise
    // window. Otherwise leave income undefined so the option hides cleanly.
    const startAge = inputs.client.age ?? 40
    const years = inputs.iul.projectionYears ?? rows.length
    const attainedAge = startAge + years - 1
    const librEligible = years >= 10 && attainedAge >= 60 && attainedAge <= 85
    // Rough LIBR level income estimate: ~6% of the final cash surrender value.
    const incomeBase = last?.cashSurrenderValue ?? 0
    const incomeOptionAnnual = librEligible
      ? Math.round((incomeBase * 0.06) / 100) * 100
      : undefined

    // Reuse the passthrough shaping on the estimated rows so slides are identical.
    // No age-120 default: LIBR pays for life once exercised — age 120 is only an
    // illustration horizon, so we surface an age only if one was typed in.
    const estimatedInputs: PresentationInputs = {
      ...inputs,
      yearlyRows: rows,
      iul: {
        ...inputs.iul,
        projectedAccumulatedValue,
        projectedCashSurrenderValue,
        incomeOptionAnnual,
        incomeToAge: inputs.iul.incomeToAge,
      },
    }
    const derived = new PassthroughEngine().compute(estimatedInputs)
    derived.meta.generatedBy = 'iul-engine'
    derived.meta.engineVersion = this.version
    derived.meta.productName = derived.meta.productName || product.name
    // Make the estimate self-labeling everywhere it renders (slides/PDF/PPTX).
    derived.disclaimers = [estimateNoteFor(inputs.presentationLanguage), ...derived.disclaimers]
    return derived
  }
}
