import { Volume2 } from 'lucide-react';
import { useSpeechContext } from '../speech/SpeechContext';

const ARABIC_RE = /[؀-ۿ]/;

/** Accepts { columns, rows } or a plain array of rows (first row = header). */
export function normalizeTable(table) {
  if (!table) return null;
  if (Array.isArray(table)) {
    const [columns, ...rows] = table;
    return columns && rows.length ? { columns, rows } : null;
  }
  return table.columns && table.rows?.length ? table : null;
}

/** Reference table (e.g. I · my · mine). English cells are tappable to hear them. */
export default function EssentialTable({ table, caption }) {
  const { speak, speakingId, supported } = useSpeechContext();
  const data = normalizeTable(table);
  if (!data) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-brand-yellow/25 dark:bg-brand-yellow/10">
              {data.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  dir={ARABIC_RE.test(col) ? 'rtl' : undefined}
                  className="px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-brand-yellow"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, r) => (
              <tr key={r} className="border-t border-neutral-200/70 dark:border-white/10">
                {row.map((cell, c) => {
                  const arabic = ARABIC_RE.test(cell);
                  const id = `table-${r}-${c}`;
                  return (
                    <td key={c} className="px-2 py-1.5">
                      {arabic || !supported || !cell ? (
                        <span
                          dir={arabic ? 'rtl' : undefined}
                          lang={arabic ? 'ar' : undefined}
                          className="block px-2 py-1.5 text-neutral-600 dark:text-neutral-300"
                        >
                          {cell || '—'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => speak(cell, { id })}
                          aria-label={`Listen: ${cell}`}
                          className={`group inline-flex items-center gap-2 rounded-xl px-2 py-1.5 font-semibold text-brand-ink transition-colors hover:bg-brand-yellow/25 dark:text-white ${
                            speakingId === id ? 'bg-brand-yellow/40' : ''
                          }`}
                        >
                          {cell}
                          <Volume2 size={14} className="opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
