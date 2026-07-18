/**
 * Central React Query key factory. W2 (data-entry) saving a presentation must
 * invalidate W1's (presentations list) query — both import keys from here so
 * there is NO wave→wave import edge and keys can never silently drift.
 */
export const queryKeys = {
  presentations: ['presentations'] as const,
  presentation: (id: string) => ['presentation', id] as const,
  profile: ['profile'] as const,
  session: ['session'] as const,
}
