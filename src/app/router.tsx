import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Loading } from '@design-system/primitives'
import { AppShell } from './AppShell'
import { routePatterns } from './routes'
import DesignPreviewPage from './DesignPreviewPage'

/**
 * The router is FROZEN in Foundation. It lazy-imports each feature's stable entry
 * (`@features/<x>` → default export, no props). Wave sessions overwrite ONLY
 * their own `features/<x>/index.tsx`; they never edit this file.
 */
const Presentations = lazy(() => import('@features/presentations'))
const DataEntry = lazy(() => import('@features/data-entry'))
const Present = lazy(() => import('@features/present'))
const ExportPdf = lazy(() => import('@features/export-pdf'))
const Settings = lazy(() => import('@features/settings'))
const CalcComingSoon = lazy(() => import('@features/calc-coming-soon'))

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Fullscreen routes (no app chrome). */}
          <Route path={routePatterns.present} element={<Present />} />
          <Route path={routePatterns.pdf} element={<ExportPdf />} />

          {/* Routes inside the app shell. */}
          <Route element={<AppShell />}>
            <Route path={routePatterns.home} element={<Presentations />} />
            <Route path={routePatterns.editorNew} element={<DataEntry />} />
            <Route path={routePatterns.editor} element={<DataEntry />} />
            <Route path={routePatterns.settings} element={<Settings />} />
            <Route path={routePatterns.calc} element={<CalcComingSoon />} />
            <Route path={routePatterns.preview} element={<DesignPreviewPage />} />
            <Route path="*" element={<Presentations />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
