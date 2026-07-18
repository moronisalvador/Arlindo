import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  ErrorState,
  Loading,
  RenderModeProvider,
  buildSlides,
} from '@design-system'
import { derive } from '@domain/calc'
import { downloadPptx } from '@export/pptx'
import { presentationRepository } from '@persistence'
import { routes } from '@app/routes'
import { queryKeys } from '@app/queryKeys'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'
import { PrintSlide } from './PrintSlide'

registerNamespace('exportPdf', ptBR)

const NS = 'exportPdf'
const HINT_KEY = 'arlindo:exportPdf:ipadHintDismissed'

/**
 * Print rules scoped to this route.
 *  - A4 landscape, zero margin; the toolbar (.no-print) is hidden.
 *  - Each `.pdf-page` becomes exactly one landscape page (297mm × 210mm in CSS
 *    px at 96dpi) with a page break after it (the last one has none).
 *  - The fixed 1280×720 slide (`.pdf-scaler`) is scaled by a fixed constant
 *    (1122.52 / 1280 ≈ 0.87696) so it fills the page width, centered and
 *    letterboxed. `!important` overrides the on-screen JS transform because a
 *    print snapshot does not re-run the ResizeObserver.
 *  - `print-color-adjust: exact` preserves the navy/orange slide backgrounds.
 *  - Recharts renders SVG, so charts stay vector-crisp — never rasterized.
 */
const PRINT_CSS = `
@media print {
  @page { size: A4 landscape; margin: 0; }
  .no-print { display: none !important; }
  html, body { background: #fff; }
  .pdf-root {
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .pdf-page-list {
    display: block !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }
  .pdf-page {
    width: 1122.52px !important;
    height: 793.7px !important;
    max-width: none !important;
    aspect-ratio: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    break-after: page;
    page-break-after: always;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .pdf-page[data-last="true"] {
    break-after: auto;
    page-break-after: auto;
  }
  .pdf-scaler {
    transform: scale(0.87696) !important;
    transform-origin: center center !important;
  }
}
`

export default function ExportPdfPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(NS)

  const [hintDismissed, setHintDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HINT_KEY) === '1'
    } catch {
      return false
    }
  })

  const dismissHint = useCallback(() => {
    setHintDismissed(true)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      // ignore (private mode / storage disabled)
    }
  }, [])

  const query = useQuery({
    queryKey: id ? queryKeys.presentation(id) : ['presentation', 'none'],
    queryFn: () => presentationRepository.get(id as string),
    enabled: !!id,
    // Older-user / PWA rule: never refetch-flash on resume or focus.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })

  const inputs = query.data

  // Derive + build slides once per loaded presentation; guard a derive throw so
  // the export screen never white-screens on malformed data.
  const slides = useMemo(() => {
    if (!inputs) return []
    try {
      return buildSlides(derive(inputs))
    } catch {
      return []
    }
  }, [inputs])

  const doPrint = useCallback(() => {
    window.print()
  }, [])

  const [pptxBusy, setPptxBusy] = useState(false)
  const [pptxError, setPptxError] = useState(false)
  const doPptx = useCallback(async () => {
    if (!inputs) return
    setPptxError(false)
    setPptxBusy(true)
    try {
      await downloadPptx(derive(inputs))
    } catch {
      setPptxError(true)
    } finally {
      setPptxBusy(false)
    }
  }, [inputs])

  // ---- Non-deck states (light surface so text stays legible) ----
  if (query.isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-surface-alt">
        <Loading label={t('loading')} />
      </div>
    )
  }

  if (query.isError || !inputs) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-surface-alt p-8">
        <ErrorState title={t('notFoundTitle')} description={t('notFoundDescription')} />
        <Link to={routes.home}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-surface-alt p-8">
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        <Link to={routes.home}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div className="pdf-root min-h-dvh w-full bg-surface-alt pb-16">
        {/* Toolbar — hidden in print. */}
        <div className="no-print sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-4 px-4 py-4">
            <Button variant="primary" onClick={doPrint}>
              {t('exportButton')}
            </Button>
            <Button variant="secondary" onClick={doPptx} disabled={pptxBusy}>
              {pptxBusy ? t('pptxBusy') : t('pptxButton')}
            </Button>
            <Link to={routes.home}>
              <Button variant="ghost">{t('back')}</Button>
            </Link>
            {pptxError && (
              <p role="alert" className="text-base font-medium text-red-600">
                {t('pptxError')}
              </p>
            )}
            <p className="ml-auto hidden text-base text-muted sm:block">
              {t('reviewHint')}
            </p>
          </div>

          {/* One-time iPad hint (dismissible, remembered in localStorage). */}
          {!hintDismissed && (
            <div className="border-t border-line bg-surface-alt">
              <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-3 px-4 py-3">
                <span className="text-xl" aria-hidden="true">
                  💡
                </span>
                <p className="flex-1 text-base text-navy">{t('ipadHint')}</p>
                <Button variant="ghost" size="md" onClick={dismissHint}>
                  {t('hintDismiss')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stacked, centered slide review (each page prints on its own sheet). */}
        <RenderModeProvider mode="print">
          <div className="pdf-page-list mx-auto flex max-w-[1000px] flex-col items-center gap-8 px-4 pt-8">
            {slides.map((slide, i) => (
              <PrintSlide
                key={slide.id}
                isLast={i === slides.length - 1}
                className="overflow-hidden rounded-2xl bg-white shadow-xl"
              >
                {slide.node}
              </PrintSlide>
            ))}
          </div>
        </RenderModeProvider>
      </div>
    </>
  )
}
