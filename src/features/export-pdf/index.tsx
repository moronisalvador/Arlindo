import { Link, useParams } from 'react-router-dom'
import { Button } from '@design-system'
import { routes } from '@app/routes'

/**
 * STUB — owned by Wave W4 (PDF export: print-document wrapper + @media print,
 * one slide per page; composes the Foundation slides). Fullscreen route.
 * Foundation seeds this; W4 overwrites this file. Keep the default export.
 */
export default function ExportPdfPage() {
  const { id } = useParams()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-alt p-8 text-center">
      <p className="font-serif text-3xl text-navy">Exportar PDF (W4)</p>
      <p className="text-muted">Apresentação: {id}</p>
      <Link to={routes.home}>
        <Button variant="ghost">Voltar</Button>
      </Link>
    </div>
  )
}
