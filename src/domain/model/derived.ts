import type {
  AbrBenefits,
  Branding,
  CoverageOption,
  CurrencyCode,
  ProductType,
  Rider,
  YearlyRow,
} from './presentation'

/**
 * What the presentation renderer reads. Produced by a `CalculationEngine`.
 * Today `PassthroughEngine` reshapes typed numbers into this; later an
 * `IulProjectionEngine` will compute it from assumptions — slides never change.
 */
export interface DerivedPresentation {
  meta: {
    productType: ProductType
    clientName: string
    clientAge?: number
    productName: string
    branding: Branding
    currency: CurrencyCode
    language: 'pt' | 'en' | 'es'
    preparedOn: string
    generatedBy: 'passthrough' | 'iul-engine' | 'annuity-engine'
    engineVersion: string
  }
  headline: {
    premium?: number
    premiumMode?: 'monthly' | 'annual'
    paymentYears?: number
    totalPremiumsPaid?: number
    projectedAccumulatedValue?: number
    projectedCashSurrenderValue?: number
    guaranteedProjectedValue?: number
    deathBenefit?: number
    livingBenefit?: number
    livingBenefitPercent?: number
    incomeOptionAnnual?: number
    incomeToAge?: number
    projectionYears?: number
    /** Term only: level-premium period (years) and conversion-privilege window. */
    termLengthYears?: number
    conversionYears?: number
    conversionToAge?: number
  }
  series: {
    policyYears: number[]
    ages?: number[]
    accumulatedValue?: number[]
    cashSurrenderValue?: number[]
    deathBenefit?: number[]
    premiumPaid?: number[]
  }
  table: YearlyRow[]
  riders: Rider[]
  /** Optional 2-3 coverage tiers to compare side-by-side; only rendered when there are 2+. */
  coverageOptions?: CoverageOption[]
  /** Id (within coverageOptions) of the tier the rest of the deck deep-dives on. */
  recommendedOptionId?: string
  /** Per-condition ABR values from the illustration (product-agnostic; optional). */
  abrBenefits?: AbrBenefits
  disclaimers: string[]
}
