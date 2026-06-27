# Wayfarer — Product Overview

> Working name: **Wayfarer** (rename freely). One who journeys through your site and reports where travelers get lost.

## One-line pitch

Wayfarer is an **agentic UX consultant**: it experiences your website the way a real user would — *including a user who can't read the language* — tries to accomplish a goal, narrates exactly where it gets stuck, ranks that friction by how much it blocks the goal, generates the code fixes, and **re-runs to prove the fixes worked.** All of it conversational.

## The core insight (why this is different)

Every other team will run axe-core and Lighthouse and show a list of code violations. But **a contrast warning is not a usability problem.** "Color contrast 3.2:1" is not "users can't find the checkout button."

Wayfarer's difference: it doesn't *scan a page*, it **attempts a task and reports the struggle.** The audit *is* the story of where a real user would fail. That is the one thing automated tools cannot do — and it's exactly what the problem statement says existing tools miss: *"real usability problems."*

Our hero lens makes this undeniable: a persona who **cannot read the page language** has to navigate on icons, layout, and affordances alone. That surfaces findability and visual-hierarchy failures no tool catches — and fuses usability with internationalization, a space literally no one audits today.

## What it does (capabilities)

- Paste a URL, pick a goal + persona → get a consultant-grade UX audit in minutes instead of weeks.
- Watch the agent browse **live**, with its reasoning visible step by step.
- See an **annotated journey**: the actual screenshots, with friction points marked where the agent hesitated, backtracked, or hit a dead end.
- Get findings that combine **WCAG checks (axe-core)** with **heuristic usability reasoning (LLM)** — merged, deduped, and **ranked by goal impact**, not by a generic severity label.
- Read a plain-English **verdict**: "the 3 things costing you customers."
- Generate **deployable HTML/CSS fixes**, review them as before/after diffs, accept or reject.
- **Prove the fix worked**: re-run the same task and compare metrics ("7 steps → 4 steps, 2 hesitations → 0").
- Catch **cross-language UX breakage**: "converts in English, silently fails in German."
- **Ask follow-up questions** ("why is issue #3 critical?") and **issue commands** ("now try it on mobile") that trigger a fresh run.
- Track an **overall UX score (A–F)** and per-category breakdown; keep a **history** of past audits.

## Full feature list

| Feature | What it is | Status |
|---|---|---|
| Goal-directed agentic browsing | Agent pursues a real task, not a checklist | v1 core |
| Explore mode | Same engine, goal = "orient like a newcomer" | v1 core |
| Persona auditing | Adopts a user type; hero = "can't read the language" | v1 core |
| Live agent view | Streamed reasoning + screenshots while running | v1 core |
| Annotated journey | Screenshots with friction marked | v1 core |
| WCAG findings | axe-core, severity + offending HTML + fix text | v1 core |
| Heuristic findings | LLM vision reasoning (Nielsen-style) | v1 core |
| Goal-impact severity | Ranked by how much it blocks the goal | v1 core |
| Issue grouping | By category (nav, forms, content, i18n…) | v1 core |
| Consultant verdict | Top 3 issues, business-framed | v1 core |
| Fix generation | HTML/CSS before/after + rationale | v1 core |
| Accept/reject fix | Per-fix review | v1 core |
| Before/after re-run | Re-attempt the task, compare metrics | v1 stretch |
| Cross-language regression | Compare same page across languages | v1 stretch (the wedge) |
| Conversational Q&A | Answer questions from the saved report | v1 core |
| Conversational commands | Chat triggers re-runs with new params | v1 stretch |
| UX score (A–F) | Deterministic from severity counts | v1 core |
| Audit history | Past runs stored in SQLite | v1 core |
| Honesty tags | "automated" vs "needs human review" | v1 core |
| Shareable report export | PDF / link | future |
| Multi-page crawl | Cover whole sites | future |
| CI/CD integration | Audit on every PR | future |
| Real analytics overlay | Pair findings with real drop-off data | future |

(v1 core = must demo. v1 stretch = build once core is stable. future = `future-features.md`.)

## Who it's for (the wedge)

**Beachhead: teams shipping international websites.** Your site converts in English and quietly fails everyone else, and you have no way to see it. Wayfarer experiences the site as a user who can't read it and shows you exactly where it breaks, in every language you ship. Narrow, unserved, visually undeniable.

**Vision: it generalizes to conversion-friction auditing for any site** — continuous, conversational, in minutes, at a fraction of the cost of a human UX consultant ($5k–$50k, weeks of turnaround).
