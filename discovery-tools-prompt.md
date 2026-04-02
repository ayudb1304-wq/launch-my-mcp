# Claude Code Prompt: Implement Discovery Tools (Non-API MCP Servers)

## Context

MCPLaunch currently generates MCP servers that return stub responses when AI assistants call tools. The tool handler in `app/api/mcp/[slug]/[transport]/route.ts` just echoes back "tool called successfully" with no real data. This makes the MCP server useless when an AI actually calls it.

We need to implement **Discovery Tools** — MCP tools that return rich, structured product information (pricing, features, use cases, comparisons) without requiring any API connection. The data comes from what the user enters during onboarding. This makes our product accessible to non-technical founders who don't have APIs or API keys.

**The mental model:** Discovery tools turn an MCP server into a "structured product profile for AI assistants" — like a Google Business listing, but queryable by Claude/ChatGPT/Perplexity. When an AI assistant asks "what's a good invoicing tool for freelancers?", it can call `get_product_info` on our user's MCP server and get back real, structured data about their product.

## What needs to change

### 1. Database Migration

Create a new Supabase migration that:

**Alter `mcp_projects` table:**
- Make `api_base_url` NULLABLE (was NOT NULL) — discovery-only servers don't need an API URL
- Add `product_website` TEXT — the user's product website URL
- Add `product_metadata` JSONB DEFAULT '{}' — structured product info collected during onboarding. Schema:
  ```json
  {
    "pricing_plans": [
      { "name": "Free", "price": "$0", "features": ["Feature 1", "Feature 2"] },
      { "name": "Pro", "price": "$19/mo", "features": ["Everything in Free", "Feature 3"] }
    ],
    "key_features": ["Feature 1", "Feature 2", "Feature 3"],
    "use_cases": ["Use case 1", "Use case 2"],
    "target_audience": "Freelancers and small businesses",
    "differentiators": ["What makes this different from competitors"],
    "integrations": ["Stripe", "Zapier", "Slack"],
    "founded_year": "2024",
    "company_size": "Solo founder"
  }
  ```
- Add `server_mode` TEXT DEFAULT 'discovery' CHECK (server_mode IN ('discovery', 'hybrid')) — 'discovery' = no API connected, 'hybrid' = has API connected too

