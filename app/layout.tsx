import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import PublicLayoutShell from '@/components/layout/PublicLayoutShell'
import { SITE } from '@/data/site'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Accesorios tecnológicos en ${SITE.city} con pago contra entrega`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_CO',
    type: 'website',
    title: `${SITE_NAME} — Accesorios tecnológicos en ${SITE.city}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png', // [OG_IMAGE_PENDIENTE] — replace with final 1200x630 image
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Accesorios tecnológicos en ${SITE.city}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Accesorios tecnológicos en ${SITE.city}`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  keywords: [
    'accesorios tecnológicos Montería',
    'audífonos Montería',
    'cables USB-C Montería',
    'smartwatch Montería',
    'pago contra entrega Montería',
    'domicilio gratis Montería',
    'tienda accesorios Córdoba',
    'MSN Products',
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${jakarta.variable} font-sans bg-background text-ink antialiased`}
      >
        <PublicLayoutShell>{children}</PublicLayoutShell>
      </body>
    </html>
  )
}
