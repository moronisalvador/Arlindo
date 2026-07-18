import type { ReactNode } from 'react'
import { NavyHeaderBar } from '@design-system/primitives'
import { SlideRoot } from './Slide'

/** Standard content slide: navy header bar (eyebrow + title + logo) over a light body. */
export function ContentSlide({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  children: ReactNode
}) {
  return (
    <SlideRoot className="bg-surface-alt">
      <NavyHeaderBar eyebrow={eyebrow} title={title} />
      <div className="p-12">{children}</div>
    </SlideRoot>
  )
}
