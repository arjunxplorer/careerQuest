const businessPrompt = require('../prompts/business');
const engineeringPrompt = require('../prompts/engineering');
const artsPrompt = require('../prompts/arts');
const medicinePrompt = require('../prompts/medicine');
const { createConversation } = require('../lib/tavus');
const { MENTORS } = require('../config/fields');

const PROMPTS = {
  engineering: engineeringPrompt,
  arts: artsPrompt,
  business: businessPrompt,
  medicine: medicinePrompt,
};

function fail(res, message) {
  return res.status(500).json({ error: message });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object.';
  }

  if (!isNonEmptyString(body.field) || !MENTORS[body.field]) {
    return 'field must be one of: engineering, arts, business, medicine.';
  }

  if (!isNonEmptyString(body.studentName)) {
    return 'studentName must be a non-empty string.';
  }

  if (!body.scoreContext || typeof body.scoreContext !== 'object') {
    return 'scoreContext must be an object with scoring details.';
  }

  if (!body.scoreContext.scores || typeof body.scoreContext.scores !== 'object') {
    return 'scoreContext.scores is required.';
  }

  return null;
}

async function createSession(req, res) {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return fail(res, validationError);
  }

  const { field, studentName, scoreContext } = req.body;
  const mentor = MENTORS[field];
  const promptBuilder = PROMPTS[field];

  try {
    const conversationalContext = promptBuilder(scoreContext);
    const data = await createConversation({
      conversationName: `CareerQuest — ${studentName} × ${mentor.name}`,
      conversationalContext,
      customGreeting: `Hi ${studentName}! I'm ${mentor.name}. I reviewed your CareerQuest results — let's talk about your path in ${field}.`,
      testMode: Boolean(req.body.testMode),
    });

    if (!data.conversation_url) {
      return fail(res, 'Tavus response missing conversation_url');
    }

    return res.json({
      conversationUrl: data.conversation_url,
      conversationId: data.conversation_id,
      mentorName: mentor.name,
    });
  } catch (error) {
    return fail(res, error.message || 'Failed to create Tavus conversation.');
  }
}

const router = require('express').Router();
router.post('/', createSession);

// POST /session/end — end a Tavus conversation and free a concurrency slot.
router.post('/end', async (req, res) => {
  const { conversationId } = req.body || {};
  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'conversationId must be a non-empty string.' });
  }

  try {
    const { endConversation } = require('../lib/tavus');
    await endConversation(conversationId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to end Tavus conversation.' });
  }
});

module.exports = router;
