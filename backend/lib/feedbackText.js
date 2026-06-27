const { POSITIVE_SIGNALS, MENTORS } = require('../config/fields');

const LEVEL_THEMES = {
  1: 'curiosity',
  2: 'skills',
  3: 'values',
  4: 'vision',
};

function countPositiveSignals(field, answers) {
  const positiveSet = new Set(POSITIVE_SIGNALS[field]);
  const positive = answers.filter((answer) => positiveSet.has(answer.signal)).length;
  return { positive, total: answers.length };
}

function pickTone(ratio) {
  if (ratio >= 0.75) return 'strong';
  if (ratio >= 0.4) return 'mixed';
  return 'exploratory';
}

function levelFeedback({ studentName, field, level, answers, agentFeedbackPrompt }) {
  const mentor = MENTORS[field];
  const { positive, total } = countPositiveSignals(field, answers);
  const ratio = total ? positive / total : 0;
  const tone = pickTone(ratio);
  const theme = LEVEL_THEMES[level];

  const openers = {
    strong: `Nice work, ${studentName}!`,
    mixed: `Good progress, ${studentName}.`,
    exploratory: `Thanks for sharing, ${studentName}.`,
  };

  const bodies = {
    1: {
      strong: `Your answers show real curiosity about ${field}. You gravitated toward choices that match this field's energy — keep following what pulls you in.`,
      mixed: `You're starting to explore what draws you to ${field}. Some answers leaned that way and others didn't — that's normal at this stage.`,
      exploratory: `Level 1 is about noticing what catches your eye. You tried different directions here, which gives us useful signal for the levels ahead.`,
    },
    2: {
      strong: `Your skill-alignment answers line up well with ${field}. You're showing habits and strengths that people in this path use every day.`,
      mixed: `You're building a clearer picture of how your strengths map to ${field}. A few answers stood out as strong fits — worth paying attention to.`,
      exploratory: `This level tests whether your everyday strengths match ${field}. Mixed results here just mean there's more to discover in the next levels.`,
    },
    3: {
      strong: `Your trade-off choices suggest ${field} aligns with what you value — not just what's easy, but what you'd choose when it matters.`,
      mixed: `You thought carefully about values and trade-offs. Some choices pointed toward ${field}, others toward different priorities — that's thoughtful.`,
      exploratory: `Level 3 is about values, not right answers. Your choices show you're weighing what matters — that honesty helps shape a better recommendation.`,
    },
    4: {
      strong: `Your vision for the future connects strongly to ${field}. The way you described your goals shows direction and intent.`,
      mixed: `You shared a thoughtful future vision. Parts of it connect to ${field}, and parts point elsewhere — both are useful for your mentor conversation.`,
      exploratory: `Open-ended answers are hard, and you put real thought into yours. Your vision gives your mentor something concrete to explore with you.`,
    },
  };

  const closers = {
    strong: `Ready for the next level when you are.`,
    mixed: `Let's see what the next level reveals.`,
    exploratory: `The next level will help sharpen the picture.`,
  };

  const body = bodies[level][tone];
  const feedback = `${openers[tone]} ${body} ${closers[tone]}`;

  return {
    feedback,
    mentorName: mentor.name,
    meta: {
      field,
      level,
      theme,
      positiveCount: positive,
      totalAnswered: total,
      agentFeedbackPrompt,
    },
  };
}

module.exports = {
  levelFeedback,
  countPositiveSignals,
};
