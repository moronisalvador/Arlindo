import type { PresentationInputs, Branding } from '@domain/model/presentation'

/** A portable JSON backup (whole-library or single-presentation). */
export interface BackupFile {
  kind: 'arlindo-backup'
  schemaVersion: number
  exportedAt: string
  presentations: PresentationInputs[]
  profile?: Branding
}

export type ImportMode = 'merge' | 'replace'

/**
 * The persistence seam. The UI talks ONLY to this interface. The current impl
 * is local-first (IndexedDB); a background syncer mirrors to Supabase behind a
 * flag. Any future backend is just another implementation — nothing else changes.
 */
export interface PresentationRepository {
  list(): Promise<PresentationInputs[]>
  get(id: string): Promise<PresentationInputs | undefined>
  create(partial?: Partial<PresentationInputs>): Promise<PresentationInputs>
  /** Upsert; always bumps updatedAt. */
  save(p: PresentationInputs): Promise<PresentationInputs>
  remove(id: string): Promise<void>
  duplicate(id: string): Promise<PresentationInputs>
  exportAll(): Promise<BackupFile>
  exportOne(id: string): Promise<BackupFile>
  import(file: BackupFile, mode: ImportMode): Promise<void>
  /** Subscribe to any change; returns an unsubscribe fn (drives the live list). */
  observe(listener: () => void): () => void
}

/** Agent / company profile (single record), applied to every new presentation. */
export interface ProfileRepository {
  get(): Promise<Branding>
  save(profile: Branding): Promise<Branding>
}
