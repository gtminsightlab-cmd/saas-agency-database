-- 0047: pg_trgm + GIN index on agencies.name (powers fuzzy free-text matching
-- on the AI Support page) and get_my_recent_searches() RPC for the right-hand
-- recent-history panel without leaking other tenants' searches.

-- Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Trigram index on agency name (and parent_name for "owned by..." style queries)
CREATE INDEX IF NOT EXISTS agencies_name_trgm_idx
  ON public.agencies USING gin (name public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS agencies_parent_name_trgm_idx
  ON public.agencies USING gin (parent_name public.gin_trgm_ops);

-- Recent-searches RPC: caller-scoped, hides other users' rows even when the
-- caller is a regular tenant user. SECURITY DEFINER so we don't need to add
-- a per-user SELECT policy on usage_logs.
CREATE OR REPLACE FUNCTION public.get_my_recent_searches(p_limit int DEFAULT 20)
RETURNS TABLE (
  id          uuid,
  action_type text,
  query_text  text,
  filter_keys text[],
  parsed_summary jsonb,
  created_at  timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT
    u.id,
    u.action_type,
    (u.metadata ->> 'query_text')::text                AS query_text,
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(u.metadata -> 'filter_keys')),
      ARRAY[]::text[]
    )                                                  AS filter_keys,
    (u.metadata -> 'parsed_summary')                   AS parsed_summary,
    u.created_at
  FROM public.usage_logs u
  WHERE u.user_id = auth.uid()
    AND u.action_type IN ('search', 'ai_search')
  ORDER BY u.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100));
$$;

REVOKE ALL ON FUNCTION public.get_my_recent_searches(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_recent_searches(int) TO authenticated;

COMMENT ON FUNCTION public.get_my_recent_searches(int) IS
  'Caller-scoped recent search history for the AI Support page. Returns last N rows from usage_logs where action_type in (search, ai_search). SECURITY DEFINER so a regular tenant user can read their own rows without a per-row SELECT policy.';

NOTIFY pgrst;
