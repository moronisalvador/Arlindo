import type { PresentationInputs, YearlyRow } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import { getProduct } from '@domain/model/products'
import type { CalculationEngine } from './CalculationEngine'
import { PassthroughEngine } from './PassthroughEngine'

/**
 * APPROXIMATE IUL projection — an ESTIMATE only, never a substitute for the
 * official NLG illustration. It sketches year-by-year values from a few inputs
 * using a deliberately simple, transparent model:
 *   netPremium = annualPremium*(1 − premiumLoad) − costOfInsurance − policyFee
 *   accumulatedValue = max(0, (prev + netPremium) * (1 + creditingRate))   [floor 0%]
 * The crediting rate is clamped to an AG49-A-style ceiling so we never illustrate
 * an unrealistic return. Cost-of-insurance is a bounded age-graded approximation
 * (real COI comes from carrier tables we don't have). Results are labeled
 * "estimativa — não garantida" in the UI.
 */

const PREMIUM_LOAD = 0.06 // NLG premium expense charge (approx)
const POLICY_FEE = 72 // approx annual policy fee
const SURRENDER_HAIRCUT = 0.08 // approx surrender charge, first 10 years
const MAX_ILLUSTRATED_RATE = 6.5 // AG49-A-style ceiling (%)

function clampRatePct(pct: number): number {
  if (Number.isNaN(pct)) return 0
  return Math.min(Math.max(pct, 0), MAX_ILLUSTRATED_RATE)
}

/** Bounded, age-graded annual cost-of-insurance rate per $ of net amount at risk. */
function coiRate(age: number): number {
  return Math.min(0.0008 + 0.00006 * Math.max(age - 30, 0), 0.02)
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
      const net = annualPremium * (1 - PREMIUM_LOAD) - coi - POLICY_FEE
      av = Math.max(0, (av + net) * (1 + rate))
      const csv = i <= 10 ? av * (1 - SURRENDER_HAIRCUT) : av
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
    // Rough LIBR level income estimate: ~6% of the final cash surrender value.
    const incomeBase = last?.cashSurrenderValue ?? 0
    const incomeOptionAnnual = Math.round((incomeBase * 0.06) / 100) * 100

    // Reuse the passthrough shaping on the estimated rows so slides are identical.
    const estimatedInputs: PresentationInputs = {
      ...inputs,
      yearlyRows: rows,
      iul: {
        ...inputs.iul,
        projectedAccumulatedValue,
        incomeOptionAnnual,
        incomeToAge: inputs.iul.incomeToAge ?? 120,
      },
    }
    const derived = new PassthroughEngine().compute(estimatedInputs)
    derived.meta.generatedBy = 'iul-engine'
    derived.meta.engineVersion = this.version
    derived.meta.productName = derived.meta.productName || product.name
    // Make the estimate self-labeling everywhere it renders (slides/PDF/PPTX).
    derived.disclaimers = [
      'Estimativa gerada pelo aplicativo (não garantida) — apenas para simulação. A ilustração oficial da seguradora é o documento válido.',
      ...derived.disclaimers,
    ]
    return derived
  }
}
