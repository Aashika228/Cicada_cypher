# 04 — API Contracts

The single source of truth for the boundary between frontend and backend. **Lock this in M0 before feature code.** Put the types in a shared `types.ts` imported by both apps.

---

## Shared types (`types.ts`)

```typescript
// ─── Audit context: who is auditing, for what, where ───
export interface Persona {
  id: string;
  label: string;            // "Non-native speaker who can't read the page language"
  description: string;      // the brief the agent adopts (prompt-level)
  cannotReadText?: boolean; // forces reliance on icons/layout — the i18n lens
}

export type AuditMode = "goal" | "explore";
// "explore" is just a goal under the hood: "orient yourself and assess whether
// a newcomer can find the main sections." ONE engine, different goal text.

export interface AuditContext {
  url: string;
  mode: AuditMode;
  goal: string;             // explicit task, or the explore brief
  persona: Persona;
  language: string;         // BCP-47: "en", "de", "ar"
  viewport: "desktop" | "mobile";
}

// ─── The journey: the story of the agent's attempt ───
export type FrictionType =
  | "hesitation" | "backtrack" | "dead_end" | "not_found"
  | "ambiguous_label" | "overflow_clipped" | "language_barrier"
  | "error_unrecovered";

export interface FrictionEvent {
  type: FrictionType;
  note: string;             // agent's own words
  selector?: string;
  findingId?: string;
}

export interface JourneyStep {
  index: number;
  screenshot: string;       // URL/path served by the backend
  reasoning: string;        // the agent's visible thought (powers the live view)
  action: string;           // "clicked Continue", "scrolled", "gave up"
  friction: FrictionEvent[];
}

// ─── Findings ───
export type Severity = "blocker" | "high" | "medium" | "low"; // GOAL impact, not WCAG label
export type Category =
  | "navigation" | "findability" | "content_clarity" | "forms"
  | "feedback" | "error_handling" | "consistency"
  | "visual_hierarchy" | "accessibility" | "i18n" | "trust";
export type Source = "friction" | "heuristic" | "wcag" | "i18n";

export interface AttemptMetrics {
  goalCompleted: boolean;
  steps: number;
  hesitations: number;
  durationMs: number;
}

export interface Fix {
  language: "css" | "html";
  before: string;
  after: string;
  rationale: string;
  verification?: { before: AttemptMetrics; after: AttemptMetrics };
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  source: Source;
  explanation: string;      // why this hurts THIS persona pursuing THIS goal
  element?: string;
  selector?: string;
  evidence: { stepIndex: number; screenshot: string };
  blocksGoal: boolean;
  needsHumanReview: boolean;
  fix?: Fix;
}

// ─── Top level ───
export interface Score {
  grade: "A" | "B" | "C" | "D" | "F";
  value: number;            // 0–100
  byCategory: Partial<Record<Category, number>>;
}

export interface Verdict {
  summary: string;
  topIssueIds: string[];
  goalCompleted: boolean;
}

export type AuditStatus = "running" | "done" | "failed";

export interface AuditRun {
  id: string;
  context: AuditContext;
  status: AuditStatus;
  createdAt: string;
  journey: JourneyStep[];
  findings: Finding[];
  score: Score;
  verdict: Verdict;
}
```

---

## SQLite schema

```sql
CREATE TABLE IF NOT EXISTS audits (
  id           TEXT PRIMARY KEY,
  url          TEXT NOT NULL,
  mode         TEXT NOT NULL,
  persona_json TEXT NOT NULL,
  language     TEXT NOT NULL,
  viewport     TEXT NOT NULL,
  status       TEXT NOT NULL,          -- running | done | failed
  result_json  TEXT,                   -- full AuditRun, set when status = done
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS steps (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id      TEXT NOT NULL REFERENCES audits(id),
  idx           INTEGER NOT NULL,
  screenshot    TEXT NOT NULL,         -- path under /screenshots/<auditId>/
  reasoning     TEXT NOT NULL,
  action        TEXT NOT NULL,
  friction_json TEXT NOT NULL,         -- FrictionEvent[]
  created_at    TEXT NOT NULL
);
```

Steps are written live (so the live view + reloads work); the full `AuditRun` is written to `audits.result_json` when the run finishes. Screenshots live on disk and are served statically.

---

## REST + SSE endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/audits` | `AuditContext` | `{ id }` — starts the run async |
| `GET` | `/audits/:id/stream` | — | **SSE**: `event: step` (`JourneyStep`), `event: status` (`AuditStatus`), `event: done` (`AuditRun`) |
| `GET` | `/audits/:id` | — | `AuditRun` (from `result_json`, or partial if running) |
| `GET` | `/audits` | — | `AuditRun[]` summary (history) |
| `POST` | `/audits/:id/fixes/:fixId/apply` | — | `{ verification: { before, after } }` — applies fix + re-runs *(stretch)* |
| `POST` | `/audits/:id/chat` | `{ message }` | `{ answer }` or `{ answer, newAuditId }` if a command triggered a re-run |
| `GET` | `/screenshots/*` | — | static image files |

### SSE event shapes
```
event: step
data: { "index": 3, "screenshot": "/screenshots/ab12/step-3.png", "reasoning": "...", "action": "clicked 'Continue'", "friction": [] }

event: status
data: { "status": "running" }

event: done
data: { ...AuditRun }
```

### Notes
- `POST /audits` returns immediately with an id; the run streams over `/audits/:id/stream`.
- The frontend opens the SSE stream right after starting an audit; on `done`, it switches to rendering the full `AuditRun`.
- The **cached demo** is just a pre-seeded `audits` row (+ screenshots). A `?cached=true` flag (or a dedicated demo id) makes `/stream` replay stored steps with small delays so it *looks* live.
