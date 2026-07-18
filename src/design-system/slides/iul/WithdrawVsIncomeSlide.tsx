import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { Card, EyebrowLabel } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** The two options at the end of the accumulation period: resgatar vs deixar rendendo. */
export function WithdrawVsIncomeSlide({ derived }: { derived: DerivedPresentation }) {
  const { headline, meta } = derived
  const currency = meta.currency
  const c = slideCopy(meta.language)
  const locale = localeFor(meta.language)
  return (
    <ContentSlide eyebrow={c.options.eyebrow} title={c.options.title}>
      <div className="grid grid-cols-2 gap-8 pt-4">
        <Card tone="navy" className="text-center">
          <EyebrowLabel className="text-white/70">{c.options.opt1}</EyebrowLabel>
          <div className="mt-4 font-serif text-5xl font-semibold text-white">
            {formatMoney(
              headline.projectedCashSurrenderValue ?? headline.projectedAccumulatedValue,
              currency,
              { locale },
            )}
          </div>
          <p className="mt-4 font-sans text-lg text-white/80">{c.options.opt1Body}</p>
        </Card>
        <Card className="text-center">
          <EyebrowLabel>{c.options.opt2}</EyebrowLabel>
          <div className="mt-4 font-serif text-5xl font-semibold text-navy">
            {headline.incomeOptionAnnual != null
              ? `${formatMoney(headline.incomeOptionAnnual, currency, { locale })} ${c.options.perYear}`
              : c.options.none}
          </div>
          <p className="mt-4 font-sans text-lg text-muted">
            {c.options.incomeForLife}
            {headline.incomeToAge ? c.options.illustratedToAge(headline.incomeToAge) : ''}.
          </p>
        </Card>
      </div>
    </ContentSlide>
  )
}
