-- 0089_revert_trusted_choice_to_network.sql
-- Reverts the type change in 0088. Trusted Choice is the IIABA (Big "I")
-- brand affiliation — categorically a 'network', NOT a 'cluster' like SIAA,
-- Ironpeak, Keystone, Smart Choice (which are formal aggregator/cluster
-- entities). The 11,841 agency_affiliations links from the tag_trustedchoice
-- backfill remain correct — only the affiliation type was misclassified.
UPDATE public.affiliations
SET type = 'network'
WHERE id = 'd5e91828-ce46-44ff-a8fd-b970881c4d57'
  AND canonical_name = 'Trusted Choice';
