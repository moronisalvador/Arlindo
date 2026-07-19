import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, formatPercent, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * National Life's "Die Too Soon / Live Too Long / Become Ill" headline:
 * three ways the plan protects the client. Rendered right after the cover.
 */
export function HeadlineSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const c = slideCopy(derived.meta.language)
  const locale = localeFor(derived.meta.language)

  const cards: Array<{
    emoji: string
    when: string
    label: string
    value: string
    subtitle?: string
  }> = [
    {
      emoji: '🛡️',
      when: c.headline.whenEarly,
      label: c.headline.labelDeath,
      value: formatMoney(h.deathBenefit, currency, { locale }),
      subtitle: c.headline.subDeath,
    },
    {
      emoji: '💵',
      when: c.headline.whenLong,
      label: c.headline.labelIncome,
      value: h.incomeOptionAnnual
        ? `${formatMoney(h.incomeOptionAnnual, currency, { locale })} ${c.options.perYear}`
        : '—',
      subtitle: h.incomeToAge ? c.headline.illustratedToAge(h.incomeToAge) : undefined,
    },
    {
      emoji: '❤️',
      when: c.headline.whenIll,
      label: c.headline.labelLiving,
      // Show the real accessible % (typically 80% for the included ABRs), not a
      // blanket "up to 100%" — that gross figure is only reached with the
      // additional-cost Premium Chronic Care Rider, and the paid amount is
      // discounted below it anyway. Falls back to a neutral phrase if unset.
      value:
        h.livingBenefitPercent != null
          ? c.headline.livingUpToPercent(formatPercent(h.livingBenefitPercent, { locale }))
          : c.headline.livingEarly,
      // The client's actual accessible living benefit (parsed from the illustration,
      // e.g. the Terminal Illness Benefit), not the ABR lifetime regulatory cap —
      // that cap ($1.5M) is a structural ceiling, meaningless under a small policy.
      subtitle:
        h.livingBenefit != null
          ? c.headline.livingUpTo(formatMoney(h.livingBenefit, currency, { locale }))
          : undefined,
    },
  ]

  return (
    <ContentSlide eyebrow={c.headline.eyebrow} title={c.headline.title}>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.when} className="h-full">
            <div className="flex h-full flex-col items-center text-center">
              <div className="text-5xl">{c.emoji}</div>
              <div className="mt-4 font-sans text-lg font-semibold text-orange">{c.when}</div>
              <div className="mt-1 font-sans text-base text-muted">{c.label}</div>
              <div className="mt-5 font-serif text-4xl font-semibold leading-tight text-navy tabular-nums">
                {c.value}
              </div>
              {c.subtitle && (
                <div className="mt-2 font-sans text-base text-muted">{c.subtitle}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ContentSlide>
  )
}
