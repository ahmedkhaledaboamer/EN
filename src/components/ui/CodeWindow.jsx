/**
 * Signature code window with the three Mac dots.
 * Renders `const <name> = { ...data };` with light syntax colors.
 */
function Value({ value }) {
  if (typeof value === 'number') {
    return <span className="text-sky-700 dark:text-sky-300">{value}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-700 dark:text-purple-300">{String(value)}</span>;
  }
  return <span className="text-emerald-700 dark:text-emerald-300">{`'${value}'`}</span>;
}

export default function CodeWindow({
  name = 'topic',
  data = {},
  fileName = 'today.js',
  className = '',
}) {
  const entries = Object.entries(data);

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-neutral-200/70 px-4 py-3 dark:border-white/10">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {fileName}
        </span>
      </div>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-brand-ink sm:text-sm dark:text-neutral-200">
        <code>
          <span className="text-purple-700 dark:text-purple-300">const</span>{' '}
          <span className="text-brand-gold dark:text-brand-yellow">{name}</span>
          {' = {\n'}
          {entries.map(([key, value], i) => (
            <span key={key}>
              {`  ${key}: `}
              <Value value={value} />
              {i < entries.length - 1 ? ',\n' : '\n'}
            </span>
          ))}
          {'};'}
        </code>
      </pre>
    </div>
  );
}
