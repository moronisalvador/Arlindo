import type { PresentationInputs } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import type { CalculationEngine } from './CalculationEngine'
import { PassthroughEngine } from './PassthroughEngine'

export type { CalculationEngine } from './CalculationEngine'
export { PassthroughEngine } from './PassthroughEngine'

const passthrough = new PassthroughEngine()

/**
 * Selects the engine for a presentation. Today everything is passthrough (the
 * salesman types illustration numbers). When app-computed projections land,
 * this factory returns the real engine for `productType` — call sites unchanged.
 */
export function selectEngine(_inputs: PresentationInputs): CalculationEngine {
  return passthrough
}

export function derive(inputs: PresentationInputs): DerivedPresentation {
  return selectEngine(inputs).compute(inputs)
}
