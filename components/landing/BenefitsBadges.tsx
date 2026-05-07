import { Bluetooth, BatteryCharging, Droplets, MicVocal } from 'lucide-react'

const BENEFITS = [
  {
    icon: Bluetooth,
    title: 'Bluetooth 5.3',
    desc: 'Conexión instantánea sin cortes',
  },
  {
    icon: BatteryCharging,
    title: '42 horas',
    desc: 'Para viajes largos sin recargar',
  },
  {
    icon: Droplets,
    title: 'IP67',
    desc: 'Resistente a lluvia y polvo',
  },
  {
    icon: MicVocal,
    title: 'Cancelación de ruido',
    desc: 'Llamadas nítidas a alta velocidad',
  },
] as const

/**
 * Grid 2x2 en móvil con 4 beneficios principales del producto.
 * Va justo después del CTA principal — clave para reducir bounce.
 */
export default function BenefitsBadges() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:border-ink-strong sm:p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-strong text-white">
                <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-extrabold leading-tight text-ink-strong sm:text-base">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-snug text-ink-light sm:text-sm">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
