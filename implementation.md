# MCPLaunch — Phased Implementation Plan

**Created:** 2026-04-01
**Strategy:** Landing page first (validate interest) → Build product
**Status:** Phase 2 — In Progress

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
- [x] Deploy to Vercel
- [x] Test demo widget end-to-end on production
- [x] Verify OG image / social sharing cards
- [x] Share URL for feedback

### Phase 1 Deliverable
> A live landing page at your Vercel URL with a working AI-powered demo widget. Visitors can try pre-built demos instantly (free) or enter custom products (Haiku API). Result shows zero-cost ad value proposition with metrics.

---

## Phase 2: Authentication & Database

**Goal:** Users can sign up, log in, and have persistent accounts.
**Depends on:** Phase 1 complete

### 2.1 Supabase Setup
- [x] Run database migrations (users table + RLS policies)
- [x] Configure Supabase Auth (magic link + Google OAuth + GitHub OAuth)
- [x] Set up Row Level Security (RLS) policies
- [x] Add Supabase env vars to Vercel

### 2.2 Auth Integration
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`
- [x] `lib/supabase/client.ts` — Browser client
- [x] `lib/supabase/server.ts` — Server client
- [x] `proxy.ts` — Auth proxy for protected routes (Next.js 16 pattern)
- [x] `app/(auth)/login/page.tsx` — Login page (magic link + OAuth buttons)
- [x] `app/(auth)/callback/route.ts` — OAuth callback handler with user sync
- [x] Post-auth redirect logic (no projects → /onboard, else → /dashboard)

### 2.3 User Profile
- [x] Sync Supabase auth user → `users` table on first login
- [x] Basic settings page shell (`app/(app)/settings/page.tsx`)

### Phase 2 Deliverable
> Users can sign up via email/Google/GitHub, log in, and are routed to the appropriate page.

---

## Phase 3: Onboarding Wizard

**Goal:** Users describe their product and AI generates MCP tool definitions.
**Depends on:** Phase 2 complete

### 3.1 Database
- [x] Run migrations for `mcp_projects` and `mcp_tools` tables (SQL provided)
- [x] RLS policies for projects and tools

### 3.2 Onboarding UI (simplified to 3 steps — API connection deferred to dashboard)
- [x] `app/(app)/onboard/page.tsx` — Wizard container with progress bar
- [x] `components/onboard/StepDescribe.tsx` — Product name, description, website URL + tooltips
- [x] `components/onboard/StepReview.tsx` — AI-generated tools list (edit/toggle/delete)
- [x] `components/onboard/StepDeploy.tsx` — Deploy confirmation + animated progress
- [x] `components/onboard/FieldTooltip.tsx` — Reusable tooltip for non-tech users
- [x] `components/onboard/OnboardWizard.tsx` — Wizard shell with step progress
- [x] `lib/onboard-store.ts` — Zustand store for wizard state
- [x] Form validation with Zod

### 3.3 Onboarding API Routes
- [x] `app/api/onboard/analyze/route.ts` — Claude generates tool definitions from description
- [x] `app/api/onboard/save/route.ts` — Saves project + tools to Supabase
- [x] Tool description quality scorer (AI-evaluated 1-10, built into generator)

### 3.4 MCP Generation Engine
- [x] `lib/mcp/generator.ts` — System prompt + Claude Haiku 4.5 for tool generation (AI SDK v6)

### Phase 3 Deliverable
> Users complete a 3-step wizard: describe product → review AI-generated tools → deploy. Tooltips guide non-tech users through each field.

---

## Phase 4: MCP Server Hosting (Next.js Dynamic Routes)

**Goal:** Deploy and host live MCP servers as dynamic routes within the Next.js app.
**Depends on:** Phase 3 complete

### 4.1 MCP Server Runtime
- [x] Install `@modelcontextprotocol/sdk` + `mcp-handler` (Vercel adapter)
- [x] `app/api/mcp/[slug]/[transport]/route.ts` — Dynamic MCP server endpoint per project
  - Reads project config + tools from DB via admin client
  - Serves MCP protocol (Streamable HTTP + SSE via mcp-handler)
  - Logs discovery events per tool call
- [x] MCP server status management (live/paused/error)
- [x] Projects set to "live" status on onboarding completion

### 4.2 Health Checks
- [ ] `lib/mcp/health-check.ts` — Ping MCP endpoint + verify tools
- [ ] Cron endpoint for periodic health checks (deferred to Phase 9)

### 4.3 Discovery Event Tracking
- [x] SQL migration for `discovery_events` table (provided)
- [x] Log each MCP tool call as a discovery event
- [x] Track AI client, tool name, latency, status

### Phase 4 Deliverable
> Each user's MCP server is live at `/api/mcp/{slug}/mcp`, with discovery events logged per tool call.

---

## Phase 5: Dashboard & Analytics

**Goal:** Users can monitor their MCP server performance and AI discovery events.
**Depends on:** Phase 4 complete

### 5.1 Dashboard UI
- [x] `app/(app)/dashboard/page.tsx` — Overview with project cards + event counts
- [x] `app/(app)/dashboard/[projectId]/page.tsx` — Project detail view
- [x] `components/dashboard/MetricsBar.tsx` — Key stats (events, live servers, ad spend saved)
- [x] `components/dashboard/DiscoveryFeed.tsx` — Event feed with AI client detection
- [x] `components/dashboard/MCPServerCard.tsx` — Server status, URL, copy, actions
- [x] `components/dashboard/ProjectDetail.tsx` — Full project view with tools + events
- [x] `components/dashboard/Dashboard.tsx` — Main dashboard shell
- [ ] `components/dashboard/RegistryStatus.tsx` — Smithery / mcp.so listing status (Phase 8)

### 5.2 Analytics
- [x] Analytics served directly from Supabase queries in server components
- [x] Pause/resume server status from project detail page

### 5.3 Celebrations
- [ ] First discovery event → confetti animation on dashboard (deferred)
- [ ] First discovery email via Resend (Phase 7)

### Phase 5 Deliverable
> Users see a dashboard with project cards, discovery event feed, metrics (events, active tools, ad spend saved), and can pause/resume servers.

---

## Phase 6: Payments & Billing (Dodo Payments)

**Goal:** Monetize with Free/Starter/Pro tiers via Dodo Payments.
**Depends on:** Phase 5 complete

### 6.1 Dodo Payments Integration
- [x] Set up Dodo Payments account and API keys
- [x] Create subscription products (Starter $29/mo, Super $49/mo)
- [x] `lib/payments/dodo.ts` — Dodo SDK client + plan definitions + limits
- [x] `app/api/payments/checkout/route.ts` — Checkout session creation
- [x] `app/api/payments/webhook/route.ts` — Webhook handler (active, renewed, on_hold, failed)

### 6.2 Plan Enforcement
- [x] SQL migration for `subscriptions` table (provided)
- [x] Plan limits defined in PLANS config (servers, events/month)
- [x] Settings page with current plan display + upgrade cards
- [ ] Enforce plan limits at runtime (MCP server creation, event logging) — deferred to Phase 9

### 6.3 Pricing Page
- [ ] Standalone marketing pricing page (existing landing page pricing section links to /login)

### Phase 6 Deliverable
> Dodo Payments integrated with checkout flow, webhook handling, subscription tracking, and upgrade UI in settings.

---

## Phase 7: Discovery Tools (Non-API MCP Servers)

**Goal:** MCP servers return real structured product data instead of stubs. Non-technical founders can launch without an API.
**Depends on:** Phase 6 complete
**Design decisions:** Live preview panel on Step 2, Framer Motion cinematic transitions, chat bubble animation on success, speed-first UX.

### 7.1 Database Migration
- [x] New migration in `supabase/migrations/` — alter `mcp_projects`: make `api_base_url` nullable, add `product_website`, `product_metadata` JSONB, `server_mode` TEXT
- [x] Alter `mcp_tools`: add `tool_type`, `static_response` JSONB, make `endpoint_path` and `http_method` nullable

### 7.2 Onboarding Store Update
- [x] `lib/onboard-store.ts` — add `productMetadata` (pricing_plans, key_features, use_cases, target_audience, differentiators, integrations) to zustand store

### 7.3 Onboarding Wizard Restructure (3 → 4 steps with narrative)
- [x] `components/onboard/StepDescribe.tsx` — remove `api_base_url`, add `product_website`, new narrative copy ("Let's introduce your product to AI")
- [x] `components/onboard/StepProductDetails.tsx` — NEW: structured metadata form with live AI preview panel (split-screen), "why AI cares" tooltips, AI readiness bar
- [x] `components/onboard/StepTransition.tsx` — NEW: reusable Framer Motion animated transition between steps (typing/morphing effects, 1-1.5s max)
- [x] `components/onboard/OnboardWizard.tsx` — add Step 2, narrative progress labels (Describe → Teach → Review → Launch), integrate StepTransition between steps
- [x] `components/onboard/StepReview.tsx` — friendly tool names ("Pricing & Plans" not "get_pricing"), expandable "Preview what AI will say", tool_type badges, editable static_response
- [x] `components/onboard/StepDeploy.tsx` — rewritten copy (no MCP jargon), chat bubble animation on success using real user data, share tweet

### 7.4 AI Generation & API Updates
- [x] `lib/mcp/generator.ts` — new system prompt for discovery tools (returns static_response, not action stubs)
- [x] `app/api/onboard/analyze/route.ts` — pass product metadata to generator, expect discovery tools back
- [x] `app/api/onboard/save/route.ts` — save `product_website`, `product_metadata`, `tool_type`, `static_response`, set `server_mode` to 'discovery'

### 7.5 MCP Server Handler
- [x] `app/api/mcp/[slug]/[transport]/route.ts` — return `static_response` for discovery tools instead of stub

### 7.6 Dashboard Placeholder
- [x] Add "Connect your API" placeholder card on project detail page (links to future connect-api page)

### Phase 7 Deliverable
> Users complete a 4-step narrative onboarding (Describe → Teach → Review → Launch). MCP servers return real product data. No API key or technical knowledge required. Live preview shows AI responses as users type.

---

## Phase 8: Email Sequences & Notifications

**Goal:** Transactional and lifecycle emails via Resend.
**Depends on:** Phase 5 complete (can run parallel with Phase 7)

### 8.1 Email Templates
- [ ] `lib/email/resend.ts` — Resend client + send helpers
- [ ] Welcome email (on signup)
- [ ] MCP Live email (on deployment)
- [ ] First Discovery celebration email
- [ ] Health alert email (server down)
- [ ] Usage limit warning (80% of plan limit)
- [ ] Upgrade nudge (10 events on free plan)

### 8.2 Automated Sequences
- [ ] Day 1: Tool description tips
- [ ] Day 3: Weekly stats
- [ ] Day 7: AI discovery growth tips

### Phase 8 Deliverable
> Automated transactional and lifecycle emails for key user moments.

---

## Phase 9: Registry Submission & SEO

**Goal:** Auto-submit MCP servers to registries + programmatic SEO pages.
**Depends on:** Phase 4 complete

### 9.1 Registry Integration
- [ ] `lib/registries/smithery.ts` — Smithery API submission
- [ ] `app/api/registries/submit/[projectId]/route.ts` — Submit endpoint
- [ ] Registry status tracking in dashboard

### 9.2 Programmatic SEO Pages
- [ ] `app/(marketing)/mcp-server-for/[integration]/page.tsx` — 50+ integration pages
- [ ] `app/(marketing)/how-to-get-discovered-by/[ai-assistant]/page.tsx`
- [ ] `generateStaticParams` for build-time generation
- [ ] Internal linking between SEO pages

### 9.3 Blog
- [ ] `app/(marketing)/blog/page.tsx` — Blog index
- [ ] `app/(marketing)/blog/[slug]/page.tsx` — Blog post template
- [ ] First 2-3 AEO-optimized posts

### Phase 9 Deliverable
> MCP servers auto-submitted to Smithery, programmatic SEO pages live, blog launched.

---

## Phase 10: Polish & Launch Prep

**Goal:** Production-ready for public launch.
**Depends on:** Phases 1-8 complete

### 10.1 Production Hardening
- [ ] Error monitoring (Sentry)
- [ ] Rate limiting on all public endpoints
- [ ] API key encryption audit
- [ ] Security review (OWASP top 10)
- [ ] Performance optimization (Core Web Vitals)

### 10.2 Launch Assets
- [ ] OG image design
- [ ] Product Hunt listing prep
- [ ] X/Twitter launch thread draft
- [ ] Demo video (60s)

### 10.3 Launch Day
- [ ] Product Hunt submission
- [ ] X post with demo video
- [ ] Indie Hackers "Show IH" post
- [ ] Dogfood: submit MCPLaunch's own MCP server to Smithery

### Phase 10 Deliverable
> Public launch on Product Hunt + social channels with a polished, production-ready product.

---

## Phase 11: Theme Revamp (InvoiceCop Design System)

**Goal:** Revamp the entire app's look and feel to match the InvoiceCop design language — clean, professional, light-first — while keeping every feature intact.
**Reference:** `themerevamp.md`
**Depends on:** Independent — can run in parallel with any phase
**Rule:** Zero functional changes. Only visual/styling updates. All features, routes, state, and logic remain untouched.

### What Changes

| Aspect | Current (MCPLaunch) | Target (InvoiceCop) |
|---|---|---|
| Fonts | DM Sans / Space Mono / JetBrains Mono | Manrope / Geist Mono |
| Color model | HSL hex (#00E5FF, #050A14) | OKLCH perceptual color space |
| Theme | Dark-only (forced) | Light default + dark mode (system-aware) |
| Primary color | Cyan (#00E5FF) | Purple/Violet (oklch 0.491 0.27 292.581) |
| Background | Animated gradient navy (#050A14) | Clean white (light) / near-black (dark) |
| Card style | Semi-transparent gray (`bg-gray-900/50`) | Solid `bg-card` with subtle `ring-1 ring-foreground/10` |
| Buttons | Custom cyan/gray, varied sizes | Standardized 7 variants × 8 sizes (shadcn Mira) |
| Typography | Mixed, heading font in mono | Clean hierarchy: 2xl→sm→xs with Manrope |
| Animations | Heavy Framer Motion (stagger, scroll) | Subtle 100ms transitions, zoom-in dialogs |
| Vibe | Sci-fi / hacker / neon | Professional / clean / "Notion meets Linear" |

---

### 11.1 Design Foundation (do first — everything else depends on this)

- [x] **Fonts**: Replace DM Sans → Manrope, JetBrains Mono → Geist Mono in `app/layout.tsx`. Remove Space Mono. Update CSS variables `--font-sans`, `--font-mono`. Remove `--font-heading`.
- [x] **Color palette**: Rewrite `app/globals.css` — replace all HSL hex values with OKLCH tokens from `themerevamp.md`. Define both `:root` (light) and `.dark` (dark) variable sets.
- [x] **Remove custom brand colors**: Delete `--mcpl-cyan`, `--mcpl-green`, `--mcpl-navy`, `--mcpl-deep` variables and all references across codebase.
- [x] **Remove animated background**: Delete the gradient keyframe animation and grid overlay from `body` in `globals.css`. Replace with clean `bg-background`.
- [x] **Border radius tokens**: Update `--radius` scale to match themerevamp.md values (already close, verify).
- [x] **Chart colors**: Replace cyan/green chart palette with olive/green OKLCH chart tokens.
- [x] **Sidebar colors**: Replace `--sidebar-*` variables with new palette equivalents.
- [x] **Theme provider**: Update `app/layout.tsx` to remove forced `dark` class. Ensure `ThemeProvider` uses `defaultTheme="system"` with `enableSystem`. Both light and dark modes must work.

### 11.2 UI Component Library (shadcn/ui restyling)

- [x] **Button** (`components/ui/button.tsx`): Update all variant colors — default uses `bg-primary`, hover uses `/80` opacity. Add `active:translate-y-px` press effect. Ensure all 8 sizes match themerevamp spec.
- [x] **Card** (`components/ui/card.tsx`): Replace `border-gray-800` / `bg-gray-900/50` with `bg-card` + `ring-1 ring-foreground/10`. Remove any transparency.
- [x] **Badge** (`components/ui/badge.tsx`): Ensure pill shape (`rounded-full`), `h-5`, `text-[0.625rem]`. Verify all variants.
- [x] **Input** (`components/ui/input.tsx`): Update to `h-7`, `bg-input/20 dark:bg-input/30`, new focus ring (`focus-visible:ring-2 focus-visible:ring-ring/30`).
- [x] **Textarea** (`components/ui/textarea.tsx`): Match input styling with consistent border, background, and focus states.
- [x] **Accordion** (`components/ui/accordion.tsx`): Verify border and hover colors use new tokens.
- [x] **Sheet** (`components/ui/sheet.tsx`): Update overlay backdrop, entry/exit animations to `zoom-in-95`/`zoom-out-95`.
- [x] **Tooltip** (`components/ui/tooltip.tsx`): Update to `shadow-xl` with new background tokens.
- [x] **Progress** (`components/ui/progress.tsx`): Update track and fill colors to new palette.
- [x] **Separator** (`components/ui/separator.tsx`): Use `bg-border` token.

### 11.3 Landing Page

All sections keep their content, copy, and functionality. Only visual treatment changes.

- [x] **Navbar** (`components/landing/Navbar.tsx`): Replace cyan/navy colors with purple primary. Sticky header with `backdrop-blur-md`. Logo text color to `text-primary`. CTA button to `bg-primary text-primary-foreground`. Remove neon glow effects.
- [x] **Hero** (`components/landing/Hero.tsx`): Replace cyan-to-green gradient text with purple-based gradient. Update terminal animation colors (green text → muted-foreground, dark bg → card bg). Replace sci-fi background effects with clean layout. Keep typewriter animation but with new palette.
- [x] **LiveDemo** (`components/landing/LiveDemo.tsx`): Update form styling to new input/button tokens. Replace cyan accents with primary purple. Update result cards to new card style. Keep all interactive functionality.
- [x] **HowItWorks** (`components/landing/HowItWorks.tsx`): Update step cards to new card style. Replace chevron/icon colors. Keep equal-height layout and content.
- [x] **ProblemSection** (`components/landing/ProblemSection.tsx`): Update comparison card backgrounds and accent colors. Keep before/after content.
- [x] **DiscoveryFeed** (`components/landing/DiscoveryFeed.tsx`): Update ticker styling to new palette. Replace cyan pulse effects with subtle `animate-pulse` on status dots. Keep auto-scroll.
- [x] **Pricing** (`components/landing/Pricing.tsx`): Replace cyan border/shadow on highlighted plan with `border-primary` + `shadow-md`. Update all card backgrounds and text colors. Keep tier content and CTAs.
- [x] **FAQ** (`components/landing/FAQ.tsx`): Update accordion hover/active colors to primary. Keep JSON-LD schema and all Q&A content.
- [x] **CTAFooter** (`components/landing/CTAFooter.tsx`): Update background and CTA button to new palette. Keep copy.
- [x] **Footer** (`components/landing/Footer.tsx`): Update link colors and background. Keep all links and content.
- [x] **Background** (`app/page.tsx`): Remove `bg-[var(--mcpl-deep)]`. Use clean `bg-background`.
- [x] **Tone down Framer Motion**: Reduce heavy stagger/scroll animations to subtle `transition-all duration-100` or light fade-ins. Keep layout animations where they add clarity (e.g., accordion open/close).

### 11.4 Auth Pages

- [x] **Login** (`app/(auth)/login/page.tsx`): Replace dark navy background with `bg-background`. Update form card to new card style. Replace cyan accents on OAuth buttons and magic link input with primary purple. Keep all auth logic intact.

### 11.5 App Shell & Navigation

- [x] **AppShell** (`components/app/AppShell.tsx`): Replace `bg-[var(--mcpl-deep)]` with `bg-background`. Update layout structure to match: sticky header + `flex-1` main content area.
- [x] **Sidebar** (`components/app/Sidebar.tsx`): Replace `bg-[var(--mcpl-navy)]` with `bg-card` or `bg-sidebar`. Replace cyan active states (`bg-[var(--mcpl-cyan)]/10 text-[var(--mcpl-cyan)]`) with `bg-primary/10 text-primary`. Update nav item hover to `bg-muted`. Update all hardcoded gray/navy colors. Keep navigation items, project list, and sign-out.
- [x] **Mobile sidebar**: Update Sheet trigger and overlay colors. Keep hamburger menu behavior.

### 11.6 Dashboard

- [x] **Dashboard page** (`app/(app)/dashboard/page.tsx`): Replace any hardcoded background colors with tokens. Keep redirect logic and data fetching.
- [x] **MetricsBar** (`components/dashboard/MetricsBar.tsx`): Replace colored icon backgrounds (cyan/green/yellow) with semantic status colors from themerevamp (blue/green/amber). Replace `border-gray-800` with `border-border`. Keep metric calculations.
- [x] **MCPServerCard** (`components/dashboard/MCPServerCard.tsx`): Restyle to new card treatment (`bg-card`, `ring-1 ring-foreground/10`). Update status badges to semantic colors (Live→green, Draft→zinc, Paused→amber, Error→red per themerevamp). Replace code block styling. Keep copy button, stats, and navigation.
- [x] **ProjectDetail** (`components/dashboard/ProjectDetail.tsx`): Update all card containers, tool list styling, event feed colors. Replace cyan/green accents with primary/semantic colors. Keep pause/resume, tool display, and event data.
- [x] **DiscoveryFeed** (`components/dashboard/DiscoveryFeed.tsx`): Update event row styling to new palette. Keep AI client detection and event data.

### 11.7 Onboarding Wizard

- [x] **OnboardWizard** (`components/onboard/OnboardWizard.tsx`): Update progress indicator colors — active step uses `bg-primary`, completed uses `bg-primary`, inactive uses `bg-muted`. Replace connecting line colors. Update step labels typography to new hierarchy. Keep step logic and transitions.
- [x] **StepDescribe** (`components/onboard/StepDescribe.tsx`): Update form inputs to new input style. Replace error text colors with `text-destructive`. Update character counter styling. Keep validation and field tooltips.
- [x] **StepProductDetails** (`components/onboard/StepProductDetails.tsx`): Update form styling and preview panel to new palette. Keep all metadata fields and AI preview functionality.
- [x] **StepReview** (`components/onboard/StepReview.tsx`): Update tool cards to new card style. Replace badge colors with semantic variants. Keep edit/toggle/delete functionality and all tool data display.
- [x] **StepDeploy** (`components/onboard/StepDeploy.tsx`): Update deployment progress animation colors. Replace success state styling (green/cyan → primary). Keep deploy logic and animated progress.
- [x] **StepTransition** (`components/onboard/StepTransition.tsx`): Update animation colors to new palette. Keep transition messaging and timing.
- [x] **GeneratingOverlay** (`components/onboard/GeneratingOverlay.tsx`): Update overlay background and spinner colors. Keep loading state logic.
- [x] **FieldTooltip** (`components/onboard/FieldTooltip.tsx`): Update tooltip to new `shadow-xl` style with updated background. Keep tooltip content.

### 11.8 Settings

- [x] **SettingsContent** (`components/app/SettingsContent.tsx`): Update plan badge colors (Free→zinc, Starter→primary, Pro→green per semantic status colors). Update upgrade card styling to new card treatment. Replace cyan/green pricing accents with primary. Keep all plan data, upgrade logic, and account info.

### 11.9 Final QA Pass

- [x] Grep for any remaining hardcoded colors: `#00E5FF`, `#39FF14`, `#050A14`, `#0D1526`, `mcpl-cyan`, `mcpl-green`, `mcpl-navy`, `mcpl-deep`, `gray-800`, `gray-900`, `gray-700` — replace all with design tokens.
- [x] Grep for `bg-\[var\(--mcpl` and `text-\[var\(--mcpl` — zero remaining references.
- [ ] Test light mode end-to-end on every page (currently untested since app was dark-only).
- [ ] Test dark mode end-to-end on every page.
- [ ] Test keyboard theme toggle ("D" key).
- [ ] Verify all Framer Motion animations still work (reduced but functional).
- [ ] Verify mobile responsive layouts on all pages.
- [ ] Verify focus states, error states, disabled states across all interactive elements.
- [ ] Verify status badges render correctly in both themes (dashboard, onboard).

### Phase 11 Deliverable
> Every page matches the InvoiceCop design language: Manrope font, OKLCH purple palette, light-first with dark mode, clean card surfaces, subtle animations. All features remain fully functional. Zero regressions.

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
| 1. Landing Page | Complete | 2026-04-01 | 2026-04-02 |
| 2. Auth & Database | Complete | 2026-04-02 | 2026-04-02 |
| 3. Onboarding Wizard | Complete | 2026-04-02 | 2026-04-02 |
| 4. MCP Server Hosting | Complete | 2026-04-02 | 2026-04-02 |
| 5. Dashboard & Analytics | Complete | 2026-04-02 | 2026-04-02 |
| 6. Payments (Dodo) | Complete | 2026-04-02 | 2026-04-02 |
| 7. Discovery Tools | Complete | 2026-04-02 | 2026-04-02 |
| 8. Email Sequences | Not Started | — | — |
| 9. Registry & SEO | Not Started | — | — |
| 10. Polish & Launch | Not Started | — | — |
| 11. Theme Revamp | Complete | 2026-04-02 | 2026-04-02 |
