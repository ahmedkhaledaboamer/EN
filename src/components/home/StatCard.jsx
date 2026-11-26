import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, iconClass = '', label, value, suffix, hint }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="glass-card flex items-center gap-4 p-5 transition-shadow hover:shadow-lift sm:p-6"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        aria-hidden="true"
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="font-display text-3xl font-extrabold tracking-tightest text-brand-ink dark:text-white">
          {value}
          {suffix && (
            <span className="ml-1.5 text-base font-semibold tracking-normal text-neutral-500 dark:text-neutral-400">
              {suffix}
            </span>
          )}
        </p>
        {hint && <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      </div>
    </motion.div>
  );
}
