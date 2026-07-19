import pptxgen from 'pptxgenjs'
import type { DerivedPresentation } from '@domain/model/derived'
import type { YearlyRow } from '@domain/model/presentation'
import { formatMoney, formatNumber, formatPercent, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'

/**
 * Generates an EDITABLE native .pptx (real text, tables, and a chart) from a
 * DerivedPresentation — opens in PowerPoint and imports into Google Slides. Uses
 * the same derived data as the on-screen slides / PDF, in the SCF visual language.
 * Fonts are cross-platform (Georgia/Arial) so it renders correctly on any machine.
 */

// pptxgenjs colors are hex WITHOUT '#'.
const C = {
  navy: '0E2148',
  navyDeep: '081430',
  navySoft: '1E366A',
  orange: 'DDA22E', // brand gold
  orangeDk: 'B0801C',
  white: 'FFFFFF',
  alt: 'EEF0F3',
  ink: '111827',
  muted: '6B7280',
  line: 'E2E6EB',
}
const SERIF = 'Georgia'
const SANS = 'Arial'

// LAYOUT_WIDE = 13.333in × 7.5in.
const PW = 13.333
const PH = 7.5

function sanitizeFileName(name: string): string {
  const base = (name || 'apresentacao').trim().replace(/[^\p{L}\p{N}\-_ ]/gu, '').replace(/\s+/g, '-')
  return `${base || 'apresentacao'}.pptx`
}

function monthYear(iso: string, locale: string): string {
  const d = iso ? new Date(iso) : new Date()
  const s = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function sample<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows
  const step = (rows.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * step)])
}

type Slide = ReturnType<pptxgen['addSlide']>

// The real SCF logo, loaded to a base64 data URI once per export (set in downloadPptx).
let logoDataUrl = ''

