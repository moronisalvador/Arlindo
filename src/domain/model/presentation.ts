import { z } from 'zod'

/**
 * The single source of truth for a presentation's INPUT data.
 * The zod schema validates data-entry, persistence, and JSON import; the TS
 * types are inferred from it. The presentation renderer never reads this shape
 * directly — it reads a `DerivedPresentation` produced by a `CalculationEngine`.
 *
 * Fields are intentionally lenient (optional / defaulted) so drafts autosave
 * mid-edit; `isPresentable()` gates whether there's enough to present.
 */

export const CURRENT_SCHEMA_VERSION = 1

export const currencyCodeSchema = z.enum(['USD', 'BRL'])
export type CurrencyCode = z.infer<typeof currencyCodeSchema>

export const productTypeSchema = z.enum(['iul', 'term', 'annuity'])
export type ProductType = z.infer<typeof productTypeSchema>

/** Agent / company / carrier branding. Lives in Foundation; slides render it. */
export const brandingSchema = z.object({
  agentName: z.string().default(''),
  agentTitle: z.string().default('Agente Financeiro Licenciado'),
  agentLicense: z.string().default(''),
  company: z.string().default('Second Chance Financial'),
  carrier: z.string().default('National Life Group'),
})
export type Branding = z.infer<typeof brandingSchema>

export const clientSchema = z.object({
  name: z.string().default(''),
  age: z.number().int().min(0).max(120).optional(),
  sex: z.enum(['M', 'F']).optional(),
  notes: z.string().optional(),
})
export type Client = z.infer<typeof clientSchema>

/**
 * A living-benefit rider. Modifiable per the user's request: each can be
 * toggled, its accessible living-benefit percentage set (standard riders access
 * up to 80%; the Premium Chronic Care rider up to 100%), and flagged as
 * additional-cost.
 */
export const riderSchema = z.object({
  id: z.string(),
  label: z.string(),
  englishLabel: z.string().optional(),
  included: z.boolean().default(true),
  percent: z.number().min(0).max(100).default(80),
  additionalCost: z.boolean().default(false),
  category: z.enum(['included', 'iul_exclusive', 'optional']).default('included'),
  /** Lifetime maximum accelerated amount (USD), when the rider has a dollar cap. */
  lifetimeMax: z.number().optional(),
  note: z.string().optional(),
})
export type Rider = z.infer<typeof riderSchema>

/** One row copied off the carrier illustration (all amounts in displayCurrency). */
export const yearlyRowSchema = z.object({
  policyYear: z.number().int(),
  age: z.number().int().optional(),
  premiumPaid: z.number().optional(),
  accumulatedValue: z.number().optional(),
  cashSurrenderValue: z.number().optional(),
  deathBenefit: z.number().optional(),
})
export type YearlyRow = z.infer<typeof yearlyRowSchema>

/** IUL-specific fields (present when productType === 'iul'). */
export const iulSchema = z.object({
  premium: z.number().nonnegative().optional(),
  premiumMode: z.enum(['monthly', 'annual']).default('monthly'),
  deathBenefit: z.number().nonnegative().optional(),
  livingBenefit: z.number().nonnegative().optional(),
  livingBenefitPercent: z.number().min(0).max(100).default(80),
  assumedRatePct: z.number().optional(),
  /** How many years the client pays the deposit (shown on the coverage slide). */
  paymentYears: z.number().int().positive().optional(),
  projectionYears: z.number().int().positive().optional(),
  projectedAccumulatedValue: z.number().optional(),
  /** Cash surrender value at the projection year — what the client actually gets on withdrawal. */
  projectedCashSurrenderValue: z.number().optional(),
  incomeOptionAnnual: z.number().optional(),
  incomeToAge: z.number().int().optional(),
  riders: z.array(riderSchema).default([]),
  /**
   * 'typed' = use the numbers the agent typed off the carrier illustration
   * (PassthroughEngine). 'estimate' = let the app compute an approximate
   * projection (IulProjectionEngine). Default 'typed' (the official illustration
   * is authoritative).
   */
  projectionSource: z.enum(['typed', 'estimate']).default('typed'),
})
export type IulInputs = z.infer<typeof iulSchema>

/**
 * Term-life fields (present when productType === 'term'). Term has NO cash value,
 * no accumulation, and no estimator — the ledger is Policy Year · Age · Guaranteed
 * Premium · Guaranteed Death Benefit only. The level-premium schedule reuses the
 * top-level `yearlyRows` (policyYear/age/premiumPaid/deathBenefit; accumulated/CSV
 * stay empty). See docs/knowledge/national-life-term.md.
 */
export const termSchema = z.object({
  premium: z.number().nonnegative().optional(),
  premiumMode: z.enum(['monthly', 'annual']).default('monthly'),
  deathBenefit: z.number().nonnegative().optional(),
  /** Level-premium period in years (10 / 15 / 20 / 30); the Guaranteed Series. */
  termLengthYears: z.number().int().positive().optional(),
  /**
   * Living benefit via the no-cost ABR suite. Term pays a DISCOUNTED, per-condition
   * amount (not a flat %); percent is optional and, when shown, must be framed as
   * "up to … (discounted)". Kept for the rare illustration that prints a figure.
   */
  livingBenefit: z.number().nonnegative().optional(),
  livingBenefitPercent: z.number().min(0).max(100).optional(),
  /** Conversion privilege window: first N years from issue, or to a given age if earlier. */
  conversionYears: z.number().int().positive().optional(),
  conversionToAge: z.number().int().positive().optional(),
  riders: z.array(riderSchema).default([]),
})
export type TermInputs = z.infer<typeof termSchema>

/** Annuity fields — reserved for a later wave; not built in the first release. */
export const annuitySchema = z
  .object({
    initialInvestment: z.number().optional(),
    bonusPercent: z.number().optional(),
    glirAnnual: z.number().optional(),
  })
  .partial()
export type AnnuityInputs = z.infer<typeof annuitySchema>

export const presentationInputsSchema = z.object({
  schemaVersion: z.number().int().default(CURRENT_SCHEMA_VERSION),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  productType: productTypeSchema.default('iul'),
  /** NLG product id from the product registry (@domain/model/products), e.g. 'flexlife'. */
  productId: z.string().default('flexlife'),
  title: z.string().default(''),
  /** Language the client-facing presentation (slides/PDF/PPTX) is generated in. */
  presentationLanguage: z.enum(['pt', 'en', 'es']).default('pt'),
  displayCurrency: currencyCodeSchema.default('USD'),
  branding: brandingSchema.default({}),
  client: clientSchema.default({}),
  iul: iulSchema.default({}),
  term: termSchema.default({}),
  annuity: annuitySchema.optional(),
  yearlyRows: z.array(yearlyRowSchema).default([]),
  highlightYears: z.array(z.number().int()).default([]),
  disclaimers: z.array(z.string()).default([]),
})
export type PresentationInputs = z.infer<typeof presentationInputsSchema>

/** Enough data to actually present? (keeps the "Present" button honest) */
export function isPresentable(p: PresentationInputs): boolean {
  const hasClient = p.client.name.trim().length > 0
  if (p.productType === 'iul') {
    const iul = p.iul
    const hasNumbers =
      iul.deathBenefit != null ||
      iul.projectedAccumulatedValue != null ||
      p.yearlyRows.length > 0
    return hasClient && hasNumbers
  }
  if (p.productType === 'term') {
    const hasNumbers = p.term.deathBenefit != null || p.yearlyRows.length > 0
    return hasClient && hasNumbers
  }
  return hasClient
}
