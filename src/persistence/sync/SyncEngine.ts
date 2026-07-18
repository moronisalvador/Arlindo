/**
 * The sync seam. The wave builds against `PassthroughSync` (local-only, no-op),
 * so the app is fully functional and offline with zero cloud dependency. The
 * real `SupabaseSync` (push/pull IndexedDB ⇄ Supabase, last-write-wins on
 * updatedAt) is hardened independently and swapped in behind this interface.
 */
export interface SyncEngine {
  readonly id: 'passthrough' | 'supabase'
  /** Start background sync (if any). Safe to call when unconfigured. */
  start(): void
  stop(): void
  /** Best-effort immediate sync; resolves when done or a no-op. */
  syncNow(): Promise<void>
}

export class PassthroughSync implements SyncEngine {
  readonly id = 'passthrough' as const
  start(): void {}
  stop(): void {}
  async syncNow(): Promise<void> {}
}
