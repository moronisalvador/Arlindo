import {
  presentationInputsSchema,
  CURRENT_SCHEMA_VERSION,
  type PresentationInputs,
} from '@domain/model/presentation'
import { DEFAULT_IUL_RIDERS, DEFAULT_IUL_DISCLAIMERS } from '@domain/model/riders'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * Builds a fresh presentation with schema defaults, prefilled IUL riders +
 * legal disclaimers, then merges any partial (e.g. the saved branding profile).
 */
export function makeNewPresentation(partial: Partial<PresentationInputs> = {}): PresentationInputs {
  const now = new Date().toISOString()
  const base = presentationInputsSchema.parse({
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    productType: partial.productType ?? 'iul',
  })
  const merged: PresentationInputs = {
    ...base,
    ...partial,
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: now,
    branding: { ...base.branding, ...partial.branding },
    client: { ...base.client, ...partial.client },
    iul: {
      ...base.iul,
      riders: DEFAULT_IUL_RIDERS.map((r) => ({ ...r })),
      ...partial.iul,
    },
    disclaimers:
      partial.disclaimers && partial.disclaimers.length > 0
        ? partial.disclaimers
        : [...DEFAULT_IUL_DISCLAIMERS],
  }
  return merged
}
