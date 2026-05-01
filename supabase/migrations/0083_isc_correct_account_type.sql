
-- Per Master O 2026-04-27: ISC (Integrated Specialty Coverages) is an MGA/wholesaler,
-- not a retail agency. Fix its account_type from 'agency' to 'agency_wholesaler'.
UPDATE agencies
SET 
  account_type_id = (SELECT id FROM account_types WHERE code = 'agency_wholesaler'),
  updated_at = now()
WHERE id = '55f1a303-53fd-4dbe-960b-8a10b84eed9f';

-- Verify
SELECT a.name, at.code AS account_type
FROM agencies a
JOIN account_types at ON at.id = a.account_type_id
WHERE a.id = '55f1a303-53fd-4dbe-960b-8a10b84eed9f';
