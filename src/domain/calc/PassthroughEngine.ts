import type { PresentationInputs, YearlyRow } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import {
  defaultProductNameFor,
  defaultTermProductNameFor,
  disclaimersFor,
  translateRider,
} from '@domain/presentationCopy'
import type { CalculationEngine } from './CalculationEngine'

/** Reshapes the salesman's typed illustration numbers into a DerivedPresentation. No math. */
export class PassthroughEngine implements CalculationEngine {
  readonly id = 'passthrough' as const
  readonly version = '1.0.0'

  compute(inputs: PresentationInputs): DerivedPresentation {
    return inputs.productType === 'term' ? this.computeTerm(inputs) : this.computeIul(inputs)
  }

  /** Term: level death benefit, no cash value — Year · Age · Premium · Death Benefit only. */
  private computeTerm(inputs: PresentationInputs): DerivedPresentation {
    const rows = [...inputs.yearlyRows].sort((a, b) => a.policyYear - b.policyYear)
    const term = inputs.term
    const lang = inputs.presentationLanguage

    const totalPremiumsPaid =
      rows.length > 0 ? sum(rows.map((r) => r.premiumPaid ?? 0)) : termPremiumTotal(inputs)

    const resolvedDeathBenefit = term.deathBenefit ?? lastValue(rows, 'deathBenefit')
    const livingBenefit =
      term.livingBenefit ??
      (resolvedDeathBenefit != null && term.livingBenefitPercent
        ? Math.round((resolvedDeathBenefit * term.livingBenefitPercent) / 100)
        : undefined)

    return {
      meta: {
        productType: inputs.productType,
        clientName: inputs.client.name,
        clientAge: inputs.client.age,
        productName: inputs.title || defaultProductName(inputs, lang),
        branding: inputs.branding,
        currency: inputs.displayCurrency,
        language: lang,
        preparedOn: inputs.updatedAt,
        generatedBy: 'passthrough',
        engineVersion: this.version,
      },
      headline: {
        premium: term.premium,
        premiumMode: term.premiumMode,
        paymentYears: term.termLengthYears,
        totalPremiumsPaid: totalPremiumsPaid || undefined,
        deathBenefit: resolvedDeathBenefit,
        livingBenefit,
        livingBenefitPercent: term.livingBenefitPercent,
        projectionYears: term.termLengthYears ?? (rows.length || undefined),
        termLengthYears: term.termLengthYears,
        conversionYears: term.conversionYears,
        conversionToAge: term.conversionToAge,
      },
      series: {
        // No accumulated value / cash surrender value on term.
        policyYears: rows.map((r) => r.policyYear),
        ages: pick(rows, 'age'),
        deathBenefit: pick(rows, 'deathBenefit'),
        premiumPaid: pick(rows, 'premiumPaid'),
      },
      table: rows,
      riders: term.riders.filter((r) => r.included).map((r) => translateRider(r, lang)),
      disclaimers: disclaimersFor(lang, inputs.disclaimers, 'term'),
    }
  }

  private computeIul(inputs: PresentationInputs): DerivedPresentation {
    const rows = [...inputs.yearlyRows].sort((a, b) => a.policyYear - b.policyYear)
    const iul = inputs.iul
    const lang = inputs.presentationLanguage

    const totalPremiumsPaid =
      rows.length > 0
        ? sum(rows.map((r) => r.premiumPaid ?? 0))
        : premiumTotal(inputs)

    // Living benefit is death benefit × accessible %, unless an explicit dollar
    // figure was entered (kept for the rare illustration that prints a different one).
    const resolvedDeathBenefit = iul.deathBenefit ?? lastValue(rows, 'deathBenefit')
    const livingBenefit =
      iul.livingBenefit ??
      (resolvedDeathBenefit != null && iul.livingBenefitPercent
        ? Math.round((resolvedDeathBenefit * iul.livingBenefitPercent) / 100)
        : undefined)

    return {
      meta: {
        productType: inputs.productType,
        clientName: inputs.client.name,
        clientAge: inputs.client.age,
        productName: inputs.title || defaultProductName(inputs, lang),
        branding: inputs.branding,
        currency: inputs.displayCurrency,
        language: lang,
        preparedOn: inputs.updatedAt,
        generatedBy: 'passthrough',
        engineVersion: this.version,
      },
      headline: {
        premium: iul.premium,
        premiumMode: iul.premiumMode,
        paymentYears: iul.paymentYears,
        totalPremiumsPaid: totalPremiumsPaid || undefined,
        projectedAccumulatedValue:
          iul.projectedAccumulatedValue ?? lastValue(rows, 'accumulatedValue'),
        projectedCashSurrenderValue:
          iul.projectedCashSurrenderValue ?? lastValue(rows, 'cashSurrenderValue'),
        deathBenefit: resolvedDeathBenefit,
        livingBenefit,
        livingBenefitPercent: iul.livingBenefitPercent,
        incomeOptionAnnual: iul.incomeOptionAnnual,
        incomeToAge: iul.incomeToAge,
        projectionYears: iul.projectionYears ?? (rows.length || undefined),
      },
      series: {
        policyYears: rows.map((r) => r.policyYear),
        ages: pick(rows, 'age'),
        accumulatedValue: pick(rows, 'accumulatedValue'),
        cashSurrenderValue: pick(rows, 'cashSurrenderValue'),
        deathBenefit: pick(rows, 'deathBenefit'),
        premiumPaid: pick(rows, 'premiumPaid'),
      },
      table: rows,
      riders: iul.riders.filter((r) => r.included).map((r) => translateRider(r, lang)),
      disclaimers: disclaimersFor(lang, inputs.disclaimers),
    }
  }
}

function defaultProductName(
  inputs: PresentationInputs,
  lang: PresentationInputs['presentationLanguage'],
): string {
  if (inputs.productType === 'term') {
    return defaultTermProductNameFor(lang)
  }
  if (inputs.productType !== 'iul') {
    return lang === 'en'
      ? 'Retirement Plan'
      : lang === 'es'
        ? 'Plan de Jubilación'
        : 'Plano de Aposentadoria'
  }
  return defaultProductNameFor(lang)
}

function premiumTotal(inputs: PresentationInputs): number {
  const { premium, premiumMode, projectionYears } = inputs.iul
  if (premium == null || projectionYears == null) return 0
  const perYear = premiumMode === 'monthly' ? premium * 12 : premium
  return perYear * projectionYears
}

/** Total premiums over the level-premium period (term). */
function termPremiumTotal(inputs: PresentationInputs): number {
  const { premium, premiumMode, termLengthYears } = inputs.term
  if (premium == null || termLengthYears == null) return 0
  const perYear = premiumMode === 'monthly' ? premium * 12 : premium
  return perYear * termLengthYears
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0)
}

/** Returns the column as an array only if at least one row has a value, else undefined. */
function pick(rows: YearlyRow[], key: keyof YearlyRow): number[] | undefined {
  if (!rows.some((r) => r[key] != null)) return undefined
  return rows.map((r) => (r[key] ?? 0) as number)
}

function lastValue(rows: YearlyRow[], key: keyof YearlyRow): number | undefined {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = rows[i][key]
    if (v != null) return v as number
  }
  return undefined
}
