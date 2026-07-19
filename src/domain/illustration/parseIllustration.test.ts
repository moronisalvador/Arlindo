import { describe, expect, it } from 'vitest'
import { parseIllustration } from './parseIllustration'
import { applyIllustration } from './applyIllustration'
import { makeNewPresentation } from '@persistence/newPresentation'

// Representative lines from a real FlexLife IUL illustration (Male 63, $55,407,
// $250/mo). Includes a GUARANTEED row (no interest-rate column) that must be
// skipped in favour of the Current-scenario row for the same year.
const IUL_TEXT = [
  'Jose L Lopes Da Graca Face Amount: $55,407 Indexed Universal Life',
  'State: Utah Initial Premium: $250.00 Monthly LIBR, OPR, SAR, VAS',
  'Male 63 Elite Non-Tobacco Death Benefit Option: A (Level)',
  'FlexLife Accumulated Value',
  // guaranteed (no %): must be ignored
  '1 63 $3,000.00 $0 $0 $0 $1,255 $0 $55,407',
  // current scenario (has a rate): used
  '1 63 $3,000.00 $0 $0 $0 6.84 % $1,711 $0 $55,407',
  '2 64 3,000.00 0 0 0 6.84 % 3,499 1,722 55,407',
  '10 72 3,000.00 0 0 0 6.84 % 21,520 21,287 55,407',
  '15 77 2,996.00 0 0 0 6.84 % 44,281 44,281 55,407',
  '16 78 0.00 849 849 876 6.77 % 46,847 43,582 45,925',
].join('\n')

const TERM_TEXT = [
  'Cliente Exemplo Face Amount: $600,000 Level Term',
  'State: Virginia Initial Premium: $71.54 Monthly',
  'Male 39 Elite Non-Tobacco',
  'This policy has no cash value. Premiums are level for the first 30 years and',
  'annually renewable to age 95. Convertible during the first 20 years from the',
  'date of issue or until age 70 if earlier.',
  '1 39 $858.48 $600,000',
  '2 40 858.48 600,000',
  '30 68 858.48 600,000',
].join('\n')

describe('parseIllustration — IUL', () => {
  const p = parseIllustration(IUL_TEXT)!

  it('detects product, client, and summary fields', () => {
    expect(p.productType).toBe('iul')
    expect(p.confidence).toBe('high')
    expect(p.client).toMatchObject({ name: 'Jose L Lopes Da Graca', age: 63, sex: 'M' })
    expect(p.rateClass).toBe('Elite Non-Tobacco')
    expect(p.state).toBe('Utah')
    expect(p.face).toBe(55_407)
    expect(p.premium).toBe(250)
    expect(p.premiumMode).toBe('monthly')
    expect(p.deathBenefit).toBe(55_407)
    expect(p.assumedRatePct).toBe(6.84)
  })

  it('reads the CURRENT ledger (not guaranteed) with no duplicate years', () => {
    const y1 = p.rows.filter((r) => r.policyYear === 1)
    expect(y1).toHaveLength(1)
    expect(y1[0]).toMatchObject({ age: 63, premiumPaid: 3000, accumulatedValue: 1711, cashSurrenderValue: 0, deathBenefit: 55_407 })
    expect(p.rows.find((r) => r.policyYear === 15)?.accumulatedValue).toBe(44_281)
  })

  it('projects the peak accumulated value before the income phase', () => {
    expect(p.projectedAccumulatedValue).toBe(44_281) // year 15, last premium-paying year
  })

  it('applies onto a presentation via the typed path', () => {
    const applied = applyIllustration(p, makeNewPresentation({ productType: 'iul' }))
    expect(applied.productType).toBe('iul')
    expect(applied.iul.projectionSource).toBe('typed')
    expect(applied.iul.deathBenefit).toBe(55_407)
    expect(applied.client.name).toBe('Jose L Lopes Da Graca')
    expect(applied.yearlyRows.length).toBe(p.rows.length)
  })
})

describe('parseIllustration — Term', () => {
  const p = parseIllustration(TERM_TEXT)!

  it('detects term, summary, and conversion window', () => {
    expect(p.productType).toBe('term')
    expect(p.client).toMatchObject({ age: 39, sex: 'M' })
    expect(p.face).toBe(600_000)
    expect(p.premium).toBe(71.54)
    expect(p.premiumMode).toBe('monthly')
    expect(p.termLengthYears).toBe(30)
    expect(p.conversionYears).toBe(20)
    expect(p.conversionToAge).toBe(70)
  })

  it('reads the premium/death-benefit schedule (no cash value)', () => {
    expect(p.rows).toHaveLength(3)
    const r = p.rows[0]
    expect(r).toMatchObject({ policyYear: 1, age: 39, premiumPaid: 858.48, deathBenefit: 600_000 })
    expect(r.accumulatedValue).toBeUndefined()
  })

  it('applies onto a term presentation', () => {
    const applied = applyIllustration(p, makeNewPresentation({ productType: 'iul' }))
    expect(applied.productType).toBe('term')
    expect(applied.term.deathBenefit).toBe(600_000)
    expect(applied.term.termLengthYears).toBe(30)
    expect(applied.yearlyRows).toHaveLength(3)
  })
})

describe('parseIllustration — junk input', () => {
  it('returns null for empty/too-short text', () => {
    expect(parseIllustration('')).toBeNull()
    expect(parseIllustration('hello')).toBeNull()
  })
})
