/**
 * pt-BR strings for the "exportPdf" feature (print-based PDF export).
 * Registered at module load in index.tsx via registerNamespace('exportPdf', ptBR).
 */
export const ptBR = {
  title: 'Exportar apresentação',
  exportButton: 'Exportar PDF',
  pptxButton: 'Baixar PowerPoint (.pptx)',
  pptxBusy: 'Gerando .pptx…',
  pptxError: 'Não foi possível gerar o arquivo. Tente novamente.',
  back: 'Voltar',
  // One-time hint shown at the top of the review screen (dismissible).
  ipadHint:
    "No iPad: toque em Compartilhar e depois em 'Salvar em PDF' / Imprimir.",
  hintDismiss: 'Entendi',
  reviewHint: 'Revise os slides abaixo e escolha o formato: PDF ou PowerPoint (.pptx).',
  loading: 'Carregando apresentação…',
  notFoundTitle: 'Apresentação não encontrada',
  notFoundDescription:
    'Não foi possível abrir esta apresentação. Ela pode ter sido excluída.',
  emptyTitle: 'Nada para exportar',
  emptyDescription:
    'Esta apresentação ainda não tem slides. Complete os dados do cliente.',
  slideLabel: 'Slide {{current}} de {{total}} — {{name}}',
} as const

export type ExportPdfStrings = typeof ptBR
