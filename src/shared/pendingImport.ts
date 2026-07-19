import type { ParsedIllustration } from '@domain/illustration/types'

/**
 * One-shot handoff of a parsed illustration from the home "Importar PDF" flow to
 * the editor. The home page parses the PDF (to validate it and learn the product
 * type) and creates the presentation, but does NOT apply the numbers — it stashes
 * the parsed result here and opens the editor, which shows the same review dialog
 * as an in-editor import. Keyed by presentation id so the editor only consumes an
 * import meant for the presentation it just opened, and cleared on read so a plain
 * revisit never re-triggers the dialog.
 */
let pending: { id: string; parsed: ParsedIllustration } | null = null

export function setPendingImport(id: string, parsed: ParsedIllustration): void {
  pending = { id, parsed }
}

export function takePendingImport(id: string): ParsedIllustration | null {
  if (pending && pending.id === id) {
    const parsed = pending.parsed
    pending = null
    return parsed
  }
  return null
}
