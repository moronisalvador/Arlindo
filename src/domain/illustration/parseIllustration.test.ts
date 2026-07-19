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

// Mirrors the REAL Dave Miller Term 30-G format: the "if sooner" conversion
// phrasing, the annually-renewable premium ramp after year 30, and a trailing
// rate-class comparison table (extra premium columns) that must NOT overwrite the
// main schedule.
const DAVE_TERM = [
  'Term 30-G Term Life Insurance Form Series ICC18-20522',
  'Dave Miller Face Amount: $600,000',
  'Male 39 Elite Non-Tobacco Initial Premium: $71.54 Monthly (EFT) Riders: ABR State: Virginia',
  'The conversion period ends 20 years from the term policy date of issue or age 70 if sooner.',
  'This policy has no cash value.',
  '1 39 $858.48 $600,000',
  '30 68 858.48 600,000',
  '31 69 16,622.52 600,000', // annually-renewable ramp begins
  '56 94 318,393.48 600,000',
  // trailing rate-class comparison table (must not clobber year 30 above)
  '30 68 15,038.52 15,038.52 15,038.52 858.48 600,000',
].join('\n')

describe('parseIllustration — real Term format (Dave Miller)', () => {
  const p = parseIllustration(DAVE_TERM)!
  it('detects term + client + $600k/$71.54', () => {
    expect(p.productType).toBe('term')
    expect(p.client).toMatchObject({ name: 'Dave Miller', age: 39, sex: 'M' })
    expect(p.face).toBe(600_000)
    expect(p.premium).toBe(71.54)
    expect(p.premiumMode).toBe('monthly')
  })
  it('reads the conversion window from "ends 20 years... or age 70 if sooner"', () => {
    expect(p.conversionYears).toBe(20)
    expect(p.conversionToAge).toBe(70)
    expect(p.termLengthYears).toBe(30)
  })
  it('keeps the main premium schedule (level then ART ramp), not the rate-class table', () => {
    expect(p.rows.find((r) => r.policyYear === 30)?.premiumPaid).toBe(858.48) // not 15,038.52
    expect(p.rows.find((r) => r.policyYear === 31)?.premiumPaid).toBe(16_622.52)
    expect(p.rows.find((r) => r.policyYear === 56)?.premiumPaid).toBe(318_393.48)
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

  it('term ledger survives a trailing $0 cash-value column', () => {
    const p = parseIllustration([
      'Term 20-G Term Life Insurance',
      'Face Amount: $500,000',
      '1 45 $480.00 $500,000 $0',
      '2 46 480.00 500,000 0',
    ].join('\n'))!
    expect(p.rows).toHaveLength(2)
    expect(p.rows[0]).toMatchObject({ premiumPaid: 480, deathBenefit: 500_000 })
  })

  it('picks the main schedule over a comparison table printed first', () => {
    const p = parseIllustration([
      'Term 30-G Face Amount: $500,000',
      '1 45 300 400 480 600 500,000', // rate-class comparison (5 premiums) FIRST
      '1 45 480 500,000', // main schedule (2 cols) after
    ].join('\n'))!
    expect(p.rows.find((r) => r.policyYear === 1)?.premiumPaid).toBe(480)
  })

  it('does not misclassify an IUL that mentions "level term"', () => {
    const p = parseIllustration([
      'FlexLife Indexed Universal Life',
      'Compared to level term insurance, this policy builds Accumulated Value.',
      '1 40 $3,000.00 $0 $0 $0 6.00 % $2,500 $0 $250,000',
    ].join('\n'))!
    expect(p.productType).toBe('iul')
    expect(p.rows).toHaveLength(1)
  })

  it('detects Term 15-NG and reads its term length', () => {
    const p = parseIllustration([
      'Term 15-NG Term Life Insurance',
      'Face Amount: $250,000',
      '1 50 $600.00 $250,000',
    ].join('\n'))!
    expect(p.productType).toBe('term')
    expect(p.termLengthYears).toBe(15)
  })

  it('does not coerce Semi-Annual premium to annual', () => {
    const p = parseIllustration('X Face Amount: $1 FlexLife\nInitial Premium: $500.00 Semi-Annual\nMale 40 Standard')!
    expect(p.premiumMode).toBeUndefined()
    expect(p.warnings.some((w) => /frequência/i.test(w))).toBe(true)
  })

  it('self-corrects classification from the ledger structure (ground truth)', () => {
    // Text weakly implies IUL, but the ledger is term-structured (no %) → switch to term.
    const asTerm = parseIllustration([
      'Indexed Universal Life Face Amount: $500,000',
      '1 45 $480.00 $500,000',
      '2 46 480.00 500,000',
    ].join('\n'))!
    expect(asTerm.productType).toBe('term')
    expect(asTerm.rows).toHaveLength(2)
    expect(asTerm.warnings.some((w) => /ajustado/i.test(w))).toBe(true)

    // Text weakly implies term, but the ledger has interest-rate rows → switch to IUL.
    const asIul = parseIllustration([
      'This policy has no cash value comparison note. Face Amount: $250,000',
      '1 40 $3,000.00 $0 $0 $0 6.00 % $2,500 $0 $250,000',
      '2 41 3,000.00 0 0 0 6.00 % 5,200 0 250,000',
    ].join('\n'))!
    expect(asIul.productType).toBe('iul')
    expect(asIul.rows).toHaveLength(2)
  })

  it('extracts the real ABR value and the guaranteed floor (IUL)', () => {
    const p = parseIllustration([
      'FlexLife Indexed Universal Life Face Amount: $55,407',
      'Terminal Illness Benefit: $44,401 Lump Sum',
      '15 77 2,996.00 0 0 0 12,000 12,000 55,407', // guaranteed (no %): floor at yr 15
      '15 77 2,996.00 0 0 0 6.84 % 44,281 44,281 55,407', // current
    ].join('\n'))!
    expect(p.productType).toBe('iul')
    expect(p.livingBenefit).toBe(44_401) // real Terminal Illness value, not DB×%
    expect(p.paymentYears).toBe(15)
    expect(p.guaranteedValue).toBe(12_000) // guaranteed AV at the payment-end year
  })

  it('handles junk input', () => {
    expect(parseIllustration('')).toBeNull()
    expect(parseIllustration('hello')).toBeNull()
  })
})
