
-- Migration 0082: Wire 13 strategic wholesalers to Berkley distribution carriers (1-75 PU + umbrella)
-- Per Master O 2026-04-27: WR Berkley uses 14 strategic wholesalers (CRC, RPS, Burns & Wilcox, ISC MGA,
-- Amwins, First Light, Great Lakes, Maximum, Truckers Insurance, RT Specialty, XPT, Blueridge, Arlington Roe, JM Wilson)
-- to distribute Berkley Small Business (1-14 PU), Berkley Prime Transportation (15-75 PU),
-- and Berkley National Insurance Company (1-100+ umbrella).
-- ISC MGA is NOT yet loaded in agencies — to be added when retail/MGA load runs.
-- Carolina Casualty (75+ PU) distribution channels not yet specified — appointments deferred.

WITH wholesalers (agency_id, label) AS (
  VALUES
    ('08a20a8d-8deb-495c-9504-67df23a1ad75'::uuid, 'CRC Group'),
    ('aa7400d1-c16d-4485-aee7-ca52b5c15266'::uuid, 'Risk Placement Services (RPS)'),
    ('9f26aa0d-8994-4085-b622-7b5e1f3149ae'::uuid, 'Burns & Wilcox LTD'),
    ('347e4165-6b06-4819-8172-892acf3a69df'::uuid, 'Amwins'),
    ('1af39e21-53d9-4ee1-9a21-7ebbe87b2f4a'::uuid, 'Specialty Insurance Managers (First Light Programs)'),
    ('a8f7f03c-5956-4ac2-8378-306540cea6a7'::uuid, 'Great Lakes General Agency'),
    ('6d2a3a95-d3de-4a9c-9053-9c79ffeec3bd'::uuid, 'Maximum Independent Brokerage'),
    ('af90549a-a98e-4aeb-b348-037af7d751da'::uuid, 'Truckers Insurance Associates'),
    ('77ef0f2a-c601-4613-a9c7-8a758cde0c43'::uuid, 'RT Specialty (Ryan Specialty)'),
    ('73ae01c9-93ff-4306-9e93-d14890573823'::uuid, 'XPT Specialty (XPT Group)'),
    ('1a4f634d-6a05-4216-99d5-9f6624f9c531'::uuid, 'Blue Ridge Specialty, LLC'),
    ('a724e136-e69e-4515-add4-4ffa3b5383ca'::uuid, 'Arlington/Roe & Co'),
    ('2f28af3c-b710-46fd-be75-eb06c9efd810'::uuid, 'J.M. Wilson Corporation')
),
carriers_3 (carrier_id, label) AS (
  VALUES
    ('f52ffb2a-867a-4313-8bd6-1c2159a5f35f'::uuid, 'Berkley Small Business 1-14 PU non-fleet'),
    ('dee3db30-cee4-4f61-aed6-47a636384fb8'::uuid, 'Berkley Prime Transportation 15-75 PU mid-fleet'),
    ('8447be61-6b74-4542-9f6c-6445e93a72ed'::uuid, 'Berkley National 1-100+ umbrella')
),
target AS (
  SELECT 
    'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid AS tenant_id,
    w.agency_id, 
    c.carrier_id,
    'distributes ' || c.label || ' (per Master O 2026-04-27, strategic wholesaler channel)' AS notes
  FROM wholesalers w
  CROSS JOIN carriers_3 c
)
INSERT INTO agency_carriers (tenant_id, agency_id, carrier_id, relationship_type, notes)
SELECT t.tenant_id, t.agency_id, t.carrier_id, 'appointed', t.notes
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM agency_carriers ac
  WHERE ac.agency_id = t.agency_id AND ac.carrier_id = t.carrier_id
);

-- Refresh the materialized vertical summary so /verticals counts pick up new appointments
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vertical_summary;
