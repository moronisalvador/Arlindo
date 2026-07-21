import type { CoverageOption, PresentationInputs } from '@domain/model/presentation'
import { defaultRidersForProduct } from '@domain/model/products'
import { DEFAULT_IUL_DISCLAIMERS, DEFAULT_TERM_DISCLAIMERS } from '@domain/model/riders'
import type { ParsedIllustration } from './types'

// Note: riders are intentionally NOT auto-toggled from the illustration. The
// rider list wraps across a two-column layout, so its extraction is only partial
// — acting on it risks removing a rider the client actually has. Riders stay at
// the product defaults; the agent reconciles them in the riders section.

/**
 * Merges a parsed illustration into an existing presentation. Called after the
 * agent reviews and confirms the extracted values. Numbers go in via the TYPED
 * path (projectionSource='typed') — the official illustration is authoritative,
 * so we never route imported numbers through the app estimate.
 */
export function applyIllustration(
  parsed: ParsedIllustration,
  existing: PresentationInputs,
): PresentationInputs {
  const isTerm = parsed.productType === 'term'
  const switchingFamily = existing.productType !== parsed.productType

  const client = {
    ...existing.client,
    ...(parsed.client.name ? { name: parsed.client.name } : {}),
    ...(parsed.client.age != null ? { age: parsed.client.age } : {}),
    ...(parsed.client.sex ? { sex: parsed.client.sex } : {}),
  }

  // Seed the target family's riders/disclaimers when switching (or when empty).
  const productId = isTerm ? 'term' : existing.productType === 'iul' ? existing.productId : 'flexlife'
  const disclaimers = switchingFamily
    ? isTerm
      ? [...DEFAULT_TERM_DISCLAIMERS]
      : [...DEFAULT_IUL_DISCLAIMERS]
    : existing.disclaimers

  if (isTerm) {
    const riders = existing.term.riders.length ? existing.term.riders : defaultRidersForProduct('term')
    return {
      ...existing,
      productType: 'term',
      productId,
      client,
      term: {
        ...existing.term,
        premium: parsed.premium ?? existing.term.premium,
        premiumMode: parsed.premiumMode ?? existing.term.premiumMode,
        deathBenefit: parsed.deathBenefit ?? existing.term.deathBenefit,
        livingBenefit: parsed.livingBenefit ?? existing.term.livingBenefit,
        termLengthYears: parsed.termLengthYears ?? existing.term.termLengthYears,
        conversionYears: parsed.conversionYears ?? existing.term.conversionYears,
        conversionToAge: parsed.conversionToAge ?? existing.term.conversionToAge,
        riders,
      },
      abrBenefits: parsed.abrBenefits ?? existing.abrBenefits,
    yearlyRows: parsed.rows.length ? parsed.rows : existing.yearlyRows,
      disclaimers,
    }
  }

  const riders = existing.iul.riders.length ? existing.iul.riders : defaultRidersForProduct(productId)
  const maxYear = parsed.rows.reduce((mx, r) => Math.max(mx, r.policyYear), 0)
  // The projection horizon must match the value we headline. Illustrations print a
  // specific projected value (e.g. "Cash Value at Age 77 = $44,281"), which belongs
  // to that value's policy year — NOT the last ledger row. Label it with the year
  // whose accumulated value matches; only fall back to the full ledger length when
  // no headline value was parsed (then the last row is the projected value).
  const projectionYear =
    parsed.projectedAccumulatedValue != null
      ? parsed.rows.find((r) => r.accumulatedValue === parsed.projectedAccumulatedValue)?.policyYear
      : undefined
  return {
    ...existing,
    productType: 'iul',
    productId,
    client,
    iul: {
      ...existing.iul,
      projectionSource: 'typed',
      premium: parsed.premium ?? existing.iul.premium,
      premiumMode: parsed.premiumMode ?? existing.iul.premiumMode,
      deathBenefit: parsed.deathBenefit ?? existing.iul.deathBenefit,
      livingBenefit: parsed.livingBenefit ?? existing.iul.livingBenefit,
      paymentYears: parsed.paymentYears ?? existing.iul.paymentYears,
      assumedRatePct: parsed.assumedRatePct ?? existing.iul.assumedRatePct,
      guaranteedProjectedValue: parsed.guaranteedValue ?? existing.iul.guaranteedProjectedValue,
      projectionYears: projectionYear ?? (maxYear || existing.iul.projectionYears),
      projectedAccumulatedValue: parsed.projectedAccumulatedValue ?? existing.iul.projectedAccumulatedValue,
      projectedCashSurrenderValue: parsed.projectedCashSurrenderValue ?? existing.iul.projectedCashSurrenderValue,
      incomeOptionAnnual: parsed.incomeOptionAnnual ?? existing.iul.incomeOptionAnnual,
      incomeToAge: parsed.incomeToAge ?? existing.iul.incomeToAge,
      riders,
    },
    abrBenefits: parsed.abrBenefits ?? existing.abrBenefits,
    yearlyRows: parsed.rows.length ? parsed.rows : existing.yearlyRows,
    disclaimers,
  }
}

/**
 * Merges a parsed illustration into ONE coverage-comparison-table row (a pricing
 * tier, not the main plan) — the death benefit / living benefit / term length /
 * premium a second or third carrier illustration prints. Same "typed numbers are
 * authoritative" rule as `applyIllustration`, just scoped to a single option.
 */
export function applyIllustrationToOption(
  parsed: ParsedIllustration,
  existing: CoverageOption,
): CoverageOption {
  const premiumIsAnnual = parsed.premiumMode === 'annual'
  return {
    ...existing,
    deathBenefit: parsed.deathBenefit ?? existing.deathBenefit,
    livingBenefit: parsed.livingBenefit ?? existing.livingBenefit,
    termYears: parsed.termLengthYears ?? existing.termYears,
    monthlyPremium: parsed.premium != null && !premiumIsAnnual ? parsed.premium : existing.monthlyPremium,
    annualPremium: parsed.premium != null && premiumIsAnnual ? parsed.premium : existing.annualPremium,
  }
}
