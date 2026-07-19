import { describe, expect, it } from 'vitest'
import { parseIllustration } from './parseIllustration'
import { applyIllustration } from './applyIllustration'
import { makeNewPresentation } from '@persistence/newPresentation'

// Representative lines from a real FlexLife IUL illustration (Male 63, $55,407,
// $250/mo). Includes a GUARANTEED row (no rate) that must be skipped, a
// lower-AV rate row for the same year (must NOT clobber the current value), the
// LIBR income figure, and the elected-riders line.
const IUL_TEXT = [
  'Jose L Lopes Da Graca Face Amount: $55,407 Indexed Universal Life',
  'State: Utah Initial Premium: $250.00 Monthly',
  'Male 63 Elite Non-Tobacco Death Benefit Option: A (Level) Riders: ABR, CMG, DBPR, LIBR, OPR, SAR, VAS',
  'FlexLife Accumulated Value',
  'Planned Annual Lifetime Income $3,166',
  '1 63 $3,000.00 $0 $0 $0 $1,255 $0 $55,407', // guaranteed (no %): ignored
  '1 63 $3,000.00 $0 $0 $0 6.84 % $1,711 $0 $55,407', // current: used
  '2 64 3,000.00 0 0 0 6.84 % 3,499 1,722 55,407',
  '2 64 3,000.00 0 0 0 3.50 % 3,100 1,400 55,407', // lower-AV alt scenario for yr 2: must not win
  '10 72 3,000.00 0 0 0 6.84 % 21,520 21,287 55,407',
  '15 77 2,996.00 0 0 0 6.84 % 44,281 44,281 55,407',
  '16 78 0.00 849 849 876 6.77 % 46,847 43,582 45,925', // income phase, premium stops
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

  it('reads the CURRENT ledger (never guaranteed/lower-AV) with no duplicate years', () => {
    const y1 = p.rows.filter((r) => r.policyYear === 1)
    expect(y1).toHaveLength(1)
    expect(y1[0]).toMatchObject({ age: 63, premiumPaid: 3000, accumulatedValue: 1711, cashSurrenderValue: 0 })
    // Year 2 had a lower-AV 3.50% row after the current row — current must win.
    expect(p.rows.find((r) => r.policyYear === 2)?.accumulatedValue).toBe(3499)
    expect(p.rows.find((r) => r.policyYear === 15)?.accumulatedValue).toBe(44_281)
  })

  it('extracts the retirement-income story (previously blank on slides)', () => {
    expect(p.incomeOptionAnnual).toBe(3166)
    expect(p.incomeToAge).toBe(78) // highest age in this fixture's ledger
    expect(p.paymentYears).toBe(15) // last premium-paying year
    expect(p.projectedAccumulatedValue).toBe(44_281)
  })

  it('applies onto a presentation (typed path; income + payment years populated)', () => {
    const applied = applyIllustration(p, makeNewPresentation({ productType: 'iul' }))
    expect(applied.iul.projectionSource).toBe('typed')
    expect(applied.iul.incomeOptionAnnual).toBe(3166)
    expect(applied.iul.incomeToAge).toBe(78)
    expect(applied.iul.paymentYears).toBe(15)
    expect(applied.iul.projectionYears).toBe(16) // max policy year, not row count
    expect(applied.client.name).toBe('Jose L Lopes Da Graca')
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
    expect(p.rows[0]).toMatchObject({ policyYear: 1, age: 39, premiumPaid: 858.48, deathBenefit: 600_000 })
    expect(p.rows[0].accumulatedValue).toBeUndefined()
  })
})

describe('parseIllustration — robustness (agent findings)', () => {
  it('reads Brazilian names with accents and lower-case particles', () => {
    const p = parseIllustration('Maria da Conceição Face Amount: $500,000 Indexed Universal Life\nFlexLife')!
    expect(p.client.name).toBe('Maria da Conceição')
  })

  it('does not capture a section label as the client name', () => {
    const p = parseIllustration('Total Initial Face Amount: $500,000 Indexed Universal Life\nFlexLife')!
    expect(p.client.name).toBeUndefined()
  })

  it('keeps demographics when the class has no tobacco suffix or is upper-case', () => {
    const a = parseIllustration('X Face Amount: $1 Indexed Universal Life FlexLife\nFemale 45 Standard Death Benefit Option: A')!
    expect(a.client).toMatchObject({ age: 45, sex: 'F' })
    expect(a.rateClass).toBe('Standard')
    const b = parseIllustration('X Face Amount: $1 FlexLife\nMALE 50 PREFERRED NON-TOBACCO Death Benefit Option: A')!
    expect(b.client).toMatchObject({ age: 50, sex: 'M' })
  })

  it('detects Term even when it mentions "Accumulated Value"', () => {
    const p = parseIllustration([
      'Face Amount: $600,000 Level Term',
      'This policy has no cash value and no Accumulated Value.',
      '1 39 $858.48 $600,000',
      '2 40 858.48 600,000',
    ].join('\n'))!
    expect(p.productType).toBe('term')
    expect(p.rows).toHaveLength(2)
  })

  it('parses a juvenile (issue age 0) ledger', () => {
    const p = parseIllustration([
      'Baby Doe Face Amount: $50,000 Indexed Universal Life FlexLife',
      'Male 0 Juvenile',
      '1 0 $1,000.00 $0 $0 $0 5.00 % $500 $0 $50,000',
      '2 1 1,000.00 0 0 0 5.00 % 1,100 0 50,000',
    ].join('\n'))!
    expect(p.rows).toHaveLength(2)
    expect(p.rows[0]).toMatchObject({ policyYear: 1, age: 0 })
  })

  it('handles junk input', () => {
    expect(parseIllustration('')).toBeNull()
    expect(parseIllustration('hello')).toBeNull()
  })
})
