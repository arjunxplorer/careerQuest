const express = require('express');
const {
  FIELDS,
  LEVEL_KEYS,
  LEVEL_WEIGHTS,
  POSITIVE_SIGNALS,
} = require('../config/fields');

const router = express.Router();

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

function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object.';
  }

  if (!isNonEmptyString(body.studentName)) {
    return 'studentName must be a non-empty string.';
  }

  if (typeof body.grade !== 'number' || !Number.isFinite(body.grade)) {
    return 'grade must be a number.';
  }

  if (!body.answers || typeof body.answers !== 'object') {
    return 'answers must be an object with all four fields.';
  }

  for (const field of FIELDS) {
    const fieldAnswers = body.answers[field];
    if (!fieldAnswers || typeof fieldAnswers !== 'object') {
      return `answers.${field} is required.`;
    }

    for (const levelKey of LEVEL_KEYS) {
      const levelAnswers = fieldAnswers[levelKey];
      if (!Array.isArray(levelAnswers)) {
        return `answers.${field}.${levelKey} must be an array.`;
      }

      for (const entry of levelAnswers) {
        if (!isValidAnswerEntry(entry)) {
          return `Each answer in answers.${field}.${levelKey} must include questionId and signal strings.`;
        }
      }
    }
  }

  return null;
}

function scoreLevel(field, answers) {
  if (!answers.length) {
    return 0;
  }

  const positiveSet = new Set(POSITIVE_SIGNALS[field]);
  const positiveCount = answers.filter((answer) => positiveSet.has(answer.signal)).length;
  return Math.round((positiveCount / answers.length) * 100);
}

function computeFieldScore(field, fieldAnswers) {
  let total = 0;

  for (const levelKey of LEVEL_KEYS) {
    const levelScore = scoreLevel(field, fieldAnswers[levelKey]);
    total += levelScore * LEVEL_WEIGHTS[levelKey];
  }

  return Math.round(total);
}

router.post('/', (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return fail(res, validationError);
  }

  const scores = {};
  for (const field of FIELDS) {
    scores[field] = computeFieldScore(field, req.body.answers[field]);
  }

  const recommended = FIELDS.reduce((best, field) => (
    scores[field] > scores[best] ? field : best
  ), FIELDS[0]);

  return res.json({ scores, recommended });
});

module.exports = router;
