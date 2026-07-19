import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { ContentSlide } from './ContentSlide'

/**
 * "What you get for what you invest" — reframes the premium as a small input next
 * to everything the plan returns (protection, income, living benefits, value).
 * A motivation/close slide; product-aware.
 */
export function ValueSummarySlide({ derived }: { derived: DerivedPresentation }) {
  const { headline, meta } = derived
  const v = slideCopy(meta.language).valueSummary
  const locale = localeFor(meta.language)
  const money = (n?: number) => formatMoney(n, meta.currency, { locale })
  const isTerm = meta.productType === 'term'

  // "You invest": for term use the LEVEL-period total (not the ART ramp).
  const annualPrem = headline.premium != null ? headline.premium * (headline.premiumMode === 'annual' ? 1 : 12) : null
  const invest =
    isTerm && annualPrem != null && headline.termLengthYears != null
      ? annualPrem * headline.termLengthYears
      : headline.totalPremiumsPaid

  const gets: Array<{ label: string; value: string; sub?: string }> = [
    { label: v.protection, value: money(headline.deathBenefit), sub: v.taxFree },
  ]
  if (!isTerm && headline.incomeOptionAnnual != null)
    gets.push({ label: v.income, value: `${money(headline.incomeOptionAnnual)} ${v.perYear}`, sub: v.taxFree })
  if (headline.livingBenefit != null) gets.push({ label: v.living, value: money(headline.livingBenefit) })
  if (!isTerm && headline.projectedAccumulatedValue != null)
    gets.push({ label: v.accumulated, value: money(headline.projectedAccumulatedValue) })
  if (isTerm) gets.push({ label: v.conversion, value: '✓' })

  return (
    <ContentSlide eyebrow={v.eyebrow} title={v.title}>
      <div className="grid grid-cols-[minmax(0,1fr)_1.8fr] items-stretch gap-8">
        <div className="flex flex-col items-center justify-center rounded-card bg-navy p-8 text-center text-white">
          <div className="font-sans text-sm font-semibold uppercase tracking-wide text-orange">{v.youInvest}</div>
          <div className="mt-2 font-serif text-4xl font-semibold tabular-nums">{money(invest)}</div>
        </div>
        <div>
          <div className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-muted">{v.youGet}</div>
          <div className="grid grid-cols-2 gap-3">
            {gets.map((g, i) => (
              <div key={i} className="rounded-card bg-surface p-4">
                <div className="font-sans text-base text-muted">{g.label}</div>
                <div className="font-serif text-2xl font-semibold text-navy tabular-nums">{g.value}</div>
                {g.sub && <div className="mt-0.5 font-sans text-xs font-semibold text-orange">{g.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center font-serif text-xl italic text-navy">{v.tagline}</p>
    </ContentSlide>
  )
}
