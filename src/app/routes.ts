/**
 * Route paths — the ONLY way features navigate to each other (no cross-feature
 * imports). Frozen in Foundation; wave features import these, never edit them.
 */
export const routes = {
  home: '/',
  presentations: '/',
  editorNew: '/cliente/novo',
  editor: (id: string) => `/cliente/${id}`,
  present: (id: string) => `/apresentar/${id}`,
  pdf: (id: string) => `/pdf/${id}`,
  settings: '/config',
  calc: '/calculo',
  preview: '/preview',
} as const

/** :param patterns for <Route path>. */
export const routePatterns = {
  home: '/',
  editorNew: '/cliente/novo',
  editor: '/cliente/:id',
  present: '/apresentar/:id',
  pdf: '/pdf/:id',
  settings: '/config',
  calc: '/calculo',
  preview: '/preview',
} as const
