/**
 * All client-facing presentation copy, in the three output languages (pt/en/es).
 * The app UI stays Portuguese; only the generated slides / PDF / PPTX use this,
 * keyed by `presentationLanguage`. Rider names + disclaimers are compliance-
 * sensitive — keep translations faithful. Currency stays USD (locale only changes
 * grouping/symbol, handled in @domain/format via localeFor).
 */
export type PresentationLanguage = 'pt' | 'en' | 'es'

export interface SlideCopy {
  cover: { subtitle: string; clientFallback: string; agentFallback: string }
  explainer: {
    eyebrow: string
    title: string
    intro: (name: string) => { pre: string; strong: string; post: string }
    pillars: Array<{ title: string; body: string }>
  }
  coverage: {
    eyebrow: string
    title: string
    deposit: string
    perMonth: string
    perYear: string
    duringYears: (n: number) => string
    death: string
    livingLabel: (pct: string | null) => string
    includedTitle: string
    additionalCost: string
    upTo: (pct: string) => string
  }
  projection: {
    eyebrow: string
    title: string
    projectedLabel: (years: number | null) => string
    sub: string
    empty: string
  }
  table: {
    eyebrow: string
    title: string
    year: string
    age: string
    premium: string
    accumulated: string
    death: string
  }
  options: {
    eyebrow: string
    title: string
    opt1: string
    opt1Body: string
    opt2: string
    incomeForLife: string
    illustratedToAge: (age: number) => string
    perYear: string
    none: string
  }
  comparison: {
    eyebrow: string
    title: string
    term: string
    iul: string
    rows: Array<{ label: string; term: string; iul: string }>
  }
  disclaimers: { eyebrow: string; title: string }
  headline: {
    eyebrow: string
    title: string
    whenEarly: string
    whenLong: string
    whenIll: string
    labelDeath: string
    labelIncome: string
    labelLiving: string
    subDeath: string
    illustratedToAge: (age: number) => string
    livingUpToFull: string
    livingEarly: string
    livingUpTo: (money: string) => string
  }
  clientFallback: string
}

