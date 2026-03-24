import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

    const variants = {
      primary:
        'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20',
      secondary:
        'bg-surface-raised hover:bg-[#2e2e2e] text-white border border-border hover:border-border-strong',
      ghost:
        'bg-transparent hover:bg-surface text-white border border-border-strong hover:border-white/30',
      danger:
        'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40',
      whatsapp:
        'bg-whatsapp hover:bg-[#1db954] text-white shadow-lg shadow-whatsapp/20',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg',
      md: 'h-11 px-5 text-sm',
      lg: 'h-13 px-8 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
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
