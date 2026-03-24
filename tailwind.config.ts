import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Light theme (public store) ──────────────────────────
        background: '#FFFFFF',
        surface: '#F5F5F7',
        'surface-raised': '#EBEBED',
        primary: '#1D1D1F',
        // ── Accent (unchanged) ──────────────────────────────────
        accent: '#0066FF',
        'accent-hover': '#0052CC',
        'accent-muted': 'rgba(0, 102, 255, 0.10)',
        // ── Borders & text (light) ───────────────────────────────
        border: 'rgba(0, 0, 0, 0.08)',
        'border-strong': 'rgba(0, 0, 0, 0.15)',
        muted: 'rgba(0, 0, 0, 0.5)',
        'muted-low': 'rgba(0, 0, 0, 0.35)',
        // ── Status ───────────────────────────────────────────────
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        whatsapp: '#25D366',
        nequi: '#8347AD',
      },
      fontFamily: {
        sans: ['var(--font-space)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':
          'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(0, 102, 255, 0.07), transparent)',
      },
    },
  },
  plugins: [],
}

export default config
