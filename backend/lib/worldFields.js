const { WORLDS } = require('../data/worlds');
const { MENTORS } = require('../config/fields');

/** Discovery world id → legacy question-bank field name. */
const WORLD_TO_FIELD = {
  business: 'business',
  engineering: 'engineering',
  technology: 'engineering',
  medicine: 'medicine',
  creative: 'arts',
};

const POSITIVE_BY_FIELD = {
  engineering: [
    'hands_on', 'analytical', 'problem_solver', 'builder', 'systems_thinker',
    'curious_tinkerer', 'detail_oriented', 'tech_enthusiast',
  ],
  arts: [
    'creative', 'expressive', 'visual_thinker', 'storyteller', 'design_minded',
    'imaginative', 'collaborative_creator', 'aesthetic',
  ],
  business: [
    'strategic', 'entrepreneurial', 'leader', 'negotiator', 'money_minded',
    'organizer', 'persuasive', 'risk_taker',
  ],
  medicine: [
    'empathetic', 'science_driven', 'helper', 'detail_care', 'patient_centered',
    'curious_biologist', 'calm_under_pressure', 'team_caregiver',
  ],
};

function resolveMentor(world) {
  if (world === 'business') return MENTORS.business.name;

  const w = WORLDS[world];
  if (w?.mentorName) return w.mentorName;

  const field = WORLD_TO_FIELD[world];
  if (field && MENTORS[field]) return MENTORS[field].name;

  return 'Career Mentor';
}

function isPositiveSignal(field, signal) {
  if (!signal || signal === 'neutral') return false;
  const set = POSITIVE_BY_FIELD[field];
  return set ? set.includes(signal) : signal !== 'neutral';
}

module.exports = {
  WORLD_TO_FIELD,
  POSITIVE_BY_FIELD,
  resolveMentor,
  isPositiveSignal,
};
