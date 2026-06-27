import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import repoAuditRoutes from './routes/repoAudit.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RepoScan' });
});

app.use('/api/repo', repoAuditRoutes);

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reposcan';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`RepoScan API running on http://localhost:${PORT}`);
  });
}

start();
