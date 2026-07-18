import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the Arlindo Supabase project is wired (URL + public anon key present). */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The shared Supabase client, or null when unconfigured. The app is local-first,
 * so a null client simply means "no cloud sync yet" — everything still works.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
