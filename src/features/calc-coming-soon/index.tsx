import { Card, EyebrowLabel } from '@design-system'

/**
 * "Cálculo — Em breve". Owned by Wave W5. The app currently uses the numbers the
 * agent types from the carrier illustration (PassthroughEngine); a future engine
 * will compute the projections here behind the same interface.
 */
export default function CalcComingSoonPage() {
  const upcoming = [
    'Calcular a projeção do valor acumulado a partir de poucos dados.',
    'Simular diferentes valores de depósito mensal.',
    'Comparar cenários de rendimento automaticamente.',
  ]
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="text-center">
        <EyebrowLabel>Cálculo Automático</EyebrowLabel>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-navy">Em breve</h1>
        <p className="mt-3 text-lg text-muted">
          Hoje o Arlindo usa os números que você digita da ilustração da seguradora. Em breve, o
          próprio app poderá calcular as projeções.
        </p>
      </div>
      <Card>
        <ul className="space-y-3">
          {upcoming.map((u) => (
            <li key={u} className="flex items-start gap-3 text-lg text-ink">
              <span className="text-orange">✓</span>
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
