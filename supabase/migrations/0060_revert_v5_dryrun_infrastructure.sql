-- Migration 0060: full revert of session-10 v5 dry-run infrastructure
-- Reason: dry-run on top-500 v5 agencies showed 32% exact-match rate (52%
-- policy-weighted), well below the 90% threshold the V5_DATA_INTEGRATION
-- roadmap demanded. Root cause: v5 is at PARENT-agency grain (one row per
-- agency identity), public.agencies is at BRANCH grain (one row per office
-- location). Exact-match by name will never close that grain gap. The right
-- next move is a different architecture (e.g., populate agencies.parent_agency_id
-- via clustering, then match v5 -> parent rollup). Until that strategy is
-- chosen, the name_normalized column + normalize_agency_name function add
-- complexity without value, so we strip them.
--
-- This migration leaves the database at the ad8f31a-equivalent baseline.

DROP TABLE IF EXISTS public._dryrun_v5_names;

ALTER TABLE public.agencies
  DROP COLUMN IF EXISTS name_normalized;

DROP FUNCTION IF EXISTS public.normalize_agency_name(text);
