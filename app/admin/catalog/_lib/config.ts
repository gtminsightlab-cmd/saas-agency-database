/**
 * Catalog editor config — drives the inline editor for the 8 reference tables.
 *
 * Schema gotchas (from migration 0033 + early seed migrations):
 *   - account_types       uses `active` (not is_active), `label` for display
 *   - agency_management_systems uses `active`, `label`, AND has `is_defunct` + `defunct_note`
 *   - affiliations        uses `canonical_name` (not name), and a `type` discriminator
 *   - carriers            uses `name`, has `group_name` + `naic_code`, NO sort_order
 *   - contact_title_roles uses `name`, NO `active` column, has sort_order
 *   - departments         uses `name`, NO `active` column, has sort_order
 *   - location_types      uses `name`, NO `active` column, has sort_order
 *   - sic_codes           uses `sic_code` + `description`, NO `active`, NO sort_order
 *
 * "Used by" sources let us show "N agencies referencing this row" without needing
 * an exhaustive join — the catalog editor warns on inactivating heavily-used rows.
 */

export type ColumnType = "text" | "longtext" | "boolean" | "integer";

export type ColumnDef = {
  key: string;
  label: string;
  type: ColumnType;
  required?: boolean;
  /** Wider input for longer values (e.g. descriptions) */
  wide?: boolean;
  /** Default value for new rows */
  default?: string | number | boolean;
};

export type UsedBySource = {
  /** join/parent table that holds the FK */
  table: string;
  /** column in that table that references catalog.id */
  fkColumn: string;
};

export type CatalogTableConfig = {
  /** URL slug + DB table name */
  table: string;
  /** Display name */
  name: string;
  /** Short description shown above the editor */
  description: string;
  /** Column used as the row's primary label (shown left-most + used in confirmation prompts) */
  primaryColumn: string;
  /** Columns shown in the editor, in order */
  columns: ColumnDef[];
  /** Has an `active` boolean column */
  hasActive: boolean;
  /** Has a `sort_order` integer column */
  hasSortOrder: boolean;
  /** FK references that count as "used by" — first one wins for the badge */
  usedBy?: UsedBySource[];
};

export const CATALOG_TABLES: CatalogTableConfig[] = [
  {
    table: "account_types",
    name: "Account Types",
    description:
      "Agency / MGA / Wholesaler / etc. Drives the Account Type filter on Build List. " +
      "Inactive types are excluded from filters and blocked from new inserts (mig 0033 trigger).",
    primaryColumn: "label",
    columns: [
      { key: "label",       label: "Label",       type: "text",     required: true },
      { key: "code",        label: "Code",        type: "text",     required: true },
      { key: "description", label: "Description", type: "longtext", wide: true },
    ],
    hasActive: true,
    hasSortOrder: true,
    usedBy: [{ table: "agencies", fkColumn: "account_type_id" }],
  },
  {
    table: "location_types",
    name: "Location Types",
    description: "Headquarters / Branch / Satellite — used by the Location Type filter.",
    primaryColumn: "name",
    columns: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "code", label: "Code", type: "text", required: true },
    ],
    hasActive: false,
    hasSortOrder: true,
    usedBy: [{ table: "agencies", fkColumn: "location_type_id" }],
  },
  {
    table: "agency_management_systems",
    name: "Agency Management Systems (AMS)",
    description:
      "AMS vendors used by agencies — Applied Epic, Vertafore AMS360, etc. " +
      "is_defunct flags retired systems (kept for historical mapping).",
    primaryColumn: "label",
    columns: [
      { key: "label",        label: "Label",        type: "text",     required: true },
      { key: "code",         label: "Code",         type: "text",     required: true },
      { key: "vendor",       label: "Vendor",       type: "text" },
      { key: "is_defunct",   label: "Defunct?",     type: "boolean",  default: false },
      { key: "defunct_note", label: "Defunct note", type: "longtext", wide: true },
    ],
    hasActive: true,
    hasSortOrder: true,
    usedBy: [{ table: "agencies", fkColumn: "agency_mgmt_system_id" }],
  },
  {
    table: "carriers",
    name: "Carriers",
    description:
      "Insurance carriers (1,358 rows). NAIC code + group_name support consolidation. " +
      "Vertical mapping is managed in the Verticals module — this page is for canonical row edits only.",
    primaryColumn: "name",
    columns: [
      { key: "name",       label: "Name",       type: "text", required: true },
      { key: "group_name", label: "Group",      type: "text" },
      { key: "naic_code",  label: "NAIC code",  type: "text" },
    ],
    hasActive: true,
    hasSortOrder: false,
    usedBy: [{ table: "agency_carriers", fkColumn: "carrier_id" }],
  },
  {
    table: "affiliations",
    name: "Affiliations / Networks",
    description:
      "Networks, clusters, aggregators (Smart Choice, Iroquois, etc). The `type` " +
      "column distinguishes Network vs Cluster vs Aggregator etc.",
    primaryColumn: "canonical_name",
    columns: [
      { key: "canonical_name", label: "Canonical name", type: "text", required: true },
      { key: "type",           label: "Type",           type: "text", required: true },
    ],
    hasActive: true,
    hasSortOrder: true,
    usedBy: [{ table: "agency_affiliations", fkColumn: "affiliation_id" }],
  },
  {
    table: "sic_codes",
    name: "SIC Codes",
    description: "Standard Industrial Classification codes (1,200 rows). Reference data.",
    primaryColumn: "sic_code",
    columns: [
      { key: "sic_code",    label: "SIC code",    type: "text",     required: true },
      { key: "description", label: "Description", type: "longtext", wide: true },
    ],
    hasActive: false,
    hasSortOrder: false,
    usedBy: [{ table: "agency_sic_codes", fkColumn: "sic_code_id" }],
  },
  {
    table: "departments",
    name: "Departments",
    description:
      "Contact-level department buckets (Personal Lines, Commercial Lines, Claims, etc.). " +
      "Not yet wired to the contacts table — reference data only.",
    primaryColumn: "name",
    columns: [{ key: "name", label: "Name", type: "text", required: true }],
    hasActive: false,
    hasSortOrder: true,
  },
  {
    table: "contact_title_roles",
    name: "Contact Title Roles",
    description:
      "Title-role buckets (Producer, Account Executive, Owner, etc.). " +
      "Not yet wired to the contacts table — reference data only.",
    primaryColumn: "name",
    columns: [{ key: "name", label: "Name", type: "text", required: true }],
    hasActive: false,
    hasSortOrder: true,
  },
];

export function getTableConfig(slug: string): CatalogTableConfig | undefined {
  return CATALOG_TABLES.find((t) => t.table === slug);
}
