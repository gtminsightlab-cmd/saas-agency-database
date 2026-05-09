-- 0090_dedupe_affiliations.sql
-- Consolidate 41 duplicate affiliation groups across cluster/network/association
-- types. The data on agency_affiliations is correct; only the entity records
-- have splinter rows (e.g., "SIAA" cluster + "SIAA (Strategic Independent
-- Agents Alliance)" network were both the same SIAA). Surfacing the same
-- entity twice in the directory's Affiliates filter was the visible defect.
--
-- Pattern per group (handles every link-distribution case correctly):
--   1) For agencies linked to multiple redundants but NOT to canonical, keep
--      one redundant row (deterministic by row_number) and delete the rest —
--      avoids unique-constraint conflict on the upcoming UPDATE.
--   2) For agencies already linked to canonical, delete every redundant link.
--   3) UPDATE remaining redundant rows → canonical.
--   4) DELETE the redundant affiliation entity rows.
--
-- Wrapped per Supabase apply_migration which runs the whole script in a
-- single transaction; any failure rolls back everything.

-- ── Group 1: Agency Network Exchange ─────────────────────────────────────
-- Canonical: fb1ed830 "ANE (Agency Network Exchange)" network (2 links)
-- Redundants: 83f5f178, b1a3c379, 00c836ee (all cluster, 0 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations
    WHERE affiliation_id IN ('83f5f178-afac-4713-8228-493f12921295','b1a3c379-2f59-4b28-a6d4-d311bfcaa855','00c836ee-8b25-44c5-a578-9eb84409d97b')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'fb1ed830-00a7-4697-8ddd-d03bba86ca21')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations
  WHERE affiliation_id IN ('83f5f178-afac-4713-8228-493f12921295','b1a3c379-2f59-4b28-a6d4-d311bfcaa855','00c836ee-8b25-44c5-a578-9eb84409d97b')
    AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'fb1ed830-00a7-4697-8ddd-d03bba86ca21');
UPDATE public.agency_affiliations SET affiliation_id = 'fb1ed830-00a7-4697-8ddd-d03bba86ca21'
  WHERE affiliation_id IN ('83f5f178-afac-4713-8228-493f12921295','b1a3c379-2f59-4b28-a6d4-d311bfcaa855','00c836ee-8b25-44c5-a578-9eb84409d97b');
DELETE FROM public.affiliations WHERE id IN ('83f5f178-afac-4713-8228-493f12921295','b1a3c379-2f59-4b28-a6d4-d311bfcaa855','00c836ee-8b25-44c5-a578-9eb84409d97b');

-- ── Group 2: Agents Alliance ─────────────────────────────────────────────
-- Canonical: ae5703f9 "Agents Alliance Services" network (7 links)
-- Redundants: bb2ebfa7, ef0f695b, 0aa7bf54
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations
    WHERE affiliation_id IN ('bb2ebfa7-639d-496f-8206-90bc8ad7bbc3','ef0f695b-c2c7-4f53-8cfd-ead4ac5cb75b','0aa7bf54-9e0d-4a64-9901-fb45f3ea9fbf')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'ae5703f9-f7e2-446f-92cf-d2c9d3d5a4a2')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations
  WHERE affiliation_id IN ('bb2ebfa7-639d-496f-8206-90bc8ad7bbc3','ef0f695b-c2c7-4f53-8cfd-ead4ac5cb75b','0aa7bf54-9e0d-4a64-9901-fb45f3ea9fbf')
    AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'ae5703f9-f7e2-446f-92cf-d2c9d3d5a4a2');
UPDATE public.agency_affiliations SET affiliation_id = 'ae5703f9-f7e2-446f-92cf-d2c9d3d5a4a2'
  WHERE affiliation_id IN ('bb2ebfa7-639d-496f-8206-90bc8ad7bbc3','ef0f695b-c2c7-4f53-8cfd-ead4ac5cb75b','0aa7bf54-9e0d-4a64-9901-fb45f3ea9fbf');
DELETE FROM public.affiliations WHERE id IN ('bb2ebfa7-639d-496f-8206-90bc8ad7bbc3','ef0f695b-c2c7-4f53-8cfd-ead4ac5cb75b','0aa7bf54-9e0d-4a64-9901-fb45f3ea9fbf');

-- ── Group 3: Alliance Insurance Group of Kansas ──────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('37cafd11-0136-4c25-a3dc-3e9b8bf51e63')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '44cdc192-ced7-4f18-b489-96d72431e5e8')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '37cafd11-0136-4c25-a3dc-3e9b8bf51e63'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '44cdc192-ced7-4f18-b489-96d72431e5e8');
UPDATE public.agency_affiliations SET affiliation_id = '44cdc192-ced7-4f18-b489-96d72431e5e8' WHERE affiliation_id = '37cafd11-0136-4c25-a3dc-3e9b8bf51e63';
DELETE FROM public.affiliations WHERE id = '37cafd11-0136-4c25-a3dc-3e9b8bf51e63';

-- ── Group 4: Alliance Insurance Services ─────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('c434a246-b5d7-403d-aba2-c7235fe41fbc')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'b34fc3b9-e942-47c9-bd1e-273cca00f131')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = 'c434a246-b5d7-403d-aba2-c7235fe41fbc'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'b34fc3b9-e942-47c9-bd1e-273cca00f131');
UPDATE public.agency_affiliations SET affiliation_id = 'b34fc3b9-e942-47c9-bd1e-273cca00f131' WHERE affiliation_id = 'c434a246-b5d7-403d-aba2-c7235fe41fbc';
DELETE FROM public.affiliations WHERE id = 'c434a246-b5d7-403d-aba2-c7235fe41fbc';

