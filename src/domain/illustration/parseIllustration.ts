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
  face?: number,
): { rows: YearlyRow[]; rate?: number } {
  const rows = new Map<number, YearlyRow>()
  // For term, remember how many money columns backed each year's row, so the main
  // schedule (premium + DB = 2 columns) beats a multi-premium comparison table.
  const termCols = new Map<number, number>()
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
      // Term rows: premium is the first money; the death benefit is a large level
      // value (prefer one equal to the face). Robust to a trailing $0 cash-value
      // column and to multi-premium comparison tables (prefer the simplest row).
      if (pctIndex >= 0) continue
      if (moneys.length < 2) continue
      const premiumPaid = moneys[0].v
      const dbCandidates = moneys.slice(1).map((m) => m.v).filter((v) => v >= 1000)
      if (dbCandidates.length === 0) continue
      const db = face != null && dbCandidates.includes(face) ? face : Math.max(...dbCandidates)
      const prevCols = termCols.get(year)
      if (prevCols == null || moneys.length < prevCols) {
        rows.set(year, { policyYear: year, age, premiumPaid, deathBenefit: db })
        termCols.set(year, moneys.length)
      }
    }
  }

  return { rows: [...rows.values()].sort((a, b) => a.policyYear - b.policyYear), rate }
}

/** Guaranteed-scenario accumulated value at a given policy year (rows WITHOUT a
 * rate column = the guaranteed table). Used for the "worst case" floor. */
function parseGuaranteedIulValue(text: string, atYear?: number): number | undefined {
  if (atYear == null) return undefined
  for (const line of text.split('\n')) {
    const toks = line.trim().split(/\s+/)
    if (int(toks[0]) !== atYear) continue
    if (toks.some((t) => t.endsWith('%') || t === '%')) continue // skip current-scenario rows
    const moneys: number[] = []
    toks.forEach((t, i) => {
      if (i < 2) return
      const m = money(t)
      if (m != null) moneys.push(m)
    })
    // structure: premium, [zeros], AccumulatedValue, SurrenderValue, DeathBenefit
    if (moneys.length >= 4) return moneys[moneys.length - 3]
  }
  return undefined
}

const NAME_LABEL_PREFIX = /^(Total|Initial|Base|Minimum|Maximum|Net|Group|Planned|Death|Cash|Accumulated|Face|Guaranteed)\b/i

