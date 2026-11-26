import { getLevel } from '../../data/levels';

/** Colored CEFR badge: "A2" or, with showName, "A2 · Elementary". */
export default function LevelBadge({ level, showName = false, className = '' }) {
  const l = getLevel(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${l.badge} ${className}`}
      title={`${l.id} · ${l.name}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${l.dot}`} />
      {showName ? `${l.id} · ${l.name}` : l.id}
      {!showName && <span className="sr-only"> level, {l.name}</span>}
    </span>
  );
}
