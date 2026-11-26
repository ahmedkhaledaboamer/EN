import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { useTodayTopic } from '../../hooks/useTodayTopic';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/topics', label: 'Topics' },
  { to: '/essentials', label: 'Essentials' },
  { to: '/saved', label: 'Saved' },
];

function DesktopLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'text-brand-ink dark:text-white'
            : 'text-neutral-500 hover:text-brand-ink dark:text-neutral-400 dark:hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 -z-10 rounded-full bg-neutral-200/80 dark:bg-white/10"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { topic: todayTopic } = useTodayTopic();
  const startHref = todayTopic ? `/topics/${todayTopic.slug}` : '/topics';
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-transparent backdrop-blur-md supports-[backdrop-filter]:bg-brand-bg/60 dark:supports-[backdrop-filter]:bg-night-bg/60">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6"
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-[11px] font-extrabold uppercase tracking-logo text-brand-gold sm:text-xs dark:text-brand-yellow"
          aria-label="English by Situations — home"
        >
          English <span className="text-brand-ink/40 dark:text-white/40">by</span> Situations
        </Link>

        {/* Center links (desktop) */}
        <div className="isolate hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <DesktopLink key={link.to} {...link} />
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <Button to={startHref} size="sm" className="hidden sm:inline-flex">
            Start Learning
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-neutral-200/70 md:hidden dark:text-white dark:hover:bg-white/10"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 md:hidden"
          >
            <div className="glass-card flex flex-col gap-1 p-3">
              {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-neutral-200/80 text-brand-ink dark:bg-white/10 dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Button to={startHref} className="mt-2 w-full">
                Start Learning <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
