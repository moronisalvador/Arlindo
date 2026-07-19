import { presentationInputsSchema, type PresentationInputs } from './presentation'
import {
  DEFAULT_IUL_RIDERS,
  DEFAULT_IUL_DISCLAIMERS,
  DEFAULT_TERM_RIDERS,
  DEFAULT_TERM_DISCLAIMERS,
} from './riders'

/**
 * Sample IUL presentation based on the carrier illustration (client "Iracema").
 * Used by the design preview and tests. Not real client data.
 */
export function sampleIulPresentation(): PresentationInputs {
  const projectionYears = 20
  const startAge = 20
  const finalAccumulated = 51_681
  const deathBenefit = 80_000

  const yearlyRows = Array.from({ length: projectionYears }, (_, i) => {
    const policyYear = i + 1
    // Smooth, illustrative accumulation curve toward the final value.
    const t = policyYear / projectionYears
    const accumulatedValue = Math.round(finalAccumulated * Math.pow(t, 1.7))
    return {
      policyYear,
      age: startAge + i,
      premiumPaid: 250 * 12,
      accumulatedValue,
      cashSurrenderValue: Math.round(accumulatedValue * 0.92),
      deathBenefit,
    }
  })

  return presentationInputsSchema.parse({
    id: 'sample-iracema',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    productType: 'iul',
    title: 'Seguro de Vida Universal Indexado (IUL)',
    displayCurrency: 'USD',
    branding: {
      agentName: 'Adriano Salvador',
      agentTitle: 'Agente Financeiro Licenciado',
      agentLicense: '',
      company: 'Second Chance Financial',
      carrier: 'National Life Group',
    },
    client: { name: 'Iracema', age: startAge, sex: 'F' },
    iul: {
      premium: 250,
      premiumMode: 'monthly',
      paymentYears: 20,
      deathBenefit,
      livingBenefit: 64_000,
      livingBenefitPercent: 80,
      projectionYears,
      projectedAccumulatedValue: finalAccumulated,
      incomeOptionAnnual: 3_230,
      incomeToAge: 120,
      riders: DEFAULT_IUL_RIDERS.map((r) => ({ ...r })),
    },
    yearlyRows,
    highlightYears: [projectionYears],
    disclaimers: [...DEFAULT_IUL_DISCLAIMERS],
  })
}

/**
 * Sample TERM presentation, modeled on a real LSW Term 30-G illustration's
 * structure (Male 39, $600k, $71.54/mo, 30-year level term, convert first 20yr
 * or age 70). Fictional client — no real client data. Used by the design
 * preview and tests. Note the ledger has NO cash-value columns.
 */
export function sampleTermPresentation(): PresentationInputs {
  const termLengthYears = 30
  const startAge = 39
  const deathBenefit = 600_000
  const monthlyPremium = 71.54

  const yearlyRows = Array.from({ length: termLengthYears }, (_, i) => ({
    policyYear: i + 1,
    age: startAge + i,
    premiumPaid: Math.round(monthlyPremium * 12 * 100) / 100, // level annual premium
    deathBenefit, // level death benefit — no accumulated/surrender value
  }))

  return presentationInputsSchema.parse({
    id: 'sample-term',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    productType: 'term',
    productId: 'term',
    title: 'Seguro de Vida Temporário — Term 30',
    displayCurrency: 'USD',
    branding: {
      agentName: 'Adriano Salvador',
      agentTitle: 'Agente Financeiro Licenciado',
      agentLicense: '',
      company: 'Second Chance Financial',
      carrier: 'National Life Group',
    },
    client: { name: 'Cliente Exemplo', age: startAge, sex: 'M' },
    term: {
      premium: monthlyPremium,
      premiumMode: 'monthly',
      deathBenefit,
      termLengthYears,
      conversionYears: 20,
      conversionToAge: 70,
      riders: DEFAULT_TERM_RIDERS.map((r) => ({ ...r })),
    },
    yearlyRows,
    highlightYears: [termLengthYears],
    disclaimers: [...DEFAULT_TERM_DISCLAIMERS],
  })
}
