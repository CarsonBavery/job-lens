# JobLens

AI-assisted job search platform: Gemini-tailored resume and cover letter storage, application tracking, and a deduplicated job board aggregated from multiple sources.

- **Free tier:** 3 base resumes + 1 cover letter
- **Paid tier:** expanded storage/usage, later licensed job-source coverage

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture and [`PROGRESS.md`](./PROGRESS.md) for the current build status and backlog.

## Tech Stack
Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4, Supabase (Postgres/Auth/Storage/pgvector), Google Gemini (`@google/genai`), Stripe, deployed on Vercel. Job listings are ingested only from free public ATS APIs (Greenhouse, Lever, Ashby, Workable) — no LinkedIn/Indeed scraping.

## Getting Started

1. Copy the env template and fill in real values (Supabase project keys, Gemini API key, Stripe test keys):
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Apply the database schema to your Supabase project (`supabase/migrations/0001_init.sql`) via the Supabase CLI or the SQL editor.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Commands
```bash
npm run dev         # dev server (Turbopack)
npm run build       # production build
npm run start       # run production build
npm run lint        # eslint
npm run test         # vitest (unit)
npm run test:watch   # vitest watch mode
npm run test:e2e     # playwright (e2e, starts its own dev server)
```
