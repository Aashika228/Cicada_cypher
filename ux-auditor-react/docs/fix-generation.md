# Prompt 3 — Fix generation

**Purpose:** for a single top issue, produce a deployable before/after HTML/CSS fix with a short rationale.
**When:** per top finding (run only on the issues worth fixing — usually the verdict's `topIssueIds`).

## Inputs
- one `Finding` (title, explanation, category, `element`, `selector`)
- minimal surrounding context if available (parent element / nearby markup)

## Required output (strict JSON)
```json
{
  "language": "css | html",
  "before": "the current offending snippet",
  "after": "the fixed snippet",
  "rationale": "one or two sentences: what changed and why it helps the user"
}
```

## Rules
- **Small, safe, surgical.** Change only what fixes the issue. No rewrites of whole components.
- **Deployable as-is.** Valid CSS/HTML the team could paste in. No pseudo-code, no "...".
- **Prefer CSS** for layout/contrast/visibility issues; HTML only when structure/labels/aria must change.
- **Tie the rationale to the user**, not the rule ("makes the cart visible on first glance", not "fixes WCAG 1.4.3").
- If you cannot fix it safely without more context, return `language: "html"`, leave `after` empty, and put the needed info in `rationale`. (Better to admit it than to emit broken CSS.)

## Template

> **System:**
> You fix front-end UX issues with minimal, deployable HTML/CSS edits. Given one issue and its offending element, produce the smallest change that resolves it. Keep it valid and paste-ready. Explain the change in terms of the user's experience, in one or two sentences. Return ONLY the JSON schema given.
>
> **User:**
> Issue: {{finding.title}} — {{finding.explanation}}
> Category: {{finding.category}}
> Offending element: {{finding.element}}
> Selector: {{finding.selector}}

## Tuning / safety
- **Pre-vet the single fix shown in the demo.** Run its `after` against the demo site to confirm it renders. Hardcode-safe if needed.
- If outputs are too ambitious, add: "Never change more than the targeted element and its direct styles."
