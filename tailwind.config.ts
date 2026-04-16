import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Clean light palette (public store) ─────────────────────
        background: '#FFFFFF',
        surface: '#F7F7F5',
        'surface-elevated': '#FFFFFF',

        // ── Text ────────────────────────────────────────────────────
        ink: '#0A0A0A',
        'ink-strong': '#000000',
        'ink-light': '#525252',
        'ink-muted': '#8A8A8A',

        // ── Brand ──────────────────────────────────────────────────
        primary: '#0A0A0A',
        accent: '#E87A00',
        'accent-hover': '#C96700',
        'accent-soft': '#FFF4E6',

        // ── Status ─────────────────────────────────────────────────
        success: '#16A34A',
        warning: '#CA8A04',
        danger: '#DC2626',
        whatsapp: '#25D366',
        'whatsapp-hover': '#1DA851',

        // ── Borders ────────────────────────────────────────────────
        border: '#E5E5E5',
        'border-strong': '#0A0A0A',
        muted: '#8A8A8A',
      },
      fontFamily: {
        sans: [
          'var(--font-jakarta)',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        serif: [
          'var(--font-fraunces)',
          'Georgia',
          'Cambria',
          'serif',
        ],
        mono: ['ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08)',
        elevated: '0 12px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
        marquee: 'marquee 35s linear infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        reveal: 'reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'cart-pop': 'cartPop 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        pulseSlow: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(37,211,102,0.45)',
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 14px rgba(37,211,102,0)',
          },
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        cartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
