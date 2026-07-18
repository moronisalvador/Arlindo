# Arlindo — Wave Ownership Manifest

Foundation (Phase F) is merged. The wave (W1–W5) builds in parallel. This manifest
makes the wave **file-disjoint**: each session edits ONLY the files it owns, so there
are zero merge collisions. Do not edit anything outside your ownership block.

## Global rules (bind every wave session)

1. **No cross-feature imports.** A feature NEVER imports from another `features/<x>`.
   Navigate between features by URL only, using `@app/routes` (`routes.editor(id)`, etc.).
2. **Consume Foundation, never re-create it.** Import UI from `@design-system`, data
   types/zod from `@domain/model/presentation`, the derive fn from `@domain/calc`,
   storage from `@persistence`, query keys from `@app/queryKeys`, formatting from
   `@domain/format`. Do NOT add new shared primitives, new zod schemas for the core
   model, new routes, or new query keys.
3. **i18n is per-feature.** Put strings in `src/features/<x>/i18n/pt-BR.ts` and register
   them at module load: `registerNamespace('<ns>', ptBR)` (from `@i18n/index`). Use
   `useTranslation('<ns>')`. Never edit `src/i18n/locales/pt-BR/common.ts`.
4. **Keep the entry signature.** Each feature's `index.tsx` stays a default export with
   no props (the router lazy-imports it). You overwrite the stub body only.
5. **No `npm install`.** All wave dependencies are already installed and `package.json`
   is frozen. If you think you need a new dep, stop — you probably don't.
6. **Page-lifecycle rule.** Do nothing on resume/focus (no refetch flash, no reload).
   Force loading/empty/error states (use `Loading`/`EmptyState`/`ErrorState`).
7. **Large-touch, PT-BR, high-contrast.** Default `Button` size is `lg`. All copy in
   pt-BR via i18n.

## FROZEN — nobody edits these in the wave
`src/domain/**` · `src/persistence/**` · `src/design-system/**` · `src/app/routes.ts` ·
`src/app/queryKeys.ts` · `src/app/router.tsx` · `src/app/providers.tsx` ·
`src/app/AppShell.tsx` · `src/app/DesignPreviewPage.tsx` · `src/i18n/index.ts` ·
`src/i18n/locales/**` · `vite.config.ts` · `tailwind.config.ts` · `tsconfig*.json` ·
`package.json` · `.github/**` · `supabase/**`

## Ownership

### W1 — Presentations home + client CRUD + backup + profile settings UI
- Owns: `src/features/presentations/**`, `src/features/settings/**`
- Serves routes: `/` (list), `/config` (profile settings)
- Build: presentations list (uses `presentationRepository.list()` + `observe()`),
  create (`create({ branding: <profile> })`), open (→ `routes.editor(id)`), delete,
  **duplicate**; JSON export/import UI (`exportAll`/`exportOne`/`import`, download/upload
  a `.json`); settings screen editing the branding profile (`profileRepository`).
- Invalidate `queryKeys.presentations` after mutations.

### W2 — IUL data-entry wizard + rider editor
- Owns: `src/features/data-entry/**`
- Serves routes: `/cliente/novo`, `/cliente/:id`
- Build: large-touch guided wizard editing a `PresentationInputs` (import the zod schema
  from `@domain/model/presentation`); year-by-year table editor; **rider editor**
  (toggle `included`, set `percent` 80/100, `additionalCost`); branding shown from the
  presentation. Autosave via `presentationRepository.save()`. Use `parseNumberInput`.
- Preview the derived slides with `derive(inputs)` + `@design-system` `FitSlide`.

### W3 — Present mode
- Owns: `src/features/present/**`
- Serves route: `/apresentar/:id` (fullscreen, no shell)
- Build: load by id, `derive(inputs)`, `buildSlides(derived)`; deck controller with
  keyboard (←/→/Space/Esc) + swipe + large tap zones; `min-h-dvh` fixed overlay;
  `RenderModeProvider mode="present"`; `FitSlide` per slide; `navigator.wakeLock`.

### W4 — PDF export
- Owns: `src/features/export-pdf/**`
- Serves route: `/pdf/:id` (fullscreen)
- Build: `RenderModeProvider mode="print"`; render every `buildSlides` slide stacked,
  one per page (`break-after: page`, `.print-only`/`.no-print`); an "Exportar PDF"
  button calling `window.print()`; a one-time iPad hint. Use the print base already in
  `index.css`.

### W5 — "Cálculo — Em breve"
- Owns: `src/features/calc-coming-soon/**`
- Serves route: `/calculo`
- Build: already a clean placeholder; polish only.

## Frozen contracts cheat-sheet
- `PresentationInputs`, `presentationInputsSchema`, `isPresentable`, `Rider`, `YearlyRow`,
  `Branding` — `@domain/model/presentation`
- `DEFAULT_IUL_RIDERS`, `DEFAULT_IUL_DISCLAIMERS` — `@domain/model/riders`
- `derive(inputs)` → `DerivedPresentation` — `@domain/calc`
- `presentationRepository`, `profileRepository`, auth helpers — `@persistence`
- `routes`, `routePatterns` — `@app/routes`; `queryKeys` — `@app/queryKeys`
- `buildSlides`, `FitSlide`, `RenderModeProvider`, primitives — `@design-system`
- `formatMoney/formatNumber/formatPercent/parseNumberInput` — `@domain/format`
