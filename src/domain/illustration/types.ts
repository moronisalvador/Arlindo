import type { ProductType, YearlyRow } from '@domain/model/presentation'

/**
 * The structured result of parsing a National Life Group / LSW illustration PDF.
 * A best-effort, format-specific extraction (FlexLife IUL + Term) — always shown
 * to the agent for review before it is applied, because the official illustration
 * is the authoritative document and a parser can misread a value.
 */
export interface ParsedIllustration {
  productType: ProductType
  /** 'high' when the summary + a ledger were both found; 'low' when partial. */
  confidence: 'high' | 'low'
  client: { name?: string; age?: number; sex?: 'M' | 'F' }
  /** Underwriting class as printed, e.g. "Elite Non-Tobacco". */
  rateClass?: string
  state?: string
  productName?: string
  face?: number
  premium?: number
  premiumMode?: 'monthly' | 'annual'
  deathBenefit?: number
  // IUL-only
  projectedAccumulatedValue?: number
  projectedCashSurrenderValue?: number
  assumedRatePct?: number
  // Term-only
  termLengthYears?: number
  conversionYears?: number
  conversionToAge?: number
  /** The year-by-year ledger (current / non-guaranteed scenario). */
  rows: YearlyRow[]
  /** Human-readable notes about anything uncertain or not found. */
  warnings: string[]
}
