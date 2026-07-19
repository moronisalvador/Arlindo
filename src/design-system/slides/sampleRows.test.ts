import { describe, expect, it } from 'vitest'
import { sampleRows } from './sampleRows'

const years = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('sampleRows', () => {
  it('returns the rows unchanged when they already fit', () => {
    expect(sampleRows(years(12), 12)).toEqual(years(12))
    expect(sampleRows(years(5), 12)).toEqual(years(5))
  })

  it('never returns more than max rows', () => {
    for (const n of [13, 20, 40, 61, 100]) {
      expect(sampleRows(years(n), 12).length).toBeLessThanOrEqual(12)
    }
  })

  it('always keeps the first and last row', () => {
    for (const n of [13, 20, 40, 61]) {
      const out = sampleRows(years(n), 12)
      expect(out[0]).toBe(1)
      expect(out[out.length - 1]).toBe(n)
    }
  })

  it('samples on a uniform stride (no irregular single-year gaps)', () => {
    // 20 rows → stride ceil(19/11)=2 → every other year, then the final year.
    expect(sampleRows(years(20), 12)).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20])
    // The gaps between consecutive kept rows are uniform except possibly the last.
    const out = sampleRows(years(41), 12)
    const gaps = out.slice(1, -1).map((v, i) => v - out[i])
    expect(new Set(gaps).size).toBe(1)
  })
})