-- ── Group 5: American West Insurance Agency Alliance ─────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('3fe0ea05-84e2-4c06-a493-8beeeb58ee91')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd2fbff1c-cdcc-432c-b959-20f8386a3fe9')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '3fe0ea05-84e2-4c06-a493-8beeeb58ee91'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd2fbff1c-cdcc-432c-b959-20f8386a3fe9');
UPDATE public.agency_affiliations SET affiliation_id = 'd2fbff1c-cdcc-432c-b959-20f8386a3fe9' WHERE affiliation_id = '3fe0ea05-84e2-4c06-a493-8beeeb58ee91';
DELETE FROM public.affiliations WHERE id = '3fe0ea05-84e2-4c06-a493-8beeeb58ee91';

-- ── Group 6: Amwins Direct Access Insurance Services (DAIS) ──────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('7a3115f5-1d1c-46eb-b652-f189708af37d','be7e7acf-33c4-41a0-b1aa-e049048eb86d')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '65eab64d-85e2-49e9-a402-88effdb67280')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('7a3115f5-1d1c-46eb-b652-f189708af37d','be7e7acf-33c4-41a0-b1aa-e049048eb86d')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '65eab64d-85e2-49e9-a402-88effdb67280');
UPDATE public.agency_affiliations SET affiliation_id = '65eab64d-85e2-49e9-a402-88effdb67280'
  WHERE affiliation_id IN ('7a3115f5-1d1c-46eb-b652-f189708af37d','be7e7acf-33c4-41a0-b1aa-e049048eb86d');
DELETE FROM public.affiliations WHERE id IN ('7a3115f5-1d1c-46eb-b652-f189708af37d','be7e7acf-33c4-41a0-b1aa-e049048eb86d');

-- ── Group 7: Associated Insurance Services ───────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('075813fb-46a4-44da-a18d-c079ca866a9b')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'fed080c8-5e9c-43fc-87f8-5350457de091')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '075813fb-46a4-44da-a18d-c079ca866a9b'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'fed080c8-5e9c-43fc-87f8-5350457de091');
UPDATE public.agency_affiliations SET affiliation_id = 'fed080c8-5e9c-43fc-87f8-5350457de091' WHERE affiliation_id = '075813fb-46a4-44da-a18d-c079ca866a9b';
DELETE FROM public.affiliations WHERE id = '075813fb-46a4-44da-a18d-c079ca866a9b';

-- ── Group 8: Atlas Insurance Brokers (high-stakes — both rows have links) ─
-- Canonical: 62f712a6 cluster (1 link), Redundants: 34a72e50 net (1), eda5aaf0, 870e2d8c
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('34a72e50-6da9-4dab-b8a3-550190752b36','eda5aaf0-bb71-4cdd-ae82-eba7072c3a09','870e2d8c-5d39-4553-919a-30e347a93651')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '62f712a6-89c8-4dbe-8099-448bc5bfe798')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('34a72e50-6da9-4dab-b8a3-550190752b36','eda5aaf0-bb71-4cdd-ae82-eba7072c3a09','870e2d8c-5d39-4553-919a-30e347a93651')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '62f712a6-89c8-4dbe-8099-448bc5bfe798');
UPDATE public.agency_affiliations SET affiliation_id = '62f712a6-89c8-4dbe-8099-448bc5bfe798'
  WHERE affiliation_id IN ('34a72e50-6da9-4dab-b8a3-550190752b36','eda5aaf0-bb71-4cdd-ae82-eba7072c3a09','870e2d8c-5d39-4553-919a-30e347a93651');
DELETE FROM public.affiliations WHERE id IN ('34a72e50-6da9-4dab-b8a3-550190752b36','eda5aaf0-bb71-4cdd-ae82-eba7072c3a09','870e2d8c-5d39-4553-919a-30e347a93651');

-- ── Group 9: Austin Association of Insurance Agents ──────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('0c7278ee-cd2f-47cf-9bc5-8206a48f439c')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '09fa8969-ff80-48bf-a210-5499a3ac603e')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '0c7278ee-cd2f-47cf-9bc5-8206a48f439c'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '09fa8969-ff80-48bf-a210-5499a3ac603e');
UPDATE public.agency_affiliations SET affiliation_id = '09fa8969-ff80-48bf-a210-5499a3ac603e' WHERE affiliation_id = '0c7278ee-cd2f-47cf-9bc5-8206a48f439c';
DELETE FROM public.affiliations WHERE id = '0c7278ee-cd2f-47cf-9bc5-8206a48f439c';

-- ── Group 10: Blue Ridge Insurance Partners ──────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('379e6355-dd3b-4692-8866-948f42db9ab3')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '450d4538-e382-4d0f-a3e1-70a6d7138f60')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '379e6355-dd3b-4692-8866-948f42db9ab3'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '450d4538-e382-4d0f-a3e1-70a6d7138f60');
UPDATE public.agency_affiliations SET affiliation_id = '450d4538-e382-4d0f-a3e1-70a6d7138f60' WHERE affiliation_id = '379e6355-dd3b-4692-8866-948f42db9ab3';
DELETE FROM public.affiliations WHERE id = '379e6355-dd3b-4692-8866-948f42db9ab3';

