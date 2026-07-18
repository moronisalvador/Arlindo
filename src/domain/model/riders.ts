import type { Rider } from './presentation'

/**
 * National Life Group / LSW FlexLife living-benefit rider suite, in pt-BR, from
 * verified NLG primary sources (a current FlexLife illustration + product guides).
 *
 * Accuracy notes baked in here:
 * - The five Accelerated Benefit Riders (ABRs) carry NO additional premium; the
 *   benefit is paid on a DISCOUNTED basis and can accelerate up to 100% of the
 *   death benefit, subject to per-insured LIFETIME DOLLAR CAPS (lifetimeMax).
 * - Critical Illness and Critical Injury SHARE a single $1,000,000 lifetime cap.
 * - The Premium Chronic Care Rider is the ADDITIONAL-COST rider that accelerates
 *   a larger share (up to the full death benefit, ~$3M cap).
 * - `percent` = the accessible % the agent chooses to present (editable, 80/100);
 *   `lifetimeMax` = NLG's dollar cap. Current caps/participation rates are NOT
 *   encoded anywhere (rate-sheet-driven) — only guaranteed facts live here.
 */
export const DEFAULT_IUL_RIDERS: Rider[] = [
  {
    id: 'terminal_illness',
    label: 'Doença Terminal',
    englishLabel: 'Accelerated Benefits Rider — Terminal Illness',
    included: true,
    percent: 100,
    additionalCost: false,
    category: 'included',
    lifetimeMax: 1_500_000,
    note: 'Sem custo. Antecipação (com desconto) em caso de doença terminal com expectativa de até 24 meses. Limite vitalício US$ 1,5 mi.',
  },
  {
    id: 'chronic_illness',
    label: 'Doença Crônica',
    englishLabel: 'Accelerated Benefits Rider — Chronic Illness',
    included: true,
    percent: 100,
    additionalCost: false,
    category: 'included',
    lifetimeMax: 1_500_000,
    note: 'Sem custo. Incapacidade de realizar 2 de 6 atividades diárias por 90 dias, ou comprometimento cognitivo severo. Até 2%/mês. Limite vitalício US$ 1,5 mi.',
  },
  {
    id: 'critical_illness',
    label: 'Doença Crítica',
    englishLabel: 'Accelerated Benefits Rider — Critical Illness',
    included: true,
    percent: 100,
    additionalCost: false,
    category: 'included',
    lifetimeMax: 1_000_000,
    note: 'Sem custo. Câncer, AVC, infarto, ELA, transplante e outras. Limite vitalício US$ 1 mi (compartilhado com Lesão Crítica).',
  },
  {
    id: 'critical_injury',
    label: 'Lesão Crítica / Acidentes',
    englishLabel: 'Accelerated Benefits Rider — Critical Injury',
    included: true,
    percent: 100,
    additionalCost: false,
    category: 'included',
    lifetimeMax: 1_000_000,
    note: 'Sem custo. Coma, paralisia, queimaduras graves, traumatismo craniano. Limite vitalício US$ 1 mi (compartilhado com Doença Crítica).',
  },
  {
    id: 'alzheimers',
    label: 'Alzheimer',
    englishLabel: "Accelerated Benefits Rider — Alzheimer's Disease",
    included: true,
    percent: 100,
    additionalCost: false,
    category: 'included',
    lifetimeMax: 1_500_000,
    note: 'Sem custo. Diagnóstico de Alzheimer/demência elegível por especialista. Limite vitalício US$ 1,5 mi.',
  },
  {
    id: 'value_added_services',
    label: 'Apoio ao Cuidador',
    englishLabel: 'Value-Added Services Rider (Homethrive)',
    included: true,
    percent: 0,
    additionalCost: false,
    category: 'included',
    note: 'Sem custo. Apoio prático e emocional ao cuidador (parceria Homethrive). Indisponível em NY.',
  },
  {
    id: 'fertility_journey',
    label: 'Apoio à Jornada de Fertilidade',
    englishLabel: 'Fertility Journey Rider',
    included: true,
    percent: 0,
    additionalCost: false,
    category: 'included',
    note: 'Sem custo. Crédito ao valor acumulado após tratamento de fertilidade elegível.',
  },
  {
    id: 'premium_chronic_care',
    label: 'Cuidado Crônico Premium',
    englishLabel: 'Premium Chronic Care Rider',
    included: false,
    percent: 100,
    additionalCost: true,
    category: 'iul_exclusive',
    lifetimeMax: 3_000_000,
    note: 'Custo adicional. Antecipa uma parcela maior — até o benefício por morte integral (limite ~US$ 3 mi), 2%–4% ao mês. Indisponível em CA e NY.',
  },
  {
    id: 'waiver_monthly_deductions',
    label: 'Isenção de Custos por Invalidez',
    englishLabel: 'Waiver of Monthly Deductions Rider',
    included: false,
    percent: 0,
    additionalCost: true,
    category: 'optional',
    note: 'Custo adicional. Dispensa as deduções mensais em caso de invalidez total (carência ~6 meses / LSW).',
  },
  {
    id: 'childrens_term',
    label: 'Seguro Temporário para Filhos',
    englishLabel: "Children's Term Rider",
    included: false,
    percent: 0,
    additionalCost: true,
    category: 'optional',
    lifetimeMax: 25_000,
    note: 'Custo adicional. Cobertura de US$ 5 mil a US$ 25 mil por filho, até os 23 anos; taxa única independente do nº de filhos.',
  },
]

/**
 * Standard NLG/LSW illustration disclaimers (pt-BR). Rendered on slides + PDF +
 * PPTX. Includes AG49-A, non-guaranteed language, and the foreign-national /
 * US-solicitation compliance note relevant to a Brazil-based agent.
 */
export const DEFAULT_IUL_DISCLAIMERS: string[] = [
  'Esta é apenas uma ilustração e não pretende prever o desempenho real. Consulte a apólice para os detalhes completos; em caso de conflito, prevalece a apólice.',
  'Valores não garantidos estão sujeitos a alteração e podem ser maiores ou menores do que os ilustrados.',
  'O uso de um benefício em vida pode reduzir ou eliminar outros benefícios da apólice e dos riders.',
  'Riders são opcionais e podem exigir prêmio adicional; sujeitos a underwriting, exclusões e limitações, podendo não estar disponíveis em todos os estados.',
  'As garantias dependem da capacidade de pagamento de sinistros da companhia emissora (National Life Insurance Company / Life Insurance Company of the Southwest).',
  'A taxa máxima ilustrada segue a Actuarial Guideline 49-A. O desempenho passado de índices não representa desempenho futuro.',
  'Apólice em dólares (US$). A solicitação, a ilustração, a assinatura e a entrega devem ocorrer nos Estados Unidos. O cliente é responsável por confirmar que a legislação brasileira permite a titularidade desta apólice.',
]
