import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ConvexClientProvider } from '@/providers/ConvexProvider'
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    'community manager',
    'graphiste freelance',
    'gestion réseaux sociaux',
    'création de contenu',
    'identité visuelle',
    'Instagram',
    'TikTok',
    'Twitch',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <ConvexClientProvider>
          <Header />
          <main className="min-h-screen pt-16 md:pt-20">{children}</main>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  )
}
