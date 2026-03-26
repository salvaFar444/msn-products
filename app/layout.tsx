import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import PublicLayoutShell from '@/components/layout/PublicLayoutShell'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Accesorios Apple Premium en Colombia`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Accesorios Apple en Colombia`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Accesorios Apple Premium en Colombia`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  keywords: [
    'AirPods Colombia',
    'Apple Watch Colombia',
    'accesorios Apple originales',
    'tecnología Colombia',
    'AirPods precio Colombia',
    'MSN Products',
    'cable USB-C Apple Colombia',
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans bg-background text-primary antialiased`}
      >
        <PublicLayoutShell>{children}</PublicLayoutShell>
      </body>
    </html>
  )
}
