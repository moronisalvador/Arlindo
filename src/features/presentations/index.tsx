import { Link } from 'react-router-dom'
import { Button, EmptyState, Section } from '@design-system'
import { routes } from '@app/routes'

/**
 * STUB — owned by Wave W1 (Presentations home + client CRUD + JSON backup +
 * profile settings). Foundation seeds this so the router + build work; W1
 * overwrites this file. Keep the default export signature (no props).
 */
export default function PresentationsPage() {
  return (
    <Section eyebrow="Apresentações" title="Suas apresentações">
      <EmptyState
        icon="📁"
        title="Em construção (W1)"
        description="A lista de clientes e apresentações será construída aqui."
        action={
          <div className="flex gap-3">
            <Link to={routes.editorNew}>
              <Button>Nova apresentação</Button>
            </Link>
            <Link to={routes.preview}>
              <Button variant="ghost">Ver design system</Button>
            </Link>
          </div>
        }
      />
    </Section>
  )
}