const pt: SlideCopy = {
  cover: { subtitle: 'Proposta Personalizada', clientFallback: 'Cliente', agentFallback: 'Agente' },
  explainer: {
    eyebrow: 'Entendendo o Produto',
    title: 'O que é uma IUL?',
    intro: (name) => ({
      pre: `A IUL é permanente: protege ${name} para sempre e, ao mesmo tempo, constrói um patrimônio que rende com base em um índice de mercado — `,
      strong: 'sobe com o índice, mas nunca cai quando o mercado cai',
      post: ' (existe um piso de proteção).',
    }),
    pillars: [
      { title: 'Proteção por Morte', body: 'Cobertura que protege a família para sempre.' },
      { title: 'Benefício em Vida', body: 'Antecipe parte do valor em caso de doença grave.' },
      { title: 'Valor Acumulado', body: 'Uma parte de cada depósito rende ao longo do tempo.' },
      { title: 'Sem Expiração', body: 'Proteção vitalícia — não expira como o seguro temporário.' },
    ],
  },
  coverage: {
    eyebrow: 'Sua Cobertura',
    title: 'Estrutura do Plano',
    deposit: 'Depósito',
    perMonth: '/mês',
    perYear: '/ano',
    duringYears: (n) => `durante ${n} anos`,
    death: 'Proteção por Morte',
    livingLabel: (pct) => `Benefício em Vida${pct ? ` (até ${pct})` : ''}`,
    includedTitle: 'Benefícios em Vida inclusos',
    additionalCost: '(custo adicional)',
    upTo: (pct) => `até ${pct}`,
  },
  projection: {
    eyebrow: 'Projeção de Longo Prazo',
    title: 'Crescimento do Valor Acumulado',
    projectedLabel: (years) => `Valor projetado${years ? ` em ${years} anos` : ''}`,
    sub: 'Disponível para resgate ou para continuar rendendo.',
    empty: 'Adicione a tabela ano a ano para ver o gráfico.',
  },
  table: {
    eyebrow: 'Detalhamento',
    title: 'Projeção Ano a Ano',
    year: 'Ano',
    age: 'Idade',
    premium: 'Depósito',
    accumulated: 'Valor acumulado',
    death: 'Proteção por morte',
  },
  options: {
    eyebrow: 'A Partir Daí',
    title: 'Duas Opções',
    opt1: 'Opção 1 · Resgatar',
    opt1Body: 'Retirar o valor acumulado para usar como quiser.',
    opt2: 'Opção 2 · Deixar rendendo',
    incomeForLife: 'Renda projetada por toda a vida',
    illustratedToAge: (age) => ` (ilustrada até os ${age} anos)`,
    perYear: '/ano',
    none: '—',
  },
  comparison: {
    eyebrow: 'Comparando os Produtos',
    title: 'Termo vs. IUL',
    term: 'Seguro Temporário',
    iul: 'IUL ★',
    rows: [
      { label: 'Duração', term: '20 anos, depois expira', iul: 'Vitalícia, sem expiração' },
      { label: 'Valor acumulado', term: 'Não possui', iul: 'Sim, cresce ao longo do tempo' },
      { label: 'Mensalidade', term: 'Fixa, mais baixa', iul: 'Flexível, pode aumentar' },
      { label: 'Melhor para', term: 'Proteção máxima a baixo custo, por um período', iul: 'Proteção vitalícia + patrimônio' },
    ],
  },
  disclaimers: { eyebrow: 'Informações Importantes', title: 'Avisos legais' },
  headline: {
    eyebrow: 'Três Formas de Proteger',
    title: 'O que este plano faz por você',
    whenEarly: 'Se você partir cedo',
    whenLong: 'Se você viver muito',
    whenIll: 'Se você adoecer',
    labelDeath: 'Proteção por Morte',
    labelIncome: 'Renda vitalícia',
    labelLiving: 'Benefícios em vida',
    subDeath: 'Pago à sua família, livre de imposto de renda',
    illustratedToAge: (age) => `ilustrada até os ${age} anos`,
    livingUpToFull: 'até 100% do benefício',
    livingEarly: 'Acesso antecipado ao benefício',
    livingUpTo: (money) => `até ${money}`,
  },
  clientFallback: 'o cliente',
}

