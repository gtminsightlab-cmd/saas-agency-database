-- Fix: import_trucking_accounts was looking up account_types by codes
-- 'BROKER'/'WHOLESALER' which are flagged active=false. The silent-drop
-- trigger fn_block_inactive_account_type() then dropped every row.
-- Map to the active codes instead: 'agency' for retail brokers, 
-- 'agency_wholesaler' for wholesalers/MGAs.

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
  v_input_code text;
  v_active_code text;
  v_reused int := 0;
  v_inserted int := 0;
  v_errors int := 0;
BEGIN
  FOR rec IN SELECT jsonb_array_elements(p_rows)
  LOOP
    BEGIN
      v_external_id := (rec->>'ext')::int;

      IF EXISTS (SELECT 1 FROM public._trucking_load_log WHERE external_id = v_external_id) THEN
        CONTINUE;
      END IF;

      -- map upload's codes to the ACTIVE account_type codes that exist today
      v_input_code := COALESCE(rec->>'account_type_code', 'BROKER');
      v_active_code := CASE
        WHEN v_input_code IN ('WHOLESALER','MGA','agency_wholesaler') THEN 'agency_wholesaler'
        ELSE 'agency'
      END;

      SELECT id INTO v_account_type_id
      FROM public.account_types
      WHERE code = v_active_code AND active = true
      LIMIT 1;

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

        IF v_agency_id IS NULL THEN
          -- trigger silently dropped the row (e.g. inactive type) - log error
          v_errors := v_errors + 1;
          CONTINUE;
        END IF;

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
