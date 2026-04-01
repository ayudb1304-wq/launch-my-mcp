# MCPLaunch — Go-To-Market Strategy

**Created:** 2026-04-02
**Status:** Pre-launch
**Window:** 6-12 months before MCP hosting becomes a commodity feature

---

## The Brutal Reality

Before strategy, let's be honest about what we're up against:

1. **MCP generation is being commoditized.** Stainless, Speakeasy, Mintlify, and Cloudflare all offer "API to MCP" features. Generating an MCP server from a description is not defensible.

2. **Hosting is not a moat.** Cloudflare Workers, Vercel, and AWS can host MCP servers for pennies. No one will pay $29/mo just for hosting.

3. **Discovery doesn't exist yet at scale.** There is no "Google for MCP." Users manually add server URLs. The "zero-CAC distribution" promise is aspirational, not proven.

4. **Big companies will build in-house.** Stripe, Twilio, Datadog — they already have or will build their own MCP servers. They're not our customer.

5. **Small developers won't pay.** A solo dev can set up an MCP server with the SDK in an afternoon. We need to offer more than convenience.

**If we build just another "generate and host" tool, we will fail.**

---

## What We Actually Sell

Not MCP hosting. We sell **distribution to AI assistants.**

The pitch: *"Your product has an MCP server. Now what? Who discovers it? MCPLaunch doesn't just host your server — we get it listed on every registry, optimize it for AI discoverability, and show you exactly when and where AI assistants recommend your product."*

**The value chain:**
```
Generate MCP → Host it → Submit to ALL registries → Optimize for AI discoverability → Track discovery events → Report ROI
                ↑                                                                                                    ↑
         Commodity (free tier)                                                                          What people pay for
```

---

## Target Customer (ICP)

### Primary: Mid-Market SaaS (Series A-C) with APIs

- **Who:** 20-200 person SaaS companies with existing APIs but no dedicated DevRel team
- **Pain:** They know AI distribution matters but don't have bandwidth to build MCP servers, submit to registries, maintain listings, and track performance
- **Budget:** $50-500/mo is trivial against their CAC (typically $200-2000 per customer)
- **Examples:** Project management tools, invoicing SaaS, booking platforms, CRM tools, data providers
- **Where they are:** IndieHackers, X/Twitter SaaS circles, Product Hunt, SaaS-focused Slack/Discord communities

### Secondary: API-First Developer Tools

- **Who:** Companies whose product IS an API (weather data, financial data, search, email APIs)
- **Pain:** Their entire business depends on developers finding them. MCP is a new discovery channel they can't ignore
- **Budget:** Higher willingness to pay — this is core to their distribution

### NOT Our Customer

