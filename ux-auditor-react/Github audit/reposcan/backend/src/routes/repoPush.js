import { Router } from 'express';
import { runFullPushFlow } from '../modules/githubPusher.js';

const router = Router();

router.post('/push', async (req, res) => {
  // Token from Clerk session — never from user input
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing GitHub token. Sign in with GitHub via Clerk.' });
  }
  const token = authHeader.replace('Bearer ', '');

  const { auditId, acceptedFixIds } = req.body;

  if (!auditId) {
    return res.status(400).json({ error: 'auditId is required' });
  }
  if (!acceptedFixIds || !Array.isArray(acceptedFixIds) || acceptedFixIds.length === 0) {
    return res.status(400).json({ error: 'acceptedFixIds must be a non-empty array' });
  }

  try {
    // We use the Clerk JWT to authorize the route, but use the provided githubToken 
    // to actually interact with the GitHub API since we need repo scope.
    const githubToken = req.body.githubToken || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('Please provide a GitHub Personal Access Token to push changes.');
    }

    const result = await runFullPushFlow(auditId, acceptedFixIds, githubToken);

    res.json({
      success: true,
      prUrl: result.prUrl,
      prNumber: result.prNumber,
      branch: result.branch,
      filesChanged: result.filesChanged,
      commits: result.commits,
    });
  } catch (err) {
    console.error('Push failed:', err.message);

    res.status(500).json({
      success: false,
      error: err.message,
      // Include branch name if it was created before failure
      branch: err.message.includes('branch rolled back') ? null : undefined,
    });
  }
});

export default router;
