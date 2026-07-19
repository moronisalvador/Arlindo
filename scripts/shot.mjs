// Capture a single presentation slide to a PNG via headless Chromium (Playwright).
//
// Uses the app's single-slide preview route (#/preview?only=<id>), so it grabs one
// clean 16:9 slide with no app chrome. Great for eyeballing a design change or
// wiring up visual-regression later.
//
// Prereq: a running server (dev is fine)  →  npm run dev
// Usage:
//   node scripts/shot.mjs                 # defaults to the IUL projection slide
//   node scripts/shot.mjs projection cover comparison
//   node scripts/shot.mjs --product=term headline coverage schedule comparison
//   SHOT_BASE=http://localhost:4173/Arlindo/ node scripts/shot.mjs   # e.g. vite preview
//
// IUL slide ids:  cover, headline, explainer, coverage, projection, table,
//                 timeline, options, comparison, value, nextSteps, disclaimers.
// Term slide ids: cover, headline, coverage, schedule, comparison, value,
//                 nextSteps, disclaimers.
// Files are written as screenshots/slide-<product>-<id>.png.
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BASE = (process.env.SHOT_BASE ?? 'http://localhost:5173/Arlindo/').replace(/#.*$/, '')
const args = process.argv.slice(2)
const productArg = args.find((a) => a.startsWith('--product='))
const product = productArg?.split('=')[1] === 'term' ? 'term' : 'iul'
const ids = args.filter((a) => !a.startsWith('--'))
const slides = ids.length > 0 ? ids : ['projection']

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })

try {
  for (const id of slides) {
    const url = `${BASE}#/preview?only=${encodeURIComponent(id)}&product=${product}`
    await page.goto(url, { waitUntil: 'networkidle' })
    const stage = page.locator('[data-slide-stage]')
    await stage.waitFor({ state: 'visible', timeout: 15_000 })
    await page.evaluate(() => document.fonts.ready)
    // Let Recharts finish its enter animation before capturing.
    await page.waitForTimeout(1600)
    const file = join(outDir, `slide-${product}-${id}.png`)
    await stage.screenshot({ path: file })
    console.log(`✓ ${product}/${id} → ${file}`)
  }
} catch (err) {
  console.error(`\n✗ Screenshot failed: ${err.message}`)
  console.error(`  Is the dev server up? Try: npm run dev  (or set SHOT_BASE)\n`)
  process.exitCode = 1
} finally {
  await browser.close()
}
