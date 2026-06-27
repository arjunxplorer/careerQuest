const express = require('express');
const { pickPortalQuestion } = require('../lib/questionBank');
const { resolveMentor } = require('../lib/worldFields');

const router = express.Router();

const ALL_WORLDS = ['business', 'engineering', 'technology', 'medicine', 'creative'];

function parseGrade(raw) {
  const grade = Number(raw);
  return Number.isFinite(grade) ? grade : 8;
}

// GET /play/portal-question/:world?grade=8&exclude=id1,id2
router.get('/portal-question/:world', (req, res) => {
  const { world } = req.params;
  if (!ALL_WORLDS.includes(world)) {
    return res.status(404).json({ error: `Unknown world. Available: ${ALL_WORLDS.join(', ')}` });
  }

  const grade = parseGrade(req.query.grade);
  const exclude = String(req.query.exclude || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const picked = pickPortalQuestion(world, grade, exclude);
  if (!picked) {
    return res.status(404).json({ error: `No multiple-choice questions found for world "${world}".` });
  }

  try {
    return res.json({
      ...picked,
      mentorName: resolveMentor(world),
      grade,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to load portal question.' });
  }
});

module.exports = router;
