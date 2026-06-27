import axios from 'axios';
import RepoAudit from '../models/RepoAudit.js';

const GITHUB_API = 'https://api.github.com';
const PROTECTED_BRANCHES = ['main', 'master', 'production', 'prod', 'release'];

// ─── Helpers ──────────────────────────────────────────────

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function ghRequest(method, url, token, data = null, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const config = { method, url, headers: ghHeaders(token) };
      if (data) config.data = data;
      const res = await axios(config);
      return res.data;
    } catch (err) {
      const status = err.response?.status;

      // Rate limit — wait and retry
      const isRateLimit = status === 429 || (status === 403 && err.response?.headers?.['x-ratelimit-remaining'] === '0');
      if (isRateLimit && attempt < retries) {
        const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '60', 10);
        console.warn(`GitHub rate limit hit. Waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      throw err;
    }
  }
}

// ─── Function 1: Create New Branch ──────────────────────────

export async function createNewBranch(owner, repo, baseBranch, token) {
  if (PROTECTED_BRANCHES.includes(baseBranch.toLowerCase())) {
    // We read FROM baseBranch, but never push TO it — this is just a safety check
  }

  // Get SHA of the base branch head
  const refData = await ghRequest(
    'GET',
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
    token
  );
  const baseSHA = refData.object.sha;

  // Try creating the branch, retry with suffix if name collision
  const timestamp = Date.now();
  let branchName = `breakpoint/ux-fixes-${timestamp}`;
  let created = false;
  let attempts = 0;

  while (!created && attempts < 5) {
    try {
      await ghRequest('POST', `${GITHUB_API}/repos/${owner}/${repo}/git/refs`, token, {
        ref: `refs/heads/${branchName}`,
        sha: baseSHA,
      });
      created = true;
    } catch (err) {
      if (err.response?.status === 422 && attempts < 4) {
        // Branch already exists — add random suffix
        const suffix = Math.random().toString(36).substring(2, 6);
        branchName = `breakpoint/ux-fixes-${timestamp}-${suffix}`;
        attempts++;
        continue;
      }
      throw new Error(`Failed to create branch: ${err.response?.data?.message || err.message}`);
    }
  }

  if (!created) {
    throw new Error('Failed to create branch after 5 attempts');
  }

  return branchName;
}

// ─── Function 2: Build Fixed File Content ───────────────────

export function buildFixedFileContent(originalContent, fixes) {
  const lines = originalContent.split('\n');

  // Sort fixes by line number descending so multi-line replacements
  // don't shift line numbers for earlier fixes
  const sorted = [...fixes].sort((a, b) => b.line - a.line);

  for (const fix of sorted) {
    const lineIndex = fix.line - 1;
    if (lineIndex < 0 || lineIndex >= lines.length) continue;

    const fixedLines = fix.fixedCode.split('\n');
    lines.splice(lineIndex, 1, ...fixedLines);
  }

  return lines.join('\n');
}

// ─── Function 3: Push File Fix ──────────────────────────────

export async function pushFileFix(owner, repo, filePath, fixedContent, originalSHA, newBranch, commitMessage, token) {
  // NEVER push to protected branches
  if (PROTECTED_BRANCHES.includes(newBranch.toLowerCase())) {
    throw new Error(`BLOCKED: Cannot push to protected branch "${newBranch}"`);
  }

  const encoded = Buffer.from(fixedContent, 'utf-8').toString('base64');

  const body = {
    message: commitMessage,
    content: encoded,
    sha: originalSHA,
    branch: newBranch, // ALWAYS include branch
  };

  try {
    const result = await ghRequest(
      'PUT',
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`,
      token,
      body
    );
    return result.commit.sha;
  } catch (err) {
    // SHA mismatch — refetch SHA and retry once
    if (err.response?.status === 409 || err.response?.status === 422) {
      console.warn(`SHA mismatch for ${filePath}, refetching...`);
      const fresh = await ghRequest(
        'GET',
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${newBranch}`,
        token
      );
      body.sha = fresh.sha;
      const retryResult = await ghRequest(
        'PUT',
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`,
        token,
        body
      );
      return retryResult.commit.sha;
    }
    throw new Error(`Failed to push ${filePath}: ${err.response?.data?.message || err.message}`);
  }
}

// ─── Function 4: Create Pull Request ────────────────────────

