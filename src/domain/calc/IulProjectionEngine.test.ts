import { describe, expect, it } from 'vitest'
import { presentationInputsSchema, type PresentationInputs } from '@domain/model/presentation'
import { IulProjectionEngine } from './IulProjectionEngine'
import { derive } from './index'

function baseInputs(
  overrides: Partial<PresentationInputs['iul']> = {},
  clientAge = 30,
): PresentationInputs {
  return presentationInputsSchema.parse({
    id: 'x',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    productType: 'iul',
    productId: 'flexlife',
    client: { name: 'Teste', age: clientAge },
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

  it('clamps the assumed rate to the AG 49-B ceiling (no runaway returns)', () => {
    const ceiling = engine.compute(baseInputs({ assumedRatePct: 6.4 }))
    const absurd = engine.compute(baseInputs({ assumedRatePct: 50 }))
    const c = ceiling.headline.projectedAccumulatedValue ?? 0
    const b = absurd.headline.projectedAccumulatedValue ?? 0
    // A 50% input illustrates no more than the clamped 6.4% ceiling run.
    expect(b).toBe(c)
  })

  it('projects LIBR income only when exercise is realistic (>=10y in force, age 60-85 at end)', () => {
    // age 55 + 20y => attained age 74 at the projection end: eligible.
    const eligible = engine.compute(baseInputs({ projectionYears: 20 }, 55))
    expect(eligible.headline.incomeOptionAnnual ?? 0).toBeGreaterThan(0)
    // age 30 + 20y => attained age 49: too young to exercise LIBR → no income.
    const tooYoung = engine.compute(baseInputs({ projectionYears: 20 }, 30))
    expect(tooYoung.headline.incomeOptionAnnual == null).toBe(true)
    // in force < 10y → no income even in the age band.
    const tooShort = engine.compute(baseInputs({ projectionYears: 5 }, 62))
    expect(tooShort.headline.incomeOptionAnnual == null).toBe(true)
  })

  it('derive() routes to the estimate engine only when projectionSource=estimate', () => {
    expect(derive(baseInputs({ projectionSource: 'estimate' })).meta.generatedBy).toBe('iul-engine')
    expect(derive(baseInputs({ projectionSource: 'typed' })).meta.generatedBy).toBe('passthrough')
  })
})
