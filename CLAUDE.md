# CLAUDE.md — Arlindo

Guidance for Claude Code (and humans) working in this repo.

## What Arlindo is
A free, dead-simple web app for an insurance/retirement agent (Second Chance Financial ·
National Life Group, Brazil) to enter the numbers from a carrier illustration and generate
a polished, client-facing presentation to present live (iPad / Google Meet) and export as
PDF. Top product: **IUL (Indexed Universal Life)**. UI is **Portuguese (Brazil)** and must
be **extremely easy to use** (large touch targets, large type, high contrast, minimal typing).

## Stack
- **Vite + React 18 + TypeScript + Tailwind** — pure client-side SPA, no server.
- **HashRouter** (GitHub Pages friendly). Vite `base = /Arlindo/`.
- **PWA** via `vite-plugin-pwa` (installable to iPad Home Screen; durable storage).
- **Local-first persistence**: IndexedDB (`idb`) is the source of truth; a Supabase sync
  layer sits behind a `PassthroughSync` flag (off until wired). **React Query** for data.
- **Charts**: Recharts (SVG → crisp in PDF). **Validation**: zod. **i18n**: react-i18next.
- **Hosting**: GitHub Pages via `.github/workflows/deploy.yml`. Weekly Supabase keep-alive.

## Commands
- `npm run dev` — dev server. `npm run build` — typecheck + build. `npm run preview`.
- `npm test` — vitest. `npm run gen:icons` — regenerate PWA icons from `assets/icon-source.svg`.

## Architecture (the important seams)
- **Inputs → Derived split.** UI edits `PresentationInputs` (`@domain/model/presentation`,
  zod is the source of truth). The presentation renderer reads only a `DerivedPresentation`
  (`@domain/model/derived`) produced by a `CalculationEngine` (`@domain/calc`). Today the
  only engine is `PassthroughEngine` (reshapes typed illustration numbers). A future
  `IulProjectionEngine` will compute the same shape — slides won't change. Use `derive(inputs)`.
- **Product-aware** via `productType` ('iul' | 'annuity'); IUL is built first. Annuity + the
  other 3–4 products are later additions behind the same seam.
- **Design system** (`@design-system`): SCF tokens in `src/design-system/tokens/tokens.css`
  (rebrand = edit values there), primitives, and the slide set (`buildSlides`) on a fixed
  16:9 `SlideStage`/`FitSlide` with a `renderMode: preview|present|print` contract so present
  and PDF compose the same slides. Features import ONLY from `@design-system`.
- **Persistence** (`@persistence`): `presentationRepository` + `profileRepository` singletons;
  JSON export/import; magic-link auth helpers. Ask for durable storage via `requestPersistentStorage()`.
- **Routing** frozen in `@app/routes` + `src/app/router.tsx`. **Query keys** in `@app/queryKeys`.

## Build model — Foundation → parallel wave
Foundation (this branch) owns 100% of shared seams (contracts, design system, persistence,
routing, i18n scaffold, deploy). Feature work happens in `src/features/<x>/` per
`.claude/rules/arlindo-wave-ownership.md` — **read it before touching a feature**. Golden rules:
no cross-feature imports (navigate by `@app/routes` URLs), consume Foundation don't recreate it,
per-feature i18n namespaces, no `npm install`, keep each feature's default-export entry signature.

## Domain glossary
- **IUL** — Indexed Universal Life: permanent life insurance + cash accumulation tied to a
  market index with a **floor** (no loss in down years) and a **cap** (limited upside).
- **Death benefit** (Proteção por Morte) / **Living benefit** (Benefício em Vida) — living
  benefits let the client access part of the death benefit early for critical/chronic/terminal
  illness. Standard riders access up to **80%**; the **Premium Chronic Care Rider** up to
  **100%** (max $3M) at additional cost.
- **Riders** — optional coverages (Terminal/Chronic/Critical Illness, Critical Injury,
  Alzheimer's, Waiver of Premium, etc.). Modifiable: toggle + set percent + additional-cost flag.
- **Accumulated value** (Valor Acumulado) — cash value inside the policy. **GLIR** — Guaranteed
  Lifetime Income Rider (annuity). **Cap/Floor** — upside limit / downside protection.

## Conventions
- All user-facing strings via i18n (pt-BR). Currency via `@domain/format` (`formatMoney`), USD
  with pt-BR grouping (`US$ 1.234,56`).
- Path aliases: `@app @design-system @domain @persistence @features @shared @i18n`.
- Do nothing on resume/focus (PWA reopened by the user must not refetch-flash or reload).
- Always render loading/empty/error states. Test money/rider/date logic (vitest).

## One-time setup (human)
1. **GitHub Pages**: repo Settings → Pages → Source: **GitHub Actions**. First push to the
   branch deploys to `https://<user>.github.io/Arlindo/`.
2. **Supabase schema** (for cloud sync): run `supabase/migrations/0001_init.sql` once in the
   Arlindo project's SQL Editor. The app works local-first without this.
3. **Env**: `.env` holds `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon key is public by
   design; RLS is the security boundary).