-- ── Group 11: Brightway Insurance ────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('3aab7fd0-1af7-4dec-b7a9-8a541f7e8c7b','803ba0dd-3564-4ba2-ad37-6b14e4cb823b')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd144ad8a-d156-42b0-b036-e903ebf10cc5')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('3aab7fd0-1af7-4dec-b7a9-8a541f7e8c7b','803ba0dd-3564-4ba2-ad37-6b14e4cb823b')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd144ad8a-d156-42b0-b036-e903ebf10cc5');
UPDATE public.agency_affiliations SET affiliation_id = 'd144ad8a-d156-42b0-b036-e903ebf10cc5'
  WHERE affiliation_id IN ('3aab7fd0-1af7-4dec-b7a9-8a541f7e8c7b','803ba0dd-3564-4ba2-ad37-6b14e4cb823b');
DELETE FROM public.affiliations WHERE id IN ('3aab7fd0-1af7-4dec-b7a9-8a541f7e8c7b','803ba0dd-3564-4ba2-ad37-6b14e4cb823b');

-- ── Group 12: Capital Area Independent Agents ────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('70fa143f-9ec8-427b-a8b0-19be2d6d15e2')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '2d5efce8-7a59-4194-bc75-c412714df546')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '70fa143f-9ec8-427b-a8b0-19be2d6d15e2'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '2d5efce8-7a59-4194-bc75-c412714df546');
UPDATE public.agency_affiliations SET affiliation_id = '2d5efce8-7a59-4194-bc75-c412714df546' WHERE affiliation_id = '70fa143f-9ec8-427b-a8b0-19be2d6d15e2';
DELETE FROM public.affiliations WHERE id = '70fa143f-9ec8-427b-a8b0-19be2d6d15e2';

-- ── Group 13: CIAB ───────────────────────────────────────────────────────
-- Canonical: 39a84ba9 network "CIAB (The Council of Insurance Agents & Brokers)" (74 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('887dedde-da99-4d76-9555-7606e5a5986e')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '39a84ba9-2177-46dc-b02b-e94e70b16680')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '887dedde-da99-4d76-9555-7606e5a5986e'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '39a84ba9-2177-46dc-b02b-e94e70b16680');
UPDATE public.agency_affiliations SET affiliation_id = '39a84ba9-2177-46dc-b02b-e94e70b16680' WHERE affiliation_id = '887dedde-da99-4d76-9555-7606e5a5986e';
DELETE FROM public.affiliations WHERE id = '887dedde-da99-4d76-9555-7606e5a5986e';

-- ── Group 14: Coast General Insurance Brokers ────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('9b312fa0-556b-46c9-9947-86f072eb8406')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '3cc9435f-4345-4295-8105-4f060788add0')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '9b312fa0-556b-46c9-9947-86f072eb8406'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '3cc9435f-4345-4295-8105-4f060788add0');
UPDATE public.agency_affiliations SET affiliation_id = '3cc9435f-4345-4295-8105-4f060788add0' WHERE affiliation_id = '9b312fa0-556b-46c9-9947-86f072eb8406';
DELETE FROM public.affiliations WHERE id = '9b312fa0-556b-46c9-9947-86f072eb8406';

-- ── Group 15: Combined Agents of America ─────────────────────────────────
-- Canonical: 88e8d703 net (32 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('a499fe96-3c05-404d-ab4b-b5e1e09bd8fb','4f25b007-c6fe-4674-b374-bbeae2bf65b3','5a284d07-bf41-4dbd-a6ae-7b2f1186d696')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '88e8d703-12b0-4f3c-b6e8-ca09843d200b')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('a499fe96-3c05-404d-ab4b-b5e1e09bd8fb','4f25b007-c6fe-4674-b374-bbeae2bf65b3','5a284d07-bf41-4dbd-a6ae-7b2f1186d696')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '88e8d703-12b0-4f3c-b6e8-ca09843d200b');
UPDATE public.agency_affiliations SET affiliation_id = '88e8d703-12b0-4f3c-b6e8-ca09843d200b'
  WHERE affiliation_id IN ('a499fe96-3c05-404d-ab4b-b5e1e09bd8fb','4f25b007-c6fe-4674-b374-bbeae2bf65b3','5a284d07-bf41-4dbd-a6ae-7b2f1186d696');
DELETE FROM public.affiliations WHERE id IN ('a499fe96-3c05-404d-ab4b-b5e1e09bd8fb','4f25b007-c6fe-4674-b374-bbeae2bf65b3','5a284d07-bf41-4dbd-a6ae-7b2f1186d696');

-- ── Group 16: Fiesta Insurance Franchise Corp ────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('19efbeda-0fd1-4062-a64c-62b27830fcee','3a72b28d-413e-485b-b70d-267b7a707b6a','0e909727-58d7-4ae2-8bbb-fbe5bdd0ae9d')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'ab578896-c373-4bf6-b48b-41db1656d759')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('19efbeda-0fd1-4062-a64c-62b27830fcee','3a72b28d-413e-485b-b70d-267b7a707b6a','0e909727-58d7-4ae2-8bbb-fbe5bdd0ae9d')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'ab578896-c373-4bf6-b48b-41db1656d759');
UPDATE public.agency_affiliations SET affiliation_id = 'ab578896-c373-4bf6-b48b-41db1656d759'
  WHERE affiliation_id IN ('19efbeda-0fd1-4062-a64c-62b27830fcee','3a72b28d-413e-485b-b70d-267b7a707b6a','0e909727-58d7-4ae2-8bbb-fbe5bdd0ae9d');
