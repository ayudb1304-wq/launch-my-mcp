// Smithery registry adapter — uses REST API for publishing

import { RegistrySubmissionPayload } from "./build-payload";
import { getListingUrl } from "./config";

const API_BASE = "https://api.smithery.ai";
const REGISTRY_BASE = "https://registry.smithery.ai";
const NAMESPACE = process.env.SMITHERY_NAMESPACE || "launchmymcp";

interface SmitheryResult {
  success: boolean;
  listingUrl?: string;
  error?: string;
}

export async function submit(
  payload: RegistrySubmissionPayload,
): Promise<SmitheryResult> {
  const apiKey = process.env.SMITHERY_API_KEY;
  if (!apiKey) {
    return { success: false, error: "SMITHERY_API_KEY not configured" };
  }

  const qualifiedName = `${NAMESPACE}/${payload.slug}`;

  try {
    // Step 1: Create the server (idempotent PUT)
    const createRes = await fetch(
      `${API_BASE}/servers/${qualifiedName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: payload.name,
          description: payload.description,
          homepage: payload.homepage,
        }),
      },
    );

    if (!createRes.ok && createRes.status !== 409) {
      const err = await createRes.text();
      return {
        success: false,
        error: `Smithery create failed (${createRes.status}): ${err}`,
      };
    }

    // Step 2: Publish an external release pointing to our MCP endpoint
    const formData = new FormData();
    formData.append("type", "external");
    formData.append("url", payload.serverUrl);

    const releaseRes = await fetch(
      `${API_BASE}/servers/${qualifiedName}/releases`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      },
    );

    if (!releaseRes.ok) {
      const err = await releaseRes.text();
      return {
        success: false,
        error: `Smithery release failed (${releaseRes.status}): ${err}`,
      };
    }

    return {
      success: true,
      listingUrl: getListingUrl("smithery", payload.slug),
    };
  } catch (err) {
    return {
      success: false,
      error: `Smithery submission error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function checkIndexed(
  slug: string,
): Promise<{ indexed: boolean; listingUrl?: string }> {
  try {
    const res = await fetch(
      `${REGISTRY_BASE}/servers/${NAMESPACE}/${slug}`,
      { signal: AbortSignal.timeout(10_000) },
    );

    if (res.ok) {
      return {
        indexed: true,
        listingUrl: getListingUrl("smithery", slug),
      };
    }
    return { indexed: false };
  } catch {
    return { indexed: false };
  }
}
