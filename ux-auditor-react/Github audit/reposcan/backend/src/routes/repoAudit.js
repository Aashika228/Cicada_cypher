import { Router } from 'express';
import RepoAudit from '../models/RepoAudit.js';
import { fetchRepoFiles } from '../modules/repoFetcher.js';
import { parseRepoFiles } from '../modules/repoParser.js';
import { runWcagChecks } from '../modules/wcagChecker.js';
import { runHeuristicChecks } from '../modules/heuristicChecker.js';
import { calculateScore } from '../modules/scorer.js';
import { generateFixesBatch } from '../modules/fixGenerator.js';

const router = Router();

function normalizeIssue(issue) {
  return {
    file: issue.file,
    line: issue.line,
    code: issue.code,
    type: issue.type,
    ruleId: issue.wcagId || issue.heuristicId,
    ruleName: issue.wcagName || issue.heuristicName,
    severity: issue.severity,
    message: issue.message,
    suggestedFix: issue.suggestedFix,
    fix: issue.fix || null,
  };
}

router.post('/audit', async (req, res) => {
  const { repoUrl, githubToken } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  const audit = new RepoAudit({
    repoUrl,
    status: 'running',
  });

  try {
    await audit.save();

    const { owner, repo, branch, files } = await fetchRepoFiles(repoUrl, githubToken);

    audit.owner = owner;
    audit.repo = repo;
    audit.branch = branch;
    audit.totalFiles = files.length;
    await audit.save();

    const parsedFiles = parseRepoFiles(files);
    const wcagIssues = runWcagChecks(parsedFiles);
    const heuristicIssues = runHeuristicChecks(parsedFiles);
    const allIssues = [...wcagIssues, ...heuristicIssues];

    const scoreResult = calculateScore(parsedFiles, allIssues);

    const issuesWithFixes = await generateFixesBatch(allIssues, null, 3);
    const normalizedIssues = issuesWithFixes.map(normalizeIssue);

    audit.status = 'completed';
    audit.score = scoreResult.score;
    audit.grade = scoreResult.grade;
    audit.totalFiles = scoreResult.totalFiles;
    audit.totalIssues = scoreResult.totalIssues;
    audit.breakdown = scoreResult.breakdown;
    audit.wcagIssues = scoreResult.wcagIssues;
    audit.heuristicIssues = scoreResult.heuristicIssues;
    audit.worstFiles = scoreResult.worstFiles;
    audit.mostCommonIssues = scoreResult.mostCommonIssues;
    audit.issues = normalizedIssues;

    await audit.save();

    res.json({
      auditId: audit._id,
      score: audit.score,
      grade: audit.grade,
      totalIssues: audit.totalIssues,
      totalFiles: audit.totalFiles,
      breakdown: audit.breakdown,
    });
  } catch (err) {
    audit.status = 'failed';
    audit.error = err.message;
    await audit.save();

    console.error('Audit failed:', err);
    res.status(500).json({
      error: err.message,
      auditId: audit._id,
    });
  }
});

router.get('/audit/:id', async (req, res) => {
  try {
    const audit = await RepoAudit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.json(audit);
  } catch (err) {
    res.status(400).json({ error: 'Invalid audit ID' });
  }
});

router.get('/audits', async (_req, res) => {
  try {
    const audits = await RepoAudit.find()
      .select('repoUrl owner repo branch timestamp status score grade totalIssues totalFiles')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(audits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
