-- 0048: SECURITY DEFINER RPCs that surface duplicate clusters across the
-- three reference dimensions where the issue actually shows up at scale —
-- agencies (multi-row branches stored as separate rows), carriers (subtle
-- name variants like apostrophe/hyphen drift), and affiliations (the IIABA
-- closing-paren case).
--
-- All three normalize via regexp_replace(lower(<col>), '[^a-z0-9]+', '') so
-- whitespace, parentheses, dashes, ampersands, and curly punctuation collapse.

CREATE OR REPLACE FUNCTION public.find_duplicate_agencies(p_limit int DEFAULT 50)
RETURNS TABLE (
  cluster_key text,
  sample_name text,
  state       text,
  city        text,
  dup_count   bigint,
  agency_ids  uuid[]
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  WITH normalized AS (
    SELECT id, name, state, city,
           regexp_replace(lower(coalesce(name, '')), '[^a-z0-9]+', '', 'g')
             || '|' || coalesce(upper(state), '')
             || '|' || regexp_replace(lower(coalesce(city, '')), '[^a-z0-9]+', '', 'g') AS k
    FROM public.agencies
  ),
  groups AS (
    SELECT k, COUNT(*) AS cnt, array_agg(id ORDER BY id) AS ids,
           min(name) AS sample, min(state) AS st, min(city) AS ct
    FROM normalized GROUP BY k HAVING COUNT(*) > 1
  )
  SELECT k, sample, st, ct, cnt, ids
  FROM groups ORDER BY cnt DESC, sample
  LIMIT GREATEST(1, LEAST(p_limit, 500));
$$;
REVOKE ALL ON FUNCTION public.find_duplicate_agencies(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_duplicate_agencies(int) TO authenticated;
COMMENT ON FUNCTION public.find_duplicate_agencies(int) IS
  'Surface duplicate agency clusters by normalized name+state+city.';

-- ============================================================================
CREATE OR REPLACE FUNCTION public.find_duplicate_carriers(p_limit int DEFAULT 50)
RETURNS TABLE (
  cluster_key  text,
  sample_name  text,
  group_name   text,
  dup_count    bigint,
  active_count bigint,
  carrier_ids  uuid[]
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  WITH normalized AS (
    SELECT id, name, group_name, active,
           regexp_replace(lower(coalesce(group_name, name, '')), '[^a-z0-9]+', '', 'g') AS k
    FROM public.carriers
  ),
  groups AS (
    SELECT k, COUNT(*) AS cnt, COUNT(*) FILTER (WHERE active) AS active_cnt,
           array_agg(id ORDER BY id) AS ids, min(name) AS sample, min(group_name) AS gn
    FROM normalized GROUP BY k HAVING COUNT(*) > 1
  )
  SELECT k, sample, gn, cnt, active_cnt, ids
  FROM groups ORDER BY cnt DESC, sample
  LIMIT GREATEST(1, LEAST(p_limit, 500));
$$;
REVOKE ALL ON FUNCTION public.find_duplicate_carriers(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_duplicate_carriers(int) TO authenticated;

-- ============================================================================
CREATE OR REPLACE FUNCTION public.find_duplicate_affiliations(p_limit int DEFAULT 50)
RETURNS TABLE (
  cluster_key       text,
  sample_name       text,
  affiliation_type  text,
  dup_count         bigint,
  active_count      bigint,
  total_appointments bigint,
  affiliation_ids   uuid[],
  per_id_appts      jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  WITH normalized AS (
    SELECT id, canonical_name, type, active,
           regexp_replace(lower(coalesce(canonical_name, '')), '[^a-z0-9]+', '', 'g') AS k
    FROM public.affiliations
  ),
  appts AS (SELECT affiliation_id, COUNT(*) AS cnt FROM public.agency_affiliations GROUP BY affiliation_id),
  joined AS (
    SELECT n.id, n.canonical_name, n.type, n.active, n.k, COALESCE(a.cnt, 0) AS appt_cnt
    FROM normalized n LEFT JOIN appts a ON a.affiliation_id = n.id
  ),
  groups AS (
    SELECT k, COUNT(*) AS cnt, COUNT(*) FILTER (WHERE active) AS active_cnt,
           SUM(appt_cnt) AS total_appt,
           array_agg(id ORDER BY appt_cnt DESC, id) AS ids,
           jsonb_agg(jsonb_build_object('id', id, 'name', canonical_name, 'appts', appt_cnt) ORDER BY appt_cnt DESC) AS per_id,
           min(canonical_name) AS sample, min(type) AS atype
    FROM joined GROUP BY k HAVING COUNT(*) > 1
  )
  SELECT k, sample, atype, cnt, active_cnt, total_appt, ids, per_id
  FROM groups ORDER BY cnt DESC, sample
  LIMIT GREATEST(1, LEAST(p_limit, 500));
$$;
REVOKE ALL ON FUNCTION public.find_duplicate_affiliations(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_duplicate_affiliations(int) TO authenticated;
COMMENT ON FUNCTION public.find_duplicate_affiliations(int) IS
  'Surface duplicate affiliation clusters by normalized canonical_name. Returns per-id appointment counts so admins can pick the merge target.';

NOTIFY pgrst;
