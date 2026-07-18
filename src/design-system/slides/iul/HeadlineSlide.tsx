import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
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

  // "Se você adoecer" — largest lifetime cap among included riders that have one.
  const capped = derived.riders.filter((r) => r.included && r.lifetimeMax != null)
  const largestCap = capped.reduce<number | undefined>((max, r) => {
    const v = r.lifetimeMax as number
    return max == null || v > max ? v : max
  }, undefined)

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
      value: largestCap != null ? c.headline.livingUpToFull : c.headline.livingEarly,
      subtitle:
        largestCap != null
          ? c.headline.livingUpTo(formatMoney(largestCap, currency, { compact: true, locale }))
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
