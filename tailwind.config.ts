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
        // ── Dark luxury palette ─────────────────────────────────────
        background: '#0A0A0A',
        surface: '#111111',
        'surface-raised': '#1A1A1A',
        primary: '#FFFFFF',
        // ── Accent ──────────────────────────────────────────────────
        accent: '#FFFFFF',
        'accent-hover': 'rgba(255,255,255,0.88)',
        'accent-muted': 'rgba(255,255,255,0.06)',
        // ── Borders & text ──────────────────────────────────────────
        border: 'rgba(255,255,255,0.08)',
        'border-strong': 'rgba(255,255,255,0.18)',
        muted: '#888888',
        'muted-low': 'rgba(255,255,255,0.30)',
        // ── Gold premium ────────────────────────────────────────────
        gold: '#C9A84C',
        'gold-muted': 'rgba(201,168,76,0.12)',
        // ── Status ──────────────────────────────────────────────────
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#FF3B30',
        whatsapp: '#25D366',
        nequi: '#8347AD',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'Cambria', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
        marquee: 'marquee 30s linear infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
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
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37,211,102,0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 12px rgba(37,211,102,0)' },
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(201,168,76,0.15), transparent)',
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(201,168,76,0.08), transparent)',
      },
    },
  },
  plugins: [],
}

export default config
