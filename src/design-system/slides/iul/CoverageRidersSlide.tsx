import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, formatPercent, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Coverage structure (deposit / death benefit / living benefit) + included riders. */
export function CoverageRidersSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const c = slideCopy(derived.meta.language)
  const locale = localeFor(derived.meta.language)
  const perLabel = h.premiumMode === 'annual' ? c.coverage.perYear : c.coverage.perMonth

  const stats: Array<{ label: string; value: string; sub?: string }> = [
    {
      label: c.coverage.deposit,
      value: h.premium != null ? `${formatMoney(h.premium, currency, { locale })} ${perLabel}` : '—',
      sub: h.paymentYears ? c.coverage.duringYears(h.paymentYears) : undefined,
    },
    { label: c.coverage.death, value: formatMoney(h.deathBenefit, currency, { locale }) },
    {
      label: c.coverage.livingLabel(
        h.livingBenefitPercent ? formatPercent(h.livingBenefitPercent, { locale }) : null,
      ),
      value: formatMoney(h.livingBenefit, currency, { locale }),
    },
  ]

  return (
    <ContentSlide eyebrow={c.coverage.eyebrow} title={c.coverage.title}>
      <div className="mb-8 grid grid-cols-3 gap-5">
        {stats.map((s) => (
          <Card key={s.label} headerStrip={s.label}>
            <div className="py-2 text-center">
              <span className="font-serif text-4xl font-semibold text-navy tabular-nums">
                {s.value}
              </span>
              {s.sub && (
                <span className="mt-1 block font-sans text-base text-muted">{s.sub}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <h4 className="mb-3 font-serif text-xl font-semibold text-navy">
        {c.coverage.includedTitle}
      </h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {derived.riders.slice(0, 8).map((r) => (
          <div key={r.id} className="flex items-baseline gap-2">
            <span className="text-orange">✓</span>
            <span className="font-sans text-lg text-ink">{r.label}</span>
            {r.additionalCost && (
              <span className="font-sans text-xs text-muted">{c.coverage.additionalCost}</span>
            )}
            {r.percent > 0 && (
              <span className="ml-auto font-sans text-sm font-semibold text-navy">
                {c.coverage.upTo(formatPercent(r.percent, { locale }))}
              </span>
            )}
          </div>
        ))}
      </div>
    </ContentSlide>
  )
}
