import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white',
    accent: 'bg-accent/20 text-accent border border-accent/30',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-danger/20 text-danger border border-danger/30',
    muted: 'bg-white/5 text-muted',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
