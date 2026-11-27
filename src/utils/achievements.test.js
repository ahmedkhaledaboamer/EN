import { describe, expect, it } from 'vitest';
import { activityLevel, buildCalendar, computeBadges, wordsPerWeek } from './achievements';

const base = {
  wordsLearned: 0,
  topicsCompleted: 0,
  essentialsCompleted: 0,
  bestStreak: 0,
  mastered: 0,
  placementTaken: false,
  activeDays: 0,
  soundsPracticed: 0,
  levels: { A1: { done: 0, total: 3 }, B2: { done: 0, total: 0 } },
};

describe('computeBadges', () => {
  it('locks everything at the start and adds one badge per level with content', () => {
    const badges = computeBadges(base);
    expect(badges.every((b) => !b.unlocked)).toBe(true);
    expect(badges.some((b) => b.id === 'level-A1')).toBe(true);
    expect(badges.some((b) => b.id === 'level-B2')).toBe(false); // no B2 content → no badge
  });

  it('unlocks badges at their targets and caps progress', () => {
    const badges = computeBadges({ ...base, wordsLearned: 120, bestStreak: 7, levels: { A1: { done: 3, total: 3 } } });
    const byId = Object.fromEntries(badges.map((b) => [b.id, b]));
    expect(byId['words-100'].unlocked).toBe(true);
    expect(byId['words-250']).toMatchObject({ unlocked: false, value: 120, target: 250 });
    expect(byId['streak-7'].unlocked).toBe(true);
    expect(byId['level-A1'].unlocked).toBe(true);
    expect(byId['first-word'].value).toBe(1); // capped at the target
  });
});

describe('activity calendar', () => {
  it('maps scores to 5 shades', () => {
    expect([0, 1, 4, 8, 20].map(activityLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  it('builds full weeks ending on the Saturday after today', () => {
    // 2026-11-27 is a Friday
    const cols = buildCalendar({ '2026-11-27': { words: 3, sessions: 2 } }, 4, '2026-11-27');
    expect(cols).toHaveLength(4);
    cols.forEach((c) => expect(c).toHaveLength(7));
    const last = cols[3];
    expect(last[0].date).toBe('2026-11-22'); // Sunday
    expect(last[5]).toMatchObject({ date: '2026-11-27', score: 5, level: 2, future: false });
    expect(last[6]).toMatchObject({ date: '2026-11-28', future: true });
  });

  it('sums words per week', () => {
    const log = { '2026-11-23': { words: 4, sessions: 1 }, '2026-11-27': { words: 6, sessions: 3 }, '2026-11-16': { words: 2, sessions: 1 } };
    const weeks = wordsPerWeek(log, 3, '2026-11-27');
    expect(weeks.map((w) => w.words)).toEqual([0, 2, 10]);
  });
});
