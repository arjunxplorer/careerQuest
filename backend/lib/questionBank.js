const fs = require('fs');
const path = require('path');
const { gradeToLevel } = require('./gradeLevel');
const { WORLD_TO_FIELD, isPositiveSignal } = require('./worldFields');

function loadFieldLevels(field) {
  const filePath = path.join(__dirname, '..', 'questions', `${field}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findQuestion(field, level, questionId) {
  const levels = loadFieldLevels(field);
  if (!levels) return null;
  const block = levels.find((b) => b.level === level);
  if (!block) return null;
  const question = block.questions.find((q) => q.id === questionId);
  if (!question) return null;
  return { block, question };
}

/**
 * Pick one portal question for a world at the student's grade level.
 * @param {string} world
 * @param {number} grade
 * @param {string[]} excludeIds — already-used question ids this run
 */
function pickPortalQuestion(world, grade, excludeIds = []) {
  const field = WORLD_TO_FIELD[world];
  if (!field) return null;

  const targetLevel = gradeToLevel(grade);
  const levels = loadFieldLevels(field);
  if (!levels) return null;

  const exclude = new Set(excludeIds);

  // Prefer the grade-mapped level, but fall back to easier MC levels if this
  // band uses open-ended prompts (level 4 in the question bank).
  for (let tryLevel = targetLevel; tryLevel >= 1; tryLevel -= 1) {
    const block = levels.find((b) => b.level === tryLevel);
    if (!block || block.format !== 'multiple_choice') continue;

    const mcQuestions = block.questions.filter(
      (q) => Array.isArray(q.options) && q.options.length > 0,
    );
    if (!mcQuestions.length) continue;

    const pool = mcQuestions.filter((q) => !exclude.has(q.id));
    const candidates = pool.length ? pool : mcQuestions;
    const question = candidates[Math.floor(Math.random() * candidates.length)];

    return {
      world,
      field,
      level: block.level,
      theme: block.theme,
      format: block.format,
      agentFeedbackPrompt: block.agent_feedback_prompt,
      question: {
        id: question.id,
        text: question.text,
        options: question.options.map((o) => ({
          label: o.label,
          text: o.text,
          isStrongChoice: isPositiveSignal(field, o.signal),
        })),
      },
    };
  }

  return null;
}

function resolveAnswer(field, level, questionId, label) {
  const found = findQuestion(field, level, questionId);
  if (!found) {
    return { error: `Question ${questionId} not found for ${field} level ${level}.` };
  }

  const option = found.question.options.find((o) => o.label === label);
  if (!option) {
    return {
      error: `Invalid label "${label}" for question ${questionId}.`,
    };
  }

  const positive = isPositiveSignal(field, option.signal);
  return {
    questionText: found.question.text,
    answerText: option.text,
    signal: option.signal,
    positive,
    level: found.block.level,
    theme: found.block.theme,
    agentFeedbackPrompt: found.block.agent_feedback_prompt,
  };
}

module.exports = {
  pickPortalQuestion,
  resolveAnswer,
  findQuestion,
  gradeToLevel,
};
