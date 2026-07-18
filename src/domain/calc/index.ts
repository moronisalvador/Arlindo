import type { PresentationInputs } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import type { CalculationEngine } from './CalculationEngine'
import { PassthroughEngine } from './PassthroughEngine'
import { IulProjectionEngine } from './IulProjectionEngine'

export type { CalculationEngine } from './CalculationEngine'
export { PassthroughEngine } from './PassthroughEngine'
export { IulProjectionEngine } from './IulProjectionEngine'

const passthrough = new PassthroughEngine()
const iulEngine = new IulProjectionEngine()

/**
 * Selects the engine for a presentation. Default is passthrough (the agent typed
 * the official illustration numbers). When the agent opts into the app-computed
 * estimate (`iul.projectionSource === 'estimate'`), the approximate
 * `IulProjectionEngine` runs instead — call sites (derive) are unchanged.
 */
export function selectEngine(inputs: PresentationInputs): CalculationEngine {
  if (inputs.productType === 'iul' && inputs.iul.projectionSource === 'estimate') {
    return iulEngine
  }
  return passthrough
}

export function derive(inputs: PresentationInputs): DerivedPresentation {
  return selectEngine(inputs).compute(inputs)
}
