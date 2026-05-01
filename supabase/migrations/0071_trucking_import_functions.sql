-- Server-side import functions for the Master Trucking Insurance Database
-- upload. Three functions accept JSONB arrays so we can do the whole load
-- in 3-4 round trips instead of thousands of per-row INSERTs.
--
-- Shared state: _trucking_load_log table maps the upload's external
-- AccountId (1000..2401) to the agency_id we end up using (existing-reuse
-- or newly-inserted). Subsequent functions (appointments, contacts) read
-- this table to resolve the FK target.

CREATE TABLE IF NOT EXISTS public._trucking_load_log (
  external_id      int  PRIMARY KEY,
  agency_id        uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  action           text NOT NULL CHECK (action IN ('reused','inserted')),
  loaded_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- import_trucking_accounts: upsert agencies, populate _trucking_load_log
-- Input shape (jsonb array of objects):
--   [{ "ext": 1000, "name":"Amwins...", "city":"Charlotte", "state":"NC",
--      "country":"USA", "address_1":"...", "postal_code":"28210",
--      "phone":"...", "web":"...", "email":"...", "linkedin":"...",
--      "account_type_code":"WHOLESALER" | "BROKER" }, ...]
-- ============================================================================
CREATE OR REPLACE FUNCTION public.import_trucking_accounts(p_rows jsonb)
RETURNS TABLE (
  reused   int,
  inserted int,
  errors   int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seed_tenant uuid := 'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid;
  rec jsonb;
  v_external_id int;
  v_agency_id uuid;
  v_account_type_id uuid;
  v_reused int := 0;
  v_inserted int := 0;
  v_errors int := 0;
BEGIN
  FOR rec IN SELECT jsonb_array_elements(p_rows)
  LOOP
    BEGIN
      v_external_id := (rec->>'ext')::int;

      -- skip if already loaded
      IF EXISTS (SELECT 1 FROM public._trucking_load_log WHERE external_id = v_external_id) THEN
        CONTINUE;
      END IF;

      -- resolve account_type_id from code
      SELECT id INTO v_account_type_id
      FROM public.account_types
      WHERE code = COALESCE(rec->>'account_type_code', 'BROKER')
      LIMIT 1;

      -- Try to match an existing agency on (lower(name), upper(city), upper(state))
      SELECT a.id INTO v_agency_id
      FROM public.agencies a
      WHERE lower(btrim(a.name))  = lower(btrim(rec->>'name'))
        AND upper(btrim(a.city))  = upper(btrim(COALESCE(rec->>'city','')))
        AND upper(btrim(a.state)) = upper(btrim(COALESCE(rec->>'state','')))
      LIMIT 1;

      IF v_agency_id IS NOT NULL THEN
        INSERT INTO public._trucking_load_log (external_id, agency_id, action)
          VALUES (v_external_id, v_agency_id, 'reused');
        v_reused := v_reused + 1;
      ELSE
        INSERT INTO public.agencies (
          tenant_id, name, address_1, city, state, postal_code, country,
          main_phone, web_address, email, linkedin_url,
          account_type_id
        ) VALUES (
          v_seed_tenant,
          NULLIF(btrim(rec->>'name'), ''),
          NULLIF(btrim(rec->>'address_1'), ''),
          NULLIF(btrim(rec->>'city'), ''),
          NULLIF(btrim(rec->>'state'), ''),
          NULLIF(btrim(rec->>'postal_code'), ''),
          NULLIF(btrim(COALESCE(rec->>'country', 'USA')), ''),
          NULLIF(btrim(rec->>'phone'), ''),
          NULLIF(btrim(rec->>'web'), ''),
          NULLIF(btrim(rec->>'email'), ''),
          NULLIF(btrim(rec->>'linkedin'), ''),
          v_account_type_id
        )
        RETURNING id INTO v_agency_id;

        INSERT INTO public._trucking_load_log (external_id, agency_id, action)
          VALUES (v_external_id, v_agency_id, 'inserted');
        v_inserted := v_inserted + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_reused, v_inserted, v_errors;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_trucking_accounts(jsonb) TO authenticated;

-- ============================================================================
-- import_trucking_appointments: insert agency_carriers rows
-- Input shape:
--   [{"ext": 1000, "carrier_id":"<uuid>"}, ...]
-- ============================================================================
CREATE OR REPLACE FUNCTION public.import_trucking_appointments(p_rows jsonb)
RETURNS TABLE (
  inserted int,
  skipped  int,
  errors   int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seed_tenant uuid := 'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid;
  rec jsonb;
  v_external_id int;
  v_agency_id uuid;
  v_carrier_id uuid;
  v_inserted int := 0;
  v_skipped int := 0;
  v_errors int := 0;
BEGIN
  FOR rec IN SELECT jsonb_array_elements(p_rows)
  LOOP
    BEGIN
      v_external_id := (rec->>'ext')::int;
      v_carrier_id  := (rec->>'carrier_id')::uuid;

      SELECT agency_id INTO v_agency_id
      FROM public._trucking_load_log
      WHERE external_id = v_external_id;

      IF v_agency_id IS NULL THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;

      -- Skip if already there
      IF EXISTS (
        SELECT 1 FROM public.agency_carriers
         WHERE agency_id = v_agency_id AND carrier_id = v_carrier_id
      ) THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;

      INSERT INTO public.agency_carriers (tenant_id, agency_id, carrier_id, relationship_type, notes)
      VALUES (v_seed_tenant, v_agency_id, v_carrier_id, 'appointed', 'imported from trucking master 2026-04-26');
      v_inserted := v_inserted + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_inserted, v_skipped, v_errors;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_trucking_appointments(jsonb) TO authenticated;

-- ============================================================================
-- import_trucking_contacts: insert contacts linked to imported agencies
-- Input shape:
--   [{"ext":1000, "first":"Justin", "last":"Joyce", "title":"...",
--     "email":"...", "mobile":"...", "work":"...", "linkedin":"...",
--     "is_primary": true, "department":"Trucking"}, ...]
-- ============================================================================
CREATE OR REPLACE FUNCTION public.import_trucking_contacts(p_rows jsonb)
RETURNS TABLE (
  inserted int,
  skipped  int,
  errors   int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seed_tenant uuid := 'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid;
  rec jsonb;
  v_external_id int;
  v_agency_id uuid;
  v_inserted int := 0;
  v_skipped int := 0;
  v_errors int := 0;
BEGIN
  FOR rec IN SELECT jsonb_array_elements(p_rows)
  LOOP
    BEGIN
      v_external_id := (rec->>'ext')::int;

      SELECT agency_id INTO v_agency_id
      FROM public._trucking_load_log
      WHERE external_id = v_external_id;

      IF v_agency_id IS NULL THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;

      INSERT INTO public.contacts (
        tenant_id, agency_id, is_primary,
        first_name, last_name, title, department,
        email_primary, mobile_phone, work_phone
      ) VALUES (
        v_seed_tenant,
        v_agency_id,
        COALESCE((rec->>'is_primary')::boolean, false),
        NULLIF(btrim(rec->>'first'), ''),
        NULLIF(btrim(rec->>'last'), ''),
        NULLIF(btrim(rec->>'title'), ''),
        NULLIF(btrim(rec->>'department'), ''),
        NULLIF(btrim(rec->>'email'), ''),
        NULLIF(btrim(rec->>'mobile'), ''),
        NULLIF(btrim(rec->>'work'), '')
      );
      v_inserted := v_inserted + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_inserted, v_skipped, v_errors;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_trucking_contacts(jsonb) TO authenticated;
