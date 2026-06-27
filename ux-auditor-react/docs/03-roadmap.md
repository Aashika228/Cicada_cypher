# 03 — Roadmap

Built for Claude Code: every task is **commit-sized**. Commit + push after each ✓ so you can roll back cleanly if something breaks. Each milestone ends at a **CHECKPOINT** — a state where the app demonstrably works. Never start the next milestone until the current checkpoint is green.

Suggested commit message format: `M<n>.<task>: <what changed>` (e.g. `M1.3: capture screenshot + a11y tree per step`).

Roles (5 people): **A** = Lead/Integrator (prompts, glue, demo), **B** = Explorer & Capture, **C** = Synthesis & Data, **D** = Frontend, **E** = Differentiator & Demo-site.

---

## M0 — Foundations (everyone, ~1h) — DO NOT SKIP

- [ ] `M0.1` Repo scaffold: backend (Fastify+TS), frontend (Vite+React+TS+Tailwind), `/screenshots` dir, `.gitignore`. *(commit)*
- [ ] `M0.2` Add shared `types.ts` from `04-api-contracts.md` verbatim. **This is the contract — nobody edits feature code until this is in.** *(commit)*
- [ ] `M0.3` SQLite init: create `audits` + `steps` tables (DDL in `04`). *(commit)*
- [ ] `M0.4` shadcn init: dark mode, base `stone`, accent `violet`; drop in `card`, `button`, `badge`. *(commit)*
- [ ] `M0.5` LLM wrapper module: one function `callBrain(messages)` behind a provider interface. Smoke-test with a hello-world call. *(commit)*
- [ ] `M0.6` (E) Build the **deliberately-broken demo site**: an English version + a German version that overflows; bad contrast; a hard-to-find cart. Serve it on localhost. *(commit)*

**CHECKPOINT 0:** `npm run dev` boots both apps; DB file created; one successful LLM call logged; demo site loads.

---

## M1 — The spine: capture one journey (B + A, ~3h)

