import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@design-system/primitives'
import { routes } from './routes'
import { cn } from '@shared/cn'

function navClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-[2.75rem] flex-1 items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-3 text-center font-sans text-sm font-semibold transition-colors sm:flex-none sm:text-base',
    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white',
  )
}

/** App chrome: navy top bar + nav. Wraps all non-fullscreen routes. */
export function AppShell() {
  const { t } = useTranslation('common')
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      {/* Stacks on phones (brand row + full-width nav row); single row on sm+. */}
      <header className="sticky top-0 z-header flex flex-col gap-2 bg-navy px-4 py-3 no-print sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <NavLink to={routes.home} className="flex items-center gap-2">
          <span className="rounded-lg bg-white px-2 py-1">
            <BrandLogo variant="color" className="h-6" />
          </span>
          <span className="font-serif text-xl font-semibold text-white">{t('appName')}</span>
        </NavLink>
        <nav className="flex items-center gap-1 sm:gap-1">
          <NavLink to={routes.home} end className={navClass}>
            {t('nav.presentations')}
          </NavLink>
          <NavLink to={routes.settings} className={navClass}>
            {t('nav.settings')}
          </NavLink>
          <NavLink to={routes.calc} className={navClass}>
            {t('nav.calc')}
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-5">
        <Outlet />
      </main>
    </div>
  )
}
