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
    guaranteedLabel: string
    guaranteedSub: string
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
  /** IUL "plan over time" timeline (pay N years → stop → income for life). */
  timeline: {
    eyebrow: string
    title: string
    step1: string
    step1Body: (prem: string, years: number) => string
    step2: string
    step2Body: (age: number) => string
    step3: string
    step3Body: (income: string) => string
  }
  /** Term-only slide copy (term has no cash value, no accumulation, no income). */
  term: TermSlideCopy
  clientFallback: string
}

export interface TermSlideCopy {
  headline: {
    eyebrow: string
    title: string
    whenEarly: string
    whenIll: string
    whenConvert: string
    labelDeath: string
    labelLiving: string
    labelConvert: string
    subDeath: string
    livingDiscounted: string
    convertBody: string
  }
  coverage: {
    eyebrow: string
    title: string
    premium: string
    perMonth: string
    perYear: string
    forYears: (n: number) => string
    death: string
    living: string
    livingSub: string
    conversion: string
    /** Assembles the conversion window from the illustration's years / to-age. */
    conversionWindow: (years: number | null, age: number | null) => string
    includedTitle: string
    additionalCost: string
  }
  schedule: {
    eyebrow: string
    title: string
    year: string
    age: string
    premium: string
    death: string
    cliffTitle: string
    cliffBody: (levelYears: number, level: string, peak: string, peakAge: number) => string
  }
  comparison: {
    eyebrow: string
    title: string
    term: string
    permanent: string
    rows: Array<{ label: string; term: string; permanent: string }>
  }
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
    guaranteedLabel: 'Valor garantido',
    guaranteedSub: 'Mesmo no cenário mínimo garantido.',
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
  timeline: {
    eyebrow: 'O Plano ao Longo do Tempo',
    title: 'Como funciona, passo a passo',
    step1: 'Você deposita',
    step1Body: (prem, years) => `${prem} por ${years} anos`,
    step2: 'Para de depositar',
    step2Body: (age) => `aos ${age} anos`,
    step3: 'Renda para toda a vida',
    step3Body: (income) => `${income}/ano, a partir daí`,
  },
  term: {
    headline: {
      eyebrow: 'Proteção Quando Você Precisa',
      title: 'O que este plano faz por você',
      whenEarly: 'Se você partir cedo',
      whenIll: 'Se você adoecer',
      whenConvert: 'Se seus planos mudarem',
      labelDeath: 'Proteção por Morte',
      labelLiving: 'Benefícios em Vida',
      labelConvert: 'Conversão para Permanente',
      subDeath: 'Pago à sua família, livre de imposto de renda',
      livingDiscounted: 'Acesso antecipado ao benefício — com desconto, conforme a condição',
      convertBody: 'Converta para uma apólice permanente, sem novo exame de saúde.',
    },
    coverage: {
      eyebrow: 'Sua Cobertura',
      title: 'Estrutura do Plano',
      premium: 'Prêmio',
      perMonth: '/mês',
      perYear: '/ano',
      forYears: (n) => `nivelado por ${n} anos`,
      death: 'Proteção por Morte',
      living: 'Benefícios em Vida',
      livingSub: 'Sem custo — antecipação com desconto em caso de doença grave',
      conversion: 'Privilégio de Conversão',
      conversionWindow: (years, age) => conversionWindowText('pt', years, age),
      includedTitle: 'Benefícios em Vida inclusos',
      additionalCost: '(custo adicional)',
    },
    schedule: {
      eyebrow: 'Detalhamento',
      title: 'Cronograma de Prêmios',
      year: 'Ano',
      age: 'Idade',
      premium: 'Prêmio',
      death: 'Proteção por morte',
      cliffTitle: 'Por que converter?',
      cliffBody: (levelYears, level, peak, peakAge) =>
        `Prêmio nivelado de ${level}/ano por ${levelYears} anos — depois sobe a cada ano, chegando a ${peak}/ano aos ${peakAge}. Converter para permanente evita esse salto.`,
    },
    comparison: {
      eyebrow: 'Comparando os Produtos',
      title: 'Temporário vs. Permanente',
      term: 'Seguro Temporário ★',
      permanent: 'Seguro Permanente (IUL)',
      rows: [
        { label: 'Custo inicial', term: 'Mais baixo', permanent: 'Mais alto' },
        { label: 'Proteção por dólar', term: 'Máxima imediata', permanent: 'Menor' },
        { label: 'Valor acumulado', term: 'Não possui', permanent: 'Sim, cresce ao longo do tempo' },
        { label: 'Duração', term: 'Período determinado; depois sobe até os 95', permanent: 'Vitalícia, sem expiração' },
        { label: 'Melhor para', term: 'Máxima proteção a baixo custo, por um período', permanent: 'Proteção vitalícia + patrimônio' },
      ],
    },
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
    guaranteedLabel: 'Guaranteed value',
    guaranteedSub: 'Even in the guaranteed-minimum scenario.',
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
  timeline: {
    eyebrow: 'The Plan Over Time',
    title: 'How it works, step by step',
    step1: 'You deposit',
    step1Body: (prem, years) => `${prem} for ${years} years`,
    step2: 'You stop depositing',
    step2Body: (age) => `at age ${age}`,
    step3: 'Income for life',
    step3Body: (income) => `${income}/yr, from then on`,
  },
  term: {
    headline: {
      eyebrow: 'Protection When You Need It',
      title: 'What this plan does for you',
      whenEarly: 'If you pass away early',
      whenIll: 'If you become ill',
      whenConvert: 'If your plans change',
      labelDeath: 'Death Protection',
      labelLiving: 'Living Benefits',
      labelConvert: 'Conversion to Permanent',
      subDeath: 'Paid to your family, income-tax-free',
      livingDiscounted: 'Early access to the benefit — discounted, based on the condition',
      convertBody: 'Convert to a permanent policy with no new medical exam.',
    },
    coverage: {
      eyebrow: 'Your Coverage',
      title: 'Plan Structure',
      premium: 'Premium',
      perMonth: '/mo',
      perYear: '/yr',
      forYears: (n) => `level for ${n} years`,
      death: 'Death Protection',
      living: 'Living Benefits',
      livingSub: 'No cost — discounted acceleration in case of serious illness',
      conversion: 'Conversion Privilege',
      conversionWindow: (years, age) => conversionWindowText('en', years, age),
      includedTitle: 'Living Benefits included',
      additionalCost: '(additional cost)',
    },
    schedule: {
      eyebrow: 'Detail',
      title: 'Premium Schedule',
      year: 'Year',
      age: 'Age',
      premium: 'Premium',
      death: 'Death protection',
      cliffTitle: 'Why convert?',
      cliffBody: (levelYears, level, peak, peakAge) =>
        `Level premium of ${level}/yr for ${levelYears} years — then it rises every year, reaching ${peak}/yr at age ${peakAge}. Converting to permanent avoids that jump.`,
    },
    comparison: {
      eyebrow: 'Comparing the Products',
      title: 'Term vs. Permanent',
      term: 'Term Insurance ★',
      permanent: 'Permanent Insurance (IUL)',
      rows: [
        { label: 'Initial cost', term: 'Lowest', permanent: 'Higher' },
        { label: 'Protection per dollar', term: 'Highest immediate', permanent: 'Lower' },
        { label: 'Accumulated value', term: 'None', permanent: 'Yes, grows over time' },
        { label: 'Duration', term: 'Fixed period; then rises to age 95', permanent: 'Lifelong, no expiration' },
        { label: 'Best for', term: 'Maximum protection at low cost, for a period', permanent: 'Lifelong protection + wealth' },
      ],
    },
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
    guaranteedLabel: 'Valor garantizado',
    guaranteedSub: 'Incluso en el escenario mínimo garantizado.',
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
  timeline: {
    eyebrow: 'El Plan a lo Largo del Tiempo',
    title: 'Cómo funciona, paso a paso',
    step1: 'Usted deposita',
    step1Body: (prem, years) => `${prem} por ${years} años`,
    step2: 'Deja de depositar',
    step2Body: (age) => `a los ${age} años`,
    step3: 'Renta de por vida',
    step3Body: (income) => `${income}/año, a partir de ahí`,
  },
  term: {
    headline: {
      eyebrow: 'Protección Cuando la Necesita',
      title: 'Lo que este plan hace por usted',
      whenEarly: 'Si fallece temprano',
      whenIll: 'Si se enferma',
      whenConvert: 'Si sus planes cambian',
      labelDeath: 'Protección por Muerte',
      labelLiving: 'Beneficios en Vida',
      labelConvert: 'Conversión a Permanente',
      subDeath: 'Pagado a su familia, libre de impuesto sobre la renta',
      livingDiscounted: 'Acceso anticipado al beneficio — con descuento, según la condición',
      convertBody: 'Convierta a una póliza permanente, sin nuevo examen médico.',
    },
    coverage: {
      eyebrow: 'Su Cobertura',
      title: 'Estructura del Plan',
      premium: 'Prima',
      perMonth: '/mes',
      perYear: '/año',
      forYears: (n) => `nivelada por ${n} años`,
      death: 'Protección por Muerte',
      living: 'Beneficios en Vida',
      livingSub: 'Sin costo — anticipación con descuento en caso de enfermedad grave',
      conversion: 'Privilegio de Conversión',
      conversionWindow: (years, age) => conversionWindowText('es', years, age),
      includedTitle: 'Beneficios en Vida incluidos',
      additionalCost: '(costo adicional)',
    },
    schedule: {
      eyebrow: 'Detalle',
      title: 'Cronograma de Primas',
      year: 'Año',
      age: 'Edad',
      premium: 'Prima',
      death: 'Protección por muerte',
      cliffTitle: '¿Por qué convertir?',
      cliffBody: (levelYears, level, peak, peakAge) =>
        `Prima nivelada de ${level}/año por ${levelYears} años — luego sube cada año, llegando a ${peak}/año a los ${peakAge}. Convertir a permanente evita ese salto.`,
    },
    comparison: {
      eyebrow: 'Comparando los Productos',
      title: 'Temporal vs. Permanente',
      term: 'Seguro Temporal ★',
      permanent: 'Seguro Permanente (IUL)',
      rows: [
        { label: 'Costo inicial', term: 'Más bajo', permanent: 'Más alto' },
        { label: 'Protección por dólar', term: 'Máxima inmediata', permanent: 'Menor' },
        { label: 'Valor acumulado', term: 'No tiene', permanent: 'Sí, crece con el tiempo' },
        { label: 'Duración', term: 'Período fijo; luego sube hasta los 95', permanent: 'Vitalicia, sin vencimiento' },
        { label: 'Mejor para', term: 'Máxima protección a bajo costo, por un período', permanent: 'Protección vitalicia + patrimonio' },
      ],
    },
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

/** Localized default TERM product name. */
export function defaultTermProductNameFor(lang: PresentationLanguage | undefined): string {
  return lang === 'en'
    ? 'Term Life Insurance'
    : lang === 'es'
      ? 'Seguro de Vida a Término'
      : 'Seguro de Vida Temporário'
}

/** Assembles the conversion-privilege window ("first 20 years or to age 70") per language. */
function conversionWindowText(
  lang: PresentationLanguage,
  years: number | null,
  age: number | null,
): string {
  const firstYears = (n: number) =>
    lang === 'en' ? `first ${n} years` : lang === 'es' ? `primeros ${n} años` : `primeiros ${n} anos`
  const toAge = (a: number) =>
    lang === 'en' ? `to age ${a}` : lang === 'es' ? `hasta los ${a} años` : `até os ${a} anos`
  const orEarlier = lang === 'en' ? ', whichever is earlier' : lang === 'es' ? ', lo que ocurra primero' : ', o que ocorrer primeiro'
  const perPolicy =
    lang === 'en'
      ? 'As provided in the policy'
      : lang === 'es'
        ? 'Según lo previsto en la póliza'
        : 'Conforme previsto na apólice'
  if (years != null && age != null) return `${cap(firstYears(years))} ${toAge(age)}${orEarlier}`
  if (years != null) return cap(firstYears(years))
  if (age != null) return cap(toAge(age))
  return perPolicy
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
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
    waiver_of_premium: { label: 'Waiver of Premium', note: 'Additional cost. Waives the premium in case of total disability; also waives the premium on the converted permanent policy.' },
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
    waiver_of_premium: { label: 'Exención de Prima por Invalidez', note: 'Costo adicional. Exime la prima en caso de invalidez total; también exime la prima de la póliza permanente convertida.' },
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

/** Canonical TERM disclaimer sets for en/es (no AG49-B / cash-value language). */
const DISCLAIMERS_TERM_I18N: Record<'en' | 'es', string[]> = {
  en: [
    'This is an illustration only and is not intended to predict actual values. Refer to the policy for full details; in case of conflict, the policy controls.',
    'Term insurance provides protection for a set period, builds no cash value and pays no dividends. After the level-premium period the premium increases annually to age 95.',
    'Accelerated (living) benefits are paid at a discount, may be taxable, and may affect eligibility for public-assistance programs. Using a benefit may reduce or eliminate other policy and rider benefits.',
    'The lifetime limits of the accelerated benefits are shared by rider group and per insured, and vary by state (for example: NY $2M; IL and NJ $500k).',
    'The conversion privilege allows conversion to a permanent policy with no new evidence of insurability, within the period and conditions set in the policy (which vary by product and state).',
    'Riders are optional and may require an additional premium; they are subject to underwriting, exclusions and limitations, and may not be available in all states.',
    'Guarantees depend on the claims-paying ability of the issuing company (National Life Insurance Company / Life Insurance Company of the Southwest). The death benefit is generally income-tax-free (IRC §101(a)(1)).',
    'Policy denominated in U.S. dollars (USD). Solicitation, illustration, signing and delivery must take place in the United States. Note: NLG/LSW term insurance is not available to non-resident foreign nationals — clients in Brazil qualify for permanent products only.',
  ],
  es: [
    'Esta es solo una ilustración y no pretende predecir valores reales. Consulte la póliza para los detalles completos; en caso de conflicto, prevalece la póliza.',
    'El seguro temporal ofrece protección por un período determinado, no acumula valor en efectivo y no paga dividendos. Tras el período de prima nivelada, la prima aumenta anualmente hasta la edad 95.',
    'Los beneficios acelerados (en vida) se pagan con descuento, pueden ser tributables y pueden afectar la elegibilidad a programas de asistencia pública. El uso de un beneficio puede reducir o eliminar otros beneficios de la póliza y de los riders.',
    'Los límites vitalicios de los beneficios acelerados se comparten por grupo de rider y por asegurado, y varían por estado (por ejemplo: NY US$ 2 M; IL y NJ US$ 500 mil).',
    'El privilegio de conversión permite convertir a una póliza permanente sin nuevas pruebas de asegurabilidad, dentro del período y las condiciones previstos en la póliza (que varían por producto y estado).',
    'Los riders son opcionales y pueden requerir una prima adicional; están sujetos a suscripción, exclusiones y limitaciones, y pueden no estar disponibles en todos los estados.',
    'Las garantías dependen de la capacidad de pago de siniestros de la compañía emisora (National Life Insurance Company / Life Insurance Company of the Southwest). El beneficio por muerte es generalmente libre de impuesto sobre la renta (IRC §101(a)(1)).',
    'Póliza en dólares (US$). La solicitud, la ilustración, la firma y la entrega deben realizarse en los Estados Unidos. Nota: el seguro temporal de NLG/LSW no está disponible para extranjeros no residentes — los clientes en Brasil califican solo para productos permanentes.',
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

/**
 * Disclaimers for a language: en/es use the canonical set (term vs IUL); pt uses the
 * stored one (the term/IUL default set is seeded at creation in newPresentation).
 */
export function disclaimersFor(
  lang: PresentationLanguage | undefined,
  ptFallback: string[],
  productType: 'iul' | 'term' = 'iul',
): string[] {
  if (lang === 'en' || lang === 'es') {
    return productType === 'term' ? DISCLAIMERS_TERM_I18N[lang] : DISCLAIMERS_I18N[lang]
  }
  return ptFallback
}
