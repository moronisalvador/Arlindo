import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, formatPercent, localeFor } from '@domain/format'
import { slideCopy, conversionShort } from '@domain/presentationCopy'
import { Card, Icon, type IconName } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * Term "three ways this protects you" headline: death protection, living benefits
 * (discounted), and the conversion privilege. No lifetime-income card — term has
 * no cash value.
 */
export function TermHeadlineSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const c = slideCopy(derived.meta.language)
  const t = c.term
  const locale = localeFor(derived.meta.language)

  // When the agent marked one of 2+ coverage options "recommended", stitch the
  // headline back to it — closes the loop opened by the comparison table.
  const options = derived.coverageOptions
  const recommendedIndex = options?.findIndex((o) => o.id === derived.recommendedOptionId) ?? -1
  const recommendedOption = recommendedIndex >= 0 ? options?.[recommendedIndex] : undefined
  const recommendedLabel =
    recommendedOption && (recommendedOption.label ?? c.optionsComparison.optionLabel(recommendedIndex + 1))

  // Living benefit: lead with the accessible % (like the IUL headline), amount below.
  // Prefer an explicit percent; else derive it honestly from amount ÷ death benefit.
  const livingAmount = h.livingBenefit ?? h.deathBenefit
  const livingPct =
    h.livingBenefitPercent ??
    (h.livingBenefit != null && h.deathBenefit ? Math.round((h.livingBenefit / h.deathBenefit) * 100) : null)

  const cards: Array<{ icon: IconName; when: string; label: string; value: string; subtitle?: string }> = [
    {
      icon: 'shield',
      when: t.headline.whenEarly,
      label: t.headline.labelDeath,
      value: formatMoney(h.deathBenefit, currency, { locale }),
      subtitle: t.headline.subDeath,
    },
    {
      icon: 'heart',
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
      icon: 'refresh',
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
      {recommendedLabel && (
        <p className="mb-4 text-center font-sans text-base font-semibold text-orange-dark">
          {c.recommendedCaption(recommendedLabel)}
        </p>
      )}
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.when} className="h-full">
            <div className="flex h-full flex-col items-center text-center">
              <Icon name={card.icon} className="h-12 w-12 text-orange" strokeWidth={1.3} />
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
