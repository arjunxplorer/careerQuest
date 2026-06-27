/**
 * Business Kingdom — Level 1: Entrepreneurship
 * Challenge 1: Lemonade Stand
 *
 * `challenge` is the frontend-safe payload (served by GET /business/challenge).
 * `simModel` holds the server-only economics used to simulate outcomes so the
 * "game" cannot be reverse-engineered from the client.
 */

const challenge = {
  id: 'lemonade_stand',
  world: 'business',
  track: 'entrepreneurship',
  order: 1,
  title: 'Lemonade Stand',
  emoji: '🍋',
  scenario:
    "It's a blazing hot summer day and the whole neighborhood is out and about. " +
    'You set up a lemonade stand on the busiest corner. Every choice you make decides ' +
    'how many cups you sell — and how much profit you take home.',
  objective: 'Run your lemonade stand for the day and earn the most profit while keeping customers happy.',
  skills: ['Supply & demand', 'Pricing', 'Budgeting', 'Marketing'],
  decisions: [
    {
      id: 'price',
      prompt: 'How much will you charge per cup?',
      type: 'multiple_choice',
      options: [
        { label: 'A', text: '$0.50 — rock-bottom to pull a crowd' },
        { label: 'B', text: '$1.00 — fair and friendly' },
        { label: 'C', text: '$2.00 — premium pricing' },
        { label: 'D', text: '$3.00 — luxury lemonade' },
      ],
    },
    {
      id: 'inventory',
      prompt: 'How many cups will you prepare?',
      type: 'multiple_choice',
      options: [
        { label: 'A', text: '20 cups — play it safe' },
        { label: 'B', text: '50 cups — a moderate batch' },
        { label: 'C', text: '100 cups — go big' },
        { label: 'D', text: '150 cups — all in' },
      ],
    },
    {
      id: 'sign',
      prompt: 'Spend $5 on a big colorful sign?',
      type: 'binary_choice',
      options: [
        { label: 'A', text: 'Yes — make it eye-catching' },
        { label: 'B', text: 'No — save the money' },
      ],
    },
    {
      id: 'advertise',
      prompt: 'Spend $10 on flyers around the neighborhood?',
      type: 'binary_choice',
      options: [
        { label: 'A', text: 'Yes — spread the word' },
        { label: 'B', text: 'No — rely on foot traffic' },
      ],
    },
  ],
};

const simModel = {
  costPerCup: 0.3,
  signCost: 5,
  adCost: 10,
  baseTraffic: 120,
  // Fraction of base traffic willing to buy at each price point.
  priceDemandFactor: {
    A: 1.0, // $0.50
    B: 0.85, // $1.00
    C: 0.5, // $2.00
    D: 0.25, // $3.00
  },
  priceValue: { A: 0.5, B: 1.0, C: 2.0, D: 3.0 },
  inventoryValue: { A: 20, B: 50, C: 100, D: 150 },
  signBoost: 0.15,
  adBoost: 0.3,
};

module.exports = { challenge, simModel };