- [ ] `M1.1` Playwright: launch browser, navigate to a URL, return the page HTML + a screenshot to disk. *(commit)*
- [ ] `M1.2` Extract the accessibility-tree "page outline" as compact text. *(commit)*
- [ ] `M1.3` Orchestrator skeleton: a loop that, per step, gathers {screenshot, outline} → calls the **explorer prompt** → gets a decision JSON. (Don't act yet; just log decisions.) *(commit)*
- [ ] `M1.4` Action executor: translate decision JSON (`click`/`type`/`scroll`/`done`/`giveup`) into Playwright calls. Add a **hard step cap + per-step timeout**. *(commit)*
- [ ] `M1.5` Per-step capture → write a `steps` row (idx, screenshot path, reasoning, action, friction JSON). *(commit)*
- [ ] `M1.6` Run axe-core on each page; store its raw output in the step. *(commit)*
- [ ] `M1.7` Normalizer: convert axe output → `Finding[]` (clean shape). *(commit)*

**CHECKPOINT 1:** Run the orchestrator on the demo site from the command line → it walks a few steps toward a goal, writes screenshots + steps to DB, and produces at least one normalized `Finding`. Cache this run.

---

## M2 — Findings + ranking + score (C, ~1.5h)

- [ ] `M2.1` Synthesizer prompt wired: feed the whole scratchpad → get ranked `Finding[]` + verdict JSON. *(commit)*
- [ ] `M2.2` Map axe `impact` → goal-impact `severity`; merge with friction + heuristic findings; dedupe + group by category. *(commit)*
- [ ] `M2.3` Deterministic score function → `Score` (A–F + per-category). *(commit)*
- [ ] `M2.4` Assemble + persist the final `AuditRun` into the `audits` row. *(commit)*

**CHECKPOINT 2:** A full CLI run produces a saved `AuditRun` with a verdict, ranked findings, and a grade.

---

## M3 — Backend API + Frontend shell (A + D, parallel from M0, ~4h)

- [ ] `M3.1` (A) `POST /audits` starts a run (returns id); `GET /audits/:id` returns the saved run. *(commit)*
- [ ] `M3.2` (A) `GET /audits/:id/stream` SSE: emit each step as it happens. *(commit)*
- [ ] `M3.3` (D) Frontend layout shell: URL input + goal/persona controls + empty panels. *(commit)*
- [ ] `M3.4` (D) **Live agent view**: subscribe to SSE, render reasoning + latest screenshot as steps arrive. *(commit)*
- [ ] `M3.5` (D) **Annotated journey**: the step screenshots with friction markers. *(commit)*
- [ ] `M3.6` (D) Findings panel: issue cards (severity badge, category, explanation, evidence link) + the verdict + the score gauge. *(commit)*

**CHECKPOINT 3:** Paste a URL in the browser → watch the agent run live → see the finished report on screen. **This is a demoable product.** Tag/branch it.

---

## M4 — Conversational layer (A, ~1h)

- [ ] `M4.1` `POST /audits/:id/chat`: stuff the saved report into the **chat prompt**, return a grounded answer. *(commit)*
- [ ] `M4.2` (D) Chat panel UI wired to the endpoint. *(commit)*
- [ ] `M4.3` Command routing: chat decides "question vs command"; a command (e.g. "try on mobile") kicks off a new run and returns its id. *(commit, stretch)*

**CHECKPOINT 4:** Ask "what's the most critical issue and why?" → grounded answer from the report.

---

## M5 — Fix generation + before/after proof (C + D, ~2h)

- [ ] `M5.1` Fix-generation prompt: per top issue → `{before, after, rationale}`. *(commit)*
- [ ] `M5.2` (D) Fix diff UI: before/after view + accept/reject button. *(commit)*
- [ ] `M5.3` Re-run endpoint: apply a fix (inject CSS/HTML) and re-attempt the same goal; capture `AttemptMetrics`. *(commit, stretch)*
- [ ] `M5.4` (D) Before/after metrics UI: "7 steps → 4, 2 hesitations → 0", score climbs. *(commit, stretch)*

**CHECKPOINT 5:** Show one fix as before/after; (stretch) re-run proves it improved the metrics.

---

## M6 — Cross-language regression (E, stretch, ~1.5h)

- [ ] `M6.1` Run the same journey in a second language (URL param / language switch / injected translation). *(commit)*
- [ ] `M6.2` pixelmatch diff + **language-comparison prompt** → i18n findings (overflow, truncation, untranslated, language_barrier). *(commit)*
- [ ] `M6.3` (D) Side-by-side "EN vs DE" view with breakage marked. *(commit)*

**CHECKPOINT 6:** "Perfect in English, broken in German" shown side by side.

---

## M7 — Cache, polish, freeze (everyone, ~1.5h)

- [ ] `M7.1` Cached/live toggle: serve the pre-run demo audit instantly (the demo safety net). *(commit)*
- [ ] `M7.2` Polish pass: spacing, empty/loading states, the one accent color, product name + logo. *(commit)*
- [ ] `M7.3` Pre-vet the single fix + the i18n example used in the demo; hardcode-safe if needed. *(commit)*
- [ ] `M7.4` Rehearse the run 3x against the cache; fix only demo-path bugs. *(commit)*
- [ ] `M7.5` **Freeze.** Tag the final commit. No new features after this.

**CHECKPOINT 7:** Demo runs end to end from cache in under 3 minutes, twice in a row, with no manual fixes.

---

## Cut order if time runs short (drop from the bottom up)
M6 → M5.3/5.4 → M4.3 → M2 grouping niceties. **Never cut:** M0–M3 (the demoable core) and M4.1–4.2 (chat is in the product name). If truly desperate, the live run can fall back to cached playback (M7.1) — but keep chat real.
