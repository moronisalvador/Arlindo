import type { DerivedPresentation } from '@domain/model/derived'
import { BrandLogo } from '@design-system/primitives'
import { SlideRoot } from '../Slide'

function formatMonthYear(iso: string): string {
  const d = iso ? new Date(iso) : new Date()
  const s = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Cover slide — navy field, serif title, orange agent panel + logo circle (SCF cover motif). */
export function CoverSlide({ derived }: { derived: DerivedPresentation }) {
  const { branding, clientName, productName, preparedOn } = derived.meta
  return (
    <SlideRoot className="bg-navy text-white">
      {/* decorative navy circle top-right */}
      <span
        aria-hidden
        className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-navy-soft/60"
      />
      {/* logo chip */}
      <span className="absolute right-10 top-10 z-10 rounded-lg bg-white px-3 py-2">
        <BrandLogo variant="color" className="h-9" />
      </span>

      {/* orange agent panel on the right */}
      <div className="absolute inset-y-0 right-0 flex w-[320px] flex-col items-center justify-center bg-orange px-8 text-center">
        <p className="font-sans text-xl font-bold text-white">{branding.agentName || 'Agente'}</p>
        <p className="mt-2 font-sans text-sm text-white/90">{branding.agentTitle}</p>
        {branding.agentLicense && (
          <p className="mt-1 font-sans text-xs text-white/80">{branding.agentLicense}</p>
        )}
      </div>

      {/* title block */}
      <div className="absolute left-20 top-1/2 max-w-[760px] -translate-y-1/2">
        <h1 className="font-serif text-6xl font-semibold leading-tight">{productName}</h1>
        <p className="mt-3 font-serif text-2xl italic text-orange">Proposta Personalizada</p>
        <p className="mt-8 font-serif text-4xl">{clientName || 'Cliente'}</p>
        <span className="mt-4 block h-1 w-64 rounded-full bg-orange" />
        <p className="mt-6 font-sans text-lg text-white/80">{formatMonthYear(preparedOn)}</p>
      </div>
    </SlideRoot>
  )
}
