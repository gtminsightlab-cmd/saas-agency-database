# Seven16 Agency Directory

A multi-tenant B2B commercial insurance agency directory. Next.js 14 App Router + Supabase.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Supabase Postgres** (seven16group project, RLS-enabled)
- **Tailwind CSS**
- **Vercel** for hosting, at `directory.seven16group.com`
- **Cloudflare** for DNS

## Pages

| Route | Purpose |
|---|---|
| `/` | Overview dashboard with row counts |
| `/agency-directory` | Browse agencies with filters |
| `/build-list` | Stack filters and save matching agencies as a list |
| `/saved-lists` | Review previously saved search definitions |
| `/downloads` | CSV export history |
| `/quick-search` | Find a specific agency by name |
| `/data-mapping` | Column-level field dictionary for all 22 tables |

## Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase values. These are already the correct defaults for the seven16group project.

## Local dev

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deployment

Vercel auto-deploys on push to `main`. Environment variables live in the Vercel project settings, not in this repo.

## Database

Migrations live in `supabase/migrations/`. Apply with Supabase MCP or the Supabase CLI.
