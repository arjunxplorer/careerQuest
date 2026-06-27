const FIELDS = ['engineering', 'arts', 'business', 'medicine'];

const LEVELS = [1, 2, 3, 4];

const LEVEL_KEYS = ['level1', 'level2', 'level3', 'level4'];

const LEVEL_WEIGHTS = {
  level1: 0.1,
  level2: 0.2,
  level3: 0.3,
  level4: 0.4,
};

const POSITIVE_SIGNALS = {
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

const MENTORS = {
  engineering: { name: 'Mx. Chen', promptModule: 'engineering' },
  arts: { name: 'Alex Moore', promptModule: 'arts' },
  business: { name: 'Sam Park', promptModule: 'business' },
  medicine: { name: 'Dr. Rivera', promptModule: 'medicine' },
};

module.exports = {
  FIELDS,
  LEVELS,
  LEVEL_KEYS,
  LEVEL_WEIGHTS,
  POSITIVE_SIGNALS,
  MENTORS,
};
