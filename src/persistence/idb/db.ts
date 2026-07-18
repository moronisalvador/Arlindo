import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { PresentationInputs } from '@domain/model/presentation'

export const PRESENTATIONS_STORE = 'presentations'
export const META_STORE = 'meta'

interface ArlindoDB extends DBSchema {
  presentations: { key: string; value: PresentationInputs }
  meta: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<ArlindoDB>> | null = null

/** Test-only: drop the cached connection so a fresh IDBFactory is picked up. */
export function resetDbForTests(): void {
  dbPromise = null
}

export function getDb(): Promise<IDBPDatabase<ArlindoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ArlindoDB>('arlindo', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PRESENTATIONS_STORE)) {
          db.createObjectStore(PRESENTATIONS_STORE, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE)
        }
      },
    })
  }
  return dbPromise
}