const en: SlideCopy = {
  cover: { subtitle: 'Personalized Proposal', clientFallback: 'Client', agentFallback: 'Agent' },
  explainer: {
    eyebrow: 'Understanding the Product',
    title: 'What is an IUL?',
    intro: (name) => ({
      pre: `An IUL is permanent: it protects ${name} for life and, at the same time, builds cash value that grows based on a market index — `,
      strong: 'it rises with the index but never falls when the market drops',
      post: ' (there is a protective floor).',
    }),
    pillars: [
      { title: 'Death Protection', body: 'Coverage that protects your family for life.' },
      { title: 'Living Benefit', body: 'Access part of the benefit early in case of serious illness.' },
      { title: 'Accumulated Value', body: 'Part of every deposit grows over time.' },
      { title: 'No Expiration', body: 'Lifelong protection — it does not expire like term insurance.' },
    ],
  },
  coverage: {
    eyebrow: 'Your Coverage',
    title: 'Plan Structure',
    deposit: 'Deposit',
    perMonth: '/mo',
    perYear: '/yr',
    duringYears: (n) => `for ${n} years`,
    death: 'Death Protection',
    livingLabel: (pct) => `Living Benefit${pct ? ` (up to ${pct})` : ''}`,
    includedTitle: 'Living Benefits included',
    additionalCost: '(additional cost)',
    upTo: (pct) => `up to ${pct}`,
  },
  projection: {
    eyebrow: 'Long-Term Projection',
    title: 'Accumulated Value Growth',
    projectedLabel: (years) => `Projected value${years ? ` in ${years} years` : ''}`,
    sub: 'Available to withdraw or to keep growing.',
    empty: 'Add the year-by-year table to see the chart.',
  },
  table: {
    eyebrow: 'Detail',
    title: 'Year-by-Year Projection',
    year: 'Year',
    age: 'Age',
    premium: 'Deposit',
    accumulated: 'Accumulated value',
    death: 'Death protection',
  },
  options: {
    eyebrow: 'From There',
    title: 'Two Options',
    opt1: 'Option 1 · Withdraw',
    opt1Body: 'Take the accumulated value to use as you wish.',
    opt2: 'Option 2 · Keep it growing',
    incomeForLife: 'Projected income for life',
    illustratedToAge: (age) => ` (illustrated to age ${age})`,
    perYear: '/yr',
    none: '—',
  },
  comparison: {
    eyebrow: 'Comparing the Products',
    title: 'Term vs. IUL',
    term: 'Term Insurance',
    iul: 'IUL ★',
    rows: [
      { label: 'Duration', term: '20 years, then expires', iul: 'Lifelong, no expiration' },
      { label: 'Accumulated value', term: 'None', iul: 'Yes, grows over time' },
      { label: 'Premium', term: 'Fixed, lower', iul: 'Flexible, can increase' },
      { label: 'Best for', term: 'Maximum protection at low cost, for a period', iul: 'Lifelong protection + wealth' },
    ],
  },
  disclaimers: { eyebrow: 'Important Information', title: 'Legal disclaimers' },
  headline: {
    eyebrow: 'Three Ways to Protect You',
    title: 'What this plan does for you',
    whenEarly: 'If you pass away early',
    whenLong: 'If you live a long life',
    whenIll: 'If you become ill',
    labelDeath: 'Death Protection',
    labelIncome: 'Lifetime income',
    labelLiving: 'Living benefits',
    subDeath: 'Paid to your family, income-tax-free',
    illustratedToAge: (age) => `illustrated to age ${age}`,
    livingUpToFull: 'up to 100% of the benefit',
    livingEarly: 'Early access to the benefit',
    livingUpTo: (money) => `up to ${money}`,
  },
  clientFallback: 'the client',
}

