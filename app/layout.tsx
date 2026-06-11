import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import '@/styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GYMC — Gymnastics Yearly Monte Carlo',
  description: 'Cinematic gymnastics simulation and analytics suite.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#0a0a0a] text-[#f5f5f5] font-body antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
