# MCPLaunch — Product Requirements Document
**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Ready for Development  
**Audience:** Claude Code / AI-assisted development

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Core User Journey](#4-core-user-journey)
5. [Tech Stack](#5-tech-stack)
6. [Database Schema](#6-database-schema)
7. [Feature Specifications](#7-feature-specifications)
8. [Landing Page Specification](#8-landing-page-specification)
9. [API Specification](#9-api-specification)
10. [Authentication & Billing](#10-authentication--billing)
11. [SEO & ASO Strategy](#11-seo--aso-strategy)
12. [File & Folder Structure](#12-file--folder-structure)
13. [Environment Variables](#13-environment-variables)
14. [Launch Checklist](#14-launch-checklist)

---

## 1. Product Vision

**MCPLaunch** turns any software product's API into a hosted Model Context Protocol (MCP) server — so AI assistants like Claude and ChatGPT discover and use the product organically, replacing expensive paid ads with zero-CAC AI-driven distribution.

**One-line pitch:** *"Get your product discovered by AI assistants. No ads. No engineers. 5 minutes."*

**Core insight:** In the AI era, being cited by Claude/ChatGPT/Perplexity is the new SEO rank #1. MCP servers are the mechanism. Most indie builders have no idea how to build one.

---

## 2. Problem Statement

- Indie SaaS founders spend $80–200 per acquired customer on paid ads
- MCP servers require TypeScript/Python knowledge most non-technical founders lack
- Existing tools (Speakeasy, Gram, MCP.Link) require a pre-existing OpenAPI spec — most indie products don't have one
- There is no tool that accepts plain English product descriptions and produces a live, hosted, registry-submitted MCP server end-to-end

**We solve:** Plain English → live hosted MCP server → submitted to AI registries → analytics dashboard → zero ongoing maintenance

---

## 3. Target Users

### Primary: Indie SaaS Founders
- Solo builders with a live product and REST API
- Non-technical or low-technical (use no-code tools, Bubble, Webflow + Zapier)
- Spending money on Google/Meta ads with poor ROI
- Active on X (Twitter), Indie Hackers, Product Hunt

### Secondary: Developer-Founders
- Have an OpenAPI spec already
- Want managed hosting + registry submission without DevOps overhead
- Want analytics on AI-driven API usage

### Out of Scope (v1)
- Enterprise / large teams
- GraphQL-only APIs
- Products with no existing API (pure UI tools)
- OAuth 2.0 complex auth flows (defer to v2)

---

## 4. Core User Journey

```
Landing Page
     ↓
[LIVE DEMO on landing page — no signup required]
User pastes their API endpoint + key → sees Claude answer a question using their product
     ↓
Signup (email or Google OAuth)
     ↓
Onboarding Wizard (4 steps)
  Step 1: Describe your product (plain English + API base URL)
  Step 2: Paste API key (or select "no auth needed")
  Step 3: AI generates MCP tool definitions — user reviews/edits
  Step 4: Confirm → deploy → submit to registries
     ↓
Dashboard
  - MCP server status (live/down)
  - AI discovery events (how many times Claude used your server)
  - First discovery celebration email/notification
  - Registry submission status
     ↓
Upgrade prompt at 10 discovery events (free tier limit)
```

---

## 5. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **State management:** Zustand
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend
- **Runtime:** Next.js API Routes + Edge Functions
- **MCP Server Runtime:** Cloudflare Workers (one Worker per customer MCP server)
- **MCP SDK:** `@modelcontextprotocol/sdk` (official Anthropic SDK)
- **AI Generation:** Anthropic Claude claude-sonnet-4-20250514 (generate tool definitions from plain English)
- **Queue:** Upstash QStash (for async MCP deployments)

### Database & Storage
- **Primary DB:** Supabase (Postgres)
- **Auth:** Supabase Auth
- **File storage:** Supabase Storage (for OpenAPI specs, logs)
- **Cache/KV:** Upstash Redis

### Infrastructure
- **Hosting:** Vercel (Next.js app)
- **MCP Servers:** Cloudflare Workers (per-user isolated workers)
- **DNS:** Cloudflare
- **Monitoring:** Sentry + Upstash Redis for event counting

### Payments
- **Billing:** Stripe (subscriptions + usage metering)

### Email
- **Transactional:** Resend

### Registry Submission
- **Smithery API:** REST submission
- **mcp.so:** Manual submission flow (automate via Puppeteer in v2)

---

## 6. Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP Projects
CREATE TABLE mcp_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- used for MCP server URL: mcplaunch.io/mcp/{slug}
  description TEXT, -- plain English product description
  api_base_url TEXT NOT NULL,
  api_auth_type TEXT DEFAULT 'api_key' CHECK (api_auth_type IN ('api_key', 'bearer', 'none')),
  api_key_header TEXT DEFAULT 'Authorization', -- e.g. "X-API-Key"
  api_key_encrypted TEXT, -- encrypted with app secret
  openapi_spec JSONB, -- generated or uploaded spec
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'live', 'error', 'paused')),
  worker_url TEXT, -- Cloudflare Worker URL
  cloudflare_worker_id TEXT,
  smithery_listed BOOLEAN DEFAULT FALSE,
  smithery_url TEXT,
  health_check_last_at TIMESTAMPTZ,
  health_check_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP Tools (individual tools within a project)
CREATE TABLE mcp_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES mcp_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "search_products"
  description TEXT NOT NULL, -- AI-readable description (critical for discoverability)
  http_method TEXT DEFAULT 'GET',
  endpoint_path TEXT NOT NULL, -- e.g. "/products/search"
  input_schema JSONB NOT NULL, -- JSON Schema for parameters
  output_description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery Events (each time an AI uses the MCP server)
CREATE TABLE discovery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES mcp_projects(id) ON DELETE CASCADE,
  tool_name TEXT,
  ai_client TEXT, -- 'claude', 'chatgpt', 'cursor', 'other'
  user_query TEXT, -- the question the AI user asked (if available)
  response_status INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discovery_events_project_id ON discovery_events(project_id);
CREATE INDEX idx_discovery_events_created_at ON discovery_events(created_at);
CREATE INDEX idx_mcp_projects_user_id ON mcp_projects(user_id);
CREATE INDEX idx_mcp_projects_slug ON mcp_projects(slug);
```

---

## 7. Feature Specifications

### 7.1 Landing Page Interactive Demo (CRITICAL — see Section 8)

The landing page must let a visitor experience their own MCP server working — before signup. This is the primary conversion mechanism.

---

### 7.2 Onboarding Wizard

**Route:** `/onboard`  
**Steps:** 4 (progress bar shown throughout)

#### Step 1 — Describe Your Product
```
Fields:
- product_name: text input (required)
- product_description: textarea, min 50 chars
  placeholder: "My product is a SaaS tool that helps freelancers track invoices. 
                It has endpoints to create invoices, list them, and mark as paid."
- api_base_url: text input, validated as URL (required)
  e.g. "https://api.myproduct.com/v1"

On Next:
- Call POST /api/onboard/analyze
- Claude analyzes the description and generates suggested tool definitions
- Show loading state: "Analyzing your product with AI..."
```

#### Step 2 — Connect Your API
```
Fields:
- api_auth_type: radio (API Key / Bearer Token / No Auth)
- If API Key or Bearer:
  - api_key_header: text (default "Authorization" or "X-API-Key")
  - api_key_value: password input
- Test Connection button → calls POST /api/onboard/test-connection
  - Tries a HEAD or GET request to the base URL with provided credentials
  - Shows green "✓ Connected" or red "✗ Failed: [error]"
```

#### Step 3 — Review Your MCP Tools
```
Display:
- Card list of AI-generated MCP tools
- Each card shows: tool name, description, HTTP method + path, input params
- User can:
  - Edit tool name and description inline
  - Toggle enable/disable per tool
  - Delete a tool
  - Add custom tool (advanced)
- Warning banner if < 2 tools (discoverability risk)
- "Description quality score" per tool (AI-evaluated, 1–10)
  - Tooltip: "High-quality descriptions help AI assistants discover your tool"
```

#### Step 4 — Deploy & Go Live
```
Actions triggered on "Deploy":
1. POST /api/mcp/deploy
   - Encrypt and store API key
   - Generate Cloudflare Worker code from tool definitions
   - Deploy Worker via Cloudflare API
   - Store worker_url in DB
   - Queue registry submission job
2. Show animated deployment progress:
   - "Building your MCP server..." (2s)
   - "Deploying to global edge network..." (3s)
   - "Running health checks..." (2s)
   - "Submitting to AI registries..." (2s)
   - "🎉 Your MCP server is live!"
3. Display:
   - Live MCP server URL (copy button)
   - Smithery listing status
   - "Share your launch" card (pre-written X/LinkedIn post)
   - CTA → Go to Dashboard
```

---

### 7.3 Dashboard

**Route:** `/dashboard`

#### Overview Panel
```
Metrics (last 30 days):
- Total AI Discovery Events (big number, with trend vs last 30d)
- Unique AI clients that used your server
- Most-called tool
- Server uptime %
- "Estimated ad spend saved" = discovery_events × $2.50 (avg CPC)
```

#### Discovery Feed
```
Real-time feed of discovery events:
- Timestamp
- AI client (Claude / ChatGPT / Cursor / etc.)
- Tool called
- User query (if available)
- Latency
- Status (200 / error)

First ever discovery event → trigger confetti animation + 
send "🎉 Claude just used your MCP server!" email via Resend
```

#### MCP Server Card
```
- Server URL (copy button)
- Status badge (Live / Down / Paused)
- Last health check timestamp
- Edit tools button
- Pause / Delete server button
```

#### Registry Status
```
- Smithery: Listed ✓ / Pending / Not Listed
- mcp.so: Listed ✓ / Not Listed
- One-click submit buttons for each
```

#### Usage & Billing
```
- Current plan
- Discovery events used this month / limit
- Upgrade CTA (if on free)
- Billing portal link (Stripe)
```

---

### 7.4 MCP Server Generation Engine

**File:** `lib/mcp/generator.ts`

#### Step 1: AI Tool Definition Generation

```typescript
// Prompt sent to Claude claude-sonnet-4-20250514
const systemPrompt = `
You are an expert at creating Model Context Protocol (MCP) tool definitions.
Given a product description and API base URL, generate MCP tool definitions
that will make AI assistants naturally discover and use this product.

Rules:
1. Tool names must be snake_case, action-oriented: search_products, create_invoice, get_weather
2. Tool descriptions must be written FOR AI ASSISTANTS, not humans. 
   They should answer "when would an AI want to call this tool?"
   Example: "Use this tool when the user asks about their invoices, wants to find unpaid bills, 
   or needs to see payment history."
3. Generate 3–8 tools. More is not better.
4. Input schemas must be valid JSON Schema draft-07.
5. Return ONLY valid JSON array of tool definitions, no markdown.

Output format:
[
  {
    "name": "tool_name",
    "description": "AI-facing description",
    "http_method": "GET",
    "endpoint_path": "/path/{param}",
    "input_schema": { "type": "object", "properties": {}, "required": [] },
    "output_description": "What this returns"
  }
]
`;
```

#### Step 2: Cloudflare Worker Code Generation

```typescript
// Template for generated Worker
const workerTemplate = (tools: MCPTool[], config: ProjectConfig) => `
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "${config.name}",
  version: "1.0.0"
});

${tools.map(tool => generateToolHandler(tool, config)).join('\n\n')}

export default {
  async fetch(request: Request, env: Env) {
    const transport = new SSEServerTransport("/message", response);
    await server.connect(transport);
    return response;
  }
};
`;
```

#### Step 3: Health Check System

```typescript
// Run on deployment + every 6 hours via cron
async function healthCheck(project: MCPProject) {
  // 1. HTTP ping to Worker URL
  // 2. Send synthetic MCP "list_tools" request
  // 3. Verify tools returned match DB records
  // 4. Record latency
  // 5. Update health_check_status
  // 6. Alert user via email if 2 consecutive failures
}
```

#### Step 4: Description Quality Scorer

```typescript
// Score each tool description 1-10 for AI discoverability
async function scoreToolDescription(description: string): Promise<number> {
  // Criteria:
  // - Does it describe WHEN an AI would call this? (+3)
  // - Does it mention specific user intents? (+2)  
  // - Is it under 200 chars? (+1)
  // - Does it avoid technical jargon? (+2)
  // - Does it include example triggers? (+2)
}
```

---

### 7.5 Pricing & Plans

| Feature | Free | Starter ($29/mo) | Pro ($49/mo) |
|---|---|---|---|
| MCP servers | 1 | 3 | 10 |
| Discovery events/mo | 50 | 2,000 | Unlimited |
| Registry auto-submit | Manual | ✓ | ✓ |
| Health monitoring | ✗ | ✓ | ✓ |
| Discovery analytics | Basic | Full | Full |
| Custom domain MCP | ✗ | ✗ | ✓ |
| Priority support | ✗ | ✗ | ✓ |

**Stripe Price IDs:** (create in Stripe dashboard, store in env vars)
- `STRIPE_PRICE_STARTER_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`

---

### 7.6 Email Sequences (Resend)

#### Transactional Emails

1. **Welcome** — on signup
2. **MCP Live** — when deployment completes
3. **First Discovery** — first time any AI calls their MCP server
   - Subject: "🎉 Claude just found your product (zero ad spend)"
   - Body: show the query that triggered it, the tool called, estimated CPC saved
4. **Health Alert** — server down 2+ consecutive checks
5. **Usage Limit Warning** — at 80% of monthly discovery event limit
6. **Upgrade Nudge** — at 10 discovery events on free plan

#### Automated Sequence (7 days post-signup)
- Day 1: "How to improve your tool descriptions for better AI discovery"
- Day 3: "Your MCP server stats this week"
- Day 7: "3 ways to get cited by more AI assistants"

---

## 8. Landing Page Specification

### 8.1 Design Direction

**Aesthetic:** Dark, technical-premium. Think "mission control" — deep navy/black background, electric cyan/green accents, monospace code elements mixed with clean sans-serif copy. Feels like a Bloomberg Terminal crossed with a modern SaaS tool. Conveys power and precision.

**Fonts:**
- Display/Hero: `Space Mono` (Google Fonts) — technical authority
- Body: `DM Sans` — readable, friendly
- Code elements: `JetBrains Mono`

**Color Palette:**
```css
--bg-primary: #050A14;        /* deep space black */
--bg-secondary: #0D1526;      /* dark navy */
--bg-card: #111D35;           /* card surface */
--accent-primary: #00E5FF;    /* electric cyan */
--accent-secondary: #39FF14;  /* neon green (for live indicators) */
--text-primary: #F0F4FF;      /* near white */
--text-secondary: #8896B3;    /* muted blue-grey */
--border: #1E2D4A;            /* subtle border */
--gradient: linear-gradient(135deg, #00E5FF22, #39FF1422);
```

**Animations:**
- Hero: staggered text reveal on load (Framer Motion)
- Demo section: typewriter effect on AI queries
- Live indicator: pulsing green dot
- Cards: subtle float on hover
- Background: very subtle moving particle grid (CSS only, low performance impact)

---

### 8.2 Page Structure

#### Section 1: Navigation
```
[MCPLaunch logo]                          [Pricing] [Docs] [Sign In] [Start Free →]

Logo: stylized "M" in cyan, "CPLaunch" in Space Mono
CTA button: electric cyan background, dark text, slight glow effect
```

#### Section 2: Hero
```
ABOVE HEADLINE (small caps, cyan):
  "THE FUTURE OF ZERO-CAC DISTRIBUTION"

HEADLINE (large, 64–80px, Space Mono):
  "Let AI assistants 
   discover your product."

SUBHEADLINE (20px, DM Sans, muted):
  "Turn your API into an MCP server in 5 minutes.
   Get discovered by Claude, ChatGPT, and Perplexity.
   No engineers. No ads."

CTA ROW:
  [Get Your MCP Server Free →]    [Watch 60s Demo ▶]

SOCIAL PROOF BAR:
  "Trusted by 400+ founders"  |  ★★★★★ 4.9  |  "Saved $12,400 in ads this month"
  
HERO VISUAL:
  Animated terminal window showing:
  > User asks Claude: "Find me a good invoicing tool"
  > Claude calls: mcplaunch.io/mcp/invoicehero/search_tools
  > Claude responds: "I found InvoiceHero — it lets you..."
  [Terminal types out in real time, loops]
```

#### Section 3: THE AHA MOMENT — Live Interactive Demo (CRITICAL CONVERSION SECTION)

```
SECTION HEADLINE:
  "See it work. Right now. With YOUR product."

SUBTEXT:
  "No signup. Paste your API endpoint and watch Claude discover your product in real time."

DEMO WIDGET (full-width card, dark bg, prominent):
┌─────────────────────────────────────────────────────────┐
│  STEP 1 OF 3                                            │
│                                                         │
│  What does your product do?                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ e.g. "A tool that helps restaurants manage      │   │
│  │  their reservations and waitlist"               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Your API base URL:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ https://api.yourproduct.com/v1                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Generate My MCP Preview →]                            │
│                                                         │
│  OR try our demo API →  (prefills with sample data)     │
└─────────────────────────────────────────────────────────┘

AFTER SUBMIT — LOADING STATE:
  Animated steps with real-time progress:
  ✓ Analyzing your product...
  ✓ Generating MCP tool definitions...
  ⟳ Testing with Claude...

AFTER LOADING — RESULT STATE (THE AHA MOMENT):
┌─────────────────────────────────────────────────────────┐
│  🟢 YOUR MCP SERVER IS READY (PREVIEW)                  │
│                                                         │
│  AI DISCOVERY SIMULATION                               │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  User asks Claude:                                      │
│  "Can you help me manage restaurant reservations?"      │
│                                                         │
│  Claude thinks:  [animated thinking dots]               │
│  → Found tool: search_reservations                      │
│  → Calling your API...                                  │
│  → Got response: 3 reservations found                   │
│                                                         │
│  Claude responds:                                       │
│  "I found 3 upcoming reservations using [YourProduct].  │
│   The next one is tonight at 7pm for a party of 4..."   │
│                                                         │
│  ✓ Zero ad spend  ✓ Organic AI discovery  ✓ Real users  │
│                                                         │
│  TOOLS GENERATED FOR YOU:                              │
│  [search_reservations]  [create_booking]  [get_waitlist]│
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Deploy this live + get submitted to registries  │  │
│  │  [Create Free Account → Deploy in 2 Minutes]     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Implementation Notes for the Demo Widget:**
- Call `POST /api/demo/generate` (no auth required, rate-limited by IP to 3/hour)
- This calls Claude API with a safe, sandboxed prompt to generate tool definitions
- The "AI discovery simulation" is a scripted animation using the generated tool names + a real Claude API call (streaming, visible to user)
- The actual API call is made to the user's real API endpoint if provided, or to a mock endpoint
- Cache results in Redis for 1 hour by input hash to control Claude API costs

---

#### Section 4: How It Works
```
3-step visual flow (horizontal on desktop, vertical mobile):

[1] DESCRIBE          [2] DEPLOY            [3] GET DISCOVERED
Your product in    →  Live MCP server    →  AI assistants find
plain English         in 5 minutes          and use your product
                                            organically

Icons: terminal, rocket, radar pulse
```

#### Section 5: The Problem (Pain Agitation)
```
HEADLINE: "You're burning money on ads. There's a better way."

Two columns:
LEFT (The Old Way — red tinted):             RIGHT (The MCPLaunch Way — green tinted):
✗ $80–200 cost per customer acquired         ✓ $0 AI-driven discovery
✗ Ads stop when budget stops                 ✓ Compounds over time
✗ Banner blindness, low trust                ✓ AI recommends = instant trust
✗ Requires marketing expertise               ✓ Set up once, runs forever
✗ Algorithm changes kill your traffic        ✓ Protocol-level, not algorithm-dependent
```

#### Section 6: Social Proof / Discovery Feed
```
HEADLINE: "Live AI discovery events happening right now"

Real-time scrolling ticker (auto-plays, loops):
  🟢 Claude just used "search_products" from InvoiceHero — 2 sec ago
  🟢 Cursor used "create_task" from TaskFlow — 8 sec ago
  🟢 ChatGPT used "find_restaurants" from TableReady — 15 sec ago
  ...

Note: In v1, these can be real events from early customers or seeded demo data,
clearly labeled "example events from beta users"
```

#### Section 7: Pricing
```
3 cards: Free / Starter ($29) / Pro ($49)
(see pricing table in section 7.5)

Toggle: Monthly / Annual (20% off annual)
Highlight: Starter card with "Most Popular" badge

Below cards:
"All plans include: Cloudflare edge hosting · SSL · Uptime monitoring"
```

#### Section 8: FAQ
```
Structured FAQ for AEO (Answer Engine Optimization):

Q: What is an MCP server?
Q: How does AI discovery work?
Q: Do I need an OpenAPI spec?
Q: What APIs are supported?
Q: How long does setup take?
Q: Will this work with Claude, ChatGPT, and other AIs?
Q: What happens if my API goes down?
Q: How is my API key protected?

Implement as JSON-LD FAQ schema for Google + AI engine citation
```

#### Section 9: CTA Footer
```
HEADLINE: "Your first AI discovery event is 5 minutes away."
SUBTEXT: "Free to start. No credit card. No engineers."
CTA: [Generate My MCP Server →]

Footer links: Pricing · Docs · Blog · Privacy · Terms
Social: X/Twitter · GitHub
```

---

### 8.3 SEO Metadata (Next.js Metadata API)

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "MCPLaunch — Get Discovered by AI Assistants | Zero-CAC Distribution",
  description: "Turn your API into an MCP server in 5 minutes. Get your product discovered by Claude, ChatGPT, and Perplexity organically. No ads, no engineers, zero customer acquisition cost.",
  keywords: [
    "MCP server", "Model Context Protocol", "AI discovery",
    "zero CAC", "get discovered by Claude", "MCP server generator",
    "API to MCP", "AI distribution", "MCP hosting", "Smithery MCP"
  ],
  openGraph: {
    title: "MCPLaunch — Let AI Find Your Product",
    description: "Turn your API into a hosted MCP server. Get discovered by Claude, ChatGPT, and Perplexity. Free to start.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPLaunch — AI-Native Distribution for SaaS",
    description: "Stop paying for ads. Get your product discovered by AI assistants instead.",
    images: ["/og-image.png"]
  },
  alternates: { canonical: "https://mcplaunch.io" },
  robots: { index: true, follow: true }
};
```

### 8.4 Structured Data (JSON-LD)

```typescript
// Add to landing page <head>
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "MCPLaunch",
      "applicationCategory": "DeveloperApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Generate and host MCP servers from any API. Get discovered by Claude, ChatGPT, and AI assistants.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "127"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        // ... FAQ items
      ]
    }
  ]
};
```

---

## 9. API Specification

### Public (No Auth)

```
POST /api/demo/generate
Body: { description: string, api_base_url: string }
Rate limit: 3/hour per IP
Response: { tools: MCPTool[], demo_query: string, demo_response: string }

GET /api/health
Response: { status: "ok", version: string }
```

### Authenticated (Supabase JWT required)

```
POST /api/onboard/analyze
Body: { description: string, api_base_url: string }
Response: { suggested_tools: MCPTool[] }

POST /api/onboard/test-connection
Body: { api_base_url: string, api_auth_type: string, api_key_header: string, api_key_value: string }
Response: { success: boolean, status_code: number, error?: string }

POST /api/mcp/deploy
Body: { project_id: string }
Response: { worker_url: string, status: string }

GET /api/mcp/projects
Response: { projects: MCPProject[] }

GET /api/mcp/projects/:id
Response: MCPProject & { tools: MCPTool[], events_summary: EventsSummary }

PUT /api/mcp/projects/:id/tools
Body: { tools: MCPTool[] }
Response: { success: boolean }

DELETE /api/mcp/projects/:id
Response: { success: boolean }

GET /api/analytics/:project_id
Query: ?range=7d|30d|90d
Response: { events: DiscoveryEvent[], summary: AnalyticsSummary }

POST /api/registries/submit/:project_id
Body: { registry: "smithery" | "mcpso" }
Response: { submitted: boolean, url?: string }
```

### Stripe Webhooks

```
POST /api/webhooks/stripe
Events handled:
- checkout.session.completed → activate subscription
- customer.subscription.updated → update plan
- customer.subscription.deleted → downgrade to free
- invoice.payment_failed → send dunning email
```

---

## 10. Authentication & Billing

### Auth Flow (Supabase)

```typescript
// Supported methods:
// 1. Magic Link (email)
// 2. Google OAuth
// 3. GitHub OAuth (good for developer-founders)

// Protected routes (middleware.ts):
const protectedRoutes = ['/dashboard', '/onboard', '/settings', '/api/mcp'];

// After auth, check onboarding completion:
// - If no mcp_projects → redirect to /onboard
// - Else → redirect to /dashboard
```

### API Key Encryption

```typescript
// NEVER store API keys in plaintext
// Use AES-256-GCM encryption with APP_SECRET env var
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptApiKey(key: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', APP_SECRET, iv);
  // ... return iv + authTag + encrypted as base64
}
```

### Stripe Integration

```typescript
// Checkout session creation
const session = await stripe.checkout.sessions.create({
  customer: user.stripe_customer_id,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${BASE_URL}/dashboard?upgrade=success`,
  cancel_url: `${BASE_URL}/pricing`,
  metadata: { user_id: user.id }
});
```

---

## 11. SEO & ASO Strategy

### Programmatic SEO Pages

Generate these page types at build time using `generateStaticParams`:

```
/mcp-server-for/[integration]
  e.g. /mcp-server-for/stripe
       /mcp-server-for/shopify  
       /mcp-server-for/airtable
       /mcp-server-for/notion

/how-to-get-discovered-by/[ai-assistant]
  e.g. /how-to-get-discovered-by/claude
       /how-to-get-discovered-by/chatgpt
       /how-to-get-discovered-by/perplexity

/mcp-server-generator/[language]
  e.g. /mcp-server-generator/python
       /mcp-server-generator/typescript
       /mcp-server-generator/no-code
```

Each page:
- 800–1200 words, unique content
- Targets specific long-tail keyword
- Includes mini interactive demo (same demo widget, pre-seeded with relevant example)
- Internal links to related pages + homepage

### Blog Content (AEO-Optimized)

Target these topics for AI citation (Perplexity, ChatGPT citations):

1. "What is an MCP server and why does your SaaS need one?"
2. "How to get your product discovered by Claude (2026 guide)"
3. "MCP vs traditional SEO: the new distribution playbook"
4. "Zero-CAC customer acquisition with Model Context Protocol"
5. "How to write MCP tool descriptions that AI assistants actually use"

Format: FAQ structure, H2/H3 headers, data tables, numbered lists — all optimized for AI engine parsing.

### ASO (App Store Optimization) — for future mobile app

```
App Name: MCPLaunch: AI Discovery Tool
Subtitle: MCP Server Builder & Analytics
Keywords: mcp server, ai discovery, api tool, claude integration, 
          zero cac marketing, ai seo, model context protocol
Description: First paragraph must contain primary keywords.
Screenshots: Show the AHA moment — Claude using a user's product.
```

---

## 12. File & Folder Structure

```
mcplaunch/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── [projectId]/page.tsx
│   │   ├── onboard/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── StepDescribe.tsx
│   │   │       ├── StepConnect.tsx
│   │   │       ├── StepReview.tsx
│   │   │       └── StepDeploy.tsx
│   │   └── settings/page.tsx
│   ├── (marketing)/
│   │   ├── page.tsx                    ← Landing page
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── mcp-server-for/
│   │       └── [integration]/page.tsx  ← Programmatic SEO
│   ├── api/
│   │   ├── demo/generate/route.ts
│   │   ├── onboard/
│   │   │   ├── analyze/route.ts
│   │   │   └── test-connection/route.ts
│   │   ├── mcp/
│   │   │   ├── deploy/route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── tools/route.ts
│   │   ├── analytics/[projectId]/route.ts
│   │   ├── registries/submit/[projectId]/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── LiveDemo.tsx                ← THE AHA MOMENT WIDGET
│   │   ├── HowItWorks.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── DiscoveryFeed.tsx
│   │   ├── Pricing.tsx
│   │   └── FAQ.tsx
│   ├── dashboard/
│   │   ├── MetricsBar.tsx
│   │   ├── DiscoveryFeed.tsx
│   │   ├── MCPServerCard.tsx
│   │   └── RegistryStatus.tsx
│   └── ui/                             ← shadcn/ui components
├── lib/
│   ├── mcp/
│   │   ├── generator.ts                ← AI tool generation
│   │   ├── worker-template.ts          ← Cloudflare Worker codegen
│   │   ├── health-check.ts
│   │   └── description-scorer.ts
│   ├── cloudflare/
│   │   └── deploy.ts                   ← CF Workers API
│   ├── registries/
│   │   └── smithery.ts
│   ├── crypto/
│   │   └── api-keys.ts                 ← Encryption
│   ├── email/
│   │   └── resend.ts
│   ├── stripe/
│   │   └── index.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## 13. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (for MCP generation + demo)
ANTHROPIC_API_KEY=

# Cloudflare (for Worker deployment)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_PRO_MONTHLY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@mcplaunch.io

# Upstash (Redis + QStash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=

# Smithery API
SMITHERY_API_KEY=

# App
APP_SECRET=                   # 32-byte hex for AES-256 encryption
NEXT_PUBLIC_APP_URL=https://mcplaunch.io
NODE_ENV=production
```

---

## 14. Launch Checklist

### Pre-Launch (Week 1–2)
- [ ] Supabase project created, schema migrated
- [ ] Auth working (magic link + Google)
- [ ] Cloudflare Workers deployment pipeline tested end-to-end
- [ ] MCP tool generation tested with 5 real product types
- [ ] Health check cron job running
- [ ] Stripe checkout + webhook working
- [ ] Resend email templates live
- [ ] Landing page interactive demo working (rate limited)
- [ ] OG image designed and deployed
- [ ] Analytics (Vercel Analytics + custom event tracking) live

### Launch Day
- [ ] Post on X with video of the AHA moment demo
- [ ] Post on Indie Hackers "Show IH"
- [ ] Submit to Product Hunt (schedule for Tuesday 12:01am PST)
- [ ] Submit own MCP server to Smithery (dogfood the product)
- [ ] Email any beta users / waitlist

### Post-Launch (Week 3–4)
- [ ] Programmatic SEO pages live (50+ integrations)
- [ ] Blog post #1 live and submitted to AI search engines
- [ ] First 10 paying customers → interview for testimonials
- [ ] First discovery event confetti email verified working
- [ ] Churn tracking set up (if user deletes project in < 7 days, survey why)

---

*End of PRD. Feed this document to Claude Code and begin with Section 5 (Tech Stack setup) → Section 6 (Database Schema) → Section 8 (Landing Page) → Section 7 (Feature Specs) in that order for the fastest path to a working MVP.*
