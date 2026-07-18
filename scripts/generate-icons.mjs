// Rasterizes assets/icon-source.svg into the PWA + Apple touch icons in public/.
// Run with: npm run gen:icons
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'assets', 'icon-source.svg'))
const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })

const targets = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-48.png', size: 48 },
]

for (const { name, size } of targets) {
  await sharp(src, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(outDir, name))
  console.log('wrote', name)
}
