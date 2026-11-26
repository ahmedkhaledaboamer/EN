import { motion } from 'framer-motion';

/** Fade + slide-up when the element scrolls into view (once). */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const Component = motion[as] ?? motion.div;
  return (
    <Component
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Component>
  );
}
