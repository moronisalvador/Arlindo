import {
  presentationInputsSchema,
  CURRENT_SCHEMA_VERSION,
  type PresentationInputs,
} from '@domain/model/presentation'
import type {
  BackupFile,
  ImportMode,
  PresentationRepository,
} from '../PresentationRepository'
import { makeNewPresentation } from '../newPresentation'
import { getDb, PRESENTATIONS_STORE } from './db'

/** Local-first repository backed by IndexedDB. Source of truth for the UI. */
export class IdbPresentationRepository implements PresentationRepository {
  private listeners = new Set<() => void>()

  async list(): Promise<PresentationInputs[]> {
    const db = await getDb()
    const all = await db.getAll(PRESENTATIONS_STORE)
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async get(id: string): Promise<PresentationInputs | undefined> {
    const db = await getDb()
    return db.get(PRESENTATIONS_STORE, id)
  }

  async create(partial: Partial<PresentationInputs> = {}): Promise<PresentationInputs> {
    const p = makeNewPresentation(partial)
    return this.save(p)
  }

  async save(p: PresentationInputs): Promise<PresentationInputs> {
    const next: PresentationInputs = { ...p, updatedAt: new Date().toISOString() }
    const db = await getDb()
    await db.put(PRESENTATIONS_STORE, next)
    this.emit()
    return next
  }

  async remove(id: string): Promise<void> {
    const db = await getDb()
    await db.delete(PRESENTATIONS_STORE, id)
    this.emit()
  }

  async duplicate(id: string): Promise<PresentationInputs> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`Presentation ${id} not found`)
    const copy = makeNewPresentation({
      ...existing,
      title: existing.title ? `${existing.title} (cópia)` : '',
      client: { ...existing.client, name: `${existing.client.name} (cópia)`.trim() },
    })
    return this.save(copy)
  }

  async exportAll(): Promise<BackupFile> {
    const presentations = await this.list()
    return {
      kind: 'arlindo-backup',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      presentations,
    }
  }

  async exportOne(id: string): Promise<BackupFile> {
    const p = await this.get(id)
    return {
      kind: 'arlindo-backup',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      presentations: p ? [p] : [],
    }
  }

  async import(file: BackupFile, mode: ImportMode): Promise<void> {
    if (file.kind !== 'arlindo-backup') {
      throw new Error('Arquivo de backup inválido.')
    }
    const db = await getDb()
    if (mode === 'replace') {
      await db.clear(PRESENTATIONS_STORE)
    }
    const tx = db.transaction(PRESENTATIONS_STORE, 'readwrite')
    for (const raw of file.presentations) {
      const parsed = presentationInputsSchema.safeParse(raw)
      if (parsed.success) {
        await tx.store.put(parsed.data)
      }
    }
    await tx.done
    this.emit()
  }

  observe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const l of this.listeners) l()
  }
}
