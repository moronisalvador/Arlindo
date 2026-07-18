import { IdbPresentationRepository } from './idb/IdbPresentationRepository'
import { IdbProfileRepository } from './idb/IdbProfileRepository'
import { PassthroughSync, type SyncEngine } from './sync/SyncEngine'
import type { PresentationRepository, ProfileRepository } from './PresentationRepository'

export type {
  PresentationRepository,
  ProfileRepository,
  BackupFile,
  ImportMode,
} from './PresentationRepository'
export {
  getCurrentUser,
  signInWithEmail,
  signOut,
  onAuthChange,
  isSupabaseConfigured,
  type AuthUser,
} from './auth'

/** App-wide singletons. Features import these — never construct their own. */
export const presentationRepository: PresentationRepository =
  new IdbPresentationRepository()

export const profileRepository: ProfileRepository = new IdbProfileRepository()

/**
 * Sync is Passthrough (local-only) until the Supabase project is reachable and
 * SupabaseSync is wired. Swapping it changes nothing else in the app.
 */
export const sync: SyncEngine = new PassthroughSync()

/** Ask the browser to make storage durable (resists iOS eviction; best with PWA install). */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
    try {
      return await navigator.storage.persist()
    } catch {
      return false
    }
  }
  return false
}
