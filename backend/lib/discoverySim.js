const { WORLDS } = require('../data/worlds');

const SIGNAL_LABELS = {
  problem_solver: 'problem solving',
  systems_thinker: 'systems thinking',
  analytical: 'analytical thinking',
  detail_oriented: 'attention to detail',
  builder: 'building things',
  automation_minded: 'automation',
  curious_tinkerer: 'curiosity',
  logical: 'logical thinking',
  empathetic: 'empathy',
  calm_under_pressure: 'staying calm under pressure',
  science_driven: 'evidence-based thinking',
  helper: 'helping others',
  detail_care: 'careful, thorough care',
  imaginative: 'imagination',
  creative: 'creativity',
  storyteller: 'storytelling',
  visual_thinker: 'visual thinking',
  design_minded: 'design sense',
  expressive: 'self-expression',
};

function resolveAnswers(world, answers) {
  const w = WORLDS[world];
  const errors = [];
  const chosen = [];

  for (const decision of w.decisions) {
    const label = answers ? answers[decision.id] : undefined;
    const option = decision.options.find((o) => o.label === label);
    if (!option) {
      errors.push(`Invalid or missing answer for "${decision.id}". Expected one of: ${decision.options.map((o) => o.label).join(', ')}`);
      continue;
    }
    chosen.push({ decisionId: decision.id, label, signal: option.signal });
  }

  return errors.length ? { errors } : { chosen };
}

function scoreWorld(world, chosen) {
  const w = WORLDS[world];
  const positiveSet = new Set(w.positiveSignals);

  const positives = chosen.filter((c) => positiveSet.has(c.signal));
  const total = chosen.length || 1;
  const score = Math.round((positives.length / total) * 100);

  let engagement;
  if (score >= 75) engagement = 'high';
  else if (score >= 40) engagement = 'medium';
  else engagement = 'low';

  let outcome;
  if (score >= 85) outcome = 'excellent';
  else if (score >= 60) outcome = 'solid';
  else if (score >= 40) outcome = 'exploring';
  else outcome = 'curious';

  const topSignal = positives.length ? positives[0].signal : null;
  const topTrait = topSignal ? SIGNAL_LABELS[topSignal] || topSignal : null;

  return { score, engagement, outcome, topTrait, positiveCount: positives.length, totalDecisions: chosen.length };
}

function buildFeedbackText(world, studentName, scoreResult) {
  const w = WORLDS[world];
  const firstName = String(studentName).trim().split(/\s+/)[0] || 'there';
  const lines = [];

  const opener = {
    excellent: `Wow, ${firstName} — you were a natural in the ${w.title} challenge!`,
    solid: `Nice work in the ${w.title} challenge, ${firstName}.`,
    exploring: `Good effort in the ${w.title} challenge, ${firstName}.`,
    curious: `Thanks for exploring the ${w.title} challenge, ${firstName}.`,
  }[scoreResult.outcome];
  lines.push(opener);

  if (scoreResult.topTrait) {
    lines.push(`You showed real ${scoreResult.topTrait} in how you made your choices — that's a key strength in the ${w.world} world.`);
  } else {
    lines.push(`You tried a different style here, which is exactly what the Discovery Run is for — figuring out what truly fits you.`);
  }

  const closer = {
    high: `${w.world.charAt(0).toUpperCase() + w.world.slice(1)} clearly lights you up. Definitely worth exploring more!`,
    medium: `There's a spark here worth following. Keep an eye on this world.`,
    low: `This might not be your top world yet — and that's useful to know too.`,
  }[scoreResult.engagement];
  lines.push(closer);

  return lines.join(' ');
}

function runDiscovery(world, studentName, answers) {
  const resolved = resolveAnswers(world, answers);
  if (resolved.errors) return { errors: resolved.errors };

  const score = scoreWorld(world, resolved.chosen);
  const feedback = buildFeedbackText(world, studentName, score);

  return { chosen: resolved.chosen, score, feedback };
}

module.exports = { runDiscovery, scoreWorld, resolveAnswers, buildFeedbackText };
