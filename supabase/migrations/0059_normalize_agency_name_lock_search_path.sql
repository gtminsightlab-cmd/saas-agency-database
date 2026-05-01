-- Fix advisor warning: function_search_path_mutable
-- Lock search_path to '' on the normalization function so the
-- regexp_replace / replace / btrim / upper calls always resolve to pg_catalog.
ALTER FUNCTION public.normalize_agency_name(text) SET search_path = '';

-- Re-create function body with fully-qualified pg_catalog references so it
-- still works with the empty search_path.
CREATE OR REPLACE FUNCTION public.normalize_agency_name(p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
DECLARE
  v_out text;
  v_prev text;
BEGIN
  IF p_name IS NULL THEN
    RETURN NULL;
  END IF;
  v_out := pg_catalog.upper(p_name);
  v_out := pg_catalog.replace(v_out, '&', ' AND ');
  v_out := pg_catalog.regexp_replace(v_out, '[^A-Z0-9 ]', '', 'g');
  v_out := pg_catalog.regexp_replace(v_out, '\s+', ' ', 'g');
  v_out := pg_catalog.btrim(v_out);
  v_out := pg_catalog.regexp_replace(v_out, '^THE\s+', '', '');
  LOOP
    v_prev := v_out;
    v_out := pg_catalog.regexp_replace(
      v_out,
      '\s+(INC|LLC|LLP|CORP|CORPORATION|COMPANY|CO|PC|PA|LP|LIMITED|LTD)$',
      '',
      ''
    );
    EXIT WHEN v_out = v_prev;
  END LOOP;
  LOOP
    v_prev := v_out;
    v_out := pg_catalog.regexp_replace(v_out, '\s+(AND|OF|THE)$', '', '');
    EXIT WHEN v_out = v_prev;
  END LOOP;
  RETURN pg_catalog.btrim(v_out);
END;
$$;
