import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, FitSlide, RenderModeProvider, buildSlides } from '@design-system'
import { derive } from '@domain/calc'
import type { PresentationInputs } from '@domain/model/presentation'

/**
 * Live preview of the derived slides while editing. Shows the cover and the
 * projection slide (falls back to the first two available) as scaled 16:9
 * thumbnails using the shared render pipeline in "preview" mode.
 */
export function SlidePreview({ inputs }: { inputs: PresentationInputs }) {
  const { t } = useTranslation('dataEntry')

  const slides = useMemo(() => {
    try {
      return buildSlides(derive(inputs))
    } catch {
      return []
    }
  }, [inputs])

  const chosen = useMemo(() => {
    const wanted = inputs.productType === 'term' ? ['cover', 'coverage'] : ['cover', 'projection']
    const picked = wanted
      .map((id) => slides.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
    if (picked.length > 0) return picked
    return slides.slice(0, 2)
  }, [slides, inputs.productType])

  if (chosen.length === 0) {
    return <EmptyState icon="👀" title={t('preview.empty')} />
  }

  return (
    <div className="space-y-4">
      <p className="text-base text-muted">{t('preview.hint')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chosen.map((slide) => (
          <figure key={slide.id} className="min-w-0 space-y-2">
            <div className="aspect-video overflow-hidden rounded-card border border-line shadow-card">
              <RenderModeProvider mode="preview">
                <FitSlide>{slide.node}</FitSlide>
              </RenderModeProvider>
            </div>
            <figcaption className="text-sm font-semibold text-muted">{slide.title}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
