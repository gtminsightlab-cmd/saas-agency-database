-- Migration 0057: add name_normalized join key on agencies
-- Purpose: enable matching v5 Zywave workbook agency names (ALL CAPS, "AND",
-- suffixes/branch codes mixed) to existing agencies rows. Creates an immutable
-- normalization function and stores the result as a GENERATED column for
-- index-friendly equality joins.
--
-- Normalization rules (applied in order):
--   1. UPPER
--   2. Replace "&" with " AND "
--   3. Strip every character not in [A-Z 0-9 space]
--   4. Collapse runs of whitespace to single space
--   5. Strip leading "THE "
--   6. Strip terminal corporate suffix (INC|LLC|LLP|CORP|CORPORATION|
--      COMPANY|CO|PC|PA|LP|LIMITED|LTD), repeatable so "ABC INC LLC" → "ABC"
--   7. Trim
--
-- Result: "Brown & Brown" → "BROWN AND BROWN"; "The Sammons Insurance Inc"
-- → "SAMMONS INSURANCE"; "MARSH AND MCLENNAN AGENCY" → "MARSH AND MCLENNAN
-- AGENCY". This collapses the mixed-case + ampersand + suffix variation
-- between Supabase and v5 to a single canonical form.

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
  -- repeated suffix stripping (so "ABC INC LLC" collapses fully)
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
  RETURN btrim(v_out);
END;
$$;

COMMENT ON FUNCTION public.normalize_agency_name IS
  'Canonical form for matching agency names across data sources (v5 Zywave, Supabase agencies). See migration 0057 header for rules.';

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS name_normalized text
    GENERATED ALWAYS AS (public.normalize_agency_name(name)) STORED;

CREATE INDEX IF NOT EXISTS agencies_name_normalized_idx
  ON public.agencies(name_normalized);

COMMENT ON COLUMN public.agencies.name_normalized IS
  'Auto-derived canonical name for cross-source joins. Generated from public.normalize_agency_name(name).';
