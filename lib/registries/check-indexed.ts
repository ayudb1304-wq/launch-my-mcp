// Per-registry indexing verification

import { createAdminClient } from "@/lib/supabase/admin";
import {
  type RegistryId,
  type PropagationStatus,
  DEFAULT_PROPAGATION_STATUS,
} from "./config";
import * as smithery from "./smithery";
import * as mcpSo from "./mcp-so";
import * as glama from "./glama";
import * as pulsemcp from "./pulsemcp";

const checkers: Record<
  RegistryId,
  (slug: string) => Promise<{ indexed: boolean; listingUrl?: string }>
> = {
  smithery: smithery.checkIndexed,
  mcp_so: mcpSo.checkIndexed,
  glama: glama.checkIndexed,
  pulsemcp: pulsemcp.checkIndexed,
};

/** Check if a project is indexed on a specific registry and update status */
export async function checkAndUpdateRegistry(
  projectId: string,
  registryId: RegistryId,
): Promise<{ indexed: boolean; listingUrl?: string }> {
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("mcp_projects")
    .select("slug, propagation_status")
    .eq("id", projectId)
    .single();

  if (!project) return { indexed: false };

  const result = await checkers[registryId](project.slug);
  const propagation: PropagationStatus =
    project.propagation_status || DEFAULT_PROPAGATION_STATUS;

  const entry = propagation.registries[registryId];
  if (!entry) return result;

  if (result.indexed && entry.status !== "indexed") {
    const now = new Date().toISOString();
    entry.status = "indexed";
    entry.indexed_at = now;
    entry.listing_url = result.listingUrl || entry.listing_url;

    if (!propagation.milestones.first_registry_indexed) {
      propagation.milestones.first_registry_indexed = now;
    }

    await supabase
      .from("mcp_projects")
      .update({ propagation_status: propagation })
      .eq("id", projectId);
  }

  return result;
}

/** Check all submitted (not yet indexed) registries for a project */
export async function checkAllRegistries(
  projectId: string,
): Promise<Record<string, { indexed: boolean; listingUrl?: string }>> {
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("mcp_projects")
    .select("slug, propagation_status")
    .eq("id", projectId)
    .single();

  if (!project) return {};

  const propagation: PropagationStatus =
    project.propagation_status || DEFAULT_PROPAGATION_STATUS;

  // Only check registries that are submitted but not yet indexed
  const toCheck = Object.entries(propagation.registries)
    .filter(([, entry]) => entry.status === "submitted")
    .map(([id]) => id as RegistryId);

  const results: Record<string, { indexed: boolean; listingUrl?: string }> = {};

  for (const registryId of toCheck) {
    results[registryId] = await checkAndUpdateRegistry(projectId, registryId);
  }

  return results;
}
