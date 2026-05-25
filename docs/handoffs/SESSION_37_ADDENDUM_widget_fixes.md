# SESSION_37 Addendum — PR #8 widget bug fix arc (2026-05-25)

**Date:** 2026-05-25 (continuation after main SESSION_37 close-out commit `29bdfd2`)
**Branch:** `feat/design-system-v1` (PR #8)
**Predecessor:** [`SESSION_37_HANDOFF.md`](SESSION_37_HANDOFF.md)
**Commits added this addendum:** `11f3ce4` (defensive v1) + `8f8c977` (real root-cause fix v2)
**Outcome:** Support widget Stage 2 behaves correctly on PR #8 preview. PR #8 ready to merge.

---

## Why this is an addendum, not its own session

Main SESSION_37 close-out (BACKLOG #3 verify + Path R + Path F + cleanup re-rotation) was committed as `29bdfd2`. After close-out, Master O reviewed the PR #8 preview and surfaced a widget UX bug. Fix arc was scoped (single component, ~30 min total wall) — handled inline rather than spawning SESSION_37.5 / SESSION_38. Captured here so the PR #8 review-and-merge audit trail is complete.

---

## The bug Master O reproduced

On every page of the PR #8 preview, the Seven16 Group Support widget was:

1. Auto-opening its big panel on first page load (should default closed — only the small "Chat with us" pill should be visible)
2. Showing a persistent "Loading…" placeholder inside the open panel (the iframe never mounted, because `hasBeenOpened` stayed false)
3. Rendering the "Chat with us" pill alongside the open panel (the SESSION_36 code intent was to hide the pill when panel is open)

Master O's stated UX preference: "the smaller 'chat with us' should be the only thing on landing."

---

## v1 defensive fix (commit `11f3ce4`) — did not solve the bug

Hypothesis: state persistence across App Router navigation OR hydration mismatch causing `open` to drift true.

Changes:
- `useEffect(() => { setOpen(false); }, [])` — force closed state on every mount
- `useEffect` to sync `hasBeenOpened` with `open` (if `open` becomes true without `hasBeenOpened`, promote `hasBeenOpened` → iframe mounts)
- Removed the `{!open ? <button> : null}` conditional render of the pill — always rendered (label flips to "Close chat" when `open=true`)

Master O verified on the rebuilt preview: pill was now always visible (good), but panel STILL auto-opened with stuck Loading state (bad). My defensive fix wasn't reaching the root cause.

---

## v2 real root-cause fix (commit `8f8c977`) — solved it

After v1 failed, dug into the panel's DOM declaration:

```tsx
<div
  hidden={!open}
  className="fixed bottom-24 right-6 z-50 flex h-[600px] ..."
>
```

**Root cause:** The HTML `hidden` attribute maps to **user-agent CSS** `[hidden] { display: none }`. Tailwind's `.flex` class generates `.flex { display: flex }` in the **author stylesheet**. Author stylesheet beats user-agent stylesheet at equal specificity, so `display: flex` won every time and the panel was always visible regardless of the `hidden` attribute. The `open` state had no observable effect on panel display.

This explained why my v1 defensive `setOpen(false)` had no visible effect: `open` WAS false, but the panel's CSS was ignoring it.

**Fix:** Drop the `hidden` attribute. Move display control into the className via `${open ? "flex" : "hidden"}` (Tailwind's `hidden` class = `display: none`, lives in the same author stylesheet as `.flex`, so the conditional places exactly one display rule on the element at any time). `aria-hidden={!open}` preserves the a11y semantics that the `hidden` attribute provided.

Iframe stays mounted across opens (chat history preserved within session) because the panel stays in the DOM — only its display rule toggles.

---

## Verification (Vercel preview `dpl_6NjT5Ucc5S2TvJQFDuZiw5HPeD1q`)

Master O reviewed `/`, `/charter`, `/verticals` on the rebuilt preview after `8f8c977`. All three:

- ✅ Only the small "Chat with us" pill visible at bottom-right on page load
- ✅ NO auto-open panel
- ✅ NO "Loading…" placeholder
- ✅ Hero design harmonized across pages (consistent `#050B1E` ink + cyan accents)

Clicking the pill opens the panel with the iframe rendering the Pre-Sales Agent intro. Pill label flips to "Close chat". Closing returns to pill-only state.

---

## Standing-rule callouts

- **Audit-first held:** v1 attempt followed a defensible hypothesis but didn't ship. The honest "v1 didn't solve it — here's the real cause" pivot is the right pattern. Burying a partial fix would have left the bug under a misleading-clean commit message.
- **Plugins-first held:** Used Vercel MCP (`list_deployments` / `get_deployment` / `get_access_to_vercel_url`) to track each rebuild + generate bypass URLs without dragging Master O through the deployment dashboard.
- **No SLOP in copy:** Pill label "Close chat" is precise. Comment headers in the code document the exact failure mode + root cause in plain English.

---

## Deferred to v1.1 — BACKLOG item `0b` (rightRail product-mockup harmonization)

PR #8 ships consistent OUTER hero chrome but the INNER right-rail density still varies (homepage rich `AppointmentSearchMockup` vs other 6 pages flat `DataPanel`). Not a merge blocker — queued as BACKLOG `0b` for a focused 60-90 min Path A polish before charter outreach scales beyond hand-picked cohort.

---

## Pickup tasks for next session

### 🔴 Master O — merge PR #8

```bash
gh pr merge 8 --squash
```

Or GitHub UI green button. Vercel auto-deploys production within ~60s. After merge:
- Production picks up everything (design system v1 + widget fix v2 + compliance pages + theme-aware header)
- Domain cutover (SESSION_38 active arc) unblocks
- BACKLOG `0b` (design system v1.1) becomes the next polish arc

### 🟠 Active arc remains — Domain cutover

Unchanged from SESSION_36/37 carry-forward. Choreography in [`SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md) §Pickup tasks.

---

*This addendum closes the widget bug arc cleanly. Two commits, one root cause, full audit trail. PR #8 review-and-merge gate is now satisfied.*
