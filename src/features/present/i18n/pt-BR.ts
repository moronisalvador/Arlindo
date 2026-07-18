/**
 * pt-BR strings for the "present" feature (full-screen present mode).
 * Registered at module load in index.tsx via registerNamespace('present', ptBR).
 */
export const ptBR = {
  exit: 'Sair',
  close: 'Fechar apresentação',
  previous: 'Slide anterior',
  next: 'Próximo slide',
  slide: 'Slide',
  slideCounter: '{{current}} / {{total}}',
  loading: 'Carregando apresentação…',
  notFoundTitle: 'Apresentação não encontrada',
  notFoundDescription: 'Não foi possível abrir esta apresentação. Ela pode ter sido excluída.',
  emptyTitle: 'Nada para apresentar',
  emptyDescription: 'Esta apresentação ainda não tem slides. Complete os dados do cliente.',
  back: 'Voltar',
} as const

export type PresentStrings = typeof ptBR
