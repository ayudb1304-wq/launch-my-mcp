## Phase 12: Connect API & Action Tools (Hybrid MCP Servers)

**Goal:** Let users connect their real API so MCP tools can perform actual actions (create invoice, search products, fetch data) — not just return static product info. This is the upgrade path from discovery-only servers to fully functional MCP servers, and the primary reason users pay for Starter/Super plans.
**Depends on:** Phase 7 (Discovery Tools) complete
**Priority:** After Phase 9 (Registry Submission) — registry gets servers discovered, this phase makes discovered servers genuinely useful.

### Why This Phase Matters

Discovery tools answer "what is your product?" — but action tools answer "do something with your product." When Claude calls `create_invoice` and it actually creates an invoice in the user's system via their API, that's undeniable value. That's the moment a user never churns. Without this, we're selling a product directory with extra steps.

### 12.1 Database Migration

- [ ] Alter `mcp_projects`: add `api_base_url` TEXT (already nullable from Phase 7), `api_auth_type` TEXT DEFAULT 'none' CHECK (api_auth_type IN ('api_key', 'bearer', 'basic', 'none')), `api_key_header` TEXT DEFAULT 'Authorization', `api_key_encrypted` TEXT
- [ ] Create `lib/encryption.ts` — encrypt/decrypt API keys using `AES-256-GCM` with `ENCRYPTION_SECRET` env var. Keys are encrypted at rest, decrypted only at request time in the MCP handler.
- [ ] Add `ENCRYPTION_SECRET` to `.env.local` and Vercel env vars

### 12.2 Connect API Dashboard Page

**Route:** `app/(app)/dashboard/[projectId]/connect-api/page.tsx`

This is accessed from the "Connect your API" placeholder card already in the project detail page (added in Phase 7).

**Page layout — 2 sections:**

**Section 1: API Connection Form**
- [ ] `components/dashboard/ConnectAPIForm.tsx` — form with:
  - `api_base_url` — URL input, required. Label: "Your API base URL". Placeholder: "https://api.yourproduct.com/v1". Tooltip: "The root URL of your REST API. All tool endpoints will be appended to this."
  - `api_auth_type` — Radio group: "No Auth" / "API Key" / "Bearer Token" / "Basic Auth". Default: "No Auth"
  - If API Key selected: `api_key_header` text input (default "X-API-Key") + `api_key_value` password input
  - If Bearer selected: `api_key_value` password input (header auto-set to "Authorization: Bearer {key}")
  - If Basic Auth selected: `username` + `password` inputs (combined to Base64 Authorization header)
  - "Test Connection" button — calls `POST /api/projects/[projectId]/test-connection` which sends a HEAD request to `api_base_url` with provided credentials, returns success/fail + status code + latency
  - Connection status indicator: untested (gray) / success (green badge "Connected") / failed (red badge with error message)
  - "Save & Connect" button — saves credentials, updates `server_mode` to 'hybrid'

**Section 2: Add Action Tools**
Only shown after API is connected successfully.
- [ ] `components/dashboard/ActionToolBuilder.tsx` — interface to add action tools to an existing project:
  - "Generate from API" button — user describes what their API can do in a textarea, AI generates action tool definitions (reuses generator with action-mode prompt)
  - Manual tool builder — form with: tool name, description, HTTP method (GET/POST/PUT/DELETE dropdown), endpoint path (text, relative to base URL), input parameters (dynamic list: name, type, description, required checkbox), output description
  - Each new tool gets `tool_type: 'action'` and `endpoint_path` + `http_method` populated
  - Preview panel showing the tool definition as the user builds it
  - "Add Tool" saves to `mcp_tools` table
- [ ] Existing discovery tools remain unchanged — the project now has BOTH discovery and action tools (hybrid mode)
- [ ] Show all tools in a combined list with type badges: "Discovery" (info icon) / "Action" (zap icon)

### 12.3 API Routes

- [ ] `app/api/projects/[projectId]/connect-api/route.ts` — POST: validate + encrypt + save API credentials to `mcp_projects`, set `server_mode` to 'hybrid'
- [ ] `app/api/projects/[projectId]/test-connection/route.ts` — POST: attempt HEAD/GET request to `api_base_url` with provided auth, return status + latency. Timeout after 10s. Do NOT store credentials on test — only on save.
- [ ] `app/api/projects/[projectId]/add-tool/route.ts` — POST: save new action tool to `mcp_tools` with `tool_type: 'action'`. Validate that project has API connected (`server_mode === 'hybrid'`).
- [ ] `app/api/projects/[projectId]/generate-actions/route.ts` — POST: takes a text description of what the API can do, calls Claude to generate action tool definitions (similar to onboard analyze, but action-mode prompt). Returns tool suggestions for user to review before saving.

### 12.4 MCP Server Handler Update

Update `app/api/mcp/[slug]/[transport]/route.ts` to proxy action tool calls to the user's real API.

- [ ] Load project with API credentials: update select query to include `api_base_url`, `api_auth_type`, `api_key_header`, `api_key_encrypted`, `server_mode`
- [ ] Add `lib/mcp/api-proxy.ts` — the core proxy logic:

