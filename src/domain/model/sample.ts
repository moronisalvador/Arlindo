import { presentationInputsSchema, type PresentationInputs } from './presentation'
import { DEFAULT_IUL_RIDERS, DEFAULT_IUL_DISCLAIMERS } from './riders'

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
