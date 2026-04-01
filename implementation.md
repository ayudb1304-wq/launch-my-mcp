# MCPLaunch — Phased Implementation Plan

**Created:** 2026-04-01
**Strategy:** Landing page first (validate interest) → Build product
**Status:** Phase 1 — Complete (build passing, ready for Vercel deploy)

---

## Decisions Log

| Decision | Choice | Notes |
|---|---|---|
| MVP Strategy | Landing page first | Validate interest before building backend |
| Payments | Dodo Payments (not Stripe) | Sole payment provider |
| MCP Hosting (v1) | Next.js dynamic routes | Simpler start, migrate to CF Workers later |
| Demo Widget | Pre-generated presets + Haiku fallback | Presets = free, custom input uses Haiku (~$0.001/hit) |
| Infra Ready | Supabase ✓, Resend ✓, Cloudflare needs setup | Help needed with CF setup |
| Deployment | Vercel from Phase 1 | Live URL for validation ASAP |

---

## Phase 1: Project Foundation & Landing Page

**Goal:** Ship a stunning landing page with a working AI demo widget to a live Vercel URL.
**Estimated Scope:** ~15 components, 3 API routes

### 1.1 Project Setup
- [x] Install remaining dependencies (framer-motion, zustand, react-hook-form, zod)
- [x] Install fonts: Space Mono, DM Sans, JetBrains Mono (Google Fonts via `next/font`)
- [x] Set up color palette and CSS variables in `globals.css` (dark theme from PRD Section 8.1)
- [x] Configure Tailwind theme extensions for custom colors (mcpl-cyan, mcpl-green, mcpl-navy, mcpl-deep)
- [x] Create `.env.local` with initial env vars (ANTHROPIC_API_KEY)
- [ ] Set up Vercel project and deploy initial skeleton

### 1.2 Layout & Navigation
- [x] `app/layout.tsx` — Root layout with fonts, metadata, dark theme (always dark, no ThemeProvider)
- [x] SEO metadata (title, description, OG tags from PRD Section 8.3)
- [x] JSON-LD structured data (FAQ schema in FAQ component)
- [x] `components/landing/Navbar.tsx` — Logo + nav links + CTA button + mobile hamburger
- [x] `components/landing/Footer.tsx` — Links, social icons
- [x] Smooth scroll between all sections with proper IDs

### 1.3 Landing Page Sections
- [x] `components/landing/Hero.tsx` — Headline, subheadline, CTAs, animated terminal typewriter
- [x] `components/landing/LiveDemo.tsx` — Interactive demo widget (THE AHA MOMENT)
  - [x] Form with validation (character counter, disabled submit, error highlights)
  - [x] Loading state with animated progress steps
  - [x] Result state showing zero-cost ad value proposition
  - [x] $0 / 24/7 / Auto metric cards
  - [x] "This is your zero-cost ad" explainer
  - [x] 4 pre-built demo presets (restaurants, invoicing, project mgmt, e-commerce)
- [x] `components/landing/HowItWorks.tsx` — 3-step flow with equal-height cards + chevron arrows
- [x] `components/landing/ProblemSection.tsx` — Old way vs MCPLaunch way comparison
- [x] `components/landing/DiscoveryFeed.tsx` — Simulated real-time event ticker (auto-scroll)
- [x] `components/landing/Pricing.tsx` — 3-tier pricing cards with highlighted Starter plan
- [x] `components/landing/FAQ.tsx` — Accordion with JSON-LD FAQ schema (8 non-technical Q&As)
- [x] `components/landing/CTAFooter.tsx` — Final conversion section
- [x] `app/page.tsx` — Assemble all landing page sections
- [x] Background particle grid animation (CSS-only) + animated gradient

### 1.4 Demo Widget API
- [x] `app/api/demo/generate/route.ts` — POST endpoint
  - [x] Accepts: `{ description, api_base_url }`
  - [x] Pre-generated presets for common product types (zero API cost)
  - [x] Falls back to Claude Haiku for custom inputs (~$0.001/hit vs $0.01)
  - [x] Returns: `{ tools, demo_query, demo_response }`
  - [x] Rate limited: 3/hour prod, 50/hour dev (only for real API calls)
- [x] `lib/demo-presets.ts` — 4 hardcoded demo results (restaurants, invoicing, projects, analytics)
- [x] Error handling and loading states

### 1.5 Deploy & Validate
- [ ] Deploy to Vercel
- [ ] Test demo widget end-to-end on production
- [ ] Verify OG image / social sharing cards
- [ ] Share URL for feedback

### Phase 1 Deliverable
> A live landing page at your Vercel URL with a working AI-powered demo widget. Visitors can try pre-built demos instantly (free) or enter custom products (Haiku API). Result shows zero-cost ad value proposition with metrics.

---

## Phase 2: Authentication & Database

**Goal:** Users can sign up, log in, and have persistent accounts.
**Depends on:** Phase 1 complete

