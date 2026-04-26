# Session 10 handoff — /methodology + /resources pages, methodology cross-links, v5 roadmap

**Session date:** 2026-04-26
**Local HEAD on `/tmp/repo-push`:** `5f9b380` (committed; PUSH BLOCKED — see "Open blockers" below)
**Origin/main HEAD:** still `ad8f31a` until push happens
**Branch state on OneDrive:** all 7 files in commit `5f9b380` are byte-identical between OneDrive and `/tmp/repo-push`
**Vercel deployment:** auto-deploys on push to `main`; deploy of `5f9b380` will trigger when push completes

---

## TL;DR

Shipped the long-promised `/methodology` page (3 signals + 5 recruit plays + transparency blocks) and a `/resources` hub index that scaffolds future content. Wired Methodology + Resources into the marketing nav and authed sidebar (new "Insights" group). Added a methodology callout on the homepage and a "Read the full methodology" link on `/verticals`. Drafted a 308-line roadmap (`docs/roadmaps/V5_DATA_INTEGRATION.md`) that the next session can pick up cold to wire the v5 scoring signals into Supabase + the directory UI.

The commit is local at `5f9b380` but blocked on push (sandbox has no GitHub credentials this session).

---

## OPEN BLOCKERS — read this first

### 1. Push is blocked — Master O action required

The sandbox `/tmp/repo-push` was wiped between sessions and re-cloned via HTTPS without credentials. Two paths to ship:

**Option A (fastest, if Master O is at his terminal):** From a local clone with push access, `git pull origin main`, copy the 7 changed files from the OneDrive workspace into the local clone, `git add . && git commit && git push`. The 7 files in commit `5f9b380` are byte-identical between OneDrive and `/tmp/repo-push`, so any `cp` or rsync from OneDrive into a working local clone will work.

**Option B:** Paste a GitHub Personal Access Token (fine-grained PAT, `Contents: write` scope on `gtminsightlab-cmd/saas-agency-database`) into the next conversation. The next session can then `git push` from `/tmp/repo-push` directly, since the local commit is already prepared.

The 7 files:
- `app/methodology/page.tsx` (NEW, 868 lines)
- `app/resources/page.tsx` (NEW, 262 lines)
- `app/verticals/page.tsx` (modified, +9 lines)
- `app/page.tsx` (modified, +28 lines)
- `components/marketing/nav.tsx` (modified, replaces "How it works" anchor with /methodology + /resources links)
- `components/app/sidebar.tsx` (modified, adds "Insights" group with Methodology + Resources)
- `docs/roadmaps/V5_DATA_INTEGRATION.md` (NEW, 308 lines)

---

## WHAT SHIPPED THIS SESSION (chronological)

| # | What | Files |
|---|------|-------|
| 1 | Read uploaded files: methodology landing-page draft (1,800 words), Zywave methodology handoff brief, v5 workbook (19,378-row Master Ranking) | — |
| 2 | Asked clarifying questions; answers: dedicated /methodology page + /resources hub scaffold, copy-only this session, single longread now with hub for future | — |
| 3 | Surveyed /verticals + nav + sidebar patterns to match existing visual language (rounded-2xl cards, navy gradient CTAs, brand/navy chip eyebrows) | — |
| 4 | Banned-words pass on the docx draft against CMO list (unleash, supercharge, revolutionary, AI-powered, etc.) — zero hits, draft was already CMO-compliant | — |
| 5 | Built `/methodology` page: hero + TL;DR signal chips + three signals (with Specialization Tier + Diversity Class tables) + five recruit plays + transparency blocks + where-to-start steps + navy-gradient CTA | `app/methodology/page.tsx` |
| 6 | Scaffolded `/resources` hub: hero + 3 article cards (1 published, 2 "coming soon") + "why targeted data" argument + CTA strip | `app/resources/page.tsx` |
| 7 | Marketing nav: dropped "How it works" anchor, added /methodology + /resources links | `components/marketing/nav.tsx` |
| 8 | Authed sidebar: new "Insights" group with Methodology (Compass icon) + Resources (BookOpen icon) | `components/app/sidebar.tsx` |
| 9 | Cross-link from /verticals "How we know" section → /methodology | `app/verticals/page.tsx` |
| 10 | Methodology callout card on homepage after the 3-column proof grid | `app/page.tsx` |
| 11 | Wrote `docs/roadmaps/V5_DATA_INTEGRATION.md` — 308 lines, full plan for the next session to wire v5 signals into Supabase + filter chips | `docs/roadmaps/V5_DATA_INTEGRATION.md` |
| 12 | Committed locally as `5f9b380`. Push blocked. | — |

