const express = require('express');
const fs = require('fs');
const path = require('path');
const { FIELDS, LEVELS } = require('../config/fields');

const router = express.Router();

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

router.get('/:field/:level', (req, res) => {
  const { field } = req.params;
  const level = Number(req.params.level);

  if (!FIELDS.includes(field)) {
    return res.status(400).json({ error: `Invalid field. Must be one of: ${FIELDS.join(', ')}` });
  }

  if (!LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Must be 1, 2, 3, or 4.' });
  }

  const filePath = path.join(__dirname, '..', 'questions', `${field}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Question bank not found for field.' });
  }

  const levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const levelBlock = levels.find((block) => block.level === level);

  if (!levelBlock) {
    return res.status(404).json({ error: `Level ${level} not found for ${field}.` });
  }

  return res.json({
    level: levelBlock.level,
    theme: levelBlock.theme,
    format: levelBlock.format,
    agent_feedback_prompt: levelBlock.agent_feedback_prompt,
    questions: shuffle(levelBlock.questions),
  });
});

module.exports = router;