const es: SlideCopy = {
  cover: { subtitle: 'Propuesta Personalizada', clientFallback: 'Cliente', agentFallback: 'Agente' },
  explainer: {
    eyebrow: 'Entendiendo el Producto',
    title: '¿Qué es un IUL?',
    intro: (name) => ({
      pre: `El IUL es permanente: protege a ${name} de por vida y, al mismo tiempo, construye un valor en efectivo que crece según un índice de mercado — `,
      strong: 'sube con el índice, pero nunca baja cuando el mercado cae',
      post: ' (existe un piso de protección).',
    }),
    pillars: [
      { title: 'Protección por Muerte', body: 'Cobertura que protege a la familia de por vida.' },
      { title: 'Beneficio en Vida', body: 'Anticipe parte del valor en caso de enfermedad grave.' },
      { title: 'Valor Acumulado', body: 'Parte de cada depósito crece con el tiempo.' },
      { title: 'Sin Vencimiento', body: 'Protección vitalicia — no vence como el seguro temporal.' },
    ],
  },
  coverage: {
    eyebrow: 'Su Cobertura',
    title: 'Estructura del Plan',
    deposit: 'Depósito',
    perMonth: '/mes',
    perYear: '/año',
    duringYears: (n) => `durante ${n} años`,
    death: 'Protección por Muerte',
    livingLabel: (pct) => `Beneficio en Vida${pct ? ` (hasta ${pct})` : ''}`,
    includedTitle: 'Beneficios en Vida incluidos',
    additionalCost: '(costo adicional)',
    upTo: (pct) => `hasta ${pct}`,
  },
  projection: {
    eyebrow: 'Proyección a Largo Plazo',
    title: 'Crecimiento del Valor Acumulado',
    projectedLabel: (years) => `Valor proyectado${years ? ` en ${years} años` : ''}`,
    sub: 'Disponible para retirar o para seguir creciendo.',
    empty: 'Agregue la tabla año por año para ver el gráfico.',
  },
  table: {
    eyebrow: 'Detalle',
    title: 'Proyección Año por Año',
    year: 'Año',
    age: 'Edad',
    premium: 'Depósito',
    accumulated: 'Valor acumulado',
    death: 'Protección por muerte',
  },
  options: {
    eyebrow: 'A Partir de Ahí',
    title: 'Dos Opciones',
    opt1: 'Opción 1 · Retirar',
    opt1Body: 'Retirar el valor acumulado para usarlo como quiera.',
    opt2: 'Opción 2 · Dejar creciendo',
    incomeForLife: 'Renta proyectada de por vida',
    illustratedToAge: (age) => ` (ilustrada hasta los ${age} años)`,
    perYear: '/año',
    none: '—',
  },
  comparison: {
    eyebrow: 'Comparando los Productos',
    title: 'Temporal vs. IUL',
    term: 'Seguro Temporal',
    iul: 'IUL ★',
    rows: [
      { label: 'Duración', term: '20 años, luego vence', iul: 'Vitalicia, sin vencimiento' },
      { label: 'Valor acumulado', term: 'No tiene', iul: 'Sí, crece con el tiempo' },
      { label: 'Mensualidad', term: 'Fija, más baja', iul: 'Flexible, puede aumentar' },
      { label: 'Mejor para', term: 'Protección máxima a bajo costo, por un período', iul: 'Protección vitalicia + patrimonio' },
    ],
  },
  disclaimers: { eyebrow: 'Información Importante', title: 'Avisos legales' },
  headline: {
    eyebrow: 'Tres Formas de Protegerlo',
    title: 'Lo que este plan hace por usted',
    whenEarly: 'Si fallece temprano',
    whenLong: 'Si vive muchos años',
    whenIll: 'Si se enferma',
    labelDeath: 'Protección por Muerte',
    labelIncome: 'Renta vitalicia',
    labelLiving: 'Beneficios en vida',
    subDeath: 'Pagado a su familia, libre de impuesto sobre la renta',
    illustratedToAge: (age) => `ilustrada hasta los ${age} años`,
    livingUpToFull: 'hasta 100% del beneficio',
    livingEarly: 'Acceso anticipado al beneficio',
    livingUpTo: (money) => `hasta ${money}`,
  },
  clientFallback: 'el cliente',
}

const SLIDE_COPY: Record<PresentationLanguage, SlideCopy> = { pt, en, es }

export function slideCopy(lang: PresentationLanguage | undefined): SlideCopy {
  return SLIDE_COPY[lang ?? 'pt']
}

/** Localized default product name (used when no custom title is set). */
export function defaultProductNameFor(lang: PresentationLanguage | undefined): string {
  return lang === 'en'
    ? 'Indexed Universal Life Insurance (IUL)'
    : lang === 'es'
      ? 'Seguro de Vida Universal Indexado (IUL)'
      : 'Seguro de Vida Universal Indexado (IUL)'
}

/** Self-labeling note the estimate engine prepends, per language. */
export function estimateNoteFor(lang: PresentationLanguage | undefined): string {
  return lang === 'en'
    ? 'Estimate generated by the app (not guaranteed) — for illustration only. The insurer’s official illustration is the governing document.'
    : lang === 'es'
      ? 'Estimación generada por la aplicación (no garantizada) — solo para simulación. La ilustración oficial de la aseguradora es el documento válido.'
      : 'Estimativa gerada pelo aplicativo (não garantida) — apenas para simulação. A ilustração oficial da seguradora é o documento válido.'
}

