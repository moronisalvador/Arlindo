import type { Rider } from './presentation'
import { DEFAULT_IUL_RIDERS } from './riders'

/**
 * National Life Group IUL product registry. FlexLife is live now; the other four
 * are defined and ready to enable (`available: true`) — adding a product is a
 * config addition here, not a code change elsewhere.
 *
 * Only GUARANTEED, verified facts are encoded (min face, guaranteed min rate,
 * carrier, positioning). Current caps / participation / bonus rates are
 * rate-sheet-driven and deliberately NOT stored.
 */
export type ProductFocus = 'accumulation' | 'protection' | 'survivorship'

export interface ProductDefinition {
  id: string
  name: string
  /** Issuing carrier(s): National Life (NL), LSW, or both. */
  carrier: 'NL' | 'LSW' | 'NL / LSW'
  focus: ProductFocus
  minFace: number
  guaranteedMinRatePct: number
  /** pt-BR one-liner shown when picking a product. */
  positioning: string
  /** Whether the app currently supports building with this product. */
  available: boolean
}

export const NLG_PRODUCTS: ProductDefinition[] = [
  {
    id: 'flexlife',
    name: 'FlexLife',
    carrier: 'NL / LSW',
    focus: 'accumulation',
    minFace: 50_000,
    guaranteedMinRatePct: 1.75,
    positioning:
      'IUL de acumulação e proteção flexível — crescimento do valor acumulado + renda futura (LIBR).',
    available: true,
  },
  {
    id: 'peaklife',
    name: 'PeakLife',
    carrier: 'NL',
    focus: 'accumulation',
    minFace: 1_000_000,
    guaranteedMinRatePct: 1,
    positioning: 'IUL para alto patrimônio (face ≥ US$ 1 mi) — acumulação e financiamento de prêmio.',
    available: false,
  },
  {
    id: 'summitlife',
    name: 'SummitLife',
    carrier: 'LSW',
    focus: 'accumulation',
    minFace: 1_000_000,
    guaranteedMinRatePct: 1,
    positioning: 'IUL para alto patrimônio (face ≥ US$ 1 mi) — preservar e amplificar patrimônio.',
    available: false,
  },
  {
    id: 'rapidprotect',
    name: 'RapidProtect',
    carrier: 'NL / LSW',
    focus: 'protection',
    minFace: 50_000,
    guaranteedMinRatePct: 2,
    positioning: 'IUL de proteção com emissão simplificada (sem exame) — foco no benefício por morte.',
    available: false,
  },
  {
    id: 'survivorlife',
    name: 'SurvivorLife',
    carrier: 'NL / LSW',
    focus: 'survivorship',
    minFace: 250_000,
    guaranteedMinRatePct: 1,
    positioning: 'IUL de segunda morte (dois segurados) — planejamento sucessório e transferência.',
    available: false,
  },
]

const DEFAULT_PRODUCT_ID = 'flexlife'

export function getProduct(id: string | undefined): ProductDefinition {
  return NLG_PRODUCTS.find((p) => p.id === id) ?? NLG_PRODUCTS[0]
}

export function availableProducts(): ProductDefinition[] {
  return NLG_PRODUCTS.filter((p) => p.available)
}

/** Default rider suite for a product. All NLG IULs share the ABR suite today. */
export function defaultRidersForProduct(_id: string = DEFAULT_PRODUCT_ID): Rider[] {
  return DEFAULT_IUL_RIDERS.map((r) => ({ ...r }))
}
