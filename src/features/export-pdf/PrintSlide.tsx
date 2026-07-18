import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { SLIDE_W, SLIDE_H } from '@design-system'

/**
 * One reviewable / printable page holding a single 1280×720 SlideRoot node.
 *
 * On screen: the wrapper is width-fluid with a 16:9 aspect ratio and the fixed
 * slide is scaled down with a JS-measured transform (top-left origin) so it
 * fills the wrapper exactly — the user scrolls a stack of them to review.
 *
 * In print: the `.pdf-page` / `.pdf-scaler` rules in the page's <style> take
 * over (with !important), sizing the wrapper to one A4-landscape page and
 * scaling the slide to fill the page width, centered and letterboxed. The JS
 * scale below is intentionally ignored for print because a print snapshot does
 * not re-run the ResizeObserver — the CSS constant is the source of truth there.
 * Charts stay SVG (Recharts) so they print vector-crisp.
 */
export function PrintSlide({
  children,
  isLast,
  className,
}: {
  children: ReactNode
  isLast: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(width / SLIDE_W)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={['pdf-page', className].filter(Boolean).join(' ')}
      data-last={isLast ? 'true' : 'false'}
      style={{ width: '100%', aspectRatio: `${SLIDE_W} / ${SLIDE_H}` }}
    >
      <div
        className="pdf-scaler"
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}
