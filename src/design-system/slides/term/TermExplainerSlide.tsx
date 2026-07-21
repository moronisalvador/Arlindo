import type { DerivedPresentation } from '@domain/model/derived'
import { slideCopy } from '@domain/presentationCopy'
import { Card, Icon, type IconName } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

const ICONS: IconName[] = ['shield', 'banknote', 'heart', 'refresh']

/** "O que é o Seguro Temporário" explainer — four pillars (mirrors the IUL one). */
export function TermExplainerSlide({ derived }: { derived: DerivedPresentation }) {
  const c = slideCopy(derived.meta.language)
  const name = derived.meta.clientName || c.clientFallback
  const intro = c.term.explainer.intro(name)
  return (
    <ContentSlide eyebrow={c.term.explainer.eyebrow} title={c.term.explainer.title}>
      <p className="mb-8 max-w-[900px] font-sans text-xl leading-relaxed text-ink">
        {intro.pre}
        <strong>{intro.strong}</strong>
        {intro.post}
      </p>
      <div className="grid grid-cols-4 gap-5">
        {c.term.explainer.pillars.map((p, i) => (
          <Card key={p.title} className="h-full">
            <Icon name={ICONS[i]} className="h-9 w-9 text-orange" strokeWidth={1.4} />
            <h4 className="mt-3 font-serif text-xl font-semibold text-navy">{p.title}</h4>
            <p className="mt-2 font-sans text-base text-muted">{p.body}</p>
          </Card>
        ))}
      </div>
    </ContentSlide>
  )
}
