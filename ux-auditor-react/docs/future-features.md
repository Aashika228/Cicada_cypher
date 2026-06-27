# Future Features (post-PS)

Everything here is deliberately **out of the one-day build**. Do not touch any of it until the v1 core (roadmap M0–M4) is green and the demo is rehearsed. Each item: what it is, why it's deferred, and when it earns its place.

---

## Coverage & crawling

**Multi-page crawl.** Audit a whole site, not a few journeys. Follow internal links (BFS) or read `sitemap.xml`, then fan out audits per page.
*Deferred:* slow, token-heavy, and exhaustive coverage doesn't improve usability insight. *Add when:* moving from "demo" to "real audits of a real site."

**Parallel journeys.** Run several goals/personas at once.
*Deferred:* resource + orchestration overhead. *Add when:* on LangGraph with worker fan-out (see below).

---

## Smarter agent

**Two-tier models.** Cheap model drives navigation off the accessibility tree; powerful model does synthesis.
*Deferred:* two models = more moving parts. *Add when:* cost/scale matters.

**Frontend source diffing.** Dump DOM/file diffs per interaction to understand dynamic loading; diff serialized a11y trees between steps.
*Deferred:* time-consuming. *Add when:* you want to catch UX problems tied to dynamic loading, SPA route changes, lazy content.

**Self-improving personas.** Generate personas from real audience data / analytics segments.
*Add when:* integrated with analytics.

---

## Architecture upgrades (friend's research path)

**MCP servers.** `@playwright/mcp` (official) for browsing, axe a11y MCPs, `lighthouse-mcp`, `ux-mcp-server` for Nielsen-heuristic knowledge.
*Deferred:* not on rubric; ~4x token/latency; extra debugging layer. *Add when:* you want a clean tool boundary, multi-client reuse, or a platform rewards MCP. **Never** the archived Anthropic Puppeteer server.

**LangGraph orchestration.** Orchestrator → worker fan-out via `Send`; checkpointed conversational state; `langchain-mcp-adapters` bridge.
*Deferred:* learning-curve trap; a plain loop demos identically. *Add when:* robust parallel journeys + persistence at scale.

**Hosted browsers (Browserbase / Stagehand).** Cloud Chrome, concurrent sessions.
*Add when:* local Chrome is unreliable in the run environment, or you need concurrency.

**chrome-devtools-mcp.** Real performance traces, deep network/CSS debugging.
*Add when:* fix suggestions need performance data.

---

## Output & reporting

**Shareable report export.** Clean PDF + shareable link.
*Add when:* right after the demo works — high polish, low effort, makes it feel shippable.

**Audit history & diffing.** Compare runs over time; "what changed since last audit"; baseline mode.
*Add when:* SQLite history exists (it will) — surface it in the UI.

**Batch fix apply / export patched files.** Accept-all, then download the patched HTML/CSS.
*Deferred:* v1 shows accept on one fix. *Add when:* fixes are reliable.

**Real analytics overlay.** Pair audit findings with real drop-off data (GA4, Hotjar, PostHog) to ground the abandonment story with actual numbers instead of qualitative risk flags.
*Add when:* you can integrate an analytics source. (This is the honest version of the "drop-off probability score" we deliberately did NOT fake.)

---

## Internationalization (scale the wedge)

**Many languages + RTL suite.** Generalize the EN/DE demo to a language list with first-class RTL (Arabic/Hebrew) handling and locale format checks.
*Add when:* the single-language regression is reliable.

**Locale-aware personas.** "First-time user in {region} on a budget Android."
*Add when:* personas are data-driven.

---

## Product / platform

**CI/CD integration.** Run the audit on every PR; fail the build on new `blocker`s.
*Add when:* there's a real team using it on a real repo.

**Accounts, projects, scheduled re-audits.** Multi-user, saved sites, monitoring.
*Add when:* moving from tool to platform (needs a server DB, not just SQLite).

**Production hardening.** Origin allow/block lists on the browser; never run arbitrary page JS on untrusted sites; pinned deps; rate limiting. (Mention in judge Q&A as awareness even pre-build.)
