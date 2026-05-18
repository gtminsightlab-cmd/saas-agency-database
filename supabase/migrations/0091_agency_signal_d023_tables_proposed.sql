-- ============================================================
-- Migration 0091 — Agency Signal D-023 Tables + Columns
-- ============================================================
--
-- Source: D-023 / ADR-023 (architect strategy review 2026-05-18)
-- Status: APPLIED per Master O Path B decision 2026-05-18
--
-- This migration implements the architect's 6-table proposal as a hybrid:
--   - 3 overlapping shapes (agency_profiles, producer_profiles,
--     agency_carrier_appointments) → ALTER TABLE column-add on existing
--     agencies/contacts/agency_carriers (single source of truth, no
--     dual-write hazard, no JOIN overhead).
--   - 3 genuinely new shapes (saved_list_snapshots, saved_list_changes,
--     distribution_expander_segments) → CREATE TABLE as-is.
--
-- Columns the architect proposed that already exist on the target tables
-- are SKIPPED (website, phone, email, title, full_name, agency_id,
-- carrier_id) — existing columns are reused, not duplicated.
--
-- All new columns are nullable with sensible defaults so existing
-- 32,951 agencies / 135,453 contacts / 264,063 agency_carriers rows
-- are unaffected (no row migration; just NULL/default backfill).
--
-- ============================================================

