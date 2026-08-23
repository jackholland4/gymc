import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('gymc-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-[var(--c-bg-0)] text-[var(--c-txt-0)] font-body antialiased">
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
