import type { DerivedPresentation } from '@domain/model/derived'
import { slideCopy } from '@domain/presentationCopy'
import { VsBadge } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Term vs IUL comparison — filled-navy recommended card vs light alternative, orange VS badge. */
export function ComparisonSlide({ derived }: { derived: DerivedPresentation }) {
  const c = slideCopy(derived.meta.language)
  const ROWS = c.comparison.rows
  return (
    <ContentSlide eyebrow={c.comparison.eyebrow} title={c.comparison.title}>
      <div className="relative grid grid-cols-2 gap-8 pt-4">
        <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <VsBadge />
        </span>
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h4 className="mb-4 text-center font-serif text-2xl font-semibold text-ink">
            {c.comparison.term}
          </h4>
          <dl className="space-y-3">
            {ROWS.map((r) => (
              <div key={r.label}>
                <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">
                  {r.label}
                </dt>
                <dd className="font-sans text-lg text-ink">{r.term}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-card bg-navy p-6 text-white shadow-lift">
          <h4 className="mb-4 text-center font-serif text-2xl font-semibold">{c.comparison.iul}</h4>
          <dl className="space-y-3">
            {ROWS.map((r) => (
              <div key={r.label}>
                <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-orange">
                  {r.label}
                </dt>
                <dd className="font-sans text-lg text-white">{r.iul}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </ContentSlide>
  )
}
