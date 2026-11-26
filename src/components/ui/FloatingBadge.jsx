/** Rounded pill that floats gently around a hero element. Position it with `className`. */
export default function FloatingBadge({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`glass-card absolute flex animate-float items-center gap-2 !rounded-full px-4 py-2 text-sm
        font-semibold text-brand-ink dark:text-white ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
