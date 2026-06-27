# 01 — Architecture (read this first)

This doc is written so anyone on the team can understand the whole system in 10 minutes. No prior context needed.

## The mental model: a robotic mystery shopper

We're building a robotic mystery shopper for websites. You give it an assignment, it walks through the site trying to do something, it scribbles notes the whole time, and at the end it writes a report. Three parts do the work:

- **The brain — an LLM.** It looks at the screen, understands the goal, reasons like a person ("where's the cart? I can't tell — that's confusing"), and decides the next move. It only ever outputs *decisions and text*. It never touches the browser directly.
- **The hands — Playwright.** A tool that controls a real browser through code: open a page, click, type, scroll, screenshot. It has no judgment; it does what it's told.
- **The inspector — axe-core.** A mechanical checklist that scans a page's code for rule violations ("text too faint", "button has no label"). No AI. Runs on the side.

> **The single most important wiring fact:** the prompt talks to the **brain**, not to Playwright. The brain replies with a decision; **our own code (the orchestrator) translates that decision into a Playwright action.** Nothing controls the browser except our code.

## The flow

```
Start context (URL + goal + persona)
   → built into the EXPLORER PROMPT → LLM (brain) decides next action
   → orchestrator translates decision → Playwright (hands) acts on the page
   → capture: screenshot + page outline; axe-core checks the page code
   → write everything to the SCRATCHPAD
   → loop (back to brain) until goal done / failed / step cap
   → SYNTHESIZER PROMPT reads the whole scratchpad → ranked findings + verdict
   → save the finished AuditRun (SQLite)
   → UI shows the report; chat reads it; before/after re-runs the loop
```

The defining idea: **we don't audit a page, we attempt a goal and report the friction.** "Explore mode" is the same engine with a softer goal ("orient yourself like a newcomer"). Our hero persona — *a user who can't read the page language* — forces the agent to navigate on icons and layout alone, surfacing problems no tool catches.

## Components & responsibilities

| Component | Responsibility | Reuse or build |
|---|---|---|
| Browser driver | Open site, click/type/scroll, screenshot, read page outline | **Reuse** (Playwright) |
| WCAG checker | Scan page code, return violations + severity + offending HTML | **Reuse** (axe-core) |
| Orchestrator (agent loop) | Turn brain decisions into Playwright actions; run the step loop with a cap | **Build** |
| Normalizer (middleware) | Turn messy browser/axe output into one clean `Finding`/`JourneyStep` shape | **Build** |
| Synthesizer | Merge friction + axe + heuristics, rank by goal impact, write verdict | **Build** (prompt) |
| Fix generator | Produce before/after HTML/CSS for top issues | **Build** (prompt) |
| Conversational layer | Answer questions; route commands to re-runs | **Build** (prompt) |
| Storage | Save screenshots + steps + final result | **Reuse** (SQLite + disk) |
| Frontend | URL input, live agent view, annotated journey, fix diffs, chat, score | **Build** (shadcn) |

## Tech stack

**Frontend** — Vite + React + TypeScript + Tailwind + **shadcn/ui**. Dark-first; base neutral `stone`, accent `violet`. Talks to the backend over REST + **SSE** (server-sent events) for the live agent stream. Signature element: the live "agent is browsing" view.

**Backend** — Node + TypeScript + **Fastify**. Runs Playwright, axe-core, and the LLM calls. Streams live steps to the frontend via SSE. One shared `types.ts` with the frontend (see `04-api-contracts.md`).

**The brain** — a multimodal LLM via API (default Claude, swappable). Prompts live in `docs/prompts/` (see `05-prompts.md`).

**Storage** — **SQLite** (`better-sqlite3`, single file, no server) for audits + steps + findings. **Screenshots** as image files in a `/screenshots/<auditId>/` folder. The demo cache is just these rows + files, which is why caching is trivial.

## Where prompts run (5 places)

Only one prompt runs *inside* the live loop; the rest run before/after.

1. **Explorer** *(inside loop, every step)* — decides the next action, reasoning, and friction. The make-or-break prompt.
2. **Synthesizer** *(once, at end)* — ranked findings + verdict from the scratchpad.
3. **Fix generation** *(per top issue)* — before/after HTML/CSS.
4. **Chat** *(per user message)* — answers from the report; routes commands to re-runs.
5. **Language comparison** *(optional, the wedge)* — what broke in the second language.

Full templates in `docs/prompts/`.

## Storage shapes (plain)

- **During the run:** screenshots → disk folder; each step (reasoning, action, friction) → a row in the `steps` table (written live so the UI and reloads work).
- **At the end:** the full `AuditRun` (findings + score + verdict) → the `audits` row.
- **No heavy database needed.** SQLite is one file. A server database is a future concern (accounts, scale).

## Key principles (don't violate these)

1. The brain never controls the browser — only the orchestrator does.
2. Lock the shared `types.ts` schema before anyone writes feature code (see `04` and `03-roadmap.md` M0).
3. axe and Lighthouse run *inside* the product as evidence — they are never the headline. The headline is observed friction.
4. Everything streams to the UI: the live agent view is both the wow moment and the proof of "agentic."
5. Tag findings "automated vs needs human review" — honesty reads as maturity.
