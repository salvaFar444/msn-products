import { ShieldCheck, RotateCcw, Lock } from 'lucide-react'

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Garantía 3 meses',
    desc: 'Respaldo directo con MSN Products ante cualquier defecto de fábrica.',
  },
  {
    icon: RotateCcw,
    title: 'Devolución sin preguntas',
    desc: 'Si no estás conforme, devuélvelo en los primeros 7 días.',
  },
  {
    icon: Lock,
    title: 'Pago 100% seguro',
    desc: 'Procesado por Shopify con cifrado bancario. Tus datos nunca pasan por nosotros.',
  },
] as const

export default function GuaranteeSection() {
  return (
    <section className="bg-ink-strong px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="font-display text-3xl font-extrabold leading-tight sm:text-4xl"
          style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}
        >
          Compra tranquilo, riega esa moto.
        </h2>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Tres promesas que respaldan cada pedido.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-strong">
                <Icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-extrabold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
