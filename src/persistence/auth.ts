import { supabase, isSupabaseConfigured } from './supabaseClient'

export interface AuthUser {
  id: string
  email?: string
}

/** Current signed-in user (null when unconfigured or signed out). */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null
}

/** Send a magic-link sign-in email (the dad logs in once per device). */
export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sincronização na nuvem não configurada.' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  })
  return error ? { error: error.message } : {}
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}

/** Subscribe to auth changes; returns an unsubscribe fn. No-op when unconfigured. */
export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  if (!supabase) {
    cb(null)
    return () => {}
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null)
  })
  return () => data.subscription.unsubscribe()
}

export { isSupabaseConfigured }
