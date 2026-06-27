const express = require('express');
const crypto = require('crypto');
const introGuidePrompt = require('../prompts/introGuide');
const { createConversation } = require('../lib/tavus');

const router = express.Router();

const GUIDE_NAME = 'Ruby';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// POST /intro/session — create a live Tavus conversation with Ruby, the AI guide,
// for the "Meet Your Guide" intro screen. Soft-fails like /business/feedback so the
// frontend can fall back to a scripted intro if Tavus is unavailable.
router.post('/session', async (req, res) => {
  const { studentName, grade } = req.body || {};

  if (!isNonEmptyString(studentName)) {
    return res.status(400).json({ error: 'studentName must be a non-empty string.' });
  }

  const firstName = String(studentName).trim().split(/\s+/)[0] || 'explorer';
  const sessionId = crypto.randomUUID();

  const response = {
    sessionId,
    mentorName: GUIDE_NAME,
    studentName,
    grade: grade ?? null,
  };

  try {
    const conversationalContext = introGuidePrompt({ studentName, grade });

    const data = await createConversation({
      conversationName: `CareerQuest — ${studentName} meets ${GUIDE_NAME}`,
      conversationalContext,
      customGreeting: `Hey ${firstName}! Welcome to CareerQuest — I'm Ruby, your guide. I'm so excited you're here. Ready to discover where your strengths shine?`,
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
