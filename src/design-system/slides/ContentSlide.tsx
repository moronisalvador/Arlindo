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
    <SlideRoot className="flex flex-col bg-surface-alt">
      <NavyHeaderBar eyebrow={eyebrow} title={title} />
      {/* Body fills the space below the header and vertically centers its content,
          so slides with little content aren't top-heavy with an empty lower band. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center p-12">{children}</div>
    </SlideRoot>
  )
}
