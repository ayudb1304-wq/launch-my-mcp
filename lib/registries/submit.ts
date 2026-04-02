// Main submission orchestrator — coordinates registry submissions and status updates

import { createAdminClient } from "@/lib/supabase/admin";
import { buildSubmissionPayload } from "./build-payload";
import {
  type RegistryId,
  type RegistryEntry,
  type PropagationStatus,
  REGISTRIES,
  REGISTRY_IDS,
  DEFAULT_PROPAGATION_STATUS,
  getRegistriesForPlan,
} from "./config";
import * as smithery from "./smithery";
import * as mcpSo from "./mcp-so";
import * as glama from "./glama";
import * as pulsemcp from "./pulsemcp";

const adapters: Record<
  RegistryId,
  {
    submit: (
      payload: Parameters<typeof smithery.submit>[0],
    ) => Promise<{ success: boolean; listingUrl?: string; error?: string }>;
  }
> = {
  smithery,
  mcp_so: mcpSo,
  glama,
  pulsemcp,
};

export interface SubmissionResult {
  registryId: RegistryId;
  success: boolean;
  listingUrl?: string;
  error?: string;
  manual?: boolean;
}

/** Submit a project to a single registry */
export async function submitToRegistry(
  projectId: string,
  registryId: RegistryId,
): Promise<SubmissionResult> {
  const supabase = createAdminClient();

  // Fetch project + tools
  const { data: project, error: projErr } = await supabase
    .from("mcp_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return { registryId, success: false, error: "Project not found" };
  }

  const { data: tools } = await supabase
    .from("mcp_tools")
    .select("*")
    .eq("project_id", projectId)
    .eq("enabled", true);

  // Build payload
  const payload = buildSubmissionPayload(project, tools || []);

  // Update status to submitting
  const propagation: PropagationStatus =
    project.propagation_status || DEFAULT_PROPAGATION_STATUS;

  propagation.registries[registryId] = {
    status: "submitting",
    submitted_at: null,
    indexed_at: null,
    listing_url: null,
    error: null,
  };

  await supabase
    .from("mcp_projects")
    .update({ propagation_status: propagation })
    .eq("id", projectId);

  // Submit
  const adapter = adapters[registryId];
  const result = await adapter.submit(payload);

  // Update status based on result
  const now = new Date().toISOString();
  const entry: RegistryEntry = {
    status: result.success ? "submitted" : "error",
    submitted_at: result.success ? now : null,
    indexed_at: null,
    listing_url: result.listingUrl || null,
    error: result.error || null,
  };

  propagation.registries[registryId] = entry;

  // Set milestone if this is the first submission
  if (result.success && !propagation.milestones.first_registry_submitted) {
    propagation.milestones.first_registry_submitted = now;
  }

  await supabase
    .from("mcp_projects")
    .update({ propagation_status: propagation })
    .eq("id", projectId);

  return { registryId, ...result };
}

/** Submit a project to all registries available for the user's plan */
export async function submitToAllRegistries(
  projectId: string,
  plan: "free" | "starter" | "super",
): Promise<SubmissionResult[]> {
  const supabase = createAdminClient();

  // Get current propagation status to skip already submitted/indexed
  const { data: project } = await supabase
    .from("mcp_projects")
    .select("propagation_status")
    .eq("id", projectId)
    .single();

  const propagation: PropagationStatus =
    project?.propagation_status || DEFAULT_PROPAGATION_STATUS;

  const availableRegistries = getRegistriesForPlan(plan);

  // Filter out already submitted/indexed registries and non-automatable ones
  const toSubmit = availableRegistries.filter((id) => {
    if (!REGISTRIES[id].automatable) return false;
    const existing = propagation.registries[id];
    return !existing || existing.status === "not_submitted" || existing.status === "error";
  });

  // Submit sequentially to avoid rate limits
  const results: SubmissionResult[] = [];
  for (const registryId of toSubmit) {
    const result = await submitToRegistry(projectId, registryId);
    results.push(result);
  }

  return results;
}

/** Get registries that require manual submission for a project */
export function getManualRegistries(): RegistryId[] {
  return REGISTRY_IDS.filter((id) => !REGISTRIES[id].automatable);
}
