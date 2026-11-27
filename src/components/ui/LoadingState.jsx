/** Skeleton cards shown while a page or lesson file is loading. */
export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="grid gap-4 py-10 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label={label}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card h-56 animate-pulse" />
      ))}
    </div>
  );
}
