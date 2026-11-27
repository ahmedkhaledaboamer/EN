// Badges, computed from progress (pure functions, easy to test).
import { LEVELS } from '../data/levels';
import { addDays, todayKey } from './date';

/**
 * stats: {
 *   wordsLearned, topicsCompleted, essentialsCompleted, bestStreak, mastered,
 *   placementTaken, activeDays, soundsPracticed, levels: { A1: { done, total }, ... }
 * }
 */
export function computeBadges(stats) {
  const badges = [
    { id: 'first-word', emoji: '🌱', title: 'First word', titleAr: 'أول كلمة', value: stats.wordsLearned, target: 1 },
    { id: 'words-50', emoji: '📗', title: '50 words', titleAr: '٥٠ كلمة', value: stats.wordsLearned, target: 50 },
    { id: 'words-100', emoji: '📘', title: '100 words', titleAr: '١٠٠ كلمة', value: stats.wordsLearned, target: 100 },
    { id: 'words-250', emoji: '📙', title: '250 words', titleAr: '٢٥٠ كلمة', value: stats.wordsLearned, target: 250 },
    { id: 'words-500', emoji: '🏅', title: '500 words', titleAr: '٥٠٠ كلمة', value: stats.wordsLearned, target: 500 },
    { id: 'streak-3', emoji: '🔥', title: '3-day streak', titleAr: '٣ أيام ورا بعض', value: stats.bestStreak, target: 3 },
    { id: 'streak-7', emoji: '⚡', title: '7-day streak', titleAr: 'أسبوع ورا بعض', value: stats.bestStreak, target: 7 },
    { id: 'streak-30', emoji: '🏆', title: '30-day streak', titleAr: 'شهر ورا بعض', value: stats.bestStreak, target: 30 },
    { id: 'first-topic', emoji: '✅', title: 'First topic', titleAr: 'أول موضوع', value: stats.topicsCompleted, target: 1 },
    { id: 'topics-10', emoji: '🗺️', title: '10 topics', titleAr: '١٠ مواضيع', value: stats.topicsCompleted, target: 10 },
    { id: 'essentials-5', emoji: '🧱', title: '5 essentials', titleAr: '٥ أساسيات', value: stats.essentialsCompleted, target: 5 },
    { id: 'placement', emoji: '🎯', title: 'Know your level', titleAr: 'عرفت مستواك', value: stats.placementTaken ? 1 : 0, target: 1 },
    { id: 'sounds-3', emoji: '👂', title: 'Good ear', titleAr: 'ودن حلوة', value: stats.soundsPracticed, target: 3 },
    { id: 'mastered-20', emoji: '🧠', title: '20 mastered', titleAr: '٢٠ كلمة متقنة', value: stats.mastered, target: 20 },
    { id: 'active-30', emoji: '📅', title: '30 study days', titleAr: '٣٠ يوم مذاكرة', value: stats.activeDays, target: 30 },
  ];

  // One badge per level that has content
  LEVELS.forEach((l) => {
    const lv = stats.levels?.[l.id];
    if (lv?.total) {
      badges.push({
        id: `level-${l.id}`,
        emoji: '🎓',
        title: `${l.id} completed`,
        titleAr: `خلّصت ${l.id}`,
        value: lv.done,
        target: lv.total,
      });
    }
  });

  return badges.map((b) => ({ ...b, unlocked: b.value >= b.target, value: Math.min(b.value, b.target) }));
}

/** Activity score for a day (used for calendar shading). */
export const dayScore = (entry) => (entry ? (entry.words ?? 0) + (entry.sessions ?? 0) : 0);

/** 0 = no activity, 1–4 = increasing activity. */
export function activityLevel(score) {
  if (!score) return 0;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 10) return 3;
  return 4;
}

/**
 * Calendar grid for the last `weeks` weeks, ending today.
 * Returns columns (weeks) of 7 cells (Sun–Sat): { date, score, level, future }.
 */
export function buildCalendar(log, weeks = 18, today = todayKey()) {
  const [y, m, d] = today.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0 = Sunday
  // Last column = the current week (Sunday → Saturday), so it ends (6 - dow) days after today
  const start = addDays(today, 6 - dow - (weeks * 7 - 1));
  const columns = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, w * 7 + i);
      const score = dayScore(log[date]);
      col.push({ date, score, level: activityLevel(score), future: date > today, words: log[date]?.words ?? 0 });
    }
    columns.push(col);
  }
  return columns;
}

/** Words learned per week for the last `weeks` weeks (oldest first). Weeks start on Sunday. */
export function wordsPerWeek(log, weeks = 10, today = todayKey()) {
  return buildCalendar(log, weeks, today).map((col) => ({
    start: col[0].date,
    words: col.reduce((sum, c) => sum + (c.future ? 0 : c.words), 0),
  }));
}
