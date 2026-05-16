# Seven16 Family — Working Agreement

The 7 standing rules + daily session protocol for any Claude Code session in this repo. Identical across `dotintel2`, `saas-agency-database`, and `seven16-distribution` — temporary divergence noted in §Rule-5 below pending cross-repo cascade (one repo per session per Rule 2).

Locked: 2026-05-15. Rule 5 amended SESSION_24 (2026-05-15) to add FAMILY_HEALTH.md update per [`ANTI_DECAY_PROTOCOL.md`](context/ANTI_DECAY_PROTOCOL.md) Mechanism #1.

---

## The 7 rules

**Rule 1 — Latest handoff doc is the single source of truth.**
Every session ends with `SESSION_<N>_HANDOFF.md`. The highest-numbered one is current state. If confused about where things stand, read that file. Ignore everything else.

**Rule 2 — One session per repo at a time.**
Two Claude Code sessions in the same working tree will collide. Run sessions sequentially per repo. Exception: a git worktree (different folder, different branch) is the safe parallel pattern when truly needed.

**Rule 3 — One arc per session.**
Don't mix "CSA ingest" + "directory work" + "training UI" in one session. Pick the ONE arc you're advancing. When you finish — or realize you need to switch — end the session, write the handoff, start a new one.

**Rule 4 — Decisions have IDs and don't get re-debated.**
D-001, D-012, D-017a, etc. Once a decision has an ID in `DECISION_LOG.md` or in a session handoff, it's locked. Future sessions cite the ID and move on. To genuinely revisit, create a new decision (D-018, etc.) that explicitly supersedes the old one.

**Rule 5 — Every session ends with: family-health update (if material) + handoff + push + queue.**
Four things, in order, before closing a session:
1. If the session materially changed repo state, active arc, queue, or any cross-product dependency, update [`docs/context/FAMILY_HEALTH.md`](context/FAMILY_HEALTH.md) (per [`ANTI_DECAY_PROTOCOL.md`](context/ANTI_DECAY_PROTOCOL.md) Mechanism #1). "Material" = anything that changes a row in the per-repo table, a status in the dependency map, or any Items Requiring Attention entry. Cosmetic-only sessions (typo fixes, etc.) may skip.
2. Write the next-numbered `SESSION_<N>_HANDOFF.md`
3. `git push origin main`
4. Write `SESSION_<N+1>_PROMPT.md` with what's queued

Missing any of these = next session starts confused.

*Cross-repo cascade status:* This step-1 sub-rule is currently in saas-agency-database only — `dotintel2` and `seven16-distribution` cascade the amendment in their next sessions (Rule 2 — one repo per session for cross-repo rule changes). Until cascaded, dotintel2 + seven16-distribution sessions are NOT required to update FAMILY_HEALTH.md themselves; saas-agency-database family-hub sessions handle the snapshot refresh on their behalf during the bridging window.

**Rule 6 — Backlog is read first, written last.**
Every session opens with `docs/BACKLOG.md` and closes with `docs/BACKLOG.md`. The handoff is for tactical "what just happened" detail; the backlog is for strategic "what's still on the list" continuity. The backlog is the anti-decay layer.

**Rule 7 — Nothing leaves the backlog except via "done."**
If an item is no longer worth doing, move it to the `## Killed` section with a one-line reason and date. Don't delete. Audit trail prevents "wait, weren't we going to do that?" loops.

---

## Daily session protocol

| Step | What |
|---|---|
| **Open** | Read `docs/BACKLOG.md` first, then the latest `SESSION_<N>_HANDOFF.md`. |
| **Plan** | Propose a 5–10 bullet plan. Wait for thumbs-up from Master O before touching files. |
| **Execute** | One arc only (Rule 3). Don't touch items outside the agreed plan. |
| **Close** | Update `docs/BACKLOG.md` (mark done, promote next queued to Active) → if material, refresh `docs/context/FAMILY_HEALTH.md` → write the new `SESSION_<N>_HANDOFF.md` → `git push origin main` → write `SESSION_<N+1>_PROMPT.md`. |

Each BACKLOG entry should have enough context to act **cold** — file paths, the why, the immediate next step. Imagine reading it three months later, on a different machine, with no memory.

---

## Appendix — BACKLOG.md section template

```
# <Product> — Backlog

Last reviewed: YYYY-MM-DD (session N)

## Active arc
[in-progress] <one item — what the current session is advancing>

## Queued (priority order — pick the top one when active arc closes)
1. <item with enough context to pick up cold: what, why, file paths, next step>
2. <…>

## Deferred (parked, will surface on a trigger)
- <item> — trigger: <what brings it back to Queued>

## Killed (with reason + date)
- [YYYY-MM-DD] <item> — <one-line reason>

## Done (audit trail, newest first)
- [YYYY-MM-DD] <item> (session N)
```