DELETE FROM public.affiliations WHERE id IN ('19efbeda-0fd1-4062-a64c-62b27830fcee','3a72b28d-413e-485b-b70d-267b7a707b6a','0e909727-58d7-4ae2-8bbb-fbe5bdd0ae9d');

-- ── Group 17: FIG (Financial Insurance Group) ────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('14870e17-c06a-4975-b613-1a2421859f58')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '945016e3-cf45-42ac-a4e6-ec9092e72da6')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '14870e17-c06a-4975-b613-1a2421859f58'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '945016e3-cf45-42ac-a4e6-ec9092e72da6');
UPDATE public.agency_affiliations SET affiliation_id = '945016e3-cf45-42ac-a4e6-ec9092e72da6' WHERE affiliation_id = '14870e17-c06a-4975-b613-1a2421859f58';
DELETE FROM public.affiliations WHERE id = '14870e17-c06a-4975-b613-1a2421859f58';

-- ── Group 18: FirstChoice ────────────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('b777c3b6-2fa0-4a22-b60f-81492359910f','058e5fad-bbc0-4b3c-9bb9-cd6ed0760fe8','12b2b0c0-9433-46d7-8cb9-6ccab8454448')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '9ff0b8b0-dedf-43cb-8e5e-881cf138056a')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('b777c3b6-2fa0-4a22-b60f-81492359910f','058e5fad-bbc0-4b3c-9bb9-cd6ed0760fe8','12b2b0c0-9433-46d7-8cb9-6ccab8454448')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '9ff0b8b0-dedf-43cb-8e5e-881cf138056a');
UPDATE public.agency_affiliations SET affiliation_id = '9ff0b8b0-dedf-43cb-8e5e-881cf138056a'
  WHERE affiliation_id IN ('b777c3b6-2fa0-4a22-b60f-81492359910f','058e5fad-bbc0-4b3c-9bb9-cd6ed0760fe8','12b2b0c0-9433-46d7-8cb9-6ccab8454448');
DELETE FROM public.affiliations WHERE id IN ('b777c3b6-2fa0-4a22-b60f-81492359910f','058e5fad-bbc0-4b3c-9bb9-cd6ed0760fe8','12b2b0c0-9433-46d7-8cb9-6ccab8454448');

-- ── Group 19: Fortified ──────────────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('a2ca8c2a-f2ef-40d1-90f9-14cc16060b5f')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '46e2b541-7020-43c5-b2da-e81c7ad4edec')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = 'a2ca8c2a-f2ef-40d1-90f9-14cc16060b5f'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '46e2b541-7020-43c5-b2da-e81c7ad4edec');
UPDATE public.agency_affiliations SET affiliation_id = '46e2b541-7020-43c5-b2da-e81c7ad4edec' WHERE affiliation_id = 'a2ca8c2a-f2ef-40d1-90f9-14cc16060b5f';
DELETE FROM public.affiliations WHERE id = 'a2ca8c2a-f2ef-40d1-90f9-14cc16060b5f';

-- ── Group 20: GreatFlorida Insurance ─────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('d6fe4044-ce83-4af4-a75b-403273cfdaee','afa07d8c-11ee-4916-991c-8bb88dc58c90','2f845bfe-ea02-4bab-b596-2aa368002be6')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '529e9288-8e04-436c-a950-6c31f6604d9d')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('d6fe4044-ce83-4af4-a75b-403273cfdaee','afa07d8c-11ee-4916-991c-8bb88dc58c90','2f845bfe-ea02-4bab-b596-2aa368002be6')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '529e9288-8e04-436c-a950-6c31f6604d9d');
UPDATE public.agency_affiliations SET affiliation_id = '529e9288-8e04-436c-a950-6c31f6604d9d'
  WHERE affiliation_id IN ('d6fe4044-ce83-4af4-a75b-403273cfdaee','afa07d8c-11ee-4916-991c-8bb88dc58c90','2f845bfe-ea02-4bab-b596-2aa368002be6');
DELETE FROM public.affiliations WHERE id IN ('d6fe4044-ce83-4af4-a75b-403273cfdaee','afa07d8c-11ee-4916-991c-8bb88dc58c90','2f845bfe-ea02-4bab-b596-2aa368002be6');

-- ── Group 21: IAA / Insurance Associates of America ──────────────────────
-- Canonical: 6f036ea7 net "IAA (Insurance Associates of America)" (1 link)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('871b6918-ddb3-41a2-a4e7-c5908175a425','e47ca6a3-5cd8-4263-8f9a-688887b01855')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '6f036ea7-82b0-41d9-a3c2-e6e9b59da3bd')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('871b6918-ddb3-41a2-a4e7-c5908175a425','e47ca6a3-5cd8-4263-8f9a-688887b01855')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '6f036ea7-82b0-41d9-a3c2-e6e9b59da3bd');
UPDATE public.agency_affiliations SET affiliation_id = '6f036ea7-82b0-41d9-a3c2-e6e9b59da3bd'
  WHERE affiliation_id IN ('871b6918-ddb3-41a2-a4e7-c5908175a425','e47ca6a3-5cd8-4263-8f9a-688887b01855');
DELETE FROM public.affiliations WHERE id IN ('871b6918-ddb3-41a2-a4e7-c5908175a425','e47ca6a3-5cd8-4263-8f9a-688887b01855');

