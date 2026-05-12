"use server";

import { revalidateTag } from "next/cache";

// Next 16 changed revalidateTag(tag, profile) — profile selects which cache
// lifetime tier to clear. 'default' matches all unstable_cache entries
// tagged with this tag regardless of their explicit revalidate value.
const CACHE_PROFILE = "default";

/**
 * Invalidate the build-list reference-data cache.
 *
 * Called by the CatalogEditor after every successful save / delete / toggle
 * so admin changes show up on /build-list immediately instead of waiting
 * for the 1-hour TTL. Cheap operation — just marks the tag as stale; the
 * next request to a cached function with this tag does the actual refetch.
 *
 * Tag is shared by getBuildListFilterData + getVerticalMarkets in
 * lib/cache/build-list-refs.ts.
 */
export async function revalidateBuildListRefs(): Promise<void> {
  revalidateTag("build-list-refs", CACHE_PROFILE);
}

/**
 * Invalidate the verticals reference-data cache (mv_vertical_summary).
 *
 * Catalog edits don't trigger an mv refresh on their own, so this is
 * typically called explicitly by the admin "Refresh verticals" action
 * after running `REFRESH MATERIALIZED VIEW public.mv_vertical_summary`.
 */
export async function revalidateVerticalsRefs(): Promise<void> {
  revalidateTag("verticals-refs", CACHE_PROFILE);
}
