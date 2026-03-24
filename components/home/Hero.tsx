import { WHATSAPP_URL } from '@/lib/constants'

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-hero"
        aria-hidden="true"
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 text-center sm:px-6 sm:pt-9 lg:px-8">
        {/* Eyebrow */}
        <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-4 py-1.5 text-xs font-medium text-accent opacity-0 [animation-delay:0ms] [animation-fill-mode:forwards] sm:mb-6 sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Tecnología que se siente premium
        </p>

        {/* Headline */}
        <h1 className="animate-fade-up mb-4 text-4xl font-bold leading-[1.1] tracking-tight opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] sm:mb-6 sm:text-6xl lg:text-8xl">
          <span className="text-primary">MSN</span>
          <br />
          <span className="text-gradient-accent">Products</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-up mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] sm:mb-10 sm:text-xl">
          Los mejores accesorios Apple en Colombia,{' '}
          <span className="text-primary font-semibold">al precio que mereces</span>.
          <br className="hidden sm:block" />
          Envío rápido · Garantía incluida · Atención personalizada.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up flex flex-col items-center gap-3 opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards] sm:flex-row sm:justify-center">
          <a
            href="#products"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 active:scale-[0.97] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Ver productos
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-surface-raised hover:border-border-strong active:scale-[0.97] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-whatsapp"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hablar por WhatsApp
          </a>
        </div>

        {/* Trust indicators */}
        <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards] sm:mt-12 sm:gap-6">
          {[
            { icon: '⚡', label: 'Envío rápido' },
            { icon: '🛡️', label: 'Garantía incluida' },
            { icon: '💳', label: 'Pago seguro' },
            { icon: '📱', label: 'Soporte 24/7' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <span>{icon}</span>
              <span className="text-primary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 text-muted"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </section>
  )
}
