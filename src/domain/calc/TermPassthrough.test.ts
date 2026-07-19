import { describe, expect, it } from 'vitest'
import { sampleTermPresentation } from '@domain/model/sample'
import { buildSlides } from '@design-system/slides/buildSlides'
import { PassthroughEngine } from './PassthroughEngine'
import { derive } from './index'

describe('PassthroughEngine — term', () => {
  const engine = new PassthroughEngine()

  it('reshapes term inputs into a derived presentation (no cash value)', () => {
    const derived = engine.compute(sampleTermPresentation())
    expect(derived.meta.productType).toBe('term')
    expect(derived.meta.generatedBy).toBe('passthrough')
    expect(derived.headline.deathBenefit).toBe(600_000)
    expect(derived.headline.termLengthYears).toBe(30)
    expect(derived.headline.conversionYears).toBe(20)
    expect(derived.headline.conversionToAge).toBe(70)
    // Term has NO accumulated value / cash surrender value.
    expect(derived.series.accumulatedValue).toBeUndefined()
    expect(derived.series.cashSurrenderValue).toBeUndefined()
    expect(derived.headline.projectedAccumulatedValue).toBeUndefined()
    // But it does carry the premium + death-benefit series.
    expect(derived.series.policyYears).toHaveLength(30)
    expect(derived.series.deathBenefit).toHaveLength(30)
  })

  it('sums the level premiums for the headline total', () => {
    const derived = engine.compute(sampleTermPresentation())
    // 30 years * 71.54 * 12
    expect(derived.headline.totalPremiumsPaid).toBeCloseTo(71.54 * 12 * 30, 1)
  })

  it('never routes term through the estimator (always passthrough)', () => {
    const derived = derive(sampleTermPresentation())
    expect(derived.meta.generatedBy).toBe('passthrough')
  })

  it('includes the term ABR suite but no IUL-only riders', () => {
    const derived = engine.compute(sampleTermPresentation())
    const ids = derived.riders.map((r) => r.id)
    expect(ids).toContain('terminal_illness')
    expect(ids).toContain('critical_injury')
    // IUL-only riders must not appear on term.
    expect(ids).not.toContain('value_added_services')
    expect(ids).not.toContain('premium_chronic_care')
  })

  it('builds a term deck without IUL-only slides', () => {
    const slides = buildSlides(derive(sampleTermPresentation()))
    const ids = slides.map((s) => s.id)
    expect(ids).toContain('cover')
    expect(ids).toContain('coverage')
    expect(ids).toContain('schedule')
    expect(ids).toContain('comparison')
    expect(ids).toContain('disclaimers')
    // No IUL projection / accumulated-value table / withdraw-vs-income.
    expect(ids).not.toContain('projection')
    expect(ids).not.toContain('options')
    expect(ids).not.toContain('explainer')
  })
})