export async function createPullRequest(owner, repo, newBranch, baseBranch, fixes, token) {
  const fixCount = fixes.length;
  const fileCount = new Set(fixes.map((f) => f.file)).size;

  // Build PR body with fix details
  const fixList = fixes
    .map((f) => {
      const rule = f.ruleId || f.wcagId || f.heuristicId || 'UX';
      return `- **${f.file}:${f.line}** — ${rule}: ${f.message || 'Fixed'}`;
    })
    .join('\n');

  const body = `## 🔧 BreakPoint UX Auto-Fix

This PR was automatically generated by **BreakPoint UX Auditor**.

### Summary
- **${fixCount}** fixes across **${fileCount}** files
- Branch: \`${newBranch}\`
- Base: \`${baseBranch}\`

### Fixes Applied
${fixList}

---
> 🤖 Generated by BreakPoint AI — WCAG Accessibility & UX Heuristic Engine
> Review each change carefully before merging.`;

  const result = await ghRequest(
    'POST',
    `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
    token,
    {
      title: `BreakPoint: ${fixCount} UX Fixes`,
      body,
      head: newBranch,
      base: baseBranch,
    }
  );

  return {
    prUrl: result.html_url,
    prNumber: result.number,
  };
}

// ─── Function 5: Full Push Flow ─────────────────────────────

async function deleteBranch(owner, repo, branchName, token) {
  try {
    await ghRequest(
      'DELETE',
      `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branchName}`,
      token
    );
    console.log(`Rolled back branch: ${branchName}`);
  } catch {
    console.warn(`Failed to delete branch ${branchName} during rollback`);
  }
}

export async function runFullPushFlow(auditId, acceptedFixIds, token) {
  // 1. Get audit from MongoDB
  const audit = await RepoAudit.findById(auditId);
  if (!audit) throw new Error('Audit not found');
  if (audit.status !== 'completed') throw new Error('Audit is not completed');

  const { owner, repo, branch: baseBranch } = audit;
  if (!owner || !repo || !baseBranch) {
    throw new Error('Audit missing owner/repo/branch data');
  }

  // 2. Get accepted fixes — filter issues by provided IDs (array indices)
  const acceptedFixes = [];
  for (const id of acceptedFixIds) {
    const idx = typeof id === 'number' ? id : parseInt(id, 10);
    const issue = audit.issues[idx];
    if (issue && issue.fix && issue.fix.fixedCode) {
      acceptedFixes.push({
        index: idx,
        file: issue.file,
        line: issue.line,
        code: issue.code,
        fixedCode: issue.fix.fixedCode,
        ruleId: issue.ruleId,
        ruleName: issue.ruleName,
        message: issue.message,
        severity: issue.severity,
      });
    }
  }

  if (acceptedFixes.length === 0) {
    throw new Error('No valid accepted fixes found');
  }

  // 3. Create new branch
  let newBranchName;
  try {
    newBranchName = await createNewBranch(owner, repo, baseBranch, token);
  } catch (err) {
    throw new Error(`Branch creation failed: ${err.message}`);
  }

  // 4. Group fixes by file
  const fixesByFile = {};
  for (const fix of acceptedFixes) {
    if (!fixesByFile[fix.file]) fixesByFile[fix.file] = [];
    fixesByFile[fix.file].push(fix);
  }

  // 5. For each file: fetch, patch, push
  const pushedFiles = [];
  try {
    for (const [filePath, fileFixes] of Object.entries(fixesByFile)) {
      // Fetch original file content + SHA from GitHub
      const fileData = await ghRequest(
        'GET',
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${baseBranch}`,
        token
      );

      if (!fileData.content || !fileData.sha) {
        console.warn(`Skipping ${filePath}: could not fetch content`);
        continue;
      }

      const originalContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const originalSHA = fileData.sha;

      // Build fixed content
      const fixedContent = buildFixedFileContent(originalContent, fileFixes);

      // Build commit message — one commit per file, mention WCAG rules
      const rules = [...new Set(fileFixes.map((f) => f.ruleId).filter(Boolean))];
      const commitMessage = `fix(${filePath}): ${fileFixes.length} UX fix${fileFixes.length > 1 ? 'es' : ''} [${rules.join(', ')}]`;

      // Push
      const commitSHA = await pushFileFix(
        owner,
        repo,
        filePath,
        fixedContent,
        originalSHA,
        newBranchName,
        commitMessage,
        token
      );

      pushedFiles.push({ file: filePath, commitSHA, fixCount: fileFixes.length });
    }
  } catch (err) {
    // Rollback: delete the created branch
    await deleteBranch(owner, repo, newBranchName, token);
    throw new Error(`Push failed, branch rolled back: ${err.message}`);
  }

  if (pushedFiles.length === 0) {
    await deleteBranch(owner, repo, newBranchName, token);
    throw new Error('No files were pushed successfully');
  }

  // 6. Create Pull Request
  let pr;
  try {
    pr = await createPullRequest(owner, repo, newBranchName, baseBranch, acceptedFixes, token);
  } catch (err) {
    throw new Error(`Files pushed to ${newBranchName} but PR creation failed: ${err.message}`);
  }

  // 7. Update MongoDB audit with PR info (bypass schema strict mode)
  await RepoAudit.collection.updateOne(
    { _id: audit._id },
    {
      $set: {
        prUrl: pr.prUrl,
        prNumber: pr.prNumber,
        prBranch: newBranchName,
        prStatus: 'created',
        prCreatedAt: new Date(),
      },
    }
  );

  return {
    prUrl: pr.prUrl,
    prNumber: pr.prNumber,
    branch: newBranchName,
    filesChanged: pushedFiles.length,
    commits: pushedFiles,
  };
}
