import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Icon, type IconName } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * "The plan over time": deposit for N years → stop → income for life. Shown only
 * when the illustration gives us the pieces (payment years + LIBR income). Uses
 * the client's age + payment years to place the milestone.
 */
export function TimelineSlide({ derived }: { derived: DerivedPresentation }) {
  const { headline, meta } = derived
  const c = slideCopy(meta.language).timeline
  const locale = localeFor(meta.language)
  const per = headline.premiumMode === 'annual' ? '/ano' : '/mês'
  const premium = headline.premium != null ? `${formatMoney(headline.premium, meta.currency, { locale })}${per}` : '—'
  const stopAge = (meta.clientAge ?? 0) + (headline.paymentYears ?? 0)
  const income = formatMoney(headline.incomeOptionAnnual, meta.currency, { locale })

  const steps: Array<{ icon: IconName; label: string; body: string }> = [
    { icon: 'wallet', label: c.step1, body: c.step1Body(premium, headline.paymentYears ?? 0) },
    { icon: 'pause', label: c.step2, body: c.step2Body(stopAge) },
    { icon: 'banknote', label: c.step3, body: c.step3Body(income) },
  ]

  return (
    <ContentSlide eyebrow={c.eyebrow} title={c.title}>
      <div className="relative mt-6 grid grid-cols-3 gap-6">
        {/* connecting line */}
        <span aria-hidden className="absolute left-[16%] right-[16%] top-8 h-1 rounded-full bg-orange/40" />
        {steps.map((s, i) => (
          <div key={i} className="relative flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy">
              <Icon name={s.icon} className="h-8 w-8 text-orange" strokeWidth={1.4} />
            </div>
            <div className="mt-4 font-sans text-lg font-semibold text-orange-dark">{s.label}</div>
            <div className="mt-2 font-serif text-2xl font-semibold leading-tight text-navy">{s.body}</div>
          </div>
        ))}
      </div>
    </ContentSlide>
  )
}
