import { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Accessible sticky tab list (arrow keys, Home/End) with an animated yellow pill.
 * tabs: [{ id, label, icon }]. Panels must use id="panel-<id>" and aria-labelledby="tab-<id>".
 */
export default function Tabs({ tabs, active, onChange, label = 'Sections', pillId = 'tabs-pill' }) {
  const refs = useRef({});

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next.id);
      refs.current[next.id]?.focus();
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-md sm:top-20 sm:mx-0 sm:px-0">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="glass-card isolate flex gap-1 overflow-x-auto !rounded-full p-1.5 [scrollbar-width:none]"
      >
        {tabs.map(({ id, label: tabLabel, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              ref={(el) => (refs.current[id] = el)}
              id={`tab-${id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? 'text-brand-ink'
                  : 'text-neutral-500 hover:text-brand-ink dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 -z-10 rounded-full bg-brand-yellow shadow-yellow"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {Icon && <Icon size={16} aria-hidden="true" />}
              {tabLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
