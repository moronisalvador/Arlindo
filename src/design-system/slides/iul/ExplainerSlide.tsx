import type { DerivedPresentation } from '@domain/model/derived'
import { Card } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

const PILLARS = [
  { icon: '💰', title: 'Proteção por Morte', body: 'Cobertura que protege a família para sempre.' },
  { icon: '❤️', title: 'Benefício em Vida', body: 'Antecipe parte do valor em caso de doença grave.' },
  { icon: '📈', title: 'Valor Acumulado', body: 'Uma parte de cada depósito rende ao longo do tempo.' },
  { icon: '♾️', title: 'Sem Expiração', body: 'Proteção vitalícia — não expira como o seguro temporário.' },
]

/** "O que é uma IUL" explainer — four pillars (SCF card grid). */
export function ExplainerSlide({ derived }: { derived: DerivedPresentation }) {
  const name = derived.meta.clientName || 'o cliente'
  return (
    <ContentSlide eyebrow="Entendendo o Produto" title="O que é uma IUL?">
      <p className="mb-8 max-w-[900px] font-sans text-xl leading-relaxed text-ink">
        A IUL é permanente: protege {name} para sempre e, ao mesmo tempo, constrói um patrimônio
        que rende com base em um índice de mercado — <strong>sobe com o índice, mas nunca cai
        quando o mercado cai</strong> (existe um piso de proteção).
      </p>
      <div className="grid grid-cols-4 gap-5">
        {PILLARS.map((p) => (
          <Card key={p.title} className="h-full">
            <div className="text-4xl">{p.icon}</div>
            <h4 className="mt-3 font-serif text-xl font-semibold text-navy">{p.title}</h4>
            <p className="mt-2 font-sans text-base text-muted">{p.body}</p>
          </Card>
        ))}
      </div>
    </ContentSlide>
  )
}
