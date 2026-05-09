-- 0088_promote_trusted_choice_to_cluster.sql
-- Trusted Choice was previously typed as 'network' so it didn't appear in the
-- cluster filter alongside SIAA, Ironpeak, Keystone, Smart Choice, etc.
-- Re-classify as 'cluster' so the agency-directory cluster filter surfaces it.
-- Sort_order stays 0 (alongside UIIA + TRS) so featured/recent entries group
-- at the top before the alphabetical 1-105 historic ordering.
UPDATE public.affiliations
SET type = 'cluster'
WHERE id = 'd5e91828-ce46-44ff-a8fd-b970881c4d57'
  AND canonical_name = 'Trusted Choice';
