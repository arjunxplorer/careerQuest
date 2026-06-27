const express = require('express');
const crypto = require('crypto');
const { challenge } = require('../data/lemonadeStand');
const { runChallenge } = require('../lib/businessSim');
const lemonadeStandPrompt = require('../prompts/lemonadeStand');
const { createConversation } = require('../lib/tavus');
const { MENTORS } = require('../config/fields');

const router = express.Router();

const MENTOR = MENTORS.business; // Sam Park

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// GET /business/challenge — serve the Lemonade Stand challenge to the frontend.
router.get('/challenge', (_req, res) => {
  res.json(challenge);
});

// POST /business/feedback — receive all answers, simulate, return text feedback
// plus a live Tavus video conversation with Sam Park.
router.post('/feedback', async (req, res) => {
  const { studentName, grade, answers } = req.body || {};

  if (!isNonEmptyString(studentName)) {
    return res.status(400).json({ error: 'studentName must be a non-empty string.' });
  }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({
      error: 'answers must be an object: { price, inventory, sign, advertise } with option labels (A/B/C/D).',
    });
  }

  const result = runChallenge(studentName, answers);
  if (result.errors) {
    return res.status(400).json({ error: 'Invalid answers.', details: result.errors });
  }

  const { simulation, traits, feedback } = result;

  // Normalized 0-100 score so the Discovery Run can rank Business against the
  // other worlds in POST /run/complete.
  const OUTCOME_SCORE = { excellent: 90, solid: 72, breakeven: 50, loss: 32 };

  const response = {
    sessionId: crypto.randomUUID(),
    studentName,
    grade: grade ?? null,
    world: 'business',
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    mentorName: MENTOR.name,
    score: OUTCOME_SCORE[traits.outcome] ?? 50,
    simulation,
    traits,
    feedback,
  };

  // Build the live video. We don't hard-fail here so the student always sees
  // their text feedback even if Tavus is unavailable during the demo.
  try {
    const firstName = String(studentName).trim().split(/\s+/)[0] || 'there';
    const conversationalContext = lemonadeStandPrompt({
      studentName,
      grade,
      simulation,
      traits,
      feedback,
    });

    const data = await createConversation({
      conversationName: `CareerQuest — ${studentName} × ${MENTOR.name} (Lemonade Stand)`,
      conversationalContext,
      customGreeting: `Hey ${firstName}! Awesome to meet you — I'm Sam, and I just watched your very first lemonade stand. I am so excited to talk through how it went with you. You ready?`,
      testMode: Boolean(req.body.testMode),
    });

    if (data.conversation_url) {
      response.video = {
        conversationUrl: data.conversation_url,
        conversationId: data.conversation_id,
      };
    } else {
      response.video = { error: 'Tavus response missing conversation_url' };
    }
  } catch (error) {
    response.video = { error: error.message || 'Failed to create Tavus conversation.' };
  }

  return res.json(response);
});

module.exports = router;
