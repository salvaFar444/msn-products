import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button — 4 variants following the new black/white + glassmorphism palette.
 *
 * - solid-black  → default CTA (Agregar al carrito, Generar orden, Guardar)
 * - solid-white  → secondary CTA (Volver, Cancelar)
 * - glass-light  → CTAs over light/image backgrounds (Hero secondary, chips)
 * - glass-dark   → CTAs over dark backgrounds (admin dark, sticky footers)
 *
 * Legacy variants ("primary", "secondary", "ghost", "whatsapp", "danger") are
 * kept as aliases so existing call-sites don't break while the migration
 * lands. "primary" now means solid-black, "secondary" means solid-white.
 */

type Variant =
  | 'solid-black'
  | 'solid-white'
  | 'glass-light'
  | 'glass-dark'
  | 'whatsapp'
  | 'danger'
  // Legacy aliases
  | 'primary'
  | 'secondary'
  | 'ghost'

type Shape = 'pill' | 'circle' | 'rounded'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  shape?: Shape
  loading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  'solid-black':
    'bg-primary text-white border border-primary hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]',
  'solid-white':
    'bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white hover:-translate-y-0.5',
  'glass-light':
    'bg-white/60 text-ink border border-white/40 backdrop-blur-glass shadow-glass hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-glass-hover',
  'glass-dark':
    'bg-black/70 text-white border border-white/25 backdrop-blur-glass shadow-glass hover:bg-black/90 hover:-translate-y-0.5',
  whatsapp:
    'bg-whatsapp hover:bg-[#1db954] text-white shadow-lg shadow-whatsapp/20 border border-whatsapp',
  danger:
    'bg-white text-danger border border-danger/30 hover:bg-danger/5 hover:border-danger',
  // Legacy aliases collapse to the new system
  primary:
    'bg-primary text-white border border-primary hover:bg-black hover:-translate-y-0.5',
  secondary:
    'bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-ink border border-ink/30 hover:bg-ink hover:text-white',
}

const SHAPE_CLASSES: Record<Shape, string> = {
  pill: 'rounded-full',
  circle: 'rounded-full aspect-square',
  rounded: 'rounded-xl',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
}

const SIZE_CIRCLE_CLASSES: Record<Size, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-sm',
  lg: 'h-13 w-13 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'solid-black',
      size = 'md',
      shape = 'pill',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-y-0'

    const sizeClass =
      shape === 'circle' ? SIZE_CIRCLE_CLASSES[size] : SIZE_CLASSES[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          VARIANT_CLASSES[variant],
          SHAPE_CLASSES[shape],
          sizeClass,
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
