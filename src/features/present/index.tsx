import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  ErrorState,
  FitSlide,
  Loading,
  RenderModeProvider,
  buildSlides,
} from '@design-system'
import { derive } from '@domain/calc'
import { presentationRepository } from '@persistence'
import { routes } from '@app/routes'
import { queryKeys } from '@app/queryKeys'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'

registerNamespace('present', ptBR)

const NS = 'present'
const SWIPE_THRESHOLD = 50 // px of horizontal travel that counts as a swipe
const CONTROLS_HIDE_MS = 3500

/** Minimal shape of the Screen Wake Lock API (not always in lib.dom types). */
type WakeLockSentinelLike = { release: () => Promise<void> }
type WakeLockLike = { request: (type: 'screen') => Promise<WakeLockSentinelLike> }

/** Best-effort screen wake lock; silently no-ops where unsupported. */
function useScreenWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const wakeLock = (navigator as unknown as { wakeLock?: WakeLockLike }).wakeLock
    if (!wakeLock?.request) return

    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false

    const request = async () => {
      try {
        const s = await wakeLock.request('screen')
        if (cancelled) {
          void s.release().catch(() => {})
        } else {
          sentinel = s
        }
      } catch {
        // Unsupported, denied, or not allowed (e.g. tab not visible) — ignore.
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      try {
        void sentinel?.release().catch(() => {})
      } catch {
        // ignore
      }
      sentinel = null
    }
  }, [active])
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      {direction === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

export default function PresentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(NS)

  const query = useQuery({
    queryKey: id ? queryKeys.presentation(id) : ['presentation', 'none'],
    queryFn: () => presentationRepository.get(id as string),
    enabled: !!id,
    // Do nothing on resume/focus (older-user, PWA): no refetch-flash.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })

  const inputs = query.data

  // Derive + build slides once per loaded presentation. Guard against a derive
  // throw on malformed data so present mode never white-screens.
  const built = useMemo(() => {
    if (!inputs) return null
    try {
      return { slides: buildSlides(derive(inputs)) }
    } catch {
      return { slides: [] }
    }
  }, [inputs])

  const slides = built?.slides ?? []
  const count = slides.length

  const [index, setIndex] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerStartX = useRef<number | null>(null)
  // Set when a pointer gesture was a swipe, so the tap-zone click doesn't ALSO advance.
  const swipedRef = useRef(false)

  // Keep index in range if the slide set changes underneath us.
  useEffect(() => {
    setIndex((i) => (count === 0 ? 0 : Math.min(i, count - 1)))
  }, [count])

  const goTo = useCallback(
    (target: number | ((i: number) => number)) => {
      setIndex((i) => {
        const raw = typeof target === 'function' ? target(i) : target
        if (count === 0) return 0
        return Math.max(0, Math.min(raw, count - 1))
      })
    },
    [count],
  )

  const goNext = useCallback(() => goTo((i) => i + 1), [goTo])
  const goPrev = useCallback(() => goTo((i) => i - 1), [goTo])
  const exit = useCallback(() => navigate(routes.home), [navigate])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS)
  }, [])

  // Start the auto-hide countdown once a real deck is showing.
  const hasDeck = query.isSuccess && !!inputs && count > 0
  useEffect(() => {
    if (hasDeck) revealControls()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [hasDeck, revealControls])

  // Keyboard navigation.
  useEffect(() => {
    if (!hasDeck) return
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          goNext()
          revealControls()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          goPrev()
          revealControls()
          break
        case 'Home':
          e.preventDefault()
          goTo(0)
          revealControls()
          break
        case 'End':
          e.preventDefault()
          goTo(count - 1)
          revealControls()
          break
        case 'Escape':
          e.preventDefault()
          exit()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasDeck, goNext, goPrev, goTo, exit, revealControls, count])

  useScreenWakeLock(hasDeck)

  // --- Swipe handling on the stage ---
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointerStartX.current = e.clientX
      swipedRef.current = false
      revealControls()
    },
    [revealControls],
  )
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStartX.current
      pointerStartX.current = null
      if (start === null) return
      const dx = e.clientX - start
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        swipedRef.current = true // suppress the tap-zone click that follows
        if (dx < 0) goNext()
        else goPrev()
      }
    },
    [goNext, goPrev],
  )

  // ---- Non-deck states (rendered on a light surface so text is legible) ----
  if (query.isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-screen items-center justify-center bg-white">
        <Loading label={t('loading')} />
      </div>
    )
  }

  if (query.isError || !inputs) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-screen flex-col items-center justify-center gap-6 bg-white p-8">
        <ErrorState title={t('notFoundTitle')} description={t('notFoundDescription')} />
        <Link to={routes.home}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-screen flex-col items-center justify-center gap-6 bg-white p-8">
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        <Link to={routes.home}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>
    )
  }

  const current = slides[index]

  return (
    <div
      className={`fixed inset-0 z-[100] min-h-dvh w-screen bg-navy-deep ${
        controlsVisible ? '' : 'cursor-none'
      }`}
      onPointerMove={revealControls}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Stage — the scaled, letterboxed slide. */}
      <div className="absolute inset-0">
        <RenderModeProvider mode="present">
          <FitSlide>{current?.node}</FitSlide>
        </RenderModeProvider>
      </div>

      {/* Portrait-only hint: a 16:9 slide is a thin strip on a portrait phone. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 hidden justify-center px-6 max-md:portrait:flex">
        <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur">
          <span aria-hidden>↻</span>
          {t('rotateHint')}
        </span>
      </div>

      {/* Invisible large tap zones (left/right thirds) for tap-to-advance.
          A swipe sets swipedRef so the trailing click here does not double-advance. */}
      <button
        type="button"
        aria-hidden="true"
        onClick={() => {
          if (swipedRef.current) return
          goPrev()
        }}
        disabled={index === 0}
        className="no-print absolute inset-y-0 left-0 z-10 w-1/3 cursor-default bg-transparent disabled:pointer-events-none"
        tabIndex={-1}
      />
      <button
        type="button"
        aria-hidden="true"
        onClick={() => {
          if (swipedRef.current) return
          goNext()
        }}
        disabled={index === count - 1}
        className="no-print absolute inset-y-0 right-0 z-10 w-1/3 cursor-default bg-transparent disabled:pointer-events-none"
        tabIndex={-1}
      />

      {/* Visible controls (auto-hide). */}
      <div
        className={`no-print pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Close (X) — top right. */}
        <button
          type="button"
          aria-label={t('close')}
          onClick={exit}
          className="pointer-events-auto absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Prev chevron. */}
        <button
          type="button"
          aria-label={t('previous')}
          onClick={goPrev}
          disabled={index === 0}
          className="pointer-events-auto absolute left-5 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30"
        >
          <ChevronIcon direction="left" />
        </button>

        {/* Next chevron. */}
        <button
          type="button"
          aria-label={t('next')}
          onClick={goNext}
          disabled={index === count - 1}
          className="pointer-events-auto absolute right-5 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30"
        >
          <ChevronIcon direction="right" />
        </button>

        {/* Slide counter. */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-black/40 px-5 py-2 font-sans text-lg font-semibold tabular-nums text-white backdrop-blur">
            {t('slideCounter', { current: index + 1, total: count })}
          </span>
        </div>
      </div>
    </div>
  )
}
