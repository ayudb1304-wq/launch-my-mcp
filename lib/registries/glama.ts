// Glama registry adapter — auto-indexes from GitHub, manual submission fallback

import { RegistrySubmissionPayload } from "./build-payload";
import { getListingUrl } from "./config";

const API_BASE = "https://glama.ai/api/mcp/v1";
const NAMESPACE = "launchmymcp";

interface GlamaResult {
  success: boolean;
  listingUrl?: string;
  error?: string;
  manual: boolean;
}

/**
 * Glama has no write API — auto-indexes from GitHub.
 * We return a manual submission result with instructions.
 */
export async function submit(
  payload: RegistrySubmissionPayload,
): Promise<GlamaResult> {
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
    success: true, // not an error, just manual
    listingUrl: getListingUrl("glama", payload.slug),
    manual: true,
    error: undefined,
  };
}

export async function checkIndexed(
  slug: string,
): Promise<{ indexed: boolean; listingUrl?: string }> {
  try {
    const res = await fetch(`${API_BASE}/servers/${NAMESPACE}/${slug}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        return {
          indexed: true,
          listingUrl: getListingUrl("glama", slug),
        };
      }
    }
    return { indexed: false };
  } catch {
    return { indexed: false };
  }
}
