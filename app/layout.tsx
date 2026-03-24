import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import PublicLayoutShell from '@/components/layout/PublicLayoutShell'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Tech al mejor precio en Colombia`,
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
    title: `${SITE_NAME} — Tech al mejor precio en Colombia`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  keywords: [
    'AirPods Colombia',
    'Apple Watch Colombia',
    'accesorios Apple',
    'tecnología Colombia',
    'AirPods baratos',
    'MSN Products',
  ],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans bg-background text-primary antialiased`}>
        <PublicLayoutShell>{children}</PublicLayoutShell>
      </body>
    </html>
  )
}
