import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@shared/cn'

/** Authoring coordinate system: every slide is composed at exactly 1280×720 (16:9). */
export const SLIDE_W = 1280
export const SLIDE_H = 720

/** The fixed 16:9 canvas a slide is authored on. Scaling is handled by FitSlide. */
export function SlideRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  // NOTE: no default bg/text here — callers set them (e.g. bg-navy for the cover).
  // A hardcoded bg would win the Tailwind conflict and blank out navy slides.
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width: SLIDE_W, height: SLIDE_H }}
    >
      {children}
    </div>
  )
}

/**
 * Scales a SlideRoot to fit its container (contain), letterboxed on `background`.
 * Used by present mode (full viewport) and editor previews — identical geometry.
 */
export function FitSlide({
  children,
  background = 'bg-navy-deep',
  className,
}: {
  children: ReactNode
  background?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        setScale(Math.min(width / SLIDE_W, height / SLIDE_H))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden', background, className)}
    >
      <div style={{ transform: `scale(${scale})` }} className="shrink-0 origin-center">
        {children}
      </div>
    </div>
  )
}
