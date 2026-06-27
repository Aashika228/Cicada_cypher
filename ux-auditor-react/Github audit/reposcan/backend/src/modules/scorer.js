const DEDUCTIONS = {
  CRITICAL: 15,
  HIGH: 8,
  MEDIUM: 4,
  LOW: 1,
};

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function countBySeverity(issues) {
  const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const issue of issues) {
    const key = issue.severity?.toLowerCase();
    if (key in breakdown) {
      breakdown[key]++;
    }
  }

  return breakdown;
}

function getWorstFiles(issues, limit = 5) {
  const fileCounts = {};

  for (const issue of issues) {
    fileCounts[issue.file] = (fileCounts[issue.file] || 0) + 1;
  }

  return Object.entries(fileCounts)
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getMostCommonIssues(issues, limit = 5) {
  const ruleCounts = {};

  for (const issue of issues) {
    const ruleId = issue.wcagId || issue.heuristicId || issue.ruleId;
    const ruleName = issue.wcagName || issue.heuristicName || issue.ruleName;
    const key = ruleId;

    if (!ruleCounts[key]) {
      ruleCounts[key] = { ruleId, ruleName, count: 0 };
    }
    ruleCounts[key].count++;
  }

  return Object.values(ruleCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function calculateScore(parsedFiles, allIssues) {
  let score = 100;

  for (const issue of allIssues) {
    const deduction = DEDUCTIONS[issue.severity] || 0;
    score -= deduction;
  }

  score = Math.max(0, score);

  const breakdown = countBySeverity(allIssues);
  const wcagIssues = allIssues.filter((i) => i.type === 'wcag').length;
  const heuristicIssues = allIssues.filter((i) => i.type === 'heuristic').length;

  return {
    score,
    grade: getGrade(score),
    totalFiles: parsedFiles.length,
    totalIssues: allIssues.length,
    breakdown,
    wcagIssues,
    heuristicIssues,
    worstFiles: getWorstFiles(allIssues),
    mostCommonIssues: getMostCommonIssues(allIssues),
  };
}
