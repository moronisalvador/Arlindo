import { describe, expect, it } from 'vitest'
import { sampleIulPresentation } from '@domain/model/sample'
import { PassthroughEngine } from './PassthroughEngine'

describe('PassthroughEngine', () => {
  const engine = new PassthroughEngine()

  it('reshapes typed inputs into a derived presentation', () => {
    const derived = engine.compute(sampleIulPresentation())
    expect(derived.meta.clientName).toBe('Iracema')
    expect(derived.meta.generatedBy).toBe('passthrough')
    expect(derived.headline.deathBenefit).toBe(80_000)
    expect(derived.headline.projectedAccumulatedValue).toBe(51_681)
    expect(derived.series.policyYears).toHaveLength(20)
    expect(derived.series.accumulatedValue).toHaveLength(20)
  })

  it('only includes riders marked included', () => {
    const derived = engine.compute(sampleIulPresentation())
    expect(derived.riders.length).toBeGreaterThan(0)
    expect(derived.riders.every((r) => r.included)).toBe(true)
  })

  it('sums typed yearly premiums for the headline total', () => {
    const derived = engine.compute(sampleIulPresentation())
    // 20 years * 250 * 12
    expect(derived.headline.totalPremiumsPaid).toBe(60_000)
  })
})
