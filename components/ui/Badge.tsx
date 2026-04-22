import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'solid' | 'glass' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

/**
 * Badge — short inline chip. In the new palette there's no orange accent,
 * so "solid" (black pill) replaces what used to be the orange accent variant.
 * "glass" renders a light glassmorphism pill for use on images/hero.
 */
export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-ink/5 text-ink border border-ink/10',
    solid: 'bg-ink text-white border border-ink',
    glass:
      'bg-white/60 text-ink border border-white/50 backdrop-blur-glass shadow-glass',
    success: 'bg-success/10 text-success border border-success/30',
    warning: 'bg-warning/10 text-warning border border-warning/30',
    danger: 'bg-danger/10 text-danger border border-danger/30',
    muted: 'bg-ink/5 text-ink-muted border border-ink/10',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
