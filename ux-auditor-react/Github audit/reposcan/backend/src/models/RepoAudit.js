import mongoose from 'mongoose';

const fixSchema = new mongoose.Schema(
  {
    fixedCode: String,
    whyItMatters: String,
    timeToFix: String,
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    file: String,
    line: Number,
    code: String,
    type: { type: String, enum: ['wcag', 'heuristic'] },
    ruleId: String,
    ruleName: String,
    severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
    message: String,
    suggestedFix: String,
    fix: fixSchema,
  },
  { _id: false }
);

const repoAuditSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true },
  owner: String,
  repo: String,
  branch: String,
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  score: Number,
  grade: String,
  totalFiles: Number,
  totalIssues: Number,
  breakdown: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
  },
  wcagIssues: Number,
  heuristicIssues: Number,
  worstFiles: [
    {
      file: String,
      count: Number,
    },
  ],
  mostCommonIssues: [
    {
      ruleId: String,
      ruleName: String,
      count: Number,
    },
  ],
  issues: [issueSchema],
  error: String,
});

export default mongoose.model('RepoAudit', repoAuditSchema);
