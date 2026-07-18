import type { DerivedPresentation } from '@domain/model/derived'
import { GrowthChart } from '@design-system/charts/GrowthChart'
import { CurrencyDisplay, EyebrowLabel } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Long-term accumulated-value projection with the headline figure. */
export function ProjectionSlide({ derived }: { derived: DerivedPresentation }) {
  const { series, headline, meta } = derived
  const years = series.policyYears
  const values = series.accumulatedValue ?? []
  const hasChart = years.length > 1 && values.length > 0

  return (
    <ContentSlide eyebrow="Projeção de Longo Prazo" title="Crescimento do Valor Acumulado">
      <div className="flex gap-8">
        <div className="w-[300px] shrink-0">
          <EyebrowLabel>
            Valor projetado{headline.projectionYears ? ` em ${headline.projectionYears} anos` : ''}
          </EyebrowLabel>
          <div className="mt-2">
            <CurrencyDisplay
              amount={headline.projectedAccumulatedValue}
              currency={meta.currency}
              className="text-6xl text-navy"
            />
          </div>
          <p className="mt-4 font-sans text-lg text-muted">
            Disponível para resgate ou para continuar rendendo.
          </p>
        </div>
        <div className="flex-1">
          {hasChart ? (
            <GrowthChart
              years={years}
              values={values}
              currency={meta.currency}
              width={820}
              height={420}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-card bg-surface text-muted">
              Adicione a tabela ano a ano para ver o gráfico.
            </div>
          )}
        </div>
      </div>
    </ContentSlide>
  )
}
