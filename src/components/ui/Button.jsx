import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary:
    'bg-brand-yellow text-brand-ink shadow-yellow hover:bg-brand-yellow-dark hover:-translate-y-0.5',
  secondary:
    'bg-neutral-200/80 text-brand-ink hover:bg-neutral-300/80 ' +
    'dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  ghost: 'text-brand-ink hover:bg-neutral-200/60 dark:text-white dark:hover:bg-white/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm sm:text-base',
  lg: 'px-7 py-3.5 text-base',
};

/**
 * Pill button.
 * `to` → router Link, `href` → plain anchor (e.g. "#topics"), otherwise a <button>.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, type = 'button', className = '', children, ...props },
  ref,
) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    // eslint-disable-next-line react/button-has-type
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

export default Button;
