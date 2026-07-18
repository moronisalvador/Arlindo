import type { CurrencyCode } from '@domain/model/presentation'

const LOCALE = 'pt-BR'

/** Presentation language → Intl locale (currency stays USD; only grouping/symbol change). */
export type PresentationLanguage = 'pt' | 'en' | 'es'
export function localeFor(lang: PresentationLanguage | undefined): string {
  return lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR'
}

/**
 * Money formatted with the given locale's grouping/decimals and the product's
 * currency symbol — e.g. USD in pt-BR → "US$ 1.234,56", in en-US → "$1,234.56".
 * `compact` gives a short form for axes/tiles. Defaults to pt-BR.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: CurrencyCode = 'USD',
  opts: { compact?: boolean; decimals?: number; locale?: string } = {},
): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  const { compact = false, decimals, locale = LOCALE } = opts
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: decimals ?? (compact ? 0 : 0),
    maximumFractionDigits: decimals ?? (compact ? 1 : 0),
  }).format(amount)
}

export function formatNumber(
  value: number | null | undefined,
  opts: { decimals?: number; locale?: string } = {},
): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(opts.locale ?? LOCALE, {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  }).format(value)
}

export function formatPercent(
  value: number | null | undefined,
  opts: { decimals?: number; signed?: boolean; locale?: string } = {},
): string {
  if (value == null || Number.isNaN(value)) return '—'
  const formatted = new Intl.NumberFormat(opts.locale ?? LOCALE, {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 1,
  }).format(value)
  const sign = opts.signed && value > 0 ? '+' : ''
  return `${sign}${formatted}%`
}

/** Parse a pt-BR or plain numeric string ("1.234,56" or "1234.56") to a number. */
export function parseNumberInput(raw: string): number | undefined {
  if (raw == null) return undefined
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  // Strip currency symbols/spaces, normalize pt-BR grouping/decimal.
  let s = trimmed.replace(/[^\d.,-]/g, '')
  if (s.includes(',')) {
    // pt-BR: '.' = thousands, ',' = decimal
    s = s.replace(/\./g, '').replace(',', '.')
  }
  const n = Number(s)
  return Number.isNaN(n) ? undefined : n
}
