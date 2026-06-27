const fs = require('fs');
const path = require('path');
const { FIELDS, LEVELS, MENTORS } = require('../config/fields');
const { levelFeedback } = require('../lib/feedbackText');

const router = require('express').Router();

function fail(res, message) {
  return res.status(500).json({ error: message });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidAnswerEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    isNonEmptyString(entry.questionId) &&
    isNonEmptyString(entry.signal)
  );
}

function loadLevelBlock(field, level) {
  const filePath = path.join(__dirname, '..', 'questions', `${field}.json`);
  const levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return levels.find((block) => block.level === level);
}

router.post('/', (req, res) => {
  const { field, level, studentName, answers } = req.body || {};

  if (!FIELDS.includes(field)) {
    return fail(res, `field must be one of: ${FIELDS.join(', ')}`);
  }

  const levelNum = Number(level);
  if (!LEVELS.includes(levelNum)) {
    return fail(res, 'level must be 1, 2, 3, or 4.');
  }

  if (!isNonEmptyString(studentName)) {
    return fail(res, 'studentName must be a non-empty string.');
  }

  if (!Array.isArray(answers)) {
    return fail(res, 'answers must be an array of { questionId, signal } objects.');
  }

  for (const entry of answers) {
    if (!isValidAnswerEntry(entry)) {
      return fail(res, 'Each answer must include questionId and signal strings.');
    }
  }

  const levelBlock = loadLevelBlock(field, levelNum);
  if (!levelBlock) {
    return fail(res, `Level ${levelNum} not found for ${field}.`);
  }

  const result = levelFeedback({
    studentName,
    field,
    level: levelNum,
    answers,
    agentFeedbackPrompt: levelBlock.agent_feedback_prompt,
  });

  return res.json({
    feedback: result.feedback,
    mentorName: result.mentorName,
    level: levelNum,
    theme: levelBlock.theme,
    format: levelBlock.format,
  });
});

module.exports = router;
