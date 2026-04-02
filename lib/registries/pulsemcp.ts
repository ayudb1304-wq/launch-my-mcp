// PulseMCP registry adapter — web form submission, no write API

import { RegistrySubmissionPayload } from "./build-payload";
import { getListingUrl } from "./config";

interface PulseMCPResult {
  success: boolean;
  listingUrl?: string;
  error?: string;
  manual: boolean;
}

/**
 * PulseMCP has no write API (read-only aggregator).
 * Auto-discovers servers from monitored sources.
 * Manual submission via pulsemcp.com/submit (2 fields: type + URL).
 */
export async function submit(
  payload: RegistrySubmissionPayload,
): Promise<PulseMCPResult> {
  // Check if already indexed first
  const check = await checkIndexed(payload.slug);
  if (check.indexed) {
    return {
      success: true,
      listingUrl: check.listingUrl,
      manual: false,
    };
  }

  // No write API — return manual instructions
  return {
    success: true,
    listingUrl: getListingUrl("pulsemcp", payload.slug),
    manual: true,
    error: undefined,
  };
}

export async function checkIndexed(
  slug: string,
): Promise<{ indexed: boolean; listingUrl?: string }> {
  try {
    const url = getListingUrl("pulsemcp", slug);
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      return { indexed: true, listingUrl: url };
    }
    return { indexed: false };
  } catch {
    return { indexed: false };
  }
}
