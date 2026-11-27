/** Local date as YYYY-MM-DD (not UTC, so "today" matches the user's clock). */
export function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

/** Date key `days` days after `fromKey` (YYYY-MM-DD). */
export function addDays(fromKey, days) {
  const [y, m, d] = fromKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, d + days));
}
