/**
 * pt-BR strings for the "exportPdf" feature (print-based PDF export).
 * Registered at module load in index.tsx via registerNamespace('exportPdf', ptBR).
 */
export const ptBR = {
  title: 'Exportar PDF',
  exportButton: 'Exportar PDF',
  back: 'Voltar',
  // One-time hint shown at the top of the review screen (dismissible).
  ipadHint:
    "No iPad: toque em Compartilhar e depois em 'Salvar em PDF' / Imprimir.",
  hintDismiss: 'Entendi',
  reviewHint: 'Revise os slides abaixo e toque em “Exportar PDF” para gerar o arquivo.',
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
