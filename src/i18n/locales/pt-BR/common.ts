export const common = {
  appName: 'Arlindo',
  tagline: 'Apresentações de seguros e aposentadoria',
  nav: {
    presentations: 'Apresentações',
    settings: 'Configurações',
    calc: 'Cálculo',
  },
  actions: {
    new: 'Nova apresentação',
    open: 'Abrir',
    edit: 'Editar',
    present: 'Apresentar',
    exportPdf: 'Exportar PDF',
    duplicate: 'Duplicar',
    delete: 'Excluir',
    save: 'Salvar',
    cancel: 'Cancelar',
    back: 'Voltar',
    confirm: 'Confirmar',
    exportBackup: 'Salvar backup',
    importBackup: 'Importar backup',
  },
  states: {
    loading: 'Carregando…',
    empty: 'Nada por aqui ainda.',
    error: 'Algo deu errado.',
    retry: 'Tentar novamente',
    notFound: 'Não encontrado.',
  },
  common: {
    client: 'Cliente',
    updated: 'Atualizado',
    soon: 'Em breve',
  },
} as const

export type CommonResources = typeof common
