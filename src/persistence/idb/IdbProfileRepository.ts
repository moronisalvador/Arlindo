import { brandingSchema, type Branding } from '@domain/model/presentation'
import type { ProfileRepository } from '../PresentationRepository'
import { getDb, META_STORE } from './db'

const PROFILE_KEY = 'profile'

/** Stores the single agent/company profile in the IndexedDB meta store. */
export class IdbProfileRepository implements ProfileRepository {
  async get(): Promise<Branding> {
    const db = await getDb()
    const raw = await db.get(META_STORE, PROFILE_KEY)
    const parsed = brandingSchema.safeParse(raw)
    return parsed.success ? parsed.data : brandingSchema.parse({})
  }

  async save(profile: Branding): Promise<Branding> {
    const clean = brandingSchema.parse(profile)
    const db = await getDb()
    await db.put(META_STORE, clean, PROFILE_KEY)
    return clean
  }
}
