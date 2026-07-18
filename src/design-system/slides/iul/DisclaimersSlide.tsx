import type { DerivedPresentation } from '@domain/model/derived'
import { BrandLogo, EyebrowLabel } from '@design-system/primitives'
import { SlideRoot } from '../Slide'

/** Legal disclaimers slide (navy, quiet) — required data, rendered on screen + PDF. */
export function DisclaimersSlide({ derived }: { derived: DerivedPresentation }) {
  const items = derived.disclaimers.length
    ? derived.disclaimers
    : ['Documento ilustrativo. Valores projetados, não garantidos.']
  return (
    <SlideRoot className="bg-navy text-white">
      <span aria-hidden className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-navy-soft/50" />
      <div className="relative flex h-full flex-col justify-center px-20">
        <EyebrowLabel>Informações Importantes</EyebrowLabel>
        <h2 className="mt-2 font-serif text-3xl font-semibold">Avisos legais</h2>
        <ul className="mt-6 max-w-[960px] space-y-3">
          {items.map((d, i) => (
            <li key={i} className="flex gap-3 font-sans text-base leading-snug text-white/85">
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
