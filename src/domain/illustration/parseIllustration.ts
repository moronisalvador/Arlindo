import type { YearlyRow } from '@domain/model/presentation'
import type { ParsedIllustration } from './types'

/**
 * Parses layout-preserved text from a National Life Group / LSW illustration
 * (FlexLife IUL or Term) into a structured, reviewable result. Format-specific
 * and heuristic by design — the caller ALWAYS shows the result for confirmation
 * before applying it (the official illustration is authoritative).
 */

const MONEY = /^\$?-?[\d.,]+$/

/** Parse a money token; supports accounting negatives like "(500)". */
function money(tok: string): number | null {
  let s = tok
  let neg = false
  if (/^\(.*\)$/.test(s)) {
    neg = true
    s = s.slice(1, -1)
  }
  if (!MONEY.test(s)) return null
  const n = Number(s.replace(/[$,]/g, ''))
  if (!Number.isFinite(n)) return null
  return neg ? -n : n
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
    // Age in policy year k is issueAge + (k-1), so age >= year-1 (issueAge>=0,
    // incl. juvenile issue-age-0 policies). Reject anything below that.
    if (year < 1 || year > 121 || age < 0 || age > 121 || age < year - 1) continue

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
      // Prefer the higher-AV row per year, so a Guaranteed table printed AFTER the
      // Current one can't clobber the (higher) current values via last-write-wins.
      const existing = rows.get(year)
      if (!existing || av > (existing.accumulatedValue ?? -Infinity)) {
        rows.set(year, {
          policyYear: year,
          age,
          premiumPaid: moneys[0].v,
          accumulatedValue: av,
          cashSurrenderValue: csv,
          deathBenefit: db,
        })
        if (pctVal != null) rate = rate == null ? pctVal : Math.max(rate, pctVal)
      }
    } else {
      // Term rows have no cash value: [premium, ..., DeathBenefit].
      if (pctIndex >= 0) continue
      if (moneys.length < 2) continue
      const db = moneys[moneys.length - 1].v
      if (db < 1000) continue
      if (!rows.has(year)) {
        rows.set(year, {
          policyYear: year,
          age,
          premiumPaid: moneys[0].v,
          deathBenefit: db,
        })
      }
    }
  }

  return { rows: [...rows.values()].sort((a, b) => a.policyYear - b.policyYear), rate }
}

const NAME_LABEL_PREFIX = /^(Total|Initial|Base|Minimum|Maximum|Net|Group|Planned|Death|Cash|Accumulated|Face|Guaranteed)\b/i

