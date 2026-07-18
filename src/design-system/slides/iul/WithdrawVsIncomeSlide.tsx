import type { DerivedPresentation } from '@domain/model/derived'
import { formatMoney } from '@domain/format'
import { Card, EyebrowLabel } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** The two options at the end of the accumulation period: resgatar vs deixar rendendo. */
export function WithdrawVsIncomeSlide({ derived }: { derived: DerivedPresentation }) {
  const { headline, meta } = derived
  const currency = meta.currency
  return (
    <ContentSlide eyebrow="A Partir Daí" title="Duas Opções">
      <div className="grid grid-cols-2 gap-8 pt-4">
        <Card tone="navy" className="text-center">
          <EyebrowLabel className="text-white/70">Opção 1 · Resgatar</EyebrowLabel>
          <div className="mt-4 font-serif text-5xl font-semibold text-white">
            {formatMoney(headline.projectedAccumulatedValue, currency)}
          </div>
          <p className="mt-4 font-sans text-lg text-white/80">
            Retirar o valor acumulado para usar como quiser.
          </p>
        </Card>
        <Card className="text-center">
          <EyebrowLabel>Opção 2 · Deixar rendendo</EyebrowLabel>
          <div className="mt-4 font-serif text-5xl font-semibold text-orange">
            {headline.incomeOptionAnnual != null
              ? `${formatMoney(headline.incomeOptionAnnual, currency)} /ano`
              : '—'}
          </div>
          <p className="mt-4 font-sans text-lg text-muted">
            Renda projetada
            {headline.incomeToAge ? `, potencialmente até os ${headline.incomeToAge} anos` : ''}.
          </p>
        </Card>
      </div>
    </ContentSlide>
  )
}
