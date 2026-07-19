import { describe, expect, it } from 'vitest'
import { presentationInputsSchema, type PresentationInputs } from '@domain/model/presentation'
import { IulProjectionEngine } from './IulProjectionEngine'

/**
 * CALIBRATION REGRESSION GUARD — asserts the estimate engine still tracks a real
 * FlexLife illustration within a tight band (so a coefficient change that breaks
 * the fit fails CI). Source: a real LSW FlexLife illustration, Male 63 Elite
 * Non-Tobacco, Utah, Face $55,407, $250/mo, DB Option A, Current 6.84% weighted
 * avg (incl. the AV Enhancement bonus from yr 2). Structural numbers only — no
 * client identity. See docs/knowledge/calibration-2026-07-19.md.
 */

// Real CURRENT (non-guaranteed) accumulation ledger, years 1–15 (before income).
const REAL: Array<{ yr: number; age: number; premium: number; av: number; csv: number }> = [
  { yr: 1, age: 63, premium: 3000, av: 1711, csv: 0 },
  { yr: 2, age: 64, premium: 3000, av: 3499, csv: 1722 },
  { yr: 3, age: 65, premium: 3000, av: 5373, csv: 3692 },
  { yr: 4, age: 66, premium: 3000, av: 7341, csv: 5759 },
  { yr: 5, age: 67, premium: 3000, av: 9399, csv: 7920 },
  { yr: 6, age: 68, premium: 3000, av: 11567, csv: 10522 },
  { yr: 7, age: 69, premium: 3000, av: 13852, csv: 12995 },
  { yr: 8, age: 70, premium: 3000, av: 16260, csv: 15600 },
  { yr: 9, age: 71, premium: 3000, av: 18796, csv: 18344 },
  { yr: 10, age: 72, premium: 3000, av: 21520, csv: 21287 },
  { yr: 11, age: 73, premium: 3000, av: 25479, csv: 25479 },
  { yr: 12, age: 74, premium: 3000, av: 29707, csv: 29707 },
  { yr: 13, age: 75, premium: 3000, av: 34233, csv: 34233 },
  { yr: 14, age: 76, premium: 2944, av: 39042, csv: 39042 },
  { yr: 15, age: 77, premium: 2996, av: 44281, csv: 44281 },
]

function joseInputs(): PresentationInputs {
  return presentationInputsSchema.parse({
    id: 'calib-jose',
    createdAt: '2026-07-19T00:00:00.000Z',
    updatedAt: '2026-07-19T00:00:00.000Z',
    productType: 'iul',
    productId: 'flexlife',
    displayCurrency: 'USD',
    client: { name: 'Calib', age: 63, sex: 'M' },
    iul: {
      premium: 250,
      premiumMode: 'monthly',
      deathBenefit: 55_407,
      projectionYears: 15,
      assumedRatePct: 6.84,
      projectionSource: 'estimate',
    },
  })
}

describe('IUL calibration vs real FlexLife illustration', () => {
  const engine = new IulProjectionEngine()
  const rows = engine.compute(joseInputs()).table

  const avErrs = REAL.map((r, i) => ((rows[i]!.accumulatedValue! - r.av) / r.av) * 100)
  const meanAbsAv = avErrs.reduce((a, e) => a + Math.abs(e), 0) / avErrs.length

  it('tracks the real accumulated-value curve within a tight mean band', () => {
    // Fit is ~3.9% today; guard at 6% so a coefficient regression trips CI.
    expect(meanAbsAv).toBeLessThan(6)
  })

  it('gets the projection-year headline value close (the number the app shows)', () => {
    const real15 = REAL[14].av
    const est15 = rows[14]!.accumulatedValue!
    expect(Math.abs((est15 - real15) / real15) * 100).toBeLessThan(4)
  })

  it('never estimates wildly above the real curve in any year', () => {
    // Early years run slightly conservative (low); no year should overshoot much.
    expect(Math.max(...avErrs)).toBeLessThan(8)
  })
})
