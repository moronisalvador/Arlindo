import type { PresentationInputs } from '@domain/model/presentation'
import { defaultRidersForProduct } from '@domain/model/products'
import { DEFAULT_IUL_DISCLAIMERS, DEFAULT_TERM_DISCLAIMERS } from '@domain/model/riders'
import type { ParsedIllustration } from './types'

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
        termLengthYears: parsed.termLengthYears ?? existing.term.termLengthYears,
        conversionYears: parsed.conversionYears ?? existing.term.conversionYears,
        conversionToAge: parsed.conversionToAge ?? existing.term.conversionToAge,
        riders,
      },
      yearlyRows: parsed.rows.length ? parsed.rows : existing.yearlyRows,
      disclaimers,
    }
  }

  const riders = existing.iul.riders.length ? existing.iul.riders : defaultRidersForProduct(productId)
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
      assumedRatePct: parsed.assumedRatePct ?? existing.iul.assumedRatePct,
      projectionYears: parsed.rows.length || existing.iul.projectionYears,
      projectedAccumulatedValue: parsed.projectedAccumulatedValue ?? existing.iul.projectedAccumulatedValue,
      projectedCashSurrenderValue: parsed.projectedCashSurrenderValue ?? existing.iul.projectedCashSurrenderValue,
      riders,
    },
    yearlyRows: parsed.rows.length ? parsed.rows : existing.yearlyRows,
    disclaimers,
  }
}
