import type { DerivedPresentation } from '@domain/model/derived'
import { localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { GrowthChart } from '@design-system/charts/GrowthChart'
import { CurrencyDisplay, EyebrowLabel } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Long-term accumulated-value projection with the headline figure. */
export function ProjectionSlide({ derived }: { derived: DerivedPresentation }) {
  const { series, headline, meta } = derived
  const c = slideCopy(meta.language)
  const locale = localeFor(meta.language)
  const years = series.policyYears
  const values = series.accumulatedValue ?? []
  const hasChart = years.length > 1 && values.length > 0

  return (
    <ContentSlide eyebrow={c.projection.eyebrow} title={c.projection.title}>
      <div className="flex gap-8">
        <div className="w-[300px] shrink-0">
          <EyebrowLabel>{c.projection.projectedLabel(headline.projectionYears ?? null)}</EyebrowLabel>
          <div className="mt-2">
            <CurrencyDisplay
              amount={headline.projectedAccumulatedValue}
              currency={meta.currency}
              locale={locale}
              className="text-6xl text-navy"
            />
          </div>
          <p className="mt-4 font-sans text-lg text-muted">{c.projection.sub}</p>
          {headline.guaranteedProjectedValue != null && (
            <div className="mt-5 rounded-card bg-surface p-4">
              <EyebrowLabel>{c.projection.guaranteedLabel}</EyebrowLabel>
              <div className="mt-1">
                <CurrencyDisplay
                  amount={headline.guaranteedProjectedValue}
                  currency={meta.currency}
                  locale={locale}
                  className="text-3xl text-navy"
                />
              </div>
              <p className="mt-1 font-sans text-sm text-muted">{c.projection.guaranteedSub}</p>
            </div>
          )}
        </div>
        <div className="flex-1">
          {hasChart ? (
            <GrowthChart
              years={years}
              values={values}
              currency={meta.currency}
              locale={locale}
              yearLabel={c.table.year}
              xAxisLabel={c.table.year}
              markerYear={headline.projectionYears}
              markerValue={headline.projectedAccumulatedValue}
              width={820}
              height={420}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-card bg-surface text-muted">
              {c.projection.empty}
            </div>
          )}
        </div>
      </div>
    </ContentSlide>
  )
}
