/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8F6F2',
          yellow: '#FDC52B',
          'yellow-dark': '#E8B019',
          gold: '#9A6700',
          ink: '#111111',
          purple: '#C4B5FD',
        },
        night: {
          bg: '#0E0C1D',
          surface: '#17142B',
          border: '#2A2547',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Cairo', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        arabic: ['Cairo', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        logo: '0.28em',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(17, 17, 17, 0.12)',
        lift: '0 22px 45px -18px rgba(17, 17, 17, 0.22)',
        yellow: '0 8px 22px -8px rgba(253, 197, 43, 0.75)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
