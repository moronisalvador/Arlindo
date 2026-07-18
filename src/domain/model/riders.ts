import type { Rider } from './presentation'

/**
 * The standard National Life Group living-benefit rider set, in pt-BR, taken
 * from the sample IUL illustration. Data-entry (W2) prefills from this; the
 * salesman can then toggle each, adjust the accessible percentage (80% standard
 * vs 100% for Premium Chronic Care), and flag additional cost.
 */
export const DEFAULT_IUL_RIDERS: Rider[] = [
  {
    id: 'terminal_illness',
    label: 'Doença Terminal',
    englishLabel: 'Terminal Illness Rider',
    included: true,
    percent: 80,
    additionalCost: false,
    category: 'included',
    note: 'Antecipa parte da cobertura em caso de doença terminal (expectativa de até 24 meses).',
  },
  {
    id: 'chronic_illness',
    label: 'Doença Crônica',
    englishLabel: 'Chronic Illness Rider',
    included: true,
    percent: 80,
    additionalCost: false,
    category: 'included',
    note: 'Antecipa o benefício quando não é possível realizar 2 das 6 atividades básicas do dia a dia.',
  },
  {
    id: 'critical_illness',
    label: 'Doença Crítica',
    englishLabel: 'Critical Illness Rider',
    included: true,
    percent: 80,
    additionalCost: false,
    category: 'included',
    note: 'Parcela única em caso de câncer, AVC, infarto, ELA e outras doenças críticas.',
  },
  {
    id: 'critical_injury',
    label: 'Lesão Crítica / Acidentes',
    englishLabel: 'Critical Injury Rider',
    included: true,
    percent: 80,
    additionalCost: false,
    category: 'included',
    note: 'Parcela única em caso de lesão grave por acidente (coma, queimaduras graves, paralisia).',
  },
  {
    id: 'alzheimers',
    label: 'Alzheimer',
    englishLabel: "Alzheimer's Disease Rider",
    included: true,
    percent: 80,
    additionalCost: false,
    category: 'included',
    note: 'Antecipa o benefício com diagnóstico de Alzheimer ou demência por especialista.',
  },
  {
    id: 'waiver_of_premium',
    label: 'Isenção de Prêmio por Invalidez',
    englishLabel: 'Waiver of Premium',
    included: true,
    percent: 0,
    additionalCost: false,
    category: 'included',
    note: 'Dispensa o depósito mensal em caso de invalidez, após carência.',
  },
  {
    id: 'premium_chronic_care',
    label: 'Cuidado Crônico Premium',
    englishLabel: 'Premium Chronic Care Rider',
    included: false,
    percent: 100,
    additionalCost: true,
    category: 'iul_exclusive',
    note: 'Mediante custo adicional, acessa até 100% do benefício por morte (limite US$ 3 mi) em doença crônica.',
  },
  {
    id: 'value_added_services',
    label: 'Apoio ao Cuidador',
    englishLabel: 'Value Added Services Rider',
    included: false,
    percent: 0,
    additionalCost: false,
    category: 'iul_exclusive',
    note: 'Serviços de apoio prático e emocional ao cuidador (parceria Homethrive).',
  },
  {
    id: 'childrens_term',
    label: 'Seguro Temporário para Filhos',
    englishLabel: "Children's Term Rider",
    included: false,
    percent: 0,
    additionalCost: true,
    category: 'optional',
    note: 'Cobertura de até US$ 25.000 para os filhos, até os 23 anos, taxa única.',
  },
  {
    id: 'fertility_journey',
    label: 'Apoio à Jornada de Fertilidade',
    englishLabel: 'Fertility Journey Rider',
    included: false,
    percent: 0,
    additionalCost: false,
    category: 'optional',
    note: 'Suporte financeiro para tratamentos de fertilidade.',
  },
]

/** Standard legal disclaimers (pt-BR) from the illustration; rendered on slides + PDF. */
export const DEFAULT_IUL_DISCLAIMERS: string[] = [
  'Documento ilustrativo. Valores projetados, não garantidos.',
  'Os valores finais dependem do desempenho real do índice, das taxas da apólice e da análise de underwriting da National Life Group.',
  'A utilização de um benefício em vida reduz o valor acumulado e o benefício por morte da apólice.',
  'Os riders (Living Benefits / Accelerated Benefits Riders) estão sujeitos aos termos, condições e definições contratuais, podendo variar conforme o produto e o estado de emissão.',
]
