import { describe, expect, it } from 'vitest'
import { presentationInputsSchema, type PresentationInputs } from '@domain/model/presentation'
import { IulProjectionEngine } from './IulProjectionEngine'
import { derive } from './index'

function baseInputs(overrides: Partial<PresentationInputs['iul']> = {}): PresentationInputs {
  return presentationInputsSchema.parse({
    id: 'x',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    productType: 'iul',
    productId: 'flexlife',
    client: { name: 'Teste', age: 30 },
    iul: {
      premium: 250,
      premiumMode: 'monthly',
      deathBenefit: 80_000,
      projectionYears: 20,
      assumedRatePct: 6,
      projectionSource: 'estimate',
      ...overrides,
    },
  })
}

describe('IulProjectionEngine', () => {
  const engine = new IulProjectionEngine()

  it('produces a year-by-year estimate that grows and is labeled', () => {
    const d = engine.compute(baseInputs())
    expect(d.meta.generatedBy).toBe('iul-engine')
    expect(d.table).toHaveLength(20)
    const values = d.series.accumulatedValue ?? []
    expect(values.length).toBe(20)
    // Accumulation should end higher than it starts.
    expect(values[19]).toBeGreaterThan(values[0])
    // Self-labels as an estimate for slides/PDF/PPTX.
    expect(d.disclaimers[0].toLowerCase()).toContain('estimativa')
  })

  it('clamps the assumed rate to the AG49-A-style ceiling (no runaway returns)', () => {
    const sane = engine.compute(baseInputs({ assumedRatePct: 6.5 }))
    const absurd = engine.compute(baseInputs({ assumedRatePct: 50 }))
    const a = sane.headline.projectedAccumulatedValue ?? 0
    const b = absurd.headline.projectedAccumulatedValue ?? 0
    // A 50% input must not illustrate more than the clamped 6.5% run.
    expect(b).toBeLessThanOrEqual(a)
  })

  it('derive() routes to the estimate engine only when projectionSource=estimate', () => {
    expect(derive(baseInputs({ projectionSource: 'estimate' })).meta.generatedBy).toBe('iul-engine')
    expect(derive(baseInputs({ projectionSource: 'typed' })).meta.generatedBy).toBe('passthrough')
  })
})