-- ── Group 22: IIABA ──────────────────────────────────────────────────────
-- Canonical: d6866c0d net "IIABA (...)" (2,264 links). Redundants: d670a7ab (broken paren, 381 links), 9dcf156d (Big I-IIABA, 0 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('d670a7ab-a8b9-43b2-a3a3-7aa6da5d4ef5','9dcf156d-36db-4195-886b-d6b89929528b')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd6866c0d-ab99-4a55-b18e-d5eec96e7258')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('d670a7ab-a8b9-43b2-a3a3-7aa6da5d4ef5','9dcf156d-36db-4195-886b-d6b89929528b')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'd6866c0d-ab99-4a55-b18e-d5eec96e7258');
UPDATE public.agency_affiliations SET affiliation_id = 'd6866c0d-ab99-4a55-b18e-d5eec96e7258'
  WHERE affiliation_id IN ('d670a7ab-a8b9-43b2-a3a3-7aa6da5d4ef5','9dcf156d-36db-4195-886b-d6b89929528b');
DELETE FROM public.affiliations WHERE id IN ('d670a7ab-a8b9-43b2-a3a3-7aa6da5d4ef5','9dcf156d-36db-4195-886b-d6b89929528b');

-- ── Group 23: Indium ─────────────────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('5b76efeb-a56d-4332-9abc-1b256c5e3a64','5d9e5ae2-b448-4577-8573-17eb3084621b')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '79f17612-544a-408a-bead-f0562e7289d3')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('5b76efeb-a56d-4332-9abc-1b256c5e3a64','5d9e5ae2-b448-4577-8573-17eb3084621b')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '79f17612-544a-408a-bead-f0562e7289d3');
UPDATE public.agency_affiliations SET affiliation_id = '79f17612-544a-408a-bead-f0562e7289d3'
  WHERE affiliation_id IN ('5b76efeb-a56d-4332-9abc-1b256c5e3a64','5d9e5ae2-b448-4577-8573-17eb3084621b');
DELETE FROM public.affiliations WHERE id IN ('5b76efeb-a56d-4332-9abc-1b256c5e3a64','5d9e5ae2-b448-4577-8573-17eb3084621b');

-- ── Group 24: Insurors Group ─────────────────────────────────────────────
-- Canonical: aa270384 cluster "Insurors Group LLC" (19 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('ed575c6a-9dd5-4f8c-8f7f-0746ca9edb7c')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'aa270384-106d-4f6c-9f9b-a14e85853db3')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = 'ed575c6a-9dd5-4f8c-8f7f-0746ca9edb7c'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'aa270384-106d-4f6c-9f9b-a14e85853db3');
UPDATE public.agency_affiliations SET affiliation_id = 'aa270384-106d-4f6c-9f9b-a14e85853db3' WHERE affiliation_id = 'ed575c6a-9dd5-4f8c-8f7f-0746ca9edb7c';
DELETE FROM public.affiliations WHERE id = 'ed575c6a-9dd5-4f8c-8f7f-0746ca9edb7c';

-- ── Group 25: Ironpeak ───────────────────────────────────────────────────
-- Canonical: b2cd33eb cluster "Ironpeak" (2 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('5ed35f17-a7cd-4871-8925-82e7e1e31a27')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'b2cd33eb-e745-47bb-9683-515185d546f2')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '5ed35f17-a7cd-4871-8925-82e7e1e31a27'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'b2cd33eb-e745-47bb-9683-515185d546f2');
UPDATE public.agency_affiliations SET affiliation_id = 'b2cd33eb-e745-47bb-9683-515185d546f2' WHERE affiliation_id = '5ed35f17-a7cd-4871-8925-82e7e1e31a27';
DELETE FROM public.affiliations WHERE id = '5ed35f17-a7cd-4871-8925-82e7e1e31a27';

-- ── Group 26: Iroquois Group (proper-spelling canonical wins; merges in 27 links from typo'd row) ──
-- Canonical: 9ef4a027 net "Iroquois Group" (16 links, proper spelling)
-- Redundants: b022d8eb "Iroqouis Group" (TYPO, 27 links), f79c0ec8, 18e90d8a (both 0 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('b022d8eb-2d05-48c7-a6c5-04d460d61f62','f79c0ec8-8843-4103-94f7-99f395b70b66','18e90d8a-b543-461e-9905-66c8139a35f9')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '9ef4a027-17bb-49b7-bb54-18e29dd4e436')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('b022d8eb-2d05-48c7-a6c5-04d460d61f62','f79c0ec8-8843-4103-94f7-99f395b70b66','18e90d8a-b543-461e-9905-66c8139a35f9')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '9ef4a027-17bb-49b7-bb54-18e29dd4e436');
UPDATE public.agency_affiliations SET affiliation_id = '9ef4a027-17bb-49b7-bb54-18e29dd4e436'
  WHERE affiliation_id IN ('b022d8eb-2d05-48c7-a6c5-04d460d61f62','f79c0ec8-8843-4103-94f7-99f395b70b66','18e90d8a-b543-461e-9905-66c8139a35f9');
DELETE FROM public.affiliations WHERE id IN ('b022d8eb-2d05-48c7-a6c5-04d460d61f62','f79c0ec8-8843-4103-94f7-99f395b70b66','18e90d8a-b543-461e-9905-66c8139a35f9');

-- ── Group 27: ISG United ─────────────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('e2d8c28f-30b4-4d9b-803d-7a58274c306b','2bc1012b-dff4-4f07-b618-901ea66cb868')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '20e21a0f-229c-4b92-bc9f-e57fc9669edc')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('e2d8c28f-30b4-4d9b-803d-7a58274c306b','2bc1012b-dff4-4f07-b618-901ea66cb868')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '20e21a0f-229c-4b92-bc9f-e57fc9669edc');
UPDATE public.agency_affiliations SET affiliation_id = '20e21a0f-229c-4b92-bc9f-e57fc9669edc'
  WHERE affiliation_id IN ('e2d8c28f-30b4-4d9b-803d-7a58274c306b','2bc1012b-dff4-4f07-b618-901ea66cb868');
