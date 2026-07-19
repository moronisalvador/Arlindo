/** pt-BR strings for the "settings" namespace (W1 agent profile). */
export const ptBR = {
  eyebrow: 'Configurações',
  title: 'Perfil do agente',
  description:
    'Preenchido uma vez e aplicado automaticamente a cada nova apresentação.',
  fields: {
    agentName: 'Nome do agente',
    agentTitle: 'Cargo',
    agentLicense: 'Licença',
    company: 'Empresa',
    carrier: 'Seguradora',
  },
  hints: {
    agentName: 'Aparece na capa de cada apresentação.',
  },
  placeholders: {
    agentName: 'Ex.: Arlindo Silva',
    agentTitle: 'Ex.: Agente Financeiro Licenciado',
    agentLicense: 'Ex.: 123456',
    company: 'Ex.: Second Chance Financial',
    carrier: 'Ex.: National Life Group',
  },
  save: 'Salvar',
  saving: 'Salvando…',
  saved: 'Salvo',
  loading: 'Carregando perfil…',
  error: {
    title: 'Não foi possível carregar o perfil.',
    retry: 'Tentar novamente',
    save: 'Não foi possível salvar. Tente novamente.',
  },
  backup: {
    title: 'Backup dos dados',
    description: 'Salve uma cópia de todas as apresentações ou restaure de um arquivo.',
    export: 'Salvar backup',
    import: 'Importar backup',
    exporting: 'Salvando…',
    importing: 'Importando…',
    successExport: 'Backup salvo com sucesso.',
    successImport: 'Backup importado com sucesso.',
    errorExport: 'Não foi possível salvar o backup.',
    errorImport: 'Arquivo inválido. Não foi possível importar.',
  },
} as const
