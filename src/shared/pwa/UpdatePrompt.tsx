import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Button } from '@design-system'

// How often to poll for a new release while the app stays open (installed PWAs
// on iPad are long-lived — without this they'd never notice a deploy). We also
// re-check every time the app is brought back to the foreground.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // hourly

/**
 * Registers the service worker and, when a new deploy is detected, shows a
 * small non-intrusive banner. Tapping "Atualizar" activates the new version and
 * reloads. Nothing reloads on its own — safe to keep on screen during a live
 * client presentation. This is why releases no longer need a manual Shift+R.
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  // registerSW returns the "apply update + reload" function.
  const applyUpdate = useRef<(reload?: boolean) => Promise<void>>()
  const cleanup = useRef<() => void>()

  useEffect(() => {
    applyUpdate.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return
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
      <Button size="md" variant="primary" onClick={() => void applyUpdate.current?.(true)}>
        Atualizar
      </Button>
    </div>
  )
}
