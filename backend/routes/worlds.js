const express = require('express');
const crypto = require('crypto');
const { WORLDS, DISCOVERY_WORLDS, publicChallenge } = require('../data/worlds');
const { runDiscovery } = require('../lib/discoverySim');
const discoveryMentorPrompt = require('../prompts/discoveryMentor');
const { createConversation } = require('../lib/tavus');

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Only handle the lightweight Discovery Run worlds. Business has its own router
// (deep simulation), so it is intentionally excluded here.
function ensureDiscoveryWorld(req, res, next) {
  const { world } = req.params;
  if (!DISCOVERY_WORLDS.includes(world)) {
    return next(); // fall through to 404 (or other routers)
  }
  return next();
}

// GET /:world/challenge
router.get('/:world/challenge', ensureDiscoveryWorld, (req, res) => {
  const challenge = publicChallenge(req.params.world);
  if (!challenge) {
    return res.status(404).json({ error: `Unknown world. Available: ${DISCOVERY_WORLDS.join(', ')}` });
  }
  return res.json(challenge);
});

// POST /:world/feedback
router.post('/:world/feedback', ensureDiscoveryWorld, async (req, res) => {
  const { world } = req.params;
  const w = WORLDS[world];
  if (!w) {
    return res.status(404).json({ error: `Unknown world. Available: ${DISCOVERY_WORLDS.join(', ')}` });
  }

  const { studentName, grade, answers } = req.body || {};

  if (!isNonEmptyString(studentName)) {
    return res.status(400).json({ error: 'studentName must be a non-empty string.' });
  }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers must be an object keyed by decision id with option labels.' });
  }

  const result = runDiscovery(world, studentName, answers);
  if (result.errors) {
    return res.status(400).json({ error: 'Invalid answers.', details: result.errors });
  }

  const { score, feedback } = result;

  const response = {
    sessionId: crypto.randomUUID(),
    studentName,
    grade: grade ?? null,
    world,
    challengeId: w.id,
    challengeTitle: w.title,
    mentorName: w.mentorName,
    score: score.score,
    traits: {
      engagement: score.engagement,
      topTrait: score.topTrait,
      outcome: score.outcome,
    },
    feedback,
  };

  // Live video — soft-fail so text feedback always returns.
  try {
    const conversationalContext = discoveryMentorPrompt({
      world,
      mentorName: w.mentorName,
      studentName,
      grade,
      challengeTitle: w.title,
      score,
      feedback,
    });

    const firstName = String(studentName).trim().split(/\s+/)[0] || 'there';
    const data = await createConversation({
      conversationName: `CareerQuest — ${studentName} × ${w.mentorName} (${w.title})`,
      conversationalContext,
      customGreeting: `Hey ${firstName}! I'm ${w.mentorName} — I just saw how you did in the ${w.title} challenge. Let's talk about it!`,
      testMode: Boolean(req.body.testMode),
    });

    if (data.conversation_url) {
      response.video = { conversationUrl: data.conversation_url, conversationId: data.conversation_id };
    } else {
      response.video = { error: 'Tavus response missing conversation_url' };
    }
  } catch (error) {
    response.video = { error: error.message || 'Failed to create Tavus conversation.' };
  }

  return res.json(response);
});

module.exports = router;
