# Prompt 5 — Language comparison (the wedge)

**Purpose:** given the same page/state in two languages, identify UX breakage that appears only in the second language.
**When:** optional differentiator. Runs on the second-language pass, ideally after a pixelmatch visual diff narrows where to look.

## Inputs
- `screenshotA` + `langA` (baseline, e.g. English)
- `screenshotB` + `langB` (target, e.g. German / Arabic)
- `pixelDiffRegions` — optional bounding boxes where the two differ most
- `pageOutlineB` — accessibility outline of the target-language page

## Required output (strict JSON)
```json
{
  "findings": [
    {
      "title": "...",
      "severity": "blocker | high | medium | low",
      "category": "i18n",
      "source": "i18n",
      "frictionType": "overflow_clipped | language_barrier | not_found | ambiguous_label",
      "explanation": "what breaks for a {{langB}} user and why",
      "selector": "best guess or null",
      "needsHumanReview": true
    }
  ]
}
```

## What to look for
- **Text overflow / clipping / truncation** — longer translations breaking buttons, tabs, cards (German is notorious; CJK and Tamil too).
- **Layout collapse** — wrapping that pushes key actions off-screen or below the fold.
- **Untranslated strings** — English left in a non-English page (a `language_barrier`).
- **RTL breakage** (Arabic/Hebrew) — mirrored layouts, misaligned icons, broken reading order.
- **Number/date/currency format** mismatches.
- **Severity by consequence:** a clipped "Add to cart" that hides the action is a `blocker`; a slightly truncated footer link is `low`.

## Template

> **System:**
> You audit cross-language UX regressions. You are given the same page in {{langA}} and {{langB}}. The {{langA}} version is the baseline that works. Identify problems that appear in the {{langB}} version: text overflow or clipping, layout breaking, untranslated text, RTL issues, and format mismatches. Rate each by how badly it harms a {{langB}} user trying to use the page. Ignore differences that are merely cosmetic and harmless. Return ONLY the JSON schema given.
>
> **User:**
> Baseline ({{langA}}) screenshot attached first; target ({{langB}}) screenshot attached second.
> High-difference regions: {{pixelDiffRegions}}
> Target page outline: {{pageOutlineB}}

## Demo notes
- The killer framing isn't "screenshots differ" — it's **"the agent completed checkout in {{langA}} but failed in {{langB}} because the button overflowed off-screen."** Where possible, run the *goal attempt* in the second language so the breakage is consequential, not just visual.
- Pre-capture the EN/DE pair for the demo so it never depends on a live language switch.