**Alter `mcp_tools` table:**
- Add `tool_type` TEXT DEFAULT 'discovery' CHECK (tool_type IN ('discovery', 'action')) 
- Add `static_response` JSONB — the pre-built response data for discovery tools. This is what gets returned when an AI calls the tool.
- Make `endpoint_path` NULLABLE (discovery tools don't have API endpoints)
- Make `http_method` NULLABLE (discovery tools don't have HTTP methods)

### 2. Onboarding Wizard Restructure + Storytelling Narrative

The current wizard is 3 steps: Describe → Review Tools → Deploy.

Change it to 4 steps: **Describe → Product Details → Review Tools → Deploy**.

#### CRITICAL: Onboarding Narrative Design

Each step must tell a story that builds excitement. The user should feel like they're watching their product come alive inside the AI ecosystem — not filling out a boring form. Every step has three narrative elements:

1. **Step headline** — a short, exciting, layman-friendly phrase (NOT "Step 1 of 4")
2. **Step subtext** — one sentence explaining what's happening in plain English, framed as a benefit
3. **Transition moment** — after the user completes a step and hits Next, show a brief (1-2 second) animated transition with a narrative beat before the next step loads. This builds anticipation and makes the process feel like something is *happening*, not just form-to-form navigation.

Here's the full narrative arc:

---

**Step 1 — "Tell us about your product"**

Headline: `"Let's introduce your product to AI"`
Subtext: `"Right now, when someone asks Claude or ChatGPT about tools like yours — they don't know you exist. Let's change that."`

This frames the problem immediately. The user isn't "filling out a form" — they're fixing an invisible gap in how AI sees their product.

Fields (same as before but reframed):
- `product_name` (required) — Label: "What's your product called?"
- `product_description` textarea (required, min 50 chars) — Label: "Describe it like you're telling a friend at a coffee shop." Placeholder: "e.g. We built an invoicing tool for freelancers. You can create invoices, track payments, and send automatic reminders. It's simpler than FreshBooks and half the price."
- `product_website` URL field (optional) — Label: "Got a website?" Placeholder: "https://yourproduct.com"
- Remove `api_base_url` from this step entirely.

**Transition after Step 1 → Step 2:**
Brief animated moment (1.5s) with text: `"Nice. Now let's give AI the details it needs to recommend you..."` with a subtle pulsing/typing animation. This makes the user feel like the AI is already "processing" their product.

---

**Step 2 — "What should AI know about you?"**

Headline: `"Teach AI what makes you special"`
Subtext: `"When someone asks an AI 'what's a good invoicing tool?' — this is exactly what it'll use to answer. The more you share, the smarter its recommendation."`

This reframes a boring metadata form into "you're literally writing the script for how AI will talk about your product." Each field has a "why this matters" tooltip (use the FieldTooltip component) that explains the AI angle.

Fields:
- **Pricing Plans** — Dynamic list. Each plan has: name (text), price (text like "$19/mo" or "Free"), features (comma-separated text that gets split into array). Start with one empty plan row, "Add another plan" button.
  - Why-tooltip: `"'How much does it cost?' is one of the most common questions people ask AI. If you add your pricing here, AI can answer accurately instead of guessing or saying 'I don't know.'"`
  
- **Key Features** — Tag-style input (user types a feature, hits Enter, it becomes a tag/chip). 
  - Why-tooltip: `"AI assistants match products to user needs by features. 'I need something with recurring invoices and Stripe integration' — if those are in your feature list, you'll get recommended."`

- **Use Cases** — Textarea, one per line. 
  - Why-tooltip: `"This helps AI understand WHEN to recommend you. 'A freelancer needs to send a professional invoice in under 2 minutes' is exactly the kind of scenario an AI matches against."`
  - Placeholder: "e.g.\nA freelancer needs to invoice a client quickly\nA small agency wants to track payments across multiple projects\nSomeone switching from FreshBooks wants a simpler alternative"

- **Target Audience** — Single text input. 
  - Why-tooltip: `"Helps AI narrow down who you're for. 'Freelance designers and small creative agencies' is much more useful than 'everyone.'"`

- **What Makes You Different** — Textarea. 
  - Why-tooltip: `"When AI compares tools, this is your pitch. Think: what would you say if someone asked 'why should I use yours instead of the competition?'"`

- **Integrations** — Tag-style or comma-separated.
  - Why-tooltip: `"People ask AI things like 'what invoicing tool works with Stripe?' — if you list your integrations, you'll show up in those conversations."`

All fields are optional but show a gentle progress indicator: "AI readiness score: 3/6 sections filled — the more you add, the better AI can represent you." This uses a simple visual bar (not a number score) that fills up as they complete more sections. Even with 0 optional fields filled, they can proceed — the AI will generate tools from the description alone.

**Transition after Step 2 → Step 3:**
This is THE big moment. Show an animated sequence (3-4 seconds) with these beats:
1. `"Analyzing your product..."` (0.8s) — spinning/pulsing icon
2. `"Writing your AI profile..."` (0.8s) — typing animation
3. `"Teaching AI when to recommend you..."` (0.8s) — network/connection animation  
4. `"Done. Here's how AI will see your product →"` (0.8s) — checkmark, transition to Step 3

This is NOT fake loading — the analyze API call is actually running during this animation. But the narrative framing turns a loading spinner into a story beat. The user feels like the AI is doing real work on their behalf.

---

**Step 3 — "Your AI profile is ready"**

Headline: `"Here's how AI assistants will see your product"`
Subtext: `"We created your AI discovery profile. Each card below is a question AI can now answer about you — powered by what you just told us."`

This is the "aha moment." The user sees their product information transformed into structured, professional-looking tool cards. It should feel like magic — "I typed a paragraph and now I have a professional AI profile."

Display changes:
- Each tool card shows the tool name in a friendly, readable way: instead of `get_pricing`, show `"Pricing & Plans"` with `get_pricing` in small monospace below.
- Friendly tool name mapping: `get_product_overview` → "Product Overview", `get_pricing` → "Pricing & Plans", `get_features` → "Features", `get_use_cases` → "Use Cases", `get_comparison` → "How You Compare"
- Each card has an expandable preview section: "Preview what AI will say →" that shows the `static_response` data formatted as a readable summary (not raw JSON). For example, the pricing tool preview might show:
  ```
  When someone asks about your pricing, AI will say:
  "[ProductName] offers 3 plans: Free ($0) with basic invoicing, 
  Pro ($19/mo) with recurring invoices and payment tracking, 
  and Team ($49/mo) with multi-user support and priority support."
  ```
- Each card is editable — user can tweak the response data inline.
- Tool type badge: "Discovery Tool" in cyan with a small info tooltip: "Discovery tools help AI learn about and recommend your product. No API connection needed."
- Bottom banner: `"Want AI to actually do things inside your product (like create invoices)? You can connect your API later from the dashboard."`

**Transition after Step 3 → Step 4:**
Quick beat (1s): `"Everything looks good. Let's go live →"`

---

**Step 4 — "Going live"**

Headline: `"Launching your AI presence"`
Subtext: `"In a few seconds, your product will be visible to AI assistants around the world."`

The deploy sequence keeps its current animated steps but with rewritten copy that tells the story:
1. `"Setting up your AI server..."` — (was "Creating MCP server")
2. `"Loading your product profile..."` — (was "Registering tools")
3. `"Connecting to AI networks..."` — (was "Configuring endpoints")
4. `"You're live! AI can find you now."` — (was "Going live!")

**Success state** — this is the celebration moment. Redesign the post-deploy screen:

Primary message: `"Your product is now discoverable by AI"` (large, with confetti or subtle particle animation)

Below that, a card that simulates what will happen:
```
┌─────────────────────────────────────────────────┐
│  💬 Imagine this conversation happening right now: │
│                                                   │
│  User: "What's a good invoicing tool for          │
│         freelancers?"                              │
│                                                   │
│  Claude: "I'd recommend [YourProduct]. It offers   │
│  simple invoicing starting at $0/mo, with features │
│  like recurring invoices and Stripe integration.   │
│  It's designed specifically for freelancers..."    │
│                                                   │
│  ✨ This is now possible because you're live.      │
└─────────────────────────────────────────────────┘
```

This simulated conversation uses the user's ACTUAL product data from their static_response to generate a realistic AI conversation snippet. It's not a real API call — just template the data they entered into a conversational format. This is the emotional payoff: "look, this is what my product looks like when AI recommends it."

Below the simulation:
- MCP server URL with copy button (keep existing)
- "Share your launch" pre-written tweet: "My product [name] is now discoverable by AI assistants like Claude and ChatGPT — zero ad spend. Built my AI profile in 5 minutes with @MCPLaunch 🚀" 
- CTA button: "Go to Dashboard →"

---

#### Narrative Design Principles (for the developer implementing this)

1. **Never say "MCP" in user-facing copy.** Users don't know or care what MCP stands for. Say "AI profile", "AI server", "AI discovery". The technical term is for the dashboard and docs, not onboarding.
2. **Every form field must justify its existence with a "why AI cares" angle.** If we can't explain why a field helps AI recommend the product, remove it.
3. **Transitions between steps are not loading screens — they're story beats.** They should feel like something is happening, not like something is broken.
4. **The Step 3 → Step 4 moment is the emotional climax.** The user sees their messy description transformed into a structured, professional AI profile. Make this feel like magic.
5. **The deploy success screen is the reward.** The simulated conversation using their real data is the moment they think "holy shit, this actually works." Don't rush past it.
6. **Progress indicator** should use narrative labels, not "Step 1/2/3/4". Use: `Describe → Teach → Review → Launch` as the progress bar labels.
7. **Tone throughout: confident, warm, slightly excited.** Not corporate. Not cutesy. Think "a smart friend who's genuinely excited to help you get discovered." Avoid exclamation marks except on the final success screen.

### 3. AI Tool Generation Prompt

Update `lib/mcp/generator.ts` (and the onboarding analyze route `app/api/onboard/analyze/route.ts`) to generate discovery tools instead of action tools.

The new system prompt should be:

```
You are an expert at creating Model Context Protocol (MCP) tool definitions for AI discoverability.

Given a product description and optional structured metadata, generate MCP tool definitions that help AI assistants LEARN ABOUT and RECOMMEND this product to users.

These are DISCOVERY tools — they return structured product information, NOT action tools that call APIs. Think of them as a queryable product profile.

Rules:
1. Tool names must be snake_case: get_product_overview, get_pricing, get_features, get_use_cases, compare_alternatives
2. Descriptions must be written FOR AI ASSISTANTS — they should answer "when would an AI want to call this tool?"
   Example: "Call this tool when a user asks about invoicing software, wants to compare invoicing tools, or asks about pricing for freelancer tools."
3. Generate 3-5 discovery tools. Standard set:
   - get_product_overview — general info, what it does, who it's for
   - get_pricing — plans, prices, what's included
   - get_features — detailed feature list with descriptions  
   - get_use_cases — real scenarios where this product helps
   - get_comparison — how this product compares to alternatives (only if differentiators provided)
4. Each tool must include a `static_response` field — this is the ACTUAL DATA that will be returned when an AI calls the tool. Build it from the product description and metadata provided.
5. Input schemas should be minimal — most discovery tools need no input, or just an optional "detail_level" parameter ("summary" | "detailed").
6. The static_response must be rich, factual, and useful. Include the product name, specific details, and real data. Never use placeholder text.

Output format (JSON array, no markdown):
[
  {
    "name": "get_product_overview",
    "description": "AI-facing description of when to call this",
    "tool_type": "discovery",
    "input_schema": { "type": "object", "properties": {}, "required": [] },
    "static_response": {
      "product_name": "...",
      "description": "...",
      "target_audience": "...",
      "key_benefits": ["...", "..."],
      "website": "..."
    }
  }
]
```

The prompt sent to Claude should include both the product description AND the structured metadata from Step 2:

```
Product: {name}
Description: {description}
Website: {website}

Structured metadata:
- Pricing plans: {JSON of pricing_plans}
- Key features: {key_features}
- Use cases: {use_cases}  
- Target audience: {target_audience}
- Differentiators: {differentiators}
- Integrations: {integrations}

Generate discovery MCP tools for this product.
```

### 4. MCP Server Handler Update

Update `app/api/mcp/[slug]/[transport]/route.ts` to handle discovery tools properly.

In the tool handler callback, change the logic:

```typescript
async (args: Record<string, unknown>) => {
  const startTime = Date.now();
  
  try {
    let responseData: unknown;
    
    if (tool.tool_type === 'discovery') {
      // Discovery tool — return static_response from database
      responseData = tool.static_response;
    } else if (tool.tool_type === 'action') {
      // Action tool — proxy to user's API (future feature)
      // For now, return helpful message
      responseData = {
        message: `Action tool "${tool.name}" requires API connection. Configure in dashboard.`,
        setup_url: `https://mcplaunch.io/dashboard/projects/${project.id}/api`
      };
    }
    
    // Log discovery event
    await supabase.from("discovery_events").insert({
      project_id: project.id,
      tool_name: tool.name,
      ai_client: request.headers.get("user-agent") ?? "unknown",
      latency_ms: Date.now() - startTime,
      status: "success",
    });
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(responseData, null, 2),
        },
      ],
    };
  } catch (error) {
    // ... existing error handling
  }
}
```

### 5. Save Endpoint Update

Update `app/api/onboard/save/route.ts` to:
- Save `product_website` and `product_metadata` to `mcp_projects`
- Save `tool_type` and `static_response` for each tool to `mcp_tools`
- Set `api_base_url` to NULL for discovery-only projects
- Set `server_mode` to 'discovery'

### 6. Dashboard — "Connect API" Section (Future, not this PR)

Don't build this now, but leave a placeholder in the dashboard project detail page:
- A card that says "Want AI assistants to take actions in your product? Connect your API →"
- Links to a future `/dashboard/projects/[id]/connect-api` page
- This is where hybrid mode gets enabled

## Files to modify (in order)

1. New migration file in `supabase/migrations/` — schema changes
2. `lib/onboard-store.ts` — add productMetadata to zustand store
3. `components/onboard/StepDescribe.tsx` — remove api_base_url, add product_website, new narrative copy
4. `components/onboard/StepProductDetails.tsx` — NEW FILE, structured metadata form with "why AI cares" tooltips
5. `components/onboard/StepTransition.tsx` — NEW FILE, reusable animated transition component between steps. Takes a `messages` prop (array of strings) and animates through them with typing/pulsing effects over 2-4 seconds. Used between every step.
6. `components/onboard/OnboardWizard.tsx` — add Step 2, update step numbering, use narrative progress labels ("Describe → Teach → Review → Launch"), integrate StepTransition between steps
7. `lib/mcp/generator.ts` — new system prompt for discovery tools
8. `app/api/onboard/analyze/route.ts` — pass metadata to generator, expect discovery tools back
9. `app/api/onboard/save/route.ts` — save new fields
10. `app/api/mcp/[slug]/[transport]/route.ts` — return static_response for discovery tools
11. `components/onboard/StepReview.tsx` — show friendly tool names, expandable "Preview what AI will say" sections, tool_type badges, editable static_response
12. `components/onboard/StepDeploy.tsx` — rewritten deploy step copy (no MCP jargon), simulated AI conversation on success using real user data

## What NOT to build right now
- API proxy / action tools (future feature)
- Connect API dashboard page (just leave a placeholder card)
- OpenAPI spec import (out of scope)
- Tool editing of static_response in dashboard (v2)

## Testing checklist
- [ ] User can complete onboarding with NO api_base_url and NO api key
- [ ] AI generates discovery tools with realistic static_response data
- [ ] MCP server at /api/mcp/[slug]/mcp returns real data when tools are called
- [ ] Discovery events are logged correctly
- [ ] Existing projects with api_base_url still work (backward compatible)
- [ ] Step progress bar shows 4 steps with narrative labels (Describe → Teach → Review → Launch)
- [ ] Product metadata is saved to database
- [ ] Skipping Step 2 (Product Details) entirely still works — tools get generated from description alone
- [ ] No user-facing copy contains the word "MCP" during onboarding — only "AI profile", "AI server", "AI discovery"
- [ ] Transitions between steps show animated narrative beats (not instant jumps)
- [ ] Step 3 shows friendly tool names ("Pricing & Plans") not raw names ("get_pricing")
- [ ] Step 3 "Preview what AI will say" expandable works and shows readable formatted response (not raw JSON)
- [ ] Deploy success screen shows simulated AI conversation using the user's actual product data
- [ ] AI readiness score bar on Step 2 updates as user fills in optional fields
- [ ] "Why this matters" tooltips appear on every field in Step 2
- [ ] Share tweet on success screen is pre-populated with the user's product name
