/**
 * pt-BR strings for the "calc" feature — the standalone quick estimator.
 * Registered at module load in index.tsx via registerNamespace('calc', ptBR).
 */
export const ptBR = {
  eyebrow: 'Cálculo rápido',
  title: 'Simulador de projeção IUL',
  intro:
    'Preencha alguns dados e veja uma estimativa da projeção. Serve apenas para conversar com o cliente — a ilustração oficial da seguradora é o documento válido.',
  form: {
    age: 'Idade',
    agePlaceholder: 'Ex.: 40',
    premium: 'Depósito mensal',
    premiumPlaceholder: 'Ex.: 500',
    deathBenefit: 'Proteção por morte',
    deathBenefitPlaceholder: 'Ex.: 250.000',
    projectionYears: 'Anos de projeção',
    projectionYearsPlaceholder: 'Ex.: 20',
    rate: 'Taxa anual estimada (%)',
    ratePlaceholder: 'Ex.: 6',
    rateHint: 'máx ~6,5% AG49-A',
    calculate: 'Calcular',
    recalculate: 'Recalcular',
    currencyPrefix: 'US$',
  },
  results: {
    eyebrow: 'Resultado estimado',
    accumulatedTitle: 'Valor acumulado projetado',
    accumulatedSub: 'em {{years}} anos',
    incomeTitle: 'Renda anual estimada',
    incomePerYear: '/ano',
    chartTitle: 'Crescimento do valor acumulado',
  },
  empty: {
    title: 'Preencha os dados para calcular',
    description:
      'Informe pelo menos o depósito mensal, a proteção por morte e os anos de projeção.',
  },
  disclaimer:
    'Estimativa gerada pelo app — não garantida. A ilustração oficial da seguradora é o documento válido.',
} as const

export type CalcStrings = typeof ptBR
