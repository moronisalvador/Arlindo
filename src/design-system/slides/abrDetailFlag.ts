import type { DerivedPresentation } from '@domain/model/derived'

/**
 * EXPERIMENT (2026-07-19): per-condition living-benefits detail slide, on both
 * the IUL and Term decks (screen, PDF, and .pptx). Reversible — set this to
 * `false` to remove it from every presentation everywhere, or revert the PR.
 * The slide only appears when the illustration actually printed per-condition
 * ABR values (`derived.abrBenefits`).
 */
export const SHOW_LIVING_BENEFITS_DETAIL = true

/** True when the flag is on AND the illustration carried a per-condition ABR value. */
export function hasAbrDetail(d: DerivedPresentation): boolean {
  const a = d.abrBenefits
  return (
    SHOW_LIVING_BENEFITS_DETAIL &&
    a != null &&
    (a.terminal != null ||
      a.chronicMonthly != null ||
      a.critical != null ||
      a.criticalInjury != null ||
      a.alzheimer != null)
  )
}
