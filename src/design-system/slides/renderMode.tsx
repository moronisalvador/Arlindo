import { createContext, useContext, type ReactNode } from 'react'

/**
 * Slides render in three contexts and must look right in all of them:
 *  - 'preview' — scaled thumbnail in the editor
 *  - 'present' — full-screen live deck (animation allowed)
 *  - 'print'   — PDF export (static, page-break aware)
 * Slides read this to disable animation for print, etc. Present (W3) and PDF
 * (W4) compose the SAME slide components — they only set the mode.
 */
export type RenderMode = 'preview' | 'present' | 'print'

const RenderModeContext = createContext<RenderMode>('preview')

export function RenderModeProvider({
  mode,
  children,
}: {
  mode: RenderMode
  children: ReactNode
}) {
  return <RenderModeContext.Provider value={mode}>{children}</RenderModeContext.Provider>
}

export function useRenderMode(): RenderMode {
  return useContext(RenderModeContext)
}