-- ============================================================
-- 1. Pillar 1 (Agency Directory) — extend public.agencies
--    with verified/claimed-profile columns
-- ============================================================
-- Existing columns reused: web_address (→ website), main_phone/work_phone (→ phone)

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS profile_status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (profile_status IN ('unclaimed', 'pending', 'claimed', 'verified', 'flagged')),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID REFERENCES public.app_users(id),
  ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS agency_summary TEXT,
  ADD COLUMN IF NOT EXISTS specialties TEXT[],
  ADD COLUMN IF NOT EXISTS states_active TEXT[],
  ADD COLUMN IF NOT EXISTS lines_of_business TEXT[],
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0.5
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_agencies_profile_status ON public.agencies(profile_status);
CREATE INDEX IF NOT EXISTS idx_agencies_public_slug ON public.agencies(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_verified ON public.agencies(verified) WHERE verified = true;

COMMENT ON COLUMN public.agencies.profile_status IS 'D-023 Pillar 1 — verified/claimed profile lifecycle';
COMMENT ON COLUMN public.agencies.public_slug IS 'D-023 Pillar 1 — public profile URL slug';
COMMENT ON COLUMN public.agencies.specialties IS 'D-023 Pillar 1 — vertical/niche specialty tags';

-- ============================================================
-- 2. Pillar 2 (Producer Intelligence) — extend public.contacts
--    with verified/claimed-profile columns
-- ============================================================
-- Existing columns reused: title, email_primary/email_secondary, mobile_phone/work_phone,
-- first_name+last_name (no need for separate full_name), agency_id

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS profile_status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (profile_status IN ('unclaimed', 'pending', 'claimed', 'verified', 'flagged')),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS app_user_id UUID REFERENCES public.app_users(id),
  ADD COLUMN IF NOT EXISTS states_active TEXT[],
  ADD COLUMN IF NOT EXISTS specialties TEXT[],
  ADD COLUMN IF NOT EXISTS vertical_focus TEXT[],
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0.5
    CHECK (confidence_score >= 0 AND confidence_score <= 1);

CREATE INDEX IF NOT EXISTS idx_contacts_profile_status ON public.contacts(profile_status);
CREATE INDEX IF NOT EXISTS idx_contacts_verified ON public.contacts(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_contacts_app_user ON public.contacts(app_user_id) WHERE app_user_id IS NOT NULL;

COMMENT ON COLUMN public.contacts.profile_status IS 'D-023 Pillar 2 — verified/claimed producer profile lifecycle';
COMMENT ON COLUMN public.contacts.app_user_id IS 'D-023 Pillar 2 — link to app_users when producer claims their own profile';

-- ============================================================
-- 3. Pillar 3 (Carrier Appointment Intelligence) — extend public.agency_carriers
--    with appointment-shape metadata
-- ============================================================

ALTER TABLE public.agency_carriers
  ADD COLUMN IF NOT EXISTS appointment_status TEXT NOT NULL DEFAULT 'observed'
    CHECK (appointment_status IN ('observed', 'confirmed', 'lapsed', 'unknown')),
  ADD COLUMN IF NOT EXISTS states TEXT[],
  ADD COLUMN IF NOT EXISTS lines_of_business TEXT[],
  ADD COLUMN IF NOT EXISTS verticals TEXT[],
  ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT 0.5
    CHECK (confidence >= 0 AND confidence <= 1),
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS first_observed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_observed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_agency_carriers_appointment_status ON public.agency_carriers(appointment_status);
CREATE INDEX IF NOT EXISTS idx_agency_carriers_verified ON public.agency_carriers(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_agency_carriers_last_observed ON public.agency_carriers(last_observed_at DESC NULLS LAST);

COMMENT ON COLUMN public.agency_carriers.appointment_status IS 'D-023 Pillar 3 — observed/confirmed/lapsed/unknown lifecycle for the appointment';
COMMENT ON COLUMN public.agency_carriers.confidence IS 'D-023 Pillar 3 — 0-1 confidence score for the appointment inference';

-- ============================================================
-- 4. Pillar 6 (Saved List Intelligence) — saved_list_snapshots
-- ============================================================
-- Point-in-time payload capture for change detection. NEW table.

CREATE TABLE IF NOT EXISTS public.saved_list_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  saved_list_id UUID NOT NULL REFERENCES public.saved_lists(id) ON DELETE CASCADE,
  snapshot_payload JSONB NOT NULL,
  agency_count INTEGER,
  contact_count INTEGER,
  appointment_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_list_snapshots_tenant ON public.saved_list_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_snapshots_list ON public.saved_list_snapshots(saved_list_id, created_at DESC);

ALTER TABLE public.saved_list_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_list_snapshots_tenant_select ON public.saved_list_snapshots
  FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY saved_list_snapshots_tenant_modify ON public.saved_list_snapshots
  FOR ALL USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

COMMENT ON TABLE public.saved_list_snapshots IS
  'D-023 Pillar 6 — point-in-time saved-list payload for change detection. BACKLOG #1.';

-- ============================================================
-- 5. Pillar 6 (Saved List Intelligence) — saved_list_changes
-- ============================================================
-- Per-change diff records. NEW table.

CREATE TABLE IF NOT EXISTS public.saved_list_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  saved_list_id UUID NOT NULL REFERENCES public.saved_lists(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL
    CHECK (change_type IN (
      'agency_added', 'agency_removed',
      'contact_added', 'contact_removed', 'contact_changed',
      'appointment_added', 'appointment_removed', 'appointment_changed',
      'stale_detected', 'verified_flag_changed'
    )),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agency', 'contact', 'agency_carrier')),
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_list_changes_tenant ON public.saved_list_changes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_changes_list ON public.saved_list_changes(saved_list_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_list_changes_type ON public.saved_list_changes(change_type);

ALTER TABLE public.saved_list_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_list_changes_tenant_select ON public.saved_list_changes
  FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY saved_list_changes_tenant_modify ON public.saved_list_changes
  FOR ALL USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

COMMENT ON TABLE public.saved_list_changes IS
  'D-023 Pillar 6 — change-detection diff records per saved-list refresh. BACKLOG #1.';

-- ============================================================
-- 6. Pillar 7 (Distribution Expander) — distribution_expander_segments
-- ============================================================
-- Saved Enterprise+ segment definitions with filter shapes. NEW table.

CREATE TABLE IF NOT EXISTS public.distribution_expander_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_by_user_id UUID REFERENCES public.app_users(id),
  segment_name TEXT NOT NULL,
  target_state_codes TEXT[],
  target_verticals TEXT[],
  target_lines_of_business TEXT[],
  agency_size_band TEXT,
  verified_email_required BOOLEAN DEFAULT true,
  filters JSONB NOT NULL,
  estimated_agency_count INTEGER,
  estimated_contact_count INTEGER,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_des_tenant ON public.distribution_expander_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_des_user ON public.distribution_expander_segments(created_by_user_id) WHERE created_by_user_id IS NOT NULL;

ALTER TABLE public.distribution_expander_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY des_tenant_select ON public.distribution_expander_segments
  FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY des_tenant_modify ON public.distribution_expander_segments
  FOR ALL USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

COMMENT ON TABLE public.distribution_expander_segments IS
  'D-023 Pillar 7 — saved Enterprise+ Distribution Expander segments with filter shapes + size estimates.';

-- ============================================================
-- POST-APPLY CHECKLIST
-- ============================================================
-- 1. Run Supabase advisors → expect zero new SECURITY DEFINER warnings
-- 2. Verify RLS on the 3 new tables by attempting cross-tenant SELECT
-- 3. Confirm new columns on agencies/contacts/agency_carriers populate with
--    NULL/default for existing rows (no row migration required)
-- 4. Required follow-on migrations (separate sessions):
--    - customer_entitlements + appointment_attributions in seven16-platform
--      (per BACKLOG #5 + D-015 §7 — Pillar 7 state-level RLS)
--    - credit_consumption_rates in this satellite (per BACKLOG #6 + D-014)
--
-- END MIGRATION 0091
