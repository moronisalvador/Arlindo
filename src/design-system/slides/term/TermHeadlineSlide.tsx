import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, formatPercent, localeFor } from '@domain/format'
import { slideCopy, conversionShort } from '@domain/presentationCopy'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * Term "three ways this protects you" headline: death protection, living benefits
 * (discounted), and the conversion privilege. No lifetime-income card — term has
 * no cash value.
 */
export function TermHeadlineSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const t = slideCopy(derived.meta.language).term
  const locale = localeFor(derived.meta.language)

  // Living benefit: lead with the accessible % (like the IUL headline), amount below.
  // Prefer an explicit percent; else derive it honestly from amount ÷ death benefit.
  const livingAmount = h.livingBenefit ?? h.deathBenefit
  const livingPct =
    h.livingBenefitPercent ??
    (h.livingBenefit != null && h.deathBenefit ? Math.round((h.livingBenefit / h.deathBenefit) * 100) : null)

  const cards: Array<{ emoji: string; when: string; label: string; value: string; subtitle?: string }> = [
    {
      emoji: '🛡️',
      when: t.headline.whenEarly,
      label: t.headline.labelDeath,
      value: formatMoney(h.deathBenefit, currency, { locale }),
      subtitle: t.headline.subDeath,
    },
    {
      emoji: '❤️',
      when: t.headline.whenIll,
      label: t.headline.labelLiving,
      // Percentage headline + amount subtitle (mirrors IUL); the % is a ceiling
      // ("até") for the terminal max — the subtitle keeps the discount/condition note.
      value:
        livingPct != null
          ? t.coverage.upToPercent(formatPercent(livingPct, { locale }))
          : t.coverage.upTo(formatMoney(livingAmount, currency, { locale })),
      subtitle:
        livingPct != null
          ? t.headline.livingAmountSub(formatMoney(livingAmount, currency, { locale }))
          : t.headline.livingDiscounted,
    },
    {
      emoji: '🔄',
      when: t.headline.whenConvert,
      label: t.headline.labelConvert,
      // Short, parallel token (e.g. "Até os 70 anos") — the full window text would
      // wrap to 4 lines in the big serif value slot and break the 3-card rhythm.
      value: conversionShort(derived.meta.language, h.conversionYears ?? null, h.conversionToAge ?? null),
      subtitle: t.headline.convertBody,
    },
  ]

  return (
    <ContentSlide eyebrow={t.headline.eyebrow} title={t.headline.title}>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.when} className="h-full">
            <div className="flex h-full flex-col items-center text-center">
              <div className="text-5xl">{card.emoji}</div>
              <div className="mt-4 font-sans text-lg font-semibold text-orange-dark">{card.when}</div>
              <div className="mt-1 font-sans text-base text-muted">{card.label}</div>
              <div className="mt-5 font-serif text-3xl font-semibold leading-tight text-navy tabular-nums">
                {card.value}
              </div>
              {card.subtitle && (
                <div className="mt-2 font-sans text-base text-muted">{card.subtitle}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ContentSlide>
  )
}
