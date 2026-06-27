const express = require('express');
const crypto = require('crypto');
const runDebriefPrompt = require('../prompts/runDebrief');
const { createConversation } = require('../lib/tavus');
const { resolveMentor, WORLD_TO_FIELD } = require('../lib/worldFields');
const { resolveAnswer } = require('../lib/questionBank');

const router = express.Router();

const ALL_WORLDS = ['business', 'engineering', 'technology', 'medicine', 'creative'];

// Recommended career paths per world (from challenge.md).
const CAREER_PATHS = {
  business: ['Entrepreneur', 'Product Manager', 'Marketing Manager', 'Business Analyst', 'Management Consultant'],
  engineering: ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Aerospace Engineer'],
  technology: ['Software Engineer', 'AI Engineer', 'Cybersecurity Analyst', 'Product Manager'],
  medicine: ['Doctor', 'Psychologist', 'Medical Researcher', 'Nurse'],
  creative: ['Graphic Designer', 'Animator', 'Filmmaker', 'Writer', 'Musician'],
};

// POST /run/complete — aggregate per-world Discovery Run scores into a recommendation.
// Body: { studentName, grade?, scores: { <world>: number (0-100), ... } }
router.post('/complete', (req, res) => {
  const { studentName, grade, scores } = req.body || {};

  if (typeof studentName !== 'string' || !studentName.trim()) {
    return res.status(400).json({ error: 'studentName must be a non-empty string.' });
  }
  if (!scores || typeof scores !== 'object') {
    return res.status(400).json({ error: 'scores must be an object mapping world -> number (0-100).' });
  }

  const entries = Object.entries(scores).filter(
    ([world, value]) => ALL_WORLDS.includes(world) && typeof value === 'number' && Number.isFinite(value)
  );

  if (!entries.length) {
    return res.status(400).json({
      error: `scores must include at least one valid world. Worlds: ${ALL_WORLDS.join(', ')}`,
    });
  }

  const ranking = entries
    .map(([world, score]) => ({ world, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score);

  const recommended = ranking[0].world;
  const firstName = studentName.trim().split(/\s+/)[0] || 'Explorer';

  const top3 = ranking.slice(0, 3).map((r) => r.world);
  const message =
    `Great run, ${firstName}! You showed the strongest spark in the ${recommended} world. ` +
    `Based on how you played, the worlds worth exploring next are: ${top3.join(', ')}. ` +
    `Remember — the AI recommends, but you decide where to go.`;

  return res.json({
    sessionId: crypto.randomUUID(),
    studentName,
    grade: grade ?? null,
    recommended,
    ranking,
    recommendedWorlds: top3,
    recommendedCareers: CAREER_PATHS[recommended] || [],
    message,
  });
});

function buildDebriefFeedback(studentName, recommended, ranking, portalAnswers, correctCount, requiredCount) {
  const firstName = studentName.trim().split(/\s+/)[0] || 'Explorer';
  const top = ranking[0];
  const passed = correctCount >= requiredCount;

  const lines = [
    passed
      ? `Amazing run, ${firstName}! You showed ${correctCount} of ${requiredCount} strong instincts and unlocked the Career Compass.`
      : `Nice effort, ${firstName}! You hit ${correctCount} of ${requiredCount} strong instincts — every Discovery Run teaches you something new.`,
    `Your strongest world right now is ${recommended}${top ? ` (${top.score}/100)` : ''}.`,
  ];

  const strong = portalAnswers.filter((p) => p.positive);
  if (strong.length) {
    const worlds = [...new Set(strong.map((p) => p.world))];
    lines.push(
      `You showed sharp instincts in ${worlds.join(', ')} — especially when you picked answers that match how people thrive in those fields.`,
    );
  }

  if (!passed) {
    lines.push(
      `You answered ${correctCount} of ${requiredCount} portal challenges with strong career signals. Run it again — the Compass opens when you hit ${requiredCount}!`,
    );
  } else {
    lines.push('Pick an island and dive deeper when you are ready. The AI recommends — you decide.');
  }

  lines.push(
    `What would you like to learn more about in ${recommended}? Think about what sounded coolest to you — building things, helping people, creating, or something else.`,
  );

  return lines.join(' ');
}

const DEBRIEF_GREETINGS = {
  business: (first) =>
    `Hey ${first}! Sam Park here — I just watched your Discovery Run and I want to tell you how you did, then hear what you'd like to learn more about in business!`,
  engineering: (first) =>
    `Hey ${first}! Mx. Chen here — let's talk about how your run went and what engineering topics you'd like to explore deeper!`,
  technology: (first) =>
    `Hey ${first}! Dev Kapoor here — I saw your Discovery Run results and I'm curious what tech stuff you'd want to learn more about!`,
  medicine: (first) =>
    `Hey ${first}! Dr. Rivera here — let me share how you did, and then tell me what part of medicine interests you most!`,
  creative: (first) =>
    `Hey ${first}! Alex Moore here — I loved your run! Let's review how you did and what creative paths you'd like to dive into!`,
};

// POST /run/debrief — Career Compass + character-specific live mentor video.
// Body: {
//   studentName, grade?, scores, correctCount, requiredCount?,
//   portalAnswers: [{ world, questionId, answerLabel, questionText?, level? }],
//   testMode?
// }
router.post('/debrief', async (req, res) => {
  const {
    studentName,
    grade,
    scores,
    correctCount = 0,
    requiredCount = 5,
    portalAnswers: rawPortals = [],
    testMode,
  } = req.body || {};

  if (typeof studentName !== 'string' || !studentName.trim()) {
    return res.status(400).json({ error: 'studentName must be a non-empty string.' });
  }
  if (!scores || typeof scores !== 'object') {
    return res.status(400).json({ error: 'scores must be an object mapping world -> number.' });
  }

  const entries = Object.entries(scores).filter(
    ([world, value]) => ALL_WORLDS.includes(world) && typeof value === 'number' && Number.isFinite(value),
  );

  if (!entries.length) {
    return res.status(400).json({
      error: `scores must include at least one valid world. Worlds: ${ALL_WORLDS.join(', ')}`,
    });
  }

  const ranking = entries
    .map(([world, score]) => ({ world, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score);

  const recommended = ranking[0].world;
  const firstName = studentName.trim().split(/\s+/)[0] || 'Explorer';
  const top3 = ranking.slice(0, 3).map((r) => r.world);
  const message =
    `Great run, ${firstName}! You showed the strongest spark in the ${recommended} world. ` +
    `Based on how you played, the worlds worth exploring next are: ${top3.join(', ')}. ` +
    `Remember — the AI recommends, but you decide where to go.`;

  // Enrich portal answers with signals from the question bank.
  const portalAnswers = (Array.isArray(rawPortals) ? rawPortals : []).map((p) => {
    const field = WORLD_TO_FIELD[p.world];
    const level = Number(p.level) || 2;
    const resolved = field && p.questionId && p.answerLabel
      ? resolveAnswer(field, level, p.questionId, p.answerLabel)
      : null;

    if (resolved?.error) {
      return {
        world: p.world,
        questionText: p.questionText || 'Portal challenge',
        answerLabel: p.answerLabel,
        answerText: p.answerText || '',
        signal: 'neutral',
        positive: false,
        level,
        theme: p.theme || '',
      };
    }

    return {
      world: p.world,
      questionText: resolved?.questionText || p.questionText || 'Portal challenge',
      answerLabel: p.answerLabel,
      answerText: resolved?.answerText || p.answerText || '',
      signal: resolved?.signal || 'neutral',
      positive: resolved?.positive ?? false,
      level: resolved?.level || level,
      theme: resolved?.theme || p.theme || '',
    };
  });

  const feedback = buildDebriefFeedback(
    studentName,
    recommended,
    ranking,
    portalAnswers,
    correctCount,
    requiredCount,
  );

  const mentorName = resolveMentor(recommended);

  const response = {
    sessionId: crypto.randomUUID(),
    studentName,
    grade: grade ?? null,
    recommended,
    ranking,
    recommendedWorlds: top3,
    recommendedCareers: CAREER_PATHS[recommended] || [],
    message,
    mentorName,
    feedback,
  };

  try {
    const conversationalContext = runDebriefPrompt({
      mentorKey: recommended,
      mentorName,
      studentName,
      grade,
      recommended,
      scores,
      ranking,
      correctCount,
      requiredCount,
      portalAnswers,
      compassMessage: message,
    });

    const greetFn = DEBRIEF_GREETINGS[recommended] || DEBRIEF_GREETINGS.engineering;
    const data = await createConversation({
      conversationName: `CareerQuest — ${studentName} × ${mentorName} (Discovery Debrief)`,
      conversationalContext,
      customGreeting: greetFn(firstName),
      testMode: Boolean(testMode),
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