```typescript
// Conceptual implementation
async function proxyToUserAPI(
  project: MCPProject,
  tool: MCPTool,
  args: Record<string, unknown>
): Promise<unknown> {
  // 1. Decrypt API key
  const apiKey = decrypt(project.api_key_encrypted, process.env.ENCRYPTION_SECRET);
  
  // 2. Build the request URL
  // Replace path parameters: "/invoices/{id}" + { id: "123" } → "/invoices/123"
  let path = tool.endpoint_path;
  for (const [key, value] of Object.entries(args)) {
    path = path.replace(`{${key}}`, String(value));
  }
  const url = `${project.api_base_url}${path}`;
  
  // 3. Build headers based on auth type
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (project.api_auth_type === 'api_key') {
    headers[project.api_key_header] = apiKey;
  } else if (project.api_auth_type === 'bearer') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (project.api_auth_type === 'basic') {
    headers['Authorization'] = `Basic ${apiKey}`; // already base64 encoded on save
  }
  
  // 4. Build request options
  const fetchOptions: RequestInit = {
    method: tool.http_method || 'GET',
    headers,
  };
  
  // For POST/PUT/PATCH — send remaining args (non-path-params) as JSON body
  if (['POST', 'PUT', 'PATCH'].includes(tool.http_method || '')) {
    // Filter out args that were used as path parameters
    const bodyArgs = { ...args };
    for (const key of Object.keys(args)) {
      if (tool.endpoint_path.includes(`{${key}}`)) {
        delete bodyArgs[key];
      }
    }
    fetchOptions.body = JSON.stringify(bodyArgs);
  }
  
  // 5. Make the request with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timeout);
    
    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        message: `API returned ${response.status}: ${response.statusText}`,
      };
    }
    
    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    return { result: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] Update the tool handler in the MCP route to use the proxy:

```typescript
if (tool.tool_type === 'discovery' && tool.static_response) {
  responseData = tool.static_response;
} else if (tool.tool_type === 'action' && project.server_mode === 'hybrid') {
  responseData = await proxyToUserAPI(project, tool, args);
} else if (tool.tool_type === 'action') {
  responseData = {
    message: `This tool requires API connection. The product owner can enable it at ${project.product_website || 'their dashboard'}.`,
  };
}
```

### 12.5 Security Considerations

- [ ] API keys encrypted with AES-256-GCM, never logged, never returned to frontend after save
- [ ] Test connection endpoint does NOT store credentials — only the save endpoint does
- [ ] Proxy requests have a 15s timeout to prevent hanging
- [ ] Rate limit proxy requests per project: max 100 calls/minute to protect user's API from abuse
- [ ] Never forward user-agent or client IP to the downstream API — anonymize
- [ ] Log proxy errors to `discovery_events` with `status: 'error'` for dashboard visibility
- [ ] Dashboard shows a warning if action tools have high error rates: "Your API returned errors on 40% of calls this week. Check your endpoint configuration."

### 12.6 Dashboard Integration

- [ ] Update `components/dashboard/ProjectDetail.tsx`:
  - If `server_mode === 'discovery'`: show "Connect your API" card prominently (already exists from Phase 7)
  - If `server_mode === 'hybrid'`: show API connection status (green "Connected to api.example.com"), tool count by type ("3 Discovery tools, 2 Action tools"), and a "Manage API" link
  - Discovery events feed now shows tool type icon next to each event so user can see which calls are discovery vs action
- [ ] Update `components/dashboard/MCPServerCard.tsx`: show server mode badge ("Discovery" or "Hybrid") on the card

### 12.7 AI Generation — Action Mode Prompt

New prompt variant in `lib/mcp/generator.ts` for generating action tools (used by the dashboard "Generate from API" flow, NOT the onboarding wizard):

```
You are an expert at creating MCP action tool definitions.
Given an API description, generate tools that let AI assistants perform real actions.

These are ACTION tools — they make real HTTP requests to the user's API.

Rules:
1. Tool names: snake_case, action-oriented: create_invoice, search_customers, update_order
2. Descriptions written FOR AI ASSISTANTS: "Call this tool when the user wants to create a new invoice for a client."
3. Generate 3-5 action tools.
4. Each tool needs: http_method (GET/POST/PUT/DELETE), endpoint_path (relative, can include {param} placeholders)
5. Input schemas must include all required parameters with clear types and descriptions.
6. Endpoint paths should be RESTful: /invoices, /invoices/{id}, /customers/search

Output format (JSON array, no markdown):
[
  {
    "name": "create_invoice",
    "description": "AI-facing description",
    "tool_type": "action",
    "http_method": "POST",
    "endpoint_path": "/invoices",
    "input_schema": {
      "type": "object",
      "properties": {
        "client_name": { "type": "string", "description": "Name of the client" },
        "amount": { "type": "number", "description": "Invoice amount in USD" }
      },
      "required": ["client_name", "amount"]
    },
    "output_description": "Returns the created invoice object with ID and status"
  }
]
```

### Phase 12 Deliverable
> Users can connect their real API from the dashboard, add action tools that proxy to their endpoints, and have AI assistants perform real actions through their MCP server. Discovery tools continue working alongside action tools. API keys are encrypted at rest. Hybrid servers show both tool types in the dashboard.

---

### Execution Order Recommendation

**Do Phase 9 (Registry Submission) BEFORE this phase.** Registry submission gets servers discoverable. This phase makes discovered servers more useful. Without Phase 9, there's nothing for action tools to enhance — nobody's finding the servers yet.

Recommended build order for remaining phases:
1. **Phase 9** (Registry & SEO) — gets servers listed, enables dogfooding with real discovery events
2. **Phase 12** (Connect API) — upgrade path, justifies paid plans
3. **Phase 8** (Email Sequences) — lifecycle emails only matter once we have users
4. **Phase 10** (Polish & Launch) — Product Hunt and public launch
