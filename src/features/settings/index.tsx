import { EmptyState, Section } from '@design-system'

/**
 * STUB — owned by Wave W1 (agent/company profile settings screen; the profile
 * MODEL + storage live in Foundation). Foundation seeds this; W1 overwrites it.
 * Keep the default export (no props).
 */
export default function SettingsPage() {
  return (
    <Section eyebrow="Configurações" title="Perfil do agente">
      <EmptyState
        icon="⚙️"
        title="Em construção (W1)"
        description="Nome, licença, empresa e seguradora — preenchidos uma vez e aplicados a todas as apresentações."
      />
    </Section>
  )
}
