import type { YearlyRow } from '@domain/model/presentation'
import type { ParsedIllustration } from './types'

/**
 * Parses layout-preserved text from a National Life Group / LSW illustration
 * (FlexLife IUL or Term) into a structured, reviewable result. Format-specific
 * and heuristic by design — the caller ALWAYS shows the result for confirmation
 * before applying it (the official illustration is authoritative).
 */

const MONEY = /^\$?-?[\d.,]+$/

function money(tok: string): number | null {
  if (!MONEY.test(tok)) return null
  const n = Number(tok.replace(/[$,]/g, ''))
  return Number.isFinite(n) ? n : null
}

function int(tok: string | undefined): number | null {
  if (tok == null || !/^\d+$/.test(tok)) return null
  return Number(tok)
}

function firstMatch(text: string, re: RegExp): string | undefined {
  const m = text.match(re)
  return m?.[1]?.trim()
}

function numFrom(s: string | undefined): number | undefined {
  if (s == null) return undefined
  const n = Number(s.replace(/[$,]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

/** Parse one ledger table out of the text (current / non-guaranteed scenario). */
function parseLedger(
  text: string,
  productType: 'iul' | 'term',
): { rows: YearlyRow[]; rate?: number } {
  const rows = new Map<number, YearlyRow>()
  let rate: number | undefined

  for (const line of text.split('\n')) {
    const toks = line.trim().split(/\s+/)
    if (toks.length < 4) continue
    const year = int(toks[0])
    const age = int(toks[1])
    if (year == null || age == null) continue
    if (year < 1 || year > 121 || age < 1 || age > 121 || age < year) continue

    // Collect money tokens (skipping year/age and the interest-rate token, which
    // is a bare number followed by "%" — e.g. "6.84 %").
    const moneys: { i: number; v: number }[] = []
    let pctIndex = -1
    let pctVal: number | undefined
    toks.forEach((t, i) => {
      const isPct = t.endsWith('%') || toks[i + 1] === '%'
      if (isPct) {
        pctIndex = i
        const stripped = t.replace(/[%,]/g, '')
        // Guard against the standalone "%" token (Number("") === 0).
        if (stripped && Number.isFinite(Number(stripped))) pctVal = Number(stripped)
        return
      }
      if (i < 2) return
      const m = money(t)
      if (m != null) moneys.push({ i, v: m })
    })
    if (moneys.length === 0) continue

    if (productType === 'iul') {
      // Current scenario rows carry an interest rate; take the LAST rate's
      // trailing three money columns = Accumulated, Surrender, Death Benefit.
      if (pctIndex < 0) continue
      const after = moneys.filter((m) => m.i > pctIndex).map((m) => m.v)
      if (after.length < 3) continue
      const [av, csv, db] = after.slice(-3)
      if (db < 1000) continue
      rows.set(year, {
        policyYear: year,
        age,
        premiumPaid: moneys[0].v,
        accumulatedValue: av,
        cashSurrenderValue: csv,
        deathBenefit: db,
      })
      if (rate == null && pctVal != null) rate = pctVal
    } else {
      // Term rows have no cash value: [premium, ..., DeathBenefit].
      if (pctIndex >= 0) continue
      if (moneys.length < 2) continue
      const db = moneys[moneys.length - 1].v
      if (db < 1000) continue
      rows.set(year, {
        policyYear: year,
        age,
        premiumPaid: moneys[0].v,
        deathBenefit: db,
      })
    }
  }

  return { rows: [...rows.values()].sort((a, b) => a.policyYear - b.policyYear), rate }
}

export function parseIllustration(text: string): ParsedIllustration | null {
  if (!text || text.length < 50) return null
  const warnings: string[] = []

  // ---- product family ----
  const looksTerm = /level term|no cash value|annually renewable|term\s*\d+-?g|icc18-20522/i.test(text)
  const looksIul = /indexed universal life|accumulated value|flexlife/i.test(text)
  const productType: 'iul' | 'term' = looksTerm && !looksIul ? 'term' : looksIul ? 'iul' : looksTerm ? 'term' : 'iul'
  if (!looksTerm && !looksIul) warnings.push('Tipo de produto não identificado com certeza — assumindo IUL.')

  // ---- summary fields ----
  const demo = text.match(/\b(Male|Female)\s+(\d{1,3})\s+([A-Z][A-Za-z][A-Za-z\-/ ]*?(?:Tobacco|Nicotine))/)
  const sex: 'M' | 'F' | undefined = demo ? (demo[1] === 'Male' ? 'M' : 'F') : undefined
  const age = demo ? Number(demo[2]) : undefined
  const rateClass = demo?.[3]?.trim()

  const face = numFrom(firstMatch(text, /Face Amount:\s*\$?([\d,]+)/i))
  const premMatch = text.match(
    /Initial (?:Annualized )?Premium:\s*\$?([\d,]+(?:\.\d+)?)\s*(Monthly|Month|Annually|Annual|Year)?/i,
  )
  const premium = numFrom(premMatch?.[1])
  const premiumMode: 'monthly' | 'annual' | undefined = premMatch?.[2]
    ? /month/i.test(premMatch[2])
      ? 'monthly'
      : 'annual'
    : undefined
  const state = firstMatch(text, /State:\s*([A-Za-z][A-Za-z .]+?)(?:\s{2,}|\s+Initial|$)/m)
  const productName = looksTerm
    ? undefined
    : firstMatch(text, /\b(FlexLife|PeakLife|SummitLife|SurvivorLife|RapidProtect)\b/)
  const name = firstMatch(
    text,
    /^([A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){1,5})\s+Face Amount:/m,
  )

  // ---- ledger ----
  const { rows, rate } = parseLedger(text, productType)
  if (rows.length === 0) warnings.push('Não foi possível ler a tabela ano a ano — confira/preencha manualmente.')

  const firstRow = rows[0]
  const deathBenefit = face ?? firstRow?.deathBenefit

  const result: ParsedIllustration = {
    productType,
    confidence: face != null && premium != null && rows.length > 3 ? 'high' : 'low',
    client: { name, age, sex },
    rateClass,
    state,
    productName,
    face,
    premium,
    premiumMode,
    deathBenefit,
    rows,
    warnings,
  }

  if (productType === 'iul') {
    result.assumedRatePct = rate
    // Peak accumulated value before the income phase (premium stops being paid).
    const accumRows = rows.filter((r) => (r.premiumPaid ?? 0) > 0)
    const peak = accumRows[accumRows.length - 1] ?? rows[rows.length - 1]
    result.projectedAccumulatedValue = peak?.accumulatedValue
    result.projectedCashSurrenderValue = peak?.cashSurrenderValue
  } else {
    result.termLengthYears =
      numFrom(firstMatch(text, /level\s+for\s+the\s+first\s+(\d+)\s+years/i)) ??
      numFrom(firstMatch(text, /Term\s*(\d+)-?G/i))
    result.conversionYears = numFrom(
      firstMatch(text, /first\s+(\d+)\s+years\s+from\s+(?:the\s+)?date\s+of\s+issue/i),
    )
    result.conversionToAge = numFrom(firstMatch(text, /age\s+(\d+)\s+if\s+earlier/i))
  }

  return result
}
