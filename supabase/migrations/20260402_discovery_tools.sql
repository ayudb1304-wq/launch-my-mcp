-- Phase 7: Discovery Tools — schema changes for non-API MCP servers

-- 1. Alter mcp_projects: add discovery fields
ALTER TABLE mcp_projects
  ADD COLUMN IF NOT EXISTS product_website TEXT,
  ADD COLUMN IF NOT EXISTS product_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS server_mode TEXT DEFAULT 'discovery'
    CHECK (server_mode IN ('discovery', 'hybrid'));

-- 2. Alter mcp_tools: add discovery tool fields
ALTER TABLE mcp_tools
  ADD COLUMN IF NOT EXISTS tool_type TEXT DEFAULT 'discovery'
    CHECK (tool_type IN ('discovery', 'action')),
  ADD COLUMN IF NOT EXISTS static_response JSONB;
