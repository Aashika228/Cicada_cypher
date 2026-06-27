import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function buildPrompt(issue) {
  const rule = issue.wcagId || issue.heuristicId || issue.ruleId;
  const ruleName = issue.wcagName || issue.heuristicName || issue.ruleName;

  return `You are a UX and accessibility expert.
File: ${issue.file}
Line: ${issue.line}
Rule: ${rule} — ${ruleName}
Problem: ${issue.message}
Current code: ${issue.code}

Return JSON only with no markdown fencing:
{"fixedCode":"...","whyItMatters":"...","timeToFix":"..."}`;
}

function parseFixResponse(text) {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      fixedCode: parsed.fixedCode || '',
      whyItMatters: parsed.whyItMatters || '',
      timeToFix: parsed.timeToFix || '5 minutes',
    };
  } catch {
    return {
      fixedCode: '',
      whyItMatters: 'Fix could not be parsed from AI response',
      timeToFix: 'Unknown',
    };
  }
}

function fallbackFix(issue) {
  return {
    fixedCode: issue.suggestedFix || issue.code,
    whyItMatters: `Addressing ${issue.wcagId || issue.heuristicId} improves accessibility and user experience.`,
    timeToFix: issue.severity === 'CRITICAL' ? '15 minutes' : issue.severity === 'HIGH' ? '10 minutes' : '5 minutes',
  };
}

async function generateFixForIssue(issue) {
  if (!process.env.GROQ_API_KEY) {
    return fallbackFix(issue);
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: buildPrompt(issue) }],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    return parseFixResponse(text);
  } catch (err) {
    console.warn(`Fix generation failed for ${issue.file}:${issue.line}:`, err.response?.data?.error?.message || err.message);
    return fallbackFix(issue);
  }
}

export async function generateFixes(issues, onProgress) {
  const results = [];

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const fix = await generateFixForIssue(issue);

    results.push({
      ...issue,
      fix,
    });

    if (onProgress) {
      onProgress(i + 1, issues.length);
    }
  }

  return results;
}

export async function generateFixesBatch(issues, onProgress, concurrency = 3) {
  const results = new Array(issues.length);
  let completed = 0;

  async function processIndex(index) {
    const fix = await generateFixForIssue(issues[index]);
    results[index] = { ...issues[index], fix };
    completed++;
    if (onProgress) onProgress(completed, issues.length);
  }

  const queue = [...issues.keys()];
  const workers = Array.from({ length: Math.min(concurrency, issues.length) }, async () => {
    while (queue.length > 0) {
      const index = queue.shift();
      await processIndex(index);
    }
  });

  await Promise.all(workers);
  return results;
}
