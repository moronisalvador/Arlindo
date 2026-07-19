# Arlindo — Handoff for the next session

> **Read this first.** It hands off from the cloud sessions that built Arlindo's IUL product
> to a fresh local session that will (1) research National Life **Term** products into the
> knowledge base, (2) build a **Term** product type using the real sample illustration, and
> (3) polish the UI/presentation. Also read `CLAUDE.md` (architecture + conventions) and
> `.claude/rules/arlindo-wave-ownership.md` (seam map — note the "frozen" rules were for the
> original parallel build; a single session may edit across seams, but keep the architecture).

## What Arlindo is
A free, client-side web app for an older insurance agent (Second Chance Financial · National
Life Group, Brazil) to type carrier-illustration numbers and generate a polished client
presentation to present live and export as **PDF** and **PowerPoint (.pptx)**. UI is **pt-BR**;
the generated presentation can be **PT / EN / ES**. Top product today: **IUL (FlexLife)**.

## Current state (live on `main`)
Deployed via GitHub Pages at **https://moronisalvador.github.io/Arlindo/** (deploy runs from
`main` only — `.github/workflows/deploy.yml`). Shipped and working end-to-end for **IUL**:
- Presentations home + CRUD + duplicate + JSON backup; agent profile settings.
- Data-entry: collapsible sections, source toggle (typed illustration vs app estimate) at the
  top, per-mode fields, auto-derived values (living benefit, projected value, table Idade/DB),
  rider editor (accessible %: 80/90/100 presets + custom; 90% kept per the rep's real usage).
- Present mode (keyboard/swipe/wake-lock), PDF export (print CSS), **editable .pptx** (pptxgenjs).
- App-computed **estimator** at `/calculo` (`IulProjectionEngine`, approximate, AG 49-B-capped,
  labeled "estimativa — não garantida").
- **Multi-language output** PT/EN/ES (`src/domain/presentationCopy.ts` + `localeFor`).
- **Real SCF logo** (`public/scf-logo.png` via `BrandLogo`); navy + gold brand.
- **Knowledge base** `docs/knowledge/` — FlexLife facts (confidence + audit verdict + sources),
  the raw adversarial audit JSON, and a dormant estimator-calibration guide.

## Commands
`npm run dev` · `npm run build` (typecheck + build) · `npm test` (vitest, 19 passing) ·
`npm run preview`. Chromium/Playwright preinstalled for screenshots (see CLAUDE.md env notes).

## Architecture map (key files)
- **Model (zod source of truth):** `src/domain/model/presentation.ts` (`PresentationInputs`,
  `productType` = `'iul' | 'annuity'` today — **add `'term'`**), `derived.ts` (renderer contract),
  `products.ts` (NLG product registry), `riders.ts` (ABR suite + disclaimers).
- **Calc engines:** `src/domain/calc/` — `PassthroughEngine` (typed numbers), `IulProjectionEngine`
  (estimate), `index.ts` `selectEngine`/`derive`.
- **Presentation copy (PT/EN/ES) + rider/disclaimer translations:** `src/domain/presentationCopy.ts`.
- **Formatting:** `src/domain/format/index.ts` (`formatMoney/Number/Percent`, `localeFor`).
- **Slides:** `src/design-system/slides/iul/*` + `buildSlides.tsx`; fixed 16:9 stage; `renderMode`
  preview/present/print. Features import ONLY from `@design-system`.
- **Features:** `src/features/{presentations,data-entry,present,export-pdf,calc-coming-soon,settings}`.
- **Export:** `src/export/pptx.ts`. **Routing:** `src/app/routes.ts`, `router.tsx`.
- **Sample illustration (Term):** `Dave Miller.pdf` — a **Term 30-G / LSW** illustration
  ($600k, $71.54/mo, Male 39 Elite Non-Tobacco, VA; 5 ABRs; conversion privilege). **Git-ignored**
  (contains client PII) — keep your local copy in the repo folder; it won't be committed.

---

## Next work

### 1) Research National Life **Term** products → knowledge base (do this FIRST)
Replicate exactly the method used for IUL so the Term KB matches:
- Run the **`deep-research`** skill on NLG/LSW **Term** life products (lineup, e.g. Term 30-G and
  the rest of the term series; issue ages/lengths; conversion privilege terms; the ABR suite on
  term; premium structure; state variations; foreign-national rules).
- Then run an **adversarial accuracy audit** (an ultracode `Workflow`, mirroring the IUL run):
  per claim, one evidence-gathering verifier + one skeptic prompted to refute, against NLG/LSW
  primary sources; synthesize.
- Produce, mirroring `docs/knowledge/national-life-flexlife.md`:
  - `docs/knowledge/national-life-term.md` — curated facts, each tagged **confidence + verdict +
    source URLs**, with a corrections/decisions section.
  - `docs/knowledge/term-audit-<date>.json` — the raw verdicts + synthesis, verbatim.
  - Update `docs/knowledge/README.md` to list the Term files.
- **Cross-check against `Dave Miller.pdf`** (real Term 30-G): ledger is **Policy Year · Age ·
  Guaranteed Premium · Guaranteed Death Benefit** only — **no cash value / CSV / accumulation /
  LIBR** (term has none). ABR living-benefit values are **discounted, condition-specific** (sample:
  Terminal ~86%, Critical/Injury ~79%, Alzheimer's ~62% of the $600k DB) — not a flat %.

### 2) Build the **Term** product type (use the sample as the reference)
- Add `productType: 'term'` to `productTypeSchema`; add a `term` fields object (face/death benefit,
  premium + mode, term length, conversion window, ABR riders, and a level premium schedule) to the
  zod model — additive, keep `schemaVersion`/migrations sane.
- Add Term product(s) to the `NLG_PRODUCTS` registry (carrier LSW/NL, min face, positioning,
  `available: true`); only ship **guaranteed/structural** facts — never hardcode current rates.
- **Term slide set** (branch `buildSlides` on `productType`): reuse Cover, the
  Protection/Living-benefits headline (**drop the accumulation card** — term has no cash value),
  a Coverage slide (premium + death benefit + living benefit + conversion privilege), a
  **Premium Schedule** table (Policy Year · Age · Premium · Death Benefit), the ABR detail, a
  **Term-vs-Permanent** comparison, and Disclaimers. **Drop** the IUL Projection (accumulated-value
  growth), the accumulated-value year table, and the Withdraw-vs-Income "Duas Opções" slides — none
  apply to term.
- Term has **no estimator** (no cash value); the data-entry "Estimar no app" toggle should not
  appear for term.
- Localize all new Term copy in PT/EN/ES via `presentationCopy.ts`; add per-feature i18n strings.
- Verify with a generated Term deck (screenshot present + PDF + a .pptx) against `Dave Miller.pdf`.

### 3) UI / presentation polish
- **Mobile/iPhone** (deferred): header/nav overflow at 390px; present-mode portrait "rotate" hint.
  Test at 390px + iPad.
- General presentation polish (spacing, type scale, slide density) — use the design system tokens
  (`src/design-system/tokens/`), keep navy + gold, high contrast, large touch targets.

## Guardrails (carry over)
- **Never hardcode** current caps/participation/bonus/illustrated rates — rate-sheet-driven; only
  guaranteed minimums + structural facts are safe. The **official carrier illustration is
  authoritative**; app estimates are labeled "estimativa — não garantida".
- **Compliance:** required disclaimers auto-render; foreign-national/Brazil = USD, min face ~$500k,
  US solicitation/illustration/signing/delivery; ABR access generally requires the client in the US.
- **pt-BR UI**; all strings via i18n; currency USD via `@domain/format`.
- **Local-first** (IndexedDB source of truth); do nothing on resume/focus; render loading/empty/error.
- **Deploy from `main` only.** Develop on a feature branch; open a **draft PR**; the human merges to
  deploy. Keep model identifiers out of commits/PRs/code.

## Dormant / later
- **Estimator calibration (Path B):** `docs/knowledge/calibration-capture-list.md` — needs a real
  **FlexLife IUL** illustration (the Dave Miller sample is Term, no cash-value ledger to fit).
- **Supabase sync:** local-first works today; flip on `PassthroughSync` once the project is reachable
  (run `supabase/migrations/0001_init.sql` once).
- **Annuity** + the other NLG products via the same registry.

## ⚠️ Privacy note (`Dave Miller.pdf`)
Now **git-ignored** (`.gitignore`: `Dave Miller.pdf`, `/samples/`, `*.illustration.pdf`) — keep client
illustrations local, never commit them to this public repo. **Note:** the file still exists in earlier
git history (it was committed before being ignored); if "Dave Miller" is a real client and that matters,
scrub it from history (`git filter-repo`/BFG + force-push) — ask the human first, since it rewrites `main`.

## Verification checklist for the next session
- `npm run build` clean; `npm test` green.
- Term: create a Term presentation from `Dave Miller.pdf`'s numbers → present + PDF + .pptx match;
  no IUL-only slides appear; PT/EN/ES all render.
- Term KB: only high-confidence verified facts marked "product-accurate"; sources cited.
- Screenshot key screens at desktop + 390px before opening the PR.
