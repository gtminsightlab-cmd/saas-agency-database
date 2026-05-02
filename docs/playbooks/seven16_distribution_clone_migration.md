# Playbook: Migrate `seven16-distribution` working clone outside OneDrive

**For:** the Claude Code session running in `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\CRM for MGU and Recruiting\seven16-distribution\`.

**Why:** OneDrive sync corrupts `.git` internals over time (the Agency Signal repo's `.git` was permanently broken this way). The fix is to do all git work from a clone OUTSIDE OneDrive sync. This playbook does that, plus stands up the GitHub remote that doesn't exist yet.

**When:** at a moment when nothing is mid-edit in the OneDrive folder. Don't run during an active build.

**Time:** ~10 minutes total. ~3 minutes of clicks for Master O.

---

## Pre-flight check

The other Claude session should run these in bash to confirm starting state:

```bash
ls -la "/c/Users/GTMin/OneDrive/Documents/Claude/Projects/CRM for MGU and Recruiting/seven16-distribution/.git/" | head -5
cd "/c/Users/GTMin/OneDrive/Documents/Claude/Projects/CRM for MGU and Recruiting/seven16-distribution" && git status && git log --oneline -5
```

Expected: `.git` directory has actual data (HEAD, index, refs, hooks). `git status` works. `git log` shows commits. If any of those fail — stop and diagnose; do not proceed.

---

## Step 1 — Master O creates the GitHub repo

The `seven16-distribution` project has no GitHub remote yet. Master O creates it:

1. Open https://github.com/new
2. Owner: `gtminsightlab-cmd`
3. Repository name: `seven16-distribution` (matches the package.json `name`)
4. Visibility: **Private** (Threshold IQ build is pre-launch; don't publish source)
5. **DO NOT** initialize with README/`.gitignore`/license — the local repo already has those.
6. Click **Create repository**
7. Tell the Claude session "repo created" — no need to copy any URL.

---

## Step 2 — Claude session sets up the new clone

```bash
# Make sure the parent dir exists
mkdir -p /c/Users/GTMin/Projects

# Copy the working tree (NOT git clone — we want to preserve the local commits and any uncommitted work)
cp -r "/c/Users/GTMin/OneDrive/Documents/Claude/Projects/CRM for MGU and Recruiting/seven16-distribution" /c/Users/GTMin/Projects/seven16-distribution

# Verify the copy
cd /c/Users/GTMin/Projects/seven16-distribution
git status
git log --oneline -5

# Add the GitHub remote
git remote add origin https://github.com/gtminsightlab-cmd/seven16-distribution.git

# First push will trigger Git Credential Manager browser auth (one-time per machine).
# After this, GCM caches the creds and no token is needed for future pushes.
git push -u origin main 2>&1
```

If a browser window opens during the push, complete the GitHub OAuth dialog. The push will continue automatically. Total time: under 30 seconds after auth completes.

---

## Step 3 — Verify the new clone is canonical

```bash
cd /c/Users/GTMin/Projects/seven16-distribution
git remote -v        # origin → https://github.com/gtminsightlab-cmd/seven16-distribution.git
git status           # should match what was in the OneDrive copy
git log --oneline -5 # same commits
ls -la .git/         # functional .git with refs, objects, etc.
```

---

## Step 4 — Add `CLAUDE.md` to point future sessions at the canonical clone

In the new clone (`C:\Users\GTMin\Projects\seven16-distribution\`), add a `CLAUDE.md` at the repo root if one doesn't exist. Suggested minimal content:

```markdown
# Threshold IQ — Seven16 Family operating CRM

Working repo name: `seven16-distribution`. Market name: **Threshold IQ** (`thresholdiq.io`). Domain secured 2026-05-02.

## Read first

- This repo's existing `CLAUDE_CODE_BRIEF.md` (build brief)
- This repo's existing `AGENTS.md` (Next 16 specifics — heads up: NOT the Next.js you know from training data)
- The Seven16 family master plan in the Agency Signal repo: `gtminsightlab-cmd/saas-agency-database` → `docs/context/MASTER_CONTEXT.md` (and `DECISION_LOG.md` D-009 for Threshold IQ scope, D-008 for Supabase topology, D-011 for target market)

## Working clone is here

`C:\Users\GTMin\Projects\seven16-distribution\` — NOT the OneDrive folder. The OneDrive copy is deprecated for code edits.

## Stack
Next 16 + React 19 + shadcn/ui + Supabase SSR. Multi-tenant from day one, RLS enabled.

## Family integration (pending future session)
This product is part of the Seven16 family per D-009. Future work: register tenants/auth/entitlements via the `seven16-platform` Supabase project (`soqqmkfasufusoxxoqzx`) using the shared JWT pattern from D-008. Current session has its own pricing model; family-strategy pricing collaboration is deferred.
```

Commit and push:

```bash
git add CLAUDE.md
git commit -m "chore: add CLAUDE.md pointing to canonical clone + Seven16 family docs"
git push origin main
```

---

## Step 5 — Deprecate the OneDrive copy

Don't delete it — keep it as a read-only archive. But add a `DEPRECATED.md` in the OneDrive folder to prevent confusion:

```bash
cat > "/c/Users/GTMin/OneDrive/Documents/Claude/Projects/CRM for MGU and Recruiting/seven16-distribution/DEPRECATED.md" <<'EOF'
# DEPRECATED — do not edit code here

The canonical working clone is now `C:\Users\GTMin\Projects\seven16-distribution\`. OneDrive sync corrupts `.git` over time (it killed the Agency Signal repo's `.git` permanently). All Claude Code sessions should `cd` into the canonical clone, NOT this folder.

This folder is kept as a read-only reference for any non-code artifacts (vendor data, brief docs, prototype JSX).
EOF
```

Save this DEPRECATED.md only in the OneDrive copy — it's intentionally NOT in the canonical clone.

---

## Done

The other Claude session can now:
- Run `git` operations natively from `C:\Users\GTMin\Projects\seven16-distribution\`
- Push without per-session PATs (GCM cached creds work)
- Edit files without OneDrive sync truncating large writes
- Trust that `.git` won't corrupt

Future Claude Code sessions in this repo auto-load `CLAUDE.md` which points at both the canonical clone AND the Seven16 family master plan. Cross-product coordination is one read away.