DELETE FROM public.affiliations WHERE id IN ('e2d8c28f-30b4-4d9b-803d-7a58274c306b','2bc1012b-dff4-4f07-b618-901ea66cb868');

-- ── Group 28: ISU Steadfast ──────────────────────────────────────────────
-- Canonical: 28bffa05 cluster "ISU Steadfast" (148 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('2781bb99-68da-4bde-b38f-8888fcdea63e','9544624c-1782-453f-9960-b54475a7ce65','a7184c96-2336-4a23-8b4e-3ae80124e852','8f37fc12-55de-4591-8783-6b3d05e4eff1')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '28bffa05-1a08-473b-8474-b0e3e2625dde')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('2781bb99-68da-4bde-b38f-8888fcdea63e','9544624c-1782-453f-9960-b54475a7ce65','a7184c96-2336-4a23-8b4e-3ae80124e852','8f37fc12-55de-4591-8783-6b3d05e4eff1')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '28bffa05-1a08-473b-8474-b0e3e2625dde');
UPDATE public.agency_affiliations SET affiliation_id = '28bffa05-1a08-473b-8474-b0e3e2625dde'
  WHERE affiliation_id IN ('2781bb99-68da-4bde-b38f-8888fcdea63e','9544624c-1782-453f-9960-b54475a7ce65','a7184c96-2336-4a23-8b4e-3ae80124e852','8f37fc12-55de-4591-8783-6b3d05e4eff1');
DELETE FROM public.affiliations WHERE id IN ('2781bb99-68da-4bde-b38f-8888fcdea63e','9544624c-1782-453f-9960-b54475a7ce65','a7184c96-2336-4a23-8b4e-3ae80124e852','8f37fc12-55de-4591-8783-6b3d05e4eff1');

-- ── Group 29: Keystone Insurers Group (HIGH STAKES — 398 combined links) ─
-- Canonical: cdee4446 net "Keystone Insurers Group, Inc." (206 links)
-- Redundants: 1df49af8 cluster "Keystone Insurers Group Inc." (192 links!), a75f6851, 4f7eabab (both 0)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('a75f6851-0abc-4b09-bd4d-50a5dac88f06','1df49af8-528a-43a8-9d35-1dd1650cb7e3','4f7eabab-c9d2-4525-b57a-5e2906daaca0')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'cdee4446-026b-4b9c-8343-7762cf186a3f')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('a75f6851-0abc-4b09-bd4d-50a5dac88f06','1df49af8-528a-43a8-9d35-1dd1650cb7e3','4f7eabab-c9d2-4525-b57a-5e2906daaca0')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'cdee4446-026b-4b9c-8343-7762cf186a3f');
UPDATE public.agency_affiliations SET affiliation_id = 'cdee4446-026b-4b9c-8343-7762cf186a3f'
  WHERE affiliation_id IN ('a75f6851-0abc-4b09-bd4d-50a5dac88f06','1df49af8-528a-43a8-9d35-1dd1650cb7e3','4f7eabab-c9d2-4525-b57a-5e2906daaca0');
DELETE FROM public.affiliations WHERE id IN ('a75f6851-0abc-4b09-bd4d-50a5dac88f06','1df49af8-528a-43a8-9d35-1dd1650cb7e3','4f7eabab-c9d2-4525-b57a-5e2906daaca0');

-- ── Group 30: Mountain Empire Agency Alliance ────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('ce254fbc-5d35-4062-bd4f-e0f99d41a79d','81fc8af5-3405-4e49-8b4b-6dd4ed4a6146')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'cd35101b-bb2c-4777-9172-f39fef39e769')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('ce254fbc-5d35-4062-bd4f-e0f99d41a79d','81fc8af5-3405-4e49-8b4b-6dd4ed4a6146')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'cd35101b-bb2c-4777-9172-f39fef39e769');
UPDATE public.agency_affiliations SET affiliation_id = 'cd35101b-bb2c-4777-9172-f39fef39e769'
  WHERE affiliation_id IN ('ce254fbc-5d35-4062-bd4f-e0f99d41a79d','81fc8af5-3405-4e49-8b4b-6dd4ed4a6146');
DELETE FROM public.affiliations WHERE id IN ('ce254fbc-5d35-4062-bd4f-e0f99d41a79d','81fc8af5-3405-4e49-8b4b-6dd4ed4a6146');

-- ── Group 31: NAPSLO/WSIA → WSIA ─────────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('09d164de-9023-495f-8ad4-94444a1cb6ee')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '4eda52c8-420b-49c1-be39-d16877daaad4')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '09d164de-9023-495f-8ad4-94444a1cb6ee'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '4eda52c8-420b-49c1-be39-d16877daaad4');
UPDATE public.agency_affiliations SET affiliation_id = '4eda52c8-420b-49c1-be39-d16877daaad4' WHERE affiliation_id = '09d164de-9023-495f-8ad4-94444a1cb6ee';
DELETE FROM public.affiliations WHERE id = '09d164de-9023-495f-8ad4-94444a1cb6ee';

