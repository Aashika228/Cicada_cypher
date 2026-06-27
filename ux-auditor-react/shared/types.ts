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
