import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0B10',
        surface: '#12141C',
        border: 'rgba(255,255,255,0.08)',
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F1EEFE',
          100: '#E3DDFD',
          300: '#B4A5F9',
          500: '#6C5CE7',
          600: '#5642D9',
          700: '#4331B0',
        },
        accent: {
          DEFAULT: '#00E5C7',
          muted: '#0FA88E',
        },
        warn: '#F5A623',
        danger: '#FF5C7A',
        success: '#3DDC97',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at 20% -10%, rgba(108,92,231,0.25), transparent 45%), radial-gradient(circle at 90% 10%, rgba(0,229,199,0.15), transparent 40%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(108,92,231,0.4), 0 0 24px rgba(108,92,231,0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
