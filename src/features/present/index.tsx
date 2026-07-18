import { Link, useParams } from 'react-router-dom'
import { Button } from '@design-system'
import { routes } from '@app/routes'

/**
 * STUB — owned by Wave W3 (full-screen present mode: deck nav, swipe/keyboard,
 * 100dvh overlay, wake-lock; composes the Foundation slides). Fullscreen route.
 * Foundation seeds this; W3 overwrites this file. Keep the default export.
 */
export default function PresentPage() {
  const { id } = useParams()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-navy-deep p-8 text-center text-white">
      <p className="font-serif text-3xl">Modo apresentação (W3)</p>
      <p className="text-white/70">Apresentação: {id}</p>
      <Link to={routes.home}>
        <Button variant="secondary">Voltar</Button>
      </Link>
    </div>
  )
}
