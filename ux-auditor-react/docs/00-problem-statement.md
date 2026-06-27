# 00 — Problem Statement

## PS-2: Conversational UX Auditor

**Challenge**
UX audits are expensive, time-consuming, and require expert reviewers. Existing tools detect technical issues but **fail to identify real usability problems.**

**What to Build**
- An AI agent that browses live websites and captures user journeys.
- Generate deployable HTML/CSS fixes with severity ranking.
- Support conversational follow-up questions on audit results.

**Core Requirements**
1. Agentic browser
2. Heuristics + WCAG validation
3. Severity ranking & issue prioritization
4. HTML/CSS code generation
5. Conversational audit assistant

---

## How this is scored (our reading)

The five Core Requirements are a literal checklist — judges will tick each one. Our MVP must visibly demonstrate **all five**, even if shallow. A polished product that nails five beats a deep one that nails three.

But the line that decides the winner is in the Challenge: *"fail to identify **real usability problems**."* The judges are explicitly telling us **not to be another Lighthouse.** The team that most convincingly finds a problem a human expert would catch — and a tool never would — wins.

**Our answer to that line:** the goal-completion agent. We don't scan a page; we attempt a real user's task and report where it gets stuck. Friction in a real task *is* the "real usability problem." See `01-architecture.md`.

### Requirement → how we satisfy it

| Requirement | Our implementation |
|---|---|
| Agentic browser | LLM agent loop drives Playwright toward a goal; reasoning shown live = proof it's agentic. |
| Heuristics + WCAG | axe-core for WCAG; LLM vision pass for Nielsen-style usability + observed friction. |
| Severity ranking | axe `impact` mapped onto **goal-impact** severity; LLM merges, groups, dedupes. |
| HTML/CSS generation | LLM generates before/after fixes from offending element + problem; accept/reject. |
| Conversational assistant | Chat over the saved audit; active mode triggers re-runs. |

### What else earns points (beyond the checklist)
- A defensible **theory of usability** (we have one: goal-completion friction).
- A demo where the agent **visibly does something human** (gets confused, gives up).
- **Honesty** about automated limits (automated checks catch only part of WCAG — we tag findings).
- **Measurable proof** a fix worked (the before/after re-run).
- **Polish** and a clear, fast value story.
