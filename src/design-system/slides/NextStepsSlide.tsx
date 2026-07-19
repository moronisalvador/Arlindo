import type { DerivedPresentation } from '@domain/model/derived'
import { slideCopy } from '@domain/presentationCopy'
import { ContentSlide } from './ContentSlide'

/** Closing call-to-action: three simple steps to move to a yes. */
export function NextStepsSlide({ derived }: { derived: DerivedPresentation }) {
  const n = slideCopy(derived.meta.language).nextSteps
  const steps = [n.step1, n.step2, n.step3]
  return (
    <ContentSlide eyebrow={n.eyebrow} title={n.title}>
      <div className="mx-auto mt-4 max-w-[900px] space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-5 rounded-card bg-surface p-5 shadow-card">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-2xl font-semibold text-white">
              {i + 1}
            </span>
            <span className="font-serif text-2xl text-navy">{s}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center font-sans text-lg text-muted">{n.close}</p>
    </ContentSlide>
  )
}
