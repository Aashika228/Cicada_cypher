# 02 — Build vs Reuse

> Based on the MCP/tooling research originally compiled by [friend], reframed for our revised v1 architecture (no MCP, no LangGraph in v1 — see "Deferred" for why and when to add them).

## The principle

Reuse the browser plumbing and the WCAG engine. **Build the differentiated layer**: the agent loop, the normalizer, the prompts (ranking, fix synthesis, conversation), and the frontend. We are *not* building a browser controller or a WCAG engine.

## v1 — what we REUSE (use directly as libraries)

| Need | Library | Why |
|---|---|---|
| Browser control | **Playwright** (`playwright`) | First-party, maintained by Microsoft; cross-browser; gives both screenshots **and** an accessibility-tree "page outline" the brain reads cheaply (~300 tokens vs 10k+ for a screenshot). |
| WCAG checks | **axe-core** via `@axe-core/playwright` | Returns `impact` (critical/serious/moderate/minor), the offending `html`, the selector, and a `failureSummary` with fix text — for free. This single library covers most of "WCAG validation" and seeds "severity ranking." |
| Perf / one score | **Lighthouse** (optional) | One number feeding the overall UX score (Core Web Vitals, perf, SEO). Add only if time allows. |
| Visual diff | **pixelmatch** | Compare screenshots for the cross-language regression (the same lib Playwright uses internally). |
| Storage | **better-sqlite3** | One-file database, no server, synchronous API — fast to wire. |
| Backend | **Fastify** | Lightweight Node/TS server; easy SSE for the live stream. |
| LLM SDK | provider SDK (default Anthropic) | Calls the brain. Keep calls behind one wrapper so the provider is swappable. |
| UI kit | **shadcn/ui** + Tailwind | Polished, accessible components fast; skin it (dark + violet) so it isn't default-looking. |

## v1 — what we BUILD (our actual work)

- **Orchestrator / agent loop** — translates brain decisions into Playwright actions; runs the step loop with a hard cap + timeout; captures per step.
- **Normalizer (middleware)** — turns messy DOM/axe/console output into the clean `Finding` / `JourneyStep` shapes. (This is the "puppeteer data is bad format → middleware" fix; it's what keeps the brain and UI sane.)
- **Synthesizer** — merge friction + axe + heuristics, map to goal-impact severity, group, dedupe, write the verdict.
- **Fix generator** — before/after HTML/CSS for top issues.
- **Conversational layer** — Q&A over the report + command routing (re-runs).
- **Frontend** — the live agent view, annotated journey, fix diffs, chat, score.

## Deferred — friend's research, preserved (add post-v1)

These are correct and well-researched choices for a **multi-day or production** build. We're not using them in v1 because they add overhead/latency/learning-curve we can't afford in one day, and none are on the rubric. When we scale, this is the path:

| Deferred tech | What it gives | Why deferred / when to add |
|---|---|---|
| **`@playwright/mcp`** (official, Microsoft) | Agent-facing browser tools over MCP (40+ tools, a11y snapshots) | Adds a tool-server layer + ~4x token cost (~114k vs ~27k per task per the 2026 benchmark). Add if a clean tool boundary or multi-client reuse is wanted, or if a platform rewards MCP. **Use this, never the archived Anthropic Puppeteer server.** |
| **axe a11y MCPs** (`a11y-mcp-server`, `mcp-accessibility-scanner`) | axe-core over MCP, plus crawl/keyboard/matrix audits | We call axe-core directly in v1. The scanner's `audit_site` (crawl) + `audit_keyboard` are great for the multi-page future. |
| **`@danielsogl/lighthouse-mcp`** | Perf/SEO/CWV over MCP | We use Lighthouse directly if at all. |
| **`elsahafy/ux-mcp-server`** | Nielsen-heuristic + WCAG knowledge base | Our heuristic reasoning is prompt-driven in v1; this is a richer knowledge layer later. |
| **LangGraph + `langchain-mcp-adapters`** | Orchestrator→worker fan-out, checkpointed conversation | A plain agent loop demos identically and ships faster. Add for robust parallel journeys + persistence at scale. |
| **Browserbase / Stagehand** | Hosted cloud browsers | Add if local Chrome is unreliable in the demo env, or for concurrent sessions in production. |
| **chrome-devtools-mcp** | Perf traces, deep network/CSS debug | Add when fix suggestions need real performance traces. |

### Hard warnings (carry into Q&A)
- **The Anthropic Puppeteer reference MCP is archived and unmaintained** with known security advisories (SSRF, prompt-injection). Do not use it. This is why we chose Playwright over Puppeteer.
- Browser agents can navigate to internal IPs and run page JS — in production, set origin allow/block lists and never run arbitrary page JS on untrusted sites. (Good thing to *mention* to judges; signals security awareness.)
- Automated checks (axe, Lighthouse) catch only a subset of WCAG. Always present them as automated, and tag findings that need human review.
- The closest all-in-one tool to our concept, Operative's `web-eval-agent`, is **sunset** — inspiration only, not a dependency.
- Pin dependency versions; avoid `@latest` in committed config.
