import { describe, expect, it } from 'vitest'
import { formatMoney, formatPercent, parseNumberInput } from './index'

describe('formatMoney', () => {
  it('formats USD with pt-BR grouping', () => {
    // Non-breaking spaces vary by ICU; assert the important parts.
    const s = formatMoney(1234, 'USD')
    expect(s).toContain('US$')
    expect(s).toContain('1.234')
  })

  it('returns em dash for null', () => {
    expect(formatMoney(null)).toBe('—')
  })

  it('supports compact notation', () => {
    expect(formatMoney(1_200_000, 'USD', { compact: true })).toContain('mi')
  })
})

describe('formatPercent', () => {
  it('adds a sign when requested', () => {
    expect(formatPercent(13.9, { signed: true, decimals: 1 })).toBe('+13,9%')
  })
})

describe('parseNumberInput', () => {
  it('parses pt-BR grouped decimals', () => {
    expect(parseNumberInput('1.234,56')).toBe(1234.56)
  })
  it('parses plain numbers', () => {
    expect(parseNumberInput('250')).toBe(250)
  })
  it('returns undefined for empty', () => {
    expect(parseNumberInput('')).toBeUndefined()
  })
})
