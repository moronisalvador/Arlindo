import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Button } from '@design-system'

// How often to poll for a new release while the app stays open (installed PWAs
// on iPad are long-lived — without this they'd never notice a deploy). We also
// re-check every time the app is brought back to the foreground.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // hourly

// Safety net: if the new worker somehow never fires `controllerchange` after we
// tell it to activate, reload anyway so the button is never a dead end.
const RELOAD_FALLBACK_MS = 3000

/**
 * Registers the service worker and, when a new deploy is detected, shows a
 * small non-intrusive banner. Tapping "Atualizar" activates the new version and
 * reloads. Nothing reloads on its own — safe to keep on screen during a live
 * client presentation. This is why releases no longer need a manual Shift+R.
 *
 * We intentionally do NOT use the `updateSW` function returned by registerSW to
 * apply the update: because we detect updates with a plain `registration.update()`
 * (see below), workbox-window's internal bookkeeping isn't populated the way its
 * `updateSW()` expects, so it would post nothing and the button would look dead.
 * Instead we drive skip-waiting + reload ourselves against the live registration,
 * which is deterministic. (`clientsClaim: true` in vite.config makes the newly
 * activated worker take control of this tab, which is what fires
 * `controllerchange` — the event we reload on.)
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const cleanup = useRef<() => void>()

  useEffect(() => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return
        registrationRef.current = registration
        const check = () => {
          // Skip if offline or an install is already in flight.
          if (!navigator.onLine || registration.installing) return
          void registration.update()
        }
        const timer = window.setInterval(check, UPDATE_CHECK_INTERVAL_MS)
        const onVisible = () => {
          if (document.visibilityState === 'visible') check()
        }
        document.addEventListener('visibilitychange', onVisible)
        cleanup.current = () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
        }
      },
    })
    return () => cleanup.current?.()
  }, [])

  function applyUpdate() {
    const waiting = registrationRef.current?.waiting
    // No worker in the wings — a plain reload gets whatever's newest.
    if (!waiting) {
      window.location.reload()
      return
    }
    let reloaded = false
    const reload = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    // The new worker takes control (thanks to clientsClaim) → controllerchange.
    navigator.serviceWorker.addEventListener('controllerchange', reload)
    window.setTimeout(reload, RELOAD_FALLBACK_MS)
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-3 z-[9999] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-xl"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <span className="flex-1 text-base font-medium">Nova versão disponível</span>
      <Button
        size="md"
        variant="ghost"
        className="border-white/30 text-white hover:bg-white/10"
        onClick={() => setNeedRefresh(false)}
      >
        Depois
      </Button>
      <Button size="md" variant="primary" onClick={applyUpdate}>
        Atualizar
      </Button>
    </div>
  )
}
