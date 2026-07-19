import type { ReactNode } from 'react'
import type { DerivedPresentation } from '@domain/model/derived'
import { CoverSlide } from './iul/CoverSlide'
import { HeadlineSlide } from './iul/HeadlineSlide'
import { ExplainerSlide } from './iul/ExplainerSlide'
import { CoverageRidersSlide } from './iul/CoverageRidersSlide'
import { ProjectionSlide } from './iul/ProjectionSlide'
import { TableSlide } from './iul/TableSlide'
import { WithdrawVsIncomeSlide } from './iul/WithdrawVsIncomeSlide'
import { ComparisonSlide } from './iul/ComparisonSlide'
import { DisclaimersSlide } from './iul/DisclaimersSlide'
import { TermHeadlineSlide } from './term/TermHeadlineSlide'
import { TermCoverageSlide } from './term/TermCoverageSlide'
import { TermScheduleSlide } from './term/TermScheduleSlide'
import { TermComparisonSlide } from './term/TermComparisonSlide'

export interface BuiltSlide {
  id: string
  title: string
  node: ReactNode
}

/**
 * The single ordered slide set for a presentation. Present mode (W3) and PDF
 * export (W4) both consume this — they compose the same slides, differing only
 * by render mode. Slides with no data are omitted. Branches on product type:
 * IUL and Term compose different decks (term has no accumulation/income slides).
 */
export function buildSlides(derived: DerivedPresentation): BuiltSlide[] {
  if (derived.meta.productType === 'term') return buildTermSlides(derived)
  return buildIulSlides(derived)
}

/**
 * Term deck: Cover → Protection headline → Coverage (+ conversion) → Premium
 * Schedule (if rows) → Term-vs-Permanent → Disclaimers. No IUL projection,
 * accumulated-value table, "What is an IUL", or withdraw-vs-income slides —
 * term has no cash value. Cover + Disclaimers are the shared (generic) slides.
 */
function buildTermSlides(derived: DerivedPresentation): BuiltSlide[] {
  const slides: BuiltSlide[] = [
    { id: 'cover', title: 'Capa', node: <CoverSlide derived={derived} /> },
    { id: 'headline', title: 'Resumo', node: <TermHeadlineSlide derived={derived} /> },
    { id: 'coverage', title: 'Cobertura', node: <TermCoverageSlide derived={derived} /> },
  ]

  if (derived.table.length > 0) {
    slides.push({ id: 'schedule', title: 'Cronograma', node: <TermScheduleSlide derived={derived} /> })
  }

  slides.push(
    { id: 'comparison', title: 'Temporário vs Permanente', node: <TermComparisonSlide derived={derived} /> },
    { id: 'disclaimers', title: 'Avisos', node: <DisclaimersSlide derived={derived} /> },
  )

  return slides
}

function buildIulSlides(derived: DerivedPresentation): BuiltSlide[] {
  const slides: BuiltSlide[] = [
    { id: 'cover', title: 'Capa', node: <CoverSlide derived={derived} /> },
    { id: 'headline', title: 'Resumo', node: <HeadlineSlide derived={derived} /> },
    { id: 'explainer', title: 'O que é IUL', node: <ExplainerSlide derived={derived} /> },
    { id: 'coverage', title: 'Cobertura', node: <CoverageRidersSlide derived={derived} /> },
    { id: 'projection', title: 'Projeção', node: <ProjectionSlide derived={derived} /> },
  ]

  if (derived.table.length > 0) {
    slides.push({ id: 'table', title: 'Ano a ano', node: <TableSlide derived={derived} /> })
  }

  slides.push(
    {
      id: 'options',
      title: 'Duas opções',
      node: <WithdrawVsIncomeSlide derived={derived} />,
    },
    { id: 'comparison', title: 'Termo vs IUL', node: <ComparisonSlide derived={derived} /> },
    { id: 'disclaimers', title: 'Avisos', node: <DisclaimersSlide derived={derived} /> },
  )

  return slides
}
