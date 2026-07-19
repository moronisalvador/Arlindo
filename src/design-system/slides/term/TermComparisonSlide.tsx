import type { DerivedPresentation } from '@domain/model/derived'
import { slideCopy } from '@domain/presentationCopy'
import { VsBadge } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/**
 * Term vs Permanent — mirrors the IUL ComparisonSlide but with TERM as the
 * highlighted (navy) card, since this is a term presentation.
 */
export function TermComparisonSlide({ derived }: { derived: DerivedPresentation }) {
  const t = slideCopy(derived.meta.language).term
  const ROWS = t.comparison.rows
  return (
    <ContentSlide eyebrow={t.comparison.eyebrow} title={t.comparison.title}>
      <div className="relative grid grid-cols-2 gap-8 pt-4">
        <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <VsBadge />
        </span>
        {/* Term — recommended (navy) */}
        <div className="rounded-card bg-navy p-6 text-white shadow-lift">
          <h4 className="mb-4 text-center font-serif text-2xl font-semibold">{t.comparison.term}</h4>
          <dl className="space-y-3">
            {ROWS.map((r) => (
              <div key={r.label}>
                <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-orange">
                  {r.label}
                </dt>
                <dd className="font-sans text-lg text-white">{r.term}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Permanent — alternative (light) */}
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h4 className="mb-4 text-center font-serif text-2xl font-semibold text-ink">
            {t.comparison.permanent}
          </h4>
          <dl className="space-y-3">
            {ROWS.map((r) => (
              <div key={r.label}>
                <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">
                  {r.label}
                </dt>
                <dd className="font-sans text-lg text-ink">{r.permanent}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </ContentSlide>
  )
}