/** Rider label/note translations keyed by stable rider id (pt lives in @domain/model/riders). */
const RIDER_I18N: Record<'en' | 'es', Record<string, { label: string; note: string }>> = {
  en: {
    terminal_illness: { label: 'Terminal Illness', note: "No cost. Discounted acceleration for a terminal illness (life expectancy of up to 24 months). $1.5M lifetime limit shared with Chronic Illness and Alzheimer's." },
    chronic_illness: { label: 'Chronic Illness', note: "No cost. Inability to perform 2 of 6 activities of daily living for 90 days, or severe cognitive impairment. Up to 2%/month. $1.5M lifetime limit shared with Terminal Illness and Alzheimer's." },
    critical_illness: { label: 'Critical Illness', note: 'No cost. Cancer, stroke, heart attack, ALS, transplant and others. $1M lifetime limit (shared with Critical Injury).' },
    critical_injury: { label: 'Critical Injury / Accidents', note: 'No cost. Coma, paralysis, severe burns, traumatic brain injury. $1M lifetime limit (shared with Critical Illness).' },
    alzheimers: { label: "Alzheimer's", note: "No cost. Diagnosis of eligible Alzheimer's/dementia by a specialist. $1.5M lifetime limit shared with Terminal and Chronic Illness." },
    value_added_services: { label: 'Caregiver Support', note: 'No cost. Practical and emotional caregiver support (Homethrive). Not available in NY.' },
    fertility_journey: { label: 'Fertility Journey Support', note: 'No cost. Accumulated-value credit after eligible fertility treatment.' },
    premium_chronic_care: { label: 'Premium Chronic Care', note: 'Additional cost. Accelerates a larger share — up to the full death benefit (~$3M limit), 2% or 4% per month (chosen at issue). Not available in CA or NY.' },
    waiver_monthly_deductions: { label: 'Waiver of Monthly Deductions', note: 'Additional cost. Waives monthly deductions in case of total disability (~6-month waiting period / LSW).' },
    childrens_term: { label: "Children's Term", note: 'Additional cost. Coverage of $5,000 to $25,000 per child (in $1,000 increments), to age 25; single rate regardless of the number of children.' },
  },
  es: {
    terminal_illness: { label: 'Enfermedad Terminal', note: 'Sin costo. Anticipación con descuento en caso de enfermedad terminal (expectativa de hasta 24 meses). Límite vitalicio de US$ 1,5 M compartido con Enfermedad Crónica y Alzheimer.' },
    chronic_illness: { label: 'Enfermedad Crónica', note: 'Sin costo. Incapacidad de realizar 2 de 6 actividades diarias por 90 días, o deterioro cognitivo severo. Hasta 2%/mes. Límite vitalicio de US$ 1,5 M compartido con Enfermedad Terminal y Alzheimer.' },
    critical_illness: { label: 'Enfermedad Crítica', note: 'Sin costo. Cáncer, ACV, infarto, ELA, trasplante y otras. Límite vitalicio US$ 1 M (compartido con Lesión Crítica).' },
    critical_injury: { label: 'Lesión Crítica / Accidentes', note: 'Sin costo. Coma, parálisis, quemaduras graves, traumatismo craneal. Límite vitalicio US$ 1 M (compartido con Enfermedad Crítica).' },
    alzheimers: { label: 'Alzheimer', note: 'Sin costo. Diagnóstico de Alzheimer/demencia elegible por un especialista. Límite vitalicio de US$ 1,5 M compartido con Enfermedad Terminal y Crónica.' },
    value_added_services: { label: 'Apoyo al Cuidador', note: 'Sin costo. Apoyo práctico y emocional al cuidador (Homethrive). No disponible en NY.' },
    fertility_journey: { label: 'Apoyo al Camino de Fertilidad', note: 'Sin costo. Crédito al valor acumulado tras un tratamiento de fertilidad elegible.' },
    premium_chronic_care: { label: 'Cuidado Crónico Premium', note: 'Costo adicional. Anticipa una porción mayor — hasta el beneficio por muerte completo (límite ~US$ 3 M), 2% o 4% por mes (elegido en la emisión). No disponible en CA ni NY.' },
    waiver_monthly_deductions: { label: 'Exención de Costos por Invalidez', note: 'Costo adicional. Exime las deducciones mensuales en caso de invalidez total (carencia ~6 meses / LSW).' },
    childrens_term: { label: 'Seguro Temporal para Hijos', note: 'Costo adicional. Cobertura de US$ 5 mil a US$ 25 mil por hijo (múltiplos de US$ 1.000), hasta los 25 años; tarifa única independiente del número de hijos.' },
  },
}

