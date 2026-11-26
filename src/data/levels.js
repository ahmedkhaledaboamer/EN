// CEFR levels used everywhere (filters, badges, grouping, validation).
// Class strings are written out in full so Tailwind can find them.

export const LEVELS = [
  {
    id: 'A1',
    name: 'Beginner',
    nameAr: 'مبتدئ',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  {
    id: 'A2',
    name: 'Elementary',
    nameAr: 'أساسي',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  {
    id: 'B1',
    name: 'Intermediate',
    nameAr: 'متوسط',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  {
    id: 'B2',
    name: 'Upper-Intermediate',
    nameAr: 'فوق المتوسط',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  {
    id: 'C1',
    name: 'Advanced',
    nameAr: 'متقدم',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  {
    id: 'C2',
    name: 'Proficient',
    nameAr: 'متمكّن',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-400/15 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
];

export const LEVEL_IDS = LEVELS.map((l) => l.id);

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
