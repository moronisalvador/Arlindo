# Arlindo

**App ao vivo:** https://moronisalvador.github.io/Arlindo/ — abra no iPad e toque em
"Adicionar à Tela de Início".

Ferramenta web para o agente montar apresentações de seguros e aposentadoria (IUL) a partir
dos números da ilustração da seguradora — apresentar ao vivo (iPad / Google Meet) e exportar PDF.

Web app for an insurance/retirement agent to turn carrier-illustration numbers into a polished,
client-facing presentation. In **Portuguese (Brazil)**, built to be **extremely simple**, free to
host and run.

## Tech
Vite · React · TypeScript · Tailwind · PWA · local-first (IndexedDB) + optional Supabase sync ·
Recharts · deployed free to GitHub Pages.

## Development
```bash
npm install
npm run dev        # http://localhost:5173/Arlindo/
npm run build      # typecheck + production build
npm test           # unit tests
```
Open `/#/preview` to see the design system gallery.

## One-time setup
1. **GitHub Pages** — repo Settings → Pages → Source: **GitHub Actions**. Pushing deploys to
   `https://<user>.github.io/Arlindo/`. On the iPad, open that URL and **Add to Home Screen**.
2. **Supabase (optional cloud sync)** — run `supabase/migrations/0001_init.sql` once in the
   Arlindo project's SQL Editor. The app is fully functional local-first without it.
3. **Env** — `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public client values;
   security is enforced by Row Level Security).

## How it's built
Foundation-first, then parallel feature waves — see `CLAUDE.md` and
`.claude/rules/arlindo-wave-ownership.md`.
