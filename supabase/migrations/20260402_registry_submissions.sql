-- Phase 9: Registry Submission & Status Tracking

-- 1. Add propagation_status JSONB to mcp_projects
ALTER TABLE mcp_projects
  ADD COLUMN IF NOT EXISTS propagation_status JSONB DEFAULT '{
    "registries": {},
    "milestones": {}
  }';

-- Example propagation_status structure:
-- {
--   "registries": {
--     "smithery": {
--       "status": "indexed",          -- not_submitted | submitting | submitted | indexed | error
--       "submitted_at": "2026-04-02T...",
--       "indexed_at": "2026-04-02T...",
--       "listing_url": "https://smithery.ai/server/@launchmymcp/my-server",
--       "error": null
--     },
--     "mcp_so": { ... },
--     "glama": { ... },
--     "pulsemcp": { ... }
--   },
--   "milestones": {
--     "first_registry_submitted": "2026-04-02T...",
--     "first_registry_indexed": "2026-04-02T..."
--   }
-- }

-- 2. Index for finding projects with pending registry checks
CREATE INDEX IF NOT EXISTS idx_mcp_projects_propagation_status
  ON mcp_projects USING gin (propagation_status);
