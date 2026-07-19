import { useEffect } from 'react'
import { AppProviders } from '@app/providers'
import { AppRouter } from '@app/router'
import { requestPersistentStorage } from '@persistence/index'
import { UpdatePrompt } from '@shared/pwa/UpdatePrompt'

export default function App() {
  useEffect(() => {
    // Ask for durable storage so saved presentations resist iOS eviction.
    void requestPersistentStorage()
  }, [])

  return (
    <AppProviders>
      <AppRouter />
      <UpdatePrompt />
    </AppProviders>
  )
}