export function parseIllustration(text: string): ParsedIllustration | null {
  if (!text || text.length < 50) return null
  const warnings: string[] = []

  // ---- product family ----
  // A term illustration ("no cash value") can still mention "Accumulated Value" in
  // a definition/comparison, so a term signal outweighs the weak "accumulated
  // value" phrase; only the product name (FlexLife / Indexed Universal Life) is a
  // strong IUL signal.
  const termSignal = /level term|no cash value|annually renewable|term\s*\d+-?g|icc18-20522|guaranteed series/i.test(text)
  const strongIul = /flexlife|indexed universal life/i.test(text)
  const productType: 'iul' | 'term' =
    strongIul && !termSignal ? 'iul' : termSignal ? 'term' : /accumulated value/i.test(text) ? 'iul' : 'iul'
  if (!termSignal && !strongIul) warnings.push('Tipo de produto não identificado com certeza — assumindo IUL.')

  // ---- summary fields ----
  // Decouple sex/age from the rate class (class may lack a Tobacco suffix, or the
  // line may be upper-case), so demographics survive even when the class doesn't.
  const sexAge = text.match(/\b(Male|Female)\s+(\d{1,3})\b/i)
  const sex: 'M' | 'F' | undefined = sexAge ? (/^m/i.test(sexAge[1]) ? 'M' : 'F') : undefined
  const age = sexAge ? Number(sexAge[2]) : undefined
  const rateClass = firstMatch(
    text,
    /\b(?:Male|Female)\s+\d{1,3}\s+([A-Za-z][\w\-/ ]*?)(?=\s+(?:Death Benefit|Initial|Tax Bracket|Riders|State)\b|\s{2,}|\n|$)/i,
  )

  const face = numFrom(firstMatch(text, /Face Amount:\s*\$?([\d,]+)/i))
  const premMatch = text.match(
    /Initial (?:Annualized )?Premium:\s*\$?([\d,]+(?:\.\d+)?)\s*(Monthly|Month|Annually|Annual|Year|Semi-?Annual|Quarterly)?/i,
  )
  const premium = numFrom(premMatch?.[1])
  let premiumMode: 'monthly' | 'annual' | undefined
  if (premMatch?.[2]) {
    const m = premMatch[2]
    if (/month/i.test(m)) premiumMode = 'monthly'
    else if (/annual|year/i.test(m)) premiumMode = 'annual'
    else warnings.push(`Frequência de prêmio "${m}" não suportada — confira o campo de frequência.`)
  }
  const state = firstMatch(text, /State:\s*([A-Za-z][A-Za-z .]+?)(?:\s{2,}|\s+Initial|\s+Tax|\n|$)/m)
  const productName = productType === 'term'
    ? undefined
    : firstMatch(text, /\b(FlexLife|PeakLife|SummitLife|SurvivorLife|RapidProtect)\b/)

  // Client name (Unicode letters; allow lower-case Portuguese particles da/de/dos/e).
  const rawName = firstMatch(
    text,
    /^([\p{Lu}][\p{L}.'-]*(?:\s+(?:[\p{Lu}][\p{L}.'-]*|d[aeo]s?|de|do|da|e|von|van|del|la))*)\s+Face Amount:/mu,
  )
  const name = rawName && !NAME_LABEL_PREFIX.test(rawName) ? rawName : undefined

  // ---- ledger ----
  const { rows, rate } = parseLedger(text, productType)
  if (rows.length === 0) warnings.push('Não foi possível ler a tabela ano a ano — confira/preencha manualmente.')

  const firstRow = rows[0]
  const deathBenefit = face ?? firstRow?.deathBenefit
  const paymentRows = rows.filter((r) => (r.premiumPaid ?? 0) > 0)
  const paymentYears = paymentRows.length ? paymentRows[paymentRows.length - 1].policyYear : undefined

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
    paymentYears,
    rows,
    warnings,
  }

  if (productType === 'iul') {
    result.assumedRatePct = rate
    // Peak accumulated value before the income phase (premium stops being paid).
    const peak = paymentRows[paymentRows.length - 1] ?? rows[rows.length - 1]
    result.projectedAccumulatedValue = peak?.accumulatedValue
    result.projectedCashSurrenderValue = peak?.cashSurrenderValue
    // LIBR lifetime income (annualized). Prefer the explicit annual figure, then a
    // monthly "…income for life… $X Monthly" line ×12.
    let income = numFrom(firstMatch(text, /Planned Annual Lifetime Income\s*\$?([\d,]+)/i))
    if (income == null) {
      const m = text.match(/level income for life[\s\S]{0,80}?\$?([\d,]+(?:\.\d+)?)\s*Monthly/i)
      if (m) income = Math.round(Number(m[1].replace(/,/g, '')) * 12)
    }
    if (income != null) {
      result.incomeOptionAnnual = income
      // Illustration horizon = the highest age the ledger runs to.
      const maxAge = rows.reduce((mx, r) => Math.max(mx, r.age ?? 0), 0)
      result.incomeToAge = maxAge || undefined
    }
  } else {
    result.termLengthYears =
      numFrom(firstMatch(text, /level\s+for\s+the\s+first\s+(\d+)\s+years/i)) ??
      numFrom(firstMatch(text, /Term\s*(\d+)-?G/i))
    result.conversionYears =
      numFrom(firstMatch(text, /first\s+(\d+)\s+(?:policy\s+)?years?\s+from\s+(?:the\s+)?date\s+of\s+issue/i)) ??
      numFrom(firstMatch(text, /convertible\s+(?:during\s+)?(?:the\s+first\s+)?(\d+)\s+(?:policy\s+)?years/i))
    result.conversionToAge =
      numFrom(firstMatch(text, /age\s+(\d+)\s+if\s+earlier/i)) ??
      numFrom(firstMatch(text, /convertible\s+to\s+age\s+(\d+)/i))
  }

  return result
}
