import type {
  Branding,
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
    deathBenefit?: number
    livingBenefit?: number
    livingBenefitPercent?: number
    incomeOptionAnnual?: number
    incomeToAge?: number
    projectionYears?: number
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
  disclaimers: string[]
}
