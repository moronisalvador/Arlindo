import { useParams } from 'react-router-dom'
import { EmptyState, Section } from '@design-system'

/**
 * STUB — owned by Wave W2 (large-touch IUL data-entry wizard + rider editor).
 * Serves both /cliente/novo and /cliente/:id (read the :id param). Foundation
 * seeds this; W2 overwrites this file. Keep the default export (no props).
 */
export default function DataEntryPage() {
  const { id } = useParams()
  return (
    <Section eyebrow="Dados" title={id ? 'Editar apresentação' : 'Nova apresentação'}>
      <EmptyState
        icon="📝"
        title="Em construção (W2)"
        description="O formulário guiado para digitar os números da ilustração ficará aqui."
      />
    </Section>
  )
}