### 2.1 Supabase Setup
- [ ] Run database migrations (users table from PRD Section 6)
- [ ] Configure Supabase Auth (magic link + Google OAuth + GitHub OAuth)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Add Supabase env vars to Vercel

### 2.2 Auth Integration
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] `lib/supabase/client.ts` — Browser client
- [ ] `lib/supabase/server.ts` — Server client
- [ ] `middleware.ts` — Auth middleware for protected routes
- [ ] `app/(auth)/login/page.tsx` — Login page (magic link + OAuth buttons)
- [ ] `app/(auth)/callback/route.ts` — OAuth callback handler
- [ ] Post-auth redirect logic (no projects → /onboard, else → /dashboard)

### 2.3 User Profile
- [ ] Sync Supabase auth user → `users` table on first login
- [ ] Basic settings page shell (`app/(app)/settings/page.tsx`)

### Phase 2 Deliverable
> Users can sign up via email/Google/GitHub, log in, and are routed to the appropriate page.

---

## Phase 3: Onboarding Wizard

**Goal:** Users describe their product and AI generates MCP tool definitions.
**Depends on:** Phase 2 complete

### 3.1 Database
- [ ] Run migrations for `mcp_projects` and `mcp_tools` tables
- [ ] RLS policies for projects and tools

### 3.2 Onboarding UI
- [ ] `app/(app)/onboard/page.tsx` — Wizard container with progress bar
- [ ] `components/onboard/StepDescribe.tsx` — Product name, description, API URL
- [ ] `components/onboard/StepConnect.tsx` — API auth type, key, test connection
- [ ] `components/onboard/StepReview.tsx` — AI-generated tools list (edit/toggle/delete)
- [ ] `components/onboard/StepDeploy.tsx` — Deploy confirmation + animated progress
- [ ] Form validation with React Hook Form + Zod

### 3.3 Onboarding API Routes
- [ ] `app/api/onboard/analyze/route.ts` — Claude generates tool definitions from description
- [ ] `app/api/onboard/test-connection/route.ts` — Tests user's API endpoint
- [ ] Tool description quality scorer (AI-evaluated 1-10)

### 3.4 MCP Generation Engine
- [ ] `lib/mcp/generator.ts` — System prompt + Claude API call for tool generation
- [ ] `lib/mcp/description-scorer.ts` — Score tool descriptions for AI discoverability
- [ ] `lib/crypto/api-keys.ts` — AES-256-GCM encryption for user API keys

### Phase 3 Deliverable
> Users complete a 4-step wizard: describe product → connect API → review AI-generated tools → ready to deploy.

---

## Phase 4: MCP Server Hosting (Next.js Dynamic Routes)

**Goal:** Deploy and host live MCP servers as dynamic routes within the Next.js app.
**Depends on:** Phase 3 complete

### 4.1 MCP Server Runtime
- [ ] Install `@modelcontextprotocol/sdk`
- [ ] `app/api/mcp/[slug]/route.ts` — Dynamic MCP server endpoint per project
  - Reads project config + tools from DB
  - Serves MCP protocol (SSE transport)
  - Proxies tool calls to user's actual API
  - Logs discovery events
- [ ] MCP server status management (live/paused/error)

### 4.2 Health Checks
- [ ] `lib/mcp/health-check.ts` — Ping MCP endpoint + verify tools
- [ ] Cron endpoint for periodic health checks (Vercel Cron or QStash)

### 4.3 Discovery Event Tracking
- [ ] Run migration for `discovery_events` table
- [ ] Log each MCP tool call as a discovery event
- [ ] Track AI client, tool name, latency, status

### Phase 4 Deliverable
> Each user's MCP server is live at `/api/mcp/{slug}`, proxying tool calls to their real API, with discovery events logged.

---

## Phase 5: Dashboard & Analytics

**Goal:** Users can monitor their MCP server performance and AI discovery events.
**Depends on:** Phase 4 complete

### 5.1 Dashboard UI
- [ ] `app/(app)/dashboard/page.tsx` — Overview with project cards
- [ ] `app/(app)/dashboard/[projectId]/page.tsx` — Project detail view
- [ ] `components/dashboard/MetricsBar.tsx` — Key stats (events, uptime, ad spend saved)
- [ ] `components/dashboard/DiscoveryFeed.tsx` — Real-time event feed
- [ ] `components/dashboard/MCPServerCard.tsx` — Server status, URL, actions
- [ ] `components/dashboard/RegistryStatus.tsx` — Smithery / mcp.so listing status

### 5.2 Analytics API
- [ ] `app/api/analytics/[projectId]/route.ts` — Events + summary by date range
- [ ] `app/api/mcp/projects/route.ts` — List user's projects
- [ ] `app/api/mcp/projects/[id]/route.ts` — Project CRUD
- [ ] `app/api/mcp/projects/[id]/tools/route.ts` — Update tools

### 5.3 Celebrations
- [ ] First discovery event → confetti animation on dashboard
- [ ] First discovery email via Resend