- Big tech with in-house DevRel (they'll build their own)
- Companies without APIs (nothing to expose via MCP)
- Hobbyists who can do it themselves and don't care about distribution

---

## Positioning

### Tagline Options
- "Get your product recommended by AI assistants" (current — good)
- "MCP distribution for SaaS" (clearer for ICP)
- "The SEO of AI — make sure Claude, ChatGPT, and Copilot know your product exists"

### Competitive Positioning

| Competitor | What they do | Our angle |
|---|---|---|
| Stainless/Speakeasy | Generate MCP from OpenAPI spec | They generate. We generate, host, distribute, AND track. |
| Cloudflare Workers | Host MCP servers | They're infrastructure. We're the full-stack solution. |
| Smithery | Registry + hosting | They're one registry. We submit to ALL registries. |
| Composio | Pre-built connectors for popular SaaS | They do big SaaS. We do YOUR SaaS. |
| DIY (SDK) | Build it yourself | 5 minutes vs. 5 days. Plus ongoing registry maintenance. |

### The One-Liner

*"Cloudflare hosts your MCP server. Smithery lists it. MCPLaunch does both — plus every other registry — and shows you the ROI."*

---

## Pre-Launch Strategy (Weeks 1-4)

### Week 1-2: Build Credibility Before Asking for Money

**Dogfood aggressively.** Create MCP servers for 20-30 popular open-source tools and SaaS products (with permission or as community contributions). List them on Smithery and mcp.so. This:
- Proves the platform works
- Generates real discovery events we can screenshot
- Creates social proof ("Powering 30+ MCP servers")
- Gets us familiar with every registry's submission process

**Target list for dogfooding:**
- Your own products (Ceal, VayuBridge, Query2Mail)
- Open-source tools that don't have MCP servers yet (search GitHub)
- Complementary SaaS tools whose founders you can reach on X/Twitter

### Week 2-3: Content That Builds Authority

**Write 3-5 high-value posts (not promotional):**
1. "I submitted my product to every MCP registry. Here's what happened." — Raw data on which registries drive discovery, how long indexing takes, what formats work best. This becomes the definitive guide.
2. "The MCP server checklist: 10 things that make AI assistants actually use your tools" — Practical, actionable, positions us as the expert.
3. "I tracked 1,000 MCP discovery events. Here's which AI assistants call tools the most." — Data from our dogfooding. Irresistible to SaaS founders.

**Distribute on:**
- X/Twitter (tag @alexalbert__, @swyx, MCP community)
- IndieHackers (long-form "Show IH")
- r/mcp, r/ClaudeAI, r/SaaS
- Dev.to / Hashnode
- Simon Willison's blog (pitch him — he covers MCP extensively)

### Week 3-4: Build Waitlist With Real Value

**Don't launch yet.** Instead:
- Set up a waitlist on the landing page with a specific promise: "We'll create your MCP server and submit it to 5 registries. Free for the first 50 companies."
- The "free for first 50" creates urgency AND gives us case studies
- Reach out directly to 20-30 SaaS founders you know or can find on X/Twitter. Offer to build their MCP server personally.

---

## Launch Strategy (Week 5)

### Product Hunt Launch

**Timing:** Tuesday or Wednesday, 12:01 AM PST

**Prep:**
- 10+ makers/friends ready to upvote and comment in first hour
- GIF/video showing: describe product → AI generates tools → MCP server live → discovery event appears in dashboard (30-60 seconds)
- Have 5+ real customer testimonials from the free-50 cohort
- Maker comment with real data: "We've already powered X MCP servers with Y discovery events"

**PH listing angle:** "Turn your SaaS into something AI assistants recommend — in 5 minutes"

### Simultaneous Launch Posts

- X/Twitter thread: "We helped 50 SaaS products get discovered by AI. Here's what we learned." (data-driven, not promotional)
- IndieHackers: "Show IH: I built MCPLaunch — and here's our MRR from week 1"
- HackerNews: Frame as technical/interesting, not promotional. "MCP adoption data: which AI assistants actually call tools?" with a mention that the data comes from MCPLaunch.

---

## Conversion Strategy

### Why Free Users Upgrade

The free tier must be genuinely useful (1 MCP server, hosted, working). But it must create **visible jealousy** of what paid gets:

| Trigger | What they see | What paid gets |
|---|---|---|
| Dashboard shows 0 events | "Submit to registries to get discovered" | Auto-registry submission |
| 1 server limit hit | "Your second product is ready — upgrade to deploy" | 3-10 servers |
| Basic analytics | Event count only | AI client breakdown, trends, tool popularity |
| Manual registry submission | DIY instructions | One-click submit to all registries |

**The paywall moment is perfectly placed:** User describes their second product, sees AI-generated tools (value demonstrated), clicks deploy → paywall. They've already invested time and seen the quality. This is the highest-conversion moment.

### Pricing Validation

- **Free:** 1 MCP server, basic hosting. Proves the product works.
- **Starter ($29/mo):** 3 servers, registry submission, analytics. For solo founders with multiple products.
- **Super ($49/mo):** 10 servers, unlimited events, priority registry listing, health monitoring. For growing SaaS companies.

**Future consideration:** Usage-based pricing for enterprise (per-discovery-event). If an MCP server drives 10,000 tool calls/month, that's worth far more than $49/mo to the customer.

---

## Growth Loops

### Loop 1: Registry Submission → Discovery → Dashboard Event → Social Sharing
User creates MCP → we submit to Smithery → AI assistant discovers it → user sees event in dashboard → user tweets about it → other SaaS founders see → they sign up

### Loop 2: Public MCP Pages → SEO → Organic Signup
Each project gets a public page at `/mcp/[slug]`. These rank for "[product] MCP server" and "MCP server for [category]". Visitors land on it, click "Create your own" → signup.

### Loop 3: /.well-known/mcp.json → AI Client Crawling → More Discovery
AI clients check `/.well-known/mcp.json` → find servers → call tools → events appear → users see value → upgrade + refer

### Loop 4: Weekly Report Email → Re-engagement
Even 0-event weeks drive engagement: "Your server is live on 3 registries. Here's how to boost visibility." Keeps users from churning during the slow early days.

---

## Metrics That Matter

### North Star: Weekly Active MCP Servers with >0 Discovery Events
Not signups. Not MRR. The number of servers that AI assistants actually call. If this number grows, everything else follows.

### Leading Indicators
- Registry submission success rate (are listings going live?)
- Time from signup to first discovery event
- Dashboard return rate (are users checking back?)
- Upgrade conversion rate at the paywall moment

### Lagging Indicators
- MRR
- Churn rate
- NPS

---

## Risk Mitigation

### Risk 1: "MCP discovery never takes off"
**Mitigation:** Pivot the value prop from "AI discovery" to "AI-ready API wrapper." Even without organic discovery, companies want their APIs accessible to AI agents for internal use (enterprise AI assistants calling internal tools via MCP).

### Risk 2: "Cloudflare/Vercel offer free MCP hosting"
**Mitigation:** They'll commoditize hosting but not distribution. Double down on registry submission, optimization, and analytics — the layers above hosting.

### Risk 3: "No one pays $29/mo when they can DIY"
**Mitigation:** The DIY cost isn't just building the server — it's maintaining it, submitting to registries, updating when the MCP spec changes, monitoring health. Position as "managed MCP" like managed databases. No one runs their own Postgres anymore.

### Risk 4: "Protocol fragmentation — Google/OpenAI fork MCP"
**Mitigation:** This risk has decreased significantly now that ChatGPT, Gemini, and Copilot all support MCP. If anything, convergence is accelerating. Monitor but don't panic.

### Risk 5: "We can't show ROI to users"
**Mitigation:** This is the biggest real risk. Attack it with:
- Auto-test events on deploy (immediate gratification)
- Public landing pages (measurable SEO traffic)
- Registry listing proof (screenshots of live listings)
- Weekly reports with actionable tips
- Projected reach numbers ("Your tools are now accessible to 200M+ ChatGPT users")

---

## 90-Day Roadmap

| Week | Focus | Key Metric |
|---|---|---|
| 1-2 | Dogfood 20-30 MCP servers, write first content piece | 30 servers live |
| 3-4 | Content blitz (3 posts), direct outreach to 30 founders, build waitlist | 50 waitlist signups |
| 5 | Product Hunt launch + social blitz | 200 signups, 10 paying |
| 6-8 | Onboard free-50 cohort, collect testimonials, iterate on dashboard | First real discovery events across users |
| 9-10 | Auto registry submission feature live, public MCP pages | 100+ registry-listed servers |
| 11-12 | Weekly report emails, referral program, second content push | $1K MRR, 50 paying users |

---

## The Honest Bottom Line

MCPLaunch has a real window of opportunity. MCP is crossing the adoption chasm right now — every major AI client supports it, but most SaaS companies haven't built MCP servers yet. The "generate and host" part is table stakes. **The business is in distribution.**

If we execute on registry submission, public landing pages, and analytics — and do it before Cloudflare/Vercel bundle MCP hosting into their platforms — we can own the "MCP distribution" category.

If we just host MCP servers and wait for organic traffic, we will fail.

Move fast. Distribution is the moat. The clock is ticking.
