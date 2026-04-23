import Link from 'next/link'
import { Instagram, MapPin, ShieldCheck, Truck, Wallet } from 'lucide-react'
import { SITE, WHATSAPP_URL } from '@/data/site'

const WhatsAppGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Footer() {
  const year = new Date().getFullYear()
  const categories = [
    'Audio',
    'Relojes Inteligentes',
    'Cables',
    'Cargadores',
    'Gaming',
    'Hogar Tech',
    'Cuidado Personal',
  ]
  const info = [
    { icon: <Truck className="h-4 w-4" />, label: `Domicilio gratis en ${SITE.city}` },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: `Garantía de ${SITE.warrantyMonths} meses`,
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      label: `${SITE.paymentMethod} en ${SITE.city}`,
    },
  ]

  return (
    <footer className="bg-[color:var(--bg-inverted)] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold tracking-tight text-white">
                MSN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                Products
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
              Accesorios tecnológicos en {SITE.city}, {SITE.department}.
              Domicilio gratis y pago contra entrega.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4 text-white" aria-hidden="true" />
              <span>
                {SITE.city}, {SITE.department} — {SITE.country}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp hover:bg-whatsapp-hover px-5 py-3 text-sm font-bold text-white transition-colors"
              >
                <WhatsAppGlyph />
                {SITE.whatsappDisplay}
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:border-white hover:text-white"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />@
                {SITE.instagram}
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Tienda
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href="#products"
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Información
            </h3>
            <ul className="space-y-3">
              {info.map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-white/70"
                >
                  <span className="text-white">{icon}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs font-medium text-white/50">
            &copy; {year} {SITE.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/65">
            <Truck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            <span>Domicilio gratis en {SITE.city}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