---

## WHAT'S ON `/methodology`

Section structure:

1. **Hero** — eyebrow "Methodology" + h1 "How to identify target agencies by vertical" + lead paragraph. Two CTAs: "Read the framework" (anchor) + "See it applied to 12 verticals" (/verticals).
2. **TL;DR strip** — 3 signal chips + 1 connecting paragraph.
3. **Three signals** — narrative h2 + 3 numbered cards:
   - Signal 1: Volume — table stakes
   - Signal 2: Specialization Tier — with the 4-row tier table (Specialist 5+, Growing 3-4, Exposure 2, — 0-1)
   - Signal 3: Carrier Diversity — with the 4-row diversity-class table + "Patterns the directory reveals" gold callout (MAG Mutual / RSG Specialty / Trident validation cases)
4. **Five recruit plays** — 6 cards in 2-column grid (5 numbered plays + a 6th "Roll your own" card). Each card has a monospace filter expression, Returns/Use-when copy.
5. **Transparency blocks** — 3 cards: "Why we don't rank by premium" / "Why Acadia and Continental Western are both Berkley" / "Refresh cadence and methodology"
6. **Where to start** — 3 step cards with deep-link CTAs (auth-aware: "Build your list" if entitled, "Sign up free" if anon)
7. **Final CTA** — navy gradient "Stop ranking by name. Start ranking by appointment behavior." Auth-aware buttons matching the /verticals pattern.

Authed users see it inside the AppShell sidebar. Anon users see it with the marketing nav. Same pattern as `/verticals`.

---

## WHAT'S ON `/resources`

Index page with 3 article cards:
- **Methodology** (Published) → `/methodology`
- **Seven16 vs. ZoomInfo, AM Best, and building it in-house** (Coming soon, no link)
- **Glossary — Specialization Tier, Diversity Index, Composite Score** (Coming soon, no link)

Plus a "Why targeted data beats wide data" 2-paragraph argument section and a final CTA strip pointing to /verticals + /methodology.

The architecture is set up to scale: `ARTICLES` is an array; add new entries with `status: "published"` and an `href`, and the cards render automatically. Categories tagged: Methodology / Recruit play / Comparison / Glossary, each with its own color token.

---

## NAV WIRING SUMMARY