-- ── Group 32: Pacific Interstate Insurance Brokerage (PIIB) ──────────────
-- Canonical: 280273b1 net "Pacific Interstate Insurance Brokerage (PIIB)" (61 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('50b1e680-a38b-427d-a256-79720bd1836e','e867f1d4-fb74-4b32-8d3b-375376deba4a','e88ab715-d155-4d75-96f1-ac044f4f057a')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '280273b1-7aa4-459c-894e-0456c9e2946d')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('50b1e680-a38b-427d-a256-79720bd1836e','e867f1d4-fb74-4b32-8d3b-375376deba4a','e88ab715-d155-4d75-96f1-ac044f4f057a')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '280273b1-7aa4-459c-894e-0456c9e2946d');
UPDATE public.agency_affiliations SET affiliation_id = '280273b1-7aa4-459c-894e-0456c9e2946d'
  WHERE affiliation_id IN ('50b1e680-a38b-427d-a256-79720bd1836e','e867f1d4-fb74-4b32-8d3b-375376deba4a','e88ab715-d155-4d75-96f1-ac044f4f057a');
DELETE FROM public.affiliations WHERE id IN ('50b1e680-a38b-427d-a256-79720bd1836e','e867f1d4-fb74-4b32-8d3b-375376deba4a','e88ab715-d155-4d75-96f1-ac044f4f057a');

-- ── Group 33: PacWest Alliance Insurance Services ────────────────────────
-- Canonical: f2bdb752 net "Pacwest Alliance Insurance Services, Inc." (20 links)
-- Redundants: c8dce96d (0), 97509fbb cluster (11 links), 7656f930 (0)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('c8dce96d-e3f5-428d-9ecd-1318be5eb984','97509fbb-3980-423b-bb99-b869c4235f5a','7656f930-b0b9-45c7-a195-9e1137595656')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'f2bdb752-080c-43c0-b5a8-499e8e67665f')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('c8dce96d-e3f5-428d-9ecd-1318be5eb984','97509fbb-3980-423b-bb99-b869c4235f5a','7656f930-b0b9-45c7-a195-9e1137595656')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'f2bdb752-080c-43c0-b5a8-499e8e67665f');
UPDATE public.agency_affiliations SET affiliation_id = 'f2bdb752-080c-43c0-b5a8-499e8e67665f'
  WHERE affiliation_id IN ('c8dce96d-e3f5-428d-9ecd-1318be5eb984','97509fbb-3980-423b-bb99-b869c4235f5a','7656f930-b0b9-45c7-a195-9e1137595656');
DELETE FROM public.affiliations WHERE id IN ('c8dce96d-e3f5-428d-9ecd-1318be5eb984','97509fbb-3980-423b-bb99-b869c4235f5a','7656f930-b0b9-45c7-a195-9e1137595656');

-- ── Group 34: PIA ────────────────────────────────────────────────────────
-- Canonical: 5299d6a9 net "PIA (National Association of Professional Insurance Agents)" (823 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('3f8eb641-b144-41aa-8793-ac8e830b0f20')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '5299d6a9-11df-4d72-9a62-6332cdfbd066')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '3f8eb641-b144-41aa-8793-ac8e830b0f20'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '5299d6a9-11df-4d72-9a62-6332cdfbd066');
UPDATE public.agency_affiliations SET affiliation_id = '5299d6a9-11df-4d72-9a62-6332cdfbd066' WHERE affiliation_id = '3f8eb641-b144-41aa-8793-ac8e830b0f20';
DELETE FROM public.affiliations WHERE id = '3f8eb641-b144-41aa-8793-ac8e830b0f20';

-- ── Group 35: Renaissance ────────────────────────────────────────────────
-- Canonical: 91faaf56 cluster "Renaissance Alliance" (53 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('462928e3-2a2c-425d-afa6-ac13f926b9be','963590c4-440b-4f6a-bf8a-a2ac08f33a78')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '91faaf56-b2a2-48f6-a071-d6c901b22c90')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('462928e3-2a2c-425d-afa6-ac13f926b9be','963590c4-440b-4f6a-bf8a-a2ac08f33a78')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '91faaf56-b2a2-48f6-a071-d6c901b22c90');
UPDATE public.agency_affiliations SET affiliation_id = '91faaf56-b2a2-48f6-a071-d6c901b22c90'
  WHERE affiliation_id IN ('462928e3-2a2c-425d-afa6-ac13f926b9be','963590c4-440b-4f6a-bf8a-a2ac08f33a78');
DELETE FROM public.affiliations WHERE id IN ('462928e3-2a2c-425d-afa6-ac13f926b9be','963590c4-440b-4f6a-bf8a-a2ac08f33a78');

-- ── Group 36: SecureRisk ─────────────────────────────────────────────────
-- Canonical: 3b7f7ad2 cluster "SecureRisk" (104 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('61a4e5e3-d1e7-435e-b446-9810b2783e74','de5f3a34-b735-4192-9b2d-4fdb0e1d85f1')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '3b7f7ad2-05cb-4060-8922-4be8f3550de2')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('61a4e5e3-d1e7-435e-b446-9810b2783e74','de5f3a34-b735-4192-9b2d-4fdb0e1d85f1')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '3b7f7ad2-05cb-4060-8922-4be8f3550de2');
UPDATE public.agency_affiliations SET affiliation_id = '3b7f7ad2-05cb-4060-8922-4be8f3550de2'
  WHERE affiliation_id IN ('61a4e5e3-d1e7-435e-b446-9810b2783e74','de5f3a34-b735-4192-9b2d-4fdb0e1d85f1');