/** Fetch the public logo asset and return it as a base64 data URI (for pptx embedding). */
async function loadLogo(): Promise<string> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}scf-logo.png`)
    const blob = await res.blob()
    return await new Promise<string>((resolve) => {
      const fr = new FileReader()
      fr.onloadend = () => resolve(typeof fr.result === 'string' ? fr.result : '')
      fr.onerror = () => resolve('')
      fr.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

/**
 * SCF logo chip (top-right of a slide): a white chip holding the real logo image
 * so the PPTX carries the same branding as the on-screen deck. Falls back to a
 * text wordmark if the image couldn't be loaded.
 */
function addLogoChip(slide: Slide, x: number, y: number) {
  const w = 2.0
  const h = 0.62
  slide.addShape('roundRect', { x, y, w, h, fill: { color: C.white }, line: { color: C.white }, rectRadius: 0.08 })
  if (logoDataUrl) {
    slide.addImage({
      data: logoDataUrl,
      x: x + 0.12,
      y: y + 0.09,
      w: w - 0.24,
      h: h - 0.18,
      sizing: { type: 'contain', w: w - 0.24, h: h - 0.18 },
    })
  } else {
    slide.addText('SECOND CHANCE FINANCIAL', {
      x: x + 0.1, y, w: w - 0.2, h, fontFace: SANS, fontSize: 8, bold: true, color: C.navy, valign: 'middle', align: 'center',
    })
  }
}

/** Navy header bar with orange eyebrow + white serif title. Returns body top (in). */
function addHeader(slide: Slide, eyebrow: string, title: string): number {
  slide.background = { color: C.alt }
  slide.addShape('rect', { x: 0, y: 0, w: PW, h: 1.1, fill: { color: C.navy } })
  slide.addText(eyebrow.toUpperCase(), {
    x: 0.6, y: 0.16, w: 9, h: 0.3, fontFace: SANS, fontSize: 10, bold: true, color: C.orange, charSpacing: 2,
  })
  slide.addText(title, { x: 0.6, y: 0.4, w: 9.5, h: 0.6, fontFace: SERIF, fontSize: 26, bold: true, color: C.white })
  addLogoChip(slide, PW - 2.3, 0.24)
  return 1.5
}

function coverSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const loc = localeFor(d.meta.language)
  s.background = { color: C.navy }
  // decorative soft circle
  s.addShape('ellipse', { x: 8.4, y: -1.8, w: 4, h: 4, fill: { color: C.navySoft, transparency: 45 }, line: { type: 'none' } })
  // orange agent panel on the right
  s.addShape('rect', { x: 10.2, y: 0, w: PW - 10.2, h: PH, fill: { color: C.orange } })
  s.addText(d.meta.branding.agentName || c.cover.agentFallback, {
    x: 10.2, y: 3.1, w: PW - 10.2, h: 0.5, align: 'center', fontFace: SANS, fontSize: 16, bold: true, color: C.navy,
  })
  s.addText(d.meta.branding.agentTitle || '', {
    x: 10.2, y: 3.6, w: PW - 10.2, h: 0.4, align: 'center', fontFace: SANS, fontSize: 11, color: C.navy,
  })
  addLogoChip(s, PW - 2.15, 0.4)
  // title block
  s.addText(d.meta.productName, { x: 0.8, y: 2.2, w: 8.8, h: 1.6, fontFace: SERIF, fontSize: 40, bold: true, color: C.white })
  s.addText(c.cover.subtitle, { x: 0.8, y: 3.75, w: 8, h: 0.5, fontFace: SERIF, fontSize: 18, italic: true, color: C.orange })
  s.addText(d.meta.clientName || c.cover.clientFallback, { x: 0.8, y: 4.5, w: 8, h: 0.7, fontFace: SERIF, fontSize: 28, color: C.white })
  s.addShape('rect', { x: 0.85, y: 5.25, w: 3.2, h: 0.06, fill: { color: C.orange } })
  s.addText(monthYear(d.meta.preparedOn, loc), { x: 0.8, y: 5.5, w: 6, h: 0.4, fontFace: SANS, fontSize: 12, color: 'C7CCD6' })
}

function explainerSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const top = addHeader(s, c.explainer.eyebrow, c.explainer.title)
  const name = d.meta.clientName || c.clientFallback
  const intro = c.explainer.intro(name)
  s.addText(`${intro.pre}${intro.strong}${intro.post}`, {
    x: 0.6, y: top, w: 12.1, h: 0.9, fontFace: SANS, fontSize: 13, color: C.ink,
  })
  const pillars = c.explainer.pillars.map((p) => [p.title, p.body] as const)
  const cardW = 2.9
  const gap = 0.18
  const startX = 0.6
  pillars.forEach(([title, body], i) => {
    const x = startX + i * (cardW + gap)
    s.addShape('roundRect', { x, y: top + 1.1, w: cardW, h: 2.6, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.08 })
    s.addText(title, { x: x + 0.2, y: top + 1.3, w: cardW - 0.4, h: 0.5, fontFace: SERIF, fontSize: 15, bold: true, color: C.navy })
    s.addText(body, { x: x + 0.2, y: top + 1.85, w: cardW - 0.4, h: 1.6, fontFace: SANS, fontSize: 11, color: C.muted })
  })
}

function coverageSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, c.coverage.eyebrow, c.coverage.title)
  const cur = d.meta.currency
  const h = d.headline
  const per = h.premiumMode === 'annual' ? c.coverage.perYear : c.coverage.perMonth
  const depositLabel = h.paymentYears
    ? `${c.coverage.deposit} · ${c.coverage.duringYears(h.paymentYears)}`
    : c.coverage.deposit
  const stats: Array<[string, string]> = [
    [depositLabel, h.premium != null ? `${formatMoney(h.premium, cur, { locale: loc })} ${per}` : '—'],
    [c.coverage.death, formatMoney(h.deathBenefit, cur, { locale: loc })],
    [
      c.coverage.livingLabel(
        h.livingBenefitPercent ? formatPercent(h.livingBenefitPercent, { locale: loc }) : null,
      ),
      formatMoney(h.livingBenefit, cur, { locale: loc }),
    ],
  ]
  const cardW = 3.9
  const gap = 0.2
  stats.forEach(([label, value], i) => {
    const x = 0.6 + i * (cardW + gap)
    s.addShape('roundRect', { x, y: top, w: cardW, h: 1.7, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.06 })
    s.addShape('rect', { x, y: top, w: cardW, h: 0.45, fill: { color: C.orange } })
    s.addText(label, { x: x + 0.15, y: top + 0.03, w: cardW - 0.3, h: 0.4, fontFace: SANS, fontSize: 10, bold: true, color: C.navy, valign: 'middle' })
    s.addText(value, { x: x + 0.15, y: top + 0.55, w: cardW - 0.3, h: 1, fontFace: SERIF, fontSize: 24, bold: true, color: C.navy, align: 'center', valign: 'middle' })
  })
  // included riders
  const riders = d.riders.slice(0, 8)
  s.addText(c.coverage.includedTitle, { x: 0.6, y: top + 1.95, w: 8, h: 0.4, fontFace: SERIF, fontSize: 15, bold: true, color: C.navy })
  riders.forEach((r, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.6 + col * 6.2
    const y = top + 2.45 + row * 0.42
    s.addText(
      [
        { text: '✓  ', options: { color: C.orange, bold: true } },
        { text: r.label, options: { color: C.ink } },
        ...(r.percent > 0 ? [{ text: `   ${c.coverage.upTo(formatPercent(r.percent, { locale: loc }))}`, options: { color: C.navy, bold: true } }] : []),
      ],
      { x, y, w: 6, h: 0.4, fontFace: SANS, fontSize: 12 },
    )
  })
}

function projectionSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, c.projection.eyebrow, c.projection.title)
  const cur = d.meta.currency
  s.addText(c.projection.projectedLabel(d.headline.projectionYears ?? null).toUpperCase(), {
    x: 0.6, y: top, w: 3.3, h: 0.3, fontFace: SANS, fontSize: 9, bold: true, color: C.orange, charSpacing: 1,
  })
  s.addText(formatMoney(d.headline.projectedAccumulatedValue, cur, { locale: loc }), {
    x: 0.6, y: top + 0.35, w: 3.4, h: 0.9, fontFace: SERIF, fontSize: 30, bold: true, color: C.navy,
  })
  s.addText(c.projection.sub, {
    x: 0.6, y: top + 1.35, w: 3.3, h: 1, fontFace: SANS, fontSize: 12, color: C.muted,
  })
  const years = d.series.policyYears
  const values = d.series.accumulatedValue ?? []
  if (years.length > 1 && values.length > 0) {
    s.addChart(
      'area',
      [{ name: c.table.accumulated, labels: years.map(String), values }],
      {
        x: 4.2, y: top, w: 8.5, h: 4.4,
        chartColors: [C.orange],
        showLegend: false, showTitle: false,
        catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
        catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
        valAxisLabelFormatCode: '#,##0,"k"',
      },
    )
  } else {
    s.addText(c.projection.empty, {
      x: 4.2, y: top + 1.5, w: 8, h: 1, fontFace: SANS, fontSize: 12, color: C.muted, align: 'center',
    })
  }
}

function tableSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, c.table.eyebrow, c.table.title)
  const cur = d.meta.currency
  const rows = sample(d.table, 14)
  const head = [c.table.year, c.table.age, c.table.premium, c.table.accumulated, c.table.death].map((t) => ({
    text: t,
    options: { bold: true, color: C.white, fill: { color: C.navy }, fontFace: SANS, fontSize: 11, align: 'center' as const },
  }))
  const body = rows.map((r: YearlyRow) => [
    { text: formatNumber(r.policyYear, { locale: loc }), options: { align: 'center' as const } },
    { text: r.age != null ? formatNumber(r.age, { locale: loc }) : '—', options: { align: 'center' as const } },
    { text: formatMoney(r.premiumPaid, cur, { locale: loc }), options: { align: 'right' as const } },
    { text: formatMoney(r.accumulatedValue, cur, { locale: loc }), options: { align: 'right' as const, bold: true, color: C.navy } },
    { text: formatMoney(r.deathBenefit, cur, { locale: loc }), options: { align: 'right' as const } },
  ])
  s.addTable([head, ...body], {
    x: 0.6, y: top, w: 12.1, colW: [1.4, 1.4, 3, 3.3, 3],
    border: { type: 'solid', color: C.line, pt: 0.5 },
    fontFace: SANS, fontSize: 10, color: C.ink, valign: 'middle', rowH: 0.28,
  })
}

function optionsSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, c.options.eyebrow, c.options.title)
  const cur = d.meta.currency
  const h = d.headline
  // Opção 1 (navy)
  s.addShape('roundRect', { x: 0.8, y: top + 0.3, w: 5.6, h: 3, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.08 })
  s.addText(c.options.opt1.toUpperCase(), { x: 1, y: top + 0.6, w: 5.2, h: 0.3, fontFace: SANS, fontSize: 10, bold: true, color: C.orange, align: 'center', charSpacing: 1 })
  s.addText(formatMoney(h.projectedCashSurrenderValue ?? h.projectedAccumulatedValue, cur, { locale: loc }), { x: 1, y: top + 1.1, w: 5.2, h: 0.9, fontFace: SERIF, fontSize: 30, bold: true, color: C.white, align: 'center' })
  s.addText(c.options.opt1Body, { x: 1, y: top + 2.1, w: 5.2, h: 0.8, fontFace: SANS, fontSize: 12, color: 'C7CCD6', align: 'center' })
  // Opção 2 (white)
  s.addShape('roundRect', { x: 6.9, y: top + 0.3, w: 5.6, h: 3, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.08 })
  s.addText(c.options.opt2.toUpperCase(), { x: 7.1, y: top + 0.6, w: 5.2, h: 0.3, fontFace: SANS, fontSize: 10, bold: true, color: C.orange, align: 'center', charSpacing: 1 })
  s.addText(h.incomeOptionAnnual != null ? `${formatMoney(h.incomeOptionAnnual, cur, { locale: loc })} ${c.options.perYear}` : '—', { x: 7.1, y: top + 1.1, w: 5.2, h: 0.9, fontFace: SERIF, fontSize: 28, bold: true, color: C.navy, align: 'center' })
  s.addText(`${c.options.incomeForLife}${h.incomeToAge ? c.options.illustratedToAge(h.incomeToAge) : ''}.`, { x: 7.1, y: top + 2.1, w: 5.2, h: 0.8, fontFace: SANS, fontSize: 12, color: C.muted, align: 'center' })
}

function comparisonSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  const top = addHeader(s, c.comparison.eyebrow, c.comparison.title)
  const rows: Array<[string, string, string]> = c.comparison.rows.map((r) => [r.label, r.term, r.iul])
  // Termo card (white)
  s.addShape('roundRect', { x: 0.8, y: top, w: 5.6, h: 4.3, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.08 })
  s.addText(c.comparison.term, { x: 0.8, y: top + 0.15, w: 5.6, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: C.ink, align: 'center' })
  // IUL card (navy)
  s.addShape('roundRect', { x: 6.9, y: top, w: 5.6, h: 4.3, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.08 })
  s.addText(c.comparison.iul, { x: 6.9, y: top + 0.15, w: 5.6, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: C.white, align: 'center' })
  rows.forEach(([label, termo, iul], i) => {
    const y = top + 0.85 + i * 0.82
    s.addText(label.toUpperCase(), { x: 1, y, w: 5.2, h: 0.25, fontFace: SANS, fontSize: 8, bold: true, color: C.muted, charSpacing: 1 })
    s.addText(termo, { x: 1, y: y + 0.25, w: 5.2, h: 0.5, fontFace: SANS, fontSize: 12, color: C.ink })
    s.addText(label.toUpperCase(), { x: 7.1, y, w: 5.2, h: 0.25, fontFace: SANS, fontSize: 8, bold: true, color: C.orange, charSpacing: 1 })
    s.addText(iul, { x: 7.1, y: y + 0.25, w: 5.2, h: 0.5, fontFace: SANS, fontSize: 12, color: C.white })
  })
}

function disclaimersSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const c = slideCopy(d.meta.language)
  s.background = { color: C.navy }
  s.addShape('ellipse', { x: 9.5, y: 5.5, w: 4, h: 4, fill: { color: C.navySoft, transparency: 50 }, line: { type: 'none' } })
  s.addText(c.disclaimers.eyebrow.toUpperCase(), { x: 0.8, y: 0.7, w: 9, h: 0.3, fontFace: SANS, fontSize: 10, bold: true, color: C.orange, charSpacing: 2 })
  s.addText(c.disclaimers.title, { x: 0.8, y: 1.05, w: 9, h: 0.6, fontFace: SERIF, fontSize: 26, bold: true, color: C.white })
  const items = d.disclaimers.length ? d.disclaimers : ['Documento ilustrativo. Valores projetados, não garantidos.']
  // Shrink type + spacing when the list is long so it never runs into the footer.
  const dense = items.length > 6
  s.addText(
    items.map((t) => ({ text: t, options: { bullet: { characterCode: '2022' }, color: 'D6DAE4' } })),
    {
      x: 0.9,
      y: 2,
      w: 10.5,
      h: dense ? 4.4 : 3.5,
      fontFace: SANS,
      fontSize: dense ? 11 : 13,
      lineSpacingMultiple: dense ? 1.15 : 1.3,
    },
  )
  s.addText(`${d.meta.branding.company} · ${d.meta.branding.carrier}`, { x: 0.9, y: 6.6, w: 10, h: 0.4, fontFace: SANS, fontSize: 10, color: '9AA1B2' })
}

// ── Term slides (no cash value → premium/death/living + conversion) ──────────

function termHeadlineSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const t = slideCopy(d.meta.language).term
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, t.headline.eyebrow, t.headline.title)
  const cur = d.meta.currency
  const h = d.headline
  const cards: Array<[string, string, string, string]> = [
    ['🛡️', t.headline.whenEarly, formatMoney(h.deathBenefit, cur, { locale: loc }), t.headline.subDeath],
    ['❤️', t.headline.whenIll, formatMoney(h.livingBenefit ?? h.deathBenefit, cur, { locale: loc }), t.headline.livingDiscounted],
    ['🔄', t.headline.whenConvert, t.coverage.conversionWindow(h.conversionYears ?? null, h.conversionToAge ?? null), t.headline.convertBody],
  ]
  const cardW = 3.9
  const gap = 0.2
  cards.forEach(([emoji, when, value, sub], i) => {
    const x = 0.6 + i * (cardW + gap)
    s.addShape('roundRect', { x, y: top, w: cardW, h: 4, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.08 })
    s.addText(emoji, { x, y: top + 0.25, w: cardW, h: 0.7, fontSize: 30, align: 'center' })
    s.addText(when, { x: x + 0.15, y: top + 1.05, w: cardW - 0.3, h: 0.4, fontFace: SANS, fontSize: 13, bold: true, color: C.orange, align: 'center' })
    s.addText(value, { x: x + 0.15, y: top + 1.6, w: cardW - 0.3, h: 1, fontFace: SERIF, fontSize: 22, bold: true, color: C.navy, align: 'center', valign: 'middle' })
    s.addText(sub, { x: x + 0.2, y: top + 2.7, w: cardW - 0.4, h: 1, fontFace: SANS, fontSize: 11, color: C.muted, align: 'center' })
  })
}

function termCoverageSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const t = slideCopy(d.meta.language).term
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, t.coverage.eyebrow, t.coverage.title)
  const cur = d.meta.currency
  const h = d.headline
  const per = h.premiumMode === 'annual' ? t.coverage.perYear : t.coverage.perMonth
  const premiumLabel = h.termLengthYears ? `${t.coverage.premium} · ${t.coverage.forYears(h.termLengthYears)}` : t.coverage.premium
  const stats: Array<[string, string]> = [
    [premiumLabel, h.premium != null ? `${formatMoney(h.premium, cur, { locale: loc })} ${per}` : '—'],
    [t.coverage.death, formatMoney(h.deathBenefit, cur, { locale: loc })],
    [t.coverage.living, formatMoney(h.livingBenefit ?? h.deathBenefit, cur, { locale: loc })],
  ]
  const cardW = 3.9
  const gap = 0.2
  stats.forEach(([label, value], i) => {
    const x = 0.6 + i * (cardW + gap)
    s.addShape('roundRect', { x, y: top, w: cardW, h: 1.7, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.06 })
    s.addShape('rect', { x, y: top, w: cardW, h: 0.45, fill: { color: C.orange } })
    s.addText(label, { x: x + 0.15, y: top + 0.03, w: cardW - 0.3, h: 0.4, fontFace: SANS, fontSize: 10, bold: true, color: C.navy, valign: 'middle' })
    s.addText(value, { x: x + 0.15, y: top + 0.55, w: cardW - 0.3, h: 1, fontFace: SERIF, fontSize: 24, bold: true, color: C.navy, align: 'center', valign: 'middle' })
  })
  // conversion callout
  s.addShape('roundRect', { x: 0.6, y: top + 1.95, w: 12.1, h: 0.7, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.06 })
  s.addText(`🔄  ${t.coverage.conversion}`, { x: 0.8, y: top + 1.95, w: 6, h: 0.7, fontFace: SANS, fontSize: 13, bold: true, color: C.navy, valign: 'middle' })
  s.addText(t.coverage.conversionWindow(h.conversionYears ?? null, h.conversionToAge ?? null), { x: 6.8, y: top + 1.95, w: 5.7, h: 0.7, fontFace: SANS, fontSize: 13, color: C.ink, align: 'right', valign: 'middle' })
  // included riders
  const riders = d.riders.slice(0, 8)
  s.addText(t.coverage.includedTitle, { x: 0.6, y: top + 2.85, w: 8, h: 0.4, fontFace: SERIF, fontSize: 15, bold: true, color: C.navy })
  riders.forEach((r, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.6 + col * 6.2
    const y = top + 3.35 + row * 0.42
    s.addText(
      [
        { text: '✓  ', options: { color: C.orange, bold: true } },
        { text: r.label, options: { color: C.ink } },
        ...(r.additionalCost ? [{ text: `   ${t.coverage.additionalCost}`, options: { color: C.muted } }] : []),
      ],
      { x, y, w: 6, h: 0.4, fontFace: SANS, fontSize: 12 },
    )
  })
}

function termScheduleSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const t = slideCopy(d.meta.language).term
  const loc = localeFor(d.meta.language)
  const top = addHeader(s, t.schedule.eyebrow, t.schedule.title)
  const cur = d.meta.currency
  const rows = sample(d.table, 14)
  const head = [t.schedule.year, t.schedule.age, t.schedule.premium, t.schedule.death].map((txt) => ({
    text: txt,
    options: { bold: true, color: C.white, fill: { color: C.navy }, fontFace: SANS, fontSize: 11, align: 'center' as const },
  }))
  const body = rows.map((r: YearlyRow) => [
    { text: formatNumber(r.policyYear, { locale: loc }), options: { align: 'center' as const } },
    { text: r.age != null ? formatNumber(r.age, { locale: loc }) : '—', options: { align: 'center' as const } },
    { text: formatMoney(r.premiumPaid, cur, { locale: loc }), options: { align: 'right' as const, bold: true, color: C.navy } },
    { text: formatMoney(r.deathBenefit, cur, { locale: loc }), options: { align: 'right' as const } },
  ])
  s.addTable([head, ...body], {
    x: 0.6, y: top, w: 12.1, colW: [1.9, 1.9, 4.15, 4.15],
    border: { type: 'solid', color: C.line, pt: 0.5 },
    fontFace: SANS, fontSize: 10, color: C.ink, valign: 'middle', rowH: 0.28,
  })
}

function termComparisonSlide(pptx: pptxgen, d: DerivedPresentation) {
  const s = pptx.addSlide()
  const t = slideCopy(d.meta.language).term
  const top = addHeader(s, t.comparison.eyebrow, t.comparison.title)
  const rows: Array<[string, string, string]> = t.comparison.rows.map((r) => [r.label, r.term, r.permanent])
  // Term card (navy — recommended)
  s.addShape('roundRect', { x: 0.8, y: top, w: 5.6, h: 4.3, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.08 })
  s.addText(t.comparison.term, { x: 0.8, y: top + 0.15, w: 5.6, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: C.white, align: 'center' })
  // Permanent card (white)
  s.addShape('roundRect', { x: 6.9, y: top, w: 5.6, h: 4.3, fill: { color: C.white }, line: { color: C.line }, rectRadius: 0.08 })
  s.addText(t.comparison.permanent, { x: 6.9, y: top + 0.15, w: 5.6, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: C.ink, align: 'center' })
  rows.forEach(([label, termo, perm], i) => {
    const y = top + 0.85 + i * 0.66
    s.addText(label.toUpperCase(), { x: 1, y, w: 5.2, h: 0.22, fontFace: SANS, fontSize: 8, bold: true, color: C.orange, charSpacing: 1 })
    s.addText(termo, { x: 1, y: y + 0.22, w: 5.2, h: 0.4, fontFace: SANS, fontSize: 12, color: C.white })
    s.addText(label.toUpperCase(), { x: 7.1, y, w: 5.2, h: 0.22, fontFace: SANS, fontSize: 8, bold: true, color: C.muted, charSpacing: 1 })
    s.addText(perm, { x: 7.1, y: y + 0.22, w: 5.2, h: 0.4, fontFace: SANS, fontSize: 12, color: C.ink })
  })
}

/** Build and trigger download of the editable .pptx (branches IUL vs Term). */
export async function downloadPptx(derived: DerivedPresentation): Promise<void> {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'Arlindo'
  pptx.company = derived.meta.branding.company || 'Second Chance Financial'
  pptx.title = derived.meta.productName

  logoDataUrl = await loadLogo()

  if (derived.meta.productType === 'term') {
    coverSlide(pptx, derived)
    termHeadlineSlide(pptx, derived)
    termCoverageSlide(pptx, derived)
    if (derived.table.length > 0) termScheduleSlide(pptx, derived)
    termComparisonSlide(pptx, derived)
    disclaimersSlide(pptx, derived)
  } else {
    coverSlide(pptx, derived)
    explainerSlide(pptx, derived)
    coverageSlide(pptx, derived)
    projectionSlide(pptx, derived)
    if (derived.table.length > 0) tableSlide(pptx, derived)
    optionsSlide(pptx, derived)
    comparisonSlide(pptx, derived)
    disclaimersSlide(pptx, derived)
  }

  await pptx.writeFile({ fileName: sanitizeFileName(derived.meta.clientName) })
}