### Marketing nav (anon + authed-on-marketing-pages)
Order: Verticals → Methodology (`hidden md:block`) → Resources (`hidden lg:block`) → Pricing (#anchor) → Sign in / Sign up. The `#how-it-works` anchor is removed from the nav (the homepage section still has the id, but the nav now points to the long-form `/methodology` page instead).

### Authed sidebar
New "Insights" group between Data/Stats/AI Support and Account. Two items: Methodology (Compass icon) + Resources (BookOpen icon). Path-active styling matches existing nav items.

### Cross-links from existing pages
- `/verticals` "How we know what we say we know" section: "Read the full methodology →" link added
- Homepage: methodology callout card (rounded-2xl, brand-50 bg) inserted after the 3-column Proof grid

---

## V5 DATA-INTEGRATION ROADMAP (`docs/roadmaps/V5_DATA_INTEGRATION.md`)

The 308-line doc is the next session's playbook. Headlines:

**When to do this:** anytime — not blocked on customer evidence, Stripe, or AdList loads. Highest leverage is "convert site copy into product" — the methodology page asks readers to "filter to Specialist + Diversified" but `/build-list` doesn't expose those filters yet.

**Migration shape:** Migration `0056_v5_signals.sql` adds:
- 9 columns to `agencies` (size_tier, diversity_index, diversity_class, effective_carriers, top_carrier_parent, top_carrier_share, total_policies_v5, states_active, verticals_active, v5_loaded_at)
- New `agency_vertical_scores` table (one row per Agency × Vertical × State, ~19,378 rows from v5) with the four cell-level signals + composite score + grade + supporting metrics
- RLS: same `to authenticated` permissive read as `agencies`; no per-tenant gating since v5 signals are non-sensitive directory metadata

**Critical join-key issue:** v5 uses normalized agency name strings; `agencies` uses Supabase UUIDs. Need migration `0057_agencies_name_normalized.sql` first to add a deterministic join column. **Do a name-match dry-run before committing to Option A** — if match rate is < 90%, the loader needs more sophisticated matching.

**UI changes (in priority order):**
1. **Filter chips on `/build-list`** (highest leverage) — three multi-select facets above the column filters: Recruit Priority, Specialization Tier, Diversity Class. Each chip combination = a recruit play from the methodology page.
2. **Pill components** for agency-card display: SpecializationPill (4 colors), DiversityPill (4 colors).
3. **Composite Score column** on `/build-list/review` and `/quick-search`. Sortable.
4. **Default sort change**: from policy_count to composite_score on `/build-list/review` — single most impactful change for users who skip the methodology page.
5. **Top 25 view** on `/verticals/<slug>` — pre-rolled view of agency_vertical_scores filtered to that vertical, sorted by composite_score.

**Tier gating:** Free plan sees badges, can't filter. Growth Member can filter, sort, and export with v5 columns.

**Effort estimate:** ~3.5 hours focused work, can fit one session if no name-match surprises.

**File manifest** for the next session: 10 files (2 new migrations, 1 loader script, 2 new components, 5 modified pages).

The full doc has the SQL DDL, loader script skeleton, RLS notes, refresh cadence design, and 4 open questions to resolve before starting.

---

## STRATEGIC DECISIONS THIS SESSION

These decisions were made and validated. Treat as fixed unless explicitly raised again.

### Methodology copy is canonical
The `/methodology` page is now the canonical long-form explanation of how Seven16 scores agencies. Future copy work that touches scoring methodology should:
- Reuse the three-signal vocabulary (Volume / Specialization Tier / Carrier Diversity)
- Reuse the five named recruit plays
- Use the same tier names (Specialist / Growing / Exposure) and diversity classes (Diversified / Balanced / Concentrated / Single-Carrier) — these are now in the UI, in CHECK constraints (when migration 0056 ships), and in the methodology page

### Resources is a hub, not a blog
`/resources` is set up as an index of long-form pieces, not a date-sequenced blog. Don't add a "Latest articles" feed or pagination yet. Add new pieces by extending the `ARTICLES` array. When the array crosses 6 articles, revisit whether categories deserve their own filter UI.

### CMO banned-words list still applies
The full list is in `docs/cmo-review/CMO_COPY_REVIEW_2026-04-25.md` Section 7. This session's draft passed clean, but future copy work must continue to scrub.

### V5 data integration is its own discrete piece of work
Don't wire v5 signals piecemeal. The roadmap doc is the unit. When Master O picks it up, do all 5 UI changes together — partial integration (e.g., add filter chips but no composite score sort) creates an inconsistent UX.

---

## OPEN BACKLOG (priority order)

1. **Push commit `5f9b380`** — see Open Blockers above. Once pushed, Vercel auto-deploys.
2. **V5 data integration** — see `docs/roadmaps/V5_DATA_INTEGRATION.md`. ~3.5 hours focused work.
3. **Phase 3 of CMO rewrite** — paused on customer evidence (2-3 paying customers). Trust section + testimonials + post-signup welcome.
4. **Three A/B tests** — paused on traffic (~500+ visitors/week). Hero headline, CTA copy, pricing frame variants.
5. **Eight empty verticals** — Public Entity, Real Estate, Hospitality, Manufacturing, Tech/Cyber, Energy, Retail, Professional Services. Trigger: AdList xlsx loads tagged to those carriers.
6. **Stripe sandbox → production** — env vars in Vercel + sandbox-to-live cutover.
7. **Cloudflare DNS** — manual; surface a step-by-step list to Master O when needed.
8. **Comparison piece for /resources** — "Seven16 vs ZoomInfo / AM Best / building it in-house" — already drafted in long form on /verticals; could be extracted into a standalone /resources article.
9. **Glossary piece for /resources** — definitions for every scoring term (Specialization Tier, Diversity Index, Composite Score, Local Market Share, Vertical Strength Index).

---

## LESSONS / FEEDBACK

### OneDrive truncation hit again — three files this session
The Edit tool truncated `components/marketing/nav.tsx`, `components/app/sidebar.tsx`, AND `app/page.tsx` mid-edit during this session. Recovery pattern that worked:
1. Detect truncation by tailing the file via bash and checking line count
2. Roll back from the clean copy in `/tmp/repo-push`
3. Build full file content in `/tmp` via heredoc OR apply edit via Python `str.replace`
4. Atomic-cp to OneDrive AND `/tmp/repo-push`
5. md5sum-verify across all three locations
6. Verify file tail via bash `tail -10` (NOT the Read tool — Read can also truncate)

This is consistent with `feedback_onedrive_atomic_writes.md`. **The Edit tool is unsafe on files >5KB in this OneDrive folder.** Use it only on tiny files; for everything else, use Python or heredoc + cp.

### Sandbox doesn't retain GitHub credentials between sessions
Prior handoffs noted "/tmp/repo-push has push access" — that was true within a session, not across sessions. New sessions need either a re-pasted token or Master O pushes from his own clone. **Update reference memory** so future sessions don't waste time discovering this.

### Banned-words pass is fast
Took ~30 seconds via Python regex. Worth running on every piece of marketing copy before shipping. The CMO doc's banned-words list is the authority.

---

## STATE OF DEPLOYED PAGES (post-`5f9b380`, when pushed)

| URL | What's there | Last touched |
|-----|--------------|--------------|
| `/` | Phase 1 hero + Why this exists + **NEW methodology callout card** + Why companies switch + verticals carousel + 3-column pricing + final CTA | `5f9b380` |
| `/verticals` | Hero + 12 vertical cards + Tier-A callout + Edge four-pillar + parent-child tree + comparison + **+ "Read the full methodology →" link** + final CTA | `5f9b380` |
| `/methodology` | NEW — 7-section longread on the three signals + five recruit plays | `5f9b380` |
| `/resources` | NEW — hub index with 1 published article + 2 coming-soon cards + targeted-data argument | `5f9b380` |
| `/team` | Seat KPIs + invite form + members table | `179869d` |
| `/sign-up` | Three intent paths | `f0253ff` |
| `/admin/customers` | Per-tenant drill-down | `1f975c9` |
| `/ai-support` | NL parser + 6-card KPIs | `afb33aa` |

---

## OPENING MOVE FOR THE NEXT SESSION

1. Read this file first.
2. Read `MEMORY.md` for the index.
3. Confirm push status — has `5f9b380` made it to origin/main?
   - If yes: confirm Vercel deploy succeeded, view live `/methodology` and `/resources`
   - If no: ask Master O for a token (Option B) or confirm he'll push from his clone (Option A)
4. Check `docs/roadmaps/V5_DATA_INTEGRATION.md` if Master O wants to start the v5 data integration.
5. Otherwise ask what's next.

End of handoff.