DELETE FROM public.affiliations WHERE id IN ('61a4e5e3-d1e7-435e-b446-9810b2783e74','de5f3a34-b735-4192-9b2d-4fdb0e1d85f1');

-- ── Group 37: SIAA ───────────────────────────────────────────────────────
-- Canonical: c036590f net "SIAA (Strategic Independent Agents Alliance)" (172 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('a16041c2-76a8-48a5-98f5-05c8b3dc892b','b25c6c1d-8e2a-495f-b973-0a3e6b78b0b4','f711268a-d211-4a38-ada8-2930ad81af16')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'c036590f-0d24-41ee-8341-65fedcac107a')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('a16041c2-76a8-48a5-98f5-05c8b3dc892b','b25c6c1d-8e2a-495f-b973-0a3e6b78b0b4','f711268a-d211-4a38-ada8-2930ad81af16')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = 'c036590f-0d24-41ee-8341-65fedcac107a');
UPDATE public.agency_affiliations SET affiliation_id = 'c036590f-0d24-41ee-8341-65fedcac107a'
  WHERE affiliation_id IN ('a16041c2-76a8-48a5-98f5-05c8b3dc892b','b25c6c1d-8e2a-495f-b973-0a3e6b78b0b4','f711268a-d211-4a38-ada8-2930ad81af16');
DELETE FROM public.affiliations WHERE id IN ('a16041c2-76a8-48a5-98f5-05c8b3dc892b','b25c6c1d-8e2a-495f-b973-0a3e6b78b0b4','f711268a-d211-4a38-ada8-2930ad81af16');

-- ── Group 38: Smart Choice ───────────────────────────────────────────────
-- Canonical: 607323b8 cluster "Smart Choice" (4 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('2771a685-5e24-4c52-88bb-f492ea93aa3d','a8bd6f8d-d6b6-4fd4-aef5-24d577612244')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '607323b8-75a0-4367-984d-831d9bac0081')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('2771a685-5e24-4c52-88bb-f492ea93aa3d','a8bd6f8d-d6b6-4fd4-aef5-24d577612244')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '607323b8-75a0-4367-984d-831d9bac0081');
UPDATE public.agency_affiliations SET affiliation_id = '607323b8-75a0-4367-984d-831d9bac0081'
  WHERE affiliation_id IN ('2771a685-5e24-4c52-88bb-f492ea93aa3d','a8bd6f8d-d6b6-4fd4-aef5-24d577612244');
DELETE FROM public.affiliations WHERE id IN ('2771a685-5e24-4c52-88bb-f492ea93aa3d','a8bd6f8d-d6b6-4fd4-aef5-24d577612244');

-- ── Group 39: Strategic Agency Partners ──────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('e6e7dc89-ca2b-46e1-bc66-786241b23259')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '90899088-e599-4c3b-be40-56b4b6ee34ef')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = 'e6e7dc89-ca2b-46e1-bc66-786241b23259'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '90899088-e599-4c3b-be40-56b4b6ee34ef');
UPDATE public.agency_affiliations SET affiliation_id = '90899088-e599-4c3b-be40-56b4b6ee34ef' WHERE affiliation_id = 'e6e7dc89-ca2b-46e1-bc66-786241b23259';
DELETE FROM public.affiliations WHERE id = 'e6e7dc89-ca2b-46e1-bc66-786241b23259';

-- ── Group 40: The Agency Collective ──────────────────────────────────────
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('21e5eb40-012f-4937-bae5-c766cd909e18')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '56e528be-53cb-4e19-a21e-7a6c9f3eaffc')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id = '21e5eb40-012f-4937-bae5-c766cd909e18'
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '56e528be-53cb-4e19-a21e-7a6c9f3eaffc');
UPDATE public.agency_affiliations SET affiliation_id = '56e528be-53cb-4e19-a21e-7a6c9f3eaffc' WHERE affiliation_id = '21e5eb40-012f-4937-bae5-c766cd909e18';
DELETE FROM public.affiliations WHERE id = '21e5eb40-012f-4937-bae5-c766cd909e18';

-- ── Group 41: United Agencies ────────────────────────────────────────────
-- Canonical: 14a99ba0 cluster "United Agencies, Inc." (6 links)
DELETE FROM public.agency_affiliations WHERE id IN (
  SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY agency_id ORDER BY affiliation_id) AS rn
    FROM public.agency_affiliations WHERE affiliation_id IN ('6ed0004c-f0be-4356-b0c8-5d299014fed3','93f87e6d-a6cf-4382-8d74-49f7bfbc3c7e')
      AND agency_id NOT IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '14a99ba0-2ffb-4b64-a800-2ae59fe93d58')) t WHERE rn > 1);
DELETE FROM public.agency_affiliations WHERE affiliation_id IN ('6ed0004c-f0be-4356-b0c8-5d299014fed3','93f87e6d-a6cf-4382-8d74-49f7bfbc3c7e')
  AND agency_id IN (SELECT agency_id FROM public.agency_affiliations WHERE affiliation_id = '14a99ba0-2ffb-4b64-a800-2ae59fe93d58');
UPDATE public.agency_affiliations SET affiliation_id = '14a99ba0-2ffb-4b64-a800-2ae59fe93d58'
  WHERE affiliation_id IN ('6ed0004c-f0be-4356-b0c8-5d299014fed3','93f87e6d-a6cf-4382-8d74-49f7bfbc3c7e');
DELETE FROM public.affiliations WHERE id IN ('6ed0004c-f0be-4356-b0c8-5d299014fed3','93f87e6d-a6cf-4382-8d74-49f7bfbc3c7e');
