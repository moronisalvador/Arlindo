import type { ProductType, Rider } from './presentation'
import { DEFAULT_IUL_RIDERS, DEFAULT_TERM_RIDERS } from './riders'

/**
 * National Life Group IUL product registry. FlexLife is live now; the other four
 * are defined and ready to enable (`available: true`) — adding a product is a
 * config addition here, not a code change elsewhere.
 *
 * Only GUARANTEED, verified facts are encoded (min face, guaranteed min rate,
 * carrier, positioning). Current caps / participation / bonus rates are
 * rate-sheet-driven and deliberately NOT stored.
 */
export type ProductFocus = 'accumulation' | 'protection' | 'survivorship' | 'term'

export interface ProductDefinition {
  id: string
  name: string
  /** Product family. Omitted = 'iul' (the original registry was IUL-only). */
  productType?: ProductType
  /** Issuing carrier(s): National Life (NL), LSW, or both. */
  carrier: 'NL' | 'LSW' | 'NL / LSW'
  focus: ProductFocus
  minFace: number
  /** Guaranteed min crediting rate (IUL). Term has no cash value → omitted. */
  guaranteedMinRatePct?: number
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
  {
    id: 'term',
    name: 'Term (Guaranteed Series)',
    productType: 'term',
    carrier: 'NL / LSW',
    focus: 'term',
    minFace: 100_000,
    positioning:
      'Seguro temporário de prêmio nivelado garantido (10/15/20/30 anos) — maior proteção por menor custo, com benefícios em vida sem custo. Apenas clientes nos EUA.',
    available: true,
  },
]

const DEFAULT_PRODUCT_ID = 'flexlife'

export function getProduct(id: string | undefined): ProductDefinition {
  return NLG_PRODUCTS.find((p) => p.id === id) ?? NLG_PRODUCTS[0]
}

/** A product's family, defaulting to 'iul' for the original IUL-only registry. */
export function productTypeOf(id: string | undefined): ProductType {
  return getProduct(id).productType ?? 'iul'
}

export function availableProducts(): ProductDefinition[] {
  return NLG_PRODUCTS.filter((p) => p.available)
}

/**
 * Default rider suite for a product: the term ABR suite for term products, the IUL
 * ABR suite otherwise. All NLG IULs share one suite today.
 */
export function defaultRidersForProduct(id: string = DEFAULT_PRODUCT_ID): Rider[] {
  const suite = productTypeOf(id) === 'term' ? DEFAULT_TERM_RIDERS : DEFAULT_IUL_RIDERS
  return suite.map((r) => ({ ...r }))
}