export function parseIllustration(text: string): ParsedIllustration | null {
  if (!text || text.length < 50) return null
  const warnings: string[] = []

  // ---- product family ----
  // Precedence: a DEFINITIVE product identifier (a form/product name) wins over a
  // weak phrase that can appear in either doc ("level term" in an IUL comparison,
  // "Accumulated Value" in a term definition).
  const termProduct = /term\s*\d+\s*-?\s*n?g\b|icc18-20522|annual\s+renewable\s+term|\bART\b/i.test(text)
  const iulProduct = /flexlife|peaklife|summitlife|survivorlife/i.test(text)
  const termWeak = /level term|no cash value|annually renewable|guaranteed series/i.test(text)
  const iulWeak = /indexed universal life|accumulated value/i.test(text)
  let productType: 'iul' | 'term' = termProduct
    ? 'term'
    : iulProduct
      ? 'iul'
      : termWeak
        ? 'term'
        : iulWeak
          ? 'iul'
          : 'iul'
  if (!termProduct && !iulProduct && !termWeak && !iulWeak)
    warnings.push('Tipo de produto não identificado com certeza — assumindo IUL.')

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
    // Check semi-annual/quarterly first — "Semi-Annual" contains "annual".
    if (/semi|quarter/i.test(m)) {
      warnings.push(`Frequência de prêmio "${m}" não suportada — confira o campo de frequência.`)
    } else if (/month/i.test(m)) premiumMode = 'monthly'
    else if (/annual|year/i.test(m)) premiumMode = 'annual'
  }
  const state = firstMatch(text, /State:\s*([A-Za-z][A-Za-z .]+?)(?:\s{2,}|\s+Initial|\s+Tax|\n|$)/m)
  const productName = productType === 'term'
    ? // e.g. "Term 30-G" → "Term 30" (drop the guaranteed-form suffix); generic fallback.
      firstMatch(text, /\b(Term\s*\d+)\s*-?\s*N?G?\b/i)?.replace(/\s+/g, ' ').trim()
    : firstMatch(text, /\b(FlexLife|PeakLife|SummitLife|SurvivorLife|RapidProtect)\b/)

  // Client name (Unicode letters; allow lower-case Portuguese particles da/de/dos/e).
  const rawName = firstMatch(
    text,
    /^([\p{Lu}][\p{L}.'-]*(?:\s+(?:[\p{Lu}][\p{L}.'-]*|d[aeo]s?|de|do|da|e|von|van|del|la))*)\s+Face Amount:/mu,
  )
  const name = rawName && !NAME_LABEL_PREFIX.test(rawName) ? rawName : undefined

  // ---- ledger ----
  // The ledger structure is ground truth: an IUL ledger has interest-rate (%)
  // columns, a term ledger doesn't. If the text-based classification yields no
  // rows but the other product type parses cleanly, trust the ledger and switch.
  let { rows, rate } = parseLedger(text, productType, face)
  if (rows.length === 0) {
    const alt = productType === 'iul' ? 'term' : 'iul'
    const altLedger = parseLedger(text, alt, face)
    if (altLedger.rows.length > 0) {
      productType = alt
      rows = altLedger.rows
      rate = altLedger.rate
      warnings.push(
        `Tipo ajustado para ${alt === 'term' ? 'Seguro Temporário' : 'IUL'} com base na estrutura da tabela.`,
      )
    }
  }
  if (rows.length === 0) warnings.push('Não foi possível ler a tabela ano a ano — confira/preencha manualmente.')

  const firstRow = rows[0]
  const deathBenefit = face ?? firstRow?.deathBenefit
  const paymentRows = rows.filter((r) => (r.premiumPaid ?? 0) > 0)
  const paymentYears = paymentRows.length ? paymentRows[paymentRows.length - 1].policyYear : undefined
  // Real printed accelerated living benefit (Terminal Illness), discounted vs DB.
  const livingBenefit = numFrom(
    firstMatch(text, /Terminal Illness Benefit[:\s]+(?:up to\s+)?\$?([\d,]+)/i),
  )

  // Per-condition ABR values from the summary block ("If I Become Ill..."), each
  // discounted and condition-specific. Any may be absent.
  const abr = {
    terminal: livingBenefit,
    chronicMonthly: numFrom(firstMatch(text, /Chronic Illness Benefit[:\s]+\$?([\d,]+)\s*Per Month/i)),
    critical: numFrom(firstMatch(text, /Critical Illness Benefit[:\s]+(?:up to\s+)?\$?([\d,]+)/i)),
    criticalInjury: numFrom(firstMatch(text, /Critical Injury Benefit[:\s]+(?:up to\s+)?\$?([\d,]+)/i)),
    alzheimer: numFrom(firstMatch(text, /Alzheimer'?s(?:\s+Disease)? Benefit[:\s]+(?:up to\s+)?\$?([\d,]+)/i)),
  }
  const abrBenefits = Object.values(abr).some((v) => v != null) ? abr : undefined

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
    livingBenefit,
    abrBenefits,
    paymentYears,
    rows,
    warnings,
  }

  if (productType === 'iul') {
    result.assumedRatePct = rate
    result.guaranteedValue = parseGuaranteedIulValue(text, paymentYears)
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
      numFrom(firstMatch(text, /Term\s*(\d+)\s*-?\s*n?g\b/i))
    // Conversion window — many phrasings across NLG/LSW term forms.
    result.conversionYears =
      numFrom(firstMatch(text, /first\s+(\d+)\s+(?:policy\s+)?years?\s+from\s+(?:the\s+)?(?:term\s+policy\s+)?date\s+of\s+issue/i)) ??
      numFrom(firstMatch(text, /conversion\s+period\s+ends\s+(\d+)\s+years/i)) ??
      numFrom(firstMatch(text, /convert(?:ible)?[^.]{0,60}?within\s+(\d+)\s+years/i)) ??
      numFrom(firstMatch(text, /convert(?:ible)?[^.]{0,40}?(?:during\s+)?(?:the\s+first\s+)?(\d+)\s+(?:policy\s+)?years/i))
    result.conversionToAge =
      numFrom(firstMatch(text, /age\s+(\d+)\s+if\s+(?:earlier|sooner)/i)) ??
      numFrom(firstMatch(text, /convert(?:ible)?[^.]{0,60}?(?:prior\s+to|until|to)\s+age\s+(\d+)/i)) ??
      numFrom(firstMatch(text, /or\s+(?:until\s+)?age\s+(\d+)/i))
  }

  return result
}
