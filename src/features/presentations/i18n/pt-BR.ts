/** pt-BR strings for the "presentations" namespace (W1 home + CRUD + backup). */
export const ptBR = {
  eyebrow: 'Apresentações',
  title: 'Suas apresentações',
  new: 'Nova apresentação',
  creating: 'Criando…',
  noName: 'Sem nome',
  product: {
    iul: 'IUL',
    annuity: 'Anuidade',
  },
  updated: 'Atualizado {{date}}',
  actions: {
    open: 'Abrir',
    present: 'Apresentar',
    exportPdf: 'Exportar PDF',
    duplicate: 'Duplicar',
    delete: 'Excluir',
  },
  loading: 'Carregando apresentações…',
  error: {
    title: 'Não foi possível carregar suas apresentações.',
    description: 'Verifique a conexão e tente novamente.',
    retry: 'Tentar novamente',
  },
  empty: {
    title: 'Nenhuma apresentação ainda',
    description: 'Crie sua primeira apresentação para começar.',
  },
  confirmDelete: {
    title: 'Excluir esta apresentação?',
    description: 'Esta ação não pode ser desfeita.',
    confirm: 'Excluir',
    cancel: 'Cancelar',
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
