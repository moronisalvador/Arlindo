import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Card, Icon, type IconName } from '@design-system/primitives'
import { ContentSlide } from './ContentSlide'

/**
 * Per-condition living-benefit detail: each disease category and the amount the
 * illustration shows for it (discounted, condition-specific). Product-agnostic —
 * used on both IUL and Term when `derived.abrBenefits` was parsed. Gated by a flag
 * in buildSlides (see SHOW_LIVING_BENEFITS_DETAIL) so it can be removed in one line.
 */
export function LivingBenefitsDetailSlide({ derived }: { derived: DerivedPresentation }) {
  const c = slideCopy(derived.meta.language).livingBenefitsDetail
  const currency = derived.meta.currency
  const locale = localeFor(derived.meta.language)
  const money = (n: number) => formatMoney(n, currency, { locale })
  const a = derived.abrBenefits ?? {}

  const items: Array<{ icon: IconName; label: string; value: string }> = []
  if (a.terminal != null) items.push({ icon: 'dove', label: c.terminal, value: money(a.terminal) })
  if (a.chronicMonthly != null)
    items.push({ icon: 'stethoscope', label: c.chronic, value: `${money(a.chronicMonthly)} ${c.perMonth}` })
  if (a.critical != null) items.push({ icon: 'heartPulse', label: c.critical, value: c.upTo(money(a.critical)) })
  if (a.criticalInjury != null)
    items.push({ icon: 'bandage', label: c.criticalInjury, value: c.upTo(money(a.criticalInjury)) })
  if (a.alzheimer != null) items.push({ icon: 'brain', label: c.alzheimer, value: money(a.alzheimer) })

  return (
    <ContentSlide eyebrow={c.eyebrow} title={c.title}>
      <p className="mb-6 max-w-[900px] font-sans text-lg text-ink">{c.intro}</p>
      <div className="grid grid-cols-3 gap-5">
        {items.map((it) => (
          <Card key={it.label} className="h-full">
            <div className="flex h-full flex-col items-center text-center">
              <Icon name={it.icon} className="h-9 w-9 text-orange" strokeWidth={1.4} />
              <div className="mt-3 font-sans text-base text-muted">{it.label}</div>
              <div className="mt-2 font-serif text-2xl font-semibold text-navy tabular-nums">{it.value}</div>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-6 font-sans text-sm text-muted">{c.note}</p>
    </ContentSlide>
  )
}
