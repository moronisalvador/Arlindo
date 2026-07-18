import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@design-system/primitives'
import { routes } from './routes'
import { cn } from '@shared/cn'

function navClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-lg px-3 py-2 font-sans text-base font-semibold transition-colors',
    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white',
  )
}

/** App chrome: navy top bar + nav. Wraps all non-fullscreen routes. */
export function AppShell() {
  const { t } = useTranslation('common')
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-header flex items-center justify-between gap-4 bg-navy px-5 py-3 no-print">
        <NavLink to={routes.home} className="flex items-center gap-2">
          <span className="rounded-lg bg-white px-2 py-1">
            <BrandLogo variant="color" className="h-6" />
          </span>
          <span className="font-serif text-xl font-semibold text-white">{t('appName')}</span>
        </NavLink>
        <nav className="flex items-center gap-1">
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
      <main className="mx-auto w-full max-w-content flex-1 px-5 py-6">
        <Outlet />
      </main>
    </div>
  )
}
