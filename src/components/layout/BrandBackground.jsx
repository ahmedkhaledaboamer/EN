/**
 * Fixed decorative background: warm beige + subtle grid + soft blurred gradients
 * (light purple top-left, faint warm yellow on the right).
 */
export default function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-brand-bg transition-colors duration-500 dark:bg-night-bg" />
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_85%)]" />

      {/* Purple glow, top-left */}
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-purple/50 blur-[120px] dark:bg-violet-700/35" />
      {/* Warm yellow glow, right */}
      <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-yellow/20 blur-[130px] dark:bg-brand-yellow/10" />
      {/* Very faint purple at the bottom for depth in dark mode */}
      <div className="absolute bottom-0 left-1/3 hidden h-72 w-[40rem] rounded-full bg-indigo-800/20 blur-[140px] dark:block" />
    </div>
  );
}
