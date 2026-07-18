import type { DerivedPresentation } from '@domain/model/derived'
import { BrandLogo, EyebrowLabel } from '@design-system/primitives'
import { cn } from '@shared/cn'
import { SlideRoot } from '../Slide'

/** Legal disclaimers slide (navy, quiet) — required data, rendered on screen + PDF. */
export function DisclaimersSlide({ derived }: { derived: DerivedPresentation }) {
  const items = derived.disclaimers.length
    ? derived.disclaimers
    : ['Documento ilustrativo. Valores projetados, não garantidos.']
  // Tighten type + spacing when the list is long (e.g. the estimate engine
  // prepends its own line) so the fixed 16:9 stage never clips.
  const dense = items.length > 6
  return (
    <SlideRoot className="bg-navy text-white">
      <span aria-hidden className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-navy-soft/50" />
      <div className="relative flex h-full flex-col justify-center px-20">
        <EyebrowLabel>Informações Importantes</EyebrowLabel>
        <h2 className="mt-2 font-serif text-3xl font-semibold">Avisos legais</h2>
        <ul className={cn('mt-6 max-w-[960px]', dense ? 'space-y-2' : 'space-y-3')}>
          {items.map((d, i) => (
            <li
              key={i}
              className={cn(
                'flex gap-3 font-sans leading-snug text-white/85',
                dense ? 'text-sm' : 'text-base',
              )}
            >
              <span className="text-orange">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center gap-3">
          <span className="rounded-lg bg-white px-3 py-2">
            <BrandLogo variant="color" className="h-8" />
          </span>
          <span className="font-sans text-sm text-white/70">
            {derived.meta.branding.company} · {derived.meta.branding.carrier}
          </span>
        </div>
      </div>
    </SlideRoot>
  )
}
