/**
 * Discovery Run worlds (lightweight) — Engineering, Technology, Medicine, Creative.
 *
 * Business has its own deep simulation (data/lemonadeStand.js + lib/businessSim.js).
 * These four use a shared signal-based engine (lib/discoverySim.js) but expose the
 * SAME endpoint shape so the frontend can treat all five portals uniformly.
 *
 * Each option carries a `signal`. Signals in the world's `positiveSignals` set count
 * toward the score; `neutral` does not.
 */

const WORLDS = {
  engineering: {
    id: 'bridge_builder',
    world: 'engineering',
    track: 'civil_engineering',
    order: 1,
    title: 'Bridge Builder',
    emoji: '⚙️',
    mentorName: 'Mx. Chen',
    scenario:
      'A growing town needs a new bridge across the river, and the budget is tight. ' +
      'You are the lead engineer — every choice affects whether it stands strong for decades.',
    objective: 'Design a bridge that is safe, smart, and built to last.',
    skills: ['Problem solving', 'Systems thinking', 'Precision', 'Design under constraints'],
    positiveSignals: ['problem_solver', 'systems_thinker', 'analytical', 'detail_oriented', 'builder'],
    decisions: [
      {
        id: 'approach',
        prompt: 'How do you start the design?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Build small test prototypes and measure what holds', signal: 'problem_solver' },
          { label: 'B', text: 'Start from a proven, well-understood design', signal: 'analytical' },
          { label: 'C', text: 'Pick whatever looks coolest', signal: 'neutral' },
          { label: 'D', text: 'Choose the cheapest option no matter what', signal: 'neutral' },
        ],
      },
      {
        id: 'failure',
        prompt: 'A support beam fails the load test. What now?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Analyze exactly why it failed, then redesign that part', signal: 'systems_thinker' },
          { label: 'B', text: 'Pile on more material everywhere just in case', signal: 'neutral' },
          { label: 'C', text: 'It is close enough — ship it', signal: 'neutral' },
          { label: 'D', text: 'Hand it to someone else to deal with', signal: 'neutral' },
        ],
      },
      {
        id: 'priority',
        prompt: 'When you must trade something off, what wins?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Safety and durability', signal: 'detail_oriented' },
          { label: 'B', text: 'Lowest possible cost', signal: 'neutral' },
          { label: 'C', text: 'Fastest build time', signal: 'neutral' },
          { label: 'D', text: 'The most eye-catching look', signal: 'neutral' },
        ],
      },
    ],
  },

  technology: {
    id: 'code_and_robots',
    world: 'technology',
    track: 'software_development',
    order: 1,
    title: 'Code & Robots',
    emoji: '💻',
    mentorName: 'Dev Kapoor',
    scenario:
      'You just joined a tiny tech lab building a helper robot. The code is glitchy, the deadline is close, ' +
      'and it is up to you to make it work.',
    objective: 'Debug, automate, and get the robot running like a real software engineer.',
    skills: ['Debugging', 'Automation', 'Logical thinking', 'Curiosity'],
    positiveSignals: ['problem_solver', 'automation_minded', 'curious_tinkerer', 'logical', 'builder'],
    decisions: [
      {
        id: 'bug',
        prompt: 'The robot keeps spinning in circles. There is a bug somewhere. What do you do?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Break the program into parts and test each one', signal: 'problem_solver' },
          { label: 'B', text: 'Delete everything and rewrite from scratch', signal: 'neutral' },
          { label: 'C', text: 'Try random changes until it works', signal: 'neutral' },
          { label: 'D', text: 'Skip it and hope no one notices', signal: 'neutral' },
        ],
      },
      {
        id: 'repetitive',
        prompt: 'You have to label 500 images by hand. Ugh. Your move?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Write a small script to automate most of it', signal: 'automation_minded' },
          { label: 'B', text: 'Carefully do all 500 by hand', signal: 'neutral' },
          { label: 'C', text: 'Ask a friend to do half', signal: 'neutral' },
          { label: 'D', text: 'Avoid the task entirely', signal: 'neutral' },
        ],
      },
      {
        id: 'gadget',
        prompt: 'A brand-new gadget arrives at the lab. You immediately want to...',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Take it apart to understand how it works', signal: 'curious_tinkerer' },
          { label: 'B', text: 'Read reviews about it', signal: 'neutral' },
          { label: 'C', text: 'Use it exactly as the manual says', signal: 'neutral' },
          { label: 'D', text: 'Not really interested', signal: 'neutral' },
        ],
      },
    ],
  },

  medicine: {
    id: 'er_triage',
    world: 'medicine',
    track: 'medicine',
    order: 1,
    title: 'ER Triage',
    emoji: '🩺',
    mentorName: 'Dr. Rivera',
    scenario:
      'It is a busy night in the emergency room. Patients are arriving, everyone needs help, ' +
      'and you are the one making the calls. Stay calm and care well.',
    objective: 'Make smart, caring decisions under pressure to help every patient.',
    skills: ['Empathy', 'Staying calm', 'Evidence-based thinking', 'Care'],
    positiveSignals: ['empathetic', 'calm_under_pressure', 'science_driven', 'helper', 'detail_care'],
    decisions: [
      {
        id: 'triage',
        prompt: 'Three patients arrive at the same moment. What do you do first?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Quickly assess who is most critical and treat them first', signal: 'calm_under_pressure' },
          { label: 'B', text: 'Help whoever is the loudest', signal: 'neutral' },
          { label: 'C', text: 'Freeze for a moment, unsure', signal: 'neutral' },
          { label: 'D', text: 'Wait for someone else to decide', signal: 'neutral' },
        ],
      },
      {
        id: 'scared',
        prompt: 'A young patient is terrified before a procedure. You...',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Kneel down, explain calmly, and reassure them', signal: 'empathetic' },
          { label: 'B', text: 'Just do the procedure quickly', signal: 'neutral' },
          { label: 'C', text: 'Tell them to stop worrying', signal: 'neutral' },
          { label: 'D', text: 'Call someone else to handle it', signal: 'neutral' },
        ],
      },
      {
        id: 'diagnosis',
        prompt: 'You are not sure what is wrong with a patient. Your next step?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Order the right tests and follow the evidence', signal: 'science_driven' },
          { label: 'B', text: 'Make a quick guess', signal: 'neutral' },
          { label: 'C', text: 'Assume it is the most common illness', signal: 'neutral' },
          { label: 'D', text: 'Avoid making a decision', signal: 'neutral' },
        ],
      },
    ],
  },

  creative: {
    id: 'brand_studio',
    world: 'creative',
    track: 'design',
    order: 1,
    title: 'Brand Studio',
    emoji: '🎨',
    mentorName: 'Alex Moore',
    scenario:
      'A new juice company wants a brand that pops. You run the creative studio — ' +
      'time to turn a blank page into something people remember.',
    objective: 'Create a bold, original brand and tell its story.',
    skills: ['Creativity', 'Visual thinking', 'Storytelling', 'Imagination'],
    positiveSignals: ['imaginative', 'creative', 'storyteller', 'visual_thinker', 'design_minded', 'expressive'],
    decisions: [
      {
        id: 'concept',
        prompt: 'How do you begin the brand design?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Sketch bold, original concepts from imagination', signal: 'imaginative' },
          { label: 'B', text: 'Copy a popular brand that already works', signal: 'neutral' },
          { label: 'C', text: 'Use a default template', signal: 'neutral' },
          { label: 'D', text: 'Skip the design part', signal: 'neutral' },
        ],
      },
      {
        id: 'feedback',
        prompt: 'The client says your first draft is "a little too safe." You...',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Push a bolder, more daring creative direction', signal: 'creative' },
          { label: 'B', text: 'Leave it exactly as it is', signal: 'neutral' },
          { label: 'C', text: 'Make it even more plain', signal: 'neutral' },
          { label: 'D', text: 'Give up on the project', signal: 'neutral' },
        ],
      },
      {
        id: 'pitch',
        prompt: 'Time to present your brand. How do you do it?',
        type: 'multiple_choice',
        options: [
          { label: 'A', text: 'Tell a vivid story that captures the brand\'s mood', signal: 'storyteller' },
          { label: 'B', text: 'List the facts and move on', signal: 'neutral' },
          { label: 'C', text: 'Let someone else present it', signal: 'neutral' },
          { label: 'D', text: 'Put in minimal effort', signal: 'neutral' },
        ],
      },
    ],
  },
};

const DISCOVERY_WORLDS = Object.keys(WORLDS);

// Public (frontend-safe) view of a challenge — strips internal signal data.
function publicChallenge(world) {
  const w = WORLDS[world];
  if (!w) return null;
  return {
    id: w.id,
    world: w.world,
    track: w.track,
    order: w.order,
    title: w.title,
    emoji: w.emoji,
    mentorName: w.mentorName,
    scenario: w.scenario,
    objective: w.objective,
    skills: w.skills,
    decisions: w.decisions.map((d) => ({
      id: d.id,
      prompt: d.prompt,
      type: d.type,
      options: d.options.map((o) => ({ label: o.label, text: o.text })),
    })),
  };
}

module.exports = { WORLDS, DISCOVERY_WORLDS, publicChallenge };
