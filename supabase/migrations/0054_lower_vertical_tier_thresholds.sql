-- Tier thresholds tightened per Master O's pricing/sales judgment:
--   Exposure   stays at 2 specialty carriers
--   Growing    drops 4 → 3
--   Specialist drops 7 → 5
-- Materialized view rebuild (column shape unchanged, only thresholds change).

DROP MATERIALIZED VIEW IF EXISTS public.mv_vertical_summary;

CREATE MATERIALIZED VIEW public.mv_vertical_summary AS
WITH agency_match AS (
  SELECT a.id AS agency_id, a.name, a.parent_name, a.linkedin_url, a.web_address,
         a.email, a.facebook_url, a.twitter_url, vm_1.id AS vertical_id,
         count(DISTINCT ac.carrier_id) AS matches
  FROM public.agencies a
  JOIN public.agency_carriers   ac   ON ac.agency_id   = a.id
  JOIN public.carrier_verticals cv   ON cv.carrier_id  = ac.carrier_id
  JOIN public.vertical_markets  vm_1 ON vm_1.id        = cv.vertical_id
  GROUP BY a.id, a.name, a.parent_name, a.linkedin_url, a.web_address, a.email, a.facebook_url, a.twitter_url, vm_1.id
)
SELECT
  vm.slug, vm.name, vm.description, vm.icon_key, vm.color_token, vm.sort_order,
  (SELECT count(*) FROM public.carrier_verticals WHERE vertical_id = vm.id) AS mapped_carrier_count,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND matches >= 2), 0)::bigint AS agencies_with_exposure,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND matches >= 3), 0)::bigint AS agencies_growing,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND matches >= 5), 0)::bigint AS agencies_specialist,
  COALESCE((SELECT count(DISTINCT COALESCE(parent_name, name)) FROM agency_match WHERE vertical_id = vm.id), 0)::bigint AS agency_count,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id), 0)::bigint AS location_count,
  COALESCE((SELECT count(*)::bigint FROM public.contacts c WHERE c.agency_id IN (SELECT agency_id FROM agency_match WHERE vertical_id = vm.id)), 0) AS contact_count,
  COALESCE((SELECT count(*)::bigint FROM public.contacts c WHERE c.agency_id IN (SELECT agency_id FROM agency_match WHERE vertical_id = vm.id) AND c.email_primary IS NOT NULL), 0) AS contacts_with_email,
  COALESCE((SELECT count(*)::bigint FROM public.contacts c WHERE c.agency_id IN (SELECT agency_id FROM agency_match WHERE vertical_id = vm.id) AND c.mobile_phone  IS NOT NULL), 0) AS contacts_with_mobile,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND linkedin_url IS NOT NULL), 0)::bigint AS agencies_with_linkedin,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND web_address IS NOT NULL), 0)::bigint  AS agencies_with_web,
  COALESCE((SELECT count(*) FROM agency_match WHERE vertical_id = vm.id AND email IS NOT NULL), 0)::bigint        AS agencies_with_email
FROM public.vertical_markets vm
ORDER BY vm.sort_order;

CREATE UNIQUE INDEX mv_vertical_summary_slug_idx ON public.mv_vertical_summary (slug);
REFRESH MATERIALIZED VIEW public.mv_vertical_summary;
GRANT SELECT ON public.mv_vertical_summary TO anon, authenticated;
NOTIFY pgrst;
