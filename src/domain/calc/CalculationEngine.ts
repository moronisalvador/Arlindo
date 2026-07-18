import type { PresentationInputs } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'

/**
 * The swappable calculation seam. Today the only implementation is
 * `PassthroughEngine` (reshapes the numbers the salesman typed off the carrier
 * illustration). Later `IulProjectionEngine` / `AnnuityEngine` will COMPUTE the
 * same `DerivedPresentation` from a few assumptions — the presentation layer,
 * which only reads `DerivedPresentation`, will not change.
 */
export interface CalculationEngine {
  readonly id: 'passthrough' | 'iul-engine' | 'annuity-engine'
  readonly version: string
  compute(inputs: PresentationInputs): DerivedPresentation
}
