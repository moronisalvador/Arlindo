import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney } from '@domain/format'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * National Life's "Die Too Soon / Live Too Long / Become Ill" headline, in pt-BR:
 * three ways the plan protects the client. Rendered right after the cover.
 */
export function HeadlineSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency

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
      when: 'Se você partir cedo',
      label: 'Proteção por Morte',
      value: formatMoney(h.deathBenefit, currency),
      subtitle: 'Pago à sua família, livre de imposto de renda',
    },
    {
      emoji: '💵',
      when: 'Se você viver muito',
      label: 'Renda vitalícia',
      value: h.incomeOptionAnnual
        ? `${formatMoney(h.incomeOptionAnnual, currency)} /ano`
        : '—',
      subtitle: h.incomeToAge ? `ilustrada até os ${h.incomeToAge} anos` : undefined,
    },
    {
      emoji: '❤️',
      when: 'Se você adoecer',
      label: 'Benefícios em vida',
      value: largestCap != null ? 'até 100% do benefício' : 'Acesso antecipado ao benefício',
      subtitle:
        largestCap != null
          ? `até ${formatMoney(largestCap, currency, { compact: true })}`
          : undefined,
    },
  ]

  return (
    <ContentSlide eyebrow="Três Formas de Proteger" title="O que este plano faz por você">
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
