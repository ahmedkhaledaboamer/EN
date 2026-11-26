/** Small intro text preceded by a short yellow line: "— Hi, I'm learning English" */
export default function IntroLine({ children, className = '' }) {
  return (
    <p className={`flex items-center gap-3 text-sm font-medium sm:text-base ${className}`}>
      <span aria-hidden="true" className="h-[3px] w-8 rounded-full bg-brand-yellow" />
      <span className="text-neutral-600 dark:text-neutral-300">{children}</span>
    </p>
  );
}
