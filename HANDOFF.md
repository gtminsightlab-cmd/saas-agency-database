# SaaS Agency Database — Session 1 Handoff

**Date built:** 2026-04-24
**Supabase project:** `seven16group` (ref: `sdlsdovuljuymgymarou`)
**Status:** Database layer complete, advisors clean, ready for data import + frontend.

---

## What's live in Supabase right now

22 tables across 4 logical zones:

1. **Multi-tenant + users** — `tenants`, `app_users`, `usage_logs`
2. **Lookups** — `account_types`, `agency_management_systems`, `lines_of_business`, `sic_codes`, `carriers`, `affiliations`, `affiliation_aliases`
3. **Core domain** — `agencies`, `contacts`, `agency_lines`, `company_lines_raw`, `agency_sic_codes`, `agency_affiliations`, `agency_carriers`
4. **Features** — `saved_lists`, `downloads`, `data_dictionary_fields`, `top_agency_lists`, `top_agency_members`

**Row Level Security (RLS):** enabled on every table. Users only see rows where `tenant_id` matches their own (except `super_admin`, which sees everything). Helper functions installed: `current_app_user()`, `current_tenant_id()`, `current_user_role()`, `is_super_admin()`.

**Auth linkage:** an `after insert on auth.users` trigger automatically links a new Supabase Auth user to their pre-seeded `app_users` row by email.

**Seeded:**
- 1 tenant: **Seven16 Group** (slug: `seven16`, plan: `white_label`)
- 1 super admin shell: `gtminsightlab@gmail.com` (will auto-link when you sign up through Supabase Auth)
- 10 account types, 13 agency management systems, 25 lines of business
- 196 rows in `data_dictionary_fields` auto-populated from `information_schema`

**Migrations applied (8):**
```
0001_base_extensions_and_tenants
0002_lookups
0003_core_domain_agencies_contacts_relationships
0004_saved_lists_downloads_dictionary_top100
0005_rls_policies
0006_seed_starter_data
0007_populate_data_dictionary
0008_advisor_fixes
```

All files saved locally in `supabase/migrations/`.

---

## Connection info for the frontend

```
NEXT_PUBLIC_SUPABASE_URL=https://sdlsdovuljuymgymarou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_m3e3yBnBxycaQpt4mAEN8Q_5fkA8P2s
```

The **service role key** (for server-side scripts that need to bypass RLS during data imports) is NOT in this file — you'll grab that from the Supabase dashboard when we build the importer.

---

## Hosting architecture (important)

This app lives on a **subdomain**, not the apex. Your main domain (`yourdomain.com`) stays free for a marketing site that promotes the whole product family; this agency database is just one product of many.

**Plan:**
- Apex + `www` → marketing site (separate project, later)
- `agencies.yourdomain.com` (or `directory.` — you pick) → this Next.js app on Vercel
- Cloudflare: CNAME on the chosen subdomain pointing to `cname.vercel-dns.com`, proxy **off** so Vercel can issue its own SSL

I'll give you the exact DNS record to paste when we get to the deploy step.

---

## Next session — what we'll do

1. **Import your data files** — agencies CSV, contacts CSV, lookup lists (carriers, affiliations, SIC). I'll build a small Node script and point it at your files.
2. **Scaffold the Next.js app** on Vercel: pages for `/agency-directory`, `/build-list`, `/saved-lists`, `/downloads`, `/quick-search`, `/data-mapping`.
3. **Wire up auth** — Supabase Auth email login; your super_admin row auto-links.
4. **Connect GitHub + Vercel** so every push auto-deploys, then attach the subdomain via Cloudflare DNS.

---

## What I need from you before next session (explain-like-you're-5)

### 1. Make a GitHub account and a blank repo

1. Go to **github.com** in your browser.
2. If you don't have an account yet, click **Sign up** (top right, blue button). Use `gtminsightlab@gmail.com`.
3. Once logged in, click the **+** icon in the top right → **New repository**.
4. Repository name: type `saas-agency-database`
5. Leave everything else alone. Don't tick "Add a README".
6. Scroll down and click the big green **Create repository** button.
7. You'll land on a page with some grey instructions. **Copy the URL at the top** — it looks like `https://github.com/your-username/saas-agency-database.git`. Paste that into our next chat.

### 2. Tell me which subdomain you want

Pick one word that will appear in front of your domain — e.g. `agencies`, `directory`, `find`, `search`. You'll also want to tell me the main domain name itself (the one you've got on Cloudflare). Example: if your domain is `seven16.com` and you pick `agencies`, the app will live at `agencies.seven16.com`. Just drop both into our next chat.

### 3. Make a Vercel account

1. Go to **vercel.com** in your browser.
2. Click **Sign Up** (top right).
3. Click **Continue with GitHub** — this is the easy way, it links the two accounts for us.
4. When Vercel asks permission to see your GitHub, click **Authorize Vercel**.
5. Vercel will ask for a **team/account name** — you can just accept the default (usually your GitHub username).
6. You're done. Don't create a project yet — I'll walk you through that next session once we have code to deploy.

### 4. Put your data files somewhere I can reach them

Drop the three files into the folder `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\data\`:
- The **agencies** file (CSV or Excel)
- The **contacts** file (CSV or Excel)
- The **lookup lists** file (affiliations/carriers/SIC, whatever shape you have it in)

If the folder `data\` doesn't exist yet, just create it — right-click in the main folder → **New → Folder** → name it `data`.

### 5. (Optional) Supabase Auth email setup

When you want to actually log in, go to Supabase dashboard → `seven16group` project → **Authentication → Sign in providers → Email** and make sure it's enabled (it usually is by default). Then sign up once at whatever frontend URL we build, using your `gtminsightlab@gmail.com` email. The trigger will automatically connect you to your pre-built super_admin row.

---

## How to verify this worked

If you want to check the database yourself, go to Supabase dashboard → `seven16group` → **Table Editor**. You should see all 22 tables. Click `tenants` — you'll see one row, "Seven16 Group". Click `lines_of_business` — you'll see 25 rows like "Workers Compensation", "Cyber Liability", etc.

---

## Files saved to your workspace

```
supabase/migrations/0001_base_extensions_and_tenants.sql
supabase/migrations/0002_lookups.sql
supabase/migrations/0003_core_domain_agencies_contacts_relationships.sql
supabase/migrations/0004_saved_lists_downloads_dictionary_top100.sql
supabase/migrations/0005_rls_policies.sql
supabase/migrations/0006_seed_starter_data.sql
supabase/migrations/0007_populate_data_dictionary.sql
supabase/migrations/0008_advisor_fixes.sql
HANDOFF.md   (this file)
```
