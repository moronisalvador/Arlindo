import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Card, Icon } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Term coverage: premium / death benefit / living benefit, the conversion privilege, and included riders. */
export function TermCoverageSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const t = slideCopy(derived.meta.language).term
  const locale = localeFor(derived.meta.language)
  const perLabel = h.premiumMode === 'annual' ? t.coverage.perYear : t.coverage.perMonth

  const stats: Array<{ label: string; value: string; sub?: string }> = [
    {
      label: t.coverage.premium,
      value: h.premium != null ? `${formatMoney(h.premium, currency, { locale })}${perLabel}` : '—',
      sub: h.termLengthYears ? t.coverage.forYears(h.termLengthYears) : undefined,
    },
    { label: t.coverage.death, value: formatMoney(h.deathBenefit, currency, { locale }) },
    {
      label: t.coverage.living,
      value: t.coverage.upTo(formatMoney(h.livingBenefit ?? h.deathBenefit, currency, { locale })),
      sub: t.coverage.livingSub,
    },
  ]

  return (
    <ContentSlide eyebrow={t.coverage.eyebrow} title={t.coverage.title}>
      <div className="mb-6 grid grid-cols-3 gap-5">
        {stats.map((s) => (
          <Card key={s.label} headerStrip={s.label}>
            <div className="flex h-full flex-col justify-center py-2 text-center">
              <span className="font-serif text-4xl font-semibold text-navy tabular-nums">{s.value}</span>
              {s.sub && <span className="mt-1 block font-sans text-sm text-muted">{s.sub}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* Conversion privilege callout */}
      <div className="mb-5 flex items-baseline gap-3 rounded-card bg-surface px-5 py-3 shadow-card">
        <Icon name="refresh" className="h-6 w-6 text-orange-dark" strokeWidth={1.6} />
        <span className="font-sans text-lg font-semibold text-navy">{t.coverage.conversion}</span>
        <span className="font-sans text-lg text-muted">·</span>
        <span className="font-sans text-lg text-ink">
          {t.coverage.conversionWindow(h.conversionYears ?? null, h.conversionToAge ?? null)}
        </span>
      </div>

      <h4 className="mb-3 font-serif text-xl font-semibold text-navy">{t.coverage.includedTitle}</h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {derived.riders.slice(0, 8).map((r) => (
          <div key={r.id} className="flex items-baseline gap-2">
            <span className="text-orange">✓</span>
            <span className="font-sans text-lg text-ink">{r.label}</span>
            {r.additionalCost && (
              <span className="font-sans text-xs text-muted">{t.coverage.additionalCost}</span>
            )}
          </div>
        ))}
      </div>
    </ContentSlide>
  )
}