### Phase 5 Deliverable
> Users see a dashboard with real-time discovery events, server status, and key metrics.

---

## Phase 6: Payments & Billing (Dodo Payments)

**Goal:** Monetize with Free/Starter/Pro tiers via Dodo Payments.
**Depends on:** Phase 5 complete

### 6.1 Dodo Payments Integration
- [ ] Set up Dodo Payments account and API keys
- [ ] Create subscription products/prices (Starter $29/mo, Pro $49/mo)
- [ ] `lib/payments/dodo.ts` — Dodo Payments SDK/API wrapper
- [ ] Checkout session creation for upgrades
- [ ] Webhook handler for subscription lifecycle events

### 6.2 Plan Enforcement
- [ ] Run migration for `subscriptions` table
- [ ] Enforce plan limits (MCP servers count, discovery events/month)
- [ ] Upgrade prompts at limit thresholds
- [ ] Billing portal / subscription management page

### 6.3 Pricing Page
- [ ] `app/(marketing)/pricing/page.tsx` — Standalone pricing page with checkout CTAs

### Phase 6 Deliverable
> Working subscription billing with plan-gated features and upgrade flows.

---

## Phase 7: Email Sequences & Notifications

**Goal:** Transactional and lifecycle emails via Resend.
**Depends on:** Phase 5 complete (can run parallel with Phase 6)

### 7.1 Email Templates
- [ ] `lib/email/resend.ts` — Resend client + send helpers
- [ ] Welcome email (on signup)
- [ ] MCP Live email (on deployment)
- [ ] First Discovery celebration email
- [ ] Health alert email (server down)
- [ ] Usage limit warning (80% of plan limit)
- [ ] Upgrade nudge (10 events on free plan)

### 7.2 Automated Sequences
- [ ] Day 1: Tool description tips
- [ ] Day 3: Weekly stats
- [ ] Day 7: AI discovery growth tips

### Phase 7 Deliverable
> Automated transactional and lifecycle emails for key user moments.

---

## Phase 8: Registry Submission & SEO

**Goal:** Auto-submit MCP servers to registries + programmatic SEO pages.
**Depends on:** Phase 4 complete

### 8.1 Registry Integration
- [ ] `lib/registries/smithery.ts` — Smithery API submission
- [ ] `app/api/registries/submit/[projectId]/route.ts` — Submit endpoint
- [ ] Registry status tracking in dashboard

### 8.2 Programmatic SEO Pages
- [ ] `app/(marketing)/mcp-server-for/[integration]/page.tsx` — 50+ integration pages
- [ ] `app/(marketing)/how-to-get-discovered-by/[ai-assistant]/page.tsx`
- [ ] `generateStaticParams` for build-time generation
- [ ] Internal linking between SEO pages

### 8.3 Blog
- [ ] `app/(marketing)/blog/page.tsx` — Blog index
- [ ] `app/(marketing)/blog/[slug]/page.tsx` — Blog post template
- [ ] First 2-3 AEO-optimized posts

### Phase 8 Deliverable
> MCP servers auto-submitted to Smithery, programmatic SEO pages live, blog launched.

---

## Phase 9: Polish & Launch Prep

**Goal:** Production-ready for public launch.
**Depends on:** Phases 1-7 complete

### 9.1 Production Hardening
- [ ] Error monitoring (Sentry)
- [ ] Rate limiting on all public endpoints
- [ ] API key encryption audit
- [ ] Security review (OWASP top 10)
- [ ] Performance optimization (Core Web Vitals)

### 9.2 Launch Assets
- [ ] OG image design
- [ ] Product Hunt listing prep
- [ ] X/Twitter launch thread draft
- [ ] Demo video (60s)

### 9.3 Launch Day
- [ ] Product Hunt submission
- [ ] X post with demo video
- [ ] Indie Hackers "Show IH" post
- [ ] Dogfood: submit MCPLaunch's own MCP server to Smithery

### Phase 9 Deliverable
> Public launch on Product Hunt + social channels with a polished, production-ready product.

---

## Future (Post-Launch)

- [ ] Cloudflare Workers migration (per-user isolated MCP servers)
- [ ] OAuth 2.0 auth flow support
- [ ] Custom domain MCP servers
- [ ] GraphQL API support
- [ ] Mobile app
- [ ] Team/org accounts

---

## Progress Tracking

| Phase | Status | Started | Completed |
|---|---|---|---|
| 1. Landing Page | ~90% (pending Vercel deploy) | 2026-04-01 | — |
| 2. Auth & Database | Not Started | — | — |
| 3. Onboarding Wizard | Not Started | — | — |
| 4. MCP Server Hosting | Not Started | — | — |
| 5. Dashboard & Analytics | Not Started | — | — |
| 6. Payments (Dodo) | Not Started | — | — |
| 7. Email Sequences | Not Started | — | — |
| 8. Registry & SEO | Not Started | — | — |
| 9. Polish & Launch | Not Started | — | — |
