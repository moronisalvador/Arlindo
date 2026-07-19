import { useSearchParams } from 'react-router-dom'
import { derive } from '@domain/calc'
import { sampleIulPresentation, sampleTermPresentation } from '@domain/model/sample'
import {
  buildSlides,
  Button,
  Card,
  CurrencyDisplay,
  DecorativeCircle,
  EmptyState,
  ErrorState,
  EyebrowLabel,
  Field,
  FitSlide,
  Loading,
  RenderModeProvider,
  Section,
  StepCircle,
  TextInput,
  VsBadge,
} from '@design-system'

/**
 * Foundation-owned QA gallery: renders every primitive and the full sample slide
 * deck so the design system can be reviewed at /preview. Not a wave feature.
 */
export default function DesignPreviewPage() {
  const [params] = useSearchParams()
  const only = params.get('only')
  const product = params.get('product') === 'term' ? 'term' : 'iul'
  const derived = derive(
    product === 'term' ? sampleTermPresentation() : sampleIulPresentation(),
  )
  const slides = buildSlides(derived)

  // Single-slide mode (?only=<id>): a full-viewport 16:9 stage over the app chrome,
  // so one slide can be captured cleanly (light page for screenshots / Playwright).
  if (only != null) {
    const slide = slides.find((s) => s.id === only)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white">
        <RenderModeProvider mode="preview">
          <div data-slide-stage={only} className="aspect-video max-h-screen w-full overflow-hidden">
            {slide ? (
              <FitSlide>{slide.node}</FitSlide>
            ) : (
              <ErrorState description={`Slide "${only}" não encontrado.`} />
            )}
          </div>
        </RenderModeProvider>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <Section eyebrow="Design System" title="Primitivos">
        <div className="flex flex-wrap gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Excluir</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card headerStrip="Investimento Inicial">
            <CurrencyDisplay amount={200000} className="text-4xl text-navy" />
          </Card>
          <Card tone="navy">
            <EyebrowLabel className="text-white/70">Card navy</EyebrowLabel>
            <p className="mt-2 font-serif text-2xl">Recomendado ★</p>
          </Card>
          <Card tone="alt">
            <div className="flex items-center gap-3">
              <StepCircle n={1} />
              <VsBadge />
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nome do cliente" hint="Como aparecerá na capa">
            <TextInput placeholder="Ex.: Iracema" />
          </Field>
          <div className="relative overflow-hidden rounded-card bg-navy p-6">
            <DecorativeCircle className="-right-10 -top-10 h-32 w-32" />
            <p className="relative font-serif text-xl text-white">Círculo decorativo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card><Loading /></Card>
          <Card><EmptyState title="Sem apresentações" description="Crie a primeira." /></Card>
          <Card><ErrorState description="Falha ao carregar." /></Card>
        </div>
      </Section>

      <Section eyebrow="Design System" title="Slides (amostra)">
        <RenderModeProvider mode="preview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {slides.map((s) => (
              <div key={s.id} className="space-y-2">
                <EyebrowLabel>{s.title}</EyebrowLabel>
                <div className="aspect-video overflow-hidden rounded-card shadow-card">
                  <FitSlide>{s.node}</FitSlide>
                </div>
              </div>
            ))}
          </div>
        </RenderModeProvider>
      </Section>
    </div>
  )
}
