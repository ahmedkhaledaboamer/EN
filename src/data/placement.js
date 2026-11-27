// ─────────────────────────────────────────────────────────────
//  Placement test: 4 stages (A1 → B2), 6 questions each.
//  A stage is "passed" with PASS_PER_STAGE correct answers; the test stops at
//  the first failed stage. Every question also gets an "I don't know" option.
//  `audio` questions play the sentence (the text is shown if audio isn't supported).
// ─────────────────────────────────────────────────────────────

export const STAGES = ['A1', 'A2', 'B1', 'B2'];
export const PASS_PER_STAGE = 4; // out of 6
export const DONT_KNOW = "I don't know";

export const PLACEMENT_QUESTIONS = [
  // ── A1 ──
  { level: 'A1', question: '___ name is Sara.', options: ['My', 'I', 'Me'], answer: 'My' },
  { level: 'A1', question: 'They ___ from Egypt.', options: ['is', 'am', 'are'], answer: 'are' },
  { level: 'A1', question: 'I ___ coffee every morning.', options: ['drinks', 'drink', 'drinking'], answer: 'drink' },
  { level: 'A1', question: 'A ___ helps sick people in a hospital.', options: ['driver', 'chef', 'nurse'], answer: 'nurse' },
  { level: 'A1', question: 'There ___ two chairs in the kitchen.', options: ['are', 'is', 'be'], answer: 'are' },
  {
    level: 'A1',
    audio: "It's half past seven.",
    question: 'What time is it?',
    options: ['7:15', '7:30', '6:30'],
    answer: '7:30',
  },

  // ── A2 ──
  { level: 'A2', question: 'Yesterday I ___ to the dentist.', options: ['go', 'gone', 'went'], answer: 'went' },
  { level: 'A2', question: 'She is ___ than her brother.', options: ['taller', 'tall', 'tallest'], answer: 'taller' },
  { level: 'A2', question: 'You look ill. You ___ see a doctor.', options: ['would', 'should', "mustn't"], answer: 'should' },
  { level: 'A2', question: 'We ___ visit Alexandria next summer.', options: ['are going to', 'went to', 'going'], answer: 'are going to' },
  { level: 'A2', question: 'How ___ apples do you need?', options: ['much', 'any', 'many'], answer: 'many' },
  {
    level: 'A2',
    audio: "I'd like a large latte to take away, please.",
    question: 'What does the customer want?',
    options: ['A large latte to go', 'A small tea to drink here', 'A large piece of cake'],
    answer: 'A large latte to go',
  },

  // ── B1 ──
  { level: 'B1', question: 'I ___ in this city since 2020.', options: ['live', 'have lived', 'am living'], answer: 'have lived' },
  { level: 'B1', question: 'If it rains tomorrow, we ___ at home.', options: ['will stay', 'stay', 'would stay'], answer: 'will stay' },
  { level: 'B1', question: 'The package ___ yesterday.', options: ['delivered', 'has delivering', 'was delivered'], answer: 'was delivered' },
  { level: 'B1', question: 'I ___ TV when the phone rang.', options: ['was watching', 'watched', 'am watching'], answer: 'was watching' },
  { level: 'B1', question: 'If I ___ more money, I would buy a new car.', options: ['have', 'had', 'will have'], answer: 'had' },
  {
    level: 'B1',
    audio: "I've been working on this bug since the morning.",
    question: 'What does the speaker mean?',
    options: [
      'They started on the bug this morning and are still working on it.',
      'They fixed the bug yesterday.',
      'They will start working on the bug tomorrow.',
    ],
    answer: 'They started on the bug this morning and are still working on it.',
  },

  // ── B2 ──
  { level: 'B2', question: 'By the time we arrived, the movie ___.', options: ['started', 'had started', 'has started'], answer: 'had started' },
  { level: 'B2', question: 'I wish I ___ harder at school.', options: ['had studied', 'studied', 'would study'], answer: 'had studied' },
  { level: 'B2', question: 'She suggested ___ a taxi to the airport.', options: ['to take', 'take', 'taking'], answer: 'taking' },
  { level: 'B2', question: 'If I had known about the traffic, I ___ earlier.', options: ['would leave', 'would have left', 'will leave'], answer: 'would have left' },
  { level: 'B2', question: 'The meeting was ___ because the manager was sick.', options: ['called up', 'called in', 'called off'], answer: 'called off' },
  {
    level: 'B2',
    audio: 'Had I known the deadline was so tight, I would have asked for help sooner.',
    question: 'What does the speaker regret?',
    options: [
      'Not asking for help earlier',
      'Asking for help too early',
      'Finishing the work before the deadline',
    ],
    answer: 'Not asking for help earlier',
  },
];

export function questionsFor(level) {
  return PLACEMENT_QUESTIONS.filter((q) => q.level === level);
}

/**
 * Turn per-stage correct counts into a result.
 *   scores: { A1: 5, A2: 3 }  (stages not reached are missing)
 * → { level: highest passed stage or null, startLevel: level to study next, scores }
 */
export function scorePlacement(scores) {
  let level = null;
  for (const stage of STAGES) {
    if ((scores[stage] ?? 0) >= PASS_PER_STAGE) level = stage;
    else break;
  }
  const i = level ? STAGES.indexOf(level) : -1;
  // Study the first stage you didn't pass (A1 if none passed; B2 if all passed)
  const startLevel = STAGES[Math.min(i + 1, STAGES.length - 1)];
  return { level, startLevel, scores };
}
