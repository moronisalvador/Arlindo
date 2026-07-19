/**
 * Browser-only PDF text extraction for the illustration importer. Uses pdf.js,
 * dynamically imported so it stays out of the main bundle (loaded only when the
 * agent actually imports a PDF). The PDF is read entirely in-browser and never
 * uploaded anywhere — this matches Arlindo's local-first, PII-safe design.
 *
 * Output is layout-preserved plain text: items are grouped into lines by their
 * y-coordinate and ordered left-to-right, so the domain parser
 * (@domain/illustration) can read the ledger tables token-by-token.
 */

/** Group tolerance (PDF units) for deciding two text items share a line. */
const LINE_TOLERANCE = 3

type TextItemLike = { str: string; transform: number[] }

/** Extract layout-preserved text from an illustration PDF (all pages). */
export async function extractIllustrationText(file: File): Promise<string> {
  const data = await file.arrayBuffer()

  // Lazy-load pdf.js + its worker only when importing (keeps them code-split).
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const doc = await pdfjs.getDocument({ data }).promise
  const pageTexts: string[] = []

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const items = content.items.filter(
      (it) => typeof (it as TextItemLike).str === 'string',
    ) as unknown as TextItemLike[]

    // Bucket items into lines by y (transform[5]); order lines top→bottom.
    const lines: { y: number; items: TextItemLike[] }[] = []
    for (const it of items) {
      if (!it.str.trim()) continue
      const y = it.transform[5]
      let line = lines.find((l) => Math.abs(l.y - y) <= LINE_TOLERANCE)
      if (!line) {
        line = { y, items: [] }
        lines.push(line)
      }
      line.items.push(it)
    }
    lines.sort((a, b) => b.y - a.y)

    const text = lines
      .map((l) =>
        l.items
          .sort((a, b) => a.transform[4] - b.transform[4])
          .map((it) => it.str.trim())
          .filter(Boolean)
          .join(' '),
      )
      .join('\n')
    pageTexts.push(text)
    page.cleanup()
  }

  await (doc as { destroy?: () => Promise<void> }).destroy?.()
  return pageTexts.join('\n')
}
