-- 0048's find_duplicate_carriers normalized on group_name, which collapsed
-- Berkshire's 13 legitimate subsidiaries into one false-positive cluster.
-- Real dup pattern shows up at carrier *name* level (apostrophe/hyphen/curly-
-- punctuation drift, not parent-group). Repoint to name + add per-id appts.
DROP FUNCTION IF EXISTS public.find_duplicate_carriers(int);

CREATE OR REPLACE FUNCTION public.find_duplicate_carriers(p_limit int DEFAULT 50)
RETURNS TABLE (
  cluster_key  text,
  sample_name  text,
  group_name   text,
  dup_count    bigint,
  active_count bigint,
  total_appointments bigint,
  carrier_ids  uuid[],
  per_id_appts jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  WITH normalized AS (
    SELECT id, name, group_name, active,
           regexp_replace(lower(coalesce(name, '')), '[^a-z0-9]+', '', 'g') AS k
    FROM public.carriers
  ),
  appts AS (SELECT carrier_id, COUNT(*) AS cnt FROM public.agency_carriers GROUP BY carrier_id),
  joined AS (
    SELECT n.id, n.name, n.group_name, n.active, n.k, COALESCE(a.cnt, 0) AS appt_cnt
    FROM normalized n LEFT JOIN appts a ON a.carrier_id = n.id
  ),
  groups AS (
    SELECT k, COUNT(*) AS cnt, COUNT(*) FILTER (WHERE active) AS active_cnt,
           SUM(appt_cnt) AS total_appt,
           array_agg(id ORDER BY appt_cnt DESC, id) AS ids,
           jsonb_agg(jsonb_build_object('id', id, 'name', name, 'appts', appt_cnt) ORDER BY appt_cnt DESC) AS per_id,
           min(name) AS sample, min(group_name) AS gn
    FROM joined GROUP BY k HAVING COUNT(*) > 1
  )
  SELECT k, sample, gn, cnt, active_cnt, total_appt, ids, per_id
  FROM groups ORDER BY total_appt DESC, cnt DESC, sample
  LIMIT GREATEST(1, LEAST(p_limit, 500));
$$;

REVOKE ALL ON FUNCTION public.find_duplicate_carriers(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_duplicate_carriers(int) TO authenticated;

NOTIFY pgrst;
