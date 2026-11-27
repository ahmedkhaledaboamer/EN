import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandBackground from './BrandBackground';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import SettingsSync from './SettingsSync';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollToTop />
      <SettingsSync />
      <BrandBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-yellow focus:px-4 focus:py-2 focus:text-brand-ink"
      >
        Skip to content
      </a>
      <Navbar />

      {/* Keyed by path so every page fades + slides up on navigation */}
      <motion.main
        id="main"
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6"
      >
        <Outlet />
      </motion.main>

      <Footer />
    </div>
  );
}
