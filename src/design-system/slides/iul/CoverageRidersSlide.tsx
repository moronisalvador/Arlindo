import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, formatPercent } from '@domain/format'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Coverage structure (deposit / death benefit / living benefit) + included riders. */
export function CoverageRidersSlide({ derived }: { derived: DerivedPresentation }) {
  const h = derived.headline
  const currency = derived.meta.currency
  const perLabel = h.premiumMode === 'annual' ? '/ano' : '/mês'

  const stats: Array<{ label: string; value: string }> = [
    {
      label: 'Depósito',
      value: h.premium != null ? `${formatMoney(h.premium, currency)} ${perLabel}` : '—',
    },
    { label: 'Proteção por Morte', value: formatMoney(h.deathBenefit, currency) },
    {
      label: `Benefício em Vida${h.livingBenefitPercent ? ` (até ${formatPercent(h.livingBenefitPercent)})` : ''}`,
      value: formatMoney(h.livingBenefit, currency),
    },
  ]

  return (
    <ContentSlide eyebrow="Sua Cobertura" title="Estrutura do Plano">
      <div className="mb-8 grid grid-cols-3 gap-5">
        {stats.map((s) => (
          <Card key={s.label} headerStrip={s.label}>
            <div className="py-2 text-center">
              <span className="font-serif text-4xl font-semibold text-navy tabular-nums">
                {s.value}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <h4 className="mb-3 font-serif text-xl font-semibold text-navy">
        Benefícios em Vida inclusos
      </h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {derived.riders.slice(0, 8).map((r) => (
          <div key={r.id} className="flex items-baseline gap-2">
            <span className="text-orange">✓</span>
            <span className="font-sans text-lg text-ink">{r.label}</span>
            {r.additionalCost && (
              <span className="font-sans text-xs text-muted">(custo adicional)</span>
            )}
            {r.percent > 0 && (
              <span className="ml-auto font-sans text-sm font-semibold text-navy">
                até {formatPercent(r.percent)}
              </span>
            )}
          </div>
        ))}
      </div>
    </ContentSlide>
  )
}