/** Canonical disclaimer sets for en/es (pt stays the stored/edited set). */
const DISCLAIMERS_I18N: Record<'en' | 'es', string[]> = {
  en: [
    'This is an illustration only and is not intended to predict actual performance. Refer to the policy for full details; in case of conflict, the policy controls.',
    'Non-guaranteed values are subject to change and may be higher or lower than illustrated.',
    'Using a living benefit may reduce or eliminate other policy and rider benefits.',
    'Riders are optional and may require an additional premium; they are subject to underwriting, exclusions and limitations, and may not be available in all states.',
    'The lifetime limits of the accelerated benefits are shared by rider group and per insured, and vary by state (for example: NY $2M; IL and NJ $500k).',
    'Guarantees depend on the claims-paying ability of the issuing company (National Life Insurance Company / Life Insurance Company of the Southwest).',
    'The maximum illustrated rate follows Actuarial Guideline 49-B. Past index performance does not represent future performance.',
    'Policy denominated in U.S. dollars (USD). Solicitation, illustration, signing and delivery must take place in the United States. The client is responsible for confirming that Brazilian law permits ownership of this policy.',
  ],
  es: [
    'Esta es solo una ilustración y no pretende predecir el desempeño real. Consulte la póliza para los detalles completos; en caso de conflicto, prevalece la póliza.',
    'Los valores no garantizados están sujetos a cambios y pueden ser mayores o menores que los ilustrados.',
    'El uso de un beneficio en vida puede reducir o eliminar otros beneficios de la póliza y de los riders.',
    'Los riders son opcionales y pueden requerir una prima adicional; están sujetos a suscripción, exclusiones y limitaciones, y pueden no estar disponibles en todos los estados.',
    'Los límites vitalicios de los beneficios acelerados se comparten por grupo de rider y por asegurado, y varían por estado (por ejemplo: NY US$ 2 M; IL y NJ US$ 500 mil).',
    'Las garantías dependen de la capacidad de pago de siniestros de la compañía emisora (National Life Insurance Company / Life Insurance Company of the Southwest).',
    'La tasa máxima ilustrada sigue la Actuarial Guideline 49-B. El desempeño pasado de los índices no representa el desempeño futuro.',
    'Póliza en dólares (US$). La solicitud, la ilustración, la firma y la entrega deben realizarse en los Estados Unidos. El cliente es responsable de confirmar que la legislación brasileña permite la titularidad de esta póliza.',
  ],
}

/** Translate a rider's label/note into `lang` by stable id; falls back to the stored text. */
export function translateRider<T extends { id: string; label: string; note?: string }>(
  rider: T,
  lang: PresentationLanguage | undefined,
): T {
  if (lang == null || lang === 'pt') return rider
  const t = RIDER_I18N[lang]?.[rider.id]
  if (!t) return rider
  return { ...rider, label: t.label, note: rider.note != null ? t.note : rider.note }
}

/** Disclaimers for a language: en/es use the canonical set; pt uses the stored one. */
export function disclaimersFor(
  lang: PresentationLanguage | undefined,
  ptFallback: string[],
): string[] {
  if (lang === 'en' || lang === 'es') return DISCLAIMERS_I18N[lang]
  return ptFallback
}
