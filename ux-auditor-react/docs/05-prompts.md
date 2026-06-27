# 05 — Prompts (index)

The brain is used in **5 places**. Only the explorer runs inside the live loop; the rest run before/after. Each prompt has its own file with purpose, trigger, inputs, required output JSON, and a template you can drop in and tune.

| # | Prompt | When it runs | File |
|---|---|---|---|
| 1 | **Explorer** | Inside the loop, every step. Decides the next action + reasoning + friction. **The make-or-break prompt.** | [`prompts/explorer.md`](prompts/explorer.md) |
| 2 | **Synthesizer** | Once, at the end. Ranked findings + verdict from the scratchpad. | [`prompts/synthesizer.md`](prompts/synthesizer.md) |
| 3 | **Fix generation** | Per top issue. Before/after HTML/CSS. | [`prompts/fix-generation.md`](prompts/fix-generation.md) |
| 4 | **Chat** | Per user message. Answers from the report; routes commands to re-runs. | [`prompts/chat.md`](prompts/chat.md) |
| 5 | **Language comparison** | Optional (the wedge). What broke in the second language. | [`prompts/language-comparison.md`](prompts/language-comparison.md) |

## Cross-cutting rules (apply to all prompts)
- **Always return strict JSON**, no markdown, no prose outside the JSON. Parse safely; retry once on parse failure.
- **Ground everything in what was observed.** Never invent elements, selectors, or metrics. If unsure, say so and set `needsHumanReview: true`.
- **Severity is goal-impact, not WCAG label.** A contrast nit can be `low`; a hidden cart button is a `blocker`.
- **Speak in the persona's experience.** Explanations describe how *this persona pursuing this goal* is hurt.
- Keep the brain provider-agnostic — these work with any capable multimodal model.
- Token hygiene: prefer the accessibility-tree outline over full screenshots for the explorer; downscale screenshots; only send the vision image when visual judgment is needed.
