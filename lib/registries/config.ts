// Phase 9: Registry definitions and types

export type RegistryId = "smithery" | "mcp_so" | "glama" | "pulsemcp";

export type RegistryStatus =
  | "not_submitted"
  | "submitting"
  | "submitted"
  | "indexed"
  | "error";

export interface RegistryEntry {
  status: RegistryStatus;
  submitted_at: string | null;
  indexed_at: string | null;
  listing_url: string | null;
  error: string | null;
}

export interface PropagationStatus {
  registries: Partial<Record<RegistryId, RegistryEntry>>;
  milestones: {
    first_registry_submitted?: string;
    first_registry_indexed?: string;
  };
}

export interface RegistryConfig {
  id: RegistryId;
  name: string;
  url: string;
  submissionType: "api" | "github_issue" | "auto_index" | "form";
  listingUrlPattern: string; // use {slug} as placeholder
  estimatedIndexingHours: number;
  automatable: boolean;
  requiresPaidPlan: boolean;
  fallbackInstructions?: string;
}

export const REGISTRIES: Record<RegistryId, RegistryConfig> = {
  smithery: {
    id: "smithery",
    name: "Smithery",
    url: "https://smithery.ai",
    submissionType: "api",
    listingUrlPattern: "https://smithery.ai/server/@launchmymcp/{slug}",
    estimatedIndexingHours: 2,
    automatable: true,
    requiresPaidPlan: false, // free plan gets Smithery
  },
  mcp_so: {
    id: "mcp_so",
    name: "mcp.so",
    url: "https://mcp.so",
    submissionType: "github_issue",
    listingUrlPattern: "https://mcp.so/server/{slug}",
    estimatedIndexingHours: 48,
    automatable: true,
    requiresPaidPlan: true,
  },
  glama: {
    id: "glama",
    name: "Glama",
    url: "https://glama.ai",
    submissionType: "auto_index",
    listingUrlPattern: "https://glama.ai/mcp/servers/launchmymcp/{slug}",
    estimatedIndexingHours: 72,
    automatable: false,
    requiresPaidPlan: true,
    fallbackInstructions:
      "Glama auto-indexes MCP servers. Your server will be discovered automatically. You can speed this up by visiting glama.ai/mcp/servers/new and submitting your server URL.",
  },
  pulsemcp: {
    id: "pulsemcp",
    name: "PulseMCP",
    url: "https://www.pulsemcp.com",
    submissionType: "form",
    listingUrlPattern: "https://www.pulsemcp.com/servers/{slug}",
    estimatedIndexingHours: 168, // up to 7 days
    automatable: false,
    requiresPaidPlan: true,
    fallbackInstructions:
      "Visit pulsemcp.com/submit to submit your server. Select 'MCP Server' as the type and paste your server URL.",
  },
};

export const REGISTRY_IDS = Object.keys(REGISTRIES) as RegistryId[];

export const DEFAULT_PROPAGATION_STATUS: PropagationStatus = {
  registries: {},
  milestones: {},
};

/** Get registries available for a given plan */
export function getRegistriesForPlan(
  plan: "free" | "starter" | "super",
): RegistryId[] {
  if (plan === "free") {
    return REGISTRY_IDS.filter((id) => !REGISTRIES[id].requiresPaidPlan);
  }
  return [...REGISTRY_IDS];
}

/** Build the expected listing URL for a project on a registry */
export function getListingUrl(registryId: RegistryId, slug: string): string {
  return REGISTRIES[registryId].listingUrlPattern.replace("{slug}", slug);
}
