require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const questionsRouter = require('./routes/questions');
const scoreRouter = require('./routes/score');
const sessionRouter = require('./routes/session');
const feedbackRouter = require('./routes/feedback');
const businessRouter = require('./routes/business');
const introRouter = require('./routes/intro');
const worldsRouter = require('./routes/worlds');
const runRouter = require('./routes/run');
const playRouter = require('./routes/play');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: open by default for local dev. In production, set CORS_ORIGINS to a
// comma-separated allowlist of frontend origins (e.g. preview + published domains).
const corsOrigins = process.env.CORS_ORIGINS;
app.use(
  cors(
    corsOrigins
      ? { origin: corsOrigins.split(',').map((o) => o.trim()).filter(Boolean) }
      : undefined
  )
);
app.use(express.json());

// Static test harness — open http://localhost:3001/ in a browser to play the demo.
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/questions', questionsRouter);
app.use('/score', scoreRouter);
app.use('/session', sessionRouter);
app.use('/feedback', feedbackRouter);
app.use('/business', businessRouter);
app.use('/intro', introRouter);
app.use('/run', runRouter);
app.use('/play', playRouter);
// Discovery Run worlds (engineering, technology, medicine, creative).
// Mounted at root; matches /:world/challenge and /:world/feedback. Business is
// handled by its own router above, so it is excluded here.
app.use('/', worldsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`CareerQuest backend running on http://localhost:${PORT}`);
});
