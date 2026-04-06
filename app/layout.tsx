import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '600', '700', '900'],
  variable: '--font-barlow',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-barlow-condensed',
})

export const metadata: Metadata = {
  title: 'Berizz Auto — Redéfinir la route',
  description: 'Rebuilt from the road up. Engineered for pure sensation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${barlow.variable} ${barlowCondensed.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
