-- Migration 0058: fix dangling trailing connective after suffix strip
-- Bug example: "Seville & Co LLC" → upper → "SEVILLE & CO LLC"
--   → "SEVILLE AND CO LLC" → strip LLC → "SEVILLE AND CO" → strip CO →
--   "SEVILLE AND". The trailing "AND" is meaningless after the suffix loop.
-- Fix: after corporate-suffix stripping, run a second loop that strips
-- trailing connective tokens (AND, OF, THE) until stable.
-- Also: replace "&" with " AND " (with both-sides spacing) to ensure no
-- adjacent word eats the conjunction.

CREATE OR REPLACE FUNCTION public.normalize_agency_name(p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  v_out text;
  v_prev text;
BEGIN
  IF p_name IS NULL THEN
    RETURN NULL;
  END IF;
  v_out := upper(p_name);
  v_out := replace(v_out, '&', ' AND ');
  v_out := regexp_replace(v_out, '[^A-Z0-9 ]', '', 'g');
  v_out := regexp_replace(v_out, '\s+', ' ', 'g');
  v_out := btrim(v_out);
  v_out := regexp_replace(v_out, '^THE\s+', '', '');
  -- corporate-suffix loop
  LOOP
    v_prev := v_out;
    v_out := regexp_replace(
      v_out,
      '\s+(INC|LLC|LLP|CORP|CORPORATION|COMPANY|CO|PC|PA|LP|LIMITED|LTD)$',
      '',
      ''
    );
    EXIT WHEN v_out = v_prev;
  END LOOP;
  -- trailing-connective loop (catches dangling AND/OF/THE after CO/INC strip)
  LOOP
    v_prev := v_out;
    v_out := regexp_replace(v_out, '\s+(AND|OF|THE)$', '', '');
    EXIT WHEN v_out = v_prev;
  END LOOP;
  RETURN btrim(v_out);
END;
$$;

-- Force regeneration of name_normalized for all existing rows by dropping
-- and re-adding the generated column. Index is rebuilt automatically.
ALTER TABLE public.agencies
  DROP COLUMN IF EXISTS name_normalized;

ALTER TABLE public.agencies
  ADD COLUMN name_normalized text
    GENERATED ALWAYS AS (public.normalize_agency_name(name)) STORED;

CREATE INDEX IF NOT EXISTS agencies_name_normalized_idx
  ON public.agencies(name_normalized);

COMMENT ON COLUMN public.agencies.name_normalized IS
  'Auto-derived canonical name for cross-source joins. Generated from public.normalize_agency_name(name). See migration 0057/0058.';
