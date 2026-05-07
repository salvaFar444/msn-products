import Image from 'next/image'
import {
  Bluetooth,
  BatteryFull,
  Droplets,
  MicVocal,
  Smartphone,
  Package,
} from 'lucide-react'
import type { ShopifyImage } from '@/lib/shopify'

interface StorytellingSectionProps {
  images: ShopifyImage[]
  productTitle: string
}

const SPECS = [
  { icon: Bluetooth, label: 'Bluetooth 5.3' },
  {
    icon: BatteryFull,
    label: 'Batería 1000 mAh — 42 h de uso · 500 h en standby',
  },
  { icon: Droplets, label: 'Resistencia IP67 (lluvia y polvo)' },
  { icon: MicVocal, label: 'Reducción de ruido dual con DSP + CVC' },
  { icon: Smartphone, label: 'Conexión dual: dos teléfonos a la vez' },
  {
    icon: Package,
    label: 'Kit: 2 intercomunicadores + accesorios de montaje',
  },
] as const

/**
 * Storytelling: dolor del motociclista + imágenes de lifestyle/producto +
 * lista de especificaciones técnicas. Las imágenes vienen del producto
 * de Shopify (índices 1 y 2 de la galería), con fallback a otra imagen
 * disponible si Shopify aún no tiene suficientes.
 */
export default function StorytellingSection({
  images,
  productTitle,
}: StorytellingSectionProps) {
  // Toma las imágenes 2 y 3 (índices 1 y 2). Si no existen, repite la
  // primera para que el layout no se rompa en preview.
  const lifestyle1 = images[1] ?? images[0]
  const lifestyle2 = images[2] ?? images[1] ?? images[0]

  return (
    <section className="bg-surface px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2
          className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink-strong sm:text-4xl"
          style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}
        >
          Comunícate en la vía sin arriesgar tu vida.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-light sm:text-lg">
          Hablar con tu copiloto, escuchar el GPS o atender una llamada
          mientras manejas <strong className="text-ink-strong">no debería ser un riesgo</strong>.
          El JZAQ Y10 te conecta con el mundo sin soltar el manubrio: audio
          claro a 120 km/h, micrófono con cancelación de ruido y batería
          para todo el viaje.
        </p>

        {/* Imagen 1 — lifestyle */}
        {lifestyle1 && (
          <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-white">
            <Image
              src={lifestyle1.url}
              alt={lifestyle1.altText ?? `${productTitle} en uso`}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <h3
          className="mt-12 font-display text-2xl font-extrabold leading-tight text-ink-strong sm:text-3xl"
          style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2rem)' }}
        >
          Diseñado para el motociclista que no se detiene.
        </h3>
        <p className="mt-4 text-base leading-relaxed text-ink-light sm:text-lg">
          Con sus luces RGB, controles físicos sin necesidad de quitarte los
          guantes y un montaje que se adapta a la mayoría de cascos integrales,
          modulares y abiertos. Resistente al agua, al polvo y a las
          vibraciones de la carretera.
        </p>

        {/* Imagen 2 — detalle producto */}
        {lifestyle2 && (
          <div className="relative mt-10 aspect-square w-full overflow-hidden rounded-3xl border border-border bg-white sm:aspect-[5/4]">
            <Image
              src={lifestyle2.url}
              alt={lifestyle2.altText ?? `${productTitle} — detalle`}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Especificaciones técnicas */}
        <div className="mt-14 rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h3 className="font-display text-xl font-extrabold text-ink-strong sm:text-2xl">
            Especificaciones técnicas
          </h3>
          <ul className="mt-5 divide-y divide-border">
            {SPECS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-start gap-3 py-3 text-sm text-ink sm:text-base"
              >
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-ink-strong"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
